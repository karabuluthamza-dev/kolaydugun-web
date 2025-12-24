import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Play, Trash2, LayoutDashboard, QrCode, LogOut, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const DJDashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    // New Event Form
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: '', slug: '' });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // 1. Fetch events
            const { data: eventsData, error: err } = await supabase
                .from('live_events')
                .select('*')
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });

            if (err) throw err;

            // 2. Fetch request counts for each event (to show usage)
            const eventsWithCounts = await Promise.all(eventsData.map(async (ev) => {
                const { count } = await supabase
                    .from('live_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', ev.id);
                return { ...ev, request_count: count || 0 };
            }));

            setEvents(eventsWithCounts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch vendor tier to set limit
            const { data: vendor } = await supabase
                .from('vendors')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            const tier = vendor?.subscription_tier || 'free';
            const limit = tier === 'premium' ? 100 : 20;

            const slug = newEvent.slug || newEvent.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const { data, error: err } = await supabase
                .from('live_events')
                .insert([{
                    vendor_id: user.id,
                    event_name: newEvent.name,
                    slug: slug,
                    settings: {
                        request_limit: limit,
                        cooldown_sec: 60,
                        theme: 'dark'
                    }
                }])
                .select()
                .single();

            if (err) throw err;

            setEvents([{ ...data, request_count: 0 }, ...events]);
            setShowModal(false);
            setNewEvent({ name: '', slug: '' });
        } catch (err) {
            alert('Hata: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Bu etkinliği silmek istediğinize emin misiniz? Tüm istekler de silinecektir.')) return;

        try {
            const { error: err } = await supabase
                .from('live_events')
                .delete()
                .eq('id', id);

            if (err) throw err;
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            alert('Silme hatası: ' + err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 py-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Canlı İstek Paneli</h1>
                    <p className="text-slate-500 font-medium">Müzisyenler ve orkestralar için canlı istek yönetimi.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
                        title="Çıkış Yap"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-prime hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-prime/20 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        YENİ ETKİNLİK BAŞLAT
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-prime" />
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <LayoutDashboard className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-400">Henüz etkinlik yok</h2>
                    <p className="text-slate-500 mt-2">İlk canlı istek sayfanızı oluşturmak için yukarıdaki butonu kullanın.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={event.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold group-hover:text-prime transition-colors">{event.event_name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-2 h-2 rounded-full ${event.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {event.is_active ? 'Canlı Yayında' : 'Kapalı'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(`/live/${event.id}`, '_blank')}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                                        title="Canlı Yayını Başlat"
                                    >
                                        <Play className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/stats/${event.id}`)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all relative group"
                                        title="Analiz ve İstatistikler (Pro)"
                                    >
                                        <BarChart3 className="w-5 h-5" />
                                        {(event.settings?.request_limit || 0) <= 20 && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-prime rounded-full border-2 border-slate-900" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-800/50">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <QrCode className="w-4 h-4" />
                                        <span className="text-xs font-mono">/e/{event.slug}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${event.request_count >= (event.settings?.request_limit || 20) ? 'bg-red-500' : 'bg-prime'}`}
                                                style={{ width: `${Math.min((event.request_count / (event.settings?.request_limit || 20)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                                            {event.request_count} / {event.settings?.request_limit || 20} İSTEK
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/e/${event.slug}`;
                                        navigator.clipboard.writeText(url);
                                        alert('Link kopyalandı!');
                                    }}
                                    className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Link Kopyala
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 w-full max-w-md rounded-3xl p-8 border border-slate-800 shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6">Yeni Etkinlik</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Etkinlik Adı</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Örn: Ayşe & Barış Düğünü"
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-prime"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kısa Link (Slug)</label>
                                <div className="flex items-center bg-slate-800 rounded-2xl px-5 py-4">
                                    <span className="text-slate-500 text-sm">/e/</span>
                                    <input
                                        type="text"
                                        placeholder="ayse-baris"
                                        value={newEvent.slug}
                                        onChange={(e) => setNewEvent({ ...newEvent, slug: e.target.value })}
                                        className="flex-1 bg-transparent border-none p-0 ml-1 text-white focus:ring-0 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700"
                                >
                                    İPTAL
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] bg-prime hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-prime/20 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BAŞLAT'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DJDashboard;
