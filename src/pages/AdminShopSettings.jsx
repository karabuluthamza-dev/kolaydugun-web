import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminShopSettings.css';

const AdminShopSettings = () => {
    usePageTitle('Shop Ayarları - Admin');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        affiliate_first_month_rate: 10,
        affiliate_recurring_rate: 5,
        cookie_duration_days: 30,
        plans: {
            starter: { price_monthly: 19, price_yearly: 190, product_limit: 5 },
            business: { price_monthly: 39, price_yearly: 390, product_limit: 20 },
            premium: { price_monthly: 69, price_yearly: 690, product_limit: -1 }
        }
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('shop_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                const settingsObj = {};
                data.forEach(item => {
                    // Parse JSON values
                    try {
                        settingsObj[item.key] = typeof item.value === 'string'
                            ? JSON.parse(item.value)
                            : item.value;
                    } catch {
                        settingsObj[item.key] = item.value;
                    }
                });
                setSettings(prev => ({ ...prev, ...settingsObj }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showMessage('error', 'Ayarlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        try {
            setSaving(true);

            const jsonValue = typeof value === 'object' ? value : value;

            const { error } = await supabase
                .from('shop_settings')
                .upsert({
                    key,
                    value: jsonValue,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                });

            if (error) throw error;

            showMessage('success', 'Ayar güncellendi');
        } catch (error) {
            console.error('Error updating setting:', error);
            showMessage('error', 'Güncelleme hatası: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePlanChange = (planName, field, value) => {
        const numValue = field === 'product_limit' && value === '' ? -1 : Number(value);
        setSettings(prev => ({
            ...prev,
            plans: {
                ...prev.plans,
                [planName]: {
                    ...prev.plans[planName],
                    [field]: numValue
                }
            }
        }));
    };

    const savePlans = async () => {
        await updateSetting('plans', settings.plans);
    };

    const saveAffiliateRates = async () => {
        await updateSetting('affiliate_first_month_rate', settings.affiliate_first_month_rate);
        await updateSetting('affiliate_recurring_rate', settings.affiliate_recurring_rate);
    };

    const saveCookieDuration = async () => {
        await updateSetting('cookie_duration_days', settings.cookie_duration_days);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    if (loading) {
        return (
            <div className="admin-shop-settings">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-shop-settings">
            <div className="page-header">
                <h1>🏪 Shop Marketplace Ayarları</h1>
                <p>Plan fiyatları, affiliate oranları ve diğer ayarları yönetin</p>
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Plan Pricing Section */}
            <div className="settings-section">
                <div className="section-header">
                    <h2>💰 Plan Fiyatları</h2>
                    <button
                        onClick={savePlans}
                        disabled={saving}
                        className="save-btn"
                    >
                        {saving ? '⏳ Kaydediliyor...' : '💾 Planları Kaydet'}
                    </button>
                </div>

                <div className="plans-grid">
                    {/* Starter Plan */}
                    <div className="plan-card starter">
                        <div className="plan-header">
                            <span className="plan-icon">🌱</span>
                            <h3>Starter</h3>
                        </div>
                        <div className="plan-fields">
                            <div className="field-group">
                                <label>Aylık Fiyat (€)</label>
                                <input
                                    type="number"
                                    value={settings.plans.starter?.price_monthly || 0}
                                    onChange={(e) => handlePlanChange('starter', 'price_monthly', e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label>Yıllık Fiyat (€)</label>
                                <input
                                    type="number"
                                    value={settings.plans.starter?.price_yearly || 0}
                                    onChange={(e) => handlePlanChange('starter', 'price_yearly', e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label>Ürün Limiti</label>
                                <input
                                    type="number"
                                    value={settings.plans.starter?.product_limit || 0}
                                    onChange={(e) => handlePlanChange('starter', 'product_limit', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Plan */}
                    <div className="plan-card business">
                        <div className="plan-header">
                            <span className="plan-icon">🚀</span>
                            <h3>Business</h3>
                            <span className="popular-badge">Popüler</span>
                        </div>
                        <div className="plan-fields">
                            <div className="field-group">
                                <label>Aylık Fiyat (€)</label>
                                <input
                                    type="number"
                                    value={settings.plans.business?.price_monthly || 0}
                                    onChange={(e) => handlePlanChange('business', 'price_monthly', e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label>Yıllık Fiyat (€)</label>
                                <input
                                    type="number"
                                    value={settings.plans.business?.price_yearly || 0}
                                    onChange={(e) => handlePlanChange('business', 'price_yearly', e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label>Ürün Limiti</label>
                                <input
                                    type="number"
                                    value={settings.plans.business?.product_limit || 0}
                                    onChange={(e) => handlePlanChange('business', 'product_limit', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="plan-card premium">
                        <div className="plan-header">
                            <span className="plan-icon">👑</span>
                            <h3>Premium</h3>
                        </div>
                        <div className="plan-fields">
                            <div className="field-group">
                                <label>Aylık Fiyat (€)</label>
                                <input
                                    type="number"
                                    value={settings.plans.premium?.price_monthly || 0}
                                    onChange={(e) => handlePlanChange('premium', 'price_monthly', e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label>Yıllık Fiyat (€)</label>
                                <input
                                    type="number"
                                    value={settings.plans.premium?.price_yearly || 0}
                                    onChange={(e) => handlePlanChange('premium', 'price_yearly', e.target.value)}
                                />
                            </div>
                            <div className="field-group">
                                <label>Ürün Limiti</label>
                                <input
                                    type="number"
                                    value={settings.plans.premium?.product_limit === -1 ? '' : settings.plans.premium?.product_limit}
                                    placeholder="Sınırsız (-1)"
                                    onChange={(e) => handlePlanChange('premium', 'product_limit', e.target.value)}
                                />
                                <span className="field-hint">Sınırsız için boş bırakın</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affiliate Settings Section */}
            <div className="settings-section">
                <div className="section-header">
                    <h2>🔗 Affiliate Komisyonları</h2>
                    <button
                        onClick={saveAffiliateRates}
                        disabled={saving}
                        className="save-btn"
                    >
                        {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                    </button>
                </div>

                <div className="affiliate-grid">
                    <div className="setting-card">
                        <div className="setting-icon">💵</div>
                        <div className="setting-content">
                            <label>İlk Ay Komisyon Oranı (%)</label>
                            <p className="setting-desc">Referans ile gelen mağazanın ilk ay ödemesinden</p>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.affiliate_first_month_rate}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        affiliate_first_month_rate: Number(e.target.value)
                                    }))}
                                />
                                <span className="suffix">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="setting-card">
                        <div className="setting-icon">🔄</div>
                        <div className="setting-content">
                            <label>Devam Eden Ay Komisyon Oranı (%)</label>
                            <p className="setting-desc">Sonraki aylar için komisyon (aktif değil)</p>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.affiliate_recurring_rate}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        affiliate_recurring_rate: Number(e.target.value)
                                    }))}
                                />
                                <span className="suffix">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cookie Duration Section */}
            <div className="settings-section">
                <div className="section-header">
                    <h2>🍪 Cookie Ayarları</h2>
                    <button
                        onClick={saveCookieDuration}
                        disabled={saving}
                        className="save-btn"
                    >
                        {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                    </button>
                </div>

                <div className="cookie-settings">
                    <div className="setting-card wide">
                        <div className="setting-icon">⏱️</div>
                        <div className="setting-content">
                            <label>Affiliate Cookie Süresi</label>
                            <p className="setting-desc">
                                Referans linki tıklandıktan sonra kaç gün içinde başvuru yapılırsa komisyon geçerli olur
                            </p>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={settings.cookie_duration_days}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        cookie_duration_days: Number(e.target.value)
                                    }))}
                                />
                                <span className="suffix">gün</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="info-section">
                <h3>ℹ️ Bilgi</h3>
                <ul>
                    <li><strong>Plan Fiyatları:</strong> Yeni mağaza onaylarında bu fiyatlar kullanılır</li>
                    <li><strong>Affiliate Komisyonu:</strong> Referans ile gelen mağazanın ilk ödemesinden %{settings.affiliate_first_month_rate} komisyon</li>
                    <li><strong>Cookie Süresi:</strong> Referans linki tıklandıktan {settings.cookie_duration_days} gün içinde başvuru geçerli</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminShopSettings;
