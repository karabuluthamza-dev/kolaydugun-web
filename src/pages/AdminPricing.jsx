import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminDashboard.css'; // Reusing admin styles

const AdminPricing = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({});
    const [creditPackages, setCreditPackages] = useState([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch System Settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('system_settings')
                .select('*');
            if (settingsError) throw settingsError;

            const settingsMap = {};
            settingsData.forEach(item => {
                settingsMap[item.key] = item.value;
            });
            setSettings(settingsMap);

            // Fetch Credit Packages
            const { data: packagesData, error: packagesError } = await supabase
                .from('credit_packages')
                .select('*')
                .order('price', { ascending: true });
            if (packagesError) throw packagesError;
            setCreditPackages(packagesData);

            // Fetch Subscription Plans
            const { data: plansData, error: plansError } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('price_monthly', { ascending: true });
            if (plansError) throw plansError;
            setSubscriptionPlans(plansData);

        } catch (error) {
            console.error('Error fetching pricing data:', error);
            setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = async (key, newValue) => {
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({ key, value: newValue, updated_at: new Date() });

            if (error) throw error;
            setSettings({ ...settings, [key]: newValue });
            setMessage({ type: 'success', text: 'Ayarlar güncellendi.' });
        } catch (error) {
            console.error('Error updating setting:', error);
            setMessage({ type: 'error', text: 'Güncelleme başarısız.' });
        }
    };

    const handlePackageChange = async (id, field, value) => {
        try {
            const { error } = await supabase
                .from('credit_packages')
                .update({ [field]: value, updated_at: new Date() })
                .eq('id', id);

            if (error) throw error;

            setCreditPackages(creditPackages.map(pkg =>
                pkg.id === id ? { ...pkg, [field]: value } : pkg
            ));
            setMessage({ type: 'success', text: 'Paket güncellendi.' });
        } catch (error) {
            console.error('Error updating package:', error);
            setMessage({ type: 'error', text: 'Güncelleme başarısız.' });
        }
    };

    const handlePlanChange = async (id, field, value) => {
        try {
            const { error } = await supabase
                .from('subscription_plans')
                .update({ [field]: value, updated_at: new Date() })
                .eq('id', id);

            if (error) throw error;

            setSubscriptionPlans(subscriptionPlans.map(plan =>
                plan.id === id ? { ...plan, [field]: value } : plan
            ));
            setMessage({ type: 'success', text: 'Plan güncellendi.' });
        } catch (error) {
            console.error('Error updating plan:', error);
            setMessage({ type: 'error', text: 'Güncelleme başarısız.' });
        }
    };

    const handleFeatureToggle = async (planId, featureKey) => {
        const plan = subscriptionPlans.find(p => p.id === planId);
        const newFeatures = { ...plan.features, [featureKey]: !plan.features[featureKey] };
        handlePlanChange(planId, 'features', newFeatures);
    };

    if (loading) return <div className="p-4">Yükleniyor...</div>;

    return (
        <div className="admin-dashboard-container">
            <h1 className="admin-title">Fiyatlandırma ve Ayarlar</h1>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px', padding: '10px', borderRadius: '5px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
                    {message.text}
                </div>
            )}

            {/* Global Settings Section */}
            <section className="admin-section" style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Genel Ayarlar</h2>
                <div className="form-group" style={{ maxWidth: '400px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Müşteri Kilidi Açma Maliyeti (Kredi)</label>
                    <input
                        type="number"
                        className="form-control"
                        value={settings.lead_unlock_cost || 5}
                        onChange={(e) => handleSettingChange('lead_unlock_cost', parseInt(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        Bir tedarikçinin iletişim bilgilerini görmek için harcaması gereken kredi miktarı.
                    </small>
                </div>
            </section>

            {/* Subscription Plans Section */}
            <section className="admin-section" style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px', color: '#2c3e50', fontSize: '1.5rem' }}>Abonelik Paketleri</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                    {subscriptionPlans.map(plan => (
                        <div key={plan.id} style={{
                            border: plan.id === 'premium' ? '2px solid #ffd700' : '1px solid #e0e0e0',
                            borderRadius: '12px',
                            padding: '25px',
                            background: plan.id === 'premium' ? '#fffdf5' : '#fff',
                            position: 'relative',
                            transition: 'transform 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            {plan.id === 'premium' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    right: '20px',
                                    background: '#ffd700',
                                    color: '#333',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    Önerilen
                                </div>
                            )}
                            <h3 style={{ textTransform: 'capitalize', marginBottom: '20px', color: '#2c3e50', fontSize: '1.4rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                {plan.name === 'free' ? 'Ücretsiz Paket' : plan.name === 'premium' ? 'Premium Paket' : plan.name}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px', display: 'block' }}>Aylık Fiyat (€)</label>
                                    <input
                                        type="number"
                                        value={plan.price_monthly}
                                        onChange={(e) => handlePlanChange(plan.id, 'price_monthly', parseFloat(e.target.value))}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px', display: 'block' }}>Yıllık Fiyat (€)</label>
                                    <input
                                        type="number"
                                        value={plan.price_yearly}
                                        onChange={(e) => handlePlanChange(plan.id, 'price_yearly', parseFloat(e.target.value))}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontWeight: '600', display: 'block', marginBottom: '15px', color: '#2c3e50' }}>Paket Özellikleri</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.entries(plan.features || {}).map(([key, value]) => {
                                        // Feature Name Translation Map
                                        const featureNames = {
                                            verified_badge: '✅ Onaylı Rozeti',
                                            top_placement: '🚀 Üst Sıralarda Gösterim',
                                            social_links: '🔗 Sosyal Medya Linkleri',
                                            map_view: '🗺️ Harita Görünümü',
                                            live_requests: '🎤 Canlı İstek Paneli',
                                            monthly_free_credits: '💎 Aylık Hediye Kredi'
                                        };

                                        return (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={value === true || value > 0}
                                                    onChange={() => handleFeatureToggle(plan.id, key)}
                                                    style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '0.95rem', color: '#444', flex: 1 }}>
                                                    {featureNames[key] || key}
                                                </span>
                                                {key === 'monthly_free_credits' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <input
                                                            type="number"
                                                            value={plan.features.monthly_free_credits}
                                                            onChange={(e) => {
                                                                const newFeatures = { ...plan.features, monthly_free_credits: parseInt(e.target.value) };
                                                                handlePlanChange(plan.id, 'features', newFeatures);
                                                            }}
                                                            style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'center' }}
                                                        />
                                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Adet</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Credit Packages Section */}
            <section className="admin-section" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Kredi Paketleri</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Paket Adı</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Kredi Miktarı</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Fiyat (€)</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creditPackages.map(pkg => (
                                <tr key={pkg.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="text"
                                            value={pkg.name}
                                            onChange={(e) => handlePackageChange(pkg.id, 'name', e.target.value)}
                                            style={{ padding: '6px', width: '100%' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number"
                                            value={pkg.credits}
                                            onChange={(e) => handlePackageChange(pkg.id, 'credits', parseInt(e.target.value))}
                                            style={{ padding: '6px', width: '80px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number"
                                            value={pkg.price}
                                            onChange={(e) => handlePackageChange(pkg.id, 'price', parseFloat(e.target.value))}
                                            style={{ padding: '6px', width: '80px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            onClick={() => handlePackageChange(pkg.id, 'is_active', !pkg.is_active)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: pkg.is_active ? '#28a745' : '#dc3545',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {pkg.is_active ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminPricing;
