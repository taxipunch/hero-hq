import { createClient } from '@/utils/supabase/server';
import { Archive, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortfolioPage() {
    const supabase = await createClient();

    // Fetch all yawped items
    const [
        { data: projects },
        { data: tasks },
        { data: appointments },
        { data: playbooks }
    ] = await Promise.all([
        supabase.from('projects').select('id, name, description, completed_at, last_crazy_run_at, created_at').eq('crazy_status', 'yawped'),
        supabase.from('tasks').select('id, title, domain, completed_at, created_at').eq('crazy_status', 'yawped'),
        supabase.from('appointments').select('id, title, scheduled_at, last_crazy_run_at, created_at').eq('crazy_status', 'yawped'),
        supabase.from('playbooks').select('id, title, domain, last_used_at, last_crazy_run_at, created_at').eq('crazy_status', 'yawped')
    ]);

    // Normalize and combine
    const portfolio = [
        ...(projects || []).map((p: any) => ({
            id: p.id,
            title: p.name,
            description: p.description,
            type: 'Project',
            date: p.completed_at || p.last_crazy_run_at || p.created_at,
            url: `/projects/${p.id}`
        })),
        ...(tasks || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.domain || 'Task',
            type: 'Task',
            date: t.completed_at || t.created_at,
            url: '#'
        })),
        ...(appointments || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            description: 'Appointment',
            type: 'Appointment',
            date: a.scheduled_at || a.last_crazy_run_at || a.created_at,
            url: '#'
        })),
        ...(playbooks || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.domain || 'Playbook',
            type: 'Playbook',
            date: p.last_used_at || p.last_crazy_run_at || p.created_at,
            url: '#'
        }))
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white p-4 md:p-8 lg:p-12 font-['Inter']">

            {/* Navigation */}
            <nav className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white transition-colors text-sm">
                    <ChevronLeft size={16} className="mr-1" />
                    Back to HQ
                </Link>
            </nav>

            <header className="mb-12 flex items-center gap-4 border-b border-[#333] pb-6">
                <div className="h-16 w-16 bg-[#111] border border-[#333] rounded-2xl flex items-center justify-center">
                    <Archive size={28} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-1">The Yawp Archive</h1>
                    <p className="text-gray-400">Portfolio of completed, fully-actualized endeavors.</p>
                </div>
            </header>

            <div className="max-w-4xl">
                {portfolio.length > 0 ? (
                    <div className="space-y-6">
                        {portfolio.map((item) => (
                            <Link
                                href={item.url}
                                key={item.id + item.type}
                                className="block bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-2xl p-6 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono bg-[#111] border border-[#333] text-purple-400 px-2 py-1 rounded">
                                                {item.type.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(item.date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-200 group-hover:text-white transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p className="text-gray-500 mt-1 text-sm">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="h-10 w-10 rounded-full border border-[#333] flex items-center justify-center bg-[#111] group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                                        <ChevronLeft size={18} className="rotate-180" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border border-dashed border-[#333] rounded-3xl">
                        <Archive size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">The Archive is Empty</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            No projects or tasks have achieved the ultimate "Yawped" state yet. Get back in the arena.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
