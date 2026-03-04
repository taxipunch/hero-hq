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
You are the intelligence engine for Hero HQ. 
Your job is to read the user's active database state and synthesize a razor-sharp, one-line "Today Brief" for the dashboard.
It should be punchy, highly relevant, and slightly intense. (e.g. "You have a sync with Sarah at 2 PM. The redesign project is sitting in debrief.")
Do not use greetings or pleasantries. Just the facts.
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

        // Gather context 
        const today = new Date().toISOString().split('T')[0];

        const [
            { data: appointments },
            { data: activeProjects },
            { data: debriefs }
        ] = await Promise.all([
            supabase.from('appointments').select('title, scheduled_at').gte('scheduled_at', today).order('scheduled_at').limit(3),
            supabase.from('projects').select('name, crazy_status').eq('status', 'active').limit(5),
            supabase.from('projects').select('name').eq('crazy_status', 'debriefing').limit(2)
        ]);

        const context = `
Current Active Projects: ${JSON.stringify(activeProjects)}
Upcoming Appointments: ${JSON.stringify(appointments)}
Items needing Debrief: ${JSON.stringify(debriefs)}
    `;

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
                max_tokens: 100,
                temperature: 0.5,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: "user", content: `Context:\n${context}\n\nGenerate the one-line brief.` }
                ]
            })
        });

        if (!claudeResponse.ok) {
            const errorData = await claudeResponse.text();
            throw new Error(`Claude API error: ${errorData}`);
        }

        const claudeData = await claudeResponse.json();
        const briefText = claudeData.content[0].text.replace(/^["']|["']$/g, '');

        return new Response(JSON.stringify({ success: true, briefing: briefText }), {
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
