# Hero HQ - Project Handoff

## Project Overview
Hero HQ is a personal dashboard for a single user, styled with a "Fight Club / Aliveness" aesthetic (the B.L.A.S.T. framework). It uses Next.js App Router and Supabase as the backend. The core mechanic is the "CRAZY Launcher," a system that walks the user through a deliberate activation process for tasks, projects, appointments, and playbooks, turning them into portfolio pieces.

## Master Roadmap & Milestones
- [x] **Protocol 0**: Initialize Memory & Stop (Created project memory files and established A.N.T architecture context)
- [x] **Phase 1**: Initial Setup & Architecture (Supabase schema, Google OAuth, Base UI Scaffold)
- [x] **Phase 2**: B.L.A.S.T. Prompts Implementation (AI Integration & Core Interactions)
  - [x] **Prompt 1**: Relabel and Rewire Dashboard Cards (Today, Projects, Ideas, Calendar)
  - [x] **Prompt 2**: Tyler Durden Oracle Widget (On-load briefings, Next Action inference)
  - [x] **Prompt 3**: CRAZY Launcher API Integration (Generate Constitution, Phase Initialization via Next.js API Routes)
  - [x] **Prompt 4**: Capture Input Flow (Full-screen capture modal, AI Routing to tables, Review Card)
  - [x] **Prompt 5**: Debrief Trigger (Sit-in-the-car modal on 'debriefing' status, hooked to `ProjectActions.tsx`)
- [x] **Phase 3**: Stylize, Finalize, and Polish (Fight Club aesthetic, daily quotes, tactile hovers)
- [x] **Phase 4**: Oracle Transcript Capture (Dashboard input wired to deterministic routing API for Pocket texts)

## Current Stage & Trajectory
**Current Phase:** Phase 3 & 4 Completed. Ready for next steps.

**State of Completion (The Handoff Point):**
Phase 3 (Stylize) and Phase 4 (Oracle Capture) have been successfully implemented and pushed to GitHub and Vercel. Global aesthetic has been locked into the pure black "Fight Club" theme, and the dashboard has been upgraded to ingest raw transcripts via the Oracle input. All five of the Phase 2 B.L.A.S.T. prompts have been successfully implemented, tested, and pushed to GitHub. The project's Next.js API routes now handle the heavy lifting of routing captures, initializing CRAZY constitutions, and logging debriefs. The UI components (`CaptureModal`, `CrazyModal`, `DebriefModal`, `OracleWidget`) have all been wired into the main dashboard and project detail pages. 

### Recent Technical Highlights:
1. **API Routes:** All Claude interactions successfully migrated from Supabase Edge Functions to Next.js API routes (`/api/crazy`, `/api/capture`, `/api/capture/confirm`, `/api/oracle`, `/api/debrief/trigger`).
2. **Postgres Integration:** The API routes securely read/write to Supabase via `@supabase/supabase-js` using standard schema rules and service roles where necessary.
3. **Environment Security:** `ANTHROPIC_API_KEY` is safely stored in `.env.local` and properly git-ignored.
4. **Vercel Deployment:** The codebase is successfully deploying to Vercel (Next.js Framework Preset). 
5. **Styling & Aesthetics**: Global pure black background, tactile hover effects on cards, and daily contextual Fight Club quotes overlay.
6. **Direct Transcript Capture**: The `/api/capture` route now securely intercepts raw transcripts pasted into the Oracle Widget, parses them via Claude, and natively inserts them into the `appointments`, `tasks`, `ideas`, and `playbooks` tables, instantly bypassing the inbox.

## Next Steps for the User
1. Verify the deployment on the live Vercel URL.
2. Supply the next phase prompts or Master Ledger updates.
