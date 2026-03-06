# Hero HQ Findings & Constraints

## Pre-flight Discoveries
- **Philosophy**: Aliveness > Optimization (Fight Club styling).
- **Data Source of Truth**: Supabase handles all data storage. The Claude API is purely functional and stateless.
- **Rules of Engagement**: 
  - Never call Claude API client-side.
  - All AI calls go through Supabase Edge Functions.
  - CRAZY status transitions are processed server-side only.
- **Constraints**:
  - The UI design must match Stitch HTML/CSS spec exactly, unless flagged.
  - Must use Next.js App Router (default global rule).
  - Must use Supabase RLS on all tables from day one.

## B.L.A.S.T. Discovery (Phase 2 Conversion)
1. **North Star**: A conversion of the project from its current state into one that fulfills it in the functionality of capturing ideas and turning them into skills and well-framed task-based projects.
2. **Integrations**: Stitch available for design updates. Connection available. Supabase as the backend. Schema is built. MCP available. Github and Vercel for deploying and updating. Connections are active. Keys are installed.
3. **Source of Truth**: Supabase.
4. **Delivery Payload**: Beautifully deployed dashboard. Mobile-first.
5. **Behavioral Rules**: Project copilot. Design and implementation architect. Focus on deterministic, self-healing automation in the A.N.T. 3-layer architecture.

## Issues / Roadblocks
1. ~~**Missing Column referenced in Trigger**: The `trigger_debrief()` spec references `NEW.current_phase`. While the `projects` table has a `current_phase` column, the `playbooks` table does not list `current_phase` as a column in the database spec. If I attach the debrief trigger to `playbooks`, it will crash. I am pausing the Phase 1 Database Migration to request permission to add `current_phase` (text) to the `playbooks` table.~~ -> *Resolved: Permission granted 2026-03-03 to explicitly add `current_phase` to playbooks.*
