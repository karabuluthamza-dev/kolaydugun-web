import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminConfig.css';

const AdminConfig = () => {
    usePageTitle('Sistem Ayarları');
    const { user } = useAuth();
    const [config, setConfig] = useState({});
    const [siteSettings, setSiteSettings] = useState({
        hero_title: { en: '', de: '', tr: '' },
        hero_subtitle: { en: '', de: '', tr: '' },
        hero_image_url: '',
        social_media: { facebook: '', instagram: '', youtube: '', tiktok: '', twitter: '', linkedin: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchConfig();
        }
    }, [user]);

    const fetchConfig = async () => {
        setLoading(true);

        // Fetch Marketplace Config
        const { data: configData, error: configError } = await supabase
            .from('marketplace_config')
            .select('*');

        if (!configError && configData) {
            const configObj = {};
            configData.forEach(item => {
                try {
                    configObj[item.key] = JSON.parse(item.value);
                } catch {
                    configObj[item.key] = item.value;
                }
            });
            setConfig(configObj);
        }

        // Fetch Site Settings
        const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .select('*')
            .single();

        if (!settingsError && settingsData) {
            setSiteSettings({
                hero_title: settingsData.hero_title || { en: '', de: '', tr: '' },
                hero_subtitle: settingsData.hero_subtitle || { en: '', de: '', tr: '' },
                hero_image_url: settingsData.hero_image_url || '',
                social_media: settingsData.social_media || { facebook: '', instagram: '', youtube: '', tiktok: '', twitter: '', linkedin: '' }
            });
        }

        setLoading(false);
    };

    const updateConfig = async (key, value) => {
        setSaving(true);
        try {
            const jsonValue = JSON.stringify(value);

            const { error } = await supabase
                .from('marketplace_config')
                .update({ value: jsonValue })
                .eq('key', key);

            if (error) throw error;

            alert('✅ Ayar güncellendi!');
            fetchConfig();
        } catch (err) {
            console.error('Update error:', err);
            alert('Hata: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateSiteSettings = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({
                    hero_title: siteSettings.hero_title,
                    hero_subtitle: siteSettings.hero_subtitle,
                    hero_image_url: siteSettings.hero_image_url,
                    social_media: siteSettings.social_media,
                    updated_at: new Date()
                })
                .eq('id', 1);

            if (error) throw error;
            alert('✅ Anasayfa ayarları güncellendi!');
        } catch (err) {
            console.error('Error updating site settings:', err);
            alert('Hata: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSettingChange = (field, value, lang = null) => {
        if (lang) {
            setSiteSettings(prev => ({
                ...prev,
                [field]: { ...prev[field], [lang]: value }
            }));
        } else {
            setSiteSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handlePayPalEmailUpdate = () => {
        const newEmail = prompt('Yeni PayPal e-posta adresi:', config.paypal_email || '');
        if (newEmail) {
            updateConfig('paypal_email', newEmail);
        }
    };

    const handleLeadPriceUpdate = (category) => {
        const currentPrice = config.lead_prices?.[category] || 5;
        const newPrice = prompt(`${category} kategorisi için lead fiyatı (kredi):`, currentPrice);
        if (newPrice && !isNaN(newPrice)) {
            const updatedPrices = { ...config.lead_prices, [category]: parseInt(newPrice) };
            updateConfig('lead_prices', updatedPrices);
        }
    };

    const handleFeaturedPriceUpdate = (duration) => {
        const currentPrice = config.featured_prices?.[duration] || 0;
        const newPrice = prompt(`${duration} için featured fiyatı (kredi):`, currentPrice);
        if (newPrice && !isNaN(newPrice)) {
            const updatedPrices = { ...config.featured_prices, [duration]: parseInt(newPrice) };
            updateConfig('featured_prices', updatedPrices);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container admin-config-container">
            <div className="admin-config-header">
                <h1>Sistem Ayarları</h1>
                <p>Pazaryeri konfigürasyonunu yönetin</p>
            </div>

            {/* Homepage Settings */}
            <div className="config-section">
                <h2>🏠 Anasayfa Ayarları (Hero Alanı)</h2>
                <div className="config-card">
                    <div className="config-item-group">
                        <h3>Başlık (Title)</h3>
                        <div className="input-group">
                            <label>Türkçe</label>
                            <input
                                type="text"
                                value={siteSettings.hero_title.tr || ''}
                                onChange={(e) => handleSettingChange('hero_title', e.target.value, 'tr')}
                                placeholder="Örn: Almanya'da Hayalinizdeki Düğün"
                            />
                        </div>
                        <div className="input-group">
                            <label>İngilizce</label>
                            <input
                                type="text"
                                value={siteSettings.hero_title.en || ''}
                                onChange={(e) => handleSettingChange('hero_title', e.target.value, 'en')}
                                placeholder="Ex: Dream Wedding in Germany"
                            />
                        </div>
                        <div className="input-group">
                            <label>Almanca</label>
                            <input
                                type="text"
                                value={siteSettings.hero_title.de || ''}
                                onChange={(e) => handleSettingChange('hero_title', e.target.value, 'de')}
                                placeholder="z.B.: Traumhochzeit in Deutschland"
                            />
                        </div>
                    </div>

                    <div className="config-item-group" style={{ marginTop: '20px' }}>
                        <h3>Alt Başlık (Subtitle)</h3>
                        <div className="input-group">
                            <label>Türkçe</label>
                            <input
                                type="text"
                                value={siteSettings.hero_subtitle.tr || ''}
                                onChange={(e) => handleSettingChange('hero_subtitle', e.target.value, 'tr')}
                            />
                        </div>
                        <div className="input-group">
                            <label>İngilizce</label>
                            <input
                                type="text"
                                value={siteSettings.hero_subtitle.en || ''}
                                onChange={(e) => handleSettingChange('hero_subtitle', e.target.value, 'en')}
                            />
                        </div>
                        <div className="input-group">
                            <label>Almanca</label>
                            <input
                                type="text"
                                value={siteSettings.hero_subtitle.de || ''}
                                onChange={(e) => handleSettingChange('hero_subtitle', e.target.value, 'de')}
                            />
                        </div>
                    </div>

                    <div className="config-item-group" style={{ marginTop: '20px' }}>
                        <h3>Arkaplan Görseli (URL)</h3>
                        <input
                            type="text"
                            value={siteSettings.hero_image_url || ''}
                            onChange={(e) => handleSettingChange('hero_image_url', e.target.value)}
                            placeholder="https://..."
                            style={{ width: '100%' }}
                        />
                        {siteSettings.hero_image_url && (
                            <img
                                src={siteSettings.hero_image_url}
                                alt="Preview"
                                style={{ marginTop: '10px', maxHeight: '150px', borderRadius: '8px' }}
                            />
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Anasayfa Ayarlarını Kaydet'}
                    </button>
                </div>
            </div>

            {/* Social Media Settings */}
            <div className="config-section">
                <h2>🌐 Sosyal Medya Hesapları</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Sosyal medya butonlarının görünmesi için ilgili platformun linkini girin. Boş bırakırsanız buton görünmez.
                    </p>
                    <div className="config-item-group">
                        <div className="input-group">
                            <label><span className="icon">📘</span> Facebook</label>
                            <input
                                type="text"
                                value={siteSettings.social_media?.facebook || ''}
                                onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, facebook: e.target.value })}
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div className="input-group">
                            <label><span className="icon">📷</span> Instagram</label>
                            <input
                                type="text"
                                value={siteSettings.social_media?.instagram || ''}
                                onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, instagram: e.target.value })}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div className="input-group">
                            <label><span className="icon">▶️</span> YouTube</label>
                            <input
                                type="text"
                                value={siteSettings.social_media?.youtube || ''}
                                onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, youtube: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div className="input-group">
                            <label><span className="icon">🎵</span> TikTok</label>
                            <input
                                type="text"
                                value={siteSettings.social_media?.tiktok || ''}
                                onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, tiktok: e.target.value })}
                                placeholder="https://tiktok.com/..."
                            />
                        </div>
                        <div className="input-group">
                            <label><span className="icon">🐦</span> Twitter / X</label>
                            <input
                                type="text"
                                value={siteSettings.social_media?.twitter || ''}
                                onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, twitter: e.target.value })}
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                        <div className="input-group">
                            <label><span className="icon">💼</span> LinkedIn</label>
                            <input
                                type="text"
                                value={siteSettings.social_media?.linkedin || ''}
                                onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/..."
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Sosyal Medya Ayarlarını Kaydet'}
                    </button>
                </div>
            </div>

            {/* System Toggles */}
            <div className="config-section">
                <h2>⚙️ Sistem Durumu</h2>
                <div className="config-card">
                    <div className="config-item">
                        <div className="config-label">
                            <strong>Bakım Modu</strong>
                            <small>Siteyi sadece adminlere açık hale getirir</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={config.maintenance_mode || false}
                                    onChange={(e) => updateConfig('maintenance_mode', e.target.checked)}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div className="config-item">
                        <div className="config-label">
                            <strong>Fiyatlandırma Paketlerini Göster</strong>
                            <small>Kapatılırsa "Beta - Ücretsiz" modu aktif olur</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={config.show_pricing_plans || false}
                                    onChange={(e) => updateConfig('show_pricing_plans', e.target.checked)}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* PayPal Settings */}
            <div className="config-section">
                <h2>💳 PayPal Ayarları</h2>
                <div className="config-card">
                    <div className="config-item">
                        <div className="config-label">
                            <strong>PayPal E-posta</strong>
                            <small>Manuel transfer için kullanılır</small>
                        </div>
                        <div className="config-value">
                            <span>{config.paypal_email || 'Ayarlanmamış'}</span>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={handlePayPalEmailUpdate}
                                disabled={saving}
                            >
                                Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lead Prices */}
            <div className="config-section">
                <h2>📋 Lead Fiyatları (Kredi)</h2>
                <div className="config-card">
                    {Object.entries(config.lead_prices || {}).map(([category, price]) => (
                        <div key={category} className="config-item">
                            <div className="config-label">
                                <strong>{category}</strong>
                                <small>Lead açma fiyatı</small>
                            </div>
                            <div className="config-value">
                                <span className="price-badge">{price} kredi</span>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleLeadPriceUpdate(category)}
                                    disabled={saving}
                                >
                                    Düzenle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Prices */}
            <div className="config-section">
                <h2>⭐ Featured Listing Fiyatları (Kredi)</h2>
                <div className="config-card">
                    {Object.entries(config.featured_prices || {}).map(([duration, price]) => (
                        <div key={duration} className="config-item">
                            <div className="config-label">
                                <strong>{duration.replace('_', ' ')}</strong>
                                <small>Öne çıkarma süresi</small>
                            </div>
                            <div className="config-value">
                                <span className="price-badge">{price} kredi</span>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleFeaturedPriceUpdate(duration)}
                                    disabled={saving}
                                >
                                    Düzenle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="config-info">
                <h3>ℹ️ Bilgi</h3>
                <p>Fiyat değişiklikleri anında etkili olur.</p>
                <p>Mevcut işlemler etkilenmez, sadece yeni işlemler için geçerlidir.</p>
            </div>
        </div>
    );
};

export default AdminConfig;
