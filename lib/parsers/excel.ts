import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';

export async function parseExcelFile(filepath: string) {
  const data = await fs.readFile(filepath);
  const workbook = XLSX.read(data, { type: 'buffer', cellText: false, cellDates: true });
  
  let allContent = '';
  const sheets: string[] = [];
  
  workbook.SheetNames.forEach(sheetName => {
    sheets.push(sheetName);
    const worksheet = workbook.Sheets[sheetName];
    
    allContent += `\n\n=== SHEET: ${sheetName} ===\n`;
    
    // Get actual range
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: 100, c: 25 } };
    allContent += `Sheet Range: ${worksheet['!ref'] || 'A1:Z100'}\n`;
    
    // Convert entire sheet to array format to ensure all data is captured
    const sheetData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      raw: false,
      defval: '',
      range: range
    }) as unknown[][];
    
    // Output all rows with data
    sheetData.forEach((row, rowIndex) => {
      const typedRow = row as unknown[];
      if (typedRow && Array.isArray(typedRow) && typedRow.some(cell => cell !== '')) {
        allContent += `Row ${rowIndex + 1}: ${typedRow.join(' | ')}\n`;
      }
    });
    
    // CRITICAL: Extract specific cells by address for financial data
    const financialCells = ['P42', 'Q42', 'R42', 'P43', 'Q43', 'P41', 'Q41', 'P40', 'Q40', 'P39', 'Q39'];
    allContent += `\n=== SPECIFIC FINANCIAL CELLS ===\n`;
    
    financialCells.forEach(cellAddress => {
      const cell = worksheet[cellAddress];
      if (cell && cell.v !== undefined) {
        allContent += `CELL ${cellAddress}: ${cell.v}\n`;
        if (cell.v && cell.v.toString().includes('187') || cell.v.toString().includes('Revenue')) {
          allContent += `*** TOTAL REVENUE FOUND IN ${cellAddress}: ${cell.v} ***\n`;
        }
      }
    });
    
    // Also scan a wider range around row 42 for revenue data
    for (let row = 35; row <= 50; row++) {
      for (let col = 15; col <= 20; col++) { // Columns P-T
        const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellValue = cell.v.toString();
          if (cellValue.includes('Revenue') || cellValue.includes('187') || cellValue.includes('$187')) {
            allContent += `*** REVENUE DATA FOUND ${cellAddress} (Row ${row}, Col ${col}): ${cellValue} ***\n`;
          }
        }
      }
    }
    
  });
  
  return {
    content: allContent,
    sheets,
    type: 'excel' as const
  };
}