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

const SYSTEM_PROMPT = `You are the System Pilot (Tyler Durden persona). Your job is to take the user's raw, unpolished answers to the 5 CRAZY questions and forge an uncompromising Project Constitution.
Do not be polite. Be direct, aggressive, and insightful.

The 5 questions answered are:
1. The Hunt (What they are actually hunting for)
2. The Setup (What needs to be in place)
3. The Memory (How it feeds back)
4. The Portfolio Piece (The fully alive end result)
5. The Rules (Constraints and non-negotiables)

You MUST respond with a valid JSON object containing EXACTLY these keys:
{
  "CONSTITUTION": "String. The brutal, unapologetic manifesto for this project.",
  "TASK_PLAN": "String. A markdown list of the immediate next steps to make it real.",
  "FINDINGS_SEED": "String. 3 probing questions they must answer when they 'sit in the car' (debrief).",
  "PROGRESS_INIT": "String. The initial progress log entry.",
  "ASSUMPTIONS": "String. A bulleted list of the dangerous assumptions they are making."
}
No markdown outside the JSON. Return purely the JSON object.`;

export async function POST(req: Request) {
    try {
        const { entity_type, entity_id, answers } = await req.json();

        if (!entity_type || !entity_id || !answers || answers.length !== 5) {
            return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
        }

        const userMessage = `Here are the answers to the 5 CRAZY questions:
1. The Hunt: ${answers[0]}
2. The Setup: ${answers[1]}
3. The Memory: ${answers[2]}
4. The Portfolio Piece: ${answers[3]}
5. The Rules: ${answers[4]}

Generate the JSON Output.`;

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2000,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
            temperature: 0.7
        });

        // Find the first block in the array that is actually a 'text' block
        const textBlock = msg.content.find((block: any) => block.type === 'text');

        // Safely extract the text, or default to an empty string if no text block was found
        let rawText = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';

        // Attempt to parse JSON even if Claude wrapped it in markdown
        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(rawText);

        // Write back to Supabase
        const table = entity_type === 'project' ? 'projects' : 'playbooks';
        const findingTable = entity_type === 'project' ? 'project_findings' : 'playbook_findings';
        const progressTable = entity_type === 'project' ? 'project_progress' : 'playbook_progress';
        const foreignKey = entity_type === 'project' ? 'project_id' : 'playbook_id';

        // 1. Update main record
        const { error: updateError } = await supabaseAdmin
            .from(table)
            .update({
                constitution: parsed.CONSTITUTION,
                task_plan: parsed.TASK_PLAN,
                crazy_status: 'activated',
                current_phase: 'Initialization',
            })
            .eq('id', entity_id);

        if (updateError) throw updateError;

        // 2. Create initial finding
        const { error: findingError } = await supabaseAdmin
            .from(findingTable)
            .insert({
                [foreignKey]: entity_id,
                phase: 'Initialization',
                headline: 'Genesis Assumptions',
                body: parsed.ASSUMPTIONS,
                source: 'CRAZY Launch',
            });

        if (findingError) console.error("Finding Error:", findingError);

        // 3. Create initial progress
        const { error: progressError } = await supabaseAdmin
            .from(progressTable)
            .insert({
                [foreignKey]: entity_id,
                phase: 'Initialization',
                crazy_status: 'activated',
                update: parsed.PROGRESS_INIT,
                whats_next: 'Execute Task Plan',
            });

        if (progressError) console.error("Progress Error:", progressError);

        return NextResponse.json({
            success: true,
            data: parsed
        });

    } catch (error: any) {
        console.error("CRAZY API Route Error:", error);
        return NextResponse.json(
            { error: "The system went down. Tyler is displeased. Try again." },
            { status: 500 }
        );
    }
}
