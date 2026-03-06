import { createClient } from '@/utils/supabase/server';
import { ChevronLeft, Zap, Orbit } from 'lucide-react';
import Link from 'next/link';

export default async function TodayAgendaPage() {
    const supabase = await createClient();

    // Fetch active next actions
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .in('crazy_status', ['activated', 'running'])
        .order('created_at', { ascending: false });

    // Group tasks by domain/project
    const groupedTasks = (tasks || []).reduce((acc: any, task: any) => {
        const group = task.domain || 'Uncategorized';
        if (!acc[group]) acc[group] = [];
        acc[group].push(task);
        return acc;
    }, {});

    // Fetch Vault item
    // First try raw ideas
    let vaultItem = null;
    const { data: rawIdeas } = await supabase
        .from('ideas')
        .select('id, title, body, domain, created_at')
        .eq('stage', 'raw')
        .limit(20);

    if (rawIdeas && rawIdeas.length > 0) {
        // Pick one at random
        const randomIdea = rawIdeas[Math.floor(Math.random() * rawIdeas.length)];
        vaultItem = {
            id: randomIdea.id,
            title: randomIdea.title,
            body: randomIdea.body,
            domain: randomIdea.domain,
            type: 'idea'
        };
    } else {
        // Fallback to unlaunched tasks
        const { data: unlaunchedTasks } = await supabase
            .from('tasks')
            .select('id, title, task_plan, domain, created_at')
            .eq('crazy_status', 'unlaunched')
            .limit(20);

        if (unlaunchedTasks && unlaunchedTasks.length > 0) {
            const randomTask = unlaunchedTasks[Math.floor(Math.random() * unlaunchedTasks.length)];
            vaultItem = {
                id: randomTask.id,
                title: randomTask.title,
                body: randomTask.task_plan,
                domain: randomTask.domain,
                type: 'task'
            };
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 font-display pb-24">
            <nav className="mb-8 max-w-2xl mx-auto">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                    <ChevronLeft size={16} className="mr-1" />
                    HQ
                </Link>
            </nav>

            <header className="mb-10 max-w-2xl mx-auto">
                <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Today</h1>
                <p className="text-slate-500 font-medium">The point of power is always in the present moment.</p>
            </header>

            <main className="max-w-2xl mx-auto space-y-12">
                {/* Vault Section */}
                {vaultItem && (
                    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <Orbit size={18} className="text-primary" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-primary opacity-90">From The Vault</h2>
                        </div>
                        <div className="pl-4 border-l-2 border-slate-800 ml-1 mt-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-1 rounded inline-block mb-2">
                                {vaultItem.domain || 'UNKNOWN'} • {vaultItem.type}
                            </span>
                            <h3 className="text-xl font-bold leading-tight mb-2 text-slate-100">{vaultItem.title}</h3>
                            {vaultItem.body && <p className="text-sm text-slate-400 italic">"{vaultItem.body}"</p>}
                        </div>
                    </section>
                )}

                {/* Next Actions Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
                        <Zap size={20} className="text-white" />
                        <h2 className="text-lg font-black uppercase tracking-widest text-white">Next Actions</h2>
                    </div>

                    {Object.keys(groupedTasks).length > 0 ? (
                        <div className="space-y-8">
                            {Object.keys(groupedTasks).map((domain) => (
                                <div key={domain} className="space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">{domain}</h3>
                                    <div className="space-y-2">
                                        {groupedTasks[domain].map((task: any) => (
                                            <div key={task.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-4 rounded-2xl flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-700 group-hover:border-primary transition-colors cursor-pointer shrink-0"></div>
                                                    <span className="font-semibold text-slate-200">{task.title}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-black px-2 py-1 rounded border border-slate-800 text-slate-400">
                                                    {task.crazy_status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                            <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest mb-1">Clear Horizon</h3>
                            <p className="text-sm font-medium text-slate-600">No active tasks on the ledger.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
