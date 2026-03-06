import { Zap, Search, Bell, Clock, TrendingUp, ExternalLink, ArrowUpRight, MapPin, MoreHorizontal, Calendar, BarChart2, Briefcase, Settings, Plus, Mic } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { OracleWidget } from './components/OracleWidget';
import BottomNav from './components/BottomNav';
import DebriefCheck from './components/DebriefCheck';
import { DashboardCard } from './components/DashboardCard';
import { HeroQuote } from './components/HeroQuote';

export default async function TodayDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Check for pending debriefs
    const { data: pendingDebriefRow } = await supabase
        .from('debriefs')
        .select('*')
        .is('response', null)
        .neq('skipped', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    let pendingDebrief = null;
    if (pendingDebriefRow) {
        const table = pendingDebriefRow.item_type === 'project' ? 'projects' : 'playbooks';
        const { data: itemData } = await supabase.from(table).select('name, title').eq('id', pendingDebriefRow.item_id).single();

        pendingDebrief = {
            id: pendingDebriefRow.id,
            item_type: pendingDebriefRow.item_type,
            item_id: pendingDebriefRow.item_id,
            phase_completed: pendingDebriefRow.phase_completed,
            itemName: itemData?.name || itemData?.title || 'Unknown Item'
        };
    }

    // Fetch CARD 1: TODAY
    const { data: upcomingApt } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'upcoming')
        .order('scheduled_at', { ascending: true })
        .limit(1);

    const { count: inboxCount } = await supabase
        .from('captures')
        .select('*', { count: 'exact', head: true })
        .is('resolved_at', null);

    const { count: debriefingCountProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('crazy_status', 'debriefing');

    const { count: debriefingCountPlaybooks } = await supabase
        .from('playbooks')
        .select('*', { count: 'exact', head: true })
        .eq('crazy_status', 'debriefing');

    const debriefingCount = (debriefingCountProjects || 0) + (debriefingCountPlaybooks || 0);

    const { data: activeProj } = await supabase
        .from('projects')
        .select('id, name, last_activity_at, stale_threshold_days, status')
        .eq('status', 'active');

    let staleProjectsCount = 0;
    let mostStaleProject: any = null;
    let mostStaleDays = -1;

    activeProj?.forEach(p => {
        if (!p.last_activity_at) return;
        const lastAct = new Date(p.last_activity_at);
        const diffDays = (new Date().getTime() - lastAct.getTime()) / (1000 * 3600 * 24);
        if (diffDays > (p.stale_threshold_days || 7)) {
            staleProjectsCount++;
        }
        if (diffDays > mostStaleDays) {
            mostStaleDays = diffDays;
            mostStaleProject = p;
        }
    });

    const thingsNeedAttention = (inboxCount || 0) + debriefingCount + staleProjectsCount;

    // Activity Graph Data (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const { data: recentCaptures } = await supabase.from('captures').select('created_at').gte('created_at', sevenDaysAgoStr);
    const { data: recentProjProg } = await supabase.from('project_progress').select('created_at').gte('created_at', sevenDaysAgoStr);
    const { data: recentPlayProg } = await supabase.from('playbook_progress').select('created_at').gte('created_at', sevenDaysAgoStr);

    // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    const activityByDay = [0, 0, 0, 0, 0, 0, 0];
    [...(recentCaptures || []), ...(recentProjProg || []), ...(recentPlayProg || [])].forEach(item => {
        const d = new Date(item.created_at);
        let dayIndex = d.getDay() - 1; // 0=Sun -> -1. 1=Mon -> 0
        if (dayIndex === -1) dayIndex = 6;
        activityByDay[dayIndex]++;
    });

    const maxActivity = Math.max(...activityByDay, 1);
    const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    // CARD 3: IDEAS
    const { data: ideas } = await supabase
        .from('ideas')
        .select('*')
        .in('stage', ['raw', 'developing', 'ready'])
        .order('last_surfaced_at', { ascending: true, nullsFirst: true })
        .limit(1);
    const targetIdea = ideas?.[0];

    if (targetIdea) {
        await supabase.from('ideas').update({
            last_surfaced_at: new Date().toISOString(),
            surface_count: (targetIdea.surface_count || 0) + 1
        }).eq('id', targetIdea.id);
    }

    // CARD 4: CALENDAR
    const { data: nextTwoApts } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'upcoming')
        .order('scheduled_at', { ascending: true })
        .limit(2);

    const { count: unlaunchedTasksCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('crazy_status', 'unlaunched');
    const { count: unlaunchedProjectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('crazy_status', 'unlaunched');
    const unlaunchedCount = (unlaunchedTasksCount || 0) + (unlaunchedProjectsCount || 0);

    const userName = user?.email?.split('@')[0] || 'Operator';

    // Oracle Action Buttons
    const actionButtons = [];
    if (debriefingCount > 0) {
        actionButtons.push({ label: `Sit in the car (${debriefingCount})`, href: '/projects', icon: 'ArrowRight' });
    }
    if ((inboxCount || 0) > 0) {
        actionButtons.push({ label: `Clear ${inboxCount} captures`, href: '/backlog', icon: 'Zap' });
    }
    if (unlaunchedCount > 0 && actionButtons.length < 2) {
        actionButtons.push({ label: `Run CRAZY (${unlaunchedCount} waiting)`, href: '/backlog', icon: 'ArrowRight' });
    }
    if (staleProjectsCount > 0 && actionButtons.length < 2) {
        actionButtons.push({ label: `Review ${staleProjectsCount} stale projects`, href: '/projects', icon: 'ArrowRight' });
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-display">
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
                    <button className="w-10 h-10 rounded-full bg-card-dark flex items-center justify-center border border-slate-800">
                        <Search size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-card-dark flex items-center justify-center border border-slate-800 relative">
                        <Bell size={20} className="text-primary" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card-dark"></span>
                    </button>
                </div>
            </header>

            <HeroQuote />

            <main className="px-4 space-y-4 max-w-md mx-auto">
                {/* CARD 1: TODAY (The Arena replacement) */}
                <Link href="/today" className="block outline-none">
                    <DashboardCard className="bg-primary p-6 text-white overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={16} />
                                    <h2 className="text-xs font-bold uppercase tracking-widest opacity-90">TODAY</h2>
                                </div>
                                <p className="text-xl font-extrabold tracking-tight">
                                    {upcomingApt?.[0] ? new Date(upcomingApt[0].scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No appointments'}
                                </p>
                                <p className="text-sm font-medium mt-1">
                                    [{thingsNeedAttention}] things need your attention
                                </p>
                            </div>
                        </div>
                        {/* Activity Chart */}
                        <div className="flex items-end justify-between h-24 gap-2 px-1">
                            {activityByDay.map((count, i) => {
                                const isToday = i === currentDayIndex;
                                const heightPercentage = Math.max((count / maxActivity) * 100, 10);
                                return (
                                    <div key={i} className={`flex-1 rounded-t-lg relative ${isToday ? 'bg-white' : 'bg-white/30'}`} style={{ height: `${heightPercentage}%` }}>
                                        {isToday && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">TAG</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-tighter">
                            <span className={currentDayIndex === 0 ? 'text-white opacity-100' : 'opacity-70'}>Mon</span>
                            <span className={currentDayIndex === 1 ? 'text-white opacity-100' : 'opacity-70'}>Tue</span>
                            <span className={currentDayIndex === 2 ? 'text-white opacity-100' : 'opacity-70'}>Wed</span>
                            <span className={currentDayIndex === 3 ? 'text-white opacity-100' : 'opacity-70'}>Thu</span>
                            <span className={currentDayIndex === 4 ? 'text-white opacity-100' : 'opacity-70'}>Fri</span>
                            <span className={currentDayIndex === 5 ? 'text-white opacity-100' : 'opacity-70'}>Sat</span>
                            <span className={currentDayIndex === 6 ? 'text-white opacity-100' : 'opacity-70'}>Sun</span>
                        </div>
                    </DashboardCard>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                    {/* CARD 2: PROJECTS */}
                    <Link href="/projects" className="block outline-none">
                        <DashboardCard className="bg-card-blue dark:bg-card-blue p-5 h-64 flex flex-col active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xs font-black uppercase tracking-widest">PROJECTS</h2>
                                <span className="text-sm font-bold bg-white/40 px-2 py-1 rounded-full">{activeProj?.length || 0}</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-center relative mt-2">
                                <p className="text-lg font-bold leading-tight">
                                    {mostStaleProject ? mostStaleProject.name : 'No active projects'}
                                </p>
                            </div>
                            {mostStaleProject && (
                                <div className="mt-3 bg-white/40 rounded-full px-3 py-2 text-xs font-bold text-slate-800">
                                    Last active {Math.floor(mostStaleDays)} days ago
                                </div>
                            )}
                        </DashboardCard>
                    </Link>

                    {/* CARD 3: IDEAS */}
                    <Link href="/portfolio" className="block outline-none">
                        <DashboardCard className="bg-card-sage dark:bg-card-sage p-5 h-64 flex flex-col active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xs font-black uppercase tracking-widest">IDEAS</h2>
                                <Zap size={18} />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center relative mt-2">
                                <p className="text-sm font-bold opacity-80 mb-2">Resurfaced:</p>
                                <p className="text-lg font-black leading-tight italic">
                                    "{targetIdea ? targetIdea.title : 'No pending ideas'}"
                                </p>
                            </div>
                        </DashboardCard>
                    </Link>
                </div>

                {/* CARD 4: CALENDAR */}
                <DashboardCard className="bg-card-dark p-6 text-white overflow-hidden relative border border-slate-800 mt-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} /> CALENDAR
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {nextTwoApts?.length ? nextTwoApts.map((apt, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                                <span className="font-semibold text-sm truncate pr-2">{apt.title}</span>
                                <span className="text-xs opacity-70 whitespace-nowrap">{new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )) : (
                            <div className="text-sm opacity-50 italic py-2">No upcoming appointments</div>
                        )}
                    </div>
                </DashboardCard>
                {/* AI Briefing Card -> Oracle */}
                <OracleWidget
                    userName={userName}
                    inboxCount={inboxCount || 0}
                    unlaunchedCount={unlaunchedCount}
                    debriefingCount={debriefingCount}
                    staleProjectsCount={staleProjectsCount}
                    nextAppointment={upcomingApt?.[0] ? `${upcomingApt[0].title} at ${new Date(upcomingApt[0].scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No upcoming appointments'}
                    actionButtons={actionButtons}
                />
            </main>

            <BottomNav userName={userName} />
            <DebriefCheck pending={pendingDebrief} />
        </div>
    );
}
