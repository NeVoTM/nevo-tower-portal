// scripts/ingest.ts
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

type Doc = { id: string; title: string; text: string };

async function ingest() {
  // Log current working directory for debugging
  console.log('Current working directory:', process.cwd());

  // Set path to dmm/data/raw
  const rawDir = path.join(process.cwd(), 'data', 'raw');
  console.log('Looking for files in:', rawDir);

  // Check if rawDir exists
  try {
    await fs.access(rawDir);
  } catch (error) {
    console.error(`Directory ${rawDir} does not exist or is inaccessible.`);
    throw new Error(`Please create ${rawDir} and add your .xlsx and .docx files.`);
  }

  // Read files
  const files = await fs.readdir(rawDir);
  console.log('Found files:', files);

  const corpus: Doc[] = [];

  for (const file of files) {
    const filePath = path.join(rawDir, file);
    try {
      if (file.endsWith('.docx')) {
        const { value } = await mammoth.extractRawText({ path: filePath });
        corpus.push({ id: file, title: file.replace('.docx', ''), text: value });
      } else if (file.endsWith('.xlsx')) {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const text = xlsx.utils.sheet_to_txt(sheet);
        corpus.push({ id: file, title: file.replace('.xlsx', ''), text });
      }
      console.log(`Processed file: ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  if (corpus.length === 0) {
    throw new Error('No valid .docx or .xlsx files found in data/raw');
  }

  // Save corpus
  const corpusPath = path.join(process.cwd(), 'data', 'corpus.json');
  console.log('Writing corpus to:', corpusPath);
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true }); // Ensure data/ exists
  await fs.writeFile(corpusPath, JSON.stringify(corpus, null, 2));

  console.log(`Ingested ${corpus.length} documents into ${corpusPath}`);
}

ingest().catch((error) => {
  console.error('Ingest failed:', error);
  process.exit(1);
});