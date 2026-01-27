import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { dictionary } from '../locales/dictionary';
import './AdminVendors.css'; // Reuse existing dashboard styles

const AdminWarRoom = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [targets, setTargets] = useState([]);
    const [analytics, setAnalytics] = useState({}); // Analytics data per vendor
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isMessaging, setIsMessaging] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('tr_warm');
    const [customMessage, setCustomMessage] = useState('');
    const [importUrl, setImportUrl] = useState('');
    const [newVenue, setNewVenue] = useState({ name: '', city: '', instagram: '', description: '', capacity: '' });
    const [stats, setStats] = useState({ total: 28, inProgress: 0, won: 0, hotLeads: 0 });
    const [editLang, setEditLang] = useState('tr'); // 'tr', 'de', 'en'

    const ensureMultilingual = (val) => {
        if (val && typeof val === 'object' && (val.tr || val.de || val.en)) return val;
        return { tr: val || '', de: val || '', en: val || '' };
    };

    const statusOptions = [
        { value: 'draft', label: { tr: 'Taslak', de: 'Entwurf', en: 'Draft' }, color: '#94a3b8' },
        { value: 'profile_ready', label: { tr: 'Sayfa Hazır', de: 'Profil Bereit', en: 'Profile Ready' }, color: '#3b82f6' },
        { value: 'hook_sent', label: { tr: 'Olta Atıldı', de: 'Nachricht gesendet', en: 'Hook Sent' }, color: '#f59e0b' },
        { value: 'in_talk', label: { tr: 'Görüşülüyor', de: 'Im Gespräch', en: 'In Talk' }, color: '#a855f7' },
        { value: 'won', label: { tr: 'El Sıkışıldı 🤝', de: 'Partner gewonnen 🤝', en: 'Partnership Won 🤝' }, color: '#10b981' },
        { value: 'cancelled', label: { tr: 'İptal', de: 'Abgebrochen', en: 'Cancelled' }, color: '#ef4444' }
    ];

    useEffect(() => {
        fetchTargets();
    }, []);

    const getApiKey = () => {
        return localStorage.getItem('admin_gemini_api_key')?.trim() || import.meta.env.VITE_GEMINI_API_KEY?.trim();
    };

    const handleAiImport = async () => {
        if (!importUrl) return alert('Lütfen bir URL girin (Instagram veya Web)');
        setAiLoading(true);
        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API Key eksik (.env veya Ayarlar).");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Aşağıdaki URL'den bir düğün salonunun bilgilerini ayıkla: ${importUrl}
                Sadece şu formatta JSON döndür (başka metin ekleme):
                {
                    "name": "Salon Adı",
                    "city": "Şehir",
                    "description": "Kısa tanıtım yazısı (max 200 karakter)",
                    "capacity": "Kapasite (Sadece sayı rakam)",
                    "instagram": "Bulabiliyorsan instagram url"
                }
                Not: Eğer bilgi bulamazsan mantıklı tahminlerde bulun veya boş bırak.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(text);

            setNewVenue({
                name: data.name || '',
                city: data.city || '',
                instagram: data.instagram || importUrl,
                description: data.description || '',
                capacity: data.capacity || ''
            });

            alert('AI Bilgileri başarıyla ayıkladı! Lütfen kontrol edip onaylayın.');
        } catch (error) {
            console.error('AI Import error:', error);
            alert('AI ile veri çekilemedi: ' + error.message);
        } finally {
            setAiLoading(false);
        }
    };

    const fetchTargets = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('source', 'war_room')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedTargets = (data || []).map(v => ({
                id: v.id,
                name: v.business_name,
                city: v.city,
                slug: v.slug,
                status: v.details?.war_room_status || 'profile_ready',
                instagram: v.social_media?.instagram || v.scraper_source_url || '',
                notes: v.details?.admin_notes || '',
                is_featured: v.is_featured,
                details: v.details,
                last_contact_at: v.last_contact_at,
                follow_up_count: v.follow_up_count || 0
            }));

            setTargets(mappedTargets);

            // Fetch analytics for each target
            const analyticsData = {};
            for (const target of mappedTargets) {
                try {
                    const { data: statsData } = await supabase
                        .rpc('get_vip_demo_stats_by_name', { p_venue_name: target.name });
                    if (statsData && statsData[0]) {
                        analyticsData[target.id] = statsData[0];
                    }
                } catch (err) {
                    // Analytics table might not exist yet
                    console.log('Analytics not available for', target.name);
                }
            }
            setAnalytics(analyticsData);

            const wonCount = mappedTargets.filter(t => t.status === 'won').length;
            const inProgress = mappedTargets.filter(t => t.status !== 'won' && t.status !== 'draft').length;
            const hotLeads = Object.values(analyticsData).filter(a => a.is_hot_lead).length;
            setStats({ total: 28, inProgress, won: wonCount, hotLeads });
        } catch (error) {
            console.error('Error fetching war room targets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVenue = async (e) => {
        e.preventDefault();
        try {
            const slug = newVenue.name.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000);

            const { data, error } = await supabase.from('vendors').insert([{
                id: crypto.randomUUID(),
                business_name: newVenue.name,
                city: newVenue.city,
                slug: slug,
                source: 'war_room',
                is_claimed: false,
                is_verified: false,
                is_featured: false,
                scraper_source_url: newVenue.instagram,
                category: 'Düğün Salonu', // Default for War Room targets
                description: newVenue.description,
                capacity: parseInt(newVenue.capacity) || null,
                details: {
                    ...newVenue.details,
                    war_room_status: 'profile_ready',
                    ai_imported: true
                },
                social_media: {
                    instagram: newVenue.instagram
                }
            }]).select();

            if (error) throw error;

            setNewVenue({ name: '', city: '', instagram: '', description: '', capacity: '' });
            setImportUrl('');
            setIsAdding(false);
            fetchTargets();
            alert('Shadow Profile Created Successfully!');
        } catch (error) {
            alert('Error adding venue: ' + error.message);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const target = targets.find(t => t.id === id);

            // 1. Update status in vendors table
            const { error } = await supabase.from('vendors').update({
                details: {
                    ...(target.details || {}),
                    war_room_status: newStatus
                }
            }).eq('id', id);

            if (error) throw error;

            // 2. If status is 'won', grant Elite Partner Credits (1000)
            if (newStatus === 'won') {
                const { data: vendor } = await supabase
                    .from('vendors')
                    .select('credit_balance')
                    .eq('id', id)
                    .single();

                const newBalance = (vendor?.credit_balance || 0) + 1000;

                await supabase
                    .from('vendors')
                    .update({
                        credit_balance: newBalance,
                        is_verified: true,
                        // Note: is_featured is NOT set automatically here anymore
                        details: {
                            ...(vendor?.details || {}),
                            vip_demo_config: {
                                ...(vendor?.details?.vip_demo_config || {}),
                                is_elite: true // War Room winners are considered Elite partners
                            }
                        }
                    })
                    .eq('id', id);

                alert('🤝 Harika! Salon "Kazanıldı" olarak işaretlendi ve 1000 kredi + Elite Partner statusü tanımlandı.');
            }

            fetchTargets();
        } catch (error) {
            alert('Status update failed: ' + error.message);
        }
    };

    const toggleFeatured = async (id, current) => {
        try {
            const { error } = await supabase.from('vendors').update({
                is_featured: !current
            }).eq('id', id);
            if (error) throw error;
            fetchTargets();
        } catch (error) {
            alert('Update failed');
        }
    };

    const templates = {
        tr_warm: {
            label: '🇹🇷 Sıcak/Güven (TR)',
            text: (t) => `Selamlar ${t.name} ekibi! Sizi KolayDugun'de inceledik. Sizin için harika bir "VIP Tanıtım Sayfası" hazırladık. Tasarımı buradan inceleyebilirsiniz: [LINK] \n\nÖzel İş Ortaklığı Teklifimiz: [PROPOSAL_LINK] \n\nNot: Bu hafta sadece 1 salonu Partner seçiyoruz, sizinle çalışmayı çok isteriz!`
        },
        tr_leads: {
            label: '🇹🇷 Hazır Müşteri (TR)',
            text: (t) => `Merhaba ${t.name}, sitemiz üzerinden salonunuz için yeni teklif istekleri var. Müşterileri size yönlendirebilmemiz için profilinizi aktif etmeniz gerekiyor. Taslak sayfanız hazır: [LINK] \n\nTeklif Detayları: [PROPOSAL_LINK]`
        },
        tr_reminder: {
            label: '🔔 Tekrar Hatırlatma (TR)',
            text: (t) => `Merhaba ${t.name}! Önceki mesajımızı görme şansınız olmadı mı? Size özel hazırladığımız VIP profil hala aktif: [LINK]\n\nTeklifimizi buradan inceleyebilirsiniz: [PROPOSAL_LINK]\n\n📅 Bu hafta sonu bazı çiftler bölgenizdeki mekanları araştırıyor. Profilinizi şimdi aktif edin!`
        },
        tr_urgency: {
            label: '⚡ Son Fırsat (TR)',
            text: (t) => `${t.name} - Önemli: VIP Partner başvuru dönemi bu hafta kapanıyor! 🚨\n\nSizin için hazırladığımız sayfa: [LINK]\n\nİş Ortaklığı Teklifi: [PROPOSAL_LINK]\n\n✨ Avantajlar: Premium listeleme, AI eşleştirme, öncelikli destek\n\n Son 48 saat!`
        },
        de_prof: {
            label: '🇩🇪 Professionell (DE)',
            text: (t) => `Hallo Team ${t.name}! Wir haben für Ihr Haus auf KolayDugun.de ein Premium-Profil erstellt. Wir sehen bereits erste Anfragen aus Ihrer Region. Hier können Sie die Vorschau sehen: [LINK]\n\nUnser Partnerschaftsangebot: [PROPOSAL_LINK]`
        }
    };

    // Check if follow-up is needed (3+ days since last contact)
    const needsFollowUp = (target) => {
        if (!target.last_contact_at) return false;
        const daysSinceContact = Math.floor((Date.now() - new Date(target.last_contact_at).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceContact >= 3 && target.status !== 'won' && target.status !== 'cancelled';
    };

    const openMessagingModal = (target) => {
        setSelectedTarget(target);
        const vipUrl = `${window.location.origin}/vip-demo?venue=${encodeURIComponent(target.name)}&city=${encodeURIComponent(target.city)}`;
        const proposalUrl = `${window.location.origin}/proposals/venues?venue=${encodeURIComponent(target.name)}&city=${encodeURIComponent(target.city)}`;
        const templateText = templates[selectedTemplate].text(target)
            .replace('[LINK]', vipUrl)
            .replace('[PROPOSAL_LINK]', proposalUrl);
        setCustomMessage(templateText);
        setIsMessaging(true);
    };

    useEffect(() => {
        if (selectedTarget) {
            const vipUrl = `${window.location.origin}/vip-demo?venue=${encodeURIComponent(selectedTarget.name)}&city=${encodeURIComponent(selectedTarget.city)}`;
            const proposalUrl = `${window.location.origin}/proposals/venues?venue=${encodeURIComponent(selectedTarget.name)}&city=${encodeURIComponent(selectedTarget.city)}`;
            const templateText = templates[selectedTemplate].text(selectedTarget)
                .replace('[LINK]', vipUrl)
                .replace('[PROPOSAL_LINK]', proposalUrl);
            setCustomMessage(templateText);
        }
    }, [selectedTemplate]);

    const sendWhatsApp = async () => {
        const waLink = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
        window.open(waLink, '_blank');

        // Update last_contact_at and increment follow_up_count
        try {
            const newFollowUpCount = (selectedTarget.follow_up_count || 0) + 1;
            await supabase.from('vendors').update({
                last_contact_at: new Date().toISOString(),
                follow_up_count: newFollowUpCount
            }).eq('id', selectedTarget.id);
        } catch (err) {
            console.error('Error updating contact info:', err);
        }

        // Auto-update status to 'hook_sent'
        if (selectedTarget.status === 'profile_ready' || selectedTarget.status === 'draft') {
            await updateStatus(selectedTarget.id, 'hook_sent');
        }
        setIsMessaging(false);
        fetchTargets(); // Refresh to show updated contact info
    };

    const openEditModal = (target) => {
        setEditingTarget({
            ...target,
            // Ensure nested objects exist
            details: target.details || {},
            vip_demo_config: {
                prices: (target.details?.vip_demo_config?.prices || []).map(p => ({
                    ...p,
                    name: ensureMultilingual(p.name),
                    weekday: ensureMultilingual(p.weekday),
                    weekend: ensureMultilingual(p.weekend)
                })),
                usps: (target.details?.vip_demo_config?.usps || []).map(u => ensureMultilingual(u)),
                hero_title: ensureMultilingual(target.details?.vip_demo_config?.hero_title),
                hero_description: ensureMultilingual(target.details?.vip_demo_config?.hero_description),
                hero_image: target.details?.vip_demo_config?.hero_image || '',
                gallery: target.details?.vip_demo_config?.gallery || [],
                contact: {
                    phone: target.details?.vip_demo_config?.contact?.phone || '',
                    email: target.details?.vip_demo_config?.contact?.email || '',
                    address: target.details?.vip_demo_config?.contact?.address || '',
                    website: target.details?.vip_demo_config?.contact?.website || '',
                    owner_name: target.details?.vip_demo_config?.contact?.owner_name || ''
                },
                availability: target.details?.vip_demo_config?.availability || [
                    { month: 'May', status: 'available' },
                    { month: 'Jun', status: 'full' },
                    { month: 'Jul', status: 'critical' },
                    { month: 'Aug', status: 'full' },
                    { month: 'Sep', status: 'available' },
                    { month: 'Oct', status: 'available' }
                ],
                // Module Visibility Flags
                show_partner: target.details?.vip_demo_config?.show_partner !== false, // Default true
                show_stats: target.details?.vip_demo_config?.show_stats !== false,
                show_countdown: target.details?.vip_demo_config?.show_countdown !== false,
                show_reviews: target.details?.vip_demo_config?.show_reviews !== false,
                show_social_proof: target.details?.vip_demo_config?.show_social_proof !== false,
                show_live_viewing: target.details?.vip_demo_config?.show_live_viewing !== false,
                show_calendar: target.details?.vip_demo_config?.show_calendar !== false,
                ...target.details?.vip_demo_config
            },
            // Also ensure root description is multilingual in editing state
            multilingual_description: ensureMultilingual(target.details?.multilingual_description || target.description)
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('vendors').update({
                business_name: editingTarget.name,
                city: editingTarget.city,
                description: editingTarget.multilingual_description?.tr || editingTarget.description, // Fallback to TR for main column
                capacity: parseInt(editingTarget.capacity) || null,
                details: {
                    ...editingTarget.details,
                    war_room_status: editingTarget.status,
                    vip_demo_config: editingTarget.vip_demo_config,
                    multilingual_description: editingTarget.multilingual_description,
                    admin_notes: editingTarget.notes
                }
            }).eq('id', editingTarget.id);

            if (error) throw error;
            setIsEditing(false);
            fetchTargets();
            alert('Profil Başarıyla Güncellendi!');
        } catch (error) {
            alert('Güncelleme hatası: ' + error.message);
        }
    };

    return (
        <div className="admin-vendors-container fade-in">
            <div className="admin-vendors-header">
                <h1>🎯 War Room: Venue Onboarding</h1>
                <p>28 Stratejik Salon Hedefi & DJ İş Ortaklığı Yönetimi</p>

                <div className="dashboard-metrics" style={{ marginTop: '2rem' }}>
                    <div className="metric-card">
                        <div className="metric-icon purple">🏁</div>
                        <div className="metric-content">
                            <span className="metric-value">{stats.total}</span>
                            <span className="metric-label">Toplam Hedef</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon orange">⏳</div>
                        <div className="metric-content">
                            <span className="metric-value">{stats.inProgress}</span>
                            <span className="metric-label">Görüşülen</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon green">🤝</div>
                        <div className="metric-content">
                            <span className="metric-value">{stats.won}</span>
                            <span className="metric-label">Kazanılan (DJ Paketi)</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon red" style={{ animation: 'pulse 1s infinite' }}>🔥</div>
                        <div className="metric-content">
                            <span className="metric-value">{stats.hotLeads}</span>
                            <span className="metric-label">Sıcak Lead</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary btn-sm" onClick={() => setIsAdding(true)}>
                        ➕ Yeni Salon Ekle
                    </button>
                    <button
                        className="btn-secondary btn-sm"
                        style={{ background: '#e11d48', color: 'white' }}
                        onClick={async () => {
                            if (!confirm('Bordo Event verileri siteden alınan detaylı bilgilerle güncellensin mi?')) return;
                            try {
                                // 1. Mevcut kaydı bul
                                let { data: targets } = await supabase.from('vendors').select('id, details').eq('business_name', 'Bordo Eventlocation');
                                const targetId = targets?.[0]?.id || crypto.randomUUID();
                                const currentDetails = targets?.[0]?.details || {};

                                const updateData = {
                                    business_name: 'Bordo Eventlocation',
                                    city: 'Neu-Ulm',
                                    // Slug sadece yeni kayıtta oluşturulur
                                    ...(targets?.[0] ? {} : { slug: 'bordo-eventlocation-' + Math.floor(Math.random() * 1000) }),
                                    source: 'war_room',
                                    is_claimed: false,
                                    is_verified: false,
                                    is_featured: true,
                                    scraper_source_url: 'https://www.bordoevent.com/',
                                    category: 'Düğün Salonu',
                                    capacity: 1200,
                                    description: 'Seit 2016 ist die Bordo Eventlocation in Neu-Ulm die erste Adresse für unvergessliche Veranstaltungen. Unsere zwei eleganten Säle, Bordo und Beyaz, bieten Platz für bis zu 1200 Gäste.',
                                    details: {
                                        ...currentDetails,
                                        war_room_status: 'profile_ready',
                                        ai_imported: true,
                                        multilingual_description: {
                                            de: 'Seit 2016 ist die Bordo Eventlocation in Neu-Ulm die erste Adresse für unvergessliche Veranstaltungen. Unsere zwei eleganten Säle, Bordo und Beyaz, bieten Platz für bis zu 1200 Gäste und sind der perfekte Rahmen für Hochzeiten, Verlobungen und Firmenfeiern.',
                                            tr: '2016\'dan beri Neu-Ulm\'daki Bordo Eventlocation, unutulmaz etkinliklerin ilk adresidir. Bordo ve Beyaz isimli iki şık salonumuz 1200 misafir kapasitesine dek hizmet vermekte olup düğün, nişan ve kurumsal etkinlikler için mükemmel bir ortam sunar.',
                                            en: 'Since 2016, Bordo Eventlocation in Neu-Ulm has been the premier address for unforgettable events. Our two elegant halls, Bordo and Beyaz, accommodate up to 1200 guests and provide the perfect setting for weddings, engagements, and corporate events.'
                                        },
                                        vip_demo_config: {
                                            hero_title: {
                                                de: 'Traumhochzeit in Bordo & Beyaz',
                                                tr: 'Bordo & Beyaz\'da Hayalinizdeki Düğün',
                                                en: 'Dream Wedding at Bordo & Beyaz'
                                            },
                                            hero_description: {
                                                de: 'Erleben Sie unvergessliche Momente in unseren exklusiven Sälen. Bis zu 1200 Gäste, Full-Service und traumhaftes Ambiente.',
                                                tr: 'Özel salonlarımızda unutulmaz anlar yaşayın. 1200 misafire kadar kapasite, tam hizmet ve rüya gibi bir atmosfer.',
                                                en: 'Experience unforgettable moments in our exclusive halls. Capacity up to 1200 guests, full-service, and a dreamlike ambiance.'
                                            },
                                            hero_image: 'https://www.bordoevent.com/wp-content/uploads/2024/06/elegant-wedding-decorations-made-of-natural-flower-2021-08-27-17-17-46-utc-1-258x300.jpg',
                                            prices: [
                                                { name: { de: 'Bordo Saal (Groß)', tr: 'Bordo Salonu (Büyük)', en: 'Bordo Hall (Large)' }, weekday: '2.500 €', weekend: '4.500 €', icon: '👑' },
                                                { name: { de: 'Beyaz Saal (Mittel)', tr: 'Beyaz Salonu (Orta)', en: 'Beyaz Hall (Medium)' }, weekday: '1.500 €', weekend: '3.000 €', icon: '💎' },
                                                { name: { de: 'Menü 1: Klassik', tr: 'Menü 1: Klasik', en: 'Menu 1: Classic' }, weekday: '35 €/kişi', weekend: '45 €/kişi', icon: '🍽️' },
                                                { name: { de: 'Menü 2: Premium', tr: 'Menü 2: Premium', en: 'Menu 2: Premium' }, weekday: '55 €/kişi', weekend: '65 €/kişi', icon: '🥩' },
                                                { name: { de: 'Full Paket (Video/Foto)', tr: 'Full Paket (Video/Foto)', en: 'Full Package (Video/Photo)' }, weekday: '1200 €', weekend: '1200 €', icon: '📸' }
                                            ],
                                            usps: [
                                                { de: '1200 Personen Kapazität', tr: '1200 Kişilik Dev Kapasite', en: '1200 Person Capacity' },
                                                { de: '2 verschiedene Konzept-Säle', tr: '2 Farklı Konsept Salon', en: '2 Different Concept Halls' },
                                                { de: 'Zentrale Lage in Neu-Ulm', tr: 'Neu-Ulm Merkezi Konum', en: 'Central Location in Neu-Ulm' },
                                                { de: 'Experte für türkische Hochzeiten', tr: 'Türk Düğünü Konsept Uzmanı', en: 'Expert for Turkish Weddings' },
                                                { de: 'Modernste Licht- & Soundsysteme', tr: 'Gelişmiş Işık & Ses Sistemi', en: 'Advanced Light & Sound Systems' }
                                            ],
                                            show_social_proof: true,
                                            show_live_viewing: true,
                                            show_stats: true,
                                            show_countdown: true,
                                            show_partner: true,
                                            show_reviews: true,
                                            show_calendar: true,
                                            is_elite: true, // Bordo is explicitly Elite
                                            contact: {
                                                phone: '+491742801430',
                                                email: 'info@bordoevent.com',
                                                address: 'Leibnizstr. 14, 89231 Neu-Ulm',
                                                website: 'https://www.bordoevent.com/',
                                                owner_name: 'Dursun Kocaslan'
                                            },
                                            gallery: [
                                                'https://www.bordoevent.com/wp-content/uploads/2024/06/1-258x300.jpg',
                                                'https://www.bordoevent.com/wp-content/uploads/2024/06/2-258x300.jpg',
                                                'https://www.bordoevent.com/wp-content/uploads/2024/06/3-258x300.jpg',
                                                'https://www.bordoevent.com/wp-content/uploads/2024/06/4-258x300.jpg',
                                                'https://www.bordoevent.com/wp-content/uploads/2024/06/beautiful-wedding-decoration-with-roses-2021-08-29-06-59-52-utc-2-258x300.jpg',
                                                'https://www.bordoevent.com/wp-content/uploads/2024/06/wedding-cake-2021-08-26-12-08-14-utc-258x300.jpg'
                                            ]
                                        },
                                    },
                                    social_media: {
                                        instagram: 'https://www.instagram.com/bordoeventlocation',
                                        website: 'https://www.bordoevent.com/'
                                    }
                                };

                                const { error } = await supabase.from('vendors').upsert({ id: targetId, ...updateData });
                                if (error) throw error;
                                alert('✅ Bordo Event bilgileri GÜNCELLENDİ!');
                                fetchTargets();
                            } catch (e) {
                                alert('Hata: ' + e.message);
                            }
                        }}
                    >
                        🔄 Bordo Bilgilerini Güncelle
                    </button>
                </div>
            </div>

            <div className="vendors-table">
                <table>
                    <thead>
                        <tr>
                            <th>Salon Adı & Şehir</th>
                            <th>Durum</th>
                            <th>Görünürlük</th>
                            <th>Aksiyonlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                                    Henüz salon eklenmemiş. "Yeni Salon Ekle" butonu ile başlayın.
                                </td>
                            </tr>
                        ) : (
                            targets.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {t.name}
                                            {analytics[t.id]?.is_hot_lead && (
                                                <span style={{ background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>🔥 HOT</span>
                                            )}
                                            {needsFollowUp(t) && (
                                                <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>⏰ TAKİP</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>📍 {t.city}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                                            {analytics[t.id] && (
                                                <>
                                                    👁 {analytics[t.id].total_views || 0} görüntüleme
                                                    {analytics[t.id].whatsapp_clicks > 0 && ` • 💬 ${analytics[t.id].whatsapp_clicks} WA tıklama`}
                                                </>
                                            )}
                                            {t.follow_up_count > 0 && (
                                                <span style={{ marginLeft: '8px' }}>📨 {t.follow_up_count}x mesaj</span>
                                            )}
                                        </div>
                                        {t.instagram && (
                                            <a href={t.instagram} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6' }}>📸 Instagram</a>
                                        )}
                                        {t.notes && (
                                            <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontStyle: 'italic', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                📝 Not: {t.notes.substring(0, 30)}{t.notes.length > 30 ? '...' : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            value={t.status}
                                            onChange={(e) => updateStatus(t.id, e.target.value)}
                                            className="status-select"
                                            style={{
                                                backgroundColor: statusOptions.find(o => o.value === t.status)?.color + '22',
                                                color: statusOptions.find(o => o.value === t.status)?.color,
                                                borderColor: statusOptions.find(o => o.value === t.status)?.color
                                            }}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label[language] || opt.label.tr}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                className={`btn-sm ${t.is_featured ? 'btn-success' : 'btn-secondary'}`}
                                                onClick={() => toggleFeatured(t.id, t.is_featured)}
                                                title="Vitrin / Öne Çıkan"
                                            >
                                                {t.is_featured ? '🌟 VİTRİN' : 'Sıradan'}
                                            </button>
                                            <button
                                                className={`btn-sm ${t.details?.vip_demo_config?.is_elite ? 'btn-indigo' : 'btn-outline'}`}
                                                style={{
                                                    background: t.details?.vip_demo_config?.is_elite ? '#4338ca' : 'transparent',
                                                    color: t.details?.vip_demo_config?.is_elite ? '#fff' : '#4338ca',
                                                    border: '1px solid #4338ca'
                                                }}
                                                onClick={async () => {
                                                    const currentElite = t.details?.vip_demo_config?.is_elite;
                                                    await supabase.from('vendors').update({
                                                        details: {
                                                            ...(t.details || {}),
                                                            vip_demo_config: {
                                                                ...(t.details?.vip_demo_config || {}),
                                                                is_elite: !currentElite
                                                            }
                                                        }
                                                    }).eq('id', t.id);
                                                    fetchTargets();
                                                }}
                                                title="Elite Partner Statusü"
                                            >
                                                {t.details?.vip_demo_config?.is_elite ? '💎 ELITE' : 'Standart'}
                                            </button>
                                            <button
                                                className={`btn-sm ${t.details?.vip_demo_config?.is_public_visible !== false ? 'btn-success' : 'btn-secondary'}`}
                                                style={{
                                                    background: t.details?.vip_demo_config?.is_public_visible !== false ? '#10b981' : '#6b7280',
                                                    color: '#fff',
                                                    border: 'none'
                                                }}
                                                onClick={async () => {
                                                    const currentVisible = t.details?.vip_demo_config?.is_public_visible !== false;
                                                    await supabase.from('vendors').update({
                                                        details: {
                                                            ...(t.details || {}),
                                                            vip_demo_config: {
                                                                ...(t.details?.vip_demo_config || {}),
                                                                is_public_visible: !currentVisible
                                                            }
                                                        }
                                                    }).eq('id', t.id);
                                                    fetchTargets();
                                                }}
                                                title="Public Görünürlük - Aktif ise ana sayfada görünür"
                                            >
                                                {t.details?.vip_demo_config?.is_public_visible !== false ? '👁️ AKTİF' : '🚫 GİZLİ'}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <a href={`/proposals/venues?venue=${encodeURIComponent(t.name)}&city=${encodeURIComponent(t.city)}`} target="_blank" rel="noreferrer" className="btn-sm" style={{ textDecoration: 'none', backgroundColor: '#b8860b', color: '#fff' }}>
                                                📄 Teklif
                                            </a>
                                            <a href={`/vip-demo?venue=${encodeURIComponent(t.name)}&city=${encodeURIComponent(t.city)}`} target="_blank" rel="noreferrer" className="btn-sm btn-info" style={{ textDecoration: 'none', backgroundColor: '#a855f7', color: '#fff' }}>
                                                ✨ VIP
                                            </a>
                                            <button
                                                onClick={() => {
                                                    const link = `${window.location.origin}/proposals/venues?venue=${encodeURIComponent(t.name)}&city=${encodeURIComponent(t.city)}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert('Teklif linki kopyalandı!');
                                                }}
                                                className="btn-sm"
                                                style={{ border: 'none', backgroundColor: '#475569', color: '#fff' }}
                                                title="Link Kopyala"
                                            >
                                                🔗
                                            </button>
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="btn-sm"
                                                style={{ border: 'none', backgroundColor: '#6366f1', color: '#fff', fontSize: '1rem' }}
                                                title="Profili Düzenle"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => openMessagingModal(t)}
                                                className="btn-sm btn-success"
                                                style={{ border: 'none', backgroundColor: '#25D366', color: '#fff' }}
                                            >
                                                💬 WA
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Strategy Sidebar (Help Box) */}
            <div className="report-card primary" style={{ marginTop: '2rem' }}>
                <h4>⚔️ Savaş Odası Stratejisi</h4>
                <p>28 Salonu nasıl kapatıyoruz?</p>
                <ul style={{ marginTop: '1rem' }}>
                    <li><strong>1. Olta (Hook):</strong> Salonun profilini oluşturun. Mevcut sitelerinden fotoğraflarını çekip süsleyin.</li>
                    <li><strong>2. Hediye Verme:</strong> "Size özel VIP sayfa hazırladık, yayına aldık" diyerek WhatsApp'tan linki atın.</li>
                    <li><strong>3. Claim & Login:</strong> Sayfanın altına bakmalarını sağlayın. "Sahiplen" butonunu görünce heyecanlanacaklar.</li>
                    <li><strong>4. Büyük Takas:</strong> "Sayfanız kalsın ama bir şartım var: Salon paketlerinize beni DJ olarak ekliyorsunuz."</li>
                </ul>
            </div>

            {/* Messaging Modal */}
            {isMessaging && selectedTarget && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>💬 WhatsApp Mesajı Gönder</h2>
                            <button className="close-btn" onClick={() => setIsMessaging(false)}>&times;</button>
                        </div>

                        <div className="form-group">
                            <label>Şablon Seçin</label>
                            <select
                                value={selectedTemplate}
                                onChange={e => setSelectedTemplate(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
                            >
                                {Object.keys(templates).map(key => (
                                    <option key={key} value={key}>{templates[key].label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Mesaj Düzenle</label>
                            <textarea
                                value={customMessage}
                                onChange={e => setCustomMessage(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '150px', fontSize: '0.9rem' }}
                            />
                        </div>

                        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary btn-sm" onClick={() => setIsMessaging(false)}>İptal</button>
                            <button
                                type="button"
                                className="btn-primary btn-sm"
                                onClick={sendWhatsApp}
                                style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                            >
                                ✅ WhatsApp ile Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isAdding && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '550px' }}>
                        <div className="modal-header">
                            <h2>➕ Yeni Salon Ekle</h2>
                            <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
                        </div>

                        {/* AI Import Section */}
                        <div className="ai-import-section" style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>🤖 AI ile URL'den Veri Çek</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Instagram veya Website URL..."
                                    value={importUrl}
                                    onChange={e => setImportUrl(e.target.value)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAiImport}
                                    disabled={aiLoading}
                                    className="btn-primary btn-sm"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {aiLoading ? '⏳ Çekiliyor...' : '🔍 AI Çek'}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAddVenue}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Salon Adı *</label>
                                <input
                                    type="text"
                                    required
                                    value={newVenue.name}
                                    onChange={e => setNewVenue({ ...newVenue, name: e.target.value })}
                                    placeholder="Örn: Bordo Eventlocation"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Şehir *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newVenue.city}
                                        onChange={e => setNewVenue({ ...newVenue, city: e.target.value })}
                                        placeholder="Örn: Berlin"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kapasite</label>
                                    <input
                                        type="number"
                                        value={newVenue.capacity}
                                        onChange={e => setNewVenue({ ...newVenue, capacity: e.target.value })}
                                        placeholder="Örn: 500"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Instagram / Website URL</label>
                                <input
                                    type="text"
                                    value={newVenue.instagram}
                                    onChange={e => setNewVenue({ ...newVenue, instagram: e.target.value })}
                                    placeholder="https://instagram.com/salonadi"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Açıklama</label>
                                <textarea
                                    value={newVenue.description}
                                    onChange={e => setNewVenue({ ...newVenue, description: e.target.value })}
                                    placeholder="Salonun kısa tanıtımı..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>İptal</button>
                                <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>✅ Salon Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Edit Target Modal */}
            {isEditing && editingTarget && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <div>
                                <h2>✏️ Profili Düzenle: {editingTarget.name}</h2>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                    {['tr', 'de', 'en'].map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setEditLang(lang)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: editLang === lang ? '#6366f1' : '#eee',
                                                color: editLang === lang ? '#fff' : '#333',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                    <span style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
                                        (Düzenlenen Dil: {editLang.toUpperCase()})
                                    </span>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setIsEditing(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="edit-target-form">
                            <div className="form-sections" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                                {/* Section 1: Basic Info */}
                                <div className="edit-section">
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>📌 Temel Bilgiler</h3>
                                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Salon Adı</label>
                                            <input
                                                type="text"
                                                value={editingTarget.name}
                                                onChange={e => setEditingTarget({ ...editingTarget, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Şehir</label>
                                            <input
                                                type="text"
                                                value={editingTarget.city}
                                                onChange={e => setEditingTarget({ ...editingTarget, city: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group">
                                            <label>Kapasite</label>
                                            <input
                                                type="number"
                                                value={editingTarget.capacity || ''}
                                                onChange={e => setEditingTarget({ ...editingTarget, capacity: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Durum</label>
                                            <select
                                                value={editingTarget.status}
                                                onChange={e => setEditingTarget({ ...editingTarget, status: e.target.value })}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label.tr}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Açıklama</label>
                                        <textarea
                                            value={editingTarget.multilingual_description?.[editLang] || ''}
                                            onChange={e => setEditingTarget({
                                                ...editingTarget,
                                                multilingual_description: { ...editingTarget.multilingual_description, [editLang]: e.target.value }
                                            })}
                                            style={{ width: '100%', minHeight: '60px', padding: '8px' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label style={{ color: '#f59e0b', fontWeight: 'bold' }}>✍️ Görüşme Notları (Özel)</label>
                                        <textarea
                                            value={editingTarget.notes || ''}
                                            onChange={e => setEditingTarget({
                                                ...editingTarget,
                                                notes: e.target.value
                                            })}
                                            placeholder="Görüşme detaylarını, özel şartları buraya not alın..."
                                            style={{ width: '100%', minHeight: '100px', padding: '10px', border: '2px solid #fef3c7', borderRadius: '8px', background: '#fffbeb' }}
                                        />
                                    </div>
                                </div>

                                {/* Section 1.5: Contact Info */}
                                <div className="edit-section" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>📞 İletişim Bilgileri (VIP Demo)</h3>
                                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Telefon</label>
                                            <input
                                                type="text"
                                                value={editingTarget.vip_demo_config.contact?.phone || ''}
                                                placeholder="+49 123 456 789"
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: {
                                                        ...editingTarget.vip_demo_config,
                                                        contact: { ...(editingTarget.vip_demo_config.contact || {}), phone: e.target.value }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={editingTarget.vip_demo_config.contact?.email || ''}
                                                placeholder="info@example.com"
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: {
                                                        ...editingTarget.vip_demo_config,
                                                        contact: { ...(editingTarget.vip_demo_config.contact || {}), email: e.target.value }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group">
                                            <label>Adres</label>
                                            <input
                                                type="text"
                                                value={editingTarget.vip_demo_config.contact?.address || ''}
                                                placeholder="Örnek Cad. No:1, Berlin"
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: {
                                                        ...editingTarget.vip_demo_config,
                                                        contact: { ...(editingTarget.vip_demo_config.contact || {}), address: e.target.value }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Yetkili Kişi</label>
                                            <input
                                                type="text"
                                                value={editingTarget.vip_demo_config.contact?.owner_name || ''}
                                                placeholder="Ahmet Yılmaz"
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: {
                                                        ...editingTarget.vip_demo_config,
                                                        contact: { ...(editingTarget.vip_demo_config.contact || {}), owner_name: e.target.value }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Website</label>
                                        <input
                                            type="text"
                                            value={editingTarget.vip_demo_config.contact?.website || ''}
                                            placeholder="https://example.com"
                                            onChange={e => setEditingTarget({
                                                ...editingTarget,
                                                vip_demo_config: {
                                                    ...editingTarget.vip_demo_config,
                                                    contact: { ...(editingTarget.vip_demo_config.contact || {}), website: e.target.value }
                                                }
                                            })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Prices & Menus */}
                                <div className="edit-section" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        💰 Fiyatlar & Menüler
                                        <button type="button" className="btn-sm" style={{ background: '#10b981', color: '#fff' }} onClick={() => {
                                            const newPrices = [...(editingTarget.vip_demo_config.prices || [])];
                                            newPrices.push({
                                                name: { tr: '', de: '', en: '' },
                                                weekday: { tr: '', de: '', en: '' },
                                                weekend: { tr: '', de: '', en: '' },
                                                icon: '✨'
                                            });
                                            setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, prices: newPrices } });
                                        }}>+ Ekle</button>
                                    </h3>
                                    {(editingTarget.vip_demo_config.prices || []).map((p, idx) => (
                                        <div key={idx} className="price-item-edit" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 40px', gap: '8px', alignItems: 'center' }}>
                                            <input type="text" value={p.icon} onChange={e => {
                                                const newPrices = [...editingTarget.vip_demo_config.prices];
                                                newPrices[idx].icon = e.target.value;
                                                setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, prices: newPrices } });
                                            }} style={{ padding: '4px', textAlign: 'center' }} title="Icon" />

                                            <input type="text" value={p.name?.[editLang] || ''} placeholder="Menü Adı" onChange={e => {
                                                const newPrices = [...editingTarget.vip_demo_config.prices];
                                                newPrices[idx].name = { ...newPrices[idx].name, [editLang]: e.target.value };
                                                setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, prices: newPrices } });
                                            }} style={{ padding: '4px' }} />

                                            <input type="text" value={p.weekday?.[editLang] || ''} placeholder="Hafta İçi" onChange={e => {
                                                const newPrices = [...editingTarget.vip_demo_config.prices];
                                                newPrices[idx].weekday = { ...newPrices[idx].weekday, [editLang]: e.target.value };
                                                setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, prices: newPrices } });
                                            }} style={{ padding: '4px' }} />

                                            <input type="text" value={p.weekend?.[editLang] || ''} placeholder="Hafta Sonu" onChange={e => {
                                                const newPrices = [...editingTarget.vip_demo_config.prices];
                                                newPrices[idx].weekend = { ...newPrices[idx].weekend, [editLang]: e.target.value };
                                                setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, prices: newPrices } });
                                            }} style={{ padding: '4px' }} />

                                            <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => {
                                                const newPrices = editingTarget.vip_demo_config.prices.filter((_, i) => i !== idx);
                                                setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, prices: newPrices } });
                                            }}>&times;</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Section 3: USPs (Neden Biz?) */}
                                <div className="edit-section" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        🌟 Neden Biz? (USP)
                                        <button type="button" className="btn-sm" style={{ background: '#10b981', color: '#fff' }} onClick={() => {
                                            const newUsps = [...(editingTarget.vip_demo_config.usps || [])];
                                            newUsps.push({ tr: '', de: '', en: '' });
                                            setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, usps: newUsps } });
                                        }}>+ Ekle</button>
                                    </h3>
                                    {(editingTarget.vip_demo_config.usps || []).map((usp, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                value={usp?.[editLang] || ''}
                                                onChange={e => {
                                                    const newUsps = [...editingTarget.vip_demo_config.usps];
                                                    newUsps[idx] = { ...newUsps[idx], [editLang]: e.target.value };
                                                    setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, usps: newUsps } });
                                                }}
                                                style={{ flex: 1, padding: '8px' }}
                                            />
                                            <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => {
                                                const newUsps = editingTarget.vip_demo_config.usps.filter((_, i) => i !== idx);
                                                setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, usps: newUsps } });
                                            }}>&times;</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Section 3.5: Availability Calendar */}
                                <div className="edit-section" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        📅 Müsaitlik Takvimi (2026)
                                        <button type="button" className="btn-sm" style={{ background: '#10b981', color: '#fff' }} onClick={() => {
                                            const newAvail = [...(editingTarget.vip_demo_config.availability || [])];
                                            newAvail.push({ month: 'Nov', status: 'available' });
                                            setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, availability: newAvail } });
                                        }}>+ Ay Ekle</button>
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                        {(editingTarget.vip_demo_config.availability || []).map((item, idx) => (
                                            <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <input
                                                    type="text"
                                                    value={item.month}
                                                    onChange={e => {
                                                        const newAvail = [...editingTarget.vip_demo_config.availability];
                                                        newAvail[idx].month = e.target.value;
                                                        setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, availability: newAvail } });
                                                    }}
                                                    style={{ width: '100%', marginBottom: '5px', fontWeight: 'bold' }}
                                                    placeholder="Ay (örn: May)"
                                                />
                                                <select
                                                    value={item.status}
                                                    onChange={e => {
                                                        const newAvail = [...editingTarget.vip_demo_config.availability];
                                                        newAvail[idx].status = e.target.value;
                                                        setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, availability: newAvail } });
                                                    }}
                                                    style={{ width: '100%' }}
                                                >
                                                    <option value="available">✅ Müsait</option>
                                                    <option value="full">❌ Dolu</option>
                                                    <option value="critical">⚠️ Kritik</option>
                                                </select>
                                                <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', marginTop: '5px', width: '100%' }} onClick={() => {
                                                    const newAvail = editingTarget.vip_demo_config.availability.filter((_, i) => i !== idx);
                                                    setEditingTarget({ ...editingTarget, vip_demo_config: { ...editingTarget.vip_demo_config, availability: newAvail } });
                                                }}>Sil</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 4: Media & Dynamic Content */}
                                <div className="edit-section" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>🖼️ Medya & İçerik</h3>

                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label>Kahraman Başlık (Hero Title)</label>
                                        <input
                                            type="text"
                                            value={editingTarget.vip_demo_config.hero_title?.[editLang] || ''}
                                            placeholder="Doğanın Kalbinde Unutulmaz Bir Hikaye"
                                            onChange={e => setEditingTarget({
                                                ...editingTarget,
                                                vip_demo_config: {
                                                    ...editingTarget.vip_demo_config,
                                                    hero_title: { ...editingTarget.vip_demo_config.hero_title, [editLang]: e.target.value }
                                                }
                                            })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label>Kahraman Açıklama (Hero Description)</label>
                                        <textarea
                                            value={editingTarget.vip_demo_config.hero_description?.[editLang] || ''}
                                            placeholder="Mekan açıklaması..."
                                            onChange={e => setEditingTarget({
                                                ...editingTarget,
                                                vip_demo_config: {
                                                    ...editingTarget.vip_demo_config,
                                                    hero_description: { ...editingTarget.vip_demo_config.hero_description, [editLang]: e.target.value }
                                                }
                                            })}
                                            style={{ width: '100%', minHeight: '60px', padding: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label>Kapak Fotoğrafı URL (Hero Image)</label>
                                        <input
                                            type="text"
                                            value={editingTarget.vip_demo_config.hero_image || ''}
                                            placeholder="https://.../hero.jpg"
                                            onChange={e => setEditingTarget({
                                                ...editingTarget,
                                                vip_demo_config: { ...editingTarget.vip_demo_config, hero_image: e.target.value }
                                            })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label>Galeri Fotoğrafları (Virgülle ayırın)</label>
                                        <textarea
                                            value={editingTarget.vip_demo_config.gallery?.join(', ') || ''}
                                            placeholder="https://.../img1.jpg, https://.../img2.jpg"
                                            onChange={e => {
                                                const urls = e.target.value.split(',').map(u => u.trim()).filter(u => u !== '');
                                                setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, gallery: urls }
                                                });
                                            }}
                                            style={{ width: '100%', minHeight: '60px', padding: '8px' }}
                                        />
                                    </div>

                                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Tanıtım Videosu URL</label>
                                            <input
                                                type="text"
                                                value={editingTarget.vip_demo_config.promo_video || ''}
                                                placeholder="YouTube/Vimeo linki"
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, promo_video: e.target.value }
                                                })}
                                                style={{ width: '100%', padding: '8px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Partner Videosu URL</label>
                                            <input
                                                type="text"
                                                value={editingTarget.vip_demo_config.partner_video || ''}
                                                placeholder="Partner tanıtım videosu"
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, partner_video: e.target.value }
                                                })}
                                                style={{ width: '100%', padding: '8px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Module Management */}
                                <div className="edit-section" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>🛠️ Modül Yönetimi</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_partner}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_partner: e.target.checked }
                                                })}
                                            />
                                            <span>Partner Bölümü (Official Partner)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_countdown}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_countdown: e.target.checked }
                                                })}
                                            />
                                            <span>Geri Sayım (Fırsat Saati)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_stats}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_stats: e.target.checked }
                                                })}
                                            />
                                            <span>İstatistik Özeti (Görüntüleme vs)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_reviews}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_reviews: e.target.checked }
                                                })}
                                            />
                                            <span>Yorumlar Bölümü</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_social_proof}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_social_proof: e.target.checked }
                                                })}
                                            />
                                            <span>Sosyal Kanıt (47 Çift vs.)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_live_viewing}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_live_viewing: e.target.checked }
                                                })}
                                            />
                                            <span>Canlı İzleyici Rozeti (🔥 14 kişi)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.show_calendar}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, show_calendar: e.target.checked }
                                                })}
                                            />
                                            <span>Müsaitlik Takvimi Bölümü</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#eef2ff', padding: '10px', borderRadius: '8px', gridColumn: 'span 2', border: '2px solid #6366f1' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingTarget.vip_demo_config.is_elite}
                                                onChange={e => setEditingTarget({
                                                    ...editingTarget,
                                                    vip_demo_config: { ...editingTarget.vip_demo_config, is_elite: e.target.checked }
                                                })}
                                            />
                                            <span style={{ fontWeight: 'bold' }}>⭐ ELITE PARTNER (Premium Renkli Tasarım)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Vazgeç</button>
                                <button type="submit" className="btn-primary" style={{ background: '#6366f1' }}>💾 Değişiklikleri Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWarRoom;
