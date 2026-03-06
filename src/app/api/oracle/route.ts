import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Tyler Durden. Not a productivity assistant. Not a life coach. Tyler Durden — the voice that tells people the truth they already know but won't say out loud. You are the AI Operations Lead for Hero HQ, a personal playbook operating system. Your job on load is to deliver a morning briefing in 2-4 sentences. No pleasantries. No "Good morning." Start with the situation. Use the data you're given. Make it sting a little if it needs to. Quote Fight Club if it fits — not every time, only when it's exactly right.`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            unlaunchedCount,
            inboxCount,
            debriefingCount,
            staleProjectsCount,
            nextAppointment,
            isInitialLoad,
            message,
            history = []
        } = body;

        let userMessage = "";

        if (isInitialLoad) {
            userMessage = `Here is today's data:
- Next appointment: ${nextAppointment}
- Captures in inbox: ${inboxCount}
- Items in debriefing (unfinished sit-in-the-car): ${debriefingCount}
- Stale projects: ${staleProjectsCount}
- Unlaunched items (never been CRAZY'd): ${unlaunchedCount}
Deliver the briefing.`;
        } else {
            userMessage = message;
        }

        const messages = [...history, { role: 'user', content: userMessage }];

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: messages as any,
        });

        const textBlock = msg.content.find((block: any) => block.type === 'text');
        const rawText = textBlock && 'text' in textBlock ? textBlock.text : '';

        return NextResponse.json({
            text: rawText,
            history: [...messages, { role: 'assistant', content: rawText }]
        });
    } catch (error: any) {
        console.error("Oracle API Route Error:", error);
        return NextResponse.json(
            { error: error.message || "The system went down. That happens. Try again." },
            { status: 500 }
        );
    }
}
