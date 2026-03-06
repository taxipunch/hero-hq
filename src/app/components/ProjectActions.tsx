'use client';

import { useState } from 'react';
import { Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CrazyModal from './CrazyModal';

interface ProjectActionsProps {
    itemId: string;
    itemType: 'project' | 'playbook';
    crazyStatus: string;
    currentPhase: string;
}

export default function ProjectActions({ itemId, itemType, crazyStatus, currentPhase }: ProjectActionsProps) {
    const [isCrazyOpen, setIsCrazyOpen] = useState(false);
    const [loadingDebrief, setLoadingDebrief] = useState(false);
    const router = useRouter();

    const handleDebrief = async () => {
        setLoadingDebrief(true);
        try {
            const res = await fetch('/api/debrief/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId, item_type: itemType, current_phase: currentPhase || '1' })
            });
            if (!res.ok) throw new Error('Failed to trigger debrief');

            // Redirect to home so the Debrief Modal pops up immediately
            router.push('/');
        } catch (e) {
            console.error(e);
            alert('Trigger failed');
            setLoadingDebrief(false);
        }
    };

    return (
        <>
            <div className="mt-6 flex gap-3">
                {crazyStatus === 'unlaunched' && (
                    <button
                        onClick={() => setIsCrazyOpen(true)}
                        className="flex-1 bg-white text-primary hover:bg-slate-100 transition-colors py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-black/10"
                    >
                        <Zap size={16} />
                        Initialize
                    </button>
                )}
                {crazyStatus === 'running' && (
                    <button
                        onClick={handleDebrief}
                        disabled={loadingDebrief}
                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-colors py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                        <Target size={16} />
                        {loadingDebrief ? 'Triggering...' : 'Debrief'}
                    </button>
                )}
            </div>

            <CrazyModal
                isOpen={isCrazyOpen}
                onClose={() => setIsCrazyOpen(false)}
                entityId={itemId}
                entityType={itemType}
            />
        </>
    );
}
