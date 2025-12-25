import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Check, X, Clock, Loader2, ChevronLeft, QrCode, MessageSquare, Volume2, VolumeX, ThumbsUp, Youtube, Flame, ExternalLink, Camera, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCodeModal from '../components/QRCodeModal';

const LiveFeed = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showBattleModal, setShowBattleModal] = useState(false);
    const [activeBattle, setActiveBattle] = useState(null);
    const [battleVotes, setBattleVotes] = useState({ A: 0, B: 0 });
    const [newBattle, setNewBattle] = useState({ title: 'Sıradaki Şarkı Modu?', optionA: '90lar Türkçe Pop', optionB: 'Modern Dans / House' });

    // Notification Sound
    const playNotification = () => {
        if (!soundEnabled) return;
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play blocked:', e));
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

    const handleStartBattle = async () => {
        const { data, error } = await supabase
            .from('live_battles')
            .insert([{
                event_id: eventId,
                title: newBattle.title,
                option_a_name: newBattle.optionA,
                option_b_name: newBattle.optionB
            }])
            .select()
            .single();

        if (error) alert(error.message);
        else {
            setActiveBattle(data);
            setShowBattleModal(false);
        }
    };

    const handleStopBattle = async () => {
        await supabase
            .from('live_battles')
            .update({ is_active: false })
            .eq('id', activeBattle.id);
        setActiveBattle(null);
        setBattleVotes({ A: 0, B: 0 });
    };

    useEffect(() => {
        fetchEvent();
        fetchRequests();
        fetchActiveBattle();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`live_updates_${eventId}`)
            .on('postgres_changes', {
                event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
                schema: 'public',
                table: 'live_requests',
                filter: `event_id=eq.${eventId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setRequests(prev => {
                        // Avoid duplicates
                        if (prev.find(r => r.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                    playNotification();
                    if ('vibrate' in navigator) navigator.vibrate(200);
                } else if (payload.eventType === 'UPDATE') {
                    setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
                } else if (payload.eventType === 'DELETE') {
                    setRequests(prev => prev.filter(r => r.id === payload.old.id));
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'live_battles',
                filter: `event_id=eq.${eventId}`
            }, (payload) => {
                if (payload.eventType === 'DELETE' || (payload.new && payload.new.is_active === false)) {
                    setActiveBattle(null);
                    setBattleVotes({ A: 0, B: 0 });
                } else {
                    setActiveBattle(payload.new);
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
        const { data, error: err } = await supabase
            .from('live_events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (err) setError(err.message);
        setEvent(data);
    };

    const fetchRequests = async () => {
        try {
            const { data, error: err } = await supabase
                .from('live_requests')
                .select('*')
                .eq('event_id', eventId)
                .order('is_vip', { ascending: false })
                .order('upvote_count', { ascending: false })
                .order('created_at', { ascending: false });

            if (err) throw err;
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id, status) => {
        try {
            // Optimistic UI Update: Immediately update status in local state
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

            const { error: err } = await supabase
                .from('live_requests')
                .update({ status })
                .eq('id', id);

            if (err) {
                // Rollback if database update fails
                console.error('Status update failed, fetching fresh data...', err);
                fetchRequests();
                throw err;
            }
        } catch (err) {
            alert('Hata: ' + err.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-prime" /></div>;

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const playedRequests = requests.filter(r => r.status === 'played');

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white selection:bg-prime selection:text-white font-sans overflow-hidden">
            <style>
                {`
                @keyframes border-glow {
                    0% { border-color: rgba(251, 191, 36, 0.3); box-shadow: 0 0 10px rgba(251, 191, 36, 0.1); }
                    50% { border-color: rgba(251, 191, 36, 0.8); box-shadow: 0 0 30px rgba(251, 191, 36, 0.3); }
                    100% { border-color: rgba(251, 191, 36, 0.3); box-shadow: 0 0 10px rgba(251, 191, 36, 0.1); }
                }
                .vip-card-glow {
                    animation: border-glow 2s infinite ease-in-out;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                `}
            </style>

            {/* Premium Header */}
            <header className="px-8 py-6 bg-black/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
                        <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{event?.event_name}</h1>
                            <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">CANLI</span>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-0.5">
                            {pendingRequests.length} {t('liveFeed.tabs.pending').toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowBattleModal(true)}
                        className={`p-4 rounded-2xl transition-all border ${activeBattle ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                    >
                        <Flame className={`w-5 h-5 ${activeBattle ? 'animate-bounce' : ''}`} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-4 rounded-2xl transition-all border ${soundEnabled ? 'bg-prime/10 border-prime/20 text-prime shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-white/5 border-white/5 text-white/20'}`}
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowQR(true)}
                        className="px-6 py-4 bg-prime border border-prime/20 rounded-2xl flex items-center gap-3 transition-all hover:bg-prime/90 group shadow-[0_10px_30px_rgba(244,63,94,0.3)]"
                    >
                        <QrCode className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{t('liveFeed.qrLink')}</span>
                    </motion.button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8 bg-[radial-gradient(circle_at_top_right,_#111_0%,_#050505_100%)]">
                {pendingRequests.length === 0 && (
                    <div className="text-center py-40 flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mb-8 border border-white/5 animate-pulse">
                            <Music className="w-12 h-12 text-white/10" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.4em] text-white/20">{t('liveFeed.noRequests')}</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout" initial={false}>
                    {pendingRequests.map((req) => (
                        <motion.div
                            layout
                            key={req.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 200, scale: 0.9 }}
                            className={`group relative glass-card rounded-[3.5rem] overflow-hidden transition-all duration-700 ${req.is_vip ? 'vip-card-glow border-[3px]' : 'hover:border-white/20 hover:bg-white/[0.05]'}`}
                        >
                            {/* Card Decorative Elements */}

                            <div className="flex flex-col lg:flex-row">
                                {/* Left Side: Media & Info */}
                                <div className="flex-1 p-10 md:p-12">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Artwork */}
                                        <div className="relative shrink-0">
                                            {req.image_url ? (
                                                <div className="relative group/img">
                                                    <img
                                                        src={req.image_url}
                                                        alt="Dedication"
                                                        className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] object-cover shadow-2xl transition-transform duration-700 group-hover/img:scale-105"
                                                    />
                                                    <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10" />
                                                    <div className="absolute bottom-4 right-4 bg-prime/90 text-white p-3 rounded-2xl shadow-xl backdrop-blur-md">
                                                        <Camera className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/5 overflow-hidden shadow-2xl">
                                                    {req.metadata?.artworkUrl100 ? (
                                                        <img src={req.metadata.artworkUrl100} className="w-full h-full object-cover opacity-80" alt="" />
                                                    ) : (
                                                        <Music className="w-12 h-12 text-white/10" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-prime font-black uppercase tracking-[0.2em] text-sm">{req.artist_name || (req.metadata?.artistName) || 'İSTEK'}</span>
                                                {req.upvote_count > 0 && (
                                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                                        <ThumbsUp className={`w-3.5 h-3.5 ${req.upvote_count >= 3 ? 'text-orange-500 fill-current animate-bounce' : 'text-white/40'}`} />
                                                        <span className="text-xs font-black">{req.upvote_count}</span>
                                                    </div>
                                                )}
                                                {req.is_vip && (
                                                    <div className="bg-amber-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/10 flex items-center gap-1.5">
                                                        <Heart className="w-2.5 h-2.5 fill-current" />
                                                        VIP
                                                    </div>
                                                )}
                                                <span className="text-xs font-bold text-white/20 ml-auto">
                                                    {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <h2 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight group-hover:text-prime transition-colors">
                                                {req.song_title}
                                                {req.mood && <span className="ml-4 inline-block animate-wave">{req.mood}</span>}
                                            </h2>

                                            {req.note && (
                                                <div className="relative group/note p-6 bg-white/[0.02] border border-white/5 rounded-3xl mt-6 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-prime/50 before:rounded-full">
                                                    <p className="text-lg md:text-xl font-medium text-white/60 italic leading-relaxed">
                                                        "{req.note}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 pt-4 text-white/30">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black border border-white/5">
                                                    {(req.requester_name || 'M')[0].toUpperCase()}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{req.requester_name || 'MİSAFİR'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="lg:w-[450px] bg-white/[0.02] border-l border-white/5 p-10 md:p-12 flex flex-col justify-between gap-8">
                                    {/* Utility Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs font-black tracking-widest text-white/20 uppercase">Arama Araçları</div>
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(req.song_title)}`, '_blank')}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/10"
                                            >
                                                <Youtube className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(req.song_title)}`, '_blank')}
                                                className="p-3 bg-[#1DB954]/10 text-[#1DB954] rounded-2xl hover:bg-[#1DB954]/20 transition-all border border-[#1DB954]/10"
                                            >
                                                <Music className="w-5 h-5" />
                                            </motion.button>
                                            {req.song_link && (
                                                <motion.button
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                    onClick={() => window.open(req.song_link, '_blank')}
                                                    className="p-3 bg-prime/10 text-prime rounded-2xl hover:bg-prime/20 transition-all border border-prime/10"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Jumbo Buttons */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => updateRequestStatus(req.id, 'played')}
                                            className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-500 to-emerald-600 text-black rounded-[2.5rem] shadow-[0_20px_40px_rgba(16,185,129,0.2)] py-10"
                                        >
                                            <Check className="w-10 h-10 stroke-[3]" />
                                            <span className="text-[11px] font-black tracking-[0.3em] uppercase">{t('liveFeed.actions.play')}</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => updateRequestStatus(req.id, 'rejected')}
                                            className="flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 border border-white/10 rounded-[2.5rem] py-10 transition-all group/btn"
                                        >
                                            <X className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
                                            <span className="text-[11px] font-black tracking-[0.3em] uppercase">{t('liveFeed.actions.reject')}</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Refined History Section */}
                {playedRequests.length > 0 && (
                    <div className="pt-20 space-y-10 pb-20">
                        <div className="flex items-center gap-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 whitespace-nowrap">{t('liveFeed.tabs.played')}</h3>
                            <div className="h-px bg-white/5 flex-1" />
                            <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-white/20 border border-white/5">{playedRequests.length}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {playedRequests.map((req) => (
                                <motion.div
                                    key={req.id}
                                    whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.04)' }}
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-prime/10 transition-colors">
                                            <Music className="w-5 h-5 text-white/20 group-hover:text-prime" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-white/60 truncate mb-0.5 group-hover:text-white transition-colors">{req.song_title}</p>
                                            <p className="text-[9px] text-white/20 font-black tracking-[0.2em] uppercase">{req.requester_name || 'MISAFIR'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateRequestStatus(req.id, 'pending')}
                                        className="p-4 hover:bg-white/10 rounded-2xl text-white/20 hover:text-white transition-all"
                                    >
                                        <Clock className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Premium Alert for New Requests */}
            <AnimatePresence>
                {pendingRequests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <div className="bg-prime text-white px-8 py-4 rounded-full font-black text-[10px] tracking-[0.3em] shadow-[0_20px_60px_rgba(244,63,94,0.5)] flex items-center gap-4 animate-bounce items-center backdrop-blur-md border border-white/20">
                            <Music className="w-5 h-5 animate-pulse" />
                            {t('liveFeed.newRequestsAlert').toUpperCase()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            <QRCodeModal
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                url={`${window.location.origin}/e/${event?.slug}`}
                eventName={event?.event_name}
            />

            {/* Premium Battle Mode Modal */}
            <AnimatePresence>
                {showBattleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a]/80 w-full max-w-xl rounded-[3.5rem] p-12 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

                            <div className="flex items-center gap-6 mb-12 relative z-10">
                                <div className="p-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-lg shadow-orange-500/20">
                                    <Flame className="w-10 h-10 text-white animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase tracking-[0.05em]">Kapışma Modu</h2>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-1">Canlı İzleyici Oylaması</p>
                                </div>
                                <button
                                    onClick={() => setShowBattleModal(false)}
                                    className="ml-auto p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {activeBattle ? (
                                <div className="space-y-8 relative z-10">
                                    <div className="p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-white/90">{activeBattle.title}</h3>
                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">AKTİF</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3 px-2">
                                                    <span className="text-orange-500">{activeBattle.option_a_name}</span>
                                                    <span>%{Math.round((battleVotes.A / (battleVotes.A + battleVotes.B || 1)) * 100)}</span>
                                                </div>
                                                <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(battleVotes.A / (battleVotes.A + battleVotes.B || 1)) * 100}%` }}
                                                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-1000"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3 px-2">
                                                    <span className="text-blue-500">{activeBattle.option_b_name}</span>
                                                    <span>%{Math.round((battleVotes.B / (battleVotes.A + battleVotes.B || 1)) * 100)}</span>
                                                </div>
                                                <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(battleVotes.B / (battleVotes.A + battleVotes.B || 1)) * 100}%` }}
                                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-1000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-center text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                            TOPLAM OY: {battleVotes.A + battleVotes.B}
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStopBattle}
                                        className="w-full bg-white text-black font-black py-6 rounded-3xl shadow-xl transition-all uppercase tracking-[0.2em] text-sm"
                                    >
                                        OYLAMAYI SONLANDIR
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-10 relative z-10">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-4 block">BAŞLIK / SORU</label>
                                            <input
                                                type="text"
                                                placeholder="Örn: Sıradaki şarkı ne olsun?"
                                                value={newBattle.title}
                                                onChange={(e) => setNewBattle({ ...newBattle, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-white focus:ring-2 focus:ring-prime transition-all placeholder:text-white/10 text-lg font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-orange-500/40 uppercase tracking-[0.3em] ml-4 block tracking-tighter">SEÇENEK A</label>
                                                <input
                                                    type="text"
                                                    value={newBattle.optionA}
                                                    onChange={(e) => setNewBattle({ ...newBattle, optionA: e.target.value })}
                                                    className="w-full bg-orange-500/5 border border-orange-500/10 rounded-3xl px-8 py-5 text-white focus:ring-2 focus:ring-orange-500 transition-all text-sm font-bold"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-blue-500/40 uppercase tracking-[0.3em] ml-4 block tracking-tighter">SEÇENEK B</label>
                                                <input
                                                    type="text"
                                                    value={newBattle.optionB}
                                                    onChange={(e) => setNewBattle({ ...newBattle, optionB: e.target.value })}
                                                    className="w-full bg-blue-500/5 border border-blue-500/10 rounded-3xl px-8 py-5 text-white focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <motion.button
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                            onClick={() => setShowBattleModal(false)}
                                            className="flex-1 px-8 py-6 bg-white/5 text-white/40 font-black rounded-3xl border border-white/5 transition-all text-[11px] tracking-widest"
                                        >
                                            İPTAL
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleStartBattle}
                                            className="flex-[2] bg-orange-500 hover:bg-orange-400 text-black font-black py-6 rounded-3xl shadow-[0_20px_40px_rgba(249,115,22,0.3)] transition-all uppercase tracking-widest text-[11px]"
                                        >
                                            SAVAŞI BAŞLAT
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default LiveFeed;
