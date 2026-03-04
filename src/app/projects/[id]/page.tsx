import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, MoreHorizontal, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import ProjectTabs from './ProjectTabs';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (projectError || !project) {
        notFound();
    }

    // Fetch findings
    const { data: findings } = await supabase
        .from('project_findings')
        .select('*')
        .eq('project_id', resolvedParams.id)
        .order('created_at', { ascending: false });

    // Fetch progress
    const { data: progress } = await supabase
        .from('project_progress')
        .select('*')
        .eq('project_id', resolvedParams.id)
        .order('created_at', { ascending: false });

    return (
        <div className="relative flex min-h-screen max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden lg:border-x lg:border-primary/10 font-display pb-24">

            {/* Header Navigation */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
                <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate px-4">{project.name}</h1>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
                {/* Punchy Hero Card */}
                <div className="mt-4 p-6 rounded-3xl bg-gradient-to-br from-primary to-[#7a09b5] shadow-xl shadow-primary/20 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-24 h-24 bg-black/20 rounded-full blur-xl"></div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70">Phase {project.current_phase || '1'}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                                {project.crazy_status}
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold leading-tight text-white mb-2">{project.name}</h2>
                        <p className="text-sm text-white/80 leading-relaxed max-w-[90%]">{project.description}</p>

                        {/* Quick Actions */}
                        <div className="mt-6 flex gap-3">
                            {project.crazy_status === 'unlaunched' && (
                                <button className="flex-1 bg-white text-primary hover:bg-slate-100 transition-colors py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-black/10">
                                    <Zap size={16} />
                                    Initialize
                                </button>
                            )}
                            {project.crazy_status === 'running' && (
                                <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-colors py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-black/10">
                                    <Target size={16} />
                                    Debrief
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {project.constitution && (
                    <div className="mt-6 p-4 rounded-2xl bg-accent-coral/10 border-2 border-accent-coral/20">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent-coral mb-1">Core Directive</h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">{project.constitution}</p>
                    </div>
                )}

                <ProjectTabs
                    plan={project.task_plan}
                    findings={findings || []}
                    progress={progress || []}
                />
            </div>
        </div>
    );
}
