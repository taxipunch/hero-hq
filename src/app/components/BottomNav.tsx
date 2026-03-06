'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Calendar, Briefcase, Settings } from 'lucide-react';
import CaptureModal from './CaptureModal';

interface BottomNavProps {
    userName: string;
}

export default function BottomNav({ userName }: BottomNavProps) {
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);

    return (
        <>
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/90 dark:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[40px] px-6 py-4 flex justify-between items-center z-40 card-shadow">
                <button
                    onClick={() => setIsCaptureOpen(true)}
                    className="w-12 h-12 rounded-2xl bg-card-blue flex items-center justify-center text-black hover:scale-105 transition-transform"
                >
                    <Zap size={24} className="fill-current" />
                </button>
                <Link href="/calendar" className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Calendar size={24} />
                </Link>
                <Link href="/portfolio" className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Briefcase size={24} />
                </Link>
                <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Settings size={24} />
                </button>
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-slate-800">
                    <span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
                </div>
            </nav>

            <CaptureModal isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
        </>
    );
}
