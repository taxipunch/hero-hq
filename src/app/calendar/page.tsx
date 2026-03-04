import { createClient } from '@/utils/supabase/server';
import { Calendar as CalendarIcon, ChevronLeft, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function CalendarPage() {
    const supabase = await createClient();

    // Fetch upcoming appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

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
                    <CalendarIcon size={28} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Calendar</h1>
                    <p className="text-gray-400">Upcoming appointments and time-blocked engagements.</p>
                </div>
            </header>

            <div className="max-w-4xl">
                {appointments && appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map((apt: any) => (
                            <div key={apt.id} className="bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-2xl p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs font-mono px-2 py-1 rounded border ${apt.crazy_status === 'unlaunched' ? 'bg-[#111] border-[#333] text-gray-400' :
                                            'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                            }`}>
                                            {apt.crazy_status.toUpperCase()}
                                        </span>
                                        <span className="text-sm font-medium text-blue-400">
                                            {new Date(apt.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(apt.scheduled_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-medium text-white">{apt.title}</h3>

                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        {apt.contact_name && (
                                            <span className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                                                {apt.contact_name} {apt.contact_type ? `(${apt.contact_type})` : ''}
                                            </span>
                                        )}
                                        {apt.location && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} />
                                                {apt.location}
                                            </span>
                                        )}
                                        {apt.duration_minutes && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {apt.duration_minutes} min
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {apt.crazy_status === 'unlaunched' && (
                                    <button className="shrink-0 bg-white text-black hover:bg-gray-200 transition-colors px-4 py-2 rounded-lg font-medium text-sm">
                                        Prepare
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border border-dashed border-[#333] rounded-3xl">
                        <CalendarIcon size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">No Upcoming Engagements</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            The future is unwritten. Await dispatch.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
