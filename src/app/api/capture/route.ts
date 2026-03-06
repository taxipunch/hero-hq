import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export async function POST(req: Request) {
    try {
        const { raw_text } = await req.json();

        if (!raw_text || raw_text.trim() === '') {
            return NextResponse.json({ error: "Empty capture." }, { status: 400 });
        }

        // We need user context to attribute these inserts correctly
        const authHeader = req.headers.get('Authorization') || req.headers.get('cookie');
        // Actually, since this is a Next.js route, let's just get the session via server client
        // wait, we are using supabaseAdmin. Let's get the user from the session properly,
        // but for now, we can just grab the first user if there's only one, or require auth.
        // The page is authenticated. Let's use the standard route handler client.
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Call Claude to parse
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: raw_text }],
            temperature: 0.2
        });

        let rawOutput = '';
        const firstBlock = msg.content[0];
        if (firstBlock.type === 'text') {
            rawOutput = firstBlock.text.trim();
        }
        if (rawOutput.startsWith('```json')) {
            rawOutput = rawOutput.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawOutput.startsWith('```')) {
            rawOutput = rawOutput.replace(/^```/, '').replace(/```$/, '').trim();
        }

        let parsed: any;
        try {
            parsed = JSON.parse(rawOutput);
        } catch {
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { entity_type: "unknown", summary: "Failed to parse JSON" };
        }

        // 2. Save raw capture first (now with user_id)
        const { data: captureData, error: captureError } = await supabaseAdmin
            .from('captures')
            .insert({
                user_id: user.id,
                raw_text,
                source: 'web_dashboard',
                ai_parsed: true,
                ai_summary: parsed.summary,
                ai_assumptions: parsed.assumptions,
            })
            .select('id')
            .single();

        if (captureError) {
            console.error("Capture DB Error:", captureError);
            return NextResponse.json({ error: "Failed to save raw capture." }, { status: 500 });
        }

        const captureId = captureData.id;

        // 3. Route based on entity_type
        let routedData: any = null;
        let table = '';

        switch (parsed.entity_type) {
            case 'appointment':
                table = 'appointments';
                routedData = {
                    user_id: user.id,
                    title: parsed.title,
                    capture_id: captureId,
                    scheduled_at: parsed.data?.scheduled_at,
                    contact_name: parsed.data?.contact_name,
                };
                break;
            case 'task':
                table = 'tasks';
                routedData = {
                    user_id: user.id,
                    title: parsed.title,
                    priority: parsed.data?.priority || 'normal',
                    capture_id: captureId,
                };
                break;
            case 'idea':
                table = 'ideas';
                routedData = {
                    user_id: user.id,
                    title: parsed.title,
                    body: raw_text,
                    capture_id: captureId,
                };
                break;
            case 'playbook':
                table = 'playbooks';
                routedData = {
                    user_id: user.id,
                    title: parsed.title,
                };
                break;
        }

        if (table && routedData) {
            const { error: routeError } = await supabaseAdmin
                .from(table)
                .insert(routedData);

            if (routeError) {
                console.error("Routing Error:", routeError);
                throw routeError;
            }

            // Auto-resolve capture if successfully routed
            await supabaseAdmin
                .from('captures')
                .update({ resolved_at: new Date().toISOString() })
                .eq('id', captureId);
        }

        // Return the parsed data
        return NextResponse.json({
            success: true,
            capture_id: captureId,
            routed_to: table || 'captures',
            parsed: parsed
        });

    } catch (error: any) {
        console.error("Capture API Error:", error);
        return NextResponse.json(
            { error: "The system went down. Tyler is displeased. Try again." },
            { status: 500 }
        );
    }
}
