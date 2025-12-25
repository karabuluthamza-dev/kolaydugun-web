import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, MessageSquare, QrCode, ThumbsUp, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PublicDisplay = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        fetchEvent();
        fetchRequests();

        const channel = supabase
            .channel(`public_display_${eventId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'live_requests',
                filter: `event_id=eq.${eventId}`
            }, () => {
                fetchRequests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);

    const fetchEvent = async () => {
        const { data } = await supabase
            .from('live_events')
            .select('*')
            .eq('id', eventId)
            .single();
        setEvent(data);
    };

    const fetchRequests = async () => {
        const { data } = await supabase
            .from('live_requests')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'pending')
            .order('upvote_count', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(5);
        setRequests(data || []);
        setLoading(false);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    if (loading) return null;

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col p-12 relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-full h-full bg-prime/20 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-blue-600/20 rounded-full blur-[150px]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-16 relative z-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-prime uppercase mb-2">
                        {event?.event_name}
                    </h1>
                    <p className="text-xl font-bold text-white/40 uppercase tracking-[0.3em]">
                        {t('publicDisplay.title')}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleFullScreen}
                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                        title={isFullScreen ? t('publicDisplay.actions.exitFullScreen') : t('publicDisplay.actions.fullScreen')}
                    >
                        {isFullScreen ? <Minimize className="w-6 h-6 text-white/40 group-hover:text-white" /> : <Maximize className="w-6 h-6 text-white/40 group-hover:text-white" />}
                    </button>
                    <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                        <QrCode className="w-16 h-16 text-white" />
                        <div>
                            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">
                                {t('publicDisplay.scanToRequest')}
                            </p>
                            <p className="text-2xl font-mono font-bold tracking-tight">
                                kolaydugun.de/e/{event?.slug}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full relative z-10">
                <AnimatePresence mode="popLayout">
                    {requests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <Music className="w-32 h-32 mx-auto mb-8 text-white/10" />
                            <h2 className="text-5xl font-black uppercase tracking-widest text-white/20">
                                {t('publicDisplay.waitingForRequests')}
                            </h2>
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            {requests.map((req, index) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, x: -100 }}
                                    animate={{ opacity: index === 0 ? 1 : 0.4, x: 0, scale: index === 0 ? 1 : 0.95 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`relative p-12 rounded-[3.5rem] border-4 transition-all ${index === 0
                                        ? 'bg-slate-900 border-prime shadow-[0_0_80px_rgba(225,29,72,0.2)]'
                                        : 'bg-white/5 border-transparent'
                                        }`}
                                >
                                    {index === 0 && (
                                        <div className="absolute -top-6 left-12 bg-prime text-white px-8 py-2 rounded-full font-black text-sm uppercase tracking-[0.2em]">
                                            {t('publicDisplay.nextUp')}
                                        </div>
                                    )}
                                    <div className="flex items-end justify-between gap-8">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-6 mb-4 text-white/40">
                                                {req.metadata?.artworkUrl100 ? (
                                                    <img
                                                        src={req.metadata.artworkUrl100}
                                                        alt={req.song_title}
                                                        className={`rounded-2xl shadow-2xl border-2 border-white/10 ${index === 0 ? 'w-24 h-24' : 'w-16 h-16'}`}
                                                    />
                                                ) : (
                                                    <MessageSquare className="w-8 h-8" />
                                                )}
                                                <span className="text-2xl font-black uppercase tracking-widest">
                                                    {req.requester_name || 'MISAFIR'}
                                                </span>
                                            </div>
                                            <h2 className={`font-black leading-none truncate ${index === 0 ? 'text-8xl' : 'text-5xl opacity-60'}`}>
                                                {req.song_title}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            {req.upvote_count > 0 && (
                                                <div className="flex items-center gap-4 bg-prime/10 px-8 py-4 rounded-full text-prime">
                                                    <ThumbsUp className={`${index === 0 ? 'w-12 h-12' : 'w-8 h-8'} fill-current`} />
                                                    <span className={`${index === 0 ? 'text-6xl' : 'text-4xl'} font-black`}>{req.upvote_count}</span>
                                                </div>
                                            )}
                                            {req.mood && (
                                                <div className={`${index === 0 ? 'text-9xl' : 'text-6xl'} animate-bounce`}>
                                                    {req.mood}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center relative z-10">
                <p className="text-sm font-black text-white/10 uppercase tracking-[0.5em]">
                    Powered by KolayDüğün Live
                </p>
            </div>
        </div>
    );
};

export default PublicDisplay;
