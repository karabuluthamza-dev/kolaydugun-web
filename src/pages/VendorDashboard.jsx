import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import ProfileEditor from '../components/VendorDashboard/ProfileEditor';
import GalleryManager from '../components/VendorDashboard/GalleryManager';
import LeadsViewer from '../components/VendorDashboard/LeadsViewer';
import VendorMessages from '../components/VendorDashboard/VendorMessages';
import VendorShop from '../components/VendorDashboard/VendorShop';
import VendorWallet from './VendorWallet';
import './VendorDashboard.css';

const VendorDashboard = () => {
    const { user } = useAuth();
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

    if (loading) return <div className="dashboard-loading">{t('login.loading')}</div>;

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
                        <h2>{t('dashboard.overview')}</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{t('dashboard.package')}</h3>
                                <span className={`badge badge-${vendor?.subscription_tier || 'free'}`}>
                                    {t(`vendorDashboard.tiers.${vendor?.subscription_tier || 'free'}.name`)}
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>{t('dashboard.status')}</h3>
                                <span className="status-active">{t('dashboard.active')}</span>
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
            case 'wallet':
                return <VendorWallet />;
            default:
                return <div>{t('dashboard.notFound')}</div>;
        }
    };

    // 3-language promo texts
    const promoTexts = {
        tr: {
            title: '🛍️ Yeni! Kendi Mağazanızı Açın',
            desc: 'KolayDugun Shop Marketplace\'te kendi ürünlerinizi satın. İlk 10 tedarikçiye özel avantajlar!',
            viewDemo: '🎨 Demo Mağazayı İncele',
            viewPanel: '⚙️ Demo Paneli Gör',
            apply: 'Hemen Başvur →'
        },
        de: {
            title: '🛍️ Neu! Eröffnen Sie Ihren Shop',
            desc: 'Verkaufen Sie Ihre Produkte im KolayDugun Shop Marketplace. Exklusive Vorteile für die ersten 10 Anbieter!',
            viewDemo: '🎨 Demo-Shop ansehen',
            viewPanel: '⚙️ Demo-Panel ansehen',
            apply: 'Jetzt bewerben →'
        },
        en: {
            title: '🛍️ New! Open Your Own Shop',
            desc: 'Sell your products in KolayDugun Shop Marketplace. Exclusive benefits for first 10 vendors!',
            viewDemo: '🎨 View Demo Shop',
            viewPanel: '⚙️ View Demo Panel',
            apply: 'Apply Now →'
        }
    };
    const promo = promoTexts[language] || promoTexts.tr;

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
