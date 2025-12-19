import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './VendorShop.css';

// 3-Language Help Texts System
const helpTexts = {
    imageUrl: {
        tr: "Görselinizi Imgur, Google Drive veya kendi sitenize yükleyin. Sonra resme sağ tıklayıp 'Resim adresini kopyala' seçin.",
        de: "Laden Sie Ihr Bild auf Imgur, Google Drive oder Ihre Website hoch. Klicken Sie rechts auf das Bild und wählen Sie 'Bildadresse kopieren'.",
        en: "Upload your image to Imgur, Google Drive or your website. Right-click on the image and select 'Copy image address'."
    },
    whatsapp: {
        tr: "WhatsApp numaranızı ülke koduyla girin (örn: +49 170 1234567). Müşteriler direkt mesaj atabilir.",
        de: "Geben Sie Ihre WhatsApp-Nummer mit Landesvorwahl ein (z.B. +49 170 1234567). Kunden können direkt schreiben.",
        en: "Enter your WhatsApp number with country code (e.g. +49 170 1234567). Customers can message you directly."
    },
    externalUrl: {
        tr: "Kendi web siteniz, Instagram veya diğer mağaza sayfanızın linkini ekleyin.",
        de: "Fügen Sie den Link zu Ihrer Website, Instagram oder Ihrem anderen Shop hinzu.",
        en: "Add a link to your website, Instagram or other shop page."
    },
    price: {
        tr: "Fiyat girmezseniz 'Fiyat için iletişime geçin' görünür.",
        de: "Wenn Sie keinen Preis eingeben, wird 'Preis auf Anfrage' angezeigt.",
        en: "If you don't enter a price, 'Price on request' will be shown."
    },
    category: {
        tr: "Ürününüz için en uygun kategoriyi seçin. Doğru kategori daha fazla görünürlük sağlar.",
        de: "Wählen Sie die passendste Kategorie. Die richtige Kategorie sorgt für mehr Sichtbarkeit.",
        en: "Select the most suitable category. The right category provides more visibility."
    },
    title: {
        tr: "Ürün adını kısa ve açıklayıcı yazın. En az Türkçe zorunlu, diğer diller opsiyonel.",
        de: "Schreiben Sie den Produktnamen kurz und beschreibend. Türkisch ist Pflicht, andere Sprachen optional.",
        en: "Write the product name short and descriptive. Turkish is required, other languages are optional."
    }
};

// Approval status labels in 3 languages
const statusLabels = {
    pending: {
        tr: '🟡 Onay Bekliyor',
        de: '🟡 Wartet auf Genehmigung',
        en: '🟡 Pending Approval'
    },
    approved: {
        tr: '✅ Onaylı',
        de: '✅ Genehmigt',
        en: '✅ Approved'
    },
    rejected: {
        tr: '❌ Reddedildi',
        de: '❌ Abgelehnt',
        en: '❌ Rejected'
    },
    inactive: {
        tr: '⚫ Pasif',
        de: '⚫ Inaktiv',
        en: '⚫ Inactive'
    }
};

const VendorShop = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [vendorId, setVendorId] = useState(null);
    const [vendorInfo, setVendorInfo] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const [formData, setFormData] = useState({
        category_id: '',
        title: { tr: '', de: '', en: '' },
        description: { tr: '', de: '', en: '' },
        image_url: '',
        price: '',
        currency: 'EUR',
        whatsapp_number: '',
        contact_email: '',
        contact_phone: '',
        external_url: '',
        price_on_request: false
    });

    useEffect(() => {
        if (user?.id) {
            fetchVendorInfo();
            fetchUserShopAccount();
        }
    }, [user]);

    const [shopAccount, setShopAccount] = useState(null);

    const fetchUserShopAccount = async () => {
        try {
            const { data } = await supabase
                .from('shop_accounts')
                .select('id, slug, business_name')
                .eq('email', user.email)
                .eq('is_active', true)
                .maybeSingle();
            if (data) {
                setShopAccount(data);
            }
        } catch (err) {
            // Kullanıcının shop hesabı yok - normal
        }
    };

    const fetchVendorInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('id, company_name, shop_enabled, shop_product_limit, shop_plan, shop_plan_expires_at')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            setVendorId(data.id);
            setVendorInfo(data);
            fetchProducts(data.id);
            fetchCategories();
        } catch (error) {
            console.error('Error fetching vendor:', error);
            setLoading(false);
        }
    };

    const fetchProducts = async (vId) => {
        try {
            const { data, error } = await supabase
                .from('shop_products')
                .select(`
                    *,
                    category:shop_categories(id, name)
                `)
                .eq('vendor_id', vId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await supabase
                .from('shop_categories')
                .select('id, name')
                .eq('is_active', true)
                .order('display_order');
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Check if vendor can add more products
    const canAddProduct = () => {
        if (!vendorInfo?.shop_enabled) return false;
        const limit = vendorInfo?.shop_product_limit || 0;
        if (limit === -1) return true; // Unlimited
        const currentCount = products.filter(p => p.status !== 'rejected').length;
        return currentCount < limit;
    };

    const getRemainingSlots = () => {
        const limit = vendorInfo?.shop_product_limit || 0;
        if (limit === -1) return '∞';
        const currentCount = products.filter(p => p.status !== 'rejected').length;
        return Math.max(0, limit - currentCount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.tr) {
            alert(language === 'de' ? 'Bitte geben Sie den türkischen Titel ein' :
                language === 'en' ? 'Please enter Turkish title' :
                    'Lütfen Türkçe başlık girin');
            return;
        }

        // Check product limit
        if (!editingProduct && !canAddProduct()) {
            alert(language === 'de' ? 'Produktlimit erreicht. Bitte upgraden Sie Ihren Plan.' :
                language === 'en' ? 'Product limit reached. Please upgrade your plan.' :
                    'Ürün limitine ulaştınız. Lütfen planınızı yükseltin.');
            return;
        }

        try {
            const slug = formData.title.tr.toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                + '-' + Date.now().toString(36);

            const payload = {
                vendor_id: vendorId,
                category_id: formData.category_id || null,
                slug,
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url,
                price: formData.price ? parseFloat(formData.price) : null,
                currency: formData.currency,
                whatsapp_number: formData.whatsapp_number || null,
                contact_email: formData.contact_email || null,
                contact_phone: formData.contact_phone || null,
                external_url: formData.external_url || null,
                price_on_request: formData.price_on_request,
                show_price: !formData.price_on_request,
                product_type: 'vendor',
                status: 'pending'
            };

            if (editingProduct) {
                delete payload.slug; // Don't change slug on edit
                const { error } = await supabase
                    .from('shop_products')
                    .update(payload)
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('shop_products')
                    .insert([payload]);
                if (error) throw error;
            }

            setShowModal(false);
            resetForm();
            fetchProducts(vendorId);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            category_id: product.category_id || '',
            title: product.title || { tr: '', de: '', en: '' },
            description: product.description || { tr: '', de: '', en: '' },
            image_url: product.image_url || '',
            price: product.price || '',
            currency: product.currency || 'EUR',
            whatsapp_number: product.whatsapp_number || '',
            contact_email: product.contact_email || '',
            contact_phone: product.contact_phone || '',
            external_url: product.external_url || '',
            price_on_request: product.price_on_request || false
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmMsg = language === 'de' ? 'Möchten Sie dieses Produkt wirklich löschen?' :
            language === 'en' ? 'Are you sure you want to delete this product?' :
                'Bu ürünü silmek istediğinize emin misiniz?';
        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('shop_products')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchProducts(vendorId);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            category_id: '',
            title: { tr: '', de: '', en: '' },
            description: { tr: '', de: '', en: '' },
            image_url: '',
            price: '',
            currency: 'EUR',
            whatsapp_number: '',
            contact_email: '',
            contact_phone: '',
            external_url: '',
            price_on_request: false
        });
    };

    const getStatusInfo = (status) => {
        const label = statusLabels[status]?.[language] || statusLabels.pending[language];
        const colors = {
            pending: { color: '#d97706', bg: '#fef3c7' },
            approved: { color: '#16a34a', bg: '#dcfce7' },
            rejected: { color: '#dc2626', bg: '#fee2e2' },
            inactive: { color: '#6b7280', bg: '#f3f4f6' }
        };
        return { label, ...colors[status] || colors.pending };
    };

    // UI Labels in 3 languages
    const labels = {
        title: { tr: 'Mağazam', de: 'Mein Shop', en: 'My Shop' },
        subtitle: { tr: 'Shop sayfasında listelenen ürünlerinizi yönetin', de: 'Verwalten Sie Ihre Produkte auf der Shop-Seite', en: 'Manage your products on the shop page' },
        addProduct: { tr: 'Ürün Ekle', de: 'Produkt hinzufügen', en: 'Add Product' },
        help: { tr: 'Yardım', de: 'Hilfe', en: 'Help' },
        noProducts: { tr: 'Henüz ürün eklemediniz', de: 'Sie haben noch keine Produkte hinzugefügt', en: 'You haven\'t added any products yet' },
        addFirstProduct: { tr: 'İlk Ürünümü Ekle', de: 'Mein erstes Produkt hinzufügen', en: 'Add My First Product' },
        editProduct: { tr: 'Ürün Düzenle', de: 'Produkt bearbeiten', en: 'Edit Product' },
        cancel: { tr: 'İptal', de: 'Abbrechen', en: 'Cancel' },
        save: { tr: 'Kaydet', de: 'Speichern', en: 'Save' },
        update: { tr: 'Güncelle', de: 'Aktualisieren', en: 'Update' },
        productLimit: { tr: 'Ürün Limiti', de: 'Produktlimit', en: 'Product Limit' },
        remaining: { tr: 'kalan', de: 'verbleibend', en: 'remaining' },
        shopNotEnabled: { tr: 'Shop özelliği aktif değil. Lütfen bir plan satın alın.', de: 'Shop-Funktion ist nicht aktiv. Bitte kaufen Sie einen Plan.', en: 'Shop feature is not active. Please purchase a plan.' },
        upgradePlan: { tr: 'Planı Yükselt', de: 'Plan upgraden', en: 'Upgrade Plan' }
    };

    if (loading) {
        return <div className="vendor-shop-loading">{language === 'de' ? 'Wird geladen...' : language === 'en' ? 'Loading...' : 'Yükleniyor...'}</div>;
    }

    // Shop not enabled message - redirect to apply
    if (!vendorInfo?.shop_enabled) {
        return (
            <div className="vendor-shop">
                <div className="shop-disabled-notice">
                    <span>🏪</span>
                    <h2>{language === 'de' ? 'Shop Marketplace Başvurusu' :
                        language === 'en' ? 'Shop Marketplace Application' :
                            'Shop Marketplace Başvurusu'}</h2>
                    <p>
                        {language === 'de' ? 'Mit einem Shop-Account können Sie Ihre Produkte auf unserer Plattform verkaufen. Bewerben Sie sich jetzt!' :
                            language === 'en' ? 'With a shop account, you can sell your products on our platform. Apply now!' :
                                'Shop hesabı ile ürünlerinizi platformumuzda satabilirsiniz. Hemen başvurun!'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="/shop/basvuru" className="btn-primary" style={{
                            padding: '14px 28px',
                            background: 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(255, 107, 157, 0.4)'
                        }}>
                            🚀 {language === 'de' ? 'Jetzt Bewerben' : language === 'en' ? 'Apply Now' : 'Hemen Başvur'}
                        </a>
                        <a href={shopAccount ? `/shop/magaza/${shopAccount.slug}` : "/shop"}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '14px 28px',
                                background: shopAccount ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f3f4f6',
                                color: shopAccount ? 'white' : '#374151',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: '600'
                            }}>
                            {shopAccount ? '🏪' : '👀'} {shopAccount
                                ? (language === 'de' ? 'Meine Storefront' : language === 'en' ? 'My Storefront' : 'Mağazamı Gör')
                                : (language === 'de' ? 'Shop Ansehen' : language === 'en' ? 'View Shop' : 'Mağazayı Gör')}
                        </a>
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                        {language === 'de' ? '✓ 3 Pläne: Starter, Business, Premium  ✓ Unbegrenzte Produkte (Premium)  ✓ Eigene Storefront' :
                            language === 'en' ? '✓ 3 Plans: Starter, Business, Premium  ✓ Unlimited Products (Premium)  ✓ Own Storefront' :
                                '✓ 3 Plan: Starter, Business, Premium  ✓ Sınırsız Ürün (Premium)  ✓ Kendi Mağaza Sayfanız'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="vendor-shop">
            <div className="vendor-shop-header">
                <div>
                    <h1>🛍️ {labels.title[language]}</h1>
                    <p>{labels.subtitle[language]}</p>
                </div>
                <div className="header-actions">
                    {/* Product limit indicator */}
                    <div className="product-limit-badge">
                        <span className="limit-icon">📦</span>
                        <span>{getRemainingSlots()} / {vendorInfo?.shop_product_limit === -1 ? '∞' : vendorInfo?.shop_product_limit} {labels.remaining[language]}</span>
                    </div>
                    <button className="btn-help" onClick={() => setShowHelp(!showHelp)}>
                        ❓ {labels.help[language]}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => { resetForm(); setShowModal(true); }}
                        disabled={!canAddProduct()}
                    >
                        + {labels.addProduct[language]}
                    </button>
                </div>
            </div>

            {/* Help Section - 3 Language */}
            {showHelp && (
                <div className="help-section">
                    <h3>📖 {language === 'de' ? 'Hilfe & Anleitungen' : language === 'en' ? 'Help & Instructions' : 'Yardım & Rehber'}</h3>
                    <div className="help-items">
                        <div className="help-item">
                            <h4>{language === 'de' ? '📸 Wie füge ich ein Bild hinzu?' : language === 'en' ? '📸 How to add an image?' : '📸 Görsel nasıl eklenir?'}</h4>
                            <ol>
                                <li>{language === 'de' ? 'Gehen Sie zu imgur.com oder Google Drive' : language === 'en' ? 'Go to imgur.com or Google Drive' : 'imgur.com veya Google Drive\'a gidin'}</li>
                                <li>{language === 'de' ? 'Laden Sie Ihr Bild hoch' : language === 'en' ? 'Upload your image' : 'Görselinizi yükleyin'}</li>
                                <li>{language === 'de' ? 'Rechtsklick auf das Bild → "Bildadresse kopieren"' : language === 'en' ? 'Right-click on the image → "Copy image address"' : 'Resme sağ tık → "Resim adresini kopyala"'}</li>
                                <li>{language === 'de' ? 'Den Link im Feld "Bild-URL" einfügen' : language === 'en' ? 'Paste the link in the "Image URL" field' : 'Linki "Görsel URL" alanına yapıştırın'}</li>
                            </ol>
                        </div>
                        <div className="help-item">
                            <h4>{language === 'de' ? '📱 WhatsApp-Format' : language === 'en' ? '📱 WhatsApp Format' : '📱 WhatsApp Formatı'}</h4>
                            <p><strong>{language === 'de' ? 'Richtig' : language === 'en' ? 'Correct' : 'Doğru'}:</strong> +49 170 1234567</p>
                            <p><strong>{language === 'de' ? 'Falsch' : language === 'en' ? 'Wrong' : 'Yanlış'}:</strong> 0170 1234567</p>
                        </div>
                        <div className="help-item">
                            <h4>{language === 'de' ? '⏰ Genehmigungsprozess' : language === 'en' ? '⏰ Approval Process' : '⏰ Onay Süreci'}</h4>
                            <p>{language === 'de' ? 'Produkte werden innerhalb von 24-48 Stunden überprüft und genehmigt.' :
                                language === 'en' ? 'Products are reviewed and approved within 24-48 hours.' :
                                    'Ürünler 24-48 saat içinde incelenir ve onaylanır.'}</p>
                        </div>
                    </div>
                    <button className="btn-close-help" onClick={() => setShowHelp(false)}>
                        {language === 'de' ? 'Schließen' : language === 'en' ? 'Close' : 'Kapat'}
                    </button>
                </div>
            )}

            {/* Products List */}
            {products.length === 0 ? (
                <div className="empty-state">
                    <span>📦</span>
                    <h3>{labels.noProducts[language]}</h3>
                    <p>{language === 'de' ? 'Fügen Sie Produkte hinzu, um auf der Shop-Seite sichtbar zu werden!' :
                        language === 'en' ? 'Add products to be visible on the shop page!' :
                            'Ürünlerinizi ekleyerek shop sayfasında görünür olun!'}</p>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        {labels.addFirstProduct[language]}
                    </button>
                </div>
            ) : (
                <div className="products-list">
                    {products.map(product => {
                        const statusInfo = getStatusInfo(product.status);
                        return (
                            <div key={product.id} className={`product-item ${product.status}`}>
                                <div className="product-image">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt="" />
                                    ) : (
                                        <div className="no-image">📷</div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3>{product.title?.[language] || product.title?.tr}</h3>
                                    <p className="product-category">
                                        {product.category?.name?.[language] || product.category?.name?.tr || (language === 'de' ? 'Ohne Kategorie' : language === 'en' ? 'No category' : 'Kategorisiz')}
                                    </p>
                                    {product.price && !product.price_on_request ? (
                                        <p className="product-price">{product.price} {product.currency}</p>
                                    ) : (
                                        <p className="product-price price-request">
                                            {language === 'de' ? 'Preis auf Anfrage' : language === 'en' ? 'Price on request' : 'Fiyat için iletişime geçin'}
                                        </p>
                                    )}
                                    {/* Contact info indicators */}
                                    <div className="contact-indicators">
                                        {product.whatsapp_number && <span title="WhatsApp">💬</span>}
                                        {product.contact_phone && <span title="Phone">📞</span>}
                                        {product.contact_email && <span title="Email">📧</span>}
                                        {product.external_url && <span title="Website">🔗</span>}
                                    </div>
                                    <span
                                        className="status-badge"
                                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                                    >
                                        {statusInfo.label}
                                    </span>
                                    {product.status === 'rejected' && product.rejection_reason && (
                                        <p className="rejection-reason">
                                            ⚠️ {product.rejection_reason}
                                        </p>
                                    )}
                                </div>
                                <div className="product-actions">
                                    <button onClick={() => handleEdit(product)} title={language === 'de' ? 'Bearbeiten' : language === 'en' ? 'Edit' : 'Düzenle'}>✏️</button>
                                    <button onClick={() => handleDelete(product.id)} title={language === 'de' ? 'Löschen' : language === 'en' ? 'Delete' : 'Sil'} className="delete">🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? labels.editProduct[language] : labels.addProduct[language]}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Category */}
                            <div className="form-group">
                                <label>{language === 'de' ? 'Kategorie' : language === 'en' ? 'Category' : 'Kategori'}</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">{language === 'de' ? 'Kategorie auswählen' : language === 'en' ? 'Select Category' : 'Kategori Seç'}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name?.[language] || cat.name?.tr}</option>
                                    ))}
                                </select>
                                <small className="help-text">💡 {helpTexts.category[language]}</small>
                            </div>

                            {/* Title - Turkish Required */}
                            <div className="form-group">
                                <label>{language === 'de' ? 'Produktname (Türkisch)' : language === 'en' ? 'Product Name (Turkish)' : 'Ürün Adı (Türkçe)'} *</label>
                                <input
                                    type="text"
                                    value={formData.title.tr}
                                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, tr: e.target.value } })}
                                    required
                                    placeholder={language === 'de' ? 'Z.B.: Handgemachte Brautkrone' : language === 'en' ? 'E.g.: Handmade Bridal Tiara' : 'Örn: El Yapımı Gelin Tacı'}
                                />
                                <small className="help-text">💡 {helpTexts.title[language]}</small>
                            </div>

                            {/* Title - Other Languages */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{language === 'de' ? 'Produktname (Deutsch)' : language === 'en' ? 'Product Name (German)' : 'Ürün Adı (Almanca)'}</label>
                                    <input
                                        type="text"
                                        value={formData.title.de}
                                        onChange={(e) => setFormData({ ...formData, title: { ...formData.title, de: e.target.value } })}
                                        placeholder="Handgemachte Brautkrone"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === 'de' ? 'Produktname (Englisch)' : language === 'en' ? 'Product Name (English)' : 'Ürün Adı (İngilizce)'}</label>
                                    <input
                                        type="text"
                                        value={formData.title.en}
                                        onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                                        placeholder="Handmade Bridal Tiara"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>{language === 'de' ? 'Beschreibung (Türkisch)' : language === 'en' ? 'Description (Turkish)' : 'Açıklama (Türkçe)'}</label>
                                <textarea
                                    value={formData.description.tr}
                                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, tr: e.target.value } })}
                                    rows={3}
                                    placeholder={language === 'de' ? 'Beschreiben Sie Ihr Produkt detailliert...' : language === 'en' ? 'Describe your product in detail...' : 'Ürününüzü detaylı bir şekilde tanımlayın...'}
                                />
                            </div>

                            {/* Image URL */}
                            <div className="form-group">
                                <label>{language === 'de' ? 'Bild-URL' : language === 'en' ? 'Image URL' : 'Görsel URL'}</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                                <small className="help-text">💡 {helpTexts.imageUrl[language]}</small>
                            </div>

                            {/* Price Section */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{language === 'de' ? 'Preis' : language === 'en' ? 'Price' : 'Fiyat'}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="49.99"
                                        disabled={formData.price_on_request}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === 'de' ? 'Währung' : language === 'en' ? 'Currency' : 'Para Birimi'}</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="TRY">TRY (₺)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.price_on_request}
                                        onChange={(e) => setFormData({ ...formData, price_on_request: e.target.checked })}
                                    />
                                    {language === 'de' ? 'Preis auf Anfrage' : language === 'en' ? 'Price on request' : 'Fiyat için iletişime geçin'}
                                </label>
                                <small className="help-text">💡 {helpTexts.price[language]}</small>
                            </div>

                            {/* Contact Information Section */}
                            <div className="form-section-title">
                                <h4>📞 {language === 'de' ? 'Kontaktinformationen' : language === 'en' ? 'Contact Information' : 'İletişim Bilgileri'}</h4>
                                <small>{language === 'de' ? 'Kunden werden Sie über diese Kanäle kontaktieren' : language === 'en' ? 'Customers will contact you through these channels' : 'Müşteriler bu kanallardan sizinle iletişime geçecek'}</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>💬 WhatsApp</label>
                                    <input
                                        type="text"
                                        value={formData.whatsapp_number}
                                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                        placeholder="+49 170 1234567"
                                    />
                                    <small className="help-text">💡 {helpTexts.whatsapp[language]}</small>
                                </div>
                                <div className="form-group">
                                    <label>📞 {language === 'de' ? 'Telefon' : language === 'en' ? 'Phone' : 'Telefon'}</label>
                                    <input
                                        type="tel"
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                        placeholder="+49 170 1234567"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>📧 {language === 'de' ? 'E-Mail' : language === 'en' ? 'Email' : 'E-posta'}</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                        placeholder="info@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🔗 {language === 'de' ? 'Website / Shop-Link' : language === 'en' ? 'Website / Shop Link' : 'Website / Mağaza Linki'}</label>
                                    <input
                                        type="url"
                                        value={formData.external_url}
                                        onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                                        placeholder="https://www.example.com"
                                    />
                                    <small className="help-text">💡 {helpTexts.externalUrl[language]}</small>
                                </div>
                            </div>

                            <div className="info-box">
                                ℹ️ {language === 'de' ? 'Ihr Produkt wird nach Admin-Genehmigung auf der Shop-Seite veröffentlicht. Der Genehmigungsprozess dauert in der Regel 24-48 Stunden.' :
                                    language === 'en' ? 'Your product will be published on the shop page after admin approval. The approval process usually takes 24-48 hours.' :
                                        'Ürününüz admin onayından sonra shop sayfasında yayınlanacaktır. Onay süreci genellikle 24-48 saat içinde tamamlanır.'}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    {labels.cancel[language]}
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingProduct ? labels.update[language] : labels.save[language]}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorShop;
