import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, ThumbsUp, Heart, Users, Calendar, X, Sparkles, TrendingUp } from 'lucide-react';

const WeddingWrapped = ({ event, onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        fetchStats();
    }, [event.id]);

    const fetchStats = async () => {
        const { data: requests } = await supabase
            .from('live_requests')
            .select('*')
            .eq('event_id', event.id);

        if (!requests) return;

        // Process Stats
        const totalRequests = requests.length;
        const vipRequests = requests.filter(r => r.is_vip).length;
        const totalUpvotes = requests.reduce((acc, r) => acc + (r.upvote_count || 0), 0);

        // Top Songs
        const songCounts = {};
        requests.forEach(r => {
            const key = `${r.song_title} - ${r.artist_name || 'Unknown'}`;
            songCounts[key] = (songCounts[key] || 0) + 1;
        });
        const topSongs = Object.entries(songCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // Mood Stats
        const moodCounts = {};
        requests.forEach(r => {
            if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
        });
        const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '🔥';

        setStats({
            totalRequests,
            vipRequests,
            totalUpvotes,
            topSongs,
            topMood,
            uniqueRequesters: new Set(requests.map(r => r.requester_name)).size
        });
        setLoading(false);
    };

    const slides = [
        {
            title: "Tebrikler!",
            content: `Harika bir geceydi. İşte ${event.event_name} için hazırladığımız özel rapor.`,
            icon: <Sparkles className="w-16 h-16 text-yellow-400" />
        },
        {
            title: "Müzik Dolu Bir Gece",
            content: `Tam ${stats?.totalRequests} şarkı isteği yapıldı. Konuklarınız mikrofonu hiç bırakmadı!`,
            icon: <Music2 className="w-16 h-16 text-prime" />
        },
        {
            title: "En Çok Sevilenler",
            content: `Gecenin yıldızı: ${stats?.topSongs[0]?.[0]}`,
            subcontent: stats?.topSongs.slice(1).map(s => s[0]).join(", "),
            icon: <TrendingUp className="w-16 h-16 text-green-400" />
        },
        {
            title: "Gecenin Modu",
            content: `Resmi olarak "${stats?.topMood}" ilan edildi!`,
            icon: <div className="text-8xl">{stats?.topMood}</div>
        },
        {
            title: "Rakamlarla Gece",
            content: `${stats?.totalUpvotes} beğeni, ${stats?.uniqueRequesters} farklı misafir, ${stats?.vipRequests} VIP istek.`,
            icon: <Users className="w-16 h-16 text-blue-400" />
        }
    ];

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-white/40 hover:text-white z-[110]"
            >
                <X className="w-8 h-8" />
            </button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={slideIndex}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    className="w-full max-w-md aspect-[9/16] bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[3rem] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl border border-white/10"
                    onClick={() => setSlideIndex((slideIndex + 1) % slides.length)}
                >
                    {/* Animated Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-prime rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500 rounded-full blur-[100px] animate-pulse delay-700" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="p-8 bg-white/5 rounded-[2.5rem] inline-block border border-white/10 shadow-xl"
                        >
                            {slides[slideIndex].icon}
                        </motion.div>

                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">
                                {event.event_name} Wrapped
                            </h2>
                            <h1 className="text-4xl font-black leading-tight uppercase italic tracking-tighter">
                                {slides[slideIndex].title}
                            </h1>
                            <p className="text-xl font-medium text-white/80 leading-relaxed">
                                {slides[slideIndex].content}
                            </p>
                            {slides[slideIndex].subcontent && (
                                <p className="text-sm font-bold text-white/40 mt-4 uppercase">
                                    Diğerleri: {slides[slideIndex].subcontent}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="absolute bottom-20 left-12 right-12 flex gap-1">
                        {slides.map((_, i) => (
                            <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ width: slideIndex === i ? '100%' : slideIndex > i ? '100%' : '0%' }}
                                    transition={{ duration: slideIndex === i ? 5 : 0.3 }}
                                />
                            </div>
                        ))}
                    </div>

                    <p className="absolute bottom-10 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                        Ekrana dokunarak ilerleyin
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WeddingWrapped;
