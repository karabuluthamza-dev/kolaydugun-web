import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Music, Users, DollarSign, Activity, Calendar, Search, ExternalLink, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLiveRequestPanel = () => {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        activeEvents: 0,
        totalRequests: 0,
        totalVipRevenue: 0,
        activeDjs: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);

            // Fetch All Events
            const { data: eventsData, error: eventsErr } = await supabase
                .from('live_events')
                .select('*')
                .order('created_at', { ascending: false });

            if (eventsErr) throw eventsErr;

            // Fetch Vendors separately to avoid relationship issues
            const vendorIds = [...new Set(eventsData.map(e => e.vendor_id))].filter(Boolean);
            const { data: vendorsData, error: vendorsErr } = await supabase
                .from('vendors')
                .select('id, business_name, contact_email')
                .in('id', vendorIds);

            if (vendorsErr) console.warn('Vendor fetch error:', vendorsErr);

            // Map vendors to events
            const eventsWithVendors = eventsData.map(event => ({
                ...event,
                vendors: vendorsData?.find(v => v.id === event.vendor_id)
            }));

            // Fetch All Requests for metrics
            const { data: requestsData, error: requestsErr } = await supabase
                .from('live_requests')
                .select('is_vip, total_paid, status');

            if (requestsErr) throw requestsErr;

            setEvents(eventsWithVendors || []);

            // Calculate metrics
            const vipRevenue = requestsData?.reduce((sum, req) => sum + (parseFloat(req.total_paid) || 0), 0) || 0;
            const uniqueVendors = new Set(eventsData?.map(e => e.vendor_id)).size;

            setStats({
                activeEvents: eventsData?.filter(e => e.is_active).length || 0,
                totalRequests: requestsData?.length || 0,
                totalVipRevenue: vipRevenue,
                activeDjs: uniqueVendors
            });

        } catch (error) {
            console.error('Error fetching admin live data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            // Önce ilişkili live_requests kayıtlarını sil
            const { error: requestsError } = await supabase
                .from('live_requests')
                .delete()
                .eq('event_id', eventId);

            if (requestsError) {
                console.warn('İstek silme hatası (devam ediliyor):', requestsError);
            }

            // Şimdi etkinliği sil
            const { error, data } = await supabase
                .from('live_events')
                .delete()
                .eq('id', eventId)
                .select();

            console.log('Silme sonucu:', { error, data, eventId });

            if (error) {
                console.error('Etkinlik silme hatası:', error);
                alert(`Silme hatası: ${error.message || error.code || 'Bilinmeyen hata'}`);
                return;
            }

            // Başarılı - listeyi güncelle
            setEvents(prev => prev.filter(e => e.id !== eventId));
            setPendingDeleteId(null);

            // Metrikleri yenile
            fetchAdminData();
        } catch (error) {
            console.error('Beklenmeyen silme hatası:', error);
            alert(`Beklenmeyen hata: ${error.message || 'Bilinmeyen hata'}`);
        }
    };

    const filteredEvents = events.filter(event => {
        const searchLower = searchTerm.toLowerCase().trim();
        if (!searchLower) return true;

        const eventNameMatch = (event.event_name || '').toLowerCase().includes(searchLower);
        const vendorNameMatch = (event.vendors?.business_name || '').toLowerCase().includes(searchLower);
        const slugMatch = (event.slug || '').toLowerCase().includes(searchLower);

        return eventNameMatch || vendorNameMatch || slugMatch;
    });

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-prime border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Canlı İstek Monitörü</h1>
                    <p className="text-slate-500 font-medium mt-1">Sistemdeki tüm DJ etkinliklerini ve bahşiş akışını izleyin.</p>
                </div>
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 px-4 py-2">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Etkinlik veya DJ ara..."
                        className="bg-transparent border-none outline-none text-sm font-medium w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Aktif Etkinlik', value: stats.activeEvents, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Toplam İstek', value: stats.totalRequests, icon: Music, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'VIP Gelir (Tahmini)', value: `€${stats.totalVipRevenue}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { label: 'Aktif DJ Sayısı', value: stats.activeDjs, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Event List */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Etkinlik Listesi</h2>
                    <button onClick={fetchAdminData} className="text-sm font-bold text-prime hover:underline">Yenile</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-4">Etkinlik</th>
                                <th className="px-8 py-4">DJ / Vendor</th>
                                <th className="px-8 py-4">Durum</th>
                                <th className="px-8 py-4">Tarih</th>
                                <th className="px-8 py-4">Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900">{event.event_name}</p>
                                        <p className="text-xs text-slate-500">Slug: {event.slug}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-700">{event.vendors?.business_name}</p>
                                        <p className="text-xs text-slate-400">{event.vendors?.contact_email}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${event.is_active ? 'bg-green-600 animate-pulse' : 'bg-slate-400'}`} />
                                            {event.is_active ? 'Aktif' : 'Pasif'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-slate-600 font-medium">{new Date(event.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <a
                                                href={`/live/${event.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-prime hover:text-white transition-all"
                                                title="Panel"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={`/e/${event.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-prime hover:text-white transition-all"
                                                title="Giriş"
                                            >
                                                <Users className="w-4 h-4" />
                                            </a>
                                            {pendingDeleteId === event.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="px-3 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-all"
                                                    >
                                                        Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => setPendingDeleteId(null)}
                                                        className="px-3 py-2 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-300 transition-all"
                                                    >
                                                        İptal
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setPendingDeleteId(event.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLiveRequestPanel;
