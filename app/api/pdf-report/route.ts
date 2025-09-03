import { NextResponse } from 'next/server';
import { loadAllFiles } from '../../../lib/parsers';
import { queryWithAI } from '../../../lib/gemini';

export async function GET() {
  try {
    const files = await loadAllFiles();
    
    // Query AI for comprehensive project data
    const projectQuery = `Based on all the files, create a comprehensive project summary including:
1. Total project value and sales projections from G4 Excel
2. Project size, location, and development timeline from NBV document  
3. All Miami Makers Model advantages with strongest benefits first
4. Key financial metrics and unit details
5. Location significance in Miami's hottest development area`;

    const result = await queryWithAI(projectQuery, files);
    
    // Structure the report data
    const reportData = {
      title: "Partners Not Paychecks™",
      subtitle: "Revolutionary Real Estate Development Model",
      location: "NeVo Tower - North Bay Village, Miami",
      hotSpot: "Miami's Hottest Development Area",
      keyAdvantages: [
        "8% Annualized Time-Weighted Preferred Return",
        "Up to 20% Construction Cost Reduction per SF", 
        "Minimized Cash Investments & Reduced Risks",
        "6-12 Months Faster Development Timeline",
        "Equitable Profit Sharing & In-Kind Contributions",
        "Perpetual Residual Income from STRs",
        "Enhanced Sales with Self-Financing Options",
        "Strategic Market Timing Flexibility"
      ],
      projectDetails: {
        address: "1580 79th St Causeway, North Bay Village",
        type: "Mixed-Use (Condo, Hospitality, Retail, Community)",
        stories: "24 Stories",
        units: "75 Units",
        sqft: "260,775 SF",
        timeline: "Construction Q3 2026"
      },
      aiAnalysis: result.answer,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('PDF Report error:', error);
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 });
  }
}