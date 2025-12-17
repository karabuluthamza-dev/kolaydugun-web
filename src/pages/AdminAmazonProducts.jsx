import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import './AdminAmazonProducts.css';

const AdminAmazonProducts = () => {
    usePageTitle('Amazon Ürünleri');
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, unavailable, price_changed
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user, filter]);

    const fetchProducts = async () => {
        setLoading(true);

        let query = supabase
            .from('shop_products')
            .select(`
                id, 
                name_tr, name_de, name_en,
                price, original_price,
                images,
                amazon_url, affiliate_url, amazon_asin,
                product_type, check_status,
                click_count, view_count,
                status,
                last_manual_check,
                created_at
            `)
            .eq('product_type', 'amazon')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('check_status', filter);
        }

        const { data, error } = await query;

        if (!error && data) {
            setProducts(data);
        }

        setLoading(false);
    };

    const filteredProducts = products.filter(p => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.name_tr?.toLowerCase().includes(query) ||
            p.name_de?.toLowerCase().includes(query) ||
            p.name_en?.toLowerCase().includes(query) ||
            p.amazon_asin?.toLowerCase().includes(query)
        );
    });

    const handleToggleActive = async (id, currentStatus) => {
        const newStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
        try {
            await supabase
                .from('shop_products')
                .update({ status: newStatus })
                .eq('id', id);

            setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, status: newStatus } : p
            ));
        } catch (err) {
            console.error('Error toggling status:', err);
            alert('Hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

        try {
            await supabase
                .from('shop_products')
                .delete()
                .eq('id', id);

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting:', err);
            alert('Silme hatası');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;
        if (!window.confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) return;

        try {
            await supabase
                .from('shop_products')
                .delete()
                .in('id', selectedProducts);

            setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
            setSelectedProducts([]);
        } catch (err) {
            console.error('Error bulk deleting:', err);
            alert('Toplu silme hatası');
        }
    };

    // Mark product as manually checked (for price verification)
    const handleMarkChecked = async (productId) => {
        try {
            await supabase
                .from('shop_products')
                .update({ last_manual_check: new Date().toISOString() })
                .eq('id', productId);
        } catch (err) {
            console.error('Error marking checked:', err);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="status-badge active">✅ Aktif</span>;
            case 'pending':
                return <span className="status-badge pending">⏳ Bekliyor</span>;
            case 'unavailable':
                return <span className="status-badge unavailable">❌ Mevcut Değil</span>;
            case 'price_changed':
                return <span className="status-badge price-changed">💰 Fiyat Değişti</span>;
            case 'error':
                return <span className="status-badge error">⚠️ Hata</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
        }
        return 'https://via.placeholder.com/60x60?text=No+Image';
    };

    if (loading) {
        return (
            <div className="admin-amazon-products loading">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="admin-amazon-products">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <Link to="/admin/amazon" className="back-link">← Dashboard</Link>
                    <h1>📦 Amazon Ürünleri</h1>
                    <p>{products.length} ürün</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/amazon/add" className="btn btn-primary">
                        ➕ Ürün Ekle
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="filters-bar">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tümü ({products.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        ✅ Aktif
                    </button>
                    <button
                        className={`filter-tab ${filter === 'unavailable' ? 'active' : ''}`}
                        onClick={() => setFilter('unavailable')}
                    >
                        ❌ Mevcut Değil
                    </button>
                    <button
                        className={`filter-tab ${filter === 'price_changed' ? 'active' : ''}`}
                        onClick={() => setFilter('price_changed')}
                    >
                        💰 Fiyat Değişti
                    </button>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="bulk-actions">
                    <span>{selectedProducts.length} ürün seçildi</span>
                    <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                        🗑️ Seçilenleri Sil
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedProducts([])}>
                        Seçimi Temizle
                    </button>
                </div>
            )}

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📦</span>
                    <h3>Ürün bulunamadı</h3>
                    <p>Henüz Amazon ürünü eklenmemiş.</p>
                    <Link to="/admin/amazon/add" className="btn btn-primary">
                        İlk Ürünü Ekle
                    </Link>
                </div>
            ) : (
                <div className="products-table-wrapper">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === filteredProducts.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedProducts(filteredProducts.map(p => p.id));
                                            } else {
                                                setSelectedProducts([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th>Ürün</th>
                                <th>ASIN</th>
                                <th>Fiyat</th>
                                <th>Durum</th>
                                <th>Tıklama</th>
                                <th>Eklenme</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className={product.status !== 'approved' ? 'inactive' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts(prev => [...prev, product.id]);
                                                } else {
                                                    setSelectedProducts(prev => prev.filter(id => id !== product.id));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="product-cell">
                                        <img
                                            src={getProductImage(product)}
                                            alt=""
                                            className="product-thumb"
                                        />
                                        <div className="product-info">
                                            <span className="product-name">
                                                {product.name_tr || product.name_de || product.name_en || 'İsimsiz'}
                                            </span>
                                            {product.status !== 'approved' && (
                                                <span className="inactive-badge">Pasif</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <code className="asin-code">{product.amazon_asin || '-'}</code>
                                    </td>
                                    <td>
                                        <span className="price">€{product.price?.toFixed(2) || '-'}</span>
                                        {product.original_price && product.original_price !== product.price && (
                                            <span className="original-price">€{product.original_price.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td>{getStatusBadge(product.check_status)}</td>
                                    <td>
                                        <span className="click-count">{product.click_count || 0}</span>
                                    </td>
                                    <td>{formatDate(product.created_at)}</td>
                                    <td className="actions-cell">
                                        <a
                                            href={`https://www.amazon.de/dp/${product.amazon_asin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn check-btn"
                                            title="Amazon'da Fiyat Kontrol Et"
                                            onClick={() => handleMarkChecked(product.id)}
                                        >
                                            🔍
                                        </a>
                                        <a
                                            href={product.affiliate_url || product.amazon_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn"
                                            title="Affiliate Link"
                                        >
                                            🔗
                                        </a>
                                        <button
                                            className="action-btn"
                                            onClick={() => handleToggleActive(product.id, product.status)}
                                            title={product.status === 'approved' ? 'Pasif Yap' : 'Aktif Yap'}
                                        >
                                            {product.status === 'approved' ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                        <button
                                            className="action-btn danger"
                                            onClick={() => handleDelete(product.id)}
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminAmazonProducts;
