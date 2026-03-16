"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, Calendar, BarChart2, MoreHorizontal, Plus, Mic, Loader2, ArrowRight, Zap } from 'lucide-react';

interface OracleProps {
    userName: string;
    inboxCount: number;
    unlaunchedCount: number;
    debriefingCount: number;
    staleProjectsCount: number;
    nextAppointment: string;
    actionButtons: { label: string; href: string; icon: any }[];
}

export function OracleWidget({
    userName,
    inboxCount,
    unlaunchedCount,
    debriefingCount,
    staleProjectsCount,
    nextAppointment,
    actionButtons,
}: OracleProps) {
    const [briefing, setBriefing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // On load behavior
        async function loadBriefing() {
            try {
                const res = await fetch('/api/oracle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        isInitialLoad: true,
                        inboxCount,
                        unlaunchedCount,
                        debriefingCount,
                        staleProjectsCount,
                        nextAppointment
                    })
                });
                const data = await res.json();
                if (data.text) {
                    setBriefing(data.text);
                    setHistory(data.history || []);
                } else {
                    setBriefing("The system went down. That happens. Try again.");
                }
            } catch (e) {
                setBriefing("The system went down. That happens. Try again.");
            } finally {
                setIsLoading(false);
            }
        }
        loadBriefing();
    }, []);

    const handleFollowUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue;
        setInputValue("");
        setIsLoading(true);
        setBriefing("..."); // optimistic loading state

        try {
            const res = await fetch('/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isInitialLoad: false,
                    message,
                    history
                })
            });
            const data = await res.json();
            if (data.text) {
                setBriefing(data.text);
                setHistory(data.history || []);
            } else {
                console.error("Oracle Initial Load Error:", data);
                setBriefing(data.error || "The system went down. That happens. Try again.");
            }
        } catch (e: any) {
            console.error("Oracle Initial Load Exception:", e);
            setBriefing(`The system went down. Exception: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCapture = async () => {
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue;
        setInputValue("");
        setIsLoading(true);
        setBriefing("..."); // optimistic loading state

        try {
            const res = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw_text: message })
            });
            const data = await res.json();
            if (data.success) {
                const route = data.routed_to ? data.routed_to.toUpperCase() : 'INBOX';
                const summary = data.parsed?.summary || "Transcript captured.";
                setBriefing(`Capture successful. Routed to <span class="text-red-500 font-black">${route}</span>.<br/><br/><span class="opacity-70 text-xs">${summary}</span>`);
                setHistory(prev => [...prev, { role: 'user', content: "[Raw Transcript Inserted]" }, { role: 'assistant', content: `Routed to ${route}.` }]);
            } else {
                console.error("Capture Follow Up Error:", data);
                setBriefing(data.error || "The capture pipeline failed. Check your payload.");
            }
        } catch (e: any) {
            console.error("Capture Follow Up Exception:", e);
            setBriefing(`The capture pipeline crashed. Exception: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-card-dark p-6 rounded-[32px] text-white overflow-hidden relative card-shadow border border-slate-800 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Oracle</h2>
                <button className="bg-slate-800 p-2 rounded-full">
                    <MoreHorizontal size={16} />
                </button>
            </div>
            <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-red-500 p-0.5 overflow-hidden flex-shrink-0">
                    <img alt="Tyler Durden Oracle" className="w-full h-full object-cover rounded-full grayscale mix-blend-screen opacity-80" src="https://images.unsplash.com/photo-1506466010922-18260fd5cb4c?auto=format&fit=crop&w=150&h=150&q=80" />
                </div>
                <div className="space-y-3">
                    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed border border-slate-700">
                        {isLoading && !briefing ? (
                            <div className="flex items-center gap-2 font-medium">
                                <Loader2 size={16} className="animate-spin text-red-500" />
                                <span className="opacity-70">Calculating the collateral...</span>
                            </div>
                        ) : (
                            <span className="font-bold" dangerouslySetInnerHTML={{ __html: briefing || "" }} />
                        )}
                    </div>

                    {history.length <= 2 && actionButtons.length > 0 && !isLoading && (
                        <div className="flex flex-wrap gap-2">
                            {actionButtons.map((btn, i) => {
                                const IconComponent = btn.icon === 'Zap' ? Plus : ArrowRight;
                                if (i === 0) {
                                    return (
                                        <a key={i} href={btn.href} className="bg-white text-black text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-slate-200 hover:bg-slate-200 transition-colors">
                                            <IconComponent size={14} /> {btn.label}
                                        </a>
                                    );
                                } else {
                                    return (
                                        <a key={i} href={btn.href} className="bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700 hover:bg-slate-700 transition-colors">
                                            <IconComponent size={14} /> {btn.label}
                                        </a>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="relative mt-2 flex items-center gap-2">
                <form onSubmit={handleFollowUp} className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <button type="submit" className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center cursor-pointer disabled:opacity-50 hover:bg-slate-600 transition-colors" disabled={isLoading || !inputValue.trim()}>
                            <ArrowRight size={16} className="text-white" />
                        </button>
                    </div>
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-800 border-none rounded-full py-4 pl-14 pr-12 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 text-white disabled:opacity-50"
                        placeholder="Ask the Oracle or paste transcript..."
                        type="text"
                    />
                </form>
                <button
                    type="button"
                    onClick={handleCapture}
                    disabled={isLoading || !inputValue.trim()}
                    className="h-[52px] px-6 rounded-full bg-red-600 text-white font-bold text-[11px] tracking-widest uppercase flex items-center gap-2 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                    <Zap size={16} /> Parse
                </button>
            </div>
        </section>
    );
}
