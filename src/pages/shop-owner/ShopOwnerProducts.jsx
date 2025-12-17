import React, { useState, useEffect } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerProducts = () => {
    const { shopAccount, products, stats, canAddProduct, getRemainingProducts, refreshData } = useShopOwner();
    const { language } = useLanguage();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [customCategories, setCustomCategories] = useState([]);
    const [mainShopCategories, setMainShopCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'grid' veya 'list'
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Inline silme onayı
    const [deletingProductId, setDeletingProductId] = useState(null); // Tek ürün silme için
    const [affiliateModal, setAffiliateModal] = useState({ isOpen: false, product: null }); // Affiliate modal
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState('');

    const [formData, setFormData] = useState({
        name_tr: '',
        name_de: '',
        name_en: '',
        description_tr: '',
        description_de: '',
        description_en: '',
        category_id: '',
        custom_category_id: '',
        price: '',
        currency: 'EUR',
        price_on_request: false,
        images: [],
        whatsapp_number: '',
        contact_email: '',
        contact_phone: '',
        external_url: '',
        // Ana Shop Başvurusu
        request_main_shop: false,
        main_shop_category_id: ''
    });

    const texts = {
        tr: {
            title: 'Ürünlerim',
            subtitle: 'Ürünlerinizi yönetin',
            addProduct: '+ Yeni Ürün Ekle',
            editProduct: 'Ürün Düzenle',
            noProducts: 'Henüz ürün eklenmemiş',
            remaining: 'Kalan Hak',
            limitReached: 'Ürün limitinize ulaştınız',
            upgradePlan: 'Plan Yükselt',
            name: 'Ürün Adı',
            description: 'Açıklama',
            category: 'Kategori',
            price: 'Fiyat',
            priceOnRequest: 'Fiyat istek üzerine',
            images: 'Görseller (URL)',
            imagesHelp: 'Her satıra bir URL (imgur, imgbb vb.)',
            whatsapp: 'WhatsApp',
            email: 'E-posta',
            phone: 'Telefon',
            externalUrl: 'Harici Link',
            save: 'Kaydet',
            saving: 'Kaydediliyor...',
            cancel: 'İptal',
            delete: 'Sil',
            confirmDelete: 'Bu ürünü silmek istediğinize emin misiniz?',
            turkish: 'Türkçe',
            german: 'Almanca',
            english: 'İngilizce',
            all: 'Tümü',
            approved: 'Onaylı',
            pending: 'Bekliyor',
            rejected: 'Reddedildi',
            status: 'Durum',
            rejectionReason: 'Red Sebebi',
            customCategory: 'Mağaza Kategorisi',
            mainShopSection: 'Ana Shop Başvurusu',
            requestMainShop: 'KolayDugun Shop\'ta da yayınla',
            mainShopCategory: 'Ana Shop Kategorisi',
            mainShopPending: 'Onay Bekliyor',
            mainShopApproved: 'Onaylandı',
            mainShopRejected: 'Reddedildi',
            mainShopNote: 'Admin onayından sonra ana shop\'ta görünür'
        },
        de: {
            title: 'Meine Produkte',
            subtitle: 'Verwalten Sie Ihre Produkte',
            addProduct: '+ Neues Produkt',
            editProduct: 'Produkt bearbeiten',
            noProducts: 'Noch keine Produkte',
            remaining: 'Verbleibend',
            limitReached: 'Produktlimit erreicht',
            upgradePlan: 'Plan upgraden',
            name: 'Produktname',
            description: 'Beschreibung',
            category: 'Kategorie',
            price: 'Preis',
            priceOnRequest: 'Preis auf Anfrage',
            images: 'Bilder (URL)',
            imagesHelp: 'Eine URL pro Zeile',
            whatsapp: 'WhatsApp',
            email: 'E-Mail',
            phone: 'Telefon',
            externalUrl: 'Externer Link',
            save: 'Speichern',
            saving: 'Speichern...',
            cancel: 'Abbrechen',
            delete: 'Löschen',
            confirmDelete: 'Möchten Sie dieses Produkt wirklich löschen?',
            turkish: 'Türkisch',
            german: 'Deutsch',
            english: 'Englisch',
            all: 'Alle',
            approved: 'Genehmigt',
            pending: 'Ausstehend',
            rejected: 'Abgelehnt',
            status: 'Status',
            rejectionReason: 'Ablehnungsgrund',
            customCategory: 'Shop-Kategorie',
            mainShopSection: 'Hauptshop-Antrag',
            requestMainShop: 'Auch im KolayDugun Shop veröffentlichen',
            mainShopCategory: 'Hauptshop-Kategorie',
            mainShopPending: 'Ausstehend',
            mainShopApproved: 'Genehmigt',
            mainShopRejected: 'Abgelehnt',
            mainShopNote: 'Wird nach Admin-Genehmigung im Hauptshop angezeigt'
        },
        en: {
            title: 'My Products',
            subtitle: 'Manage your products',
            addProduct: '+ Add Product',
            editProduct: 'Edit Product',
            noProducts: 'No products yet',
            remaining: 'Remaining',
            limitReached: 'Product limit reached',
            upgradePlan: 'Upgrade Plan',
            name: 'Product Name',
            description: 'Description',
            category: 'Category',
            price: 'Price',
            priceOnRequest: 'Price on request',
            images: 'Images (URL)',
            imagesHelp: 'One URL per line',
            whatsapp: 'WhatsApp',
            email: 'Email',
            phone: 'Phone',
            externalUrl: 'External Link',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            delete: 'Delete',
            confirmDelete: 'Are you sure you want to delete this product?',
            turkish: 'Turkish',
            german: 'German',
            english: 'English',
            all: 'All',
            approved: 'Approved',
            pending: 'Pending',
            rejected: 'Rejected',
            status: 'Status',
            rejectionReason: 'Rejection Reason',
            customCategory: 'Shop Category',
            mainShopSection: 'Main Shop Request',
            requestMainShop: 'Also publish on KolayDugun Shop',
            mainShopCategory: 'Main Shop Category',
            mainShopPending: 'Pending',
            mainShopApproved: 'Approved',
            mainShopRejected: 'Rejected',
            mainShopNote: 'Will be visible in main shop after admin approval'
        }
    };

    const txt = texts[language] || texts.tr;

    useEffect(() => {
        fetchCategories();
        if (shopAccount?.id) {
            fetchCampaigns();
        }
    }, [shopAccount]);

    const fetchCampaigns = async () => {
        // Fetch campaigns for dropdown
        const { data } = await supabase
            .from('shop_affiliate_campaigns')
            .select('*')
            .eq('shop_id', shopAccount.id)
            .order('created_at', { ascending: false });
        setCampaigns(data || []);
    };

    const fetchCategories = async () => {
        // Ana shop kategorileri (senin kategorilerin)
        const { data: mainCats } = await supabase
            .from('shop_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        setCategories(mainCats || []);
        setMainShopCategories(mainCats || []);

        // Tedarikçinin özel kategorileri
        if (shopAccount?.id) {
            const { data: customCats } = await supabase
                .from('shop_custom_categories')
                .select('*')
                .eq('shop_id', shopAccount.id)
                .eq('is_active', true)
                .order('sort_order');
            setCustomCategories(customCats || []);
        }
    };

    const resetForm = () => {
        setFormData({
            name_tr: '',
            name_de: '',
            name_en: '',
            description_tr: '',
            description_de: '',
            description_en: '',
            category_id: '',
            custom_category_id: '',
            price: '',
            currency: 'EUR',
            price_on_request: false,
            images: [],
            whatsapp_number: shopAccount?.contact_whatsapp || '',
            contact_email: shopAccount?.contact_email || '',
            contact_phone: shopAccount?.contact_phone || '',
            external_url: '',
            request_main_shop: false,
            main_shop_category_id: ''
        });
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name_tr: product.name_tr || '',
            name_de: product.name_de || '',
            name_en: product.name_en || '',
            description_tr: product.description_tr || '',
            description_de: product.description_de || '',
            description_en: product.description_en || '',
            category_id: product.category_id || '',
            custom_category_id: product.custom_category_id || '',
            price: product.price || '',
            currency: product.currency || 'EUR',
            price_on_request: product.price_on_request || false,
            images: product.images || [],
            whatsapp_number: product.whatsapp_number || '',
            contact_email: product.contact_email || '',
            contact_phone: product.contact_phone || '',
            external_url: product.external_url || '',
            request_main_shop: product.main_shop_request_status === 'pending' || product.main_shop_request_status === 'approved',
            main_shop_category_id: product.main_shop_category_id || ''
        });
        setShowModal(true);
    };

    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name_tr.trim()) {
            alert('Ürün adı gerekli');
            return;
        }

        setSaving(true);
        try {
            // Temel payload - düzenlemede status değişmez
            // Slug oluşturma (yeni ürün veya adı değişmişse)
            let slug = editingProduct?.slug;
            if (!slug || (formData.name_tr !== editingProduct?.name_tr)) {
                slug = slugify(formData.name_tr) + '-' + Math.random().toString(36).substring(2, 7);
            }

            const payload = {
                shop_account_id: shopAccount.id,
                name_tr: formData.name_tr,
                slug: slug, // Slug ekle
                name_de: formData.name_de || null,
                name_en: formData.name_en || null,
                description_tr: formData.description_tr || null,
                description_de: formData.description_de || null,
                description_en: formData.description_en || null,
                category_id: formData.category_id || null,
                custom_category_id: formData.custom_category_id || null,
                price: formData.price ? parseFloat(formData.price) : null,
                currency: formData.currency,
                price_on_request: formData.price_on_request,
                images: formData.images.filter(url => url.trim()), // Filter empty strings
                whatsapp_number: formData.whatsapp_number || null,
                contact_email: formData.contact_email || null,
                contact_phone: formData.contact_phone || null,
                external_url: formData.external_url || null,
                // Ana Shop Başvurusu
                main_shop_category_id: formData.request_main_shop ? (formData.main_shop_category_id || null) : null,
                main_shop_request_status: formData.request_main_shop ? 'pending' : (editingProduct?.main_shop_request_status || 'none'),
                main_shop_requested_at: formData.request_main_shop ? new Date().toISOString() : null
            };

            if (editingProduct) {
                // Düzenlemede mevcut status korunur
                const { error } = await supabase
                    .from('shop_products')
                    .update(payload)
                    .eq('id', editingProduct.id);
                if (error) throw error;
                alert('✅ Ürün güncellendi!');
            } else {
                // Yeni ürün direkt onaylı - tedarikçi kendi mağazası için admin onayına ihtiyaç duymaz
                payload.status = 'approved';
                const { error } = await supabase
                    .from('shop_products')
                    .insert([payload]);
                if (error) throw error;
                alert('✅ Ürün eklendi ve yayınlandı!');
            }

            setShowModal(false);
            resetForm();
            refreshData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };
    // Silme işlemi devam ediyor mu kontrolü
    const [isDeleting, setIsDeleting] = useState(false);

    // Tek ürün silmeyi başlat (inline onay göster)
    const startDeleteProduct = (productId) => {
        console.log('🗑️ startDeleteProduct çağrıldı, productId:', productId);
        setDeletingProductId(productId);
    };

    // Tek ürün silmeyi onayla
    const confirmDeleteProduct = async () => {
        if (!deletingProductId || isDeleting) return;

        console.log('✅ confirmDeleteProduct çağrıldı, productId:', deletingProductId);
        setIsDeleting(true);

        try {
            const { error } = await supabase
                .from('shop_products')
                .delete()
                .eq('id', deletingProductId);

            if (error) throw error;

            console.log('✅ Ürün silindi');
            setDeletingProductId(null);
            refreshData();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('❌ Silme hatası: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Tek ürün silmeyi iptal et
    const cancelDeleteProduct = () => {
        setDeletingProductId(null);
    };

    // Toplu silmeyi başlat (inline onay göster)
    const startBulkDelete = () => {
        if (selectedProducts.length === 0) {
            alert('Lütfen silmek istediğiniz ürünleri seçin.');
            return;
        }
        console.log('🗑️ startBulkDelete çağrıldı, count:', selectedProducts.length);
        setShowDeleteConfirm(true);
    };

    // Toplu silmeyi onayla
    const confirmBulkDelete = async () => {
        if (isDeleting) return;

        console.log('✅ confirmBulkDelete çağrıldı, selectedProducts:', selectedProducts);
        setIsDeleting(true);

        try {
            const { error } = await supabase
                .from('shop_products')
                .delete()
                .in('id', selectedProducts);

            if (error) throw error;

            console.log('✅ Toplu silme başarılı');
            setSelectedProducts([]);
            setShowDeleteConfirm(false);
            refreshData();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            alert('❌ Toplu silme hatası: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Toplu silmeyi iptal et
    const cancelBulkDelete = () => {
        setShowDeleteConfirm(false);
    };



    // Ürün seçimi toggle
    const toggleSelectProduct = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Tümünü seç/kaldır
    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    // Affiliate Functions
    const openAffiliateModal = (product) => {
        setSelectedCampaign(''); // Reset selection
        setAffiliateModal({ isOpen: true, product });
    };

    const closeAffiliateModal = () => {
        setAffiliateModal({ isOpen: false, product: null });
    };

    const getAffiliateLink = (product) => {
        if (!shopAccount?.affiliate_code || !product?.slug) return '';
        let url = `${window.location.origin}/shop/urun/${product.slug}?ref=${shopAccount.affiliate_code}`;
        if (selectedCampaign) {
            url += `&c=${selectedCampaign}`; // Use selected campaign slug
        }
        return url;
    };

    const shareOnWhatsApp = () => {
        const link = getAffiliateLink(affiliateModal.product);
        const productName = affiliateModal.product?.[`name_${language}`] || affiliateModal.product?.name_tr;
        const price = affiliateModal.product?.price && !affiliateModal.product?.price_on_request
            ? `${affiliateModal.product.price} ${affiliateModal.product.currency}`
            : 'Fiyat Sor';
        const text = `${productName} - ${price}\n${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareOnFacebook = () => {
        const link = getAffiliateLink(affiliateModal.product);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
    };

    const copyAffiliateLink = async () => {
        const link = getAffiliateLink(affiliateModal.product);
        try {
            await navigator.clipboard.writeText(link);
            alert(language === 'de' ? 'Link kopiert!' : language === 'en' ? 'Link copied!' : 'Link kopyalandı!');
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };


    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#d97706', text: `⏳ ${txt.pending}` },
            approved: { bg: '#dcfce7', color: '#16a34a', text: `✅ ${txt.approved}` },
            rejected: { bg: '#fee2e2', color: '#dc2626', text: `❌ ${txt.rejected}` }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                background: s.bg,
                color: s.color,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
            }}>
                {s.text}
            </span>
        );
    };

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.status === filter);

    return (
        <div className="shop-owner-products">
            <div className="shop-page-header">
                <div className="header-content">
                    <h1>📦 {txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
                <div className="header-actions">
                    <span className="remaining-badge">
                        {txt.remaining}: <strong>{getRemainingProducts()}</strong>
                    </span>
                    {canAddProduct() ? (
                        <button
                            className="btn-primary"
                            onClick={() => { resetForm(); setShowModal(true); }}
                        >
                            {txt.addProduct}
                        </button>
                    ) : (
                        <div className="limit-reached">
                            <span>⚠️ {txt.limitReached}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {txt.all} ({stats.totalProducts})
                </button>
                <button
                    className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    ✅ {txt.approved} ({stats.approvedProducts})
                </button>
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    ⏳ {txt.pending} ({stats.pendingProducts})
                </button>
                <button
                    className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('rejected')}
                >
                    ❌ {txt.rejected} ({stats.rejectedProducts})
                </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <span className="icon">📦</span>
                    <p>{txt.noProducts}</p>
                    {canAddProduct() && (
                        <button
                            className="btn-primary"
                            onClick={() => { resetForm(); setShowModal(true); }}
                        >
                            {txt.addProduct}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Selection & View Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        padding: '10px 16px',
                        background: selectedProducts.length > 0 ? '#fef3c7' : '#f9fafb',
                        borderRadius: '10px',
                        border: selectedProducts.length > 0 ? '1px solid #f59e0b' : '1px solid #e5e7eb',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                onChange={toggleSelectAll}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: '500' }}>
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} ürün seçildi`
                                    : 'Tümünü seç'}
                            </span>
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Bulk Delete Button with Inline Confirmation */}
                            {selectedProducts.length > 0 && !showDeleteConfirm && (
                                <button
                                    type="button"
                                    onClick={() => startBulkDelete()}
                                    style={{
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    🗑️ Sil ({selectedProducts.length})
                                </button>
                            )}

                            {/* Inline Confirmation Buttons */}
                            {showDeleteConfirm && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#dc2626' }}>
                                        {selectedProducts.length} ürünü sil?
                                    </span>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => confirmBulkDelete()}
                                        style={{
                                            background: '#16a34a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {isDeleting ? '⏳...' : '✓ Onayla'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => cancelBulkDelete()}
                                        style={{
                                            background: '#6b7280',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ✗ İptal
                                    </button>
                                </div>
                            )}

                            {/* View Toggle */}
                            <div style={{
                                display: 'flex',
                                background: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden'
                            }}>
                                <button
                                    onClick={() => setViewMode('list')}
                                    style={{
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: viewMode === 'list' ? '#FF6B9D' : 'transparent',
                                        color: viewMode === 'list' ? 'white' : '#6b7280',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    title="Liste Görünümü"
                                >
                                    ☰
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    style={{
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: viewMode === 'grid' ? '#FF6B9D' : 'transparent',
                                        color: viewMode === 'grid' ? 'white' : '#6b7280',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    title="Kart Görünümü"
                                >
                                    ▦
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LIST VIEW */}
                    {viewMode === 'list' && (
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb'
                        }}>
                            {/* Table Header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 60px 1fr 120px 100px 80px 160px',
                                gap: '10px',
                                padding: '12px 16px',
                                background: '#f9fafb',
                                borderBottom: '1px solid #e5e7eb',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                color: '#6b7280'
                            }}>
                                <span></span>
                                <span>Görsel</span>
                                <span>Ürün Adı</span>
                                <span>Fiyat</span>
                                <span>Durum</span>
                                <span>Görüntüleme</span>
                                <span>İşlemler</span>
                            </div>

                            {/* Table Rows */}
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '40px 60px 1fr 120px 100px 80px 160px',
                                        gap: '10px',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        alignItems: 'center',
                                        background: selectedProducts.includes(product.id) ? '#fef3c7' : 'white',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => toggleSelectProduct(product.id)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />

                                    {/* Image */}
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: '#f3f4f6'
                                    }}>
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>📷</span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                                            {product[`name_${language}`] || product.name_tr}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                            {product.category?.[`name_${language}`] || product.category?.name_tr || '-'}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div style={{ fontWeight: '600', color: '#FF6B9D' }}>
                                        {product.price && !product.price_on_request
                                            ? `${product.price} ${product.currency}`
                                            : product.price_on_request ? 'Fiyat Sor' : '-'
                                        }
                                    </div>

                                    {/* Status */}
                                    {getStatusBadge(product.status)}

                                    {/* Views */}
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        👁️ {product.view_count || 0}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openAffiliateModal(product);
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#f3f4f6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                                            onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
                                            title={language === 'en' ? 'Promote' : language === 'de' ? 'Promoten' : 'Link Oluştur'}
                                        >
                                            📤
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleEdit(product);
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                background: '#f0f9ff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                            title="Düzenle"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openAffiliateModal(product);
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                            title="Affiliate Link"
                                        >
                                            📤
                                        </button>

                                        {/* Tek ürün silme - inline confirmation */}
                                        {deletingProductId === product.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={isDeleting}
                                                    onClick={() => confirmDeleteProduct()}
                                                    style={{
                                                        padding: '6px 10px',
                                                        background: '#16a34a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                    title="Silmeyi Onayla"
                                                >
                                                    {isDeleting ? '⏳' : '✓'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => cancelDeleteProduct()}
                                                    style={{
                                                        padding: '6px 10px',
                                                        background: '#6b7280',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                    title="İptal"
                                                >
                                                    ✗
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => startDeleteProduct(product.id)}
                                                style={{
                                                    padding: '6px 10px',
                                                    background: '#fef2f2',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                                title="Sil"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* GRID VIEW */}
                    {viewMode === 'grid' && (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className={`product-card ${product.status} ${selectedProducts.includes(product.id) ? 'selected' : ''}`}>
                                    {/* Selection Checkbox */}
                                    <div
                                        onClick={() => toggleSelectProduct(product.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            zIndex: 10,
                                            background: 'white',
                                            borderRadius: '6px',
                                            padding: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => { }}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </div>
                                    <div className="product-image">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" />
                                        ) : (
                                            <span className="no-image">📷</span>
                                        )}
                                        {getStatusBadge(product.status)}
                                    </div>
                                    <div className="product-content">
                                        <h4>{product[`name_${language}`] || product.name_tr}</h4>
                                        <p className="category">
                                            {product.category?.[`name_${language}`] || product.category?.name_tr || '-'}
                                        </p>
                                        {product.price && !product.price_on_request && (
                                            <p className="price">{product.price} {product.currency}</p>
                                        )}
                                        <div className="stats">
                                            <span>👁️ {product.view_count || 0}</span>
                                            <span>🖱️ {product.click_count || 0}</span>
                                        </div>
                                        {product.status === 'rejected' && product.rejection_reason && (
                                            <div className="rejection-reason">
                                                ❌ {product.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-actions">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleEdit(product);
                                            }}
                                            className="btn-edit"
                                        >
                                            ✏️ Düzenle
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openAffiliateModal(product);
                                            }}
                                            className="btn-edit"
                                            style={{ background: '#10b981', color: 'white' }}
                                            title="Affiliate Link"
                                        >
                                            📤
                                        </button>
                                        {/* Tek ürün silme - inline confirmation */}
                                        {deletingProductId === product.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={isDeleting}
                                                    onClick={() => confirmDeleteProduct()}
                                                    className="btn-edit"
                                                    style={{ background: '#16a34a', color: 'white' }}
                                                >
                                                    {isDeleting ? '⏳' : '✓ Onayla'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => cancelDeleteProduct()}
                                                    className="btn-delete"
                                                    style={{ background: '#6b7280', color: 'white' }}
                                                >
                                                    ✗ İptal
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn-delete"
                                                onClick={() => startDeleteProduct(product.id)}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? txt.editProduct : txt.addProduct}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Names */}
                            <div className="form-section">
                                <h4>📝 {txt.name}</h4>
                                <div className="form-group">
                                    <label>🇹🇷 {txt.turkish} *</label>
                                    <input
                                        type="text"
                                        value={formData.name_tr}
                                        onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>🇩🇪 {txt.german}</label>
                                        <input
                                            type="text"
                                            value={formData.name_de}
                                            onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>🇬🇧 {txt.english}</label>
                                        <input
                                            type="text"
                                            value={formData.name_en}
                                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-section">
                                <h4>📄 {txt.description}</h4>
                                <div className="form-group">
                                    <label>🇹🇷 {txt.turkish}</label>
                                    <textarea
                                        value={formData.description_tr}
                                        onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Custom Category (My Shop) */}
                            {customCategories.length > 0 && (
                                <div className="form-section">
                                    <h4>🏷️ {txt.customCategory}</h4>
                                    <div className="form-group">
                                        <select
                                            value={formData.custom_category_id}
                                            onChange={(e) => setFormData({ ...formData, custom_category_id: e.target.value })}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {customCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat[`name_${language}`] || cat.name_tr}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Main Shop Request */}
                            <div className="form-section main-shop-section">
                                <h4>🏪 {txt.mainShopSection}</h4>
                                <div className="main-shop-box" style={{
                                    background: formData.request_main_shop
                                        ? 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)'
                                        : '#f9fafb',
                                    border: formData.request_main_shop
                                        ? '2px solid #FF6B9D'
                                        : '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '1rem'
                                }}>
                                    <label className="checkbox-label" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        marginBottom: formData.request_main_shop ? '1rem' : 0
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.request_main_shop}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                request_main_shop: e.target.checked,
                                                main_shop_category_id: e.target.checked ? formData.main_shop_category_id : ''
                                            })}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span style={{ fontWeight: '500' }}>{txt.requestMainShop}</span>
                                    </label>

                                    {formData.request_main_shop && (
                                        <>
                                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                                <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                    {txt.mainShopCategory} *
                                                </label>
                                                <select
                                                    value={formData.main_shop_category_id}
                                                    onChange={(e) => setFormData({ ...formData, main_shop_category_id: e.target.value })}
                                                    required={formData.request_main_shop}
                                                    style={{ marginTop: '0.5rem' }}
                                                >
                                                    <option value="">Kategori seçin...</option>
                                                    {mainShopCategories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.icon} {cat[`name_${language}`] || cat.name_tr}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: '#9ca3af',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                ℹ️ {txt.mainShopNote}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Category & Price */}
                            <div className="form-section">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{txt.category}</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat[`name_${language}`] || cat.name_tr}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{txt.price}</label>
                                        <div className="price-input">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                disabled={formData.price_on_request}
                                            />
                                            <span>€</span>
                                        </div>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.price_on_request}
                                                onChange={(e) => setFormData({ ...formData, price_on_request: e.target.checked })}
                                            />
                                            {txt.priceOnRequest}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="form-section">
                                <h4>🖼️ {txt.images}</h4>
                                <div className="images-help-box" style={{
                                    background: '#fef3c7',
                                    border: '1px solid #fde68a',
                                    borderRadius: '10px',
                                    padding: '12px 16px',
                                    marginBottom: '1rem',
                                    fontSize: '0.85rem',
                                    color: '#92400e'
                                }}>
                                    {/* TÜRKÇE */}
                                    {language === 'tr' && (
                                        <>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                ⚠️ <strong>ÖNEMLİ: Doğru link formatı!</strong>
                                            </p>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                <strong>Seçenek 1: Imgur (Ücretsiz)</strong>
                                            </p>
                                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>
                                                    <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer"
                                                        style={{ color: '#b45309', fontWeight: '600' }}>
                                                        imgur.com/upload
                                                    </a> sitesine gidin ve resminizi yükleyin
                                                </li>
                                                <li><strong style={{ color: '#dc2626' }}>Copy butonunu KULLANMAYIN!</strong></li>
                                                <li>Yüklenen <strong>resmin üzerine sağ tıklayın</strong></li>
                                                <li>"Resim adresini kopyala" seçin</li>
                                                <li>Link şu formatta olmalı: <code style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>https://i.imgur.com/XXXXX.jpg</code></li>
                                            </ol>
                                            <p style={{ margin: '12px 0 8px 0' }}>
                                                <strong>Seçenek 2: Google Drive (Kendi Kontrolünüzde)</strong>
                                            </p>
                                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>Resmi Google Drive'a yükleyin</li>
                                                <li>Resme sağ tıklayın → "Paylaş" → "Bağlantısı olan herkes görüntüleyebilir" seçin</li>
                                                <li>Linki kopyalayın (örn: drive.google.com/file/d/XXXXX/view)</li>
                                                <li>Link'teki <code>XXXXX</code> kısmını alın</li>
                                                <li>Şu formata çevirin: <code style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>https://drive.google.com/uc?export=view&id=XXXXX</code></li>
                                            </ol>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#b45309' }}>
                                                ❌ Yanlış: imgur.com/a/XXXXX | ✅ Doğru: i.imgur.com/XXXXX.jpg
                                            </p>
                                        </>
                                    )}

                                    {/* ALMANCA */}
                                    {language === 'de' && (
                                        <>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                ⚠️ <strong>WICHTIG: Richtiges Link-Format!</strong>
                                            </p>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                <strong>Option 1: Imgur (Kostenlos)</strong>
                                            </p>
                                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>
                                                    <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer"
                                                        style={{ color: '#b45309', fontWeight: '600' }}>
                                                        imgur.com/upload
                                                    </a> öffnen und Bild hochladen
                                                </li>
                                                <li><strong style={{ color: '#dc2626' }}>Copy-Button NICHT benutzen!</strong></li>
                                                <li><strong>Rechtsklick auf das hochgeladene Bild</strong></li>
                                                <li>"Bildadresse kopieren" wählen</li>
                                                <li>Link sollte so aussehen: <code style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>https://i.imgur.com/XXXXX.jpg</code></li>
                                            </ol>
                                            <p style={{ margin: '12px 0 8px 0' }}>
                                                <strong>Option 2: Google Drive (Eigene Kontrolle)</strong>
                                            </p>
                                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>Bild in Google Drive hochladen</li>
                                                <li>Rechtsklick → "Freigeben" → "Jeder mit dem Link kann ansehen"</li>
                                                <li>Link kopieren (z.B. drive.google.com/file/d/XXXXX/view)</li>
                                                <li>Die <code>XXXXX</code> ID aus dem Link nehmen</li>
                                                <li>In dieses Format umwandeln: <code style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>https://drive.google.com/uc?export=view&id=XXXXX</code></li>
                                            </ol>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#b45309' }}>
                                                ❌ Falsch: imgur.com/a/XXXXX | ✅ Richtig: i.imgur.com/XXXXX.jpg
                                            </p>
                                        </>
                                    )}

                                    {/* İNGİLİZCE */}
                                    {language === 'en' && (
                                        <>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                ⚠️ <strong>IMPORTANT: Correct link format!</strong>
                                            </p>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                <strong>Option 1: Imgur (Free)</strong>
                                            </p>
                                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>
                                                    <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer"
                                                        style={{ color: '#b45309', fontWeight: '600' }}>
                                                        imgur.com/upload
                                                    </a> - go and upload your image
                                                </li>
                                                <li><strong style={{ color: '#dc2626' }}>Do NOT use the Copy button!</strong></li>
                                                <li><strong>Right-click on the uploaded image</strong></li>
                                                <li>Select "Copy image address"</li>
                                                <li>Link should look like: <code style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>https://i.imgur.com/XXXXX.jpg</code></li>
                                            </ol>
                                            <p style={{ margin: '12px 0 8px 0' }}>
                                                <strong>Option 2: Google Drive (Your Control)</strong>
                                            </p>
                                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>Upload image to Google Drive</li>
                                                <li>Right-click → "Share" → "Anyone with the link can view"</li>
                                                <li>Copy link (e.g. drive.google.com/file/d/XXXXX/view)</li>
                                                <li>Take the <code>XXXXX</code> ID from the link</li>
                                                <li>Convert to this format: <code style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>https://drive.google.com/uc?export=view&id=XXXXX</code></li>
                                            </ol>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#b45309' }}>
                                                ❌ Wrong: imgur.com/a/XXXXX | ✅ Correct: i.imgur.com/XXXXX.jpg
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Image list */}
                                <div className="image-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="image-item" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            background: '#f9fafb',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <span style={{
                                                minWidth: '30px',
                                                height: '30px',
                                                background: 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)',
                                                color: 'white',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {index + 1}
                                            </span>
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => {
                                                    const newImages = [...formData.images];
                                                    newImages[index] = e.target.value;
                                                    setFormData({ ...formData, images: newImages });
                                                }}
                                                placeholder="https://i.imgur.com/..."
                                                style={{ flex: 1 }}
                                            />
                                            {url && url.trim() && (
                                                <img
                                                    src={url.trim()}
                                                    alt="önizleme"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e5e7eb',
                                                        background: '#f3f4f6'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = formData.images.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, images: newImages });
                                                }}
                                                style={{
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500'
                                                }}
                                                title="Resmi Sil"
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Image Button */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                                    style={{
                                        marginTop: '12px',
                                        padding: '12px 20px',
                                        background: 'white',
                                        border: '2px dashed #d1d5db',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: '#6b7280',
                                        width: '100%',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.borderColor = '#FF6B9D';
                                        e.target.style.color = '#FF6B9D';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.borderColor = '#d1d5db';
                                        e.target.style.color = '#6b7280';
                                    }}
                                >
                                    ➕ Resim Ekle
                                </button>

                                {formData.images.length === 0 && (
                                    <p style={{
                                        marginTop: '10px',
                                        fontSize: '0.85rem',
                                        color: '#9ca3af',
                                        textAlign: 'center'
                                    }}>
                                        Henüz resim eklenmedi. Yukarıdaki butona tıklayarak resim ekleyebilirsiniz.
                                    </p>
                                )}
                            </div>

                            {/* Contact */}
                            <div className="form-section">
                                <h4>📞 İletişim</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{txt.whatsapp}</label>
                                        <input
                                            type="text"
                                            value={formData.whatsapp_number}
                                            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
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
                                        <label>{txt.externalUrl}</label>
                                        <input
                                            type="url"
                                            value={formData.external_url}
                                            onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    {txt.cancel}
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? txt.saving : txt.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .shop-owner-products .shop-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .remaining-badge {
                    background: #f3f4f6;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    color: #6b7280;
                }

                .remaining-badge strong {
                    color: #FF6B9D;
                }

                .btn-primary {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
                }

                .limit-reached {
                    color: #ef4444;
                    font-weight: 500;
                }

                .filters-bar {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .filter-btn:hover {
                    border-color: #FF6B9D;
                }

                .filter-btn.active {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border-color: transparent;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .empty-state .icon {
                    font-size: 4rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .product-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f0f0f0;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .product-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }

                .product-card.rejected {
                    opacity: 0.7;
                }

                .product-image {
                    height: 180px;
                    background: #f3f4f6;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-image .no-image {
                    font-size: 3rem;
                    opacity: 0.3;
                }

                .product-image span:not(.no-image) {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                }

                .product-content {
                    padding: 1rem;
                }

                .product-content h4 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1rem;
                    color: #111827;
                }

                .product-content .category {
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin: 0 0 0.5rem 0;
                }

                .product-content .price {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #FF6B9D;
                    margin: 0 0 0.5rem 0;
                }

                .product-content .stats {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.8rem;
                    color: #9ca3af;
                }

                .rejection-reason {
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: #fee2e2;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: #dc2626;
                }

                .product-actions {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border-top: 1px solid #f0f0f0;
                }

                .btn-edit {
                    flex: 1;
                    padding: 8px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: background 0.2s;
                }

                .btn-edit:hover {
                    background: #e5e7eb;
                }

                .btn-delete {
                    padding: 8px 12px;
                    background: #fee2e2;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .btn-delete:hover {
                    background: #fecaca;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b7280;
                }

                .modal-content form {
                    padding: 1.5rem;
                }

                .form-section {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .form-section h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    color: #374151;
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
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #FF6B9D;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .price-input {
                    display: flex;
                    align-items: center;
                }

                .price-input input {
                    border-radius: 10px 0 0 10px;
                }

                .price-input span {
                    padding: 10px 14px;
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-left: none;
                    border-radius: 0 10px 10px 0;
                }

                .checkbox-label {
                    display: flex !important;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    font-weight: normal !important;
                }

                .checkbox-label input {
                    width: auto !important;
                }

                .image-preview {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin-top: 0.5rem;
                }

                .image-preview img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
                }

                .btn-secondary {
                    padding: 12px 24px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 640px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .products-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Affiliate Modal */}
            {affiliateModal.isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }}
                    onClick={closeAffiliateModal}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '500px',
                            width: '100%',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                                📤 Affiliate Link
                            </h3>
                            <button
                                onClick={closeAffiliateModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                                    {language === 'en' ? 'Select Campaign (Optional)' : language === 'de' ? 'Kampagne auswählen (Optional)' : 'Kampanya Seç (Opsiyonel)'}
                                </label>
                                <select
                                    value={selectedCampaign}
                                    onChange={(e) => setSelectedCampaign(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb' }}
                                >
                                    <option value="">{language === 'en' ? 'General (No Campaign)' : language === 'de' ? 'Allgemein (Keine Kampagne)' : 'Genel (Kampanyasız)'}</option>
                                    {campaigns.map(c => (
                                        <option key={c.id} value={c.slug}>{c.label} ({c.slug})</option>
                                    ))}
                                </select>
                            </div>

                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                {affiliateModal.product?.[`name_${language}`] || affiliateModal.product?.name_tr}
                            </p>
                            <input
                                type="text"
                                value={getAffiliateLink(affiliateModal.product)}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    background: '#f9fafb',
                                    color: '#374151'
                                }}
                            />
                            {!getAffiliateLink(affiliateModal.product) && (
                                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px', background: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                                    {!shopAccount?.affiliate_code
                                        ? '⚠️ Referans kodunuz bulunamadı. Profilinizi kontrol edin.'
                                        : '⚠️ Link oluşturulamadı. Lütfen bu ürünü "Düzenle" diyip tekrar kaydedin.'}
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <button
                                onClick={shareOnWhatsApp}
                                style={{
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>📱</span>
                                WhatsApp
                            </button>
                            <button
                                onClick={shareOnFacebook}
                                style={{
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #1877f2, #0c63d4)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>📘</span>
                                Facebook
                            </button>
                            <button
                                onClick={copyAffiliateLink}
                                style={{
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🔗</span>
                                {language === 'de' ? 'Kopieren' : language === 'en' ? 'Copy' : 'Kopyala'}
                            </button>
                        </div>

                        <div style={{ marginTop: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.85rem', color: '#0369a1' }}>
                            💡 {language === 'de'
                                ? 'Teilen Sie diesen Link und verdienen Sie 10% Provision bei jedem Verkauf!'
                                : language === 'en'
                                    ? 'Share this link and earn 10% commission on every sale!'
                                    : 'Bu linki paylaşın ve her satıştan %10 komisyon kazanın!'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopOwnerProducts;
