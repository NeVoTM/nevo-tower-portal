// lib/parsers/index.ts - Original file to restore

import { parseExcelFile } from './excel';
import { parseWordFile } from './word';
import { parseImageFile } from './image';
import * as fs from 'fs';
import * as path from 'path';

export interface FileData {
  [filename: string]: any;
}

export async function parseFiles(filePaths: string[]): Promise<FileData> {
  const results: FileData = {};
  
  for (const filePath of filePaths) {
    try {
      const filename = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      let parsedContent;
      
      switch (ext) {
        case '.xlsx':
        case '.xls':
          parsedContent = await parseExcelFile(filePath);
          break;
        case '.docx':
        case '.doc':
          parsedContent = await parseWordFile(filePath);
          break;
        case '.png':
        case '.jpg':
        case '.jpeg':
          parsedContent = await parseImageFile(filePath);
          break;
        case '.json':
          const jsonContent = await fs.promises.readFile(filePath, 'utf-8');
          parsedContent = JSON.parse(jsonContent);
          break;
        case '.txt':
        case '.md':
          parsedContent = await fs.promises.readFile(filePath, 'utf-8');
          break;
        case '.csv':
          const csvContent = await fs.promises.readFile(filePath, 'utf-8');
          parsedContent = csvContent;
          break;
        default:
          console.warn(`Unsupported file type: ${ext}`);
          continue;
      }
      
      results[filename] = parsedContent;
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
    }
  }
  
  return results;
}