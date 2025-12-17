import React, { useState } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerProfile = () => {
    const { shopAccount, fetchShopAccount } = useShopOwner();
    const { language } = useLanguage();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        business_name: shopAccount?.business_name || '',
        description_tr: shopAccount?.description_tr || '',
        description_de: shopAccount?.description_de || '',
        description_en: shopAccount?.description_en || '',
        logo_url: shopAccount?.logo_url || '',
        cover_image_url: shopAccount?.cover_image_url || '',
        video_url: shopAccount?.video_url || '',
        slogan_tr: shopAccount?.slogan_tr || '',
        slogan_de: shopAccount?.slogan_de || '',
        slogan_en: shopAccount?.slogan_en || '',
        about_tr: shopAccount?.about_tr || '',
        about_de: shopAccount?.about_de || '',
        about_en: shopAccount?.about_en || '',
        how_we_work_tr: shopAccount?.how_we_work_tr || '',
        how_we_work_de: shopAccount?.how_we_work_de || '',
        how_we_work_en: shopAccount?.how_we_work_en || '',
        experience_years: shopAccount?.experience_years || 1,
        contact_whatsapp: shopAccount?.contact_whatsapp || '',
        contact_phone: shopAccount?.contact_phone || '',
        contact_email: shopAccount?.contact_email || '',
        website_url: shopAccount?.website_url || '',
        display_settings: shopAccount?.display_settings || {
            show_view_count: true,
            show_live_viewers: false,
            show_stock_badge: false,
            show_trust_badges: true
        }
    });

    const texts = {
        tr: {
            title: 'Mağaza Profili',
            subtitle: 'Mağaza bilgilerinizi güncelleyin',
            businessName: 'İşletme Adı',
            description: 'Mağaza Açıklaması',
            turkish: 'Türkçe',
            german: 'Almanca',
            english: 'İngilizce',
            logo: 'Logo URL',
            cover: 'Kapak Görseli URL',
            video: 'Video URL (YouTube/Vimeo)',
            videoHelp: 'YouTube veya Vimeo video linki yapıştırın',
            slogan: 'Slogan',
            sloganHelp: 'Kısa ve etkileyici bir slogan (ör: "Almanya\'nın 1 numaralı düğün DJ\'i")',
            about: 'Hakkımızda',
            aboutHelp: 'İşletmenizi tanıtın, neden sizi seçmeliler?',
            howWeWork: 'Nasıl Çalışıyoruz',
            howWeWorkHelp: 'Müşterilerinizle nasıl çalıştığınızı açıklayın',
            experienceYears: 'Tecrübe (Yıl)',
            contact: 'İletişim Bilgileri',
            whatsapp: 'WhatsApp',
            phone: 'Telefon',
            email: 'E-posta',
            website: 'Website',
            save: 'Değişiklikleri Kaydet',
            saving: 'Kaydediliyor...',
            saved: '✅ Kaydedildi!',
            imageHelp: 'imgur, imgbb vb. servislerden URL yapıştırın',
            displaySettings: 'Görüntüleme Ayarları',
            displaySettingsDesc: 'Ürün sayfasında hangi bilgilerin görüneceğini seçin',
            showViewCount: 'Görüntüleme Sayısı',
            showViewCountDesc: 'Ürünün kaç kez görüntülendiğini göster',
            showLiveViewers: 'Canlı Ziyaretçi',
            showLiveViewersDesc: 'Şu an kaç kişinin baktığını göster',
            showStockBadge: 'Stok Durumu',
            showStockBadgeDesc: '"Stokta Var" rozetini göster',
            showTrustBadges: 'Güven Rozetleri',
            showTrustBadgesDesc: 'Doğrulanmış Satıcı, Hızlı Teslimat vb.',
            preview: 'Önizleme',
            storefrontInfo: 'Mağaza Vitrin Bilgileri',
            storefrontInfoDesc: 'Bu bilgiler mağaza sayfanızda görünecek'
        },
        de: {
            title: 'Shop-Profil',
            subtitle: 'Aktualisieren Sie Ihre Shop-Informationen',
            businessName: 'Firmenname',
            description: 'Shop-Beschreibung',
            turkish: 'Türkisch',
            german: 'Deutsch',
            english: 'Englisch',
            logo: 'Logo URL',
            cover: 'Titelbild URL',
            video: 'Video URL (YouTube/Vimeo)',
            videoHelp: 'YouTube oder Vimeo Video-Link einfügen',
            slogan: 'Slogan',
            sloganHelp: 'Ein kurzer, einprägsamer Slogan',
            about: 'Über uns',
            aboutHelp: 'Stellen Sie Ihr Unternehmen vor',
            howWeWork: 'So arbeiten wir',
            howWeWorkHelp: 'Beschreiben Sie Ihren Arbeitsprozess',
            experienceYears: 'Erfahrung (Jahre)',
            contact: 'Kontaktinformationen',
            whatsapp: 'WhatsApp',
            phone: 'Telefon',
            email: 'E-Mail',
            website: 'Website',
            save: 'Änderungen speichern',
            saving: 'Speichern...',
            saved: '✅ Gespeichert!',
            imageHelp: 'URL von imgur, imgbb usw. einfügen',
            preview: 'Vorschau',
            displaySettings: 'Anzeigeeinstellungen',
            displaySettingsDesc: 'Wählen Sie, welche Informationen auf der Produktseite angezeigt werden',
            showViewCount: 'Aufrufzähler',
            showViewCountDesc: 'Zeigt an, wie oft das Produkt aufgerufen wurde',
            showLiveViewers: 'Live-Besucher',
            showLiveViewersDesc: 'Zeigt, wie viele Personen gerade schauen',
            showStockBadge: 'Lagerstatus',
            showStockBadgeDesc: '"Auf Lager" Badge anzeigen',
            showTrustBadges: 'Vertrauensabzeichen',
            showTrustBadgesDesc: 'Verifizierter Verkäufer, Schnelle Lieferung usw.',
            storefrontInfo: 'Schaufenster-Informationen',
            storefrontInfoDesc: 'Diese Informationen werden auf Ihrer Shop-Seite angezeigt'
        },
        en: {
            title: 'Shop Profile',
            subtitle: 'Update your shop information',
            businessName: 'Business Name',
            description: 'Shop Description',
            turkish: 'Turkish',
            german: 'German',
            english: 'English',
            logo: 'Logo URL',
            cover: 'Cover Image URL',
            video: 'Video URL (YouTube/Vimeo)',
            videoHelp: 'Paste YouTube or Vimeo video link',
            slogan: 'Slogan',
            sloganHelp: 'A short, catchy tagline',
            about: 'About Us',
            aboutHelp: 'Introduce your business',
            howWeWork: 'How We Work',
            howWeWorkHelp: 'Describe your work process',
            experienceYears: 'Experience (Years)',
            contact: 'Contact Information',
            whatsapp: 'WhatsApp',
            phone: 'Phone',
            email: 'Email',
            website: 'Website',
            save: 'Save Changes',
            saving: 'Saving...',
            saved: '✅ Saved!',
            imageHelp: 'Paste URL from imgur, imgbb, etc.',
            preview: 'Preview',
            displaySettings: 'Display Settings',
            displaySettingsDesc: 'Choose what information appears on product pages',
            showViewCount: 'View Count',
            showViewCountDesc: 'Show how many times product was viewed',
            showLiveViewers: 'Live Viewers',
            showLiveViewersDesc: 'Show how many people are currently viewing',
            showStockBadge: 'Stock Status',
            showStockBadgeDesc: 'Show "In Stock" badge',
            showTrustBadges: 'Trust Badges',
            showTrustBadgesDesc: 'Verified Seller, Fast Shipping, etc.',
            storefrontInfo: 'Storefront Information',
            storefrontInfoDesc: 'This information will appear on your shop page'
        }
    };

    const txt = texts[language] || texts.tr;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('shop_accounts')
                .update({
                    business_name: formData.business_name,
                    description_tr: formData.description_tr || null,
                    description_de: formData.description_de || null,
                    description_en: formData.description_en || null,
                    logo_url: formData.logo_url || null,
                    cover_image_url: formData.cover_image_url || null,
                    video_url: formData.video_url || null,
                    slogan_tr: formData.slogan_tr || null,
                    slogan_de: formData.slogan_de || null,
                    slogan_en: formData.slogan_en || null,
                    about_tr: formData.about_tr || null,
                    about_de: formData.about_de || null,
                    about_en: formData.about_en || null,
                    how_we_work_tr: formData.how_we_work_tr || null,
                    how_we_work_de: formData.how_we_work_de || null,
                    how_we_work_en: formData.how_we_work_en || null,
                    experience_years: formData.experience_years || 1,
                    contact_whatsapp: formData.contact_whatsapp || null,
                    contact_phone: formData.contact_phone || null,
                    contact_email: formData.contact_email || null,
                    website_url: formData.website_url || null,
                    display_settings: formData.display_settings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', shopAccount.id);

            if (error) throw error;

            alert(txt.saved);
            fetchShopAccount();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="shop-owner-profile">
            <div className="shop-page-header">
                <h1>⚙️ {txt.title}</h1>
                <p>{txt.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="profile-grid">
                    {/* Left: Form */}
                    <div className="profile-form">
                        {/* Business Name */}
                        <div className="form-card">
                            <h3>🏪 {txt.businessName}</h3>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-card">
                            <h3>📝 {txt.description}</h3>
                            <div className="form-group">
                                <label>🇹🇷 {txt.turkish}</label>
                                <textarea
                                    value={formData.description_tr}
                                    onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 {txt.german}</label>
                                <textarea
                                    value={formData.description_de}
                                    onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 {txt.english}</label>
                                <textarea
                                    value={formData.description_en}
                                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="form-card">
                            <h3>🖼️ Görseller</h3>
                            <div className="form-group">
                                <label>{txt.logo}</label>
                                <input
                                    type="url"
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder={txt.imageHelp}
                                />
                                {formData.logo_url && (
                                    <div className="image-preview logo">
                                        <img src={formData.logo_url} alt="Logo" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>{txt.cover}</label>
                                <input
                                    type="url"
                                    value={formData.cover_image_url}
                                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                                    placeholder={txt.imageHelp}
                                />
                                {formData.cover_image_url && (
                                    <div className="image-preview cover">
                                        <img src={formData.cover_image_url} alt="Cover" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Storefront Info - NEW SECTION */}
                        <div className="form-card">
                            <h3>✨ {txt.storefrontInfo}</h3>
                            <p className="form-description">{txt.storefrontInfoDesc}</p>

                            {/* Video URL */}
                            <div className="form-group">
                                <label>🎥 {txt.video}</label>
                                <input
                                    type="url"
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    placeholder={txt.videoHelp}
                                />
                                <span className="form-hint">{txt.videoHelp}</span>
                            </div>

                            {/* Experience Years */}
                            <div className="form-group">
                                <label>🏆 {txt.experienceYears}</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 1 })}
                                    style={{ width: '100px' }}
                                />
                            </div>

                            {/* Slogan */}
                            <div className="form-group">
                                <label>💬 {txt.slogan}</label>
                                <span className="form-hint">{txt.sloganHelp}</span>
                            </div>
                            <div className="form-group">
                                <label>🇹🇷 {txt.turkish}</label>
                                <input
                                    type="text"
                                    value={formData.slogan_tr}
                                    onChange={(e) => setFormData({ ...formData, slogan_tr: e.target.value })}
                                    maxLength={150}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 {txt.german}</label>
                                <input
                                    type="text"
                                    value={formData.slogan_de}
                                    onChange={(e) => setFormData({ ...formData, slogan_de: e.target.value })}
                                    maxLength={150}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 {txt.english}</label>
                                <input
                                    type="text"
                                    value={formData.slogan_en}
                                    onChange={(e) => setFormData({ ...formData, slogan_en: e.target.value })}
                                    maxLength={150}
                                />
                            </div>
                        </div>

                        {/* About Us */}
                        <div className="form-card">
                            <h3>📖 {txt.about}</h3>
                            <p className="form-description">{txt.aboutHelp}</p>
                            <div className="form-group">
                                <label>🇹🇷 {txt.turkish}</label>
                                <textarea
                                    value={formData.about_tr}
                                    onChange={(e) => setFormData({ ...formData, about_tr: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 {txt.german}</label>
                                <textarea
                                    value={formData.about_de}
                                    onChange={(e) => setFormData({ ...formData, about_de: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 {txt.english}</label>
                                <textarea
                                    value={formData.about_en}
                                    onChange={(e) => setFormData({ ...formData, about_en: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* How We Work */}
                        <div className="form-card">
                            <h3>⚙️ {txt.howWeWork}</h3>
                            <p className="form-description">{txt.howWeWorkHelp}</p>
                            <div className="form-group">
                                <label>🇹🇷 {txt.turkish}</label>
                                <textarea
                                    value={formData.how_we_work_tr}
                                    onChange={(e) => setFormData({ ...formData, how_we_work_tr: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 {txt.german}</label>
                                <textarea
                                    value={formData.how_we_work_de}
                                    onChange={(e) => setFormData({ ...formData, how_we_work_de: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 {txt.english}</label>
                                <textarea
                                    value={formData.how_we_work_en}
                                    onChange={(e) => setFormData({ ...formData, how_we_work_en: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="form-card">
                            <h3>📞 {txt.contact}</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{txt.whatsapp}</label>
                                    <input
                                        type="text"
                                        value={formData.contact_whatsapp}
                                        onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                                        placeholder="+49 123 456 7890"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{txt.phone}</label>
                                    <input
                                        type="text"
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{txt.email}</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{txt.website}</label>
                                    <input
                                        type="url"
                                        value={formData.website_url}
                                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Display Settings */}
                        <div className="form-card">
                            <h3>🎨 {txt.displaySettings}</h3>
                            <p className="form-description">{txt.displaySettingsDesc}</p>

                            <div className="toggle-group">
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">👁️ {txt.showViewCount}</span>
                                        <span className="toggle-desc">{txt.showViewCountDesc}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.display_settings?.show_view_count ?? true}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                display_settings: { ...formData.display_settings, show_view_count: e.target.checked }
                                            })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">✓ {txt.showStockBadge}</span>
                                        <span className="toggle-desc">{txt.showStockBadgeDesc}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.display_settings?.show_stock_badge ?? false}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                display_settings: { ...formData.display_settings, show_stock_badge: e.target.checked }
                                            })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">🛡️ {txt.showTrustBadges}</span>
                                        <span className="toggle-desc">{txt.showTrustBadgesDesc}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.display_settings?.show_trust_badges ?? true}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                display_settings: { ...formData.display_settings, show_trust_badges: e.target.checked }
                                            })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? txt.saving : txt.save}
                        </button>
                    </div>

                    {/* Right: Preview */}
                    <div className="profile-preview">
                        <h3>👀 {txt.preview}</h3>
                        <div className="preview-card">
                            {formData.cover_image_url && (
                                <div className="preview-cover">
                                    <img src={formData.cover_image_url} alt="" />
                                </div>
                            )}
                            <div className="preview-content">
                                <div className="preview-logo">
                                    {formData.logo_url ? (
                                        <img src={formData.logo_url} alt="" />
                                    ) : (
                                        <span>🏪</span>
                                    )}
                                </div>
                                <h4>{formData.business_name || 'Mağaza Adı'}</h4>
                                <p>{formData[`description_${language}`] || formData.description_tr || 'Mağaza açıklaması...'}</p>
                                <div className="preview-contact">
                                    {formData.contact_whatsapp && <span>💬 WhatsApp</span>}
                                    {formData.contact_email && <span>📧 E-posta</span>}
                                    {formData.website_url && <span>🔗 Website</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <style>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                }

                .form-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .form-card h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    color: #111827;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: #374151;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #FF6B9D;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .image-preview {
                    margin-top: 0.5rem;
                }

                .image-preview.logo img {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 12px;
                }

                .image-preview.cover img {
                    width: 100%;
                    max-height: 120px;
                    object-fit: cover;
                    border-radius: 12px;
                }

                .btn-save {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-save:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 107, 157, 0.3);
                }

                .btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Preview */
                .profile-preview {
                    position: sticky;
                    top: 100px;
                }

                .profile-preview h3 {
                    font-size: 1rem;
                    color: #6b7280;
                    margin-bottom: 1rem;
                }

                .preview-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }

                .preview-cover {
                    height: 120px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                }

                .preview-cover img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preview-content {
                    padding: 1.5rem;
                    text-align: center;
                    margin-top: -50px;
                }

                .preview-logo {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 1rem;
                    background: white;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                }

                .preview-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preview-logo span {
                    font-size: 2rem;
                }

                .preview-content h4 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                    color: #111827;
                }

                .preview-content p {
                    color: #6b7280;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }

                .preview-contact {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .preview-contact span {
                    padding: 6px 12px;
                    background: #f3f4f6;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: #374151;
                }

                /* Toggle Switches for Display Settings */
                .form-description {
                    color: #6b7280;
                    font-size: 0.9rem;
                    margin: -0.5rem 0 1.5rem 0;
                }

                .toggle-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .toggle-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .toggle-item:hover {
                    background: #f3f4f6;
                }

                .toggle-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .toggle-label {
                    font-weight: 600;
                    color: #111827;
                    font-size: 0.95rem;
                }

                .toggle-desc {
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 52px;
                    height: 28px;
                    flex-shrink: 0;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #d1d5db;
                    transition: 0.3s;
                    border-radius: 28px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 22px;
                    width: 22px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .toggle-switch input:checked + .toggle-slider {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                }

                .toggle-switch input:checked + .toggle-slider:before {
                    transform: translateX(24px);
                }

                @media (max-width: 968px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }

                    .profile-preview {
                        position: static;
                        order: -1;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShopOwnerProfile;
