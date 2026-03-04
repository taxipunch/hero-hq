import { Zap, Search, Bell, Clock, TrendingUp, ExternalLink, ArrowUpRight, MapPin, MoreHorizontal, Calendar, BarChart2, Briefcase, Settings, Plus, Mic } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function TodayDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch some basic stats for the dashboard
    const { count: tasksCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('crazy_status', 'unlaunched');
    const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).in('crazy_status', ['activated', 'running', 'debriefing']);

    const userName = user?.email?.split('@')[0] || 'Operator';

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 pb-24 font-display">
            <div className="h-12 w-full"></div>
            <header className="px-6 flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        <Zap size={20} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-xs opacity-60 font-semibold uppercase tracking-wider">Good morning</p>
                        <h1 className="text-xl font-extrabold tracking-tight">{userName}'s Dashboard</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white dark:bg-card-dark flex items-center justify-center border border-slate-200 dark:border-slate-800">
                        <Search size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white dark:bg-card-dark flex items-center justify-center border border-slate-200 dark:border-slate-800 relative">
                        <Bell size={20} className="text-primary" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-card-dark"></span>
                    </button>
                </div>
            </header>

            <main className="px-4 space-y-4 max-w-md mx-auto">
                {/* The Arena (Focus Time replacement) */}
                <section className="bg-primary p-6 rounded-[32px] text-white overflow-hidden relative card-shadow">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={16} />
                                <h2 className="text-xs font-bold uppercase tracking-widest opacity-90">The Arena</h2>
                            </div>
                            <p className="text-3xl font-extrabold tracking-tight">Active</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="text-[10px] font-bold">Online</span>
                            <TrendingUp size={12} />
                        </div>
                    </div>
                    {/* Dummy Chart from Spec */}
                    <div className="flex items-end justify-between h-24 gap-2 px-1">
                        <div className="flex-1 bg-white/30 rounded-t-lg h-[40%]"></div>
                        <div className="flex-1 bg-white/30 rounded-t-lg h-[60%]"></div>
                        <div className="flex-1 bg-white/30 rounded-t-lg h-[35%]"></div>
                        <div className="flex-1 bg-white rounded-t-lg h-[95%] relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">PEAK</div>
                        </div>
                        <div className="flex-1 bg-white/30 rounded-t-lg h-[50%]"></div>
                        <div className="flex-1 bg-white/30 rounded-t-lg h-[70%]"></div>
                        <div className="flex-1 bg-white/30 rounded-t-lg h-[45%]"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold opacity-70 uppercase tracking-tighter">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span className="text-white opacity-100">Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                    {/* Tasks Card */}
                    <Link href="/backlog" className="block outline-none">
                        <section className="bg-card-blue dark:bg-card-blue p-5 rounded-[32px] text-slate-900 card-shadow h-64 flex flex-col transition-transform active:scale-95">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xs font-black uppercase tracking-widest">Backlog</h2>
                                <ExternalLink size={18} />
                            </div>
                            <div className="flex-1 relative mt-4 overflow-hidden rounded-2xl bg-white/40">
                                <img alt="Map background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400&h=400" />
                                <div className="absolute inset-0 flex flex-col justify-end p-3">
                                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-white/50">
                                        <p className="text-[10px] font-black leading-none mb-1">CAPTURE BUFFER</p>
                                        <p className="text-[10px] opacity-70">{tasksCount || 0} items pending</p>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <MapPin size={24} className="text-primary fill-current" />
                                </div>
                            </div>
                        </section>
                    </Link>

                    {/* Projects Card (Timing in original) */}
                    <Link href="/projects" className="block outline-none">
                        <section className="bg-card-sage dark:bg-card-sage p-5 rounded-[32px] text-slate-900 card-shadow h-64 flex flex-col transition-transform active:scale-95">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xs font-black uppercase tracking-widest">Projects</h2>
                                <ArrowUpRight size={18} />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" fill="transparent" r="50" stroke="rgba(255,255,255,0.4)" strokeWidth="12"></circle>
                                    <circle cx="64" cy="64" fill="transparent" r="50" stroke="#FF6B57" strokeDasharray="314" strokeDashoffset="100" strokeLinecap="round" strokeWidth="12"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black">{projectsCount || 0}</span>
                                    <span className="text-[9px] font-bold uppercase opacity-60">Active</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 bg-white/30 rounded-full px-3 py-1.5">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-[10px] font-bold">Status</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold">Optimal</span>
                            </div>
                        </section>
                    </Link>
                </div>

                {/* AI Briefing Card */}
                <section className="bg-card-dark p-6 rounded-[32px] text-white overflow-hidden relative card-shadow border border-slate-800 mt-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">AI Operations Lead</h2>
                        <button className="bg-slate-800 p-2 rounded-full">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="flex gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full border-2 border-card-purple p-0.5 overflow-hidden flex-shrink-0">
                            <img alt="AI Coach Persona" className="w-full h-full object-cover rounded-full" src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&h=150&q=80" />
                        </div>
                        <div className="space-y-3">
                            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed border border-slate-700">
                                Hi, {userName}. Your deep-work sessions are <span className="text-card-purple font-bold underline">peaking</span>. Let's block your calendar for tomorrow?
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button className="bg-white text-black text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-slate-200">
                                    <Calendar size={14} /> Yes, schedule
                                </button>
                                <button className="bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700">
                                    <BarChart2 size={14} /> View stats
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Plus size={16} className="text-white" />
                            </div>
                        </div>
                        {/* Note: This is a placeholder for the CRAZY launcher input */}
                        <input className="w-full bg-slate-800 border-none rounded-full py-4 pl-14 pr-12 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="Ask something or choose to start..." type="text" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Mic size={18} className="text-slate-400" />
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/90 dark:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[40px] px-6 py-4 flex justify-between items-center z-50 card-shadow">
                <Link href="/" className="w-12 h-12 rounded-2xl bg-card-blue flex items-center justify-center text-black">
                    <Zap size={24} className="fill-current" />
                </Link>
                <Link href="/calendar" className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Calendar size={24} />
                </Link>
                <Link href="/portfolio" className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Briefcase size={24} />
                </Link>
                <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Settings size={24} />
                </button>
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-slate-800">
                    <span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
                </div>
            </nav>
        </div>
    );
}
