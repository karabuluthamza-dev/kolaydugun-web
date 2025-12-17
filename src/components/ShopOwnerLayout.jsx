import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShopOwner, ShopOwnerProvider } from '../context/ShopOwnerContext';
import { useLanguage } from '../context/LanguageContext';
import './ShopOwnerLayout.css';

const ShopOwnerLayoutContent = () => {
    const { user, logout } = useAuth();
    const { shopAccount, loading, isPlanExpired, getDaysUntilExpiry, stats, getRemainingProducts } = useShopOwner();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const texts = {
        tr: {
            title: 'Mağaza Paneli',
            dashboard: 'Başlangıç',
            products: 'Ürünlerim',
            categories: 'Kategorilerim',
            gallery: 'Galeri',
            profile: 'Mağaza Profili',
            affiliate: 'Affiliate',
            analytics: 'İstatistikler',
            help: 'Yardım',
            logout: 'Çıkış Yap',
            backToShop: '← Mağazaya Dön',
            noShop: 'Mağaza hesabınız bulunamadı',
            applyNow: 'Hemen Başvur',
            planExpired: 'Plan süreniz doldu!',
            daysLeft: 'gün kaldı',
            remainingProducts: 'Kalan ürün hakkı',
            loading: 'Yükleniyor...'
        },
        de: {
            title: 'Shop-Panel',
            dashboard: 'Übersicht',
            products: 'Meine Produkte',
            categories: 'Meine Kategorien',
            gallery: 'Galerie',
            profile: 'Shop-Profil',
            affiliate: 'Affiliate',
            analytics: 'Statistiken',
            help: 'Hilfe',
            logout: 'Abmelden',
            backToShop: '← Zurück zum Shop',
            noShop: 'Kein Shop-Konto gefunden',
            applyNow: 'Jetzt bewerben',
            planExpired: 'Ihr Plan ist abgelaufen!',
            daysLeft: 'Tage übrig',
            remainingProducts: 'Verbleibende Produkte',
            loading: 'Laden...'
        },
        en: {
            title: 'Shop Panel',
            dashboard: 'Dashboard',
            products: 'My Products',
            categories: 'My Categories',
            gallery: 'Gallery',
            profile: 'Shop Profile',
            affiliate: 'Affiliate',
            analytics: 'Analytics',
            help: 'Help',
            logout: 'Logout',
            backToShop: '← Back to Shop',
            noShop: 'Shop account not found',
            applyNow: 'Apply Now',
            planExpired: 'Your plan has expired!',
            daysLeft: 'days left',
            remainingProducts: 'Remaining products',
            loading: 'Loading...'
        }
    };

    const txt = texts[language] || texts.tr;

    const planColors = {
        starter: { bg: '#10b981', name: 'Starter' },
        business: { bg: '#3b82f6', name: 'Business' },
        premium: { bg: '#8b5cf6', name: 'Premium' }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Loading state
    if (loading) {
        return (
            <div className="shop-owner-loading">
                <div className="loading-spinner"></div>
                <p>{txt.loading}</p>
            </div>
        );
    }

    // No shop account
    if (!shopAccount) {
        return (
            <div className="shop-owner-no-account">
                <div className="no-account-card">
                    <span className="icon">🏪</span>
                    <h2>{txt.noShop}</h2>
                    <p>{user?.email}</p>
                    <a href="/shop/basvuru" className="btn-primary">{txt.applyNow}</a>
                    <a href="/shop" className="btn-secondary">{txt.backToShop}</a>
                </div>
            </div>
        );
    }

    const daysLeft = getDaysUntilExpiry();
    const planInfo = planColors[shopAccount.plan] || planColors.starter;

    return (
        <div className="shop-owner-layout">
            {/* Sidebar */}
            <aside className="shop-owner-sidebar">
                <div className="sidebar-header">
                    <div className="shop-logo">
                        {shopAccount.logo_url ? (
                            <img src={shopAccount.logo_url} alt={shopAccount.business_name} />
                        ) : (
                            <span className="logo-placeholder">🏪</span>
                        )}
                    </div>
                    <div className="shop-info">
                        <h3>{shopAccount.business_name}</h3>
                        <span
                            className="plan-badge"
                            style={{ background: planInfo.bg }}
                        >
                            {planInfo.name}
                        </span>
                    </div>
                </div>

                {/* Plan Warning */}
                {isPlanExpired() && (
                    <div className="plan-warning expired">
                        ⚠️ {txt.planExpired}
                    </div>
                )}
                {!isPlanExpired() && daysLeft !== null && daysLeft <= 7 && (
                    <div className="plan-warning expiring">
                        ⏰ {daysLeft} {txt.daysLeft}
                    </div>
                )}

                {/* Product Limit */}
                <div className="product-limit-info">
                    <span className="label">{txt.remainingProducts}:</span>
                    <span className="value">{getRemainingProducts()}</span>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <NavLink
                        to="/shop-panel"
                        end
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">📊</span>
                        {txt.dashboard}
                    </NavLink>
                    <NavLink
                        to="/shop-panel/products"
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">📦</span>
                        {txt.products}
                        <span className="badge">{stats.totalProducts}</span>
                    </NavLink>
                    <NavLink
                        to="/shop-panel/categories"
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">🏷️</span>
                        {txt.categories}
                    </NavLink>
                    <NavLink
                        to="/shop-panel/profile"
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">⚙️</span>
                        {txt.profile}
                    </NavLink>
                    <NavLink
                        to="/shop-panel/gallery"
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">🖼️</span>
                        {txt.gallery}
                    </NavLink>
                    {shopAccount.affiliate_code && (
                        <NavLink
                            to="/shop-panel/affiliate"
                            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        >
                            <span className="icon">🔗</span>
                            {txt.affiliate}
                        </NavLink>
                    )}
                    <NavLink
                        to="/shop-panel/analytics"
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">📈</span>
                        {txt.analytics}
                    </NavLink>
                    <NavLink
                        to="/shop-panel/help"
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    >
                        <span className="icon">📚</span>
                        {txt.help}
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 {txt.logout}
                    </button>
                    <a href="/shop" className="back-link">
                        {txt.backToShop}
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="shop-owner-content">
                <Outlet />
            </main>
        </div>
    );
};

// Wrapper with Provider
const ShopOwnerLayout = () => {
    return (
        <ShopOwnerProvider>
            <ShopOwnerLayoutContent />
        </ShopOwnerProvider>
    );
};

export default ShopOwnerLayout;
