// app/api/query/route.ts - TypeScript error fixed

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseFiles } from '@/lib/parsers';
import * as fs from 'fs';
import * as path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 1500,
  }
});

// Enhanced caching with pre-parsed data
const cityDataCache = new Map<string, { data: any; timestamp: number; summary: string }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// Pre-parse and cache city data on startup
async function preloadCityData(city: string) {
  const cacheKey = `city_${city}`;
  const cached = cityDataCache.get(cacheKey);
  
  // Return cached if still valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached;
  }

  console.log(`Pre-loading data for ${city}...`);
  
  const cityPath = path.join(process.cwd(), 'data', city);
  let allFiles: string[];
  
  try {
    allFiles = await fs.promises.readdir(cityPath);
  } catch (error) {
    throw new Error(`No data directory found for city: ${city}`);
  }

  // Priority order: CSV first (fastest), then smaller files
  const filePriority = [
    ...allFiles.filter(f => f.endsWith('.csv')),
    ...allFiles.filter(f => f.endsWith('.json')),
    ...allFiles.filter(f => f.endsWith('.txt')),
    ...allFiles.filter(f => f.endsWith('.docx') || f.endsWith('.xlsx')),
  ];

  const filePaths = filePriority.slice(0, 8).map(file => path.join(cityPath, file));
  const fileData = await parseFiles(filePaths);

  // Create a summary for faster AI processing
  let summary = `${city.toUpperCase()} PROJECT DATA SUMMARY:\n\n`;
  
  for (const [filename, content] of Object.entries(fileData)) {
    summary += `=== ${filename} ===\n`;
    
    // Type-safe content handling
    if (content && typeof content === 'object') {
      const contentObj = content as any;
      if (contentObj.content) {
        // Word document - take first 300 chars
        summary += contentObj.content.substring(0, 300) + '...\n';
      } else {
        // Excel/JSON - stringify but limit
        const jsonStr = JSON.stringify(content, null, 1);
        summary += jsonStr.substring(0, 400) + '...\n';
      }
    } else if (typeof content === 'string') {
      // CSV/text - take first 500 chars
      summary += content.substring(0, 500) + '...\n';
    } else {
      summary += JSON.stringify(content, null, 1).substring(0, 400) + '...\n';
    }
    summary += '\n';
  }

  const cacheData = {
    data: fileData,
    timestamp: Date.now(),
    summary: summary
  };

  cityDataCache.set(cacheKey, cacheData);
  console.log(`Cached ${Object.keys(fileData).length} files for ${city}`);
  
  return cacheData;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { query, city } = await request.json();

    if (!query || !city) {
      return NextResponse.json(
        { error: 'Query and city are required' }, 
        { status: 400 }
      );
    }

    // Use pre-loaded cache for instant response
    const cityData = await preloadCityData(city);
    
    // Smart query routing - use summary for faster processing
    const isDetailedQuery = query.toLowerCase().includes('detailed') || 
                           query.toLowerCase().includes('comprehensive') ||
                           query.toLowerCase().includes('full');

    let promptData;
    if (isDetailedQuery) {
      // Full data for detailed queries - with proper type handling
      promptData = Object.entries(cityData.data).map(([filename, content]) => {
        if (content && typeof content === 'object') {
          const contentObj = content as any;
          if (contentObj.content) {
            return `${filename}: ${contentObj.content}`;
          } else {
            return `${filename}: ${JSON.stringify(content, null, 1)}`;
          }
        } else if (typeof content === 'string') {
          return `${filename}: ${content}`;
        } else {
          return `${filename}: ${JSON.stringify(content, null, 1)}`;
        }
      }).join('\n\n');
    } else {
      // Use summary for faster responses
      promptData = cityData.summary;
    }

    const prompt = `You are a real estate AI assistant for the DMM "Partners Not Paychecks" model.

QUERY: "${query}"
CITY: ${city}

DATA:
${promptData}

INSTRUCTIONS:
- Provide a direct, focused answer based on the available data
- Do NOT include file citations or source references in your response
- Present information naturally without citing specific documents
- Keep response concise but informative and professional
- Focus on the actual project details and insights
- If you need more detail, ask for a "detailed" or "comprehensive" query

Answer:`;

    console.log(`Processing ${city} query with ${isDetailedQuery ? 'full' : 'summary'} data`);

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    const processingTime = Date.now() - startTime;
    console.log(`Response time: ${processingTime}ms`);

    return NextResponse.json({
      answer: aiResponse,
      sources: Object.keys(cityData.data),
      conversationId: `session_${Date.now()}`,
      confidence: isDetailedQuery ? 0.9 : 0.8,
      processingTime,
      dataType: isDetailedQuery ? 'full' : 'summary'
    });

  } catch (error) {
    console.error('Query processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Preload both cities on server start
setTimeout(() => {
  preloadCityData('miami').catch(console.error);
  preloadCityData('tonawanda').catch(console.error);
}, 1000);