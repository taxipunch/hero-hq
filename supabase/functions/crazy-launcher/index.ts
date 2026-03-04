import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
You are the System Pilot for Hero HQ. You are executing a CRAZY launch.
The measure of success is not optimization. It is aliveness. Write like someone who has read Fight Club and means it.

The user will provide five answers to the CRAZY modal for a specific entity (Project, Playbook, Task, or Appointment).
Your job is to generate four markdown documents representing this entity's alive state:

1. constitution: Who is here, what is the hunt, what are the rules.
2. task_plan: Phases, sequence, what done looks like per phase.
3. findings_template: A starting headline/body for the findings document based on the setup.
4. progress_entry: The first "What happened" status entry to initialize progress.

Format your response as strict JSON:
{
  "constitution": "markdown string",
  "task_plan": "markdown string",
  "findings_template": "markdown string",
  "progress_entry": "markdown string"
}
`;

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Auth Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) throw new Error("Unauthorized");

        const { entity_type, entity_id, answers } = await req.json();

        if (!entity_type || !entity_id || !answers || answers.length !== 5) {
            throw new Error("Missing required parameters or incomplete answers array (requires 5).");
        }

        // Call Claude
        const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 1500,
                temperature: 0.7,
                system: SYSTEM_PROMPT,
                messages: [
                    {
                        role: "user",
                        content: `Entity Type: ${entity_type}\n\n1. The Hunt: ${answers[0]}\n2. The Setup: ${answers[1]}\n3. The Memory: ${answers[2]}\n4. The Portfolio Piece: ${answers[3]}\n5. The Rules: ${answers[4]}\n\nGenerate the four documents.`
                    }
                ]
            })
        });

        if (!claudeResponse.ok) {
            const errorData = await claudeResponse.text();
            throw new Error(`Claude API error: ${errorData}`);
        }

        const claudeData = await claudeResponse.json();
        let generatedDocs;
        try {
            // Find JSON block first in case of conversation wrappers
            const jsonMatch = claudeData.content[0].text.match(/\{[\s\S]*\}/);
            generatedDocs = JSON.parse(jsonMatch ? jsonMatch[0] : claudeData.content[0].text);
        } catch {
            throw new Error("Claude failed to return valid JSON.");
        }

        // Determine the correct table and column mappings
        let table = '';
        let findingsTable = '';
        let progressTable = '';
        let parentColumn = '';

        if (entity_type === 'project') {
            table = 'projects'; findingsTable = 'project_findings'; progressTable = 'project_progress'; parentColumn = 'project_id';
        } else if (entity_type === 'playbook') {
            table = 'playbooks'; findingsTable = 'playbook_findings'; progressTable = 'playbook_progress'; parentColumn = 'playbook_id';
        } else if (entity_type === 'appointment') {
            table = 'appointments';
            // Appointments don't have findings/progress tables natively in the spec, we just attach constitution/plan
        } else if (entity_type === 'task') {
            table = 'tasks';
        } else {
            throw new Error("Invalid entity type");
        }

        // 1. Update the parent entity with Constitution, Task Plan, and flip status to Activated
        const { error: updateError } = await supabase
            .from(table)
            .update({
                constitution: generatedDocs.constitution,
                task_plan: generatedDocs.task_plan,
                crazy_status: 'activated',
                last_crazy_run_at: new Date().toISOString()
            })
            .eq('id', entity_id)
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        // 2. Insert into Findings Table (if applicable)
        if (findingsTable) {
            await supabase.from(findingsTable).insert({
                user_id: user.id,
                [parentColumn]: entity_id,
                phase: 'Setup',
                headline: 'Initial Constitution',
                body: generatedDocs.findings_template,
                source: 'crazy_launcher'
            });
        }

        // 3. Insert into Progress Table (if applicable)
        if (progressTable) {
            await supabase.from(progressTable).insert({
                user_id: user.id,
                [parentColumn]: entity_id,
                phase: 'Activation',
                crazy_status: 'activated',
                update: generatedDocs.progress_entry,
                whats_next: 'Begin Phase 1'
            });
        }

        return new Response(JSON.stringify({ success: true, documents: generatedDocs }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
