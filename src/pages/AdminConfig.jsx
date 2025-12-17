import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import ImageUpload from '../components/ImageUpload';
import './AdminConfig.css';

const AdminConfig = () => {
    usePageTitle('Sistem Ayarları');
    const { user } = useAuth();
    const [config, setConfig] = useState({});
    const [siteSettings, setSiteSettings] = useState({
        hero_title: { en: '', de: '', tr: '' },
        hero_subtitle: { en: '', de: '', tr: '' },
        hero_image_url: '',
        og_image_url: '',
        logo_url: '',
        favicon_url: '',
        social_media: { facebook: '', instagram: '', youtube: '', tiktok: '', twitter: '', linkedin: '' },
        online_counter_config: { mode: 'simulated', base: 150, range: 30 },
        blog_author_name: { en: 'KolayDugun Editorial', de: 'KolayDugun Redaktion', tr: 'KolayDüğün Editörü' },
        blog_author_avatar: '',
        trust_badges: { enabled: true, items: [] },
        cta_settings: { show_floating: false },
        hero_settings: { use_video: false, video_url: '' },
        default_commission_rate: 10.00
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [digestSettings, setDigestSettings] = useState({
        enabled: true,
        email: 'karabulut.hamza@gmail.com',
        frequency: 'daily',
        times: ['08:00'],
        instant_notifications: { payment: true, critical_reports: true }
    });
    const [sendingTestEmail, setSendingTestEmail] = useState(false);
    const [digestMessage, setDigestMessage] = useState({ type: '', text: '' });

    // FAQ Management State
    const [faqs, setFaqs] = useState([]);
    const [editingFaq, setEditingFaq] = useState(null);
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [faqForm, setFaqForm] = useState({
        question_tr: '', question_de: '', question_en: '',
        answer_tr: '', answer_de: '', answer_en: '',
        display_order: 0, is_active: true
    });
    const [faqLoading, setFaqLoading] = useState(false);

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

        if (!configData && !configError) {
            // Handle empty case if needed
        }

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
                og_image_url: settingsData.og_image_url || '',
                logo_url: settingsData.logo_url || '',
                favicon_url: settingsData.favicon_url || '',
                social_media: settingsData.social_media || { facebook: '', instagram: '', youtube: '', tiktok: '', twitter: '', linkedin: '' },
                online_counter_config: settingsData.online_counter_config || { mode: 'simulated', base: 150, range: 30 },
                blog_author_name: settingsData.blog_author_name || { en: 'KolayDugun Editorial', de: 'KolayDugun Redaktion', tr: 'KolayDüğün Editörü' },
                blog_author_avatar: settingsData.blog_author_avatar || '',
                trust_badges: settingsData.trust_badges || { enabled: true, items: [] },
                cta_settings: settingsData.cta_settings || { show_floating: false },
                hero_settings: settingsData.hero_settings || { use_video: false, video_url: '' },
                default_commission_rate: settingsData.default_commission_rate || 10.00
            });

            // Fetch digest settings
            if (settingsData?.admin_digest_settings) {
                setDigestSettings(settingsData.admin_digest_settings);
            }
        }

        // Fetch FAQs
        const { data: faqData, error: faqError } = await supabase
            .from('shop_page_faqs')
            .select('*')
            .order('display_order', { ascending: true });

        if (!faqError && faqData) {
            setFaqs(faqData);
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
                    og_image_url: siteSettings.og_image_url,
                    logo_url: siteSettings.logo_url,
                    favicon_url: siteSettings.favicon_url,
                    social_media: siteSettings.social_media,
                    online_counter_config: siteSettings.online_counter_config,
                    blog_author_name: siteSettings.blog_author_name,
                    blog_author_avatar: siteSettings.blog_author_avatar,
                    trust_badges: siteSettings.trust_badges,
                    cta_settings: siteSettings.cta_settings,
                    hero_settings: siteSettings.hero_settings,
                    default_commission_rate: siteSettings.default_commission_rate,
                    updated_at: new Date()
                })
                .eq('id', 1);

            if (error) throw error;
            alert('✅ Site ayarları güncellendi!');
        } catch (err) {
            console.error('Error updating site settings:', err);
            alert('Hata: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateDigestSettings = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({
                    admin_digest_settings: digestSettings,
                    updated_at: new Date()
                })
                .eq('id', 1);

            if (error) throw error;
            alert('✅ Rapor ayarları güncellendi!');
        } catch (err) {
            console.error('Error updating digest settings:', err);
            alert('Hata: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const sendTestDigestEmail = async () => {
        setSendingTestEmail(true);
        setDigestMessage({ type: '', text: '' });
        try {
            const { data, error } = await supabase.functions.invoke('send_admin_digest', {
                body: { test_mode: true }
            });

            if (error) throw error;

            if (data?.success) {
                setDigestMessage({ type: 'success', text: `✅ Test e-postası ${digestSettings.email} adresine gönderildi!` });
            } else {
                setDigestMessage({ type: 'error', text: '⚠️ ' + (data?.message || 'E-posta gönderilemedi') });
            }
        } catch (err) {
            console.error('Test email error:', err);
            setDigestMessage({ type: 'error', text: 'Hata: ' + err.message });
        } finally {
            setSendingTestEmail(false);
            // Auto-hide success message after 5 seconds
            setTimeout(() => setDigestMessage({ type: '', text: '' }), 8000);
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

    // FAQ Management Functions
    const openFaqModal = (faq = null) => {
        setShowFaqModal(true);
        if (faq) {
            setEditingFaq(faq);
            setFaqForm({
                question_tr: faq.question_tr,
                question_de: faq.question_de,
                question_en: faq.question_en,
                answer_tr: faq.answer_tr,
                answer_de: faq.answer_de,
                answer_en: faq.answer_en,
                display_order: faq.display_order,
                is_active: faq.is_active
            });
        } else {
            setEditingFaq(null);
            setFaqForm({
                question_tr: '', question_de: '', question_en: '',
                answer_tr: '', answer_de: '', answer_en: '',
                display_order: faqs.length + 1, is_active: true
            });
        }
    };

    const closeFaqModal = () => {
        setShowFaqModal(false);
        setEditingFaq(null);
        setFaqForm({
            question_tr: '', question_de: '', question_en: '',
            answer_tr: '', answer_de: '', answer_en: '',
            display_order: 0, is_active: true
        });
    };

    const saveFaq = async () => {
        setFaqLoading(true);
        try {
            if (editingFaq) {
                // Update existing FAQ
                const { error } = await supabase
                    .from('shop_page_faqs')
                    .update(faqForm)
                    .eq('id', editingFaq.id);
                if (error) throw error;
                alert('✅ FAQ güncellendi!');
            } else {
                // Create new FAQ
                const { error } = await supabase
                    .from('shop_page_faqs')
                    .insert([faqForm]);
                if (error) throw error;
                alert('✅ Yeni FAQ eklendi!');
            }
            closeFaqModal();
            fetchConfig(); // Reload FAQs
        } catch (err) {
            console.error('FAQ save error:', err);
            alert('Hata: ' + err.message);
        } finally {
            setFaqLoading(false);
        }
    };

    const deleteFaq = async (id) => {
        if (!confirm('Bu FAQ\'yu silmek istediğinize emin misiniz?')) return;

        setFaqLoading(true);
        try {
            const { error } = await supabase
                .from('shop_page_faqs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            alert('✅ FAQ silindi!');
            fetchConfig(); // Reload FAQs
        } catch (err) {
            console.error('FAQ delete error:', err);
            alert('Hata: ' + err.message);
        } finally {
            setFaqLoading(false);
        }
    };

    const toggleFaqActive = async (faq) => {
        setFaqLoading(true);
        try {
            const { error } = await supabase
                .from('shop_page_faqs')
                .update({ is_active: !faq.is_active })
                .eq('id', faq.id);
            if (error) throw error;
            fetchConfig(); // Reload FAQs
        } catch (err) {
            console.error('FAQ toggle error:', err);
            alert('Hata: ' + err.message);
        } finally {
            setFaqLoading(false);
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

            {/* Global Site Images */}
            <div className="config-section">
                <h2>🖼️ Site Görselleri</h2>
                <div className="config-card">
                    <div className="config-item-group">
                        <h3>Varsayılan Sosyal Medya Resmi (OG Image)</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                            WhatsApp, Facebook vb. paylaşımlarda firma resmi yoksa bu logo/resim görünür.
                            (Önerilen boyut: 1200x630px)
                        </p>
                        <ImageUpload
                            currentImageUrl={siteSettings.og_image_url}
                            onUploadComplete={(url) => handleSettingChange('og_image_url', url)}
                            folder="site-assets"
                        />
                    </div>

                    <div className="config-item-group" style={{ marginTop: '20px' }}>
                        <h3>Site İkonu (Favicon)</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                            Tarayıcı sekmesinde görünen küçük ikon. (Önerilen: 32x32px PNG veya ICO)
                        </p>
                        <ImageUpload
                            currentImageUrl={siteSettings.favicon_url}
                            onUploadComplete={(url) => handleSettingChange('favicon_url', url)}
                            folder="site-assets"
                        />
                    </div>
                </div>
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
                        <h3>Arkaplan Görseli</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                            Anasayfa üst (banner) alanında görünen büyük resim.
                        </p>
                        <ImageUpload
                            currentImageUrl={siteSettings.hero_image_url}
                            onUploadComplete={(url) => handleSettingChange('hero_image_url', url)}
                            folder="site-assets"
                        />
                        {/* Fallback manual input if needed, or remove */}
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Veya URL girin:</label>
                            <input
                                type="text"
                                value={siteSettings.hero_image_url || ''}
                                onChange={(e) => handleSettingChange('hero_image_url', e.target.value)}
                                placeholder="https://..."
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Tüm Site Ayarlarını Kaydet'}
                    </button>
                </div>
            </div>

            {/* Trust Badges Settings */}
            <div className="config-section">
                <h2>🏅 Güven Rozetleri</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Hero alanında, başlığın altında gösterilecek güvenilirlik rozetleri.
                    </p>

                    <div className="config-item">
                        <div className="config-label">
                            <strong>Rozetleri Göster</strong>
                            <small>Güven rozetlerini aktif/pasif yap</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={siteSettings.trust_badges?.enabled || false}
                                    onChange={(e) => handleSettingChange('trust_badges', { ...siteSettings.trust_badges, enabled: e.target.checked })}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    {siteSettings.trust_badges?.enabled && (
                        <div className="config-item-group" style={{ marginTop: '20px' }}>
                            <h3>Rozetler</h3>

                            {/* Existing badges */}
                            {siteSettings.trust_badges?.items?.map((badge, index) => (
                                <div key={index} style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                        <input
                                            type="text"
                                            value={badge.icon}
                                            onChange={(e) => {
                                                const newItems = [...siteSettings.trust_badges.items];
                                                newItems[index].icon = e.target.value;
                                                handleSettingChange('trust_badges', { ...siteSettings.trust_badges, items: newItems });
                                            }}
                                            placeholder="İkon (emoji)"
                                            style={{ width: '60px', textAlign: 'center', fontSize: '1.5rem' }}
                                        />
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: '#dc3545', color: 'white' }}
                                            onClick={() => {
                                                const newItems = siteSettings.trust_badges.items.filter((_, i) => i !== index);
                                                handleSettingChange('trust_badges', { ...siteSettings.trust_badges, items: newItems });
                                            }}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                    <div className="input-group">
                                        <label>🇹🇷 Türkçe</label>
                                        <input
                                            type="text"
                                            value={badge.text?.tr || ''}
                                            onChange={(e) => {
                                                const newItems = [...siteSettings.trust_badges.items];
                                                newItems[index].text = { ...newItems[index].text, tr: e.target.value };
                                                handleSettingChange('trust_badges', { ...siteSettings.trust_badges, items: newItems });
                                            }}
                                            placeholder="Örn: 4.9/5 Memnuniyet"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>🇬🇧 İngilizce</label>
                                        <input
                                            type="text"
                                            value={badge.text?.en || ''}
                                            onChange={(e) => {
                                                const newItems = [...siteSettings.trust_badges.items];
                                                newItems[index].text = { ...newItems[index].text, en: e.target.value };
                                                handleSettingChange('trust_badges', { ...siteSettings.trust_badges, items: newItems });
                                            }}
                                            placeholder="Ex: 4.9/5 Satisfaction"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>🇩🇪 Almanca</label>
                                        <input
                                            type="text"
                                            value={badge.text?.de || ''}
                                            onChange={(e) => {
                                                const newItems = [...siteSettings.trust_badges.items];
                                                newItems[index].text = { ...newItems[index].text, de: e.target.value };
                                                handleSettingChange('trust_badges', { ...siteSettings.trust_badges, items: newItems });
                                            }}
                                            placeholder="z.B: 4.9/5 Zufriedenheit"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Add new badge button */}
                            <button
                                className="btn btn-secondary"
                                style={{ marginTop: '10px' }}
                                onClick={() => {
                                    const newItems = [...(siteSettings.trust_badges?.items || []), { icon: '✓', text: { tr: '', en: '', de: '' } }];
                                    handleSettingChange('trust_badges', { ...siteSettings.trust_badges, items: newItems });
                                }}
                            >
                                + Yeni Rozet Ekle
                            </button>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Güven Rozetlerini Kaydet'}
                    </button>
                </div>
            </div>

            {/* Floating CTA Settings */}
            <div className="config-section">
                <h2>📍 Floating CTA Butonu</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Sayfa aşağı kaydırıldığında sağ alt köşede görünen "Ücretsiz Teklif Al" butonu.
                    </p>

                    <div className="config-item">
                        <div className="config-label">
                            <strong>Floating CTA'yı Göster</strong>
                            <small>Kaydırıldığında sağ alt köşede buton göster</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={siteSettings.cta_settings?.show_floating || false}
                                    onChange={(e) => handleSettingChange('cta_settings', { ...siteSettings.cta_settings, show_floating: e.target.checked })}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'CTA Ayarlarını Kaydet'}
                    </button>
                </div>
            </div>

            {/* Video Background Settings */}
            <div className="config-section">
                <h2>🎬 Video Arka Plan</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Hero alanında statik görsel yerine video oynatın. MP4 formatı önerilir.
                    </p>

                    <div className="config-item">
                        <div className="config-label">
                            <strong>Video Kullan</strong>
                            <small>Statik görsel yerine video arka plan</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={siteSettings.hero_settings?.use_video || false}
                                    onChange={(e) => handleSettingChange('hero_settings', { ...siteSettings.hero_settings, use_video: e.target.checked })}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    {siteSettings.hero_settings?.use_video && (
                        <div className="config-item-group" style={{ marginTop: '15px' }}>
                            <h3>Video Yükle</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                                MP4 formatında video dosyası seçin. Maksimum 20MB önerilir.
                            </p>

                            {/* Video Upload */}
                            <div style={{
                                border: '2px dashed #ccc',
                                borderRadius: '10px',
                                padding: '20px',
                                textAlign: 'center',
                                background: '#fafafa',
                                marginBottom: '15px'
                            }}>
                                <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (file.size > 50 * 1024 * 1024) {
                                            alert('Video dosyası 50MB\'dan küçük olmalı!');
                                            return;
                                        }

                                        setVideoUploading(true);
                                        try {
                                            const fileName = `videos/hero-video-${Date.now()}.mp4`;
                                            const { data, error } = await supabase.storage
                                                .from('blog-images')
                                                .upload(fileName, file, {
                                                    cacheControl: '3600',
                                                    upsert: true
                                                });

                                            if (error) throw error;

                                            const { data: urlData } = supabase.storage
                                                .from('blog-images')
                                                .getPublicUrl(fileName);

                                            handleSettingChange('hero_settings', {
                                                ...siteSettings.hero_settings,
                                                video_url: urlData.publicUrl
                                            });

                                            alert('✅ Video başarıyla yüklendi!');
                                        } catch (err) {
                                            console.error('Video upload error:', err);
                                            alert('Video yükleme hatası: ' + err.message);
                                        } finally {
                                            setVideoUploading(false);
                                        }
                                    }}
                                    disabled={videoUploading}
                                    style={{ display: 'none' }}
                                    id="video-upload-input"
                                />
                                <label
                                    htmlFor="video-upload-input"
                                    style={{
                                        cursor: videoUploading ? 'wait' : 'pointer',
                                        display: 'block'
                                    }}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎬</div>
                                    <span style={{
                                        background: videoUploading ? '#ccc' : '#8B2252',
                                        color: 'white',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        display: 'inline-block',
                                        fontWeight: 'bold'
                                    }}>
                                        {videoUploading ? 'Yükleniyor...' : 'Video Dosyası Seç'}
                                    </span>
                                </label>
                            </div>

                            {/* Current Video Preview */}
                            {siteSettings.hero_settings?.video_url && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mevcut Video:</label>
                                    <video
                                        src={siteSettings.hero_settings.video_url}
                                        style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                                        controls
                                        muted
                                    />
                                </div>
                            )}

                            {/* Manual URL Input */}
                            <div className="input-group">
                                <label>Veya Video URL girin:</label>
                                <input
                                    type="text"
                                    value={siteSettings.hero_settings?.video_url || ''}
                                    onChange={(e) => handleSettingChange('hero_settings', { ...siteSettings.hero_settings, video_url: e.target.value })}
                                    placeholder="https://example.com/wedding-video.mp4"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Video Ayarlarını Kaydet'}
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
                        {['facebook', 'instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'].map(platform => (
                            <div className="input-group" key={platform}>
                                <label style={{ textTransform: 'capitalize' }}>
                                    <span className="icon">
                                        {platform === 'facebook' && '📘'}
                                        {platform === 'instagram' && '📷'}
                                        {platform === 'youtube' && '▶️'}
                                        {platform === 'tiktok' && '🎵'}
                                        {platform === 'twitter' && '🐦'}
                                        {platform === 'linkedin' && '💼'}
                                    </span> {platform}
                                </label>
                                <input
                                    type="text"
                                    value={siteSettings.social_media?.[platform] || ''}
                                    onChange={(e) => handleSettingChange('social_media', { ...siteSettings.social_media, [platform]: e.target.value })}
                                    placeholder={`https://${platform}.com/...`}
                                />
                            </div>
                        ))}
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

            {/* Blog Author Settings */}
            <div className="config-section">
                <h2>✍️ Blog Yazarı Ayarları</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Blog yazılarında görünecek yazar bilgilerini buradan yönetin.
                    </p>

                    <div className="config-item-group">
                        <h3>Yazar Fotoğrafı</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                            Blog yazılarında görünecek yazar avatarı. (Önerilen: 100x100px kare resim)
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {siteSettings.blog_author_avatar && (
                                <img
                                    src={siteSettings.blog_author_avatar}
                                    alt="Author"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #e5e7eb'
                                    }}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <ImageUpload
                                    currentImageUrl={siteSettings.blog_author_avatar}
                                    onUploadComplete={(url) => handleSettingChange('blog_author_avatar', url)}
                                    folder="site-assets"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="config-item-group" style={{ marginTop: '20px' }}>
                        <h3>Yazar Adı (3 Dil)</h3>
                        <div className="input-group">
                            <label>🇹🇷 Türkçe</label>
                            <input
                                type="text"
                                value={siteSettings.blog_author_name?.tr || ''}
                                onChange={(e) => handleSettingChange('blog_author_name', e.target.value, 'tr')}
                                placeholder="Örn: KolayDüğün Editörü"
                            />
                        </div>
                        <div className="input-group">
                            <label>🇬🇧 İngilizce</label>
                            <input
                                type="text"
                                value={siteSettings.blog_author_name?.en || ''}
                                onChange={(e) => handleSettingChange('blog_author_name', e.target.value, 'en')}
                                placeholder="Ex: KolayDugun Editorial"
                            />
                        </div>
                        <div className="input-group">
                            <label>🇩🇪 Almanca</label>
                            <input
                                type="text"
                                value={siteSettings.blog_author_name?.de || ''}
                                onChange={(e) => handleSettingChange('blog_author_name', e.target.value, 'de')}
                                placeholder="z.B: KolayDugun Redaktion"
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Blog Yazarı Ayarlarını Kaydet'}
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

            {/* Online Counter Settings (NEW) */}
            <div className="config-section">
                <h2>🟢 Online Sayaç Ayarları</h2>
                <div className="config-card">
                    <div className="config-item-group">
                        <h3>Sayaç Modu</h3>
                        <div className="flex gap-4 mb-4">
                            {['simulated', 'static', 'off'].map(mode => (
                                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="counterMode"
                                        checked={siteSettings.online_counter_config?.mode === mode}
                                        onChange={() => handleSettingChange('online_counter_config', { ...siteSettings.online_counter_config, mode })}
                                    />
                                    <span className="capitalize">{mode === 'simulated' ? 'Simülasyon' : (mode === 'static' ? 'Sabit' : 'Kapalı')}</span>
                                </label>
                            ))}
                        </div>

                        {siteSettings.online_counter_config?.mode !== 'off' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label>Başlangıç Sayısı (Base)</label>
                                    <input
                                        type="number"
                                        value={siteSettings.online_counter_config?.base || 150}
                                        onChange={(e) => handleSettingChange('online_counter_config', { ...siteSettings.online_counter_config, base: parseInt(e.target.value) })}
                                    />
                                    <small className="text-gray-400">Sayaç bu sayı etrafında döner.</small>
                                </div>
                                {siteSettings.online_counter_config?.mode === 'simulated' && (
                                    <div className="input-group">
                                        <label>Dalgalanma (Range +/-)</label>
                                        <input
                                            type="number"
                                            value={siteSettings.online_counter_config?.range || 30}
                                            onChange={(e) => handleSettingChange('online_counter_config', { ...siteSettings.online_counter_config, range: parseInt(e.target.value) })}
                                        />
                                        <small className="text-gray-400">Örn: 30 ise, sayı Base +/- 30 arasında değişir.</small>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Sayaç Ayarlarını Kaydet'}
                    </button>
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

            {/* Admin Digest Email Settings */}
            <div className="config-section">
                <h2>📧 Günlük Rapor E-postası</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Her gün belirlenen saatte site istatistiklerini içeren bir özet e-postası alın.
                    </p>

                    <div className="config-item">
                        <div className="config-label">
                            <strong>Günlük Raporu Aktif Et</strong>
                            <small>Her sabah 08:00'de e-posta al</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={digestSettings.enabled || false}
                                    onChange={(e) => setDigestSettings({ ...digestSettings, enabled: e.target.checked })}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="config-item">
                        <div className="config-label">
                            <strong>💰 Anlık Ödeme Bildirimi</strong>
                            <small>Ödeme alındığında hemen e-posta gönder</small>
                        </div>
                        <div className="config-value">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={digestSettings.instant_notifications?.payment || false}
                                    onChange={(e) => setDigestSettings({
                                        ...digestSettings,
                                        instant_notifications: {
                                            ...digestSettings.instant_notifications,
                                            payment: e.target.checked
                                        }
                                    })}
                                    disabled={saving}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="config-item-group" style={{ marginTop: '15px' }}>
                        <div className="input-group">
                            <label>📬 E-posta Adresleri</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(Array.isArray(digestSettings.emails) ? digestSettings.emails : [digestSettings.email || '']).map((email, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                const emails = Array.isArray(digestSettings.emails)
                                                    ? [...digestSettings.emails]
                                                    : [digestSettings.email || ''];
                                                emails[index] = e.target.value;
                                                setDigestSettings({ ...digestSettings, emails, email: emails[0] });
                                            }}
                                            placeholder="ornek@email.com"
                                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        />
                                        {(Array.isArray(digestSettings.emails) ? digestSettings.emails : []).length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const emails = digestSettings.emails.filter((_, i) => i !== index);
                                                    setDigestSettings({ ...digestSettings, emails, email: emails[0] });
                                                }}
                                                style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const emails = Array.isArray(digestSettings.emails)
                                            ? [...digestSettings.emails, '']
                                            : [digestSettings.email || '', ''];
                                        setDigestSettings({ ...digestSettings, emails });
                                    }}
                                    style={{ alignSelf: 'flex-start', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 15px', cursor: 'pointer' }}
                                >
                                    + E-posta Ekle
                                </button>
                            </div>
                            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                Birden fazla e-posta ekleyebilirsiniz. Her birine rapor gönderilecek.
                            </small>
                        </div>
                    </div>

                    <div className="config-item-group" style={{ marginTop: '15px' }}>
                        <div className="input-group">
                            <label>⏰ Rapor Saati</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {digestSettings.times?.map((time, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => {
                                                const newTimes = [...(digestSettings.times || [])];
                                                newTimes[index] = e.target.value;
                                                setDigestSettings({ ...digestSettings, times: newTimes });
                                            }}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        />
                                        {digestSettings.times?.length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const newTimes = digestSettings.times.filter((_, i) => i !== index);
                                                    setDigestSettings({ ...digestSettings, times: newTimes });
                                                }}
                                                style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer' }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newTimes = [...(digestSettings.times || []), '18:00'];
                                        setDigestSettings({ ...digestSettings, times: newTimes });
                                    }}
                                    style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}
                                >
                                    + Saat Ekle
                                </button>
                            </div>
                            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                Birden fazla saat ekleyebilirsiniz. Örneğin: 08:00 sabah, 18:00 akşam.
                            </small>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            onClick={updateDigestSettings}
                            disabled={saving}
                        >
                            {saving ? 'Kaydediliyor...' : 'Rapor Ayarlarını Kaydet'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={sendTestDigestEmail}
                            disabled={sendingTestEmail || !digestSettings.email}
                            style={{ background: '#4caf50', color: 'white', border: 'none' }}
                        >
                            {sendingTestEmail ? '📤 Gönderiliyor...' : '🧪 Test E-postası Gönder'}
                        </button>
                    </div>

                    {/* Success/Error Message */}
                    {digestMessage.text && (
                        <div style={{
                            marginTop: '15px',
                            padding: '15px 20px',
                            borderRadius: '10px',
                            background: digestMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: digestMessage.type === 'success' ? '#155724' : '#721c24',
                            border: `1px solid ${digestMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '500'
                        }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>
                                {digestMessage.type === 'success' ? '✅' : '⚠️'}
                            </span>
                            {digestMessage.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Affiliate Commission Settings */}
            <div className="config-section">
                <h2>💰 Affiliate Komisyon Ayarları</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Shop owner'ların ürün affiliate programı için default komisyon oranını ayarlayın.
                    </p>

                    <div className="config-item-group">
                        <h3>Default Komisyon Oranı</h3>
                        <div className="input-group">
                            <label>Komisyon Oranı (%)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={siteSettings.default_commission_rate || 10.00}
                                    onChange={(e) => handleSettingChange('default_commission_rate', parseFloat(e.target.value))}
                                    style={{ width: '120px' }}
                                />
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>%</span>
                            </div>
                            <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
                                Tüm shop owner'lar için geçerli olan default komisyon oranı.
                                Belirli shop'lara özel oran vermek için Admin → Shop Accounts sayfasını kullanın.
                            </small>
                        </div>

                        <div style={{
                            marginTop: '15px',
                            padding: '12px',
                            background: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>
                                💡 <strong>Örnek:</strong> %{siteSettings.default_commission_rate || 10} komisyon ile €100'lük satıştan shop owner €{((siteSettings.default_commission_rate || 10) * 100 / 100).toFixed(2)} kazanır.
                            </p>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '20px' }}
                        onClick={updateSiteSettings}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Komisyon Ayarlarını Kaydet'}
                    </button>
                </div>
            </div>

            {/* Shop FAQ Management */}
            <div className="config-section">
                <h2>❓ Shop Sayfası FAQ'ları</h2>
                <div className="config-card">
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Amazon Shop sayfasında görünecek SSS (Sıkça Sorulan Sorular) listesini yönetin.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => openFaqModal()}
                        style={{ marginBottom: '20px' }}
                    >
                        + Yeni FAQ Ekle
                    </button>

                    {/* FAQ List */}
                    <div style={{ marginTop: '20px' }}>
                        {faqs.map((faq, index) => (
                            <div key={faq.id} style={{
                                padding: '15px',
                                background: faq.is_active ? '#f8f9fa' : '#ffe6e6',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                border: `1px solid ${faq.is_active ? '#e5e7eb' : '#ffcccc'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                            #{faq.display_order} - {faq.question_tr}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            {faq.answer_tr?.substring(0, 100)}...
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: '#4caf50', color: 'white' }}
                                            onClick={() => openFaqModal(faq)}
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: faq.is_active ? '#ff9800' : '#28a745', color: 'white' }}
                                            onClick={() => toggleFaqActive(faq)}
                                        >
                                            {faq.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: '#dc3545', color: 'white' }}
                                            onClick={() => deleteFaq(faq.id)}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Modal */}
            {showFaqModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 9999
                }} onClick={closeFaqModal}>
                    <div style={{
                        background: 'white', borderRadius: '12px', padding: '30px',
                        maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '20px' }}>
                            {editingFaq ? 'FAQ Düzenle' : 'Yeni FAQ Ekle'}
                        </h2>

                        {/* Questions */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Soru</h3>
                            <div className="input-group">
                                <label>🇹🇷 Türkçe</label>
                                <input
                                    type="text"
                                    value={faqForm.question_tr}
                                    onChange={(e) => setFaqForm({ ...faqForm, question_tr: e.target.value })}
                                    placeholder="Soru (Türkçe)"
                                />
                            </div>
                            <div className="input-group">
                                <label>🇩🇪 Almanca</label>
                                <input
                                    type="text"
                                    value={faqForm.question_de}
                                    onChange={(e) => setFaqForm({ ...faqForm, question_de: e.target.value })}
                                    placeholder="Frage (Deutsch)"
                                />
                            </div>
                            <div className="input-group">
                                <label>🇬🇧 İngilizce</label>
                                <input
                                    type="text"
                                    value={faqForm.question_en}
                                    onChange={(e) => setFaqForm({ ...faqForm, question_en: e.target.value })}
                                    placeholder="Question (English)"
                                />
                            </div>
                        </div>

                        {/* Answers */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Cevap</h3>
                            <div className="input-group">
                                <label>🇹🇷 Türkçe</label>
                                <textarea
                                    value={faqForm.answer_tr}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer_tr: e.target.value })}
                                    placeholder="Cevap (Türkçe)"
                                    rows="4"
                                />
                            </div>
                            <div className="input-group">
                                <label>🇩🇪 Almanca</label>
                                <textarea
                                    value={faqForm.answer_de}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer_de: e.target.value })}
                                    placeholder="Antwort (Deutsch)"
                                    rows="4"
                                />
                            </div>
                            <div className="input-group">
                                <label>🇬🇧 İngilizce</label>
                                <textarea
                                    value={faqForm.answer_en}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer_en: e.target.value })}
                                    placeholder="Answer (English)"
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Display Order & Active */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Sıra</label>
                                <input
                                    type="number"
                                    value={faqForm.display_order}
                                    onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label>Aktif:</label>
                                <input
                                    type="checkbox"
                                    checked={faqForm.is_active}
                                    onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={closeFaqModal}
                                disabled={faqLoading}
                            >
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={saveFaq}
                                disabled={faqLoading || !faqForm.question_tr || !faqForm.answer_tr}
                            >
                                {faqLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

