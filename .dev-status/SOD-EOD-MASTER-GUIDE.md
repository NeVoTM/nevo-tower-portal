
# DMM AI Agent - SOD/EOD Complete Guide

## For New Claude Chat Sessions - IMMEDIATE INSTRUCTIONS

### Step 1: Copy This Context Statement
**Start every new chat with:**

"I'm continuing development of my DMM AI Agent project. Here's the current context:

**PROJECT STATUS:**
- Multi-language voice interface (17 languages) - WORKING
- Professional female voice output - WORKING  
- Smart auto-correction for project terms - WORKING
- Data pipeline - BROKEN (priority fix needed)
- City switching (Miami vs Tonawanda) - BROKEN

**IMMEDIATE PROBLEM:**
AI returns generic Miami tower info instead of our actual project data:
- Should know about Miami NeVo Tower (75 units, North Bay Village, Partners Not Paychecks model)
- Should access data from Miami Makers Model documents (6MB .docx files)
- Tonawanda selection returns Miami data instead of WNY Makers Model info

**TECHNICAL CONTEXT:**
- Using Codespace environment
- Two API endpoints: /api/query (Gemini+files, should work) vs /api/claude (basic only)
- Data structure: data/miami/ and data/tonawanda/ with project documents
- Deploy: vercel --prod (no git commits needed)

**PRIORITY:** Debug file access in /api/query endpoint - files exist but AI can't read them."

### Step 2: Share Current Files
After pasting the context, run and share these outputs:

```bash
# Show current status
cat .dev-status/HANDOFF.md

# If needed, show project structure  
cat .dev-status/project-structure.txt
```

### Step 3: Set Expectations for Claude
Tell the new Claude:

"Please focus on solving the data pipeline issue. Don't spend time explaining voice interface setup or basic project structure - those work fine. The problem is specifically that our /api/query endpoint isn't reading the project files from data/miami/ and data/tonawanda/ directories."

---

## Documentation Update Instructions for Claude

### What NOT to Spend Time On
- Voice interface implementation (already working)
- Multi-language support setup (already implemented) 
- Project structure explanations (already documented)
- Basic Next.js or TypeScript setup guidance
- UI/UX improvements (not current priority)

### What TO Focus On
1. **Data pipeline debugging** - Why files aren't being read
2. **City context switching** - Fix API routing between Miami/Tonawanda
3. **File parsing improvements** - Better .docx/.xlsx processing
4. **Specific code fixes** - Exact changes needed in /api/query/route.ts

### Documentation Updates Needed
When making progress, update these files:
- `.dev-status/HANDOFF.md` - Current status and next priorities
- `.dev-status/session-summary.md` - Detailed progress notes
- Project documentation artifact - Technical implementation details

---

## End of Day (EOD) Procedure

### Quick EOD Commands
```bash
# Update project structure
tree -L 2 -a > .dev-status/project-structure.txt

# Update session log
echo "Session $(date): [brief progress summary]" >> .dev-status/session-log.txt

# Review current status
cat .dev-status/HANDOFF.md
```

### Update HANDOFF.md for Next Session
Edit `.dev-status/HANDOFF.md` in Codespace editor to reflect:
- What was attempted/fixed today
- Current status of data pipeline issue
- Next specific steps to try
- Any new discoveries about the file access problem

### Create Next Session Context
Update the "IMMEDIATE PROBLEM" section in this guide with:
- Latest findings about why files aren't being read
- Any API endpoint changes made
- New debugging approaches to try

---

## Start of Day (SOD) Procedure

### Before Opening New Chat
1. Review `.dev-status/HANDOFF.md` for current status
2. Check if any files were modified since last session
3. Note any new issues discovered

### Opening New Chat
1. Use the Step 1 context statement above
2. Share current HANDOFF.md content
3. Set clear expectations about focusing on data pipeline only

### First Actions in New Chat
Ask Claude to:
1. "Debug why /api/query isn't reading our project files"
2. "Check the file parsing logic in app/api/query/route.ts"  
3. "Test if the API can see files in data/miami/ and data/tonawanda/"

---

## Quick Reference Commands

### Development Commands
```bash
# Start dev server
npm run dev

# Deploy to production  
vercel --prod

# Check project structure
tree -L 2 -a

# View current status
cat .dev-status/HANDOFF.md

# Check data directories
ls -la data/miami/
ls -la data/tonawanda/
```

### File Locations
- **Main component:** app/page.tsx
- **Voice interface:** components/voice/VoiceInterface.tsx  
- **Problem API:** app/api/query/route.ts (file parsing issue)
- **Working API:** app/api/claude/route.ts (basic responses only)
- **Data files:** data/miami/ and data/tonawanda/
- **Session files:** .dev-status/

### Expected Data Files
- **Miami:** Advantages of MMM.docx, G NeVo Tower Model Analysis.docx (6MB each)
- **Tonawanda:** WNY Makers Model guides, mission statements

---

## Progress Tracking

### Current Issues Status
- [ ] File reading in /api/query endpoint
- [ ] City context switching (Miami vs Tonawanda)  
- [ ] Document parsing for large .docx files
- [ ] Voice interface feedback loop prevention

### Completed Features
- [x] Multi-language voice interface (17 languages)
- [x] Smart auto-correction system
- [x] Professional female voice output
- [x] Voice interface UI and controls
- [x] City selection buttons and interface

### Next Major Milestones
1. Fix data pipeline and file access
2. Verify AI knows actual project details
3. Test city switching functionality
4. Final voice interface refinements

---

## Emergency Debugging

If new Claude seems confused about the project:
1. Share the project structure: `cat .dev-status/project-structure.txt`
2. Explain: "This is a working voice interface for real estate AI, the only issue is file access"
3. Direct focus: "Just help debug why our API can't read the project documents"

Remember: The goal is immediate productivity in new chats without re-explaining the entire project setup.# DMM AI Agent - SOD/EOD Complete Guide

## For New Claude Chat Sessions - IMMEDIATE INSTRUCTIONS

### Step 1: Copy This Context Statement
**Start every new chat with:**

"I'm continuing development of my DMM AI Agent project. Here's the current context:

**PROJECT STATUS:**
- Multi-language voice interface (17 languages) - WORKING
- Professional female voice output - WORKING  
- Smart auto-correction for project terms - WORKING
- Data pipeline - BROKEN (priority fix needed)
- City switching (Miami vs Tonawanda) - BROKEN

**IMMEDIATE PROBLEM:**
AI returns generic Miami tower info instead of our actual project data:
- Should know about Miami NeVo Tower (75 units, North Bay Village, Partners Not Paychecks model)
- Should access data from Miami Makers Model documents (6MB .docx files)
- Tonawanda selection returns Miami data instead of WNY Makers Model info

**TECHNICAL CONTEXT:**
- Using Codespace environment
- Two API endpoints: /api/query (Gemini+files, should work) vs /api/claude (basic only)
- Data structure: data/miami/ and data/tonawanda/ with project documents
- Deploy: vercel --prod (no git commits needed)

**PRIORITY:** Debug file access in /api/query endpoint - files exist but AI can't read them."

### Step 2: Share Current Files
After pasting the context, run and share these outputs:

```bash
# Show current status
cat .dev-status/HANDOFF.md

# If needed, show project structure  
cat .dev-status/project-structure.txt
```

### Step 3: Set Expectations for Claude
Tell the new Claude:

"Please focus on solving the data pipeline issue. Don't spend time explaining voice interface setup or basic project structure - those work fine. The problem is specifically that our /api/query endpoint isn't reading the project files from data/miami/ and data/tonawanda/ directories."

---

## Documentation Update Instructions for Claude

### What NOT to Spend Time On
- Voice interface implementation (already working)
- Multi-language support setup (already implemented) 
- Project structure explanations (already documented)
- Basic Next.js or TypeScript setup guidance
- UI/UX improvements (not current priority)

### What TO Focus On
1. **Data pipeline debugging** - Why files aren't being read
2. **City context switching** - Fix API routing between Miami/Tonawanda
3. **File parsing improvements** - Better .docx/.xlsx processing
4. **Specific code fixes** - Exact changes needed in /api/query/route.ts

### Documentation Updates Needed
When making progress, update these files:
- `.dev-status/HANDOFF.md` - Current status and next priorities
- `.dev-status/session-summary.md` - Detailed progress notes
- Project documentation artifact - Technical implementation details

---

## End of Day (EOD) Procedure

### Quick EOD Commands
```bash
# Update project structure
tree -L 2 -a > .dev-status/project-structure.txt

# Update session log
echo "Session $(date): [brief progress summary]" >> .dev-status/session-log.txt

# Review current status
cat .dev-status/HANDOFF.md
```

### Update HANDOFF.md for Next Session
Edit `.dev-status/HANDOFF.md` in Codespace editor to reflect:
- What was attempted/fixed today
- Current status of data pipeline issue
- Next specific steps to try
- Any new discoveries about the file access problem

### Create Next Session Context
Update the "IMMEDIATE PROBLEM" section in this guide with:
- Latest findings about why files aren't being read
- Any API endpoint changes made
- New debugging approaches to try

---

## Start of Day (SOD) Procedure

### Before Opening New Chat
1. Review `.dev-status/HANDOFF.md` for current status
2. Check if any files were modified since last session
3. Note any new issues discovered

### Opening New Chat
1. Use the Step 1 context statement above
2. Share current HANDOFF.md content
3. Set clear expectations about focusing on data pipeline only

### First Actions in New Chat
Ask Claude to:
1. "Debug why /api/query isn't reading our project files"
2. "Check the file parsing logic in app/api/query/route.ts"  
3. "Test if the API can see files in data/miami/ and data/tonawanda/"

---

## Quick Reference Commands

### Development Commands
```bash
# Start dev server
npm run dev

# Deploy to production  
vercel --prod

# Check project structure
tree -L 2 -a

# View current status
cat .dev-status/HANDOFF.md

# Check data directories
ls -la data/miami/
ls -la data/tonawanda/
```

### File Locations
- **Main component:** app/page.tsx
- **Voice interface:** components/voice/VoiceInterface.tsx  
- **Problem API:** app/api/query/route.ts (file parsing issue)
- **Working API:** app/api/claude/route.ts (basic responses only)
- **Data files:** data/miami/ and data/tonawanda/
- **Session files:** .dev-status/

### Expected Data Files
- **Miami:** Advantages of MMM.docx, G NeVo Tower Model Analysis.docx (6MB each)
- **Tonawanda:** WNY Makers Model guides, mission statements

---

## Progress Tracking

### Current Issues Status
- [ ] File reading in /api/query endpoint
- [ ] City context switching (Miami vs Tonawanda)  
- [ ] Document parsing for large .docx files
- [ ] Voice interface feedback loop prevention

### Completed Features
- [x] Multi-language voice interface (17 languages)
- [x] Smart auto-correction system
- [x] Professional female voice output
- [x] Voice interface UI and controls
- [x] City selection buttons and interface

### Next Major Milestones
1. Fix data pipeline and file access
2. Verify AI knows actual project details
3. Test city switching functionality
4. Final voice interface refinements

---

## Emergency Debugging

If new Claude seems confused about the project:
1. Share the project structure: `cat .dev-status/project-structure.txt`
2. Explain: "This is a working voice interface for real estate AI, the only issue is file access"
3. Direct focus: "Just help debug why our API can't read the project documents"

Remember: The goal is immediate productivity in new chats without re-explaining the entire project setup.
"Here's my SOD guide - please read and follow the instructions in .dev-status/SOD-EOD-MASTER-GUIDE.md"
**IMMEDIATE FIRST ACTION:**
Please ask me to run: cat .dev-status/HANDOFF.md
Then immediately start debugging the /api/query file access issue.