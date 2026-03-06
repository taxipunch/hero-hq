'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Loader2, Check, RefreshCcw } from 'lucide-react';

interface CaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CaptureModal({ isOpen, onClose }: CaptureModalProps) {
    const [step, setStep] = useState<'input' | 'processing' | 'review' | 'confirming'>('input');
    const [rawText, setRawText] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Parsed results
    const [captureId, setCaptureId] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [selectedRoute, setSelectedRoute] = useState<string>('');

    const router = useRouter();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen && step === 'input') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, step]);

    if (!isOpen) return null;

    const handleReset = () => {
        setStep('input');
        setRawText('');
        setErrorMsg(null);
        setCaptureId(null);
        setParsedData(null);
        setSelectedRoute('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!rawText.trim()) return;

        setStep('processing');
        setErrorMsg(null);

        try {
            const res = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw_text: rawText })
            });
            const data = await res.json();

            if (!res.ok || data.error) throw new Error(data.error || 'Parsing failed.');

            setCaptureId(data.capture_id);
            setParsedData(data.parsed);
            setSelectedRoute(data.parsed.route);
            setStep('review');
        } catch (e: any) {
            setErrorMsg(e.message || "The system rejected the input.");
            setStep('input');
        }
    };

    const handleConfirm = async () => {
        setStep('confirming');
        setErrorMsg(null);

        try {
            const res = await fetch('/api/capture/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    capture_id: captureId,
                    route: selectedRoute,
                    parsed_data: parsedData
                })
            });
            const data = await res.json();

            if (!res.ok || data.error) throw new Error(data.error || 'Confirmation failed.');

            handleClose();
            // Navigate if possible (e.g. to projects/id or playbooks/id)
            if (data.table === 'projects' || data.table === 'playbooks') {
                router.push(`/${data.table}/${data.id}`);
            } else {
                router.push('/backlog');
            }
        } catch (e: any) {
            setErrorMsg(e.message || "Failed to commit record.");
            setStep('review');
        }
    };

    const ROUTES = ['tasks', 'appointments', 'ideas', 'playbooks', 'project_findings', 'playbook_findings'];

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col font-['Inter'] text-white">
            <header className="p-6 flex justify-between items-center">
                <div className="w-12 h-1.5 rounded-full bg-primary" />
                <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                {step === 'processing' || step === 'confirming' ? (
                    <div className="text-center space-y-6 animate-pulse">
                        <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                        <h2 className="text-3xl tracking-tighter uppercase font-bold text-white">
                            {step === 'processing' ? 'Calculating vector...' : 'Committing to lattice...'}
                        </h2>
                    </div>
                ) : step === 'review' && parsedData ? (
                    <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <div>
                            <span className="text-primary text-sm font-bold tracking-widest uppercase mb-2 block">
                                Target Coordinates Acquired
                            </span>
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{parsedData.title}</h2>
                        </div>

                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-6">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Summary</h3>
                                <p className="text-sm text-slate-200 leading-relaxed">{parsedData.summary}</p>
                            </div>

                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Assumptions</h3>
                                <p className="text-sm text-accent-coral/80 whitespace-pre-wrap">{parsedData.assumptions || 'None explicitly stated.'}</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1 font-bold">Routing Destination</h3>
                                <select
                                    className="bg-black border border-slate-700 rounded-xl p-3 text-white focus:border-primary outline-none uppercase font-bold tracking-wider text-sm"
                                    value={selectedRoute}
                                    onChange={e => setSelectedRoute(e.target.value)}
                                >
                                    {ROUTES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <span className="text-red-500 text-sm font-bold flex-1">{errorMsg}</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep('input')}
                                    className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest text-xs flex items-center gap-2"
                                >
                                    <RefreshCcw size={16} /> Edit
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                                >
                                    Confirm <Check size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300 flex flex-col h-[60vh]">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-slate-300">Blurt it out.</h1>
                        </div>

                        <textarea
                            ref={inputRef}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Ideas, tasks, brain dumps... the system will sort it."
                            className="flex-grow w-full bg-transparent border-none resize-none outline-none text-2xl leading-relaxed placeholder:text-slate-700/50 text-white transition-colors"
                        />

                        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                            <div className="text-red-500 text-sm font-bold flex-1 pr-4">
                                {errorMsg && <span>{errorMsg}</span>}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={rawText.trim().length === 0}
                                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                            >
                                Process <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
