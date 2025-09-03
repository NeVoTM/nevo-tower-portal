import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FileContent, QueryResult } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function queryWithAI(
  query: string, 
  fileContents: FileContent[]
): Promise<QueryResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Find most relevant files for the query
  const relevantFiles = findRelevantFiles(query, fileContents);
  
  // Build context from relevant files
  const context = relevantFiles.map(file => 
    `FILE: ${file.filename}\nTYPE: ${file.type}\nCONTENT:\n${file.content.substring(0, 3000)}...\n\n`
  ).join('');
  
  const prompt = `You are an AI assistant analyzing documents for development projects. 
Answer the user's question based on the provided file contents.

AVAILABLE FILES:
${context}

USER QUESTION: ${query}

Provide a comprehensive answer based on the file contents. If you find specific numbers, costs, or data, cite them precisely. If information spans multiple files, synthesize it into a coherent response.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return {
    answer: text,
    sources: relevantFiles.map(f => f.filename),
    confidence: 0.9,
    relatedFiles: relevantFiles.map(f => f.filename)
  };
}

function findRelevantFiles(query: string, files: FileContent[]): FileContent[] {
  const queryLower = query.toLowerCase();
  
  // If query specifically asks about images/PNG files, return all images
  if (queryLower.includes('png') || queryLower.includes('image') || 
      queryLower.includes('picture') || queryLower.includes('photo')) {
    const imageFiles = files.filter(f => f.type === 'image');
    if (imageFiles.length > 0) {
      return imageFiles;
    }
  }
  
  // Score files based on relevance
  const scoredFiles = files.map(file => {
    let score = 0;
    const filename = file.filename.toLowerCase();
    const content = file.content.toLowerCase();
    
    // Boost financial questions to Excel files
    if ((queryLower.includes('cost') || queryLower.includes('price') || 
         queryLower.includes('budget') || queryLower.includes('financial')) &&
        file.type === 'excel') {
      score += 10;
    }
    
    // Boost rendering questions to image files
    if ((queryLower.includes('render') || queryLower.includes('look') || 
         queryLower.includes('design') || queryLower.includes('view') ||
         queryLower.includes('rooftop') || queryLower.includes('sunset') ||
         queryLower.includes('tower')) && file.type === 'image') {
      score += 8;
    }
    
    // Boost development info to Word docs
    if ((queryLower.includes('development') || queryLower.includes('project') ||
         queryLower.includes('timeline')) && file.type === 'word') {
      score += 7;
    }
    
    // Always include at least one file of each type for comprehensive queries
    if (queryLower.includes('all files') || queryLower.includes('what files') ||
        queryLower.includes('list files')) {
      if (file.type === 'image') score += 5;
      if (file.type === 'excel') score += 5;
      if (file.type === 'word') score += 5;
    }
    
    // General content matching
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (word.length > 3) {
        if (filename.includes(word)) score += 3;
        if (content.includes(word)) score += 1;
      }
    });
    
    return { file, score };
  });
  
  // For "list all files" queries, return more files
  if (queryLower.includes('all files') || queryLower.includes('list files')) {
    return scoredFiles
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.file);
  }
  
  // Return top 3 most relevant files
  return scoredFiles
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.file);
}