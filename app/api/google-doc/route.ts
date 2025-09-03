import { NextResponse } from 'next/server';
import { loadAllFiles } from '../../../lib/parsers';
import { queryWithAI } from '../../../lib/gemini';

export async function POST() {
  try {
    const files = await loadAllFiles();
    
    const projectQuery = `Create content for a comprehensive PDF report including:
1. All Miami Makers Model advantages in priority order
2. Project details from NBV document  
3. Key financial highlights from G4 Excel
4. Location and development timeline`;

    const result = await queryWithAI(projectQuery, files);
    
    // Create formatted content for Google Docs
    const docContent = `Partners Not Paychecks™ Development Model
Revolutionary Real Estate Development Approach

NeVo Tower - 1580 79th St Causeway, North Bay Village
Miami's Hottest Development Area

KEY ADVANTAGES:
- 8% Annualized Time-Weighted Preferred Return
- Up to 20% Construction Cost Reduction per SF
- Minimized Cash Investments & Reduced Risks
- 6-12 Months Faster Development Timeline
- Equitable Profit Sharing & In-Kind Contributions
- Perpetual Residual Income from STRs
- Enhanced Sales with Self-Financing Options
- Strategic Market Timing Flexibility

PROJECT DETAILS:
Address: 1580 79th St Causeway, North Bay Village
Type: Mixed-Use (Condo, Hospitality, Retail, Community)
Size: 24 Stories | 75 Units | 260,775 SF
Timeline: Construction Q3 2026

AI ANALYSIS:
${result.answer}

FINANCIAL HIGHLIGHTS:
[EDIT THIS SECTION WITH YOUR G4 DATA]

ADDITIONAL NOTES:
[ADD YOUR CUSTOM CONTENT HERE]

Last Updated: ${new Date().toLocaleDateString()}`;

    // Create a shareable Google Docs link with pre-filled content
    const googleDocsUrl = `https://docs.google.com/document/create?usp=drive_web&title=Partners-Not-Paychecks-Development-Model&body=${encodeURIComponent(docContent)}`;
    
    return NextResponse.json({ 
      docUrl: googleDocsUrl,
      content: docContent,
      message: 'Google Docs link generated'
    });
  } catch (error) {
    console.error('Google Docs error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}