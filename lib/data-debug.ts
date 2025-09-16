// lib/data-debug.ts - Data Pipeline Debugging & Management System
import * as fs from 'fs';
import * as path from 'path';
import { parseFiles } from './parsers';

interface DataDebugResult {
  status: 'success' | 'error';
  city: string;
  filesFound: number;
  filesProcessed: number;
  errors: string[];
  summary: string;
  sampleData: any;
  fileDetails: Array<{
    filename: string;
    size: number;
    type: string;
    status: 'success' | 'error';
    preview: string;
    error?: string;
  }>;
}

export class DataPipelineDebugger {
  constructor() {}

  async debugCity(city: string): Promise<DataDebugResult> {
    const result: DataDebugResult = {
      status: 'success',
      city,
      filesFound: 0,
      filesProcessed: 0,
      errors: [],
      summary: '',
      sampleData: {},
      fileDetails: []
    };

    try {
      const cityPath = path.join(process.cwd(), 'data', city);
      
      // Check if directory exists
      if (!fs.existsSync(cityPath)) {
        result.status = 'error';
        result.errors.push(`Data directory not found: ${cityPath}`);
        return result;
      }

      // Get all files
      const allFiles = await fs.promises.readdir(cityPath);
      result.filesFound = allFiles.length;

      console.log(`🔍 Debugging ${city} - Found ${allFiles.length} files`);

      // Process each file individually for detailed debugging
      for (const filename of allFiles) {
        const filePath = path.join(cityPath, filename);
        const stats = await fs.promises.stat(filePath);
        
        const fileDetail: {
          filename: string;
          size: number;
          type: string;
          status: 'success' | 'error';
          preview: string;
          error?: string;
        } = {
          filename,
          size: stats.size,
          type: path.extname(filename).toLowerCase(),
          status: 'success',
          preview: '',
          error: undefined
        };

        try {
          // Parse single file
          const parsed = await parseFiles([filePath]);
          
          if (parsed[filename]) {
            result.filesProcessed++;
            fileDetail.status = 'success';
            
            // Create preview
            const content = parsed[filename];
            if (content && typeof content === 'object') {
              if (content.content) {
                // Word document
                fileDetail.preview = content.content.substring(0, 200) + '...';
              } else {
                // Excel/JSON
                fileDetail.preview = JSON.stringify(content, null, 1).substring(0, 200) + '...';
              }
            } else if (typeof content === 'string') {
              // CSV/text
              fileDetail.preview = content.substring(0, 200) + '...';
            }

            // Add to sample data
            result.sampleData[filename] = content;
            
          } else {
            fileDetail.status = 'error';
            fileDetail.error = 'File parsed but no content returned';
            result.errors.push(`${filename}: No content returned`);
          }
          
        } catch (error) {
          fileDetail.status = 'error';
          fileDetail.error = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`${filename}: ${fileDetail.error}`);
        }

        result.fileDetails.push(fileDetail);
      }

      // Create summary
      result.summary = this.createDataSummary(city, result.sampleData);

      if (result.errors.length > 0) {
        result.status = 'error';
      }

    } catch (error) {
      result.status = 'error';
      result.errors.push(`Failed to debug city ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private createDataSummary(city: string, data: any): string {
    let summary = `=== ${city.toUpperCase()} PROJECT DATA SUMMARY ===\n\n`;
    
    // Look for key project information
    const projectInfo = this.extractProjectInfo(data);
    
    if (projectInfo.name) summary += `🏢 PROJECT: ${projectInfo.name}\n`;
    if (projectInfo.location) summary += `📍 LOCATION: ${projectInfo.location}\n`;
    if (projectInfo.units) summary += `🏠 UNITS: ${projectInfo.units}\n`;
    if (projectInfo.type) summary += `🏗️ TYPE: ${projectInfo.type}\n`;
    if (projectInfo.model) summary += `💼 MODEL: ${projectInfo.model}\n`;
    
    summary += `\n📁 FILES PROCESSED (${Object.keys(data).length}):\n`;
    
    for (const [filename, content] of Object.entries(data)) {
      summary += `\n--- ${filename} ---\n`;
      
      if (content && typeof content === 'object') {
        const contentObj = content as any;
        if (contentObj.content) {
          // Word document
          const text = contentObj.content.substring(0, 300);
          summary += text + (contentObj.content.length > 300 ? '...\n' : '\n');
        } else {
          // Excel/JSON
          const keys = Object.keys(content);
          summary += `Data structure: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}\n`;
        }
      } else if (typeof content === 'string') {
        // CSV/text
        summary += content.substring(0, 300) + (content.length > 300 ? '...\n' : '\n');
      }
    }
    
    return summary;
  }

  private extractProjectInfo(data: any): {
    name?: string;
    location?: string;
    units?: string;
    type?: string;
    model?: string;
  } {
    const info: any = {};
    const searchText = JSON.stringify(data).toLowerCase();
    
    // Look for project names
    if (searchText.includes('nevo tower')) info.name = 'NeVo Tower';
    if (searchText.includes('tonawanda')) info.name = 'Tonawanda Development';
    
    // Look for locations
    if (searchText.includes('north bay village')) info.location = 'North Bay Village';
    if (searchText.includes('miami')) info.location = 'Miami, FL';
    if (searchText.includes('western ny')) info.location = 'Western NY';
    
    // Look for unit counts
    const unitMatch = searchText.match(/(\d+)[- ]unit/);
    if (unitMatch) info.units = `${unitMatch[1]} units`;
    
    // Look for project types
    if (searchText.includes('luxury')) info.type = 'Luxury Development';
    if (searchText.includes('mixed-use')) info.type = 'Mixed-use Development';
    
    // Look for model
    if (searchText.includes('partners not paychecks')) info.model = 'Partners Not Paychecks';
    if (searchText.includes('mmm')) info.model = 'Miami Makers Model (MMM)';
    
    return info;
  }

  async testAPIResponse(city: string, query: string): Promise<any> {
    try {
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, city })
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Utility functions for easy data management
export async function quickDataTest(city: string = 'miami'): Promise<void> {
  const debugTool = new DataPipelineDebugger();
  const result = await debugTool.debugCity(city);
  
  console.log(`\n🔍 DATA PIPELINE DEBUG RESULTS FOR ${city.toUpperCase()}`);
  console.log(`Status: ${result.status}`);
  console.log(`Files Found: ${result.filesFound}`);
  console.log(`Files Processed: ${result.filesProcessed}`);
  
  if (result.errors.length > 0) {
    console.log(`\n❌ ERRORS (${result.errors.length}):`);
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log(`\n📋 FILE DETAILS:`);
  result.fileDetails.forEach(file => {
    const status = file.status === 'success' ? '✅' : '❌';
    console.log(`  ${status} ${file.filename} (${Math.round(file.size/1024)}KB)`);
    if (file.error) console.log(`     Error: ${file.error}`);
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(result.summary);
}

export async function testLiveAPI(city: string = 'miami', query: string = 'Tell me about the project'): Promise<void> {
  const debugTool = new DataPipelineDebugger();
  
  try {
    console.log(`\n🧪 TESTING API: ${query} (${city})`);
    const response = await debugTool.testAPIResponse(city, query);
    
    console.log(`✅ API Response received!`);
    console.log(`Sources: ${response.sources?.length || 0}`);
    console.log(`Confidence: ${response.confidence || 'N/A'}`);
    console.log(`Processing Time: ${response.processingTime || 'N/A'}ms`);
    console.log(`\n📝 Answer:`);
    console.log(response.answer);
    
  } catch (error) {
    console.log(`❌ API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}