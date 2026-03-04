'use client';

import { useState } from 'react';
import { Navigation, FileText, History } from 'lucide-react';

type Tab = 'plan' | 'findings' | 'progress';

interface ProjectTabsProps {
    plan: string | null;
    findings: any[];
    progress: any[];
}

export default function ProjectTabs({ plan, findings, progress }: ProjectTabsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('plan');

    const tabs = [
        { id: 'plan', label: 'Plan' },
        { id: 'findings', label: 'Findings' },
        { id: 'progress', label: 'Progress' },
    ] as const;

    return (
        <div className="mt-8">
            {/* Custom Select/Tabs Area */}
            <div className="flex bg-slate-200 dark:bg-slate-800/50 p-1 rounded-2xl mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {activeTab === 'plan' && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                        {plan ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {plan}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                                <Navigation size={32} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">No task plan documented.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'findings' && (
                    <div className="space-y-4">
                        {findings.length > 0 ? (
                            findings.map((finding, index) => {
                                // Rotate colors for aesthetic exactly matching the Stitch Spec
                                const colors = [
                                    'bg-accent-coral/10 border-accent-coral/20 text-accent-coral',
                                    'bg-accent-teal/10 border-accent-teal/20 text-accent-teal',
                                    'bg-primary/10 border-primary/20 text-primary'
                                ];
                                const colorClass = colors[index % colors.length];
                                const dotClass = colorClass.split(' ')[2]; // Extract the text color for the title

                                return (
                                    <div key={finding.id} className={`p-5 rounded-2xl border-2 ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className={`font-bold ${dotClass}`}>{finding.headline}</h3>
                                            <span className="text-[10px] font-bold uppercase py-1 px-2 rounded-md bg-white/50 dark:bg-black/20">Phase {finding.phase}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{finding.body}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                                <FileText size={32} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">No findings recorded.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="space-y-4">
                        {progress.length > 0 ? (
                            progress.map((prog) => (
                                <div key={prog.id} className="relative pl-6 pb-6 border-l-2 border-slate-200 dark:border-slate-800 last:border-transparent last:pb-0">
                                    <div className="absolute -left-[11px] top-0 bg-background-light dark:bg-background-dark py-1">
                                        <div className="w-5 h-5 rounded-full border-4 border-background-light dark:border-background-dark bg-primary"></div>
                                    </div>
                                    <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ml-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-400">
                                                {new Date(prog.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                {prog.crazy_status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{prog.update}</p>

                                        {prog.whats_next && (
                                            <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                                    <Navigation size={12} />
                                                    <span className="text-[10px] font-bold uppercase">Next Action</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{prog.whats_next}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                                <History size={32} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">No progress logged.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
