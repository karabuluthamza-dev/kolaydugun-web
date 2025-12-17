import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopProducts.css';

const AdminShopProducts = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [filter, setFilter] = useState({ status: 'all', type: 'all', category: 'all', mainShopStatus: 'all' });
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingProduct, setRejectingProduct] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [formData, setFormData] = useState({
        category_id: '',
        name_tr: '',
        name_de: '',
        name_en: '',
        description_tr: '',
        description_de: '',
        description_en: '',
        image_url: '',
        price: '',
        currency: 'EUR',
        product_type: 'boutique',
        amazon_affiliate_url: '',
        status: 'approved',
        display_order: 0,
        is_featured: false
    });

    // Rejection reason templates
    const rejectReasons = [
        { key: 'imageQuality', tr: 'Görsel kalitesi yetersiz', de: 'Bildqualität ist unzureichend', en: 'Image quality is insufficient' },
        { key: 'descriptionMissing', tr: 'Açıklama eksik veya belirsiz', de: 'Beschreibung fehlt oder ist unklar', en: 'Description is missing or unclear' },
        { key: 'priceError', tr: 'Fiyat bilgisi hatalı', de: 'Preisinformation ist falsch', en: 'Price information is incorrect' },
        { key: 'categoryWrong', tr: 'Yanlış kategori seçilmiş', de: 'Falsche Kategorie ausgewählt', en: 'Wrong category selected' }
    ];

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filter]);

    const fetchCategories = async () => {
        try {
            const { data } = await supabase
                .from('shop_categories')
                .select('id, name_tr, name_de, name_en')
                .eq('is_active', true)
                .order('display_order');
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            let query = supabase
                .from('shop_products')
                .select(`
                    *,
                    category:shop_categories(id, name_tr, name_de, name_en),
                    shop:shop_accounts(id, business_name, email)
                `)
                .order('created_at', { ascending: false });

            if (filter.status !== 'all') {
                query = query.eq('status', filter.status);
            }
            if (filter.type !== 'all') {
                query = query.eq('product_type', filter.type);
            }
            if (filter.category !== 'all') {
                query = query.eq('category_id', filter.category);
            }
            // Ana Shop başvuru filtresi
            if (filter.mainShopStatus !== 'all') {
                query = query.eq('main_shop_request_status', filter.mainShopStatus);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                category_id: formData.category_id || null,
                name_tr: formData.name_tr,
                name_de: formData.name_de || null,
                name_en: formData.name_en || null,
                description_tr: formData.description_tr || null,
                description_de: formData.description_de || null,
                description_en: formData.description_en || null,
                images: formData.image_url ? [formData.image_url] : [],
                price: formData.price ? parseFloat(formData.price) : null,
                currency: formData.currency,
                product_type: formData.product_type,
                amazon_affiliate_url: formData.product_type === 'amazon' ? formData.amazon_affiliate_url : null,
                status: formData.status,
                display_order: formData.display_order,
                is_featured: formData.is_featured
            };

            if (editingProduct) {
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
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleApprove = async (id) => {
        try {
            const { error } = await supabase
                .from('shop_products')
                .update({ status: 'approved', rejection_reason: null })
                .eq('id', id);
            if (error) throw error;
            fetchProducts();
        } catch (error) {
            console.error('Error approving product:', error);
        }
    };

    // Ana Shop başvurusu onaylama
    const handleMainShopApprove = async (id) => {
        try {
            const { error } = await supabase
                .from('shop_products')
                .update({
                    main_shop_request_status: 'approved',
                    main_shop_approved_at: new Date().toISOString(),
                    main_shop_rejection_reason: null
                })
                .eq('id', id);
            if (error) throw error;
            alert('✅ Ürün ana shop\'ta yayınlandı!');
            fetchProducts();
        } catch (error) {
            console.error('Error approving main shop request:', error);
        }
    };

    // Ana Shop başvurusu reddetme
    const handleMainShopReject = async (id) => {
        const reason = prompt('Red sebebi (opsiyonel):');
        try {
            const { error } = await supabase
                .from('shop_products')
                .update({
                    main_shop_request_status: 'rejected',
                    main_shop_rejection_reason: reason || 'Başvuru reddedildi'
                })
                .eq('id', id);
            if (error) throw error;
            alert('❌ Ana shop başvurusu reddedildi.');
            fetchProducts();
        } catch (error) {
            console.error('Error rejecting main shop request:', error);
        }
    };

    const handleReject = async () => {
        if (!rejectReason) {
            alert('Lütfen red nedeni seçin veya yazın');
            return;
        }
        try {
            const { error } = await supabase
                .from('shop_products')
                .update({ status: 'rejected', rejection_reason: rejectReason })
                .eq('id', rejectingProduct.id);
            if (error) throw error;
            setShowRejectModal(false);
            setRejectingProduct(null);
            setRejectReason('');
            fetchProducts();
        } catch (error) {
            console.error('Error rejecting product:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase
                .from('shop_products')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            category_id: product.category_id || '',
            name_tr: product.name_tr || '',
            name_de: product.name_de || '',
            name_en: product.name_en || '',
            description_tr: product.description_tr || '',
            description_de: product.description_de || '',
            description_en: product.description_en || '',
            image_url: product.images?.[0] || '',
            price: product.price || '',
            currency: product.currency || 'EUR',
            product_type: product.product_type || 'boutique',
            amazon_affiliate_url: product.amazon_affiliate_url || '',
            status: product.status,
            display_order: product.display_order || 0,
            is_featured: product.is_featured || false
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            category_id: '',
            name_tr: '',
            name_de: '',
            name_en: '',
            description_tr: '',
            description_de: '',
            description_en: '',
            image_url: '',
            price: '',
            currency: 'EUR',
            product_type: 'boutique',
            amazon_affiliate_url: '',
            status: 'approved',
            display_order: 0,
            is_featured: false
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#d97706', label: '🟡 Onay Bekliyor' },
            approved: { bg: '#dcfce7', color: '#16a34a', label: '✅ Onaylı' },
            rejected: { bg: '#fee2e2', color: '#dc2626', label: '❌ Reddedildi' },
            inactive: { bg: '#f3f4f6', color: '#6b7280', label: '⚫ Pasif' }
        };
        const s = styles[status] || styles.inactive;
        return <span style={{ background: s.bg, color: s.color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{s.label}</span>;
    };

    const getTypeBadge = (type) => {
        const styles = {
            boutique: { bg: '#f3e8ff', color: '#7c3aed', label: '👔 Boutique' },
            vendor: { bg: '#dbeafe', color: '#2563eb', label: '🏪 Tedarikçi' },
            amazon: { bg: '#fef3c7', color: '#d97706', label: '📦 Amazon' }
        };
        const s = styles[type] || styles.boutique;
        return <span style={{ background: s.bg, color: s.color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{s.label}</span>;
    };

    const pendingCount = products.filter(p => p.status === 'pending').length;
    const mainShopPendingCount = products.filter(p => p.main_shop_request_status === 'pending').length;

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-products">
            <div className="admin-page-header">
                <div>
                    <h1>🛍️ Shop Ürünleri</h1>
                    <p>Ürünleri yönetin ve onaylayın</p>
                </div>
                <div className="header-actions">
                    {pendingCount > 0 && (
                        <span className="pending-badge">🔔 {pendingCount} ürün onay bekliyor</span>
                    )}
                    {mainShopPendingCount > 0 && (
                        <span className="pending-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                            🏪 {mainShopPendingCount} ana shop başvurusu
                        </span>
                    )}
                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        + Yeni Ürün
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                    <option value="all">Tüm Durumlar</option>
                    <option value="pending">Onay Bekleyen</option>
                    <option value="approved">Onaylı</option>
                    <option value="rejected">Reddedilmiş</option>
                    <option value="inactive">Pasif</option>
                </select>
                <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                    <option value="all">Tüm Tipler</option>
                    <option value="boutique">Boutique</option>
                    <option value="vendor">Tedarikçi</option>
                    <option value="amazon">Amazon</option>
                </select>
                <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name?.[language] || cat.name?.tr}</option>
                    ))}
                </select>
                <select
                    value={filter.mainShopStatus}
                    onChange={(e) => setFilter({ ...filter, mainShopStatus: e.target.value })}
                    style={{ borderColor: filter.mainShopStatus === 'pending' ? '#f59e0b' : undefined }}
                >
                    <option value="all">🏪 Ana Shop (Tümü)</option>
                    <option value="pending">⏳ Ana Shop Bekleyen</option>
                    <option value="approved">✅ Ana Shop Onaylı</option>
                    <option value="rejected">❌ Ana Shop Reddedilmiş</option>
                    <option value="none">➖ Ana Shop Başvuru Yok</option>
                </select>
            </div>

            {/* Products Table */}
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Görsel</th>
                            <th>Ürün</th>
                            <th>Kategori</th>
                            <th>Tip</th>
                            <th>Fiyat</th>
                            <th>Durum</th>
                            <th>Ana Shop</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-row">Ürün bulunamadı</td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className={`${product.status === 'pending' ? 'pending-row' : ''} ${product.main_shop_request_status === 'pending' ? 'main-shop-pending-row' : ''}`}>
                                    <td>
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" className="product-thumb" />
                                        ) : (
                                            <div className="no-image">📷</div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="product-info">
                                            <strong>{product.name_tr || product.title?.[language] || product.title?.tr}</strong>
                                            {product.shop && (
                                                <small>🏪 {product.shop.business_name}</small>
                                            )}
                                            {product.rejection_reason && (
                                                <small className="rejection-reason">❌ {product.rejection_reason}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>{product.category?.name_tr || product.category?.name?.[language] || product.category?.name?.tr || '-'}</td>
                                    <td>{getTypeBadge(product.product_type)}</td>
                                    <td>{product.price ? `${product.price} ${product.currency}` : '-'}</td>
                                    <td>{getStatusBadge(product.status)}</td>
                                    <td>
                                        {/* Ana Shop başvuru durumu */}
                                        {product.main_shop_request_status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                    ⏳ Bekliyor
                                                </span>
                                                <button
                                                    onClick={() => handleMainShopApprove(product.id)}
                                                    title="Ana Shop'ta Yayınla"
                                                    style={{ background: '#dcfce7', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => handleMainShopReject(product.id)}
                                                    title="Reddet"
                                                    style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        )}
                                        {product.main_shop_request_status === 'approved' && (
                                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                ✅ Yayında
                                            </span>
                                        )}
                                        {product.main_shop_request_status === 'rejected' && (
                                            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                ❌ Reddedildi
                                            </span>
                                        )}
                                        {(!product.main_shop_request_status || product.main_shop_request_status === 'none') && (
                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {product.status === 'pending' && (
                                                <>
                                                    <button className="btn-approve" onClick={() => handleApprove(product.id)} title="Onayla">
                                                        ✓
                                                    </button>
                                                    <button className="btn-reject" onClick={() => { setRejectingProduct(product); setShowRejectModal(true); }} title="Reddet">
                                                        ✗
                                                    </button>
                                                </>
                                            )}
                                            <button className="btn-edit" onClick={() => handleEdit(product)} title="Düzenle">
                                                ✏️
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(product.id)} title="Sil">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ürün Tipi *</label>
                                    <select
                                        value={formData.product_type}
                                        onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                    >
                                        <option value="boutique">👔 Boutique Collection</option>
                                        <option value="amazon">📦 Amazon Ürünü</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">Kategori Seç</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name?.[language] || cat.name?.tr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Başlık (Türkçe) *</label>
                                <input
                                    type="text"
                                    value={formData.name_tr}
                                    onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlık (Almanca)</label>
                                    <input
                                        type="text"
                                        value={formData.name_de}
                                        onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Başlık (İngilizce)</label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Açıklama (Türkçe)</label>
                                <textarea
                                    value={formData.description_tr}
                                    onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Açıklama (Almanca)</label>
                                    <textarea
                                        value={formData.description_de}
                                        onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Açıklama (İngilizce)</label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Görsel URL</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                                <small>💡 Görseli Google Drive, Imgur veya kendi sitenizden yükleyip linki yapıştırın.</small>
                            </div>

                            {formData.product_type === 'amazon' && (
                                <div className="form-group">
                                    <label>Amazon Affiliate Linki *</label>
                                    <input
                                        type="url"
                                        value={formData.amazon_affiliate_url}
                                        onChange={(e) => setFormData({ ...formData, amazon_affiliate_url: e.target.value })}
                                        placeholder="https://amazon.de/dp/..."
                                        required={formData.product_type === 'amazon'}
                                    />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fiyat</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="49.99"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Para Birimi</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="TRY">TRY (₺)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Durum</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="approved">Onaylı (Yayında)</option>
                                    <option value="inactive">Pasif</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn-primary">{editingProduct ? 'Güncelle' : 'Ekle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>❌ Ürünü Reddet</h2>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
                        </div>
                        <div className="reject-content">
                            <p><strong>Ürün:</strong> {rejectingProduct?.title?.[language] || rejectingProduct?.title?.tr}</p>

                            <div className="form-group">
                                <label>Red Nedeni Seçin</label>
                                <div className="reject-options">
                                    {rejectReasons.map(reason => (
                                        <button
                                            key={reason.key}
                                            type="button"
                                            className={`reject-option ${rejectReason === reason.tr ? 'selected' : ''}`}
                                            onClick={() => setRejectReason(reason.tr)}
                                        >
                                            {reason.tr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Veya Özel Mesaj Yazın</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Red nedenini açıklayın..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>İptal</button>
                                <button className="btn-danger" onClick={handleReject}>Reddet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopProducts;
