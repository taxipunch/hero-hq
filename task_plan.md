# Hero HQ Task Plan - Phase 2 (Conversion)

This blueprint governs the conversion of the baseline Hero HQ framework into an active, personality-rich system that captures ideas and turns them into skills and well-framed task-based projects.

## B.L.A.S.T. Blueprint

### Phase 1: B - Blueprint (Vision & Logic)
- [x] Initialized Project Memory (`task_plan.md`, `findings.md`, `progress.md`)
- [x] Documented Discovery Questions in `findings.md`
- [x] Initialized `claude.md` as the Project Constitution
- [ ] Establish JSON Data Schemas in `gemini.md` / `claude.md` for the Payload (Input/Output shapes)

### Phase 2: L - Link (Connectivity)
- [ ] Verify Supabase DB connection
- [ ] Verify Edge Function connectivity and `.env.local` keys
- [ ] Build minimal verification scripts in `tools/` to confirm connections are alive

### Phase 3: A - Architect (The 3-Layer Build)
- [ ] **Layer 1 (Architecture)**: Write technical SOPs in `architecture/` for Idea Capture Routing, Promotion Engine, and Playbook Formulation.
- [ ] **Layer 2 (Navigation)**: Build typescript Edge Functions as the reasoning layer.
- [ ] **Layer 3 (Tools)**: Build deterministic Python scripts in `tools/` for automated testing.

### Phase 4: S - Stylize (Refinement & UI)
- [ ] Refine the Dashboard UI (Next.js layout, mobile-first) using Stitch MCP for design guidance.
- [ ] Implement UI for processing Ideas, Projects, and Playbooks with the "Fight Club" aliveness aesthetic.
- [ ] Confirm layout responses on different screen sizes.

### Phase 5: T - Trigger (Deployment)
- [ ] Move logic to Vercel/Supabase production environment.
- [ ] Configure execution triggers (Pocket -> Edge Function logic).
- [ ] Finalize the Maintenance Log.

*Note: The original scaffolding phases are completed and logged in `PLAN.md`.*
