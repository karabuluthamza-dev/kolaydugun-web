import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Play, Trash2, LayoutDashboard, QrCode, LogOut, Loader2, AlertCircle, BarChart3, Settings, HelpCircle, ChevronDown, ChevronUp, Monitor, Sparkles, CreditCard, Zap, CheckCircle2, Wallet, TrendingUp, MessageCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalButtons } from '@paypal/react-paypal-js';
import QRCodeModal from '../components/QRCodeModal';
import WeddingWrapped from '../components/WeddingWrapped';

const DJDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedCheckout, setSelectedCheckout] = useState(null);
    const [dbPlans, setDbPlans] = useState([]);
    const [dbPackages, setDbPackages] = useState([]);
    const [sysSettings, setSysSettings] = useState({});

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

    // Wrapped State
    const [wrappedEvent, setWrappedEvent] = useState(null);

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null });

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

            // 3. Fetch vendor profile
            const { data: vendorData } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', user.id)
                .single();

            if (vendorData) {
                setVendor(vendorData);
            }

            // 4. Fetch pricing data
            const { data: plans } = await supabase.from('subscription_plans').select('*').eq('is_active', true);
            const { data: pkgs } = await supabase.from('credit_packages').select('*').eq('is_active', true).order('price', { ascending: true });

            if (plans) {
                // Force Premium to 29 EUR
                const mappedPlans = plans.map(p => p.id === 'premium' ? { ...p, price_monthly: 29.00 } : p);
                setDbPlans(mappedPlans);
            }
            if (pkgs) {
                // Map credits to logical prices: 10->15, 50->50, 100->80
                const mappedPkgs = pkgs.map(p => {
                    if (p.credits === 10) return { ...p, price: 15.00 };
                    if (p.credits === 50) return { ...p, price: 50.00 };
                    if (p.credits === 100) return { ...p, price: 80.00 };
                    return p;
                });
                setDbPackages(mappedPkgs);
            }

            // 5. Fetch System Settings (Support Info)
            const { data: sData } = await supabase.from('system_settings').select('*');
            if (sData) {
                const smap = {};
                sData.forEach(s => smap[s.key] = s.value);
                setSysSettings(smap);
            }
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
            alert(t('common.error') + ': ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            // Try updating with paypal_link column first
            const { error: err } = await supabase
                .from('live_events')
                .update({
                    settings: settingsModal.event.settings,
                    paypal_link: settingsModal.event.paypal_link
                })
                .eq('id', settingsModal.event.id);

            // If column doesn't exist, fallback to settings JSONB
            if (err && (err.message?.includes('paypal_link') || err.code === 'PGRST204')) {
                console.warn('paypal_link column missing, falling back to settings JSONB');
                const { error: fallbackErr } = await supabase
                    .from('live_events')
                    .update({
                        settings: {
                            ...settingsModal.event.settings,
                            paypal_link: settingsModal.event.paypal_link
                        }
                    })
                    .eq('id', settingsModal.event.id);

                if (fallbackErr) {
                    console.error('Fallback update error:', fallbackErr);
                    throw fallbackErr;
                }
            } else if (err) {
                throw err;
            }

            setEvents(events.map(ev => ev.id === settingsModal.event.id ? settingsModal.event : ev));
            setSettingsModal({ isOpen: false, event: null });
        } catch (err) {
            console.error('Live settings update error:', err);
            alert(t('common.error') + ': ' + (err.message || JSON.stringify(err)));
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        setDeletingId(id);
        try {
            console.log("Supabase delete execution started for:", id);
            const { error: err } = await supabase
                .from('live_events')
                .delete()
                .eq('id', id);

            if (err) {
                console.error("Supabase error during delete:", err);
                throw err;
            }

            console.log("Event deleted successfully from DB:", id);
            setEvents(prev => prev.filter(ev => ev.id !== id));
            setDeleteModal({ isOpen: false, eventId: null });
        } catch (err) {
            console.error("handleDeleteEvent failed:", err);
            alert(t('common.error') + ': ' + (err.message || t('dashboard.eventCard.deleteError', { defaultValue: 'Silme işlemi gerçekleştirilemedi' })));
        } finally {
            setDeletingId(null);
        }
    };

    const handlePaymentSuccess = async (details, type, amount, credits = 0) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Record transaction
            const { error: txError } = await supabase.from('transactions').insert({
                user_id: user.id,
                type: type === 'premium' ? 'subscription_purchase' : 'credit_purchase',
                status: 'approved',
                amount: amount,
                credits_added: credits,
                description: type === 'premium' ? 'Premium Subscription via DJ Panel' : `Purchase of ${credits} credits via DJ Panel`,
                payment_id: details.id
            });
            if (txError) throw txError;

            // 2. Update vendor profile
            const updateData = {};
            if (type === 'premium') {
                updateData.subscription_tier = 'premium';
                // Add 30 days
                const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                updateData.subscription_end_date = endDate.toISOString();
                updateData.credit_balance = (vendor?.credit_balance || 0) + 12; // Bonus credits for premium

                // FEATURED (Top Placement) Automation
                updateData.featured_active = true;
                updateData.featured_until = endDate.toISOString();
            } else {
                updateData.credit_balance = (vendor?.credit_balance || 0) + credits;
            }

            const { error: updError } = await supabase
                .from('vendors')
                .update(updateData)
                .eq('id', user.id);
            if (updError) throw updError;

            // 3. Update local state
            await fetchEvents(); // Refetches vendor too
            setSelectedCheckout(null);

            // Show detailed success message
            const successTitle = t('dashboard.support.paymentSuccess');
            const orderLabel = t('dashboard.support.orderId');
            const helpLabel = t('dashboard.support.needHelp');
            const contactLabel = t('dashboard.support.contactAdmin');

            alert(`${successTitle}\n\n${orderLabel}: ${details.id}\n\n${helpLabel}\n${contactLabel}: ${sysSettings.support_email || 'kontakt@kolaydugun.de'}`);
        } catch (err) {
            console.error('Payment processing failed:', err);
            alert(t('dashboard.support.paymentError', { defaultValue: 'Ödeme tamamlandı ancak hesap güncellenirken bir hata oluştu. Lütfen destek ile iletişime geçin.' }));
        }
    };

    return (
        <div className="min-h-screen mesh-bg selection:bg-prime/30">
            <div className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-prime/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-center md:justify-start gap-3 mb-4"
                        >
                            <div className="p-2 bg-prime/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-prime" />
                            </div>
                            <span className="text-prime font-bold text-[10px] uppercase tracking-widest">{t('dashboard.controlCenter', { defaultValue: 'DJ Control Center' })}</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 premium-text tracking-tight uppercase">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-slate-400 text-base md:text-lg font-medium max-w-md mx-auto md:mx-0">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 relative z-10">
                        {/* Status Bar */}
                        <motion.div
                            className="hidden lg:flex items-center gap-6 mr-6 px-6 py-3 bg-white/5 rounded-2xl border border-white/10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5 opacity-50">{t('dashboard.sidebar.package', { defaultValue: 'PAKET' })}</span>
                                <span className="text-white font-black text-sm uppercase flex items-center gap-2">
                                    {vendor?.subscription_tier === 'premium' ? <Sparkles className="w-3 h-3 text-yellow-400" /> : <Zap className="w-3 h-3 text-slate-400" />}
                                    {vendor?.subscription_tier === 'premium' ? 'PREMIUM' : 'FREE'}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5 opacity-50">{t('dashboard.sidebar.credits', { defaultValue: 'KREDİ' })}</span>
                                <span className="text-white font-black text-sm flex items-center gap-2 tracking-tighter">
                                    <Wallet className="w-3 h-3 text-emerald-400" />
                                    {vendor?.credit_balance || 0}
                                </span>
                            </div>
                        </motion.div>

                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 items-center gap-1 md:gap-2 shadow-xl backdrop-blur-md w-full md:w-auto justify-center">
                            <button
                                onClick={() => setShowSubscriptionModal(true)}
                                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group relative"
                                title={t('dashboard.support.subscriptionTitle', { defaultValue: 'Abonelik ve Krediler' })}
                            >
                                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-prime rounded-full"></span>
                            </button>
                            <button
                                onClick={() => setShowFAQ(true)}
                                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                title={t('dashboard.support.helpTitle', { defaultValue: 'Yardım / SSS' })}
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    navigate('/login');
                                }}
                                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                title={t('common.logout')}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowModal(true)}
                            className="bg-prime hover:bg-rose-600 text-white w-full md:w-auto px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(244,63,94,0.3)] transition-all group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="font-black text-sm uppercase tracking-widest">{t('dashboard.createEvent')}</span>
                        </motion.button>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {events.map((event, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={event.id}
                                className="glass-card rounded-[32px] overflow-hidden group hover:border-white/20 transition-all duration-500 hover:shadow-prime/10"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex justify-between items-start gap-4 mb-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${event.is_active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-slate-600'}`}></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    {event.is_active ? t('dashboard.eventCard.active') : t('dashboard.eventCard.closed')}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-prime transition-colors duration-300 leading-tight">
                                                {event.event_name}
                                            </h3>
                                        </div>
                                        <div className="flex bg-black/20 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm self-start">
                                            <button
                                                onClick={() => navigate(`/stats/${event.id}`)}
                                                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative"
                                                title={t('dashboard.eventCard.stats')}
                                            >
                                                <BarChart3 className="w-5 h-5" />
                                                {(event.settings?.request_limit || 0) <= 20 && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 bg-prime rounded-full ring-2 ring-slate-900" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setSettingsModal({ isOpen: true, event: JSON.parse(JSON.stringify(event)) })}
                                                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                title={t('dashboard.settings.title')}
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDeleteModal({ isOpen: true, eventId: event.id });
                                                }}
                                                disabled={deletingId === event.id}
                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 cursor-pointer relative z-20"
                                                title={t('common.delete')}
                                            >
                                                {deletingId === event.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => window.open(`/live/${event.id}`, '_blank')}
                                            className="flex flex-col items-center justify-center p-6 bg-prime/10 border border-prime/20 rounded-[24px] group/btn transition-all hover:bg-prime hover:border-prime"
                                        >
                                            <Play className="w-6 h-6 text-prime group-hover/btn:text-white mb-2 transition-colors" />
                                            <span className="text-[10px] font-black text-prime group-hover/btn:text-white uppercase tracking-widest">{t('dashboard.eventCard.liveFeed')}</span>
                                        </motion.button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => window.open(`/display/${event.id}`, '_blank')}
                                                className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/5 rounded-[24px] hover:bg-white/10 transition-all"
                                            >
                                                <Monitor className="w-5 h-5 text-slate-400 mb-1" />
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">TV Feed</span>
                                            </button>
                                            <button
                                                onClick={() => setWrappedEvent(event)}
                                                className="flex flex-col items-center justify-center p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-[24px] hover:bg-yellow-500/10 transition-all"
                                            >
                                                <Sparkles className="w-5 h-5 text-yellow-500/60 mb-1" />
                                                <span className="text-[8px] font-black text-yellow-500/60 uppercase tracking-tighter">{t('dashboard.eventCard.wrapped', { defaultValue: 'Wrapped' })}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <QrCode className="w-3 h-3" />
                                                <span>/e/{event.slug}</span>
                                            </div>
                                            <span>{event.request_count} / {event.settings?.request_limit || 20}</span>
                                        </div>
                                        <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((event.request_count / (event.settings?.request_limit || 20)) * 100, 100)}%` }}
                                                className={`h-full ${event.request_count >= (event.settings?.request_limit || 20) ? 'bg-red-500' : 'bg-gradient-to-r from-prime to-rose-400'} shadow-[0_0_10px_rgba(244,63,94,0.3)]`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/e/${event.slug}`;
                                            setQrModal({ isOpen: true, url, name: event.event_name });
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
                                    >
                                        <QrCode className="w-4 h-4" />
                                        QR Code
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/e/${event.slug}`;
                                            navigator.clipboard.writeText(url);
                                            alert(t('dashboard.eventCard.linkCopied'));
                                        }}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-300 transition-all uppercase tracking-widest"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="glass-card w-full max-w-lg rounded-[40px] p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-prime to-transparent opacity-50"></div>
                            <h2 className="text-4xl font-black text-white mb-8 premium-text tracking-tight">{t('dashboard.modal.title')}</h2>
                            <form onSubmit={handleCreateEvent} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">{t('dashboard.modal.eventName')}</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder={t('dashboard.modal.namePlaceholder')}
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-6 py-5 text-white focus:ring-4 focus:ring-prime/20 focus:border-prime/50 transition-all placeholder:text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">{t('dashboard.modal.customSlug')}</label>
                                    <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-3xl px-6 py-5 focus-within:ring-4 focus-within:ring-prime/20 focus-within:border-prime/50 transition-all">
                                        <span className="text-slate-600 text-sm font-black mr-1">/e/</span>
                                        <input
                                            type="text"
                                            placeholder={t('dashboard.modal.slugPlaceholder')}
                                            value={newEvent.slug}
                                            onChange={(e) => setNewEvent({ ...newEvent, slug: e.target.value })}
                                            className="flex-1 bg-transparent border-none p-0 text-white focus:ring-0 text-sm font-bold placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-8 py-5 bg-white/5 text-slate-400 font-black rounded-3xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-[2] bg-prime hover:bg-rose-600 text-white font-black py-5 rounded-3xl shadow-[0_20px_40px_rgba(244,63,94,0.3)] disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                                    >
                                        {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('dashboard.modal.create')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Settings Modal */}
                <AnimatePresence>
                    {settingsModal.isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass-card w-full max-w-xl rounded-[40px] p-10 overflow-visible relative"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-prime/10 rounded-[24px]">
                                        <Settings className="w-8 h-8 text-prime" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white premium-text uppercase tracking-tight">{t('dashboard.settings.title')}</h2>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{settingsModal.event.event_name}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateSettings} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">
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
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-4 text-white focus:ring-4 focus:ring-prime/20 focus:border-prime/50 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">
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
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-4 text-white focus:ring-4 focus:ring-prime/20 focus:border-prime/50 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                                                {t('dashboard.settings.paypalHandle', { defaultValue: 'PayPal.me Kullanıcı Adı veya E-posta' })}
                                            </label>
                                            {(settingsModal.event.paypal_link || settingsModal.event.settings?.paypal_link) && (
                                                <a
                                                    href={settingsModal.event.paypal_link || settingsModal.event.settings?.paypal_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[9px] font-black text-prime hover:underline uppercase tracking-[0.2em] flex items-center gap-1"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    {t('dashboard.settings.testLink', { defaultValue: 'Bağlantıyı Test Et' })}
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-5 focus-within:ring-4 focus-within:ring-prime/20 focus-within:border-prime/50 transition-all group">
                                            <input
                                                type="text"
                                                placeholder={t('dashboard.settings.paypalPlaceholder', { defaultValue: 'Örn: kullaniciadi veya e-posta@gmail.com' })}
                                                value={(settingsModal.event.paypal_link || settingsModal.event.settings?.paypal_link || '').replace('https://paypal.me/', '')}
                                                onChange={(e) => {
                                                    let val = e.target.value.trim().replace(/\s+/g, '');
                                                    let fullLink = val;

                                                    if (val) {
                                                        if (val.includes('@')) {
                                                            // Keep as email
                                                            fullLink = val;
                                                        } else {
                                                            // Assume PayPal.me handle
                                                            const cleanVal = val.replace(/^(https?:\/\/)?(www\.)?paypal\.me\//i, '');
                                                            fullLink = cleanVal ? `https://paypal.me/${cleanVal}` : '';
                                                        }
                                                    }

                                                    setSettingsModal({
                                                        ...settingsModal,
                                                        event: {
                                                            ...settingsModal.event,
                                                            paypal_link: fullLink,
                                                            settings: {
                                                                ...settingsModal.event.settings,
                                                                paypal_link: fullLink
                                                            }
                                                        }
                                                    });
                                                }}
                                                className="flex-1 bg-transparent border-none p-0 text-white focus:ring-0 text-sm font-black placeholder:text-slate-800"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-600 mt-2 font-medium italic px-2 leading-relaxed">
                                            {t('dashboard.settings.paypalNote', { defaultValue: '* Önemli: PayPal.me kullanacaksanız profilinizin aktif olduğundan emin olun. E-posta yazarsanız klasik ödeme sayfası açılır.' })}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">
                                            {t('dashboard.settings.theme')}
                                        </label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                                                    className={`py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all border ${settingsModal.event.settings.theme === th
                                                        ? 'bg-prime border-prime text-white shadow-[0_10px_20px_rgba(244,63,94,0.3)]'
                                                        : 'bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {th}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block text-glow">{t('dashboard.settings.quickTips', { defaultValue: 'HIZLI BAHŞİŞ MİKTARLARI (EURO)' })}</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[2, 5, 10, 20].map((amount, idx) => (
                                                <input
                                                    key={idx}
                                                    type="number"
                                                    placeholder={amount}
                                                    value={settingsModal.event.settings?.quick_tips?.[idx] || ''}
                                                    onChange={(e) => {
                                                        const newTips = [...(settingsModal.event.settings?.quick_tips || [2, 5, 10, 20])];
                                                        newTips[idx] = parseInt(e.target.value) || 0;
                                                        setSettingsModal({
                                                            ...settingsModal,
                                                            event: {
                                                                ...settingsModal.event,
                                                                settings: { ...settingsModal.event.settings, quick_tips: newTips }
                                                            }
                                                        });
                                                    }}
                                                    className="w-full bg-white/[0.03] border border-white/10 focus:border-prime rounded-[20px] p-4 text-center text-sm font-black text-white transition-all placeholder:text-slate-800"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-10 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setSettingsModal({ isOpen: false, event: null })}
                                            className="flex-1 px-8 py-5 bg-white/5 text-slate-400 font-black rounded-3xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="flex-[2] bg-prime hover:bg-rose-600 text-white font-black py-5 rounded-3xl shadow-[0_20px_40px_rgba(244,63,94,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                        >
                                            {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : t('dashboard.settings.save')}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div >
                    )}
                </AnimatePresence >

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {deleteModal.isOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass-card w-full max-w-sm rounded-[40px] p-10 relative overflow-hidden text-center"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

                                <div className="w-20 h-20 bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-10 h-10 text-red-500" />
                                </div>

                                <h2 className="text-2xl font-black text-white mb-4 premium-text uppercase tracking-tight">{t('dashboard.eventCard.deleteAreYouSure', { defaultValue: 'Emin misiniz?' })}</h2>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                                    {t('dashboard.eventCard.deleteConfirm')}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => handleDeleteEvent(deleteModal.eventId)}
                                        disabled={deletingId === deleteModal.eventId}
                                        className="w-full py-5 bg-red-500 hover:bg-red-600 text-white font-black rounded-3xl shadow-[0_20px_40px_rgba(239,68,68,0.3)] transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deletingId === deleteModal.eventId ? <Loader2 className="w-5 h-5 animate-spin" /> : t('dashboard.eventCard.deleteConfirmBtn', { defaultValue: 'EVET, SİL' })}
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, eventId: null })}
                                        className="w-full py-5 bg-white/5 text-slate-400 font-black rounded-3xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Subscription & Credits Modal */}
                <AnimatePresence>
                    {showSubscriptionModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="glass-card w-full max-w-4xl rounded-[40px] relative overflow-hidden flex flex-col md:flex-row min-h-[500px]"
                            >
                                {/* Left Side: Status */}
                                <div className="md:w-1/3 p-10 bg-white/5 border-r border-white/10 flex flex-col">
                                    <div className="mb-10 text-center md:text-left">
                                        <div className="w-16 h-16 bg-prime/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                                            <Sparkles className="w-8 h-8 text-prime" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white premium-text uppercase tracking-tight mb-2">{t('dashboard.sidebar.subscriptionStatus', { defaultValue: 'Abonelik Durumu' })}</h2>
                                        <p className="text-slate-400 text-sm">{t('dashboard.sidebar.subNote', { defaultValue: 'Paket ve kredi bilgilerinizi buradan yönetebilirsiniz.' })}</p>
                                    </div>

                                    <div className="space-y-6 flex-grow">
                                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.sidebar.currentTier', { defaultValue: 'Mevcut Paket' })}</p>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${vendor?.subscription_tier === 'premium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-400/20 text-slate-400'}`}>
                                                    {vendor?.subscription_tier === 'premium' ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                                </div>
                                                <span className="text-white font-black uppercase tracking-tight">
                                                    {vendor?.subscription_tier === 'premium' ? t('dashboard.sidebar.premiumMember', { defaultValue: 'PREMIUM ÜYE' }) : t('dashboard.sidebar.freeMember', { defaultValue: 'ÜCRETSİZ ÜYE' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.sidebar.credits', { defaultValue: 'KREDİ' })}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400">
                                                        <Wallet className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-3xl font-black text-white tracking-tighter">
                                                        {vendor?.credit_balance || 0}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-md">{t('common.active', { defaultValue: 'AKTİF' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowSubscriptionModal(false)}
                                        className="mt-8 py-4 px-6 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all font-bold text-sm uppercase tracking-widest"
                                    >
                                        {t('common.close')}
                                    </button>
                                </div>

                                {/* Right Side: Plans */}
                                <div className="md:w-2/3 p-10 flex flex-col">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <CreditCard className="w-6 h-6 text-prime" />
                                            {t('dashboard.sidebar.upgradeTier', { defaultValue: 'Paketini Yükselt' })}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 overflow-y-auto max-h-[500px] p-2 custom-scrollbar">
                                        {/* Premium Plan Card */}
                                        {dbPlans.filter(p => p.id === 'premium').map(plan => (
                                            <div key={plan.id} className={`p-8 rounded-[35px] transition-all relative overflow-hidden group min-h-[400px] flex flex-col ${selectedCheckout?.id === plan.id ? 'ring-2 ring-prime bg-prime/5' : 'bg-gradient-to-br from-prime/20 to-rose-600/10 border-2 border-prime/40'}`}>
                                                <div className="absolute top-0 right-0 p-4">
                                                    <CheckCircle2 className="w-6 h-6 text-prime" />
                                                </div>
                                                <h4 className="text-xl font-black text-white mb-2 uppercase">PREMIUM</h4>
                                                <div className="flex items-baseline gap-1 mb-6">
                                                    <span className="text-3xl font-black text-white">{parseFloat(plan.price_monthly).toFixed(2)}€</span>
                                                    <span className="text-slate-500 text-xs font-bold uppercase">/{t('common.monthly', { defaultValue: 'aylık' })}</span>
                                                </div>

                                                {selectedCheckout?.id === plan.id ? (
                                                    <div className="mt-auto">
                                                        <PayPalButtons
                                                            style={{ layout: "vertical", height: 45, shape: 'pill' }}
                                                            createOrder={(data, actions) => {
                                                                return actions.order.create({
                                                                    purchase_units: [{
                                                                        amount: { value: plan.price_monthly.toString() },
                                                                        description: `KolayDugun ${plan.name} Subscription`
                                                                    }]
                                                                });
                                                            }}
                                                            onApprove={async (data, actions) => {
                                                                const details = await actions.order.capture();
                                                                handlePaymentSuccess(details, 'premium', plan.price_monthly, 12);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => setSelectedCheckout(null)}
                                                            className="w-full mt-3 py-2 text-slate-500 text-[10px] font-bold uppercase hover:text-white transition-colors"
                                                        >
                                                            {t('common.cancel')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col flex-1">
                                                        <ul className="space-y-3 mb-8">
                                                            <li className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                                                <CheckCircle2 className="w-3 h-3 text-prime" /> {t('dashboard.faq.a3', { defaultValue: 'Sınırsız Canlı İstek' })}
                                                            </li>
                                                            <li className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                                                <CheckCircle2 className="w-3 h-3 text-prime" /> {t('dashboard.plans.premiumFeature2', { defaultValue: 'En Üst Sıralarda Görünüm' })}
                                                            </li>
                                                            <li className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                                                <CheckCircle2 className="w-3 h-3 text-prime" /> {t('dashboard.plans.premiumFeature3', { defaultValue: '12 Hediye Kredi / Ay' })}
                                                            </li>
                                                        </ul>
                                                        <button
                                                            onClick={() => setSelectedCheckout({ id: plan.id, type: 'premium' })}
                                                            className="w-full mt-auto py-4 bg-prime hover:bg-rose-600 text-white font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest text-[10px]"
                                                        >
                                                            {t('dashboard.plans.upgradeNow', { defaultValue: 'HEMEN YÜKSELT' })}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Credit Packages */}
                                        {
                                            dbPackages.map(pkg => (
                                                <div key={pkg.id} className={`p-8 rounded-[35px] transition-all relative overflow-hidden group min-h-[400px] flex flex-col ${selectedCheckout?.id === pkg.id ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : 'bg-white/5 border border-white/10'}`}>
                                                    <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{pkg.name}</h4>
                                                    <div className="flex items-baseline gap-1 mb-6">
                                                        <span className="text-3xl font-black text-white">{parseFloat(pkg.price).toFixed(2)}€</span>
                                                        <span className="text-slate-500 text-xs font-bold uppercase">/{pkg.credits} {t('dashboard.sidebar.credits', { defaultValue: 'Krediler' })}</span>
                                                    </div>

                                                    {selectedCheckout?.id === pkg.id ? (
                                                        <div className="mt-auto">
                                                            <PayPalButtons
                                                                style={{ layout: "vertical", height: 45, shape: 'pill' }}
                                                                createOrder={(data, actions) => {
                                                                    return actions.order.create({
                                                                        purchase_units: [{
                                                                            amount: { value: pkg.price.toString() },
                                                                            description: `KolayDugun ${pkg.credits} Credits Pack`
                                                                        }]
                                                                    });
                                                                }}
                                                                onApprove={async (data, actions) => {
                                                                    const details = await actions.order.capture();
                                                                    handlePaymentSuccess(details, 'credits', pkg.price, pkg.credits);
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => setSelectedCheckout(null)}
                                                                className="w-full mt-3 py-2 text-slate-500 text-[10px] font-bold uppercase hover:text-white transition-colors"
                                                            >
                                                                {t('common.cancel')}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col flex-1">
                                                            <p className="text-slate-400 text-[10px] mb-8 font-medium">{t('dashboard.plans.creditsSub', { defaultValue: 'Sadece ihtiyacın olduğunda kullan. Sistem erişimini aktif tut.' })}</p>
                                                            <ul className="space-y-3 mb-8">
                                                                <li className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                                                    <div className="w-3 h-3 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                                                        <CheckCircle2 className="w-2 h-2 text-emerald-400" />
                                                                    </div>
                                                                    {pkg.credits} {t('dashboard.sidebar.credits', { defaultValue: 'Kredi' })}
                                                                </li>
                                                                <li className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                                                                    <div className="w-3 h-3 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                                                        <CheckCircle2 className="w-2 h-2 text-emerald-400" />
                                                                    </div>
                                                                    {t('dashboard.plans.flexibleUse', { defaultValue: 'Esnek Kullanım' })}
                                                                </li>
                                                            </ul>
                                                            <button
                                                                onClick={() => setSelectedCheckout({ id: pkg.id, type: 'credits' })}
                                                                className="w-full mt-auto py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                                            >
                                                                {t('dashboard.plans.buyCredits', { defaultValue: 'KREDİ SATIN AL' })}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="mt-auto flex flex-col gap-4">
                                        <div className="p-6 bg-emerald-400/5 rounded-3xl border border-emerald-400/10 flex items-center gap-6">
                                            <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h5 className="text-white font-bold text-sm tracking-tight">{t('dashboard.support.securePayment', { defaultValue: 'Güvenli Ödeme' })}</h5>
                                                <p className="text-slate-400 text-xs">{t('dashboard.support.securePaymentNote', { defaultValue: 'Ödemeleriniz PayPal aracılığıyla uçtan uca şifreli ve güvenli bir şekilde işlenir.' })}</p>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-prime/5 rounded-3xl border border-prime/10 flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-prime/10 rounded-xl flex items-center justify-center text-prime">
                                                    <HelpCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h5 className="text-white font-bold text-sm tracking-tight">{t('dashboard.support.title')}</h5>
                                                    <p className="text-slate-400 text-[10px]">{t('dashboard.support.subtitle')}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <a
                                                    href={`https://wa.me/${sysSettings.support_whatsapp || '4917643301828'}?text=Merhaba, Destek İstiyorum. Vendor ID: ${vendor?.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    {t('dashboard.support.whatsapp')}
                                                </a>
                                                <a
                                                    href={`mailto:${sysSettings.support_email || 'kontakt@kolaydugun.de'}?subject=Destek Talebi - Vendor ID: ${vendor?.id}`}
                                                    className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    {t('dashboard.support.email')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* FAQ Modal */}
                <AnimatePresence>
                    {showFAQ && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass-card w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
                            >
                                <div className="p-10 pb-6 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-prime/10 rounded-[20px]">
                                            <HelpCircle className="w-8 h-8 text-prime" />
                                        </div>
                                        <h2 className="text-3xl font-black text-white premium-text uppercase tracking-tight">{t('dashboard.faq.title')}</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowFAQ(false)}
                                        className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all transform hover:rotate-90 duration-300"
                                    >
                                        <Plus className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((num) => (
                                        <div
                                            key={num}
                                            className={`rounded-[24px] border transition-all duration-300 ${openAccordion === num ? 'border-prime/30 bg-prime/5 shadow-[0_10px_30px_rgba(244,63,94,0.1)]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setOpenAccordion(openAccordion === num ? null : num)}
                                                className="w-full p-6 flex items-center justify-between gap-4 text-left group"
                                            >
                                                <span className={`font-black text-sm uppercase tracking-wide leading-relaxed ${openAccordion === num ? 'text-prime' : 'text-slate-300 group-hover:text-white'}`}>
                                                    {t(`dashboard.faq.q${num}`)}
                                                </span>
                                                <div className={`p-2 rounded-xl transition-all ${openAccordion === num ? 'bg-prime/20 text-prime rotate-180' : 'bg-white/5 text-slate-600'}`}>
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {openAccordion === num && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-6 pt-0 text-slate-400 text-sm font-medium leading-relaxed border-t border-white/5">
                                                            {t(`dashboard.faq.a${num}`)}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 border-t border-white/5 text-center bg-white/[0.01]">
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
                                        {t('common.brand_footer', { defaultValue: 'KOLAYDÜĞÜN LIVE ASSIST' })}
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
                {wrappedEvent && (
                    <WeddingWrapped
                        event={wrappedEvent}
                        onClose={() => setWrappedEvent(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default DJDashboard;
