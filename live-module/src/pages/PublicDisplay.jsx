import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Music2, MessageSquare, QrCode, ThumbsUp, Flame, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PublicDisplay = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeBattle, setActiveBattle] = useState(null);
    const [battleVotes, setBattleVotes] = useState({ A: 0, B: 0 });

    useEffect(() => {
        fetchEvent();
        fetchRequests();

        const channel = supabase
            .channel(`public_display_${eventId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'live_battles',
                filter: `event_id=eq.${eventId}`
            }, (payload) => {
                if (payload.new && payload.new.is_active) {
                    setActiveBattle(payload.new);
                    fetchBattleVotes(payload.new.id);
                } else {
                    setActiveBattle(null);
                    setBattleVotes({ A: 0, B: 0 });
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'live_battle_votes'
            }, (payload) => {
                if (activeBattle && payload.new.battle_id === activeBattle.id) {
                    setBattleVotes(prev => ({
                        ...prev,
                        [payload.new.option_vote]: prev[payload.new.option_vote] + 1
                    }));
                }
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
        if (data) {
            setEvent(data);
            fetchActiveBattle();
        }
    };

    const fetchActiveBattle = async () => {
        const { data } = await supabase
            .from('live_battles')
            .select('*')
            .eq('event_id', eventId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        setActiveBattle(data);
        if (data) fetchBattleVotes(data.id);
    };

    const fetchBattleVotes = async (battleId) => {
        const { data } = await supabase
            .from('live_battle_votes')
            .select('option_vote')
            .eq('battle_id', battleId);

        const counts = { A: 0, B: 0 };
        data?.forEach(v => counts[v.option_vote]++);
        setBattleVotes(counts);
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

            {/* Main Content Area */}
            <div className={`flex-1 flex gap-12 mt-12 transition-all duration-1000 w-full relative z-10 ${activeBattle ? 'max-w-[120rem]' : 'max-w-6xl'} mx-auto overflow-hidden`}>
                {/* Left Side: Requests (Now half-width if battle is active) */}
                <div className={`flex flex-col gap-6 transition-all duration-1000 ${activeBattle ? 'w-1/2' : 'w-full'}`}>
                    <AnimatePresence mode="popLayout">
                        {requests.length === 0 ? (
                            <motion.div
                                key="no-requests"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center opacity-20"
                            >
                                <Music2 className="w-48 h-48 mb-6" />
                                <h3 className="text-4xl font-black uppercase tracking-[0.2em]">{t('publicDisplay.waitingForRequests')}</h3>
                            </motion.div>
                        ) : (
                            requests.map((req, index) => (
                                <motion.div
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0, x: -100, scale: 0.8 }}
                                    animate={{ opacity: index === 0 ? 1 : 0.4, x: 0, scale: index === 0 ? 1 : 0.95 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`relative p-12 rounded-[3.5rem] border-4 transition-all ${req.is_vip
                                        ? 'bg-slate-900 border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.3)]'
                                        : index === 0
                                            ? 'bg-slate-900 border-prime shadow-[0_0_80px_rgba(225,29,72,0.3)]'
                                            : 'bg-white/5 border-transparent'
                                        }`}
                                >
                                    {req.is_vip && (
                                        <div className="absolute -top-6 left-12 bg-amber-400 text-black px-8 py-2 rounded-full font-black text-sm uppercase tracking-[0.2em]">
                                            VIP REQUEST
                                        </div>
                                    )}
                                    {index === 0 && !req.is_vip && (
                                        <div className="absolute -top-6 left-12 bg-prime text-white px-8 py-2 rounded-full font-black text-sm uppercase tracking-[0.2em]">
                                            {t('publicDisplay.nextUp')}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-10">
                                        <div className={`bg-prime/10 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/5 ${activeBattle ? 'w-24 h-24' : 'w-48 h-48'}`}>
                                            {req.image_url ? (
                                                <img src={req.image_url} className="w-full h-full object-cover" alt="" />
                                            ) : req.metadata?.artworkUrl100 ? (
                                                <img src={req.metadata.artworkUrl100} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Music2 className={activeBattle ? 'w-12 h-12 text-prime' : 'w-24 h-24 text-prime'} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className={`font-black tracking-tighter uppercase truncate ${activeBattle ? 'text-5xl' : 'text-7xl'}`}>
                                                {req.song_title}
                                            </h2>
                                            <p className={`font-bold opacity-40 uppercase tracking-widest ${activeBattle ? 'text-xl' : 'text-3xl'}`}>
                                                {req.artist_name || req.metadata?.artistName || 'İSTEK'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {req.upvote_count > 0 && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <ThumbsUp className={`text-prime fill-current ${activeBattle ? 'w-8 h-8' : 'w-12 h-12'}`} />
                                                    <span className="font-black text-2xl">{req.upvote_count}</span>
                                                </div>
                                            )}
                                            {req.mood && <span className={activeBattle ? 'text-6xl' : 'text-8xl'}>{req.mood}</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side: Active Battle */}
                <AnimatePresence>
                    {activeBattle && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="w-1/2 flex flex-col gap-8"
                        >
                            <div className="flex-1 bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border-4 border-orange-500/30 p-16 flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.1)]">
                                <div className="absolute -top-24 -right-24 opacity-10">
                                    <Flame className="w-[40rem] h-[40rem] text-orange-500" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-12">
                                        <div className="inline-flex items-center gap-3 bg-orange-500 text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-[0.3em] mb-6">
                                            <Flame className="w-5 h-5 fill-current" />
                                            LIVE BATTLE
                                        </div>
                                        <h2 className="text-7xl font-black leading-[1.1] uppercase tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                                            {activeBattle.title}
                                        </h2>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center gap-16">
                                        {/* Option A */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-4xl font-black uppercase tracking-widest">{activeBattle.option_a_name}</span>
                                                <motion.span
                                                    key={battleVotes.A}
                                                    initial={{ scale: 1.5, color: '#f97316' }}
                                                    animate={{ scale: 1, color: '#f97316' }}
                                                    className="text-6xl font-black"
                                                >
                                                    {Math.round((battleVotes.A / (battleVotes.A + battleVotes.B || 1)) * 100)}%
                                                </motion.span>
                                            </div>
                                            <div className="h-16 bg-white/5 rounded-3xl overflow-hidden border-2 border-white/5 p-2 shadow-inner">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl relative"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(battleVotes.A / (battleVotes.A + battleVotes.B || 1)) * 100}%` }}
                                                    transition={{ duration: 1, ease: "circOut" }}
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-[stripe_1s_linear_infinite]" />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Option B */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-4xl font-black uppercase tracking-widest opacity-60">{activeBattle.option_b_name}</span>
                                                <motion.span
                                                    key={battleVotes.B}
                                                    initial={{ scale: 1.5, color: '#3b82f6' }}
                                                    animate={{ scale: 1, color: '#3b82f6' }}
                                                    className="text-6xl font-black"
                                                >
                                                    {Math.round((battleVotes.B / (battleVotes.A + battleVotes.B || 1)) * 100)}%
                                                </motion.span>
                                            </div>
                                            <div className="h-16 bg-white/5 rounded-3xl overflow-hidden border-2 border-white/5 p-2 shadow-inner">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl relative"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(battleVotes.B / (battleVotes.A + battleVotes.B || 1)) * 100}%` }}
                                                    transition={{ duration: 1, ease: "circOut" }}
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-[stripe_1s_linear_infinite]" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-16 text-center">
                                        <div className="inline-block bg-white/5 backdrop-blur-3xl px-12 py-6 rounded-[2.5rem] border border-white/10">
                                            <p className="text-3xl font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">
                                                TELEFONUNUZDAN OYLAYIN!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
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
