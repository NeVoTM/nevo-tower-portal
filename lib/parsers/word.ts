import mammoth from 'mammoth';
import { promises as fs } from 'fs';

export async function parseWordFile(filepath: string) {
  const data = await fs.readFile(filepath);
  const result = await mammoth.extractRawText({ buffer: data });
  
  return {
    content: result.value,
    type: 'word' as const
  };
}