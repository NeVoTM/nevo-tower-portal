# DMM AI Agent - Quick Handoff

## Immediate Context
**Project:** Multi-language voice interface for real estate AI agent
**Status:** Voice working, data pipeline broken
**Priority:** Fix city switching and file access

## Current Problem
- AI not reading our Miami NeVo Tower or Tonawanda project files
- Returns generic Miami tower info instead of our 75-unit North Bay Village project
- City selection (Miami vs Tonawanda) not working properly

## Next Steps
1. Debug /api/query endpoint file access
2. Fix city context switching  
3. Test with actual project data files

## Key Files to Check
- app/page.tsx (voice interface integration)
- app/api/query/route.ts (Gemini + file parsing)
- data/miami/ (project files not being read)
- data/tonawanda/ (project files not being read)

## Data Files Available
- data/miami/: Advantages of MMM.docx, G NeVo Tower Model Analysis.docx (6MB each)
- data/tonawanda/: WNY Makers Model guides, mission statements

## Technical Notes
- Voice interface: 17 languages, smart corrections working
- Professional female voice output configured
- Using Codespace environment
- Deploy with: vercel --prod
