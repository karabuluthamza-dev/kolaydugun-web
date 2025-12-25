import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Zap, Heart, ThumbsUp, Disc, Mic2, Users, ArrowRight, CheckCircle2, Search, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveDemo = () => {
    const { t } = useLanguage();
    const [view, setView] = useState('guest'); // 'guest' or 'dj'
    const [song, setSong] = useState('');
    const [name, setName] = useState('');
    const [requests, setRequests] = useState([
        { id: 1, title: 'I Will Survive', artist: 'Gloria Gaynor', requester: 'Ayşe', mood: '💃', upvotes: 4, status: 'pending' },
        { id: 2, title: 'Erik Dalı', artist: 'Ömer Faruk Bostan', requester: 'Mehmet', mood: '🎉', upvotes: 12, status: 'pending' },
        { id: 3, title: 'Perfect', artist: 'Ed Sheeran', requester: 'Zeynep', mood: '❤️', upvotes: 8, status: 'pending' },
    ]);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSendRequest = (e) => {
        e.preventDefault();
        if (!song.trim()) return;

        const newRequest = {
            id: Date.now(),
            title: song,
            artist: 'Unknown Artist',
            requester: name || 'Misafir',
            mood: '✨',
            upvotes: 0,
            status: 'pending'
        };

        setRequests([newRequest, ...requests]);
        setShowSuccess(true);
        setSong('');
        setName('');

        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleUpvote = (id) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, upvotes: req.upvotes + 1 } : req
        ).sort((a, b) => b.upvotes - a.upvotes));
    };

    const handlePlay = (id) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: 'played' } : req
        ));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500/30">
            {/* Control Bar */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full p-1.5 flex gap-1 shadow-2xl">
                <button
                    onClick={() => setView('guest')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${view === 'guest' ? 'bg-prime text-white shadow-lg shadow-prime/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    {t('liveRequest.demo.guestView')}
                </button>
                <button
                    onClick={() => setView('dj')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${view === 'dj' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Disc className="w-4 h-4" />
                    {t('liveRequest.demo.djView')}
                </button>
            </div>

            <div className="pt-32 pb-20 px-4 container max-w-md mx-auto min-h-screen flex flex-col">
                <AnimatePresence mode="wait">
                    {view === 'guest' ? (
                        <motion.div
                            key="guest"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                                <Zap className="w-32 h-32 text-prime rotate-12" />
                            </div>

                            <div className="text-center mb-8 relative z-10">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                                    <Music className="w-8 h-8 text-prime" />
                                </div>
                                <h1 className="text-2xl font-black mb-1">{t('liveRequest.demo.welcome')}</h1>
                                <p className="text-slate-500 text-sm">Demo Mode</p>

                                {/* Limited Features Notice */}
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/80 leading-relaxed">
                                    <ShieldCheck className="w-4 h-4 mb-1 text-amber-500 mx-auto" />
                                    {t('liveRequest.demo.limitedNotice')}
                                </div>
                            </div>

                            {!showSuccess ? (
                                <form onSubmit={handleSendRequest} className="space-y-4 relative z-10">
                                    <div>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder={t('liveRequest.demo.songPlaceholder')}
                                                value={song}
                                                onChange={(e) => setSong(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-prime focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={t('liveRequest.demo.yourName')}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-prime focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-prime hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-prime/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Zap className="w-5 h-5" />
                                        {t('liveRequest.demo.sendRequest')}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_0.5s_ease-out]">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-500 mb-2">{t('liveRequest.demo.requestSent')}</h3>
                                </div>
                            )}

                            {/* Battle Widget */}
                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{t('liveRequest.demo.battleTitle')}</h3>
                                    <span className="bg-orange-500/20 text-orange-500 text-[10px] font-bold px-2 py-1 rounded">LIVE</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-orange-500 transition-all group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:to-orange-500/10 transition-all" />
                                        <span className="block text-xs text-slate-500 mb-1">Pop</span>
                                        <span className="block font-bold">Tarkan</span>
                                    </button>
                                    <button className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-blue-500 transition-all group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:to-blue-500/10 transition-all" />
                                        <span className="block text-xs text-slate-500 mb-1">Rock</span>
                                        <span className="block font-bold">Duman</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dj"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl h-[600px] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black">{t('liveRequest.demo.requests')}</h2>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs font-bold text-slate-500">LIVE</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                                {requests.map((req) => (
                                    <div key={req.id} className={`p-4 rounded-2xl border transition-all ${req.status === 'played' ? 'opacity-50 grayscale bg-slate-950 border-slate-800' : 'bg-white/5 border-white/10 hover:border-prime/50'}`}>
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg">{req.mood}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{req.requester}</span>
                                                </div>
                                                <h3 className="font-bold truncate text-white">{req.title}</h3>
                                                <p className="text-xs text-slate-500">{req.artist}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-slate-400 mb-2 justify-end">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    <span className="text-xs font-bold">{req.upvotes}</span>
                                                </div>
                                                {req.status !== 'played' && (
                                                    <button
                                                        onClick={() => handlePlay(req.id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                                <Link to="/register?type=vendor" className="inline-flex items-center gap-2 text-prime font-bold hover:underline mb-4">
                                    {t('liveRequest.cta')} <ArrowRight className="w-4 h-4" />
                                </Link>

                                {/* Full Features List */}
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mt-4">
                                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> PayPal Integration</div>
                                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Battle Mode (Voting)</div>
                                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Advanced Analytics</div>
                                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Custom QR Codes</div>
                                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Spam Protection</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveDemo;
