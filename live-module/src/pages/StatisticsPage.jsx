import React, { useState, useEffect } from 'react';
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
        topSongs: [],
        hourlyDistribution: []
    });

    useEffect(() => {
        fetchStats();
    }, [eventId]);

    const fetchStats = async () => {
        try {
            // 1. Fetch event deatils
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
                // Calculate stats
                const total = requests.length;
                const played = requests.filter(r => r.status === 'played').length;

                // Top songs
                const songCounts = {};
                requests.forEach(r => {
                    const song = r.song_title.trim();
                    songCounts[song] = (songCounts[song] || 0) + 1;
                });
                const topSongs = Object.entries(songCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([title, count]) => ({ title, count }));

                setStats({ total, played, topSongs });
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
                        <h1 className="text-3xl font-black tracking-tight">{event?.event_name} Analizi</h1>
                        <p className="text-slate-500 font-medium italic underline decoration-prime/30 underline-offset-4">Etkinlik Raporu ve İstatistikler</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        icon={<Music className="text-prime" />}
                        label="Toplam İstek"
                        value={stats.total}
                        desc="Tüm misafir talepleri"
                    />
                    <StatCard
                        icon={<TrendingUp className="text-green-500" />}
                        label="Çalınan Şarkılar"
                        value={stats.played}
                        desc={`Başarı Oranı: %${stats.total > 0 ? Math.round((stats.played / stats.total) * 100) : 0}`}
                    />
                    <StatCard
                        icon={<Users className="text-blue-500" />}
                        label="Katılımcı Etkileşimi"
                        value={Math.round(stats.total * 1.4)} // Tahminleme
                        desc="Tahmini etkileşim sayısı"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Songs */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <BarChart3 className="text-prime w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">En Çok İstenenler</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.topSongs.map((song, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-prime/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-700 font-black text-2xl italic">0{i + 1}</span>
                                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{song.title}</span>
                                    </div>
                                    <span className="bg-prime/10 text-prime px-3 py-1 rounded-full text-xs font-black">{song.count} İSTEK</span>
                                </div>
                            ))}
                            {stats.topSongs.length === 0 && (
                                <p className="text-slate-600 italic text-center py-10">Henüz yeterli veri yok.</p>
                            )}
                        </div>
                    </div>

                    {/* Pro Call to Action */}
                    <div className="bg-gradient-to-br from-prime/20 to-slate-900 border border-prime/20 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-prime/10 blur-[100px] group-hover:bg-prime/20 transition-all" />
                        <div>
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <Clock className="text-prime w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black mb-4">Daha Derine İnin</h2>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                İsteklerin zamana göre dağılımı, misafir demografisi ve detaylı CSV raporları için **PRO** pakete geçiş yapın.
                            </p>
                        </div>
                        <button className="w-full bg-prime py-5 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl shadow-prime/20">
                            PRO'YA YÜKSELT <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
