# Hero HQ — Project Constitution

## Overview
Hero HQ is a personal dashboard for a single user. It is a CRAZY launcher — a system that walks the user through a deliberate activation process for every item they engage with, turning tasks, projects, appointments, and playbooks into portfolio pieces.

**Philosophical Core:**
The measure of success is not optimization. It is aliveness. Every interaction should feel like it was designed by someone who has read Fight Club and means it.

## Architectural Invariants
1. **Edge Functions for all AI calls:** Never call Claude API client-side.
2. **Supabase RLS on all tables:** Row Level Security must be enabled from day one. Single user authenticated via Google OAuth.
3. **Stateless AI:** The Claude API generates content, but Supabase stores everything.
4. **CRAZY Server-side Only:** All CRAZY status transitions are processed server-side.

## Behavioral Rules
1. **CRAZY Status Lifecycle:** `unlaunched` -> `activated` -> `running` -> `debriefing` -> `running` -> `debriefing` -> `yawped`.
2. **Debrief Trigger Logic:** Triggers automatically when any phase is marked complete. Moves status to 'debriefing'. Needs a Postgres function and trigger.
3. **Capture Routing Logic:**
   - Date + time + person -> `appointments`
   - Action verb + no date -> `tasks`
   - Idea language ('what if...', 'I wonder...') -> `ideas` (stage: raw)
   - Process language ('every time I do X...') -> `playbooks` (new stub)
   - Debrief content (post-meeting reflection) -> `project_findings` or `playbook_findings`
   - Mixed -> Multiple records, one `capture_id`

## Data Schema

### Enums
```sql
CREATE TYPE crazy_status AS ENUM (
  'unlaunched', 'activated', 'running', 'debriefing', 'yawped'
);
```

### Tables
(All tables must have RLS enabled, and use `user_id uuid references auth.users`)

- **captures**: `id` (uuid pk), `raw_text` (text), `source` (text), `ai_parsed` (boolean), `ai_summary` (text), `ai_assumptions` (text), `created_at` (timestamp), `resolved_at` (timestamp)
- **appointments**: `id` (uuid pk), `title` (text), `contact_name` (text), `contact_type` (text), `scheduled_at` (timestamp), `duration_minutes` (integer), `location` (text), `status` (text), `crazy_status` (enum), `constitution` (text), `task_plan` (text), `last_crazy_run_at` (timestamp), `capture_id` (uuid fk), `created_at` (timestamp)
- **tasks**: `id` (uuid pk), `title` (text), `due_date` (date), `priority` (text), `status` (text), `crazy_status` (enum), `constitution` (text), `task_plan` (text), `domain` (text), `capture_id` (uuid fk), `completed_at` (timestamp), `created_at` (timestamp)
- **ideas**: `id` (uuid pk), `title` (text), `body` (text), `domain` (text), `stage` (text), `priority` (text), `last_surfaced_at` (timestamp), `surface_count` (integer), `capture_id` (uuid fk), `promoted_to_project_id` (uuid fk), `created_at` (timestamp), `updated_at` (timestamp)
- **idea_notes**: `id` (uuid pk), `idea_id` (uuid fk), `body` (text), `created_at` (timestamp)
- **projects**: `id` (uuid pk), `name` (text), `description` (text), `domain` (text), `status` (text), `crazy_status` (enum), `current_phase` (text), `constitution` (text), `task_plan` (text), `next_action` (text), `attention_invested_hours` (float), `outcome_notes` (text), `last_activity_at` (timestamp), `last_crazy_run_at` (timestamp), `stale_threshold_days` (integer), `originated_from_idea_id` (uuid fk), `created_at` (timestamp), `completed_at` (timestamp)
- **project_findings**: `id` (uuid pk), `project_id` (uuid fk), `phase` (text), `headline` (text), `body` (text), `source` (text), `capture_id` (uuid fk), `created_at` (timestamp)
- **project_progress**: `id` (uuid pk), `project_id` (uuid fk), `phase` (text), `crazy_status` (text), `update` (text), `whats_next` (text), `created_at` (timestamp)
- **playbooks**: `id` (uuid pk), `title` (text), `domain` (text), `trigger` (text), `crazy_status` (enum), `mastery_status` (text), `constitution` (text), `task_plan` (text), `current_phase` (text), `use_count` (integer), `last_used_at` (timestamp), `last_crazy_run_at` (timestamp), `created_at` (timestamp), `updated_at` (timestamp)
- **playbook_steps**: `id` (uuid pk), `playbook_id` (uuid fk), `order_index` (integer), `body` (text), `is_critical` (boolean), `created_at` (timestamp), `updated_at` (timestamp)
- **playbook_findings**: matching structure to project_findings + run_number
- **playbook_progress**: matching structure to project_progress + run_number
- **debriefs**: `id` (uuid pk), `item_type` (text), `item_id` (uuid), `phase_completed` (text), `prompt_shown_at` (timestamp), `response` (text), `source` (text), `skipped` (boolean), `created_at` (timestamp)

### Edge Functions
- `/functions/crazy-launcher`
- `/functions/pocket-parse`
- `/functions/today-brief`

### Views
- `portfolio`
- `attention_allocation`
