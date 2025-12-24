import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import VendorAcceleratorBanner from '../components/VendorAcceleratorBanner';
import { Award, TrendingUp, CheckCircle } from 'lucide-react';
import './VendorDashboardOverview.css';

const VendorDashboardOverview = () => {
    usePageTitle('Vendor Dashboard');
    const { user } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        plan_type: 'free',
        credit_balance: 0,
        total_leads: 0,
        unlocked_leads: 0,
        active_listings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardStats();
        }
    }, [user]);

    const fetchDashboardStats = async () => {
        setLoading(true);

        // Vendor profile (Wallet & Plan)
        const { data: profile } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Listing stats (using vendors table) - Fetch this FIRST to get Vendor IDs
        const { data: listings } = await supabase
            .from('vendors')
            .select('*')
            .eq('user_id', user.id);

        // Lead stats - Use IDs from listings
        let vendorLeads = [];
        if (listings && listings.length > 0) {
            const vendorIds = listings.map(v => v.id);
            const { data: leads } = await supabase
                .from('vendor_leads')
                .select('*')
                .in('vendor_id', vendorIds);
            if (leads) vendorLeads = leads;
        }

        setStats({
            plan_type: profile?.plan_type || 'free',
            credit_balance: profile?.credit_balance || 0,
            total_leads: vendorLeads.length || 0,
            unlocked_leads: vendorLeads.filter(l => l.is_unlocked).length || 0,
            active_listings: listings?.length || 0
        });

        setLoading(false);
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container vendor-dashboard-container">
            <VendorAcceleratorBanner variant="dashboard" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', alignItems: 'stretch' }}>
                <div className="dashboard-header" style={{ marginBottom: 0 }}>
                    <h1>Vendor Dashboard</h1>
                    <p>Hoş geldiniz! İşletmenizi buradan yönetin.</p>
                </div>

                <div className="card" style={{
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                    background: 'linear-gradient(to bottom right, #fff, #fafafa)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <Award color="#9333ea" size={20} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('dashboard.accelerator.growthCard.title')}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={14} color="#4f46e5" />
                                <span style={{ fontSize: '0.9rem' }}>{t('dashboard.accelerator.growthCard.freeVitrin')}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>%75</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                            <div style={{ width: '75%', height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <CheckCircle size={14} color="#10b981" />
                            <span style={{ fontSize: '0.9rem' }}>{t('dashboard.accelerator.growthCard.aiReport')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👤</div>
                    <div className="stat-content">
                        <h3>Plan</h3>
                        <p className={`plan-badge ${stats.plan_type}`}>
                            {stats.plan_type === 'pro' ? '⭐ Pro' : '🆓 Free'}
                        </p>
                        {stats.plan_type === 'free' && (
                            <Link to="/vendor/plan" className="upgrade-link">
                                Pro'ya Geç →
                            </Link>
                        )}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Kredi Bakiyesi</h3>
                        <p className="stat-value">{stats.credit_balance}</p>
                        <Link to="/vendor/wallet" className="action-link">
                            Kredi Yükle →
                        </Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📬</div>
                    <div className="stat-content">
                        <h3>Talepler</h3>
                        <p className="stat-value">
                            {stats.unlocked_leads} / {stats.total_leads}
                        </p>
                        <Link to="/vendor/leads" className="action-link">
                            Talepleri Gör →
                        </Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>Aktif İlanlar</h3>
                        <p className="stat-value">{stats.active_listings}</p>
                        <Link to="/vendor/listings" className="action-link">
                            İlanları Yönet →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Hızlı Aksiyonlar</h2>
                <div className="actions-grid">
                    <Link to="/vendor/leads" className="action-card">
                        <span className="action-icon">🔓</span>
                        <h3>Talepleri Görüntüle</h3>
                        <p>Yeni talepleri inceleyin ve iletişim bilgilerine erişin</p>
                    </Link>

                    <Link to="/vendor/listings" className="action-card">
                        <span className="action-icon">⭐</span>
                        <h3>İlanı Öne Çıkar</h3>
                        <p>İlanlarınızı üst sıralara taşıyın</p>
                    </Link>

                    <Link to="/vendor/wallet" className="action-card">
                        <span className="action-icon">💳</span>
                        <h3>Kredi Yükle</h3>
                        <p>Daha fazla talep açmak için kredi satın alın</p>
                    </Link>

                    <Link to="/vendor/plan" className="action-card">
                        <span className="action-icon">🚀</span>
                        <h3>Pro Plan</h3>
                        <p>Sınırsız ilan ve daha fazla özellik</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboardOverview;
