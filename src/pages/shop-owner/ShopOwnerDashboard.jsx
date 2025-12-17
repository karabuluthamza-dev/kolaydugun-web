import React from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const ShopOwnerDashboard = () => {
    const { shopAccount, stats, products, isPlanExpired, getDaysUntilExpiry, getPlanInfo, getRemainingProducts } = useShopOwner();
    const { language } = useLanguage();

    const texts = {
        tr: {
            title: 'Başlangıç',
            subtitle: 'Mağazanızın genel durumu',
            totalProducts: 'Toplam Ürün',
            approved: 'Onaylı',
            pending: 'Onay Bekliyor',
            rejected: 'Reddedildi',
            totalViews: 'Görüntülenme',
            totalClicks: 'Tıklama',
            recentProducts: 'Son Ürünler',
            addProduct: '+ Yeni Ürün Ekle',
            noProducts: 'Henüz ürün eklenmemiş',
            planInfo: 'Plan Bilgileri',
            plan: 'Plan',
            expiresAt: 'Bitiş Tarihi',
            productLimit: 'Ürün Limiti',
            affiliateCode: 'Affiliate Kodunuz',
            affiliateEarnings: 'Toplam Kazanç',
            quickActions: 'Hızlı İşlemler',
            viewShop: 'Mağazamı Görüntüle',
            addNewProduct: 'Yeni Ürün Ekle',
            shopLink: 'Mağaza Linkiniz',
            copyLink: 'Kopyala',
            copied: 'Kopyalandı!'
        },
        de: {
            title: 'Übersicht',
            subtitle: 'Allgemeiner Status Ihres Shops',
            totalProducts: 'Gesamtprodukte',
            approved: 'Genehmigt',
            pending: 'Ausstehend',
            rejected: 'Abgelehnt',
            totalViews: 'Ansichten',
            totalClicks: 'Klicks',
            recentProducts: 'Letzte Produkte',
            addProduct: '+ Neues Produkt',
            noProducts: 'Noch keine Produkte',
            planInfo: 'Plan-Informationen',
            plan: 'Plan',
            expiresAt: 'Läuft ab am',
            productLimit: 'Produktlimit',
            affiliateCode: 'Ihr Affiliate-Code',
            affiliateEarnings: 'Gesamtverdienst',
            quickActions: 'Schnellaktionen',
            viewShop: 'Meinen Shop anzeigen',
            addNewProduct: 'Neues Produkt hinzufügen',
            shopLink: 'Ihr Shop-Link',
            copyLink: 'Kopieren',
            copied: 'Kopiert!'
        },
        en: {
            title: 'Dashboard',
            subtitle: 'Overview of your shop',
            totalProducts: 'Total Products',
            approved: 'Approved',
            pending: 'Pending',
            rejected: 'Rejected',
            totalViews: 'Views',
            totalClicks: 'Clicks',
            recentProducts: 'Recent Products',
            addProduct: '+ Add Product',
            noProducts: 'No products yet',
            planInfo: 'Plan Information',
            plan: 'Plan',
            expiresAt: 'Expires At',
            productLimit: 'Product Limit',
            affiliateCode: 'Your Affiliate Code',
            affiliateEarnings: 'Total Earnings',
            quickActions: 'Quick Actions',
            viewShop: 'View My Shop',
            addNewProduct: 'Add New Product',
            shopLink: 'Your Shop Link',
            copyLink: 'Copy',
            copied: 'Copied!'
        }
    };

    const txt = texts[language] || texts.tr;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('de-DE');
    };

    const recentProducts = products.slice(0, 5);
    const daysLeft = getDaysUntilExpiry();

    const planNames = {
        starter: 'Starter',
        business: 'Business',
        premium: 'Premium'
    };

    // Expiry warning texts
    const expiryTexts = {
        tr: {
            expired: '⚠️ Plan süreniz doldu! Mağazanız görünmüyor. Yenilemek için iletişime geçin.',
            expiringSoon: (days) => `⏰ Dikkat! Plan süreniz ${days} gün sonra bitiyor. Yenilemek için iletişime geçin.`,
            contact: 'İletişim: kontakt@kolaydugun.de'
        },
        de: {
            expired: '⚠️ Ihr Plan ist abgelaufen! Ihr Shop ist nicht sichtbar. Kontaktieren Sie uns zur Verlängerung.',
            expiringSoon: (days) => `⏰ Achtung! Ihr Plan läuft in ${days} Tagen ab. Kontaktieren Sie uns zur Verlängerung.`,
            contact: 'Kontakt: kontakt@kolaydugun.de'
        },
        en: {
            expired: '⚠️ Your plan has expired! Your shop is not visible. Contact us to renew.',
            expiringSoon: (days) => `⏰ Warning! Your plan expires in ${days} days. Contact us to renew.`,
            contact: 'Contact: kontakt@kolaydugun.de'
        }
    };
    const expTxt = expiryTexts[language] || expiryTexts.tr;

    return (
        <div className="shop-owner-dashboard">
            <div className="shop-page-header">
                <h1>👋 {txt.title}</h1>
                <p>{txt.subtitle}</p>
            </div>

            {/* Plan Expiry Warning Banner */}
            {isPlanExpired() && (
                <div style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div>
                        <strong style={{ fontSize: '1rem' }}>{expTxt.expired}</strong>
                        <div style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.9 }}>{expTxt.contact}</div>
                    </div>
                    <a href="mailto:kontakt@kolaydugun.de" style={{
                        background: 'white',
                        color: '#dc2626',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}>
                        📧 Email
                    </a>
                </div>
            )}

            {!isPlanExpired() && daysLeft !== null && daysLeft <= 7 && (
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div>
                        <strong style={{ fontSize: '0.95rem' }}>{expTxt.expiringSoon(daysLeft)}</strong>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.9 }}>{expTxt.contact}</div>
                    </div>
                    <a href="mailto:info@kolaydugun.de" style={{
                        background: 'white',
                        color: '#d97706',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                    }}>
                        📧 Email
                    </a>
                </div>
            )}

            {/* Stats Grid */}
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
                    <div className="stat-label">{txt.totalViews}</div>
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
                            <span className="value plan-name">
                                {getPlanInfo()?.display_name_tr || planNames[shopAccount?.plan] || 'Starter'}
                            </span>
                        </div>
                        <div className="plan-row">
                            <span className="label">{txt.expiresAt}:</span>
                            <span className="value">{formatDate(shopAccount?.plan_expires_at)}</span>
                        </div>
                        <div className="plan-row">
                            <span className="label">{txt.productLimit}:</span>
                            <span className="value">{getRemainingProducts()} / {getPlanInfo()?.product_limit === -1 ? '∞' : getPlanInfo()?.product_limit || 5}</span>
                        </div>
                    </div>

                    {shopAccount?.affiliate_code && (
                        <div className="affiliate-section">
                            <div className="plan-row">
                                <span className="label">{txt.affiliateCode}:</span>
                                <code className="affiliate-code">{shopAccount.affiliate_code}</code>
                            </div>
                            <div className="plan-row">
                                <span className="label">{txt.affiliateEarnings}:</span>
                                <span className="value earnings">{shopAccount.affiliate_earnings_total || 0}€</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="shop-card">
                    <h3>⚡ {txt.quickActions}</h3>

                    {/* Shop Link Section */}
                    {shopAccount?.slug && (
                        <div className="shop-link-section" style={{
                            background: '#f0f9ff',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <label style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                                🔗 {txt.shopLink}:
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/shop/magaza/${shopAccount.slug}`}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '0.85rem',
                                        background: 'white'
                                    }}
                                    onClick={(e) => e.target.select()}
                                />
                                <button
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(`${window.location.origin}/shop/magaza/${shopAccount.slug}`);
                                        alert(txt.copied);
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        background: 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    📋 {txt.copyLink}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="quick-actions">
                        <Link to="/shop-panel/products" className="action-btn primary">
                            📦 {txt.addNewProduct}
                        </Link>
                        {shopAccount?.slug && (
                            <a href={`/shop/magaza/${shopAccount.slug}`} target="_blank" rel="noopener noreferrer" className="action-btn secondary">
                                🔗 {txt.viewShop}
                            </a>
                        )}
                    </div>
                </div>

                {/* Recent Products */}
                <div className="shop-card full-width">
                    <div className="card-header">
                        <h3>📦 {txt.recentProducts}</h3>
                        <Link to="/shop-panel/products" className="view-all">
                            {txt.addProduct} →
                        </Link>
                    </div>

                    {recentProducts.length === 0 ? (
                        <div className="empty-state">
                            <p>{txt.noProducts}</p>
                            <Link to="/shop-panel/products" className="btn-primary small">
                                {txt.addProduct}
                            </Link>
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
                                            {product[`name_${language}`] || product.name_tr}
                                        </span>
                                        <span className="product-category">
                                            {product.category?.[`name_${language}`] || product.category?.name_tr || '-'}
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

            <style>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .dashboard-grid .shop-card.full-width {
                    grid-column: 1 / -1;
                }

                .shop-card h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.1rem;
                    color: #111827;
                }

                .plan-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
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

                .plan-row .plan-name {
                    background: linear-gradient(135deg, #FF6B9D, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .affiliate-section {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
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
                    font-size: 1.1rem;
                }

                .quick-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .action-btn {
                    padding: 14px 20px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    text-align: center;
                    transition: all 0.2s;
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                }

                .action-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
                }

                .action-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }

                .action-btn.secondary:hover {
                    background: #e5e7eb;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .card-header h3 {
                    margin: 0;
                }

                .view-all {
                    color: #FF6B9D;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: #6b7280;
                }

                .empty-state .btn-primary {
                    display: inline-block;
                    margin-top: 1rem;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: 600;
                }

                .products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .product-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    transition: background 0.2s;
                }

                .product-row:hover {
                    background: #f3f4f6;
                }

                .product-image-small {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
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
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .product-category {
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .product-stats {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.85rem;
                    color: #6b7280;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                }

                .status-badge.approved { background: #dcfce7; }
                .status-badge.pending { background: #fef3c7; }
                .status-badge.rejected { background: #fee2e2; }

                @media (max-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }

                    .product-stats {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShopOwnerDashboard;
