import { createClient } from '@/utils/supabase/server';
import { BookOpen, ChevronLeft, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default async function PlaybooksPage() {
    const supabase = await createClient();

    const { data: playbooks } = await supabase
        .from('playbooks')
        .select('*')
        .order('title', { ascending: true });

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 font-display">
            {/* Navigation */}
            <nav className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white transition-colors text-sm">
                    <ChevronLeft size={16} className="mr-1" />
                    Back to HQ
                </Link>
            </nav>

            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#333] pb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-[#111] border border-[#333] rounded-2xl flex items-center justify-center">
                        <BookOpen size={28} className="text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-white mb-1">Playbooks</h1>
                        <p className="text-gray-400 font-medium">Standard operating procedures for recurring processes.</p>
                    </div>
                </div>
                <button className="bg-[#111] border border-[#333] hover:border-[#555] text-white transition-colors px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm">
                    + New Playbook
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                {playbooks && playbooks.length > 0 ? (
                    playbooks.map((pb: any) => (
                        <div key={pb.id} className="bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-2xl p-6 transition-all flex flex-col justify-between h-56 group cursor-pointer">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono uppercase bg-[#111] border border-[#333] px-2 py-1 rounded text-gray-400">
                                        {pb.domain || 'SYSTEM'}
                                    </span>
                                    <span className="text-xs text-orange-500/80 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                                        {pb.crazy_status.toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2 leading-tight">{pb.title}</h3>
                                {pb.trigger && (
                                    <p className="text-sm text-gray-500 italic line-clamp-2 mt-2">
                                        "When {pb.trigger}..."
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#333] flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-gray-500">
                                    {pb.use_count || 0} Runs
                                </span>
                                <PlayCircle size={20} className="text-orange-500 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border border-dashed border-[#333] rounded-3xl">
                        <BookOpen size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-black uppercase tracking-widest text-gray-400 mb-2">No System</h3>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium">
                            Document the repeatable.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
