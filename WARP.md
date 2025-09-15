# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack on http://localhost:3000
- `npm run build` - Build production app with Turbopack optimization
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Data Management
- Project data stored in separate city directories: `data/miami/` and `data/tonawanda/`
- Supports multiple file formats: .docx, .xlsx, .csv, .json, .txt, .png
- Data is cached and pre-processed on server startup for faster responses
- Use `./end-of-day.sh` to update development status

### Development Status Tracking
- Current status: `.dev-status/HANDOFF.md`
- Instructions for new sessions: `.dev-status/START-INSTRUCTIONS.md`
- Project structure: `.dev-status/project-structure.txt`

## Architecture Overview

### Project Type & Tech Stack
This is a **DMM ("Partners Not Paychecks") AI Agent** built with **Next.js 15 App Router**:
- **Multi-AI Integration**: Anthropic Claude 3 Haiku + Google Gemini 1.5 Flash
- **Multi-language Voice Interface**: 17 languages with smart corrections
- **Tailwind CSS v4** for styling with gradient backgrounds
- **Document processing** via mammoth, xlsx, sharp, and custom parsers
- **Intelligent caching** system for fast response times

### Key Components Architecture

**Frontend Structure:**
- `app/layout.tsx` - Root layout with global CSS and metadata
- `app/page.tsx` - Main DMM AI Agent interface with voice, city switching, and paginated responses
- `components/voice/VoiceInterface.tsx` - Multi-language voice recognition and TTS system
- `components/DMMChartsComponent.tsx` - Interactive charts comparing DMM vs conventional models

**Dual AI API Integration:**
- `app/api/query/route.ts` - Primary API using Google Gemini with intelligent caching and file parsing
- `app/api/claude/route.ts` - Secondary API using Anthropic Claude 3 Haiku for fallback
- Smart query routing: summary data for quick queries, full data for detailed requests
- Pre-loading and caching system for both Miami and Tonawanda project data

**Data Processing Pipeline:**
- `lib/parsers/` - Modular file parsing system for Word, Excel, CSV, images, and JSON
- `lib/conversation-manager.ts` - Session management and context tracking
- `lib/types/index.ts` - TypeScript definitions for data structures
- Real-time file parsing with priority ordering (CSV first, then smaller files)

### AI Processing Implementation

The system uses a sophisticated dual-AI approach with intelligent optimization:
1. **Primary Processing**: Google Gemini 1.5 Flash with pre-cached project data
2. **Fallback System**: Anthropic Claude 3 Haiku when Gemini is unavailable
3. **Smart Query Routing**: Summary data for quick responses, full data for "detailed/comprehensive" queries
4. **Intelligent Caching**: 1-hour cache duration with pre-loading on server startup
5. **Response Optimization**: File priority system (CSV → JSON → TXT → Office docs)

### UI/UX Patterns

- **Gradient Backgrounds**: Dark theme with purple/slate gradients using Tailwind CSS
- **City-Based Context Switching**: Miami NeVo Tower vs Tonawanda project selection
- **Multi-Language Voice Interface**: 17 languages with smart corrections and professional TTS
- **Paginated Responses**: Long AI responses split into 200-word chunks with navigation
- **Real-time Voice Processing**: Speech recognition with debouncing and feedback loop prevention
- **Interactive Charts**: Toggleable DMM vs conventional model comparison visualizations
- **Responsive Grid Layouts**: Mobile-first design with flexible button grids

## Environment Requirements

### Required Environment Variables
- `GEMINI_API_KEY` - Required for Google Gemini 1.5 Flash (primary AI processing)
- `ANTHROPIC_API_KEY` - Required for Claude 3 Haiku (fallback AI processing)
- Both keys needed for full functionality and redundancy

### API Endpoints
- `POST /api/query` - Primary endpoint using Gemini with caching: `{query: string, city: string}`
- `POST /api/claude` - Fallback endpoint using Claude: `{query: string, city: string}`
- Returns: `{answer, sources, conversationId, confidence, processingTime, suggestedFollowups}`

## Content & Data Context

This is a **DMM ("Partners Not Paychecks") AI Agent** supporting two real estate projects:

### Miami NeVo Tower
- 75-unit luxury development in North Bay Village
- Project files: G NeVo Tower Model Analysis.docx (6MB), MMM advantages, renderings
- Quick facts CSV with project metrics and comparables

### Tonawanda Development
- Western NY mixed-use development project
- WNY Makers Model documentation, voting platforms, mission statements
- 5-lot analysis and rental market comparisons

## Development Notes

### Voice Interface Features
- **17 Language Support**: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Russian, Turkish, Dutch, Swedish
- **Smart Corrections**: Project-specific auto-corrections ("naval tower" → "nevo tower")
- **Feedback Loop Prevention**: Detects AI-generated speech to avoid echo effects
- **Professional TTS**: Priority voice selection for business-appropriate female voices
- **Debouncing**: 1.5-second minimum between voice inputs to prevent duplicates

### AI Processing Optimization
- **Caching Strategy**: 1-hour cache with server startup pre-loading
- **File Priority**: CSV/JSON processed first, then Word/Excel documents
- **Smart Routing**: Summary data for quick queries, full data for detailed requests
- **Error Handling**: Graceful fallback between Gemini and Claude APIs

### Current Development Issues (per HANDOFF.md)
- Voice interface working with 17 languages
- Data pipeline issues with file access
- City switching functionality needs debugging
- AI not consistently reading project files vs generic data
