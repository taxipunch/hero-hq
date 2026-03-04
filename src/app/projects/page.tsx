import { createClient } from '@/utils/supabase/server';
import { ChevronLeft, Folder } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectsPage() {
    const supabase = await createClient();

    // Fetch active projects (not yawped)
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description, crazy_status, current_phase')
        .neq('crazy_status', 'yawped')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 p-4 md:p-8 font-display pb-24">

            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-8 max-w-md mx-auto px-2">
                <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95">
                    <ChevronLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold tracking-tight">Active Projects</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-md mx-auto space-y-4 px-2">
                {projects && projects.length > 0 ? (
                    projects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`} className="block transition-transform active:scale-[0.98]">
                            <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors relative overflow-hidden">
                                {/* Theme accent bar based on phase or status */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.crazy_status === 'unlaunched' ? 'bg-slate-400' :
                                        project.crazy_status === 'activated' ? 'bg-card-blue' :
                                            project.crazy_status === 'running' ? 'bg-primary' :
                                                project.crazy_status === 'debriefing' ? 'bg-accent-teal' : 'bg-primary'
                                    }`}></div>

                                <div className="flex justify-between items-start mb-2 ml-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                                        Phase {project.current_phase || '1'} • {project.crazy_status}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold mb-1 ml-2">{project.name}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 ml-2">{project.description}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-12 text-center bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
                        <Folder size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Active Projects</h3>
                        <p className="text-sm font-medium">All projects are either yawped or you haven't captured any yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
