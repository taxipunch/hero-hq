import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Access Anthropic API (Needs to be added to Supabase project secrets: ANTHROPIC_API_KEY)
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
You are the intelligence engine for Hero HQ, a personal dashboard.
Your job is to parse raw transcripts (from voice or text) and route them to the correct database table.

# Routing Rules
1. Date + time + person -> Route to "appointments"
2. Action verb + no date -> Route to "tasks"
3. Idea language ('what if...', 'I wonder...') -> Route to "ideas" (stage: raw)
4. Process language ('every time I do X...') -> Route to "playbooks" (new stub)
5. Debrief content (post-meeting reflection) -> Route to "project_findings" (if project-related) or "playbook_findings" (if playbook-related). If not clearly linked, route to "captures" with a summary.

You must output valid JSON matching this schema:
{
  "entity_type": "appointment" | "task" | "idea" | "playbook" | "finding" | "unknown",
  "title": "A short, actionable title",
  "summary": "AI summary of the raw text",
  "assumptions": "Any assumptions you made during parsing",
  "data": {
    // For appointment: { "scheduled_at": "ISO string", "contact_name": "string", "duration_minutes": 60 }
    // For task: { "priority": "high|normal|low" }
    // For finding: { "headline": "string" }
  }
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
        if (!authHeader) {
            throw new Error("Missing Authorization header");
        }
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        const { raw_text, source } = await req.json();

        if (!raw_text) {
            throw new Error("Missing raw_text parameter");
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
                max_tokens: 1024,
                temperature: 0,
                system: SYSTEM_PROMPT,
                messages: [
                    {
                        role: "user",
                        content: `Parse this transcript:\n\n${raw_text}`
                    }
                ]
            })
        });

        if (!claudeResponse.ok) {
            const errorData = await claudeResponse.text();
            throw new Error(`Claude API error: ${errorData}`);
        }

        const claudeData = await claudeResponse.json();
        let parsedResult;
        try {
            parsedResult = JSON.parse(claudeData.content[0].text);
        } catch {
            // Fallback if Claude didn't return pure JSON
            const jsonMatch = claudeData.content[0].text.match(/\{[\s\S]*\}/);
            parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { entity_type: "unknown", summary: "Failed to parse JSON" };
        }

        // 1. Always insert into captures table first to get the capture_id
        const { data: captureData, error: captureError } = await supabase
            .from('captures')
            .insert({
                user_id: user.id,
                raw_text,
                source: source || 'unknown',
                ai_parsed: true,
                ai_summary: parsedResult.summary,
                ai_assumptions: parsedResult.assumptions,
            })
            .select('id')
            .single();

        if (captureError) throw captureError;
        const capture_id = captureData.id;

        // 2. Route based on entity_type
        let routedData = null;
        let table = '';

        switch (parsedResult.entity_type) {
            case 'appointment':
                table = 'appointments';
                routedData = {
                    user_id: user.id,
                    title: parsedResult.title,
                    capture_id,
                    scheduled_at: parsedResult.data?.scheduled_at,
                    contact_name: parsedResult.data?.contact_name,
                };
                break;
            case 'task':
                table = 'tasks';
                routedData = {
                    user_id: user.id,
                    title: parsedResult.title,
                    priority: parsedResult.data?.priority || 'normal',
                    capture_id,
                };
                break;
            case 'idea':
                table = 'ideas';
                routedData = {
                    user_id: user.id,
                    title: parsedResult.title,
                    body: raw_text,
                    capture_id,
                };
                break;
            case 'playbook':
                table = 'playbooks';
                routedData = {
                    user_id: user.id,
                    title: parsedResult.title,
                };
                break;
            // Note: Full finding routing requires project_id detection, skipping auto-route for now
        }

        if (table && routedData) {
            const { error: routeError } = await supabase
                .from(table)
                .insert(routedData);

            if (routeError) throw routeError;

            // Auto-resolve capture if successfully routed
            await supabase
                .from('captures')
                .update({ resolved_at: new Date().toISOString() })
                .eq('id', capture_id);
        }

        return new Response(JSON.stringify({ success: true, capture_id, routed_to: table }), {
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
