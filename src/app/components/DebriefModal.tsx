'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';

export default function DebriefModal({
    isOpen,
    onClose,
    entityId,
    entityType,
    phaseCompleted,
    itemName,
    debriefId,
}: {
    isOpen: boolean;
    onClose: () => void;
    entityId: string;
    entityType: string;
    phaseCompleted: string;
    itemName: string;
    debriefId?: string;
}) {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    if (!isOpen) return null;

    const handleSubmit = async (skipped: boolean = false) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Unauthenticated');

            if (debriefId) {
                const { error: dErr } = await supabase
                    .from('debriefs')
                    .update({
                        response: skipped ? null : response,
                        source: skipped ? 'skipped' : 'typed',
                        skipped,
                    })
                    .eq('id', debriefId);
                if (dErr) throw dErr;
            } else {
                const { error } = await supabase
                    .from('debriefs')
                    .update({
                        response: skipped ? null : response,
                        source: skipped ? 'skipped' : 'typed',
                        skipped,
                    })
                    .eq('item_id', entityId)
                    .eq('phase_completed', phaseCompleted)
                    .is('response', null)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error) throw error;
            }

            // Extract insights to finding tables (simple insert for now)
            if (!skipped && response.trim() !== '') {
                const findingsTable = entityType === 'project' ? 'project_findings' : 'playbook_findings';
                const parentCol = entityType === 'project' ? 'project_id' : 'playbook_id';

                await supabase.from(findingsTable).insert({
                    user_id: user.id,
                    [parentCol]: entityId,
                    phase: phaseCompleted,
                    headline: `Debrief Insight: ${phaseCompleted}`,
                    body: response,
                    source: 'debrief_prompt',
                });
            }

            // Revert crazy_status to 'running'
            const entityTable = entityType === 'project' ? 'projects' : 'playbooks';
            await supabase.from(entityTable).update({
                crazy_status: 'running',
            }).eq('id', entityId);

            // Refresh page to clear the modal and hit the DB securely
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Failed to submit debrief.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col font-['Inter'] text-white">
            <header className="p-6 flex items-center border-b border-[#222]">
                <button onClick={() => onClose()} className="p-2 text-gray-400 hover:text-white mr-4">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Before you drive away.</h2>
                    <p className="text-sm text-gray-500">{itemName} — {phaseCompleted}</p>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <div className="w-full space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-4 text-lg text-gray-300">
                        <p>1. What did you expect to happen vs what actually happened?</p>
                        <p>2. What is the one thing you know now that you didn't know when you started?</p>
                        <p>3. If you had to run this exact phase again tomorrow, what would you change?</p>
                    </div>

                    <div className="pt-4 space-y-4 w-full flex flex-col items-center">
                        <button
                            className="w-full bg-[#135bec] hover:bg-[#104abf] transition-colors py-4 rounded-xl font-medium tracking-wide flex justify-center items-center gap-2"
                            onClick={() => alert("Deep linking to Pocket app. (App scheme required)")}
                        >
                            🎙 Open Pocket
                        </button>

                        <div className="relative w-full">
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Type it here..."
                                className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#555] rounded-xl p-4 min-h-32 resize-y outline-none"
                            />
                            {response.trim().length > 0 && (
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                    className="absolute bottom-4 right-4 bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                            className="text-xs text-gray-600 mt-8 underline hover:text-gray-400"
                        >
                            skip — I'll lose this learning
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
