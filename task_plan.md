# Hero HQ Task Plan

## Phases & Goals

### Phase 1: Supabase Setup
- [ ] Scaffold all tables (captures, appointments, tasks, ideas, idea_notes, projects, project_findings, project_progress, playbooks, playbook_steps, playbook_findings, playbook_progress, debriefs)
- [ ] Set up `crazy_status` enum
- [ ] Create relationships (foreign keys)
- [ ] Create views: `portfolio`, `attention_allocation`
- [ ] Enable RLS on all tables using `auth.uid() = user_id`
- [ ] Set up Edge Functions scaffolding (`crazy-launcher`, `pocket-parse`, `today-brief`)
- [ ] Setup Debrief Trigger (Postgres function and trigger on `projects` and `playbooks`)
*Goal*: No frontend until database confirmed working.

### Phase 2: Auth
- [ ] Google OAuth via Supabase setup
- [ ] Session handling in Next.js middleware
*Goal*: Single user authenticated.

### Phase 3: Today Page and Home Cards
- [ ] Scaffold Next.js App Router project
- [ ] Build UI for Today page (six cards in 2-column grid)
- [ ] Wire up data reads only (confirm query layer works)
*Goal*: Confirm query layer works before building input flows.

### Phase 4: Capture Pipeline
- [ ] Pocket webhook integration
- [ ] Edge Function: `pocket-parse`
- [ ] Claude API integration for parse
- [ ] Supabase insert routing logic
*Goal*: The heartbeat of the system.

### Phase 5: CRAZY Launcher
- [ ] Full screen takeover UI (five-question modal)
- [ ] Edge Function: `crazy-launcher`
- [ ] Claude API generation (four documents)
- [ ] Supabase insert and status flip to 'activated'

### Phase 6: Debrief Intercept
- [ ] Phase completion trigger
- [ ] Full screen takeover modal (Debrief UI)
- [ ] Findings insert and status progression to 'debriefing' then back/forward

### Phase 7: Remaining Pages
- [ ] Projects (`/projects/[id]` - four-tab layout, collapsed constitution banner)
- [ ] Backlog
- [ ] Calendar
- [ ] Playbooks
- [ ] Portfolio (`/portfolio` - The Yawp Archive)

### Phase 8: Stylize
- [ ] Match UI design spec precisely (Stitch HTML pages)
- [ ] Animations, color language, typography
*Goal*: Tyler Durden / Fight Club aesthetic ("not optimization, aliveness")

### Phase 9: Deploy
- [ ] Vercel deployment
- [ ] Configure production environment variables
- [ ] Production Supabase project
- [ ] Domain setup
