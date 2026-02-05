import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Music2, MessageSquare, QrCode, ThumbsUp, Flame, Maximize, Minimize, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PublicDisplay = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeBattle, setActiveBattle] = useState(null);
    const [battleVotes, setBattleVotes] = useState({ A: 0, B: 0 });
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

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
            }, (payload) => {
                // New request added
                if (payload.eventType === 'INSERT') {
                    fetchRequests();
                }
                // Request updated (status change, upvote, etc.)
                if (payload.eventType === 'UPDATE') {
                    fetchRequests();
                }
                // Request deleted
                if (payload.eventType === 'DELETE') {
                    fetchRequests();
                }
            })
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

    // Polling fallback - refresh data every 5 seconds
    useEffect(() => {
        const pollInterval = setInterval(() => {
            fetchRequests();
            fetchActiveBattle(); // Also check for battle state changes
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [eventId]);

    // Update clock every second
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    // Auto-scroll carousel every 4 seconds
    const visibleCount = activeBattle ? 5 : 6;
    useEffect(() => {
        if (requests.length <= visibleCount) {
            setCarouselIndex(0);
            return;
        }

        const carouselInterval = setInterval(() => {
            setCarouselIndex(prev => {
                const maxIndex = requests.length - visibleCount;
                return prev >= maxIndex ? 0 : prev + 1;
            });
        }, 4000);

        return () => clearInterval(carouselInterval);
    }, [requests.length, visibleCount]);

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
        // Get total count first
        const { count } = await supabase
            .from('live_requests')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'pending');
        setTotalCount(count || 0);

        // Fetch requests (limit to 50 for carousel)
        const { data } = await supabase
            .from('live_requests')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'pending')
            .order('upvote_count', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(50);
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
        <div
            className="h-screen w-full bg-black text-white overflow-hidden flex flex-col p-4 md:p-8 lg:p-12 relative select-none"
            style={event?.display_background_url ? {
                backgroundImage: `url(${event.display_background_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            } : {}}
        >
            {/* Dark overlay for readability when custom background is set */}
            {event?.display_background_url && (
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            )}

            {/* Animated Background Elements (only show if no custom background) */}
            {!event?.display_background_url && (
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
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mb-4 md:mb-6 lg:mb-8 relative z-10 text-center md:text-left shrink-0">
                <div className="w-full md:w-auto">
                    <h1 className="text-xl md:text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-tighter text-prime uppercase leading-tight mb-1">
                        {event?.event_name}
                    </h1>
                    <p className="text-[10px] md:text-[clamp(0.7rem,1.2vw,1rem)] font-bold text-white/40 uppercase tracking-[0.3em]">
                        {t('publicDisplay.title')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                    {/* Live Clock */}
                    <div className="flex items-center gap-3 md:gap-4 bg-white/5 border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl">
                        <Clock className="w-6 h-6 md:w-8 md:h-8 text-prime" />
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold tracking-tight">
                                {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs md:text-sm font-bold text-white/40 uppercase tracking-widest">
                                {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleFullScreen}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group hidden lg:block"
                        title={isFullScreen ? t('publicDisplay.actions.exitFullScreen') : t('publicDisplay.actions.fullScreen')}
                    >
                        {isFullScreen ? <Minimize className="w-5 h-5 text-white/40 group-hover:text-white" /> : <Maximize className="w-5 h-5 text-white/40 group-hover:text-white" />}
                    </button>
                    <div className="flex items-center gap-3 md:gap-6 bg-white/5 border border-white/10 p-2 md:p-3 lg:p-4 rounded-xl md:rounded-[2rem] w-full sm:w-auto justify-center">
                        <QrCode className="w-8 h-8 md:w-10 lg:w-14 md:h-10 lg:h-14 text-white shrink-0" />
                        <div className="text-left">
                            <p className="text-[9px] md:text-xs font-black text-white/40 uppercase tracking-widest leading-tight">
                                {t('publicDisplay.scanToRequest')}
                            </p>
                            <p className="text-sm md:text-lg lg:text-2xl font-mono font-bold tracking-tight truncate max-w-[130px] md:max-w-none">
                                {window.location.host}/e/{event?.slug}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col md:flex-row gap-6 md:gap-8 transition-all duration-1000 w-full relative z-10 ${activeBattle ? 'max-w-[140rem]' : 'max-w-6xl'} mx-auto overflow-hidden mt-2 pt-6`}>
                {/* Left Side: Requests (Now half-width if battle is active) */}
                <div className={`flex flex-col gap-3 md:gap-4 lg:gap-5 transition-all duration-1000 ${activeBattle ? 'w-full md:w-1/2' : 'w-full'}`}>
                    {/* Total Request Count Header */}
                    {totalCount > 0 && (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Music className="w-4 h-4 md:w-5 md:h-5 text-prime" />
                                <span className="text-xs md:text-sm font-bold text-white/60">
                                    🎵 {totalCount} istek bekliyor
                                </span>
                            </div>
                            {requests.length > visibleCount && (
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: Math.min(requests.length, 8) }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${i >= carouselIndex && i < carouselIndex + visibleCount
                                                ? 'bg-prime'
                                                : 'bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {requests.length === 0 ? (
                            <motion.div
                                key="no-requests"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-10"
                            >
                                <Music2 className="w-20 h-20 md:w-32 lg:w-48 mb-6" />
                                <h3 className="text-lg md:text-2xl lg:text-4xl font-black uppercase tracking-[0.2em]">{t('publicDisplay.waitingForRequests')}</h3>
                            </motion.div>
                        ) : (
                            requests.slice(carouselIndex, carouselIndex + visibleCount).map((req, displayIndex) => {
                                const actualPosition = carouselIndex + displayIndex + 1;
                                const isFirst = actualPosition === 1;

                                return (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{
                                            opacity: isFirst ? 1 : 0.6,
                                            y: 0,
                                            scale: isFirst ? 1 : 0.98
                                        }}
                                        exit={{ opacity: 0, y: -50 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`relative p-3 md:p-5 lg:p-6 rounded-xl md:rounded-[2rem] lg:rounded-[2.5rem] border-2 md:border-3 transition-all shrink-0 ${req.is_vip
                                            ? 'bg-gradient-to-r from-amber-950/40 to-slate-900/80 border-amber-500/50 shadow-[0_0_40px_rgba(251,191,36,0.15)]'
                                            : isFirst
                                                ? 'bg-slate-900 border-prime shadow-[0_0_60px_rgba(225,29,72,0.2)]'
                                                : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        {/* Position Badge */}
                                        <div className={`absolute -left-2 md:-left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-lg lg:text-xl shadow-lg ${req.is_vip
                                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                                            : isFirst
                                                ? 'bg-prime text-white'
                                                : 'bg-white/10 text-white/60'
                                            }`}>
                                            {req.is_vip ? '⭐' : `#${actualPosition}`}
                                        </div>

                                        {/* VIP or Next Up Label */}
                                        {(req.is_vip || isFirst) && (
                                            <div className={`absolute -top-2.5 md:-top-3 left-10 md:left-14 lg:left-16 px-2.5 md:px-4 lg:px-5 py-0.5 md:py-1 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-[0.15em] z-20 shadow-lg ${req.is_vip ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black' : 'bg-prime text-white'
                                                }`}>
                                                {req.is_vip ? '⭐ Öncelikli' : t('publicDisplay.nextUp')}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 md:gap-5 lg:gap-6 ml-4 md:ml-6">
                                            <div className={`bg-prime/10 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden border border-white/5 ${activeBattle ? 'w-10 h-10 md:w-14 lg:w-16' : 'w-12 h-12 md:w-20 lg:w-24'} shrink-0`}>
                                                {req.image_url ? (
                                                    <img src={req.image_url} className="w-full h-full object-cover" alt="" />
                                                ) : req.metadata?.artworkUrl100 ? (
                                                    <img src={req.metadata.artworkUrl100} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <Music2 className={activeBattle ? 'w-4 h-4 md:w-6 lg:w-8 text-prime' : 'w-6 h-6 md:w-10 lg:w-12 text-prime'} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className={`font-black tracking-tighter uppercase line-clamp-1 md:leading-[1.1] ${activeBattle ? 'text-base md:text-[clamp(1rem,1.8vw,1.5rem)]' : 'text-lg md:text-[clamp(1.2rem,3vw,2.5rem)]'}`}>
                                                    {req.song_title}
                                                </h2>
                                                <p className={`font-bold opacity-40 uppercase tracking-widest truncate mt-0.5 ${activeBattle ? 'text-[8px] md:text-xs' : 'text-[9px] md:text-base'}`}>
                                                    {req.artist_name || req.metadata?.artistName || t('liveFeed.guestLabel')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                                {req.upvote_count > 0 && (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <ThumbsUp className={`text-prime fill-current ${activeBattle ? 'w-3 h-3 md:w-5' : 'w-4 h-4 md:w-7'}`} />
                                                        <span className="font-black text-[9px] md:text-sm lg:text-base">{req.upvote_count}</span>
                                                    </div>
                                                )}
                                                {req.mood && <span className={activeBattle ? 'text-lg md:text-3xl lg:text-4xl' : 'text-xl md:text-4xl lg:text-5xl'}>{req.mood}</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
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
                            className="w-full md:w-1/2 flex flex-col gap-3 md:gap-4 mb-8 md:mb-0"
                        >
                            <div className="flex-1 bg-slate-900/50 backdrop-blur-3xl rounded-2xl md:rounded-[1.5rem] border-4 border-orange-500/30 p-3 md:p-5 lg:p-6 flex flex-col relative shadow-[0_0_100px_rgba(249,115,22,0.1)]">
                                <div className="absolute -top-24 -right-24 opacity-10 hidden md:block pointer-events-none">
                                    <Flame className="w-[40rem] h-[40rem] text-orange-500" />
                                </div>

                                <div className="relative z-10 flex flex-col justify-between">
                                    <div className="mb-1 md:mb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="inline-flex items-center gap-1.5 bg-orange-500 text-black px-2.5 md:px-4 py-0.5 md:py-1.5 rounded-full font-black text-[7px] md:text-[10px] uppercase tracking-[0.2em] mb-1.5 md:mb-3">
                                                <Flame className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-current" />
                                                LIVE BATTLE
                                            </div>
                                            <div className="text-right mb-1.5 md:mb-3">
                                                <span className="text-[10px] md:text-sm font-bold text-white/60">
                                                    🗳️ {battleVotes.A + battleVotes.B} oy
                                                </span>
                                            </div>
                                        </div>
                                        <h2 className="text-lg md:text-[clamp(1rem,2.5vw,2rem)] lg:text-3xl font-black leading-[1.1] uppercase tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent line-clamp-2">
                                            {activeBattle.title}
                                        </h2>
                                    </div>

                                    <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 my-2 md:my-3">
                                        {/* Option A */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <div className="flex justify-between items-end gap-2">
                                                <span className="text-sm md:text-[clamp(0.9rem,1.8vw,1.3rem)] lg:text-lg font-black uppercase tracking-wider line-clamp-1 flex-1">{activeBattle.option_a_name}</span>
                                                <motion.span
                                                    key={battleVotes.A}
                                                    initial={{ scale: 1.5, color: '#f97316' }}
                                                    animate={{ scale: 1, color: '#f97316' }}
                                                    className="text-lg md:text-2xl lg:text-3xl font-black shrink-0 flex items-baseline gap-1"
                                                >
                                                    {Math.round((battleVotes.A / (battleVotes.A + battleVotes.B || 1)) * 100)}%
                                                    <span className="text-[10px] md:text-sm text-white/40">({battleVotes.A})</span>
                                                </motion.span>
                                            </div>
                                            <div className="h-5 md:h-8 lg:h-10 bg-white/5 rounded-md md:rounded-lg overflow-hidden border-2 border-white/5 p-0.5 shadow-inner">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-sm md:rounded-md relative"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(battleVotes.A / (battleVotes.A + battleVotes.B || 1)) * 100}%` }}
                                                    transition={{ duration: 1, ease: "circOut" }}
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1.5rem_1.5rem] animate-[stripe_1s_linear_infinite]" />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Option B */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <div className="flex justify-between items-end gap-2">
                                                <span className="text-sm md:text-[clamp(0.9rem,1.8vw,1.3rem)] lg:text-lg font-black uppercase tracking-wider opacity-60 line-clamp-1 flex-1">{activeBattle.option_b_name}</span>
                                                <motion.span
                                                    key={battleVotes.B}
                                                    initial={{ scale: 1.5, color: '#3b82f6' }}
                                                    animate={{ scale: 1, color: '#3b82f6' }}
                                                    className="text-lg md:text-2xl lg:text-3xl font-black shrink-0 flex items-baseline gap-1"
                                                >
                                                    {Math.round((battleVotes.B / (battleVotes.A + battleVotes.B || 1)) * 100)}%
                                                    <span className="text-[10px] md:text-sm text-white/40">({battleVotes.B})</span>
                                                </motion.span>
                                            </div>
                                            <div className="h-5 md:h-8 lg:h-10 bg-white/5 rounded-md md:rounded-lg overflow-hidden border-2 border-white/5 p-0.5 shadow-inner">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm md:rounded-md relative"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(battleVotes.B / (battleVotes.A + battleVotes.B || 1)) * 100}%` }}
                                                    transition={{ duration: 1, ease: "circOut" }}
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1.5rem_1.5rem] animate-[stripe_1s_linear_infinite]" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-1.5 md:mt-3 text-center">
                                        <div className="inline-block bg-white/5 backdrop-blur-3xl px-3 md:px-5 py-1.5 md:py-2 rounded-md md:rounded-lg border border-white/10">
                                            <p className="text-[8px] md:text-sm lg:text-base font-black text-white/40 uppercase tracking-[0.2em] animate-pulse whitespace-nowrap">
                                                {t('guest.voteFromPhone')}
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
            <div className="mt-auto pt-6 text-center relative z-10 shrink-0">
                <p className="text-[10px] md:text-sm font-black text-white/10 uppercase tracking-[0.5em]">
                    Powered by KolayDüğün Live
                </p>
            </div>
        </div>
    );
};

export default PublicDisplay;
