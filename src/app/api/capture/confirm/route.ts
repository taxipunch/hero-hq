import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { capture_id, route, parsed_data } = await req.json();

        if (!capture_id || !route || !parsed_data) {
            return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
        }

        let insertPayload: any = {};
        let newRecordId: string | null = null;

        // Map parsed data to corresponding table structure
        if (route === 'tasks') {
            insertPayload = {
                title: parsed_data.title,
                status: 'active',
                crazy_status: 'unlaunched',
                capture_id: capture_id,
                due_date: parsed_data.extracted_date || null
            };
        } else if (route === 'appointments') {
            insertPayload = {
                title: parsed_data.title,
                contact_name: parsed_data.extracted_person || null,
                scheduled_at: parsed_data.extracted_date || new Date().toISOString(),
                status: 'upcoming',
                crazy_status: 'unlaunched',
                capture_id: capture_id
            };
        } else if (route === 'ideas') {
            insertPayload = {
                title: parsed_data.title,
                body: parsed_data.summary + '\n\nAssumptions:\n' + parsed_data.assumptions,
                stage: 'raw',
                capture_id: capture_id
            };
        } else if (route === 'playbooks') {
            insertPayload = {
                title: parsed_data.title,
                crazy_status: 'unlaunched',
                current_phase: 'Drafting'
            };
        }

        // Insert into target table
        const { data: routeData, error: routeError } = await supabaseAdmin
            .from(route)
            .insert(insertPayload)
            .select('id')
            .single();

        if (routeError) throw routeError;
        newRecordId = routeData.id;

        // Special case: Playbooks need an initial step
        if (route === 'playbooks') {
            await supabaseAdmin.from('playbook_steps').insert({
                playbook_id: newRecordId,
                order_index: 1,
                body: parsed_data.summary
            });
        }

        // Mark capture as resolved
        await supabaseAdmin
            .from('captures')
            .update({ resolved_at: new Date().toISOString() })
            .eq('id', capture_id);

        return NextResponse.json({ success: true, id: newRecordId, table: route });

    } catch (e: any) {
        console.error("Capture Confirm Route Error:", e);
        return NextResponse.json({ error: e.message || "Confirmation failed." }, { status: 500 });
    }
}
