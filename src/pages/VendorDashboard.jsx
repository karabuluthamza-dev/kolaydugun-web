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
import { useDragScroll } from '../hooks/useDragScroll';
import './VendorDashboard.css';
import './DemoBanner.css';

const VendorDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isDemo = searchParams.get('demo') === 'true';

    // Initialize tab from URL or default to 'overview'
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(initialTab);
    const scrollRef = useDragScroll();

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
    const [categorySupport, setCategorySupport] = useState(false);
    const [hasLiveAccess, setHasLiveAccess] = useState(false);

    useEffect(() => {
        if (isDemo) {
            // Mock Data for Demo Mode
            setVendor({
                id: 'demo-v-99',
                business_name: 'DJ34Istanbul – Wedding & Event DJ',
                category: 'DJs',
                city: 'Ulm',
                subscription_tier: 'premium',
                credit_balance: 500,
                is_claimed: true
            });
            setCategorySupport(true);
            setHasLiveAccess(true);
            setRecentInsight({
                performance_score: 95,
                summary: language === 'tr'
                    ? 'DJ34Istanbul harika bir performans sergiliyor! Görünürlüğünüz geçen aya göre %45 arttı ve ziyaretçilerinizin %12si teklif istedi.'
                    : (language === 'de'
                        ? 'DJ34Istanbul zeigt eine großartige Leistung! Ihre Sichtbarkeit hat sich im Vergleich zum Vormonat um 45% erhöht.'
                        : 'DJ34Istanbul is performing great! Your visibility has increased by 45% compared to last month.'),
                recommendations: [
                    'Yeni referans fotoğrafları ekleyerek ivmeyi koruyun.',
                    'Tedarikçi başarı öykünüzü bizimle paylaşın!',
                    'Vitrin (Featured) özelliğini aktif ederek trafiği artırın.'
                ]
            });
            setRankInfo({
                rank: 1,
                category: 'wedding_dj',
                city: 'Ulm',
                points_to_next: 0
            });
            setLoading(false);
            return;
        }

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
    }, [user, navigate, isDemo, language]);

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
        if (vendor?.id && !isDemo) {
            fetchRecentInsight(vendor.id);
        }
    }, [vendor?.id, fetchRecentInsight, isDemo]);

    const [liveTrialUsed, setLiveTrialUsed] = useState(false);
    const [liveAccessUntil, setLiveAccessUntil] = useState(null);
    const [isProcessingLive, setIsProcessingLive] = useState(false);

    const fetchVendorProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', user.id);

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

            if (selectedVendor) {
                setVendor(selectedVendor);
                setLiveTrialUsed(selectedVendor.live_trial_used || false);
                setLiveAccessUntil(selectedVendor.live_access_until);

                // Fetch Category Support & Plan Features separately since there's no FK join
                const [catRes, planRes] = await Promise.all([
                    supabase.from('categories').select('is_live_supported').eq('name', selectedVendor.category).maybeSingle(),
                    supabase.from('subscription_plans').select('features').eq('name', selectedVendor.subscription_tier || 'free').maybeSingle()
                ]);

                setCategorySupport(catRes.data?.is_live_supported || false);

                // Live Access Logic: Check if they have Premium OR if they have temporary access
                const now = new Date();
                const tempAccess = selectedVendor.live_access_until && new Date(selectedVendor.live_access_until) > now;
                const premiumAccess = planRes.data?.features?.live_requests === true;

                setHasLiveAccess(premiumAccess || tempAccess);
            }
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTrial = async () => {
        if (!vendor || liveTrialUsed) return;
        setIsProcessingLive(true);
        try {
            const accessUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const { error } = await supabase
                .from('vendors')
                .update({
                    live_trial_used: true,
                    live_access_until: accessUntil
                })
                .eq('id', vendor.id);

            if (error) throw error;
            alert('✅ ' + t('dashboard.liveAccessPass.trialStarted'));
            fetchVendorProfile();
        } catch (err) {
            console.error('Trial error:', err);
            alert('❌ ' + err.message);
        } finally {
            setIsProcessingLive(false);
        }
    };

    const handleUnlockWithCredits = async () => {
        if (!vendor || isProcessingLive) return;
        const PRICE = 20;

        if ((vendor.credit_balance || 0) < PRICE) {
            alert('❌ ' + t('dashboard.liveAccessPass.insufficientCredits'));
            return;
        }

        setIsProcessingLive(true);
        try {
            const accessUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            // 1. Deduct credits and set access
            const { error: vError } = await supabase
                .from('vendors')
                .update({
                    credit_balance: (vendor.credit_balance || 0) - PRICE,
                    live_access_until: accessUntil
                })
                .eq('id', vendor.id);

            if (vError) throw vError;

            // 2. Add transaction
            await supabase.from('transactions').insert({
                user_id: vendor.id,
                type: 'debet',
                status: 'approved',
                credits_removed: PRICE,
                description: 'Canlı İstek Paneli - 24 Saatlik Erişim',
                amount: 0
            });

            alert('✅ ' + t('dashboard.liveAccessPass.creditUnlocked'));
            fetchVendorProfile();
        } catch (err) {
            console.error('Unlock error:', err);
            alert('❌ ' + err.message);
        } finally {
            setIsProcessingLive(false);
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
                                        {t(`dashboard.tiers.${vendor?.subscription_tier || 'free'}.name`)}
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

                            <div className="insight-card-premium">
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
                                        <div className={`circular-score ${recentInsight ? '' : 'analyzing'}`}>
                                            <span style={{ fontSize: '2rem', fontWeight: '800' }}>{recentInsight?.performance_score || '...'}</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{recentInsight ? t('dashboard.gamification.aiAnalysis.scoreLabel') : 'AI'}</span>
                                        </div>
                                    </div>

                                    <div className="content-container flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span style={{ fontSize: '1.2rem' }}>🧠</span>
                                            <h3 style={{ margin: 0 }}>{t('dashboard.gamification.aiAnalysis.title')}</h3>
                                            <span className="pulse-dot"></span>
                                        </div>

                                        {recentInsight ? (
                                            <>
                                                <p className="summary-text mb-5">
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
                                                            <div key={i} className="rec-pill">
                                                                <span style={{ color: '#fb7185' }}>✦</span> {localizedRec}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="loading-state py-4">
                                                <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '8px' }}>🚀 {t('dashboard.gamification.aiAnalysis.preparing') || 'Analiz Hazırlanıyor...'}</p>
                                                <p style={{ opacity: 0.7, fontStyle: 'italic', fontSize: '0.9rem' }}>{t('dashboard.gamification.aiAnalysis.analyzing')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{t('dashboard.status')}</h3>
                                <span className="status-active" style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>{t('dashboard.active')}</span>
                            </div>
                            <div className="stat-card">
                                <h3>{t('dashboard.package')}</h3>
                                <p className="text-sm font-bold" style={{ color: '#6366f1', marginTop: '5px' }}>
                                    {t(`dashboard.tiers.${vendor?.subscription_tier || 'free'}.name`)}
                                </p>
                            </div>
                        </div>

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
            case 'live-request':
                return (
                    <div className="live-request-tab-content">
                        <div className="flex justify-between items-center mb-6">
                            <h2>{t('dashboard.livePanel')}</h2>
                        </div>

                        {hasLiveAccess ? (
                            <div className="live-access-success" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '15px', border: '1px solid #eee' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔴</div>
                                <h3 style={{ marginBottom: '15px' }}>{t('dashboard.liveAccessPass.creditUnlocked')}</h3>
                                <p style={{ marginBottom: '30px', color: '#666' }}>{t('dashboard.liveAccessPass.trialStarted')}</p>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => {
                                        const liveUrl = import.meta.env.VITE_LIVE_MODULE_URL || 'http://localhost:5175';
                                        window.open(`${liveUrl}/dashboard`, '_blank');
                                    }}
                                    style={{ padding: '15px 40px', fontSize: '1.2rem', background: '#f43f5e', border: 'none' }}
                                >
                                    {t('dashboard.promo.viewPanel')}
                                </button>
                            </div>
                        ) : (
                            <div className="live-request-upsell" style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '15px', border: '1px solid #eee' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💎</div>
                                <h3 style={{ marginBottom: '10px', fontSize: '1.5rem', color: '#1a1a1a' }}>{t('dashboard.liveAccessPass.title')}</h3>
                                <p style={{ marginBottom: '30px', color: '#666' }}>{t('dashboard.liveAccessPass.desc')}</p>

                                <div className="live-pass-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>

                                    {/* Option 1: Trial */}
                                    {!liveTrialUsed && (
                                        <div className="pass-card" style={{ padding: '25px', border: '2px solid #3b82f6', borderRadius: '12px', background: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <h4 style={{ marginBottom: '10px', color: '#1e40af' }}>{t('dashboard.liveAccessPass.trialBtn')}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#60a5fa', marginBottom: '20px' }}>{t('dashboard.liveAccessPass.trialHint')}</p>
                                            </div>
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleStartTrial}
                                                disabled={isProcessingLive}
                                                style={{ width: '100%', background: '#3b82f6', border: 'none' }}
                                            >
                                                {isProcessingLive ? '...' : t('dashboard.livePanel')}
                                            </button>
                                        </div>
                                    )}

                                    {/* Option 2: Credits */}
                                    <div className="pass-card" style={{ padding: '25px', border: '2px solid #f59e0b', borderRadius: '12px', background: '#fffbeb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '10px', color: '#92400e' }}>{t('dashboard.liveAccessPass.creditBtn')}</h4>
                                            <p style={{ fontSize: '0.85rem', color: '#d97706', marginBottom: '20px' }}>{t('dashboard.liveAccessPass.creditAction')}: <strong>{vendor?.credit_balance || 0}</strong></p>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleUnlockWithCredits}
                                            disabled={isProcessingLive}
                                            style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b' }}
                                        >
                                            {isProcessingLive ? '...' : t('dashboard.livePanel')}
                                        </button>
                                    </div>

                                    {/* Option 3: Premium */}
                                    <div className="pass-card" style={{ padding: '25px', border: '2px solid #8b5cf6', borderRadius: '12px', background: '#f5f3ff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '10px', color: '#5b21b6' }}>{t('dashboard.liveAccessPass.premiumBtn')}</h4>
                                            <p style={{ fontSize: '0.85rem', color: '#a78bfa', marginBottom: '20px' }}>💍 {t('pricing.monthly')}</p>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/pricing')}
                                            style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }}
                                        >
                                            {t('dashboard.liveAccessPass.premiumAction')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
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
            <aside className="dashboard-sidebar" ref={scrollRef}>
                {/* Shop Marketplace Promo Card - Modernized */}
                <div className="shop-promo-card">
                    <div className="shop-promo-icon-box">🛒</div>
                    <h4>{promo.title}</h4>
                    <p>{promo.desc}</p>
                    <div className="flex flex-col gap-2 mb-4">
                        <a
                            href="/shop/magaza/wedding-essentials-demo-mj7uva80"
                            target="_blank"
                            className="text-white/90 text-sm underline hover:text-white"
                        >
                            {promo.viewDemo}
                        </a>
                        <a
                            href="/shop-panel/demo"
                            target="_blank"
                            className="text-white/90 text-sm underline hover:text-white"
                        >
                            {promo.viewPanel}
                        </a>
                    </div>
                    <button
                        onClick={() => navigate('/shop/basvuru')}
                        className="shop-promo-btn"
                    >
                        {promo.apply}
                    </button>
                </div>
                <div className="sidebar-header" style={{ position: 'relative' }}>
                    <h3>{t('dashboard.panel')}</h3>
                    {isDemo && (
                        <span style={{
                            position: 'absolute',
                            right: '-10px',
                            top: '-5px',
                            background: '#f43f5e',
                            color: 'white',
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            borderRadius: '100px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(244,63,94,0.3)',
                            border: '2px solid white'
                        }}>
                            {t('dashboard.demo.badge')}
                        </span>
                    )}
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
                    {categorySupport && (
                        <button
                            className={`live-request-btn ${activeTab === 'live-request' ? 'active' : ''} ${!hasLiveAccess ? 'locked' : ''}`}
                            onClick={() => {
                                if (hasLiveAccess) {
                                    const liveUrl = import.meta.env.VITE_LIVE_MODULE_URL || 'http://localhost:5175';
                                    window.open(`${liveUrl}/dashboard`, '_blank');
                                } else {
                                    handleTabChange('live-request');
                                }
                            }}
                            style={{
                                background: hasLiveAccess
                                    ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                                    : (activeTab === 'live-request' ? '#f43f5e' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'),
                                color: 'white',
                                fontWeight: 'bold',
                                marginTop: '10px',
                                boxShadow: hasLiveAccess ? '0 4px 12px rgba(244, 63, 94, 0.3)' : 'none',
                                opacity: hasLiveAccess || activeTab === 'live-request' ? 1 : 0.8,
                                position: 'relative'
                            }}
                        >
                            {hasLiveAccess ? '🔴' : '🔒'} {t('dashboard.livePanel', 'Canlı İstek Paneli')}
                            {!hasLiveAccess && (
                                <span style={{
                                    fontSize: '10px',
                                    display: 'block',
                                    marginTop: '-2px',
                                    opacity: 0.9,
                                    fontWeight: 'normal'
                                }}>
                                    {t('dashboard.premiumRequired', 'Premium Gerekli')}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        className="help-nav-btn"
                        onClick={() => window.open('/faq?category=vendors', '_blank')}
                    >
                        ❓ {t('faq.title', 'Sıkça Sorulan Sorular')}
                    </button>
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    <button
                        className="support-btn"
                        onClick={() => handleTabChange('messages')}
                        style={{ color: '#007bff', fontWeight: 'bold' }}
                    >
                        🆘 {t('dashboard.liveSupport')}
                    </button>
                </nav>
            </aside >
            <main className="dashboard-content">
                {renderContent()}
            </main>
            {
                isDemo && (
                    <div className="demo-cta-banner">
                        <div className="demo-cta-content">
                            <div className="demo-cta-icon">🚀</div>
                            <div className="demo-cta-text">
                                <h4>{t('dashboard.demo.badge')}</h4>
                                <p>{t('dashboard.demo.ctaText')}</p>
                            </div>
                        </div>
                        <button
                            className="demo-cta-button"
                            onClick={() => navigate('/register')}
                        >
                            {t('dashboard.demo.ctaButton')}
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default VendorDashboard;
