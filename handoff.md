# Hero HQ - Project Handoff

## Project Overview
Hero HQ is a personal dashboard for a single user, styled with a "Fight Club / Aliveness" aesthetic (the B.L.A.S.T. framework). It uses Next.js App Router and Supabase as the backend. The core mechanic is the "CRAZY Launcher," a system that walks the user through a deliberate activation process for tasks, projects, appointments, and playbooks, turning them into portfolio pieces.

## Master Roadmap & Milestones
- [x] **Protocol 0**: Initialize Memory & Stop (Created `gemini.md`, `task_plan.md`, `findings.md`, `progress.md`, `PLAN.md`)
- [x] **Phase 1**: Supabase Setup (Created 13 tables, Enums, Views, RLS, Edge Function stubs, Postgres trigger `trigger_debrief`)
- [x] **Phase 2**: Authentication (Configured Google OAuth and Next.js middleware)
- [x] **Phase 3**: Base App UI (Initialized Next.js project, implemented read-only Today page `/page.tsx`)
- [x] **Phase 4**: Capture Pipeline (Created `pocket-parse` Edge Function to route transcripts via Claude API)
- [x] **Phase 5**: CRAZY Launcher (Created `crazy-launcher` Edge Function and `CrazyModal.tsx` UI)
- [x] **Phase 6**: Debrief Intercept (Created `today-brief` Edge Function and `DebriefModal.tsx` UI)
- [ ] **Phase 7**: Remaining Pages (Projects Detail pages, Portfolio/Yawp Archive, Backlog, Calendar, Playbooks)
- [ ] **Phase 8**: Stylize (Implement Stitch HTML designs, polish animations/typography)
- [ ] **Phase 9**: Deploy (Vercel deploy, environment variables config)

## Current Stage & Trajectory
**Current Phase:** Phase 7: Remaining Pages (Projects & Portfolio)

**State of Phase 7 (The Handoff Point):**
We are just starting Phase 7. The goal is to build the UI for the remaining pages, primarily:
1.  **Projects Detail Page (`/projects/[id]`)**: A four-tab layout (Plan, Findings, Progress, Constitution) with a collapsed constitution banner and a prominent CRAZY button if unlaunched.
2.  **Portfolio Page (`/portfolio`)**: The Yawp Archive showing everything that has been yawped, sorted by date.
3.  **Other Views**: Backlog, Calendar, and Playbooks.

### Known Issues & Roadblocks to Address Immediately in New Context:
1.  **TypeScript & Next.js Configuration**: The previous agent got stuck trying to resolve TypeScript module import errors. Specifically:
    -   The Next.js project was initialized with `--no-import-alias`, but the code written uses the `@/utils/...` alias. The `tsconfig.json` needs to be updated with `"paths": { "@/*": ["./src/*"] }` to resolve these errors.
    -   The Supabase Edge Functions (in `supabase/functions/`) use Deno and `jsr:` imports. These are causing TypeScript errors in the Next.js context. The `supabase` directory needs to be added to the `"exclude"` array in `tsconfig.json` to prevent Next.js from trying to compile them.
2.  **File Creation Approach**: Avoid using terminal commands like `mkdir` with dynamic route brackets (e.g., `[id]`) in PowerShell, as it causes syntax conflicts and hangs the agent. Use direct file writing tools instead.

## Key Files to Review
-   `c:\antigravity-herohq\gemini.md`: The Project Constitution containing the data schema and behavioral rules.
-   `c:\antigravity-herohq\PLAN.md`: The Master Ledger and squad status.
-   `c:\antigravity-herohq\findings.md`: Architectural constraints and resolved issues.
-   `c:\antigravity-herohq\task_plan.md`: The detailed checklist for the 9-phase build.
