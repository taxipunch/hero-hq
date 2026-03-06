import { createClient } from '@/utils/supabase/server';
import { ListTodo, ChevronLeft, Inbox } from 'lucide-react';
import Link from 'next/link';

export default async function BacklogPage() {
    const supabase = await createClient();

    // Fetch unlaunched tasks
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('crazy_status', 'unlaunched')
        .order('created_at', { ascending: false });

    // Fetch raw ideas
    const { data: ideas } = await supabase
        .from('ideas')
        .select('*')
        .eq('stage', 'raw')
        .order('created_at', { ascending: false });

    const backlogItems = [
        ...(tasks || []).map((t: any) => ({ id: t.id, title: t.title, type: 'task', domain: t.domain, date: t.created_at })),
        ...(ideas || []).map((i: any) => ({ id: i.id, title: i.title, type: 'idea', domain: i.domain, date: i.created_at }))
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 font-display">
            {/* Navigation */}
            <nav className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white transition-colors text-sm">
                    <ChevronLeft size={16} className="mr-1" />
                    Back to HQ
                </Link>
            </nav>

            <header className="mb-12 flex items-center gap-4 border-b border-[#333] pb-6">
                <div className="h-16 w-16 bg-[#111] border border-[#333] rounded-2xl flex items-center justify-center">
                    <Inbox size={28} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white mb-1">Backlog</h1>
                    <p className="text-gray-400 font-medium">Captured but unactivated potential.</p>
                </div>
            </header>

            <div className="max-w-4xl">
                {backlogItems.length > 0 ? (
                    <div className="space-y-4">
                        {backlogItems.map((item) => (
                            <div key={item.id} className="bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-2xl p-5 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-10 rounded-full bg-[#111] group-hover:bg-green-500 transition-colors"></div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono uppercase bg-[#111] border border-[#333] px-1.5 py-0.5 rounded text-gray-400">
                                                {item.type}
                                            </span>
                                            {item.domain && (
                                                <span className="text-[10px] font-mono uppercase text-gray-500">
                                                    / {item.domain}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-200">{item.title}</h3>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 bg-white text-black px-4 py-2 text-sm font-medium rounded-lg transition-opacity">
                                    Activate
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border border-dashed border-[#333] rounded-3xl">
                        <ListTodo size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-black uppercase tracking-widest text-gray-400 mb-2">Blank Slate</h3>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium">
                            The capture buffer is clear.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
