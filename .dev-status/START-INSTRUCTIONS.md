# DMM AI Agent - New Chat Instructions

## How to Continue Development in New Claude Chat

### 1. New Chat Setup
When starting a new Claude chat session, begin with:

**"Continuing DMM AI Agent development. Here's my current status:"**

### 2. Share Current Status
Copy and paste the handoff file:
```bash
cat .dev-status/HANDOFF.md
```

### 3. Essential Commands
```bash
# Check current status
ls -la .dev-status/

# View handoff info
cat .dev-status/HANDOFF.md

# Check project structure
tree -L 2 -a

# Deploy to production
vercel --prod

# Start development server
npm run dev
```

### 4. Reference Previous Session Files
All session artifacts are saved in `.dev-status/` including:
- `HANDOFF.md` (current status)
- `project-structure.txt` (tree output)  
- `session-summary.md` (detailed notes)

### 5. Daily Focus
Each day's priorities are documented in `HANDOFF.md` - this changes based on what was completed in the previous session.

## End of Day Workflow
Before ending sessions:
```bash
# Update status for next session
./end-of-day.sh

# OR manually update HANDOFF.md in VS Code editor
```

## Project Info
All current project details and issues are in `HANDOFF.md` - this file updates daily with the latest status.