'use client';

import { useState, useEffect } from 'react';
import DebriefModal from './DebriefModal';

interface PendingDebrief {
    id: string;
    item_type: string;
    item_id: string;
    phase_completed: string;
    itemName: string;
}

export default function DebriefCheck({ pending }: { pending: PendingDebrief | null }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (pending) {
            setIsOpen(true);
        }
    }, [pending]);

    if (!pending) return null;

    return (
        <DebriefModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            entityId={pending.item_id}
            entityType={pending.item_type}
            phaseCompleted={pending.phase_completed}
            itemName={pending.itemName}
            debriefId={pending.id}
        />
    );
}
