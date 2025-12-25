import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Send, CheckCircle2, AlertCircle, Loader2, ThumbsUp, Youtube, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { containsProfanity, filterProfanity } from '../utils/profanity';

const GuestPage = () => {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [song, setSong] = useState('');
    const [note, setNote] = useState('');
    const [name, setName] = useState('');
    const [mood, setMood] = useState('🎉'); // Default mood
    const [allRequests, setAllRequests] = useState([]);
    const [upvoteLoading, setUpvoteLoading] = useState(null);

    // Search State
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSongLink, setSelectedSongLink] = useState(null);
    const [selectedSongMetadata, setSelectedSongMetadata] = useState({});

    const moods = ['🎉', '🔥', '❤️', '💃', '🎧', '✨'];

    useEffect(() => {
        // Ensure deviceId exists
        if (!localStorage.getItem('live_device_id')) {
            localStorage.setItem('live_device_id', 'dev_' + Math.random().toString(36).substr(2, 9));
        }
        fetchEvent();

        // Setup realtime subscription for requests
        const channel = supabase
            .channel('public_requests')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'live_requests'
            }, () => {
                fetchOtherRequests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [slug]);

    // Search Effect
    useEffect(() => {
        if (!song || song.length < 3 || (selectedSongMetadata.trackName + ' - ' + selectedSongMetadata.artistName) === song) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=5`);
                const data = await res.json();
                setSearchResults(data.results || []);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [song]);

    useEffect(() => {
        if (event?.id) {
            fetchOtherRequests();
        }
    }, [event]);

    const fetchOtherRequests = async () => {
        if (!event?.id) return;
        const { data } = await supabase
            .from('live_requests')
            .select('*')
            .eq('event_id', event.id)
            .eq('status', 'pending')
            .order('upvote_count', { ascending: false })
            .limit(10);
        setAllRequests(data || []);
    };

    const fetchEvent = async () => {
        try {
            const { data, error: err } = await supabase
                .from('live_events')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (err) throw err;
            if (data.is_closed) throw new Error('Bu etkinlik şu an istek kabul etmiyor.');

            setEvent(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Etkinlik bulunamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!song.trim()) return;

        // Basic cooldown check (local only for MVP)
        const cooldown = (event.settings?.cooldown_sec || 60) * 1000;
        const lastSent = localStorage.getItem(`last_req_${slug}`);
        if (lastSent && Date.now() - parseInt(lastSent) < cooldown) {
            const remaining = Math.ceil((cooldown - (Date.now() - parseInt(lastSent))) / 1000);
            alert(t('guest.cooldown', { sec: remaining }));
            return;
        }

        setSending(true);
        try {
            // 1. Check current request count vs limit
            const { count, error: countErr } = await supabase
                .from('live_requests')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id);

            if (countErr) throw countErr;

            const limit = event.settings?.request_limit || 20;
            if (count >= limit) {
                throw new Error('Bu etkinlik için maksimum istek limitine ulaşıldı.');
            }

            // 2. Insert the request
            const { error: err } = await supabase
                .from('live_requests')
                .insert([{
                    event_id: event.id,
                    song_title: filterProfanity(song.trim()),
                    note: filterProfanity(note.trim()),
                    requester_name: filterProfanity(name.trim()) || 'Misafir',
                    mood: mood,
                    status: 'pending',
                    song_link: selectedSongLink,
                    metadata: selectedSongMetadata
                }]);

            if (err) throw err;

            setSubmitted(true);
            localStorage.setItem(`last_req_${slug}`, Date.now().toString());
        } catch (err) {
            alert('Hata: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const getThemeStyles = () => {
        const theme = event?.settings?.theme || 'dark';
        switch (theme) {
            case 'light':
                return {
                    bg: 'bg-white',
                    card: 'bg-slate-50 border-slate-200',
                    text: 'text-slate-900',
                    muted: 'text-slate-500',
                    input: 'bg-white border-slate-200 text-slate-900',
                    accent: 'text-prime',
                    button: 'bg-prime text-white shadow-prime/20'
                };
            case 'pride':
                return {
                    bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900',
                    card: 'bg-white/10 backdrop-blur-md border-white/20',
                    text: 'text-white',
                    muted: 'text-white/60',
                    input: 'bg-white/5 border-white/10 text-white placeholder:text-white/30',
                    accent: 'text-yellow-400',
                    button: 'bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white shadow-xl'
                };
            case 'neon':
                return {
                    bg: 'bg-black',
                    card: 'bg-black border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]',
                    text: 'text-white',
                    muted: 'text-cyan-500/60',
                    input: 'bg-black border-cyan-500/30 text-cyan-400 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-cyan-900',
                    accent: 'text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
                    button: 'bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                };
            default: // dark
                return {
                    bg: 'bg-slate-950',
                    card: 'bg-slate-900 border-slate-800',
                    text: 'text-white',
                    muted: 'text-slate-500',
                    input: 'bg-slate-900 border-slate-800 text-white',
                    accent: 'text-prime',
                    button: 'bg-prime text-white shadow-prime/20'
                };
        }
    };

    const styles = getThemeStyles();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <Loader2 className="w-8 h-8 animate-spin text-prime" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-xl font-bold mb-2">Hata</h1>
                <p className="text-slate-400">{error}</p>
            </div>
        );
    }

    return (
        <div className={`max-w-md mx-auto min-h-screen flex flex-col transition-colors duration-500 ${styles.bg} ${styles.text} p-6`}>
            {/* Header */}
            <div className="text-center mb-8 pt-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${styles.theme === 'light' ? 'bg-slate-200' : 'bg-white/10'}`}>
                    <Music className={`w-8 h-8 ${styles.accent}`} />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{event?.event_name}</h1>
                <p className={`${styles.muted} text-sm mt-1`}>{t('guest.subtitle')}</p>
            </div>

            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="space-y-1 relative">
                            <div className="flex items-center justify-between mb-1">
                                <label className={`text-[11px] font-bold ${styles.muted} uppercase tracking-wider ml-1`}>{t('guest.songTitle')}</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song || 'music')}`, '_blank')}
                                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                                        title="YouTube'da Ara"
                                    >
                                        <Youtube className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(song || 'music')}`, '_blank')}
                                        className="p-1.5 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] rounded-lg transition-all"
                                        title="Spotify'da Ara"
                                    >
                                        <Music className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative group">
                                <input
                                    required
                                    type="text"
                                    placeholder={t('guest.songPlaceholder')}
                                    value={song}
                                    onChange={(e) => setSong(e.target.value)}
                                    className={`w-full border rounded-2xl px-5 py-4 focus:ring-2 transition-all outline-none ${styles.input} ${styles.theme === 'neon' ? 'focus:ring-cyan-500/20' : 'focus:ring-prime'}`}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isSearching && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
                                    <Search className={`w-5 h-5 opacity-20 group-focus-within:opacity-50 transition-opacity ${styles.accent}`} />
                                </div>
                            </div>

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`absolute z-50 w-full mt-2 border rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-h-[300px] overflow-y-auto ${styles.card}`}
                                    >
                                        <div className="flex flex-col">
                                            {searchResults.map((result) => (
                                                <button
                                                    key={result.trackId}
                                                    type="button"
                                                    onClick={() => {
                                                        const fullTitle = `${result.trackName} - ${result.artistName}`;
                                                        setSong(fullTitle);
                                                        setSelectedSongLink(result.trackViewUrl);
                                                        setSelectedSongMetadata({
                                                            trackName: result.trackName,
                                                            artistName: result.artistName,
                                                            artworkUrl100: result.artworkUrl100,
                                                            previewUrl: result.previewUrl,
                                                            collectionName: result.collectionName
                                                        });
                                                        setSearchResults([]);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left border-b last:border-none ${styles.theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-white/5'}`}
                                                >
                                                    <img
                                                        src={result.artworkUrl100}
                                                        alt={result.trackName}
                                                        className="w-10 h-10 rounded-lg shadow-sm object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate pr-2">{result.trackName}</p>
                                                        <p className={`text-[11px] truncate mt-0.5 ${styles.muted}`}>{result.artistName}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-1">
                            <label className={`text-[11px] font-bold ${styles.muted} uppercase tracking-wider ml-1`}>{t('guest.name')}</label>
                            <input
                                type="text"
                                placeholder={t('guest.namePlaceholder')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full border rounded-2xl px-5 py-4 focus:ring-2 transition-all outline-none ${styles.input} focus:ring-slate-700`}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={`text-[11px] font-bold ${styles.muted} uppercase tracking-wider ml-1`}>{t('guest.selectMood')}</label>
                            <div className="flex justify-between gap-2">
                                {moods.map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMood(m)}
                                        className={`flex-1 py-3 rounded-2xl text-xl transition-all ${mood === m ? 'bg-prime text-white scale-110 shadow-lg shadow-prime/20' : 'bg-white/5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={`text-[11px] font-bold ${styles.muted} uppercase tracking-wider ml-1`}>{t('guest.note')}</label>
                            <textarea
                                placeholder={t('guest.notePlaceholder')}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                className={`w-full border rounded-2xl px-5 py-4 focus:ring-2 transition-all outline-none ${styles.input} focus:ring-slate-700 resize-none`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className={`w-full font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all border-none disabled:opacity-50 ${styles.button}`}
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {t('guest.send')}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 rounded-3xl border ${styles.card}`}
                    >
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold">{t('common.success_title', { defaultValue: 'Harika!' })}</h2>
                        <p className={styles.muted}>{t('guest.success')}</p>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setSong('');
                                setNote('');
                            }}
                            className={`${styles.accent} font-bold text-sm uppercase tracking-widest pt-4`}
                        >
                            {t('guest.sendNewRequest')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Other Requests / Upvote Section */}
            {!submitted && allRequests.length > 0 && (
                <div className="mt-12 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${styles.muted}`}>
                            {t('guest.otherRequests')}
                        </h3>
                        <div className="h-[1px] flex-1 bg-white/5 mx-4" />
                    </div>
                    <div className="space-y-3">
                        {allRequests.map((req) => {
                            const deviceId = localStorage.getItem('live_device_id') || 'guest';
                            const hasUpvoted = req.upvoted_by?.includes(deviceId);

                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-5 rounded-[2rem] border flex items-center justify-between gap-4 transition-all ${styles.input} border-transparent bg-white/5`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{req.mood}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${styles.muted}`}>
                                                {req.requester_name || 'MISAFIR'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold truncate">{req.song_title}</h4>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={async () => {
                                            if (hasUpvoted || upvoteLoading) return;
                                            setUpvoteLoading(req.id);
                                            const { error } = await supabase.rpc('upvote_request', {
                                                request_id: req.id,
                                                device_id: deviceId
                                            });
                                            setUpvoteLoading(null);
                                            if (error) console.error(error);
                                            else fetchOtherRequests();
                                        }}
                                        className={`px-4 py-3 rounded-2xl flex items-center gap-2 transition-all relative overflow-hidden ${hasUpvoted
                                            ? 'bg-prime text-white shadow-lg shadow-prime/40 border-prime'
                                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current animate-bounce' : ''}`} />
                                        <span className="text-sm font-black">{req.upvote_count}</span>
                                        {hasUpvoted && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1.5, opacity: 0 }}
                                                className="absolute inset-0 bg-white/20 rounded-full"
                                            />
                                        )}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            <footer className={`mt-auto py-8 text-center text-[10px] ${styles.muted} font-medium uppercase tracking-[0.2em]`}>
                Powered by KolayDüğün Live
            </footer>
        </div>
    );
};

export default GuestPage;
