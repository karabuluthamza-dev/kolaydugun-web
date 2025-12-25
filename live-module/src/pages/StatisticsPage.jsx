import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, BarChart3, TrendingUp, Music, Users, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StatisticsPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        played: 0,
        rejected: 0,
        pending: 0,
        topSongs: [],
        topGuests: [],
        hourlyDistribution: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }))
    });

    useEffect(() => {
        fetchStats();
    }, [eventId]);

    const fetchStats = async () => {
        try {
            // 1. Fetch event details
            const { data: eventData } = await supabase
                .from('live_events')
                .select('*')
                .eq('id', eventId)
                .single();

            setEvent(eventData);

            // 2. Fetch all requests for this event
            const { data: requests } = await supabase
                .from('live_requests')
                .select('*')
                .eq('event_id', eventId);

            if (requests) {
                const total = requests.length;
                const played = requests.filter(r => r.status === 'played').length;
                const rejected = requests.filter(r => r.status === 'rejected').length;
                const pending = requests.filter(r => r.status === 'pending').length;

                // Hourly Distribution
                const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
                requests.forEach(r => {
                    const date = new Date(r.created_at);
                    const hour = date.getHours();
                    hourlyData[hour].count++;
                });

                // Top songs
                const songDataMap = {};
                requests.forEach(r => {
                    const song = r.song_title.trim();
                    if (!songDataMap[song]) {
                        songDataMap[song] = { count: 0, artwork: r.metadata?.artworkUrl100 };
                    }
                    songDataMap[song].count++;
                });
                const topSongs = Object.entries(songDataMap)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 5)
                    .map(([title, data]) => ({ title, count: data.count, artwork: data.artwork }));

                // Top Guests
                const guestCounts = {};
                requests.forEach(r => {
                    if (r.requester_name) {
                        const guest = r.requester_name.trim();
                        guestCounts[guest] = (guestCounts[guest] || 0) + 1;
                    }
                });
                const topGuests = Object.entries(guestCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, count]) => ({ name, count }));

                setStats({ total, played, rejected, pending, topSongs, topGuests, hourlyDistribution: hourlyData });
            }
        } catch (err) {
            console.error("Stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{event?.event_name} {t('stats.title')}</h1>
                        <p className="text-slate-500 font-medium italic underline decoration-prime/30 underline-offset-4">{t('stats.subtitle')}</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        icon={<Music className="text-prime" />}
                        label={t('stats.totalRequests')}
                        value={stats.total}
                        desc={t('stats.totalRequestsDesc')}
                    />
                    <StatCard
                        icon={<TrendingUp className="text-green-500" />}
                        label={t('stats.playedSongs')}
                        value={stats.played}
                        desc={`${t('stats.successRate')}: %${stats.total > 0 ? Math.round((stats.played / stats.total) * 100) : 0}`}
                    />
                    <StatCard
                        icon={<Users className="text-blue-500" />}
                        label={t('stats.interaction')}
                        value={Math.round(stats.total * 1.4)} // Tahminleme
                        desc={t('stats.interactionDesc')}
                    />
                </div>

                {/* Advanced Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Interaction Distribution */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="text-prime w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">{t('stats.distribution')}</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.played / stats.total) * 100 || 0}%` }}
                                    className="bg-green-500 h-full"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.rejected / stats.total) * 100 || 0}%` }}
                                    className="bg-red-500 h-full"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.pending / stats.total) * 100 || 0}%` }}
                                    className="bg-slate-600 h-full"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <LegendItem color="bg-green-500" label={t('liveFeed.actions.played')} count={stats.played} />
                                <LegendItem color="bg-red-500" label={t('liveFeed.actions.rejected')} count={stats.rejected} />
                                <LegendItem color="bg-slate-600" label={t('liveFeed.tabs.pending')} count={stats.pending} />
                            </div>
                        </div>
                    </div>

                    {/* Hourly Distribution Chart */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="text-blue-500 w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">{t('stats.hourlyIntensity')}</h2>
                        </div>
                        <div className="h-40 flex items-end gap-1 px-2">
                            {stats.hourlyDistribution.map((h, i) => {
                                const maxCount = Math.max(...stats.hourlyDistribution.map(d => d.count), 1);
                                const height = (h.count / maxCount) * 100;
                                return (
                                    <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {h.hour}:00 - {h.count} {t('dashboard.eventCard.requests')}
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className={`${h.count > 0 ? 'bg-prime' : 'bg-slate-800'} rounded-t-sm transition-colors group-hover:bg-prime/80`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-slate-600 tracking-tighter uppercase">
                            <span>00:00</span>
                            <span>12:00</span>
                            <span>23:00</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Songs */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Music className="text-prime w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">{t('stats.popularSongs')}</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.topSongs.map((song, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-prime/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-700 font-black text-2xl italic">0{i + 1}</span>
                                        {song.artwork ? (
                                            <img
                                                src={song.artwork}
                                                alt={song.title}
                                                className="w-10 h-10 rounded-lg shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                                                <Music className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{song.title}</span>
                                    </div>
                                    <span className="bg-prime/10 text-prime px-3 py-1 rounded-full text-[10px] font-black">{song.count} İSTEK</span>
                                </div>
                            ))}
                            {stats.topSongs.length === 0 && (
                                <p className="text-slate-600 italic text-center py-10">{t('stats.noData')}</p>
                            )}
                        </div>
                    </div>

                    {/* Top Guests */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Users className="text-blue-500 w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">{t('stats.activeGuests')}</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.topGuests.map((guest, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xs">
                                            {guest.name[0]?.toUpperCase()}
                                        </div>
                                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{guest.name}</span>
                                    </div>
                                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black">{guest.count} TALEP</span>
                                </div>
                            ))}
                            {stats.topGuests.length === 0 && (
                                <p className="text-slate-600 italic text-center py-10">{t('stats.noData')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label, count }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-xl font-bold ml-4">{count}</p>
    </div>
);

const StatCard = ({ icon, label, value, desc }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-slate-700 transition-all">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <div className="space-y-1">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">{label}</p>
            <h3 className="text-4xl font-black tracking-tight">{value}</h3>
            <p className="text-slate-600 text-xs font-medium pt-2">{desc}</p>
        </div>
    </div>
);

export default StatisticsPage;
