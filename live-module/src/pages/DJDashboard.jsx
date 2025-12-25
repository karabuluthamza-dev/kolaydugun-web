import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Play, Trash2, LayoutDashboard, QrCode, LogOut, Loader2, AlertCircle, BarChart3, Settings, HelpCircle, ChevronDown, ChevronUp, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCodeModal from '../components/QRCodeModal';

const DJDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    // New Event Form
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: '', slug: '' });

    // FAQ State
    const [showFAQ, setShowFAQ] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);

    // Settings Modal State
    const [settingsModal, setSettingsModal] = useState({ isOpen: false, event: null });

    // QR Modal State
    const [qrModal, setQrModal] = useState({ isOpen: false, url: '', name: '' });

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

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const { error: err } = await supabase
                .from('live_events')
                .update({ settings: settingsModal.event.settings })
                .eq('id', settingsModal.event.id);

            if (err) throw err;

            setEvents(events.map(ev => ev.id === settingsModal.event.id ? settingsModal.event : ev));
            setSettingsModal({ isOpen: false, event: null });
        } catch (err) {
            alert('Hata: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteEvent = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Attempting to delete event:", id);

        if (!window.confirm(t('dashboard.eventCard.deleteConfirm'))) {
            console.log("Deletion cancelled by user");
            return;
        }

        try {
            const { error: err } = await supabase
                .from('live_events')
                .delete()
                .eq('id', id);

            if (err) {
                console.error("Supabase delete error:", err);
                throw err;
            }

            console.log("Event deleted successfully:", id);
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            console.error("Catch block delete error:", err);
            alert('Silme hatası: ' + err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 py-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">{t('dashboard.title')}</h1>
                    <p className="text-slate-500 font-medium">{t('dashboard.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFAQ(true)}
                        className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
                        title="Yardım / SSS"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
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
                        {t('dashboard.createEvent')}
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
                    <h2 className="text-xl font-bold text-slate-400">{t('dashboard.noEvents')}</h2>
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
                                            {event.is_active ? t('dashboard.eventCard.active') : t('dashboard.eventCard.closed')}
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
                                        onClick={() => {
                                            const url = `${window.location.origin}/e/${event.slug}`;
                                            setQrModal({ isOpen: true, url, name: event.event_name });
                                        }}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all relative group"
                                        title="QR Kod Oluştur"
                                    >
                                        <QrCode className="w-5 h-5" />
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
                                        onClick={() => setSettingsModal({ isOpen: true, event: JSON.parse(JSON.stringify(event)) })}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                                        title="Etkinlik Ayarları"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => window.open(`/display/${event.id}`, '_blank')}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-prime rounded-xl transition-all"
                                        title="TV / Ekran Görünümü (Crowd View)"
                                    >
                                        <Monitor className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteEvent(e, event.id)}
                                        className="p-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-500 rounded-xl transition-all"
                                        title={t('common.delete')}
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
                                            {event.request_count} / {event.settings?.request_limit || 20} {t('dashboard.eventCard.requests')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/e/${event.slug}`;
                                        navigator.clipboard.writeText(url);
                                        alert(t('dashboard.eventCard.linkCopied'));
                                    }}
                                    className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    {t('dashboard.eventCard.copyLink')}
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
                        <h2 className="text-2xl font-bold mb-6">{t('dashboard.modal.title')}</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('dashboard.modal.eventName')}</label>
                                <input
                                    required
                                    type="text"
                                    placeholder={t('dashboard.modal.namePlaceholder')}
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-prime"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('dashboard.modal.customSlug')}</label>
                                <div className="flex items-center bg-slate-800 rounded-2xl px-5 py-4">
                                    <span className="text-slate-500 text-sm">/e/</span>
                                    <input
                                        type="text"
                                        placeholder={t('dashboard.modal.slugPlaceholder')}
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
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] bg-prime hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-prime/20 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : t('dashboard.modal.create')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Settings Modal */}
            <AnimatePresence>
                {settingsModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 w-full max-w-lg rounded-3xl p-8 border border-slate-800 shadow-2xl overflow-hidden relative"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-prime/10 rounded-2xl">
                                    <Settings className="w-6 h-6 text-prime" />
                                </div>
                                <h2 className="text-2xl font-bold">{t('dashboard.settings.title')}</h2>
                            </div>

                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                            {t('dashboard.settings.requestLimit')}
                                        </label>
                                        <input
                                            type="number"
                                            value={settingsModal.event.settings.request_limit}
                                            onChange={(e) => setSettingsModal({
                                                ...settingsModal,
                                                event: {
                                                    ...settingsModal.event,
                                                    settings: { ...settingsModal.event.settings, request_limit: parseInt(e.target.value) }
                                                }
                                            })}
                                            className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-prime"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                            {t('dashboard.settings.cooldown')}
                                        </label>
                                        <input
                                            type="number"
                                            value={settingsModal.event.settings.cooldown_sec}
                                            onChange={(e) => setSettingsModal({
                                                ...settingsModal,
                                                event: {
                                                    ...settingsModal.event,
                                                    settings: { ...settingsModal.event.settings, cooldown_sec: parseInt(e.target.value) }
                                                }
                                            })}
                                            className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-prime"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                        {t('dashboard.settings.theme')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['dark', 'light', 'pride', 'neon'].map((th) => (
                                            <button
                                                key={th}
                                                type="button"
                                                onClick={() => setSettingsModal({
                                                    ...settingsModal,
                                                    event: {
                                                        ...settingsModal.event,
                                                        settings: { ...settingsModal.event.settings, theme: th }
                                                    }
                                                })}
                                                className={`py-3 rounded-2xl font-bold border-2 transition-all capitalize ${settingsModal.event.settings.theme === th
                                                    ? 'bg-prime border-prime text-white'
                                                    : 'bg-slate-800 border-transparent text-slate-400 hover:border-slate-700'
                                                    }`}
                                            >
                                                {th}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                                    <button
                                        type="button"
                                        onClick={() => setSettingsModal({ isOpen: false, event: null })}
                                        className="flex-1 px-6 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-[2] bg-prime hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-prime/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : t('dashboard.settings.save')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FAQ Modal */}
            <AnimatePresence>
                {showFAQ && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-prime/10 rounded-2xl">
                                        <HelpCircle className="w-6 h-6 text-prime" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{t('dashboard.faq.title')}</h2>
                                </div>
                                <button
                                    onClick={() => setShowFAQ(false)}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                    <div
                                        key={num}
                                        className={`border rounded-2xl transition-all overflow-hidden ${openAccordion === num ? 'border-prime bg-prime/5' : 'border-slate-800 bg-slate-800/20 hover:border-slate-700'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenAccordion(openAccordion === num ? null : num)}
                                            className="w-full p-5 flex items-center justify-between gap-4 text-left"
                                        >
                                            <span className={`font-bold ${openAccordion === num ? 'text-prime' : 'text-slate-200'}`}>
                                                {t(`dashboard.faq.q${num}`)}
                                            </span>
                                            {openAccordion === num ? (
                                                <ChevronUp className="w-5 h-5 text-prime shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                                            )}
                                        </button>
                                        <AnimatePresence>
                                            {openAccordion === num && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-800/50">
                                                        {t(`dashboard.faq.a${num}`)}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 border-t border-slate-800 text-center bg-slate-900/50">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                                    KolayDüğün Live Support
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <QRCodeModal
                isOpen={qrModal.isOpen}
                onClose={() => setQrModal({ ...qrModal, isOpen: false })}
                url={qrModal.url}
                eventName={qrModal.name}
            />
        </div>
    );
};

export default DJDashboard;
