import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { item_id, item_type, current_phase } = await req.json();

        if (!item_id || !item_type || !current_phase) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // 1. Update status to 'debriefing'
        const table = item_type === 'project' ? 'projects' : 'playbooks';
        const { error: updateError } = await supabaseAdmin
            .from(table)
            .update({ crazy_status: 'debriefing' })
            .eq('id', item_id);

        if (updateError) throw updateError;

        // 2. Insert Debrief record
        const { error: debriefError } = await supabaseAdmin
            .from('debriefs')
            .insert({
                item_type,
                item_id,
                phase_completed: current_phase,
            });

        if (debriefError) throw debriefError;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Debrief Trigger API Error:", e);
        return NextResponse.json({ error: "Failed to trigger debrief." }, { status: 500 });
    }
}
