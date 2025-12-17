import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import './AdminAmazonSettings.css';

const AdminAmazonSettings = () => {
    usePageTitle('Amazon Ayarları');
    const { user } = useAuth();

    const [settings, setSettings] = useState({
        affiliate_tag: 'kolaydg1-21',
        amazon_domain: 'amazon.de',
        check_frequency: 'daily',
        check_time: '03:00',
        auto_hide_unavailable: 'true',
        email_notifications: 'true',
        gemini_api_key: '',
        max_daily_imports: '100'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('shop_amazon_settings')
            .select('key, value, description');

        if (!error && data) {
            const settingsObj = {};
            data.forEach(s => {
                settingsObj[s.key] = s.value;
            });
            setSettings(prev => ({ ...prev, ...settingsObj }));
        }

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Update each setting
            for (const [key, value] of Object.entries(settings)) {
                await supabase
                    .from('shop_amazon_settings')
                    .upsert({
                        key,
                        value,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'key' });
            }

            setMessage({ type: 'success', text: '✅ Ayarlar kaydedildi!' });
        } catch (err) {
            console.error('Save error:', err);
            setMessage({ type: 'error', text: 'Hata: ' + err.message });
        }

        setSaving(false);
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="admin-amazon-settings loading">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="admin-amazon-settings">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <Link to="/admin/amazon" className="back-link">← Dashboard</Link>
                    <h1>⚙️ Amazon Ayarları</h1>
                    <p>Affiliate ve sistem yapılandırması</p>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Settings Form */}
            <div className="settings-container">
                {/* Current Mode Indicator */}
                <div className="settings-section mode-section">
                    <h2>📍 Mevcut Mod</h2>
                    <div className="mode-indicator manual-mode">
                        <span className="mode-badge">✏️ Manuel Giriş Modu</span>
                        <p>Ürün bilgilerini doğrudan giriyorsunuz. API entegrasyonu geldiğinde otomatik mod aktif edilebilir.</p>
                    </div>
                </div>

                {/* Affiliate Settings */}
                <div className="settings-section">
                    <h2>🔗 Affiliate Ayarları</h2>

                    <div className="setting-item">
                        <label>Affiliate Tag (Tracking ID)</label>
                        <input
                            type="text"
                            value={settings.affiliate_tag}
                            onChange={(e) => handleChange('affiliate_tag', e.target.value)}
                            placeholder="kolaydg1-21"
                        />
                        <p className="help-text">Amazon'dan aldığınız affiliate ID</p>
                    </div>

                    <div className="setting-item">
                        <label>Amazon Domain</label>
                        <select
                            value={settings.amazon_domain}
                            onChange={(e) => handleChange('amazon_domain', e.target.value)}
                        >
                            <option value="amazon.de">amazon.de (Almanya)</option>
                            <option value="amazon.com" disabled>amazon.com (ABD) - Yakında</option>
                            <option value="amazon.co.uk" disabled>amazon.co.uk (İngiltere) - Yakında</option>
                        </select>
                        <p className="help-text">Şu an sadece Amazon.de destekleniyor</p>
                    </div>
                </div>

                {/* AI Settings - Active for Translation */}
                <div className="settings-section">
                    <h2>🤖 AI / Gemini Ayarları <span className="active-badge">Aktif</span></h2>
                    <p className="section-note success-note">AI çeviri özelliği için Gemini API anahtarınızı girin. Ürün ekleme sayfasında "AI ile Çevir" butonu ile kullanılır.</p>

                    <div className="setting-item">
                        <label>Gemini API Anahtarı</label>
                        <input
                            type="password"
                            value={settings.gemini_api_key}
                            onChange={(e) => handleChange('gemini_api_key', e.target.value)}
                            placeholder="AIza..."
                        />
                        <p className="help-text">
                            Google AI Studio'dan alın:
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                aistudio.google.com
                            </a>
                        </p>
                    </div>

                    <div className="setting-item">
                        <label>Günlük Maksimum Import</label>
                        <input
                            type="number"
                            value={settings.max_daily_imports}
                            onChange={(e) => handleChange('max_daily_imports', e.target.value)}
                            min="1"
                            max="500"
                            disabled
                        />
                        <p className="help-text">Günde eklenebilecek maksimum ürün sayısı</p>
                    </div>
                </div>

                {/* Auto Check Settings - Disabled for now */}
                <div className="settings-section disabled-section">
                    <h2>🔄 Otomatik Kontrol <span className="coming-soon-badge">Yakında</span></h2>
                    <p className="section-note">API entegrasyonu tamamlandığında ürün fiyatları ve stok durumu otomatik kontrol edilecek.</p>

                    <div className="setting-item">
                        <label>Kontrol Sıklığı</label>
                        <select
                            value={settings.check_frequency}
                            onChange={(e) => handleChange('check_frequency', e.target.value)}
                            disabled
                        >
                            <option value="daily">Günlük</option>
                            <option value="weekly">Haftalık</option>
                        </select>
                    </div>

                    <div className="setting-item">
                        <label>Kontrol Saati</label>
                        <input
                            type="time"
                            value={settings.check_time}
                            onChange={(e) => handleChange('check_time', e.target.value)}
                            disabled
                        />
                        <p className="help-text">Günlük kontrolün yapılacağı saat (sunucu saati)</p>
                    </div>

                    <div className="setting-item toggle disabled-toggle">
                        <div className="toggle-content">
                            <label>Mevcut Olmayan Ürünleri Otomatik Gizle</label>
                            <p className="help-text">Amazon'dan kalkan ürünler otomatik pasif yapılır</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.auto_hide_unavailable === 'true'}
                                onChange={(e) => handleChange('auto_hide_unavailable', e.target.checked ? 'true' : 'false')}
                                disabled
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="settings-section">
                    <h2>📧 Bildirimler</h2>

                    <div className="setting-item toggle">
                        <div className="toggle-content">
                            <label>Email Bildirimleri</label>
                            <p className="help-text">Fiyat değişikliği, stok uyarısı vb. için email al</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.email_notifications === 'true'}
                                onChange={(e) => handleChange('email_notifications', e.target.checked ? 'true' : 'false')}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="settings-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '⏳ Kaydediliyor...' : '💾 Ayarları Kaydet'}
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="info-box">
                <h3>ℹ️ Bilgi</h3>
                <ul>
                    <li><strong>Affiliate Tag:</strong> Amazon Partner Program'dan aldığınız takip kodu. Tüm linklere otomatik eklenir.</li>
                    <li><strong>Gemini API:</strong> Ürün bilgilerini otomatik çekmek için gerekli. Ücretsiz tier yeterli.</li>
                    <li><strong>Otomatik Kontrol:</strong> Sistem her gün belirtilen saatte tüm Amazon ürünlerini kontrol eder.</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminAmazonSettings;
