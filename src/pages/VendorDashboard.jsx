import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { getCategoryTranslationKey } from '../constants/vendorData';
import ProfileEditor from '../components/VendorDashboard/ProfileEditor';
import GalleryManager from '../components/VendorDashboard/GalleryManager';
import LeadsViewer from '../components/VendorDashboard/LeadsViewer';
import VendorMessages from '../components/VendorDashboard/VendorMessages';
import VendorShop from '../components/VendorDashboard/VendorShop';
import VendorWallet from './VendorWallet';
import './VendorDashboard.css';

const VendorDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize tab from URL or default to 'overview'
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync activeTab with URL params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setSearchParams(prev => {
            prev.set('tab', tabName);
            return prev;
        });
    };

    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait for session to recover

        if (!user) {
            navigate('/login');
            return;
        }
        // Role kontrolü - vendor olmayan kullanıcıları doğru dashboard'a yönlendir
        if (user.role === 'admin') {
            navigate('/admin');
            return;
        }
        if (user.role !== 'vendor') {
            navigate('/dashboard');
            return;
        }
        fetchVendorProfile();
    }, [user, navigate]);

    const [recentInsight, setRecentInsight] = useState(null);
    const [rankInfo, setRankInfo] = useState(null);

    const fetchRecentInsight = useCallback(async (vId) => {
        if (!vId) return;
        try {
            const { data, error } = await supabase
                .from('vendor_insights')
                .select('*')
                .eq('vendor_id', vId)
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data && !error) {
                setRecentInsight(data);
            }

            // Fetch Gamification Ranking Info
            const { data: rankData, error: rankError } = await supabase.rpc('get_vendor_rank_info', {
                target_vendor_id: vId
            });
            if (rankData && !rankError) {
                setRankInfo(rankData);
            }
        } catch (err) {
            console.error('Error fetching insight/rank:', err);
        }
    }, []);

    useEffect(() => {
        if (vendor?.id) {
            fetchRecentInsight(vendor.id);
        }
    }, [vendor?.id, fetchRecentInsight]);

    const fetchVendorProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            // Handle multiple vendors (e.g. personal + support)
            let selectedVendor = data?.[0];

            // If support mode is requested (via URL or context), try to find Support Vendor
            const urlParams = new URLSearchParams(window.location.search);
            const isSupportMode = urlParams.get('support') === 'true';

            if (isSupportMode) {
                const supportVendor = data?.find(v => v.business_name === 'KolayDugun Destek');
                if (supportVendor) selectedVendor = supportVendor;
            } else if (data?.length > 1) {
                // If not support mode, prefer non-support vendor if multiple exist
                const mainVendor = data.find(v => v.business_name !== 'KolayDugun Destek');
                if (mainVendor) selectedVendor = mainVendor;
            }

            setVendor(selectedVendor);
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) return <div className="dashboard-loading">{t('login.loading')}</div>;

    if (!vendor && activeTab !== 'profile') {
        return (
            <div className="section container dashboard-container">
                <div className="dashboard-welcome">
                    <h1>👋 {t('dashboard.welcome')}!</h1>
                    <p>{t('dashboard.welcomeMsg')}</p>
                    <button className="btn btn-primary" onClick={() => handleTabChange('profile')}>
                        {t('dashboard.completeProfile')}
                    </button>
                </div>
            </div>
        );
    }


    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="dashboard-overview">
                        <div className="flex justify-between items-center mb-6">
                            <h2>{t('dashboard.overview')}</h2>
                            <div className="flex gap-4">
                                <div className="stat-pill">
                                    <span className={`badge badge-${vendor?.subscription_tier || 'free'}`}>
                                        {t(`dashboard.tiers.${vendor?.subscription_tier || 'free'}`)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* PREMIUM AI INSIGHT CARD */}
                        <div className="ai-insight-section mb-8">
                            {/* Ranking Motivation Card */}
                            {rankInfo && (
                                <div className="rank-motivation-card mb-4" style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '16px 24px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: 'white'
                                }}>
                                    <div className="flex items-center gap-4">
                                        <div style={{ fontSize: '2rem' }}>🏆</div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                                {t('dashboard.gamification.rankCard.congrats', {
                                                    rank: rankInfo.rank,
                                                    category: t(`categories.${getCategoryTranslationKey(rankInfo.category || 'wedding_venues')}`),
                                                    city: rankInfo.city || (language === 'tr' ? 'Genel' : (language === 'de' ? 'Allgemein' : 'General'))
                                                })}
                                            </h4>
                                            {rankInfo.rank > 1 && (
                                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                                                    {t('dashboard.gamification.rankCard.motivation', {
                                                        points: rankInfo.points_to_next || 0
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {rankInfo.rank > 1 && (
                                        <button
                                            onClick={() => setActiveTab('gallery')}
                                            className="btn btn-sm"
                                            style={{ background: '#f43f5e', color: 'white', border: 'none' }}
                                        >
                                            {t('dashboard.gamification.rankCard.boostAction')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Top 3 Reward Badge */}
                            {rankInfo && rankInfo.rank <= 3 && (
                                <div className="reward-eligible-badge mb-4" style={{
                                    background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                                    borderRadius: '12px',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                                }}>
                                    <span style={{ fontSize: '1.4rem' }}>🎁</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                        {t('dashboard.gamification.rewards.eligible')}
                                    </div>
                                </div>
                            )}

                            <div className="insight-card-premium" style={{
                                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                                borderRadius: '24px',
                                padding: '32px',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(49, 46, 129, 0.3)'
                            }}>
                                {/* Decorative elements */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '150px',
                                    height: '150px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '50%',
                                    filter: 'blur(40px)'
                                }}></div>

                                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                    <div className="score-container flex-shrink-0">
                                        <div className="circular-score" style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            border: '8px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderTopColor: '#f43f5e'
                                        }}>
                                            <span style={{ fontSize: '2rem', fontWeight: '800' }}>{recentInsight?.performance_score || 0}</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{t('dashboard.gamification.aiAnalysis.scoreLabel')}</span>
                                        </div>
                                    </div>

                                    <div className="content-container flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span style={{ fontSize: '1.2rem' }}>🧠</span>
                                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{t('dashboard.gamification.aiAnalysis.title')}</h3>
                                            <span className="pulse-dot"></span>
                                        </div>

                                        {recentInsight ? (
                                            <>
                                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>
                                                    {(() => {
                                                        const summary = recentInsight.summary;
                                                        if (!summary) return '';

                                                        // Dynamic extraction for views/rate if not in metrics
                                                        const viewsMatch = summary.match(/(\d+) kez görüntülendi/) || summary.match(/(\d+) izlenme/);
                                                        const rateMatch = summary.match(/\(%?\s*([\d.]+)\s*%\)/) || summary.match(/\(%([\d.]+)\)/) || summary.match(/%([\d.]+) dönüşüm/);
                                                        const viewsRaw = viewsMatch ? viewsMatch[1] : (recentInsight.metrics?.views || '?');
                                                        const rateRaw = rateMatch ? rateMatch[1] : (recentInsight.metrics?.conversion_rate || '0');

                                                        if (summary.includes('satış dönüşümü') || summary.includes('ziyaretçiler teklif istemeden')) {
                                                            return t('dashboard.gamification.aiAnalysis.summaries.lowConversion', {
                                                                views: viewsRaw,
                                                                rate: rateRaw
                                                            });
                                                        }
                                                        if (summary.includes('Google verisi bulunamadı') || summary.includes('henüz Google verisi')) {
                                                            return t('dashboard.gamification.aiAnalysis.summaries.noData', { name: vendor?.business_name });
                                                        }
                                                        if (summary.includes('toplam görünürlük') || summary.includes('çok düşük')) {
                                                            return t('dashboard.gamification.aiAnalysis.summaries.lowVisibility', { views: viewsRaw });
                                                        }
                                                        if (summary.includes('dengeli bir performans') || summary.includes('ivmeyi koruyun')) {
                                                            return t('dashboard.gamification.aiAnalysis.summaries.healthy', {
                                                                name: vendor?.business_name,
                                                                rate: rateRaw,
                                                                views: viewsRaw
                                                            });
                                                        }
                                                        return summary;
                                                    })()}
                                                </p>
                                                <div className="recommendations-row flex flex-wrap gap-3">
                                                    {Array.isArray(recentInsight.recommendations) && recentInsight.recommendations.slice(0, 3).map((rec, i) => {
                                                        const mapper = {
                                                            'Fotoğraf galerisindeki ilk 3 görseli daha çekici hale getirin.': 'improvePhotos',
                                                            'Açıklama kısmına \'Neden Sizi Seçmeliler?\' bölümü ekleyin.': 'whyUs',
                                                            'Hizmet fiyatlarınızı veya başlangıç fiyatınızı belirtin.': 'addPrices',
                                                            'Google Search Console üzerinden URL denetimi yapın.': 'searchConsole',
                                                            'Site haritasına (sitemap) eklendiğinden emin olun.': 'sitemap',
                                                            'Profil doluluk oranını %100\'e çıkarın.': 'completeProfile',
                                                            'İşletme açıklamasında daha fazla anahtar kelime kullanın.': 'keywords',
                                                            'Vitrin (Featured) özelliğini aktif ederek trafiği artırın.': 'featured',
                                                            'Diğer sosyal mecralardan bu sayfaya link verin.': 'socialLinks',
                                                            'Rezervasyon takviminizi güncel tutun.': 'calendar',
                                                            'Yeni referans fotoğrafları ekleyerek ivmeyi koruyun.': 'freshPhotos',
                                                            'Tedarikçi başarı öykünüzü bizimle paylaşın!': 'successStory'
                                                        };
                                                        const key = mapper[rec];
                                                        const localizedRec = key ? t(`dashboard.gamification.aiAnalysis.recommendations.${key}`) : rec;

                                                        return (
                                                            <div key={i} className="rec-pill" style={{
                                                                background: 'rgba(255,255,255,0.08)',
                                                                padding: '8px 16px',
                                                                borderRadius: '100px',
                                                                fontSize: '0.8rem',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            }}>
                                                                <span style={{ color: '#fb7185' }}>✦</span> {localizedRec}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="loading-state py-4">
                                                <p style={{ opacity: 0.7, fontStyle: 'italic' }}>{t('dashboard.gamification.aiAnalysis.analyzing')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{t('dashboard.status')}</h3>
                                <span className="status-active">{t('dashboard.active')}</span>
                            </div>
                            <div className="stat-card">
                                <h3>{t('dashboard.package')}</h3>
                                <p className="text-sm opacity-70">{t(`dashboard.tiers.${vendor?.subscription_tier || 'free'}`)}</p>
                            </div>
                        </div>

                        <style>{`
                            .pulse-dot {
                                width: 8px;
                                height: 8px;
                                background: #10b981;
                                border-radius: 50%;
                                display: inline-block;
                                box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
                                animation: pulse 2s infinite;
                            }
                            @keyframes pulse {
                                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                                70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                            }
                            .rec-pill:hover {
                                background: rgba(255,255,255,0.15) !important;
                                transform: translateY(-2px);
                                transition: all 0.2s;
                            }
                        `}</style>
                    </div>
                );
            case 'profile':
                return <ProfileEditor vendor={vendor} onUpdate={fetchVendorProfile} />;
            case 'gallery':
                return <GalleryManager vendor={vendor} onUpdate={fetchVendorProfile} />;
            case 'leads':
                return <LeadsViewer vendor={vendor} highlightLeadId={searchParams.get('leadId')} />;
            case 'messages':
                return <VendorMessages vendor={vendor} />;
            case 'shop':
                return <VendorShop />;
            case 'wallet':
                return <VendorWallet />;
            default:
                return <div>{t('dashboard.notFound')}</div>;
        }
    };

    // 3-language promo texts
    const promo = {
        title: t('dashboard.promo.title'),
        desc: t('dashboard.promo.desc'),
        viewDemo: t('dashboard.promo.viewDemo'),
        viewPanel: t('dashboard.promo.viewPanel'),
        apply: t('dashboard.promo.apply')
    };

    return (
        <div className="section container dashboard-layout">
            <aside className="dashboard-sidebar">
                {/* Shop Marketplace Promo Card - Compact */}
                <div className="shop-promo-card" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                    <h4 style={{
                        color: 'white',
                        margin: '0 0 8px',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}>
                        {promo.title}
                    </h4>
                    <p style={{
                        color: 'rgba(255,255,255,0.85)',
                        margin: '0 0 10px',
                        fontSize: '0.8rem',
                        lineHeight: '1.4'
                    }}>
                        {promo.desc}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                        <a
                            href="/shop/magaza/wedding-essentials-demo-mj7uva80"
                            target="_blank"
                            style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: '0.8rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {promo.viewDemo}
                        </a>
                        <a
                            href="/shop-panel/demo"
                            target="_blank"
                            style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: '0.8rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {promo.viewPanel}
                        </a>
                    </div>
                    <button
                        onClick={() => navigate('/shop/basvuru')}
                        style={{
                            width: '100%',
                            background: 'white',
                            color: '#667eea',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    >
                        {promo.apply}
                    </button>
                </div>

                <div className="sidebar-header">
                    <h3>{t('dashboard.panel')}</h3>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                        disabled={!vendor}
                    >
                        📊 {t('dashboard.overview')}
                    </button>
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        ✏️ {t('dashboard.profileLabel')}
                    </button>
                    <button
                        className={activeTab === 'gallery' ? 'active' : ''}
                        onClick={() => setActiveTab('gallery')}
                        disabled={!vendor}
                    >
                        📸 {t('dashboard.gallery')}
                    </button>
                    <button
                        className={activeTab === 'leads' ? 'active' : ''}
                        onClick={() => setActiveTab('leads')}
                        disabled={!vendor}
                    >
                        💌 {t('dashboard.inquiriesLabel')}
                    </button>
                    <button
                        className={activeTab === 'messages' ? 'active' : ''}
                        onClick={() => setActiveTab('messages')}
                        disabled={!vendor}
                    >
                        💬 {t('dashboard.messages')}
                    </button>
                    <button
                        className={activeTab === 'wallet' ? 'active' : ''}
                        onClick={() => setActiveTab('wallet')}
                        disabled={!vendor}
                    >
                        💰 {t('dashboard.wallet')}
                    </button>
                    <button
                        className={activeTab === 'shop' ? 'active' : ''}
                        onClick={() => setActiveTab('shop')}
                        disabled={!vendor}
                    >
                        🛍️ {t('shop.vendorShop.title', 'Mağazam')}
                    </button>
                    <button
                        className="help-nav-btn"
                        onClick={() => window.open('/faq?category=vendors', '_blank')}
                    >
                        ❓ {t('faq.title', 'Sıkça Sorulan Sorular')}
                    </button>
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    <button
                        className="support-btn"
                        onClick={() => window.location.href = '/vendor/dashboard?tab=messages&support=true'}
                        style={{ color: '#007bff', fontWeight: 'bold' }}
                    >
                        🆘 {t('dashboard.liveSupport')}
                    </button>
                </nav>
            </aside>
            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default VendorDashboard;
