'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ArrowRight, Check } from 'lucide-react';

const QUESTIONS = [
    {
        title: 'The Hunt',
        placeholder: 'Not what you want to achieve. What this version of you is actually hunting for.',
    },
    {
        title: 'The Setup',
        placeholder: 'People, tools, conditions. What has to be in place for this to be real.',
    },
    {
        title: 'The Memory',
        placeholder: 'How does this feed back into the system.',
    },
    {
        title: 'The Portfolio Piece',
        placeholder: 'Not optimal. Not impressive. Fully alive.',
    },
    {
        title: 'The Rules',
        placeholder: 'Tone, constraints, what this character absolutely does not do.',
    },
];

export default function CrazyModal({
    isOpen,
    onClose,
    entityId,
    entityType,
}: {
    isOpen: boolean;
    onClose: () => void;
    entityId: string;
    entityType: string;
}) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    if (!isOpen) return null;

    const handleNext = async () => {
        if (step < 4) {
            setStep((prev) => prev + 1);
        } else {
            setLoading(true);

            const { data: session } = await supabase.auth.getSession();

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/crazy-launcher`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.session?.access_token}`,
                        },
                        body: JSON.stringify({
                            entity_type: entityType,
                            entity_id: entityId,
                            answers: answers,
                        }),
                    }
                );

                if (!response.ok) throw new Error('Failed to launch');

                // Refresh page or trigger callback upon success
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert('Failed to execute CRAZY launch. See console.');
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center font-['Inter']">
                <div className="text-center space-y-6 animate-pulse">
                    <h2 className="text-3xl tracking-tighter text-white uppercase font-bold">"This is your life and it's ending one minute at a time."</h2>
                    <p className="text-gray-500 uppercase tracking-widest text-sm">Generating Constitution...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col font-['Inter'] text-white">
            {/* Header */}
            <header className="p-6 flex justify-between items-center border-b border-[#222]">
                <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-12 rounded-full transition-colors ${i <= step ? 'bg-[#135bec]' : 'bg-[#333]'
                                }`}
                        />
                    ))}
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </header>

            {/* Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div>
                        <span className="text-[#135bec] text-sm font-bold tracking-widest uppercase mb-4 block">
                            Question {step + 1} of 5
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight mb-4">{QUESTIONS[step].title}</h1>
                    </div>

                    <textarea
                        autoFocus
                        value={answers[step]}
                        onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[step] = e.target.value;
                            setAnswers(newAnswers);
                        }}
                        placeholder={QUESTIONS[step].placeholder}
                        className="w-full h-64 bg-transparent border-b-2 border-[#333] focus:border-[#135bec] resize-none outline-none text-2xl leading-relaxed placeholder:text-gray-700 transition-colors"
                    />

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleNext}
                            disabled={answers[step].trim().length === 0}
                            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                        >
                            {step === 4 ? 'Launch' : 'Next'}
                            {step === 4 ? <Check size={20} /> : <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
