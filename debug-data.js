// debug-data.js - Simple Node.js script to debug data pipeline
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function debugDataPipeline() {
  console.log('🔍 DEBUGGING DATA PIPELINE...\n');

  // Check if data directories exist
  const miamiPath = path.join(__dirname, 'data', 'miami');
  const tonawandaPath = path.join(__dirname, 'data', 'tonawanda');

  console.log(`📁 Miami data path: ${miamiPath}`);
  console.log(`📁 Tonawanda data path: ${tonawandaPath}`);

  if (!fs.existsSync(miamiPath)) {
    console.log('❌ Miami data directory not found!');
    return;
  }

  if (!fs.existsSync(tonawandaPath)) {
    console.log('❌ Tonawanda data directory not found!');
    return;
  }

  // List files in Miami directory
  console.log('\n📋 MIAMI FILES:');
  const miamiFiles = fs.readdirSync(miamiPath);
  miamiFiles.forEach(file => {
    const filePath = path.join(miamiPath, file);
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${Math.round(stats.size/1024)}KB)`);
  });

  // Test parsing the key Word documents
  console.log('\n🔍 TESTING WORD DOCUMENT PARSING:');
  
  const wordFiles = miamiFiles.filter(f => f.endsWith('.docx'));
  
  for (const wordFile of wordFiles.slice(0, 2)) { // Test first 2 Word files
    try {
      console.log(`\n--- Testing ${wordFile} ---`);
      const filePath = path.join(miamiPath, wordFile);
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      const content = result.value;
      console.log(`✅ Successfully parsed ${wordFile}`);
      console.log(`📄 Content length: ${content.length} characters`);
      
      // Look for key project information
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('nevo tower')) console.log('  🏢 Found: NeVo Tower reference');
      if (lowerContent.includes('north bay village')) console.log('  📍 Found: North Bay Village reference');
      if (lowerContent.includes('75 unit')) console.log('  🏠 Found: 75 units reference');
      if (lowerContent.includes('partners not paychecks')) console.log('  💼 Found: Partners Not Paychecks reference');
      if (lowerContent.includes('mmm')) console.log('  📊 Found: MMM reference');
      
      // Show preview
      console.log(`📖 Preview: ${content.substring(0, 300)}...`);
      
    } catch (error) {
      console.log(`❌ Error parsing ${wordFile}: ${error.message}`);
    }
  }

  // Test CSV file parsing
  console.log('\n🔍 TESTING CSV FILE PARSING:');
  const csvFiles = miamiFiles.filter(f => f.endsWith('.csv'));
  
  for (const csvFile of csvFiles) {
    try {
      console.log(`\n--- Testing ${csvFile} ---`);
      const filePath = path.join(miamiPath, csvFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`✅ Successfully read ${csvFile}`);
      console.log(`📄 Content length: ${content.length} characters`);
      console.log(`📖 Content: ${content}`);
      
    } catch (error) {
      console.log(`❌ Error reading ${csvFile}: ${error.message}`);
    }
  }

  console.log('\n✅ DATA PIPELINE DEBUG COMPLETE!');
  console.log('\n🎯 SUMMARY:');
  console.log(`  - Miami files found: ${miamiFiles.length}`);
  console.log(`  - Word documents: ${wordFiles.length}`);
  console.log(`  - CSV files: ${csvFiles.length}`);
  
  // Check if API key exists
  if (process.env.GEMINI_API_KEY) {
    console.log('  - ✅ GEMINI_API_KEY found');
  } else {
    console.log('  - ❌ GEMINI_API_KEY missing');
  }
}

// Run the debug
debugDataPipeline().catch(console.error);