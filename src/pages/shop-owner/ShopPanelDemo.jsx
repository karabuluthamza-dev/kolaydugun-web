import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ShopPanelDemo - Public read-only demo that looks EXACTLY like the real panel
 * Uses the same layout as ShopOwnerLayout + ShopOwnerDashboard
 */
const ShopPanelDemo = () => {
    const { language } = useLanguage();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [copySuccess, setCopySuccess] = useState(false);

    const texts = {
        tr: {
            demoBanner: '🔒 Demo Modu - Salt Okunur',
            applyNow: 'Kendi Mağazanızı Açın →',
            title: '👋 Başlangıç',
            subtitle: 'Mağazanızın genel durumu',
            dashboard: 'Başlangıç',
            products: 'Ürünlerim',
            categories: 'Kategorilerim',
            gallery: 'Galeri',
            profile: 'Mağaza Profili',
            affiliate: 'Affiliate',
            analytics: 'İstatistikler',
            help: 'Yardım',
            remainingProducts: 'Kalan Ürün hakkı',
            totalProducts: 'Toplam Ürün',
            approved: 'Onaylı',
            pending: 'Onay Bekliyor',
            views: 'Görüntülenme',
            planInfo: 'Plan Bilgileri',
            plan: 'Plan',
            expiresAt: 'Bitiş Tarihi',
            productLimit: 'Ürün Limiti',
            affiliateCode: 'Affiliate Kodunuz',
            affiliateEarnings: 'Toplam Kazanç',
            quickActions: 'Hızlı İşlemler',
            shopLink: 'Mağaza Linkiniz',
            copyLink: 'Kopyala',
            copied: 'Kopyalandı!',
            addNewProduct: 'Yeni Ürün Ekle',
            viewShop: 'Mağazamı Görüntüle',
            recentProducts: 'Son Ürünler',
            addProduct: '+ Yeni Ürün Ekle',
            noProducts: 'Henüz ürün eklenmemiş',
            logout: 'Çıkış Yap',
            slogan: 'Slogan',
            aboutUs: 'Hakkımızda',
            howWeWork: 'Nasıl Çalışıyoruz',
            experienceYears: 'Tecrübe Yılı',
            rating: 'Puan',
            galleryItems: 'Galeri Öğeleri',
            noGallery: 'Henüz galeri öğesi eklenmedi'
        },
        de: {
            demoBanner: '🔒 Demo-Modus - Nur Lesen',
            applyNow: 'Eröffnen Sie Ihren Shop →',
            title: '👋 Übersicht',
            subtitle: 'Allgemeiner Status Ihres Shops',
            dashboard: 'Übersicht',
            products: 'Meine Produkte',
            categories: 'Meine Kategorien',
            gallery: 'Galerie',
            profile: 'Shop-Profil',
            affiliate: 'Affiliate',
            analytics: 'Statistiken',
            help: 'Hilfe',
            remainingProducts: 'Verbleibende Produkte',
            totalProducts: 'Gesamtprodukte',
            approved: 'Genehmigt',
            pending: 'Ausstehend',
            views: 'Ansichten',
            planInfo: 'Plan-Informationen',
            plan: 'Plan',
            expiresAt: 'Läuft ab am',
            productLimit: 'Produktlimit',
            affiliateCode: 'Ihr Affiliate-Code',
            affiliateEarnings: 'Gesamtverdienst',
            quickActions: 'Schnellaktionen',
            shopLink: 'Ihr Shop-Link',
            copyLink: 'Kopieren',
            copied: 'Kopiert!',
            addNewProduct: 'Neues Produkt hinzufügen',
            viewShop: 'Meinen Shop anzeigen',
            recentProducts: 'Letzte Produkte',
            addProduct: '+ Neues Produkt',
            noProducts: 'Noch keine Produkte',
            logout: 'Abmelden',
            slogan: 'Slogan',
            aboutUs: 'Über Uns',
            howWeWork: 'Wie Wir Arbeiten',
            experienceYears: 'Erfahrungsjahre',
            rating: 'Bewertung',
            galleryItems: 'Galerie-Elemente',
            noGallery: 'Noch keine Galerie-Elemente'
        },
        en: {
            demoBanner: '🔒 Demo Mode - Read Only',
            applyNow: 'Open Your Own Shop →',
            title: '👋 Dashboard',
            subtitle: 'Overview of your shop',
            dashboard: 'Dashboard',
            products: 'My Products',
            categories: 'My Categories',
            gallery: 'Gallery',
            profile: 'Shop Profile',
            affiliate: 'Affiliate',
            analytics: 'Analytics',
            help: 'Help',
            remainingProducts: 'Remaining Products',
            totalProducts: 'Total Products',
            approved: 'Approved',
            pending: 'Pending',
            views: 'Views',
            planInfo: 'Plan Information',
            plan: 'Plan',
            expiresAt: 'Expires At',
            productLimit: 'Product Limit',
            affiliateCode: 'Your Affiliate Code',
            affiliateEarnings: 'Total Earnings',
            quickActions: 'Quick Actions',
            shopLink: 'Your Shop Link',
            copyLink: 'Copy',
            copied: 'Copied!',
            addNewProduct: 'Add New Product',
            viewShop: 'View My Shop',
            recentProducts: 'Recent Products',
            addProduct: '+ Add Product',
            noProducts: 'No products yet',
            logout: 'Logout',
            slogan: 'Slogan',
            aboutUs: 'About Us',
            howWeWork: 'How We Work',
            experienceYears: 'Years of Experience',
            rating: 'Rating',
            galleryItems: 'Gallery Items',
            noGallery: 'No gallery items yet'
        }
    };

    const txt = texts[language] || texts.tr;

    useEffect(() => {
        fetchDemoData();
    }, []);

    const fetchDemoData = async () => {
        try {
            const { data: shopData } = await supabase
                .from('shop_accounts')
                .select('*')
                .eq('email', 'christie4163@comfythings.com')
                .single();

            if (shopData) {
                setShop(shopData);

                const { data: productsData } = await supabase
                    .from('shop_products')
                    .select('*')
                    .eq('shop_account_id', shopData.id)
                    .order('created_at', { ascending: false });

                setProducts(productsData || []);

                const { data: catsData } = await supabase
                    .from('shop_custom_categories')
                    .select('*')
                    .eq('shop_id', shopData.id)
                    .order('sort_order', { ascending: true });

                setCategories(catsData || []);
            }
        } catch (error) {
            console.error('Error fetching demo data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedField = (item, field) => {
        return item?.[`${field}_${language}`] || item?.[`${field}_tr`] || item?.[field] || '';
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/shop/magaza/${shop?.slug}`);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) {
        return (
            <div className="demo-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    const stats = {
        totalProducts: products.length,
        approvedProducts: products.filter(p => p.status === 'approved').length,
        pendingProducts: products.filter(p => p.status === 'pending').length,
        totalViews: products.reduce((a, p) => a + (p.view_count || 0), 0)
    };

    const recentProducts = products.slice(0, 5);

    const renderDashboard = () => (
        <div className="shop-owner-dashboard">
            <div className="shop-page-header">
                <h1>{txt.title}</h1>
                <p>{txt.subtitle}</p>
            </div>

            {/* Stats Grid - Exactly like real panel */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-label">{txt.totalProducts}</div>
                    <div className="stat-value">{stats.totalProducts}</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-label">{txt.approved}</div>
                    <div className="stat-value">{stats.approvedProducts}</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-label">{txt.pending}</div>
                    <div className="stat-value">{stats.pendingProducts}</div>
                </div>
                <div className="stat-card info">
                    <div className="stat-label">{txt.views}</div>
                    <div className="stat-value">{stats.totalViews}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Plan Info Card */}
                <div className="shop-card">
                    <h3>📋 {txt.planInfo}</h3>
                    <div className="plan-details">
                        <div className="plan-row">
                            <span className="label">{txt.plan}:</span>
                            <span className="value plan-name">Premium</span>
                        </div>
                        <div className="plan-row">
                            <span className="label">{txt.expiresAt}:</span>
                            <span className="value">12.1.2026</span>
                        </div>
                        <div className="plan-row">
                            <span className="label">{txt.productLimit}:</span>
                            <span className="value">∞ / ∞</span>
                        </div>
                    </div>

                    <div className="affiliate-section">
                        <div className="plan-row">
                            <span className="label">{txt.affiliateCode}:</span>
                            <code className="affiliate-code">6Z73Y51Q</code>
                        </div>
                        <div className="plan-row">
                            <span className="label">{txt.affiliateEarnings}:</span>
                            <span className="value earnings">0€</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="shop-card">
                    <h3>⚡ {txt.quickActions}</h3>

                    <div className="shop-link-section">
                        <label>🔗 {txt.shopLink}:</label>
                        <div className="link-input-row">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/shop/magaza/${shop?.slug}`}
                                onClick={(e) => e.target.select()}
                            />
                            <button onClick={handleCopyLink} className="copy-btn">
                                📋 {copySuccess ? txt.copied : txt.copyLink}
                            </button>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <span className="action-btn primary disabled">
                            📦 {txt.addNewProduct}
                        </span>
                        <a href={`/shop/magaza/${shop?.slug}`} target="_blank" rel="noopener noreferrer" className="action-btn secondary">
                            🔗 {txt.viewShop}
                        </a>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="shop-card full-width">
                    <div className="card-header">
                        <h3>📦 {txt.recentProducts}</h3>
                        <span className="view-all">{txt.addProduct} →</span>
                    </div>

                    {recentProducts.length === 0 ? (
                        <div className="empty-state">
                            <p>{txt.noProducts}</p>
                        </div>
                    ) : (
                        <div className="products-list">
                            {recentProducts.map(product => (
                                <div key={product.id} className="product-row">
                                    <div className="product-image-small">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" />
                                        ) : (
                                            <span>📦</span>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <span className="product-name">
                                            {getLocalizedField(product, 'name')}
                                        </span>
                                        <span className="product-category">
                                            {product.category?.name_tr || '-'}
                                        </span>
                                    </div>
                                    <div className="product-stats">
                                        <span>👁️ {product.view_count || 0}</span>
                                        <span>🖱️ {product.click_count || 0}</span>
                                    </div>
                                    <span className={`status-badge ${product.status}`}>
                                        {product.status === 'approved' && '✅'}
                                        {product.status === 'pending' && '⏳'}
                                        {product.status === 'rejected' && '❌'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="shop-owner-products">
            <div className="shop-page-header">
                <h1>📦 {txt.products}</h1>
            </div>
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Ürün Adı</th>
                            <th>Fiyat</th>
                            <th>Görüntülenme</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img src={product.images?.[0]} alt="" className="product-thumb" />
                                </td>
                                <td>{getLocalizedField(product, 'name')}</td>
                                <td>€{product.price}</td>
                                <td>{product.view_count || 0}</td>
                                <td>
                                    <span className={`status-badge ${product.status}`}>
                                        {product.status === 'approved' ? '✅ Onaylı' : '⏳ Beklemede'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCategories = () => (
        <div className="shop-owner-categories">
            <div className="shop-page-header">
                <h1>🏷️ {txt.categories}</h1>
            </div>
            <div className="categories-grid">
                {categories.map(cat => {
                    const count = products.filter(p => p.custom_category_id === cat.id).length;
                    return (
                        <div key={cat.id} className="category-card">
                            <span className="cat-icon">{cat.icon || '📁'}</span>
                            <h4>{getLocalizedField(cat, 'name')}</h4>
                            <p>{count} ürün</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="shop-owner-profile">
            <div className="shop-page-header">
                <h1>⚙️ {txt.profile}</h1>
            </div>
            <div className="profile-preview">
                <div className="preview-card">
                    {shop?.cover_image_url && (
                        <div className="preview-cover">
                            <img src={shop.cover_image_url} alt="" />
                        </div>
                    )}
                    <div className="preview-content">
                        <div className="preview-logo">
                            {shop?.logo_url ? <img src={shop.logo_url} alt="" /> : <span>🏪</span>}
                        </div>
                        <h4>{shop?.business_name}</h4>
                        <p>{getLocalizedField(shop, 'description')}</p>
                    </div>
                </div>

                {/* New Fields Section */}
                <div className="profile-fields-grid">
                    {/* Slogan */}
                    {getLocalizedField(shop, 'slogan') && (
                        <div className="profile-field-card">
                            <h5>💬 {txt.slogan}</h5>
                            <p className="slogan-text">"{getLocalizedField(shop, 'slogan')}"</p>
                        </div>
                    )}

                    {/* Experience & Rating */}
                    <div className="profile-field-card stats-mini">
                        <div className="stat-item">
                            <span className="stat-emoji">🏆</span>
                            <span className="stat-num">{shop?.experience_years || 0}</span>
                            <span className="stat-label">{txt.experienceYears}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-emoji">⭐</span>
                            <span className="stat-num">{shop?.rating || 5.0}</span>
                            <span className="stat-label">{txt.rating}</span>
                        </div>
                    </div>

                    {/* About Us */}
                    {getLocalizedField(shop, 'about') && (
                        <div className="profile-field-card full-width">
                            <h5>📖 {txt.aboutUs}</h5>
                            <div className="field-content">
                                {getLocalizedField(shop, 'about').split('\n').slice(0, 3).map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* How We Work */}
                    {getLocalizedField(shop, 'how_we_work') && (
                        <div className="profile-field-card full-width">
                            <h5>⚙️ {txt.howWeWork}</h5>
                            <div className="field-content">
                                {getLocalizedField(shop, 'how_we_work').split('\n').slice(0, 5).map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Demo için sabit albümler
    const demoAlbums = [
        { id: 1, name: 'Video Çekimleri', icon: '🎥', count: 2 },
        { id: 2, name: 'Dış Çekimler', icon: '🌲', count: 8 },
        { id: 3, name: 'Düğün Hikayesi', icon: '💒', count: 12 }
    ];

    const renderGallery = () => (
        <div className="shop-owner-gallery">
            <div className="shop-page-header">
                <h1>🖼️ {txt.gallery}</h1>
            </div>

            {/* Help Section Update */}
            <div className="help-section detail-open">
                <div className="help-grid">
                    <div className="help-card tiktok" style={{ borderLeftColor: '#000000' }}>
                        <div className="help-card-header">
                            <span className="help-icon">⚫</span>
                            <strong>TikTok</strong>
                        </div>
                        <ul className="help-steps">
                            <li>1. tiktok.com'da videoyu açın</li>
                            <li>2. "Link kopyala" seçin</li>
                            <li>3. Linki yapıştırın</li>
                        </ul>
                    </div>
                    <div className="help-card drive-video" style={{ borderLeftColor: '#4285f4' }}>
                        <div className="help-card-header">
                            <span className="help-icon">▶️</span>
                            <strong>Google Drive Video</strong>
                        </div>
                        <ul className="help-steps">
                            <li>1. Video linkini alın</li>
                            <li>2. "Herkese açık" yapın</li>
                            <li>3. Linki yapıştırın</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Album Management Demo */}
            <div className="album-management-section">
                <div className="section-header">
                    <h3>📁 {txt.gallery || 'Albümler'}</h3>
                    <button className="btn-create-album">➕ Yeni Albüm Oluştur</button>
                </div>
                <div className="albums-list">
                    {demoAlbums.map(album => (
                        <div key={album.id} className="album-chip">
                            <span className="album-icon">{album.icon}</span>
                            <span className="album-name">{album.name}</span>
                            <span className="album-count">{album.count}</span>
                            <button className="album-delete-btn" title="Sil">🗑️</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add New Mock Form */}
            <div className="gallery-add-form">
                <h3>➕ Yeni Ekle</h3>
                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Tür</label>
                        <select>
                            <option value="image">📸 Fotoğraf</option>
                            <option value="video">🎥 Video</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Albüm Seçin</label>
                        <select>
                            <option value="">📁 Albüm Yok</option>
                            {demoAlbums.map(a => (
                                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 3 }}>
                        <label>URL</label>
                        <input type="text" placeholder="Imgur, TikTok, YouTube, Drive linki..." />
                    </div>
                </div>
                <button className="btn-add" disabled>➕ Ekle (Demo)</button>
            </div>

            <div className="demo-notice">
                <p>📷 {txt.galleryItems}: Demo mağazada örnek galeri öğeleri bulunmaktadır.</p>
            </div>

            <div className="gallery-demo-grid">
                <div className="gallery-demo-item video">
                    <div className="video-placeholder" style={{ background: '#000', color: '#fff' }}>
                        <span>⚫</span>
                        <p>TikTok Video</p>
                    </div>
                    <span className="demo-caption">TikTok Trendimiz</span>
                </div>
                <div className="gallery-demo-item video">
                    <div className="video-placeholder" style={{ background: '#4285f4', color: '#fff' }}>
                        <span>▶️</span>
                        <p>Google Drive Video</p>
                    </div>
                    <span className="demo-caption">Kına Gecesi Özeti</span>
                </div>
                <div className="gallery-demo-item">
                    <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400" alt="Demo" />
                    <span className="demo-caption">Düğün Masası Süslemesi</span>
                </div>
                <div className="gallery-demo-item">
                    <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400" alt="Demo" />
                    <span className="demo-caption">Davetiye Koleksiyonumuz</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="shop-panel-demo-wrapper">
            {/* Demo Banner */}
            <div className="demo-alert-banner">
                <span>{txt.demoBanner}</span>
                <Link to="/shop/basvuru" className="apply-cta">{txt.applyNow}</Link>
            </div>

            <div className="shop-owner-layout">
                {/* Sidebar - Exactly like real */}
                <aside className="shop-sidebar">
                    <div className="sidebar-header">
                        {shop?.logo_url && <img src={shop.logo_url} alt="" className="shop-logo" />}
                        <h3>{shop?.business_name || 'Wedding Essentials'}</h3>
                        <span className="plan-badge premium">PREMIUM</span>
                    </div>

                    <div className="remaining-info">
                        <span>{txt.remainingProducts}:</span>
                        <strong>∞</strong>
                    </div>

                    <nav className="sidebar-nav">
                        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            📊 {txt.dashboard}
                        </button>
                        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                            📦 {txt.products} <span className="badge">{products.length}</span>
                        </button>
                        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
                            🏷️ {txt.categories}
                        </button>
                        <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>
                            🖼️ {txt.gallery}
                        </button>
                        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            ⚙️ {txt.profile}
                        </button>
                        <button disabled>👥 {txt.affiliate}</button>
                        <button disabled>📈 {txt.analytics}</button>
                        <button disabled>❓ {txt.help}</button>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" disabled>🚪 {txt.logout}</button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="shop-main-content">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'products' && renderProducts()}
                    {activeTab === 'categories' && renderCategories()}
                    {activeTab === 'gallery' && renderGallery()}
                    {activeTab === 'profile' && renderProfile()}
                </main>
            </div>

            <style>{`
                .shop-panel-demo-wrapper {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .demo-alert-banner {
                    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                    color: white;
                    padding: 10px 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .apply-cta {
                    background: white;
                    color: #ef4444;
                    padding: 6px 16px;
                    border-radius: 20px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: transform 0.2s;
                }

                .apply-cta:hover {
                    transform: scale(1.05);
                }

                .shop-owner-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    max-width: 1600px;
                    margin: 0 auto;
                    min-height: calc(100vh - 50px);
                }

                .shop-sidebar {
                    background: white;
                    border-right: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 50px;
                    height: calc(100vh - 50px);
                }

                .sidebar-header {
                    padding: 24px;
                    text-align: center;
                    border-bottom: 1px solid #e5e7eb;
                }

                .shop-logo {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    object-fit: cover;
                    margin-bottom: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }

                .sidebar-header h3 {
                    margin: 0 0 8px;
                    font-size: 1.1rem;
                    color: #0f172a;
                }

                .plan-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .plan-badge.premium {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .remaining-info {
                    padding: 16px 24px;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .sidebar-nav {
                    padding: 16px 12px;
                }

                .sidebar-nav button {
                    width: 100%;
                    text-align: left;
                    padding: 12px 16px;
                    border: none;
                    background: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .sidebar-nav button:hover:not(:disabled) {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .sidebar-nav button.active {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                }

                .sidebar-nav button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .sidebar-nav .badge {
                    margin-left: auto;
                    background: rgba(0,0,0,0.1);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                }

                .sidebar-nav button.active .badge {
                    background: rgba(255,255,255,0.2);
                }

                .sidebar-footer {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                    margin-top: auto;
                }

                .logout-btn {
                    width: 100%;
                    padding: 10px;
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .shop-main-content {
                    padding: 32px;
                    overflow-y: auto;
                }

                .shop-page-header {
                    margin-bottom: 24px;
                }

                .shop-page-header h1 {
                    margin: 0 0 4px;
                    font-size: 1.5rem;
                    color: #0f172a;
                }

                .shop-page-header p {
                    margin: 0;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 14px;
                    border-left: 4px solid;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .stat-card.primary { border-left-color: #FF6B9D; }
                .stat-card.success { border-left-color: #10b981; }
                .stat-card.warning { border-left-color: #f59e0b; }
                .stat-card.info { border-left-color: #3b82f6; }

                .stat-label {
                    font-size: 0.8rem;
                    color: #6b7280;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .dashboard-grid .full-width {
                    grid-column: 1 / -1;
                }

                .shop-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                }

                .shop-card h3 {
                    margin: 0 0 16px;
                    font-size: 1rem;
                    color: #111827;
                }

                .plan-details, .affiliate-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .affiliate-section {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #f3f4f6;
                }

                .plan-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .plan-row .label {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                .plan-row .value {
                    font-weight: 600;
                    color: #111827;
                }

                .plan-name {
                    background: linear-gradient(135deg, #FF6B9D, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .affiliate-code {
                    background: #f3f4f6;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-weight: 600;
                    color: #FF6B9D;
                }

                .earnings {
                    color: #10b981 !important;
                }

                .shop-link-section {
                    background: #f0f9ff;
                    padding: 14px;
                    border-radius: 10px;
                    margin-bottom: 14px;
                }

                .shop-link-section label {
                    font-size: 0.8rem;
                    color: #6b7280;
                    display: block;
                    margin-bottom: 8px;
                }

                .link-input-row {
                    display: flex;
                    gap: 8px;
                }

                .link-input-row input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    background: white;
                }

                .copy-btn {
                    padding: 10px 14px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.8rem;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .quick-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .action-btn {
                    padding: 12px 16px;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 600;
                    text-align: center;
                    font-size: 0.9rem;
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                }

                .action-btn.primary.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .action-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 14px;
                }

                .card-header h3 { margin: 0; }

                .view-all {
                    color: #FF6B9D;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .product-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    background: #f9fafb;
                    border-radius: 10px;
                }

                .product-image-small {
                    width: 45px;
                    height: 45px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-image-small img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-info {
                    flex: 1;
                    min-width: 0;
                }

                .product-name {
                    display: block;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .product-category {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .product-stats {
                    display: flex;
                    gap: 12px;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                }

                .status-badge.approved { background: #dcfce7; }
                .status-badge.pending { background: #fef3c7; }

                /* Products Table */
                .products-table-container {
                    background: white;
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .products-table th,
                .products-table td {
                    padding: 14px;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                }

                .products-table th {
                    background: #f9fafb;
                    font-size: 0.8rem;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                .product-thumb {
                    width: 45px;
                    height: 45px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                /* Categories */
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .category-card {
                    background: white;
                    padding: 24px;
                    border-radius: 14px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .cat-icon {
                    font-size: 2rem;
                    display: block;
                    margin-bottom: 10px;
                }

                .category-card h4 {
                    margin: 0 0 4px;
                    color: #111827;
                    font-size: 0.95rem;
                }

                .category-card p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 0.8rem;
                }

                /* Profile */
                .profile-preview {
                    max-width: 400px;
                }

                .preview-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .preview-cover {
                    height: 100px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                }

                .preview-cover img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preview-content {
                    padding: 20px;
                    text-align: center;
                    margin-top: -40px;
                }

                .preview-logo {
                    width: 70px;
                    height: 70px;
                    margin: 0 auto 12px;
                    background: white;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .preview-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preview-content h4 {
                    margin: 0 0 8px;
                    color: #111827;
                }

                .preview-content p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 0.85rem;
                    line-height: 1.5;
                }

                .demo-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #FF6B9D;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    .shop-owner-layout {
                        grid-template-columns: 1fr;
                    }
                    
                    .shop-sidebar {
                        border-right: none;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    
                    .sidebar-nav {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                    
                    .sidebar-nav button {
                        flex: none;
                        width: auto;
                    }
                    
                    .stats-grid,
                    .categories-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShopPanelDemo;
