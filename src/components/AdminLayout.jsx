import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dictionary } from '../locales/dictionary';
import LanguageSwitcher from './LanguageSwitcher';
import './AdminLayout.css';

// NavItem komponenti - tooltip ile
const NavItem = ({ to, icon, label, end = false, description = '' }) => {
    const { language } = useLanguage();
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            title={description && typeof description === 'object' ? description[language] : description}
        >
            <span className="icon">{icon}</span>
            <span className="nav-label">{label}</span>
            {description && <span className="nav-tooltip">{typeof description === 'object' ? description[language] : description}</span>}
        </NavLink>
    );
};

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Her modül için açıklama metinleri - component içinde tanımla
    const menuDescriptions = dictionary?.adminPanel?.sidebar?.menuDescriptions || {};

    // Sayfa başlıkları - component içinde tanımla
    const pageTitles = dictionary?.adminPanel?.sidebar?.pageTitles || {};

    const strings = dictionary?.adminPanel?.sidebar || {};

    // Safe accessor helpers to prevent "Cannot read properties of undefined" errors
    const getLabel = (key) => strings?.labels?.[key]?.[language] || key;
    const getMenu = (key) => strings?.menu?.[key]?.[language] || key;
    const getBadge = () => dictionary?.adminPanel?.badge?.[language] || 'Admin';

    // 🔒 SECURITY: Double-check admin role (defense-in-depth)
    useEffect(() => {
        const userRole = user?.role || user?.user_metadata?.role;
        if (!user) {
            console.warn('⚠️ SECURITY: No user in AdminLayout, redirecting to login');
            navigate('/login', { replace: true });
            return;
        }
        if (userRole !== 'admin') {
            console.warn('⚠️ SECURITY: Non-admin user in AdminLayout!', {
                userId: user.id,
                userRole: userRole
            });
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    // Saat güncelleme
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Breadcrumb için sayfa başlığı
    const getCurrentPageTitle = () => {
        const path = location.pathname;
        // Search in menu items for matching label
        const menuKeys = Object.keys(strings.menu);
        const match = menuKeys.find(key => {
            const itemPath = `/admin${key === 'dashboard' ? '' : '/' + key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            return path === itemPath;
        });

        if (match) return strings.menu[match][language];

        // Try dictionary pageTitles first
        const pathSuffix = path === '/admin' ? 'dashboard' : path.split('/').pop().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        if (pageTitles[pathSuffix]) return pageTitles[pathSuffix][language];

        return language === 'tr' ? 'Yönetim Paneli' : 'Admin Panel';
    };

    // Non-admin user check - show nothing while redirecting
    const userRole = user?.role || user?.user_metadata?.role;
    if (!user || userRole !== 'admin') {
        return null;
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>KolayDugun</h2>
                    <span className="admin-badge">{getBadge()}</span>
                </div>

                <nav className="admin-nav">
                    <NavItem to="/admin" icon="📊" label={getMenu('dashboard')} end={true} description={menuDescriptions.dashboard} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('daily')}</div>
                    <NavItem to="/admin/leads" icon="📨" label={getMenu('leads')} />
                    <NavItem to="/admin/credit-approval" icon="✅" label={getMenu('creditApproval')} />
                    <NavItem to="/admin/reviews" icon="⭐" label={getMenu('reviews')} />
                    <NavItem to="/admin/messaging" icon="🆘" label={getMenu('support')} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('marketplace')}</div>
                    <NavItem to="/admin/vendors" icon="🏪" label={getMenu('vendors')} description={menuDescriptions.vendors} />
                    <NavItem to="/admin/users" icon="👥" label={getMenu('users')} description={menuDescriptions.users} />
                    <NavItem to="/admin/categories" icon="🖼️" label={getMenu('categories')} />
                    <NavItem to="/admin/messages" icon="💬" label={getMenu('messages')} />
                    <NavItem to="/admin/claims" icon="🛡️" label={getMenu('claims')} description={menuDescriptions.claims} />
                    <NavItem to="/admin/imports" icon="📥" label={language === 'tr' ? 'Veri Aktarımı' : 'Imports'} description={language === 'tr' ? 'Dış kaynaklardan çekilen verileri onayla/reddet' : 'Manage imported vendors'} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('content')}</div>
                    <NavItem to="/admin/blog" icon="📝" label={getMenu('blog')} />
                    <NavItem to="/admin/comments" icon="💬" label={getMenu('blogComments')} />
                    <NavItem to="/admin/pages" icon="📄" label={getMenu('pages')} />
                    <NavItem to="/admin/faq" icon="❓" label={getMenu('faq')} />
                    <NavItem to="/admin/notifications" icon="📢" label={getMenu('notifications')} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('finance')}</div>
                    <NavItem to="/admin/pricing" icon="💰" label={getMenu('pricing')} />
                    <NavItem to="/admin/finance" icon="📊" label={getMenu('finance')} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('title')}</div>
                    <NavItem to="/admin/shop-applications" icon="📋" label={getMenu('shopApplications')} />
                    <NavItem to="/admin/shop-accounts" icon="🏪" label={getMenu('shopAccounts')} />
                    <NavItem to="/admin/shop-categories" icon="🏷️" label={getMenu('shopCategories')} />
                    <NavItem to="/admin/shop-products" icon="🛍️" label={getMenu('shopProducts')} />
                    <NavItem to="/admin/shop-product-requests" icon="📥" label={getMenu('shopProductRequests')} />
                    <NavItem to="/admin/shop-inquiries" icon="📩" label={getMenu('shopInquiries')} />
                    <NavItem to="/admin/shop-plans" icon="💎" label={getMenu('shopPlans')} />
                    <NavItem to="/admin/shop-faqs" icon="❓" label={getMenu('shopFaq')} />
                    <NavItem to="/admin/shop-announcements" icon="📢" label={getMenu('shopAnnouncements')} />
                    <NavItem to="/admin/shop-commissions" icon="💸" label={getMenu('shopCommissions')} />
                    <NavItem to="/admin/shop-settings" icon="⚙️" label={getMenu('shopSettings')} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('amazon')}</div>
                    <NavItem to="/admin/amazon" icon="💰" label={getMenu('amazonDashboard')} />
                    <NavItem to="/admin/amazon/products" icon="📦" label={getMenu('amazonProducts')} />
                    <NavItem to="/admin/amazon/add" icon="➕" label={getMenu('amazonAdd')} />
                    <NavItem to="/admin/amazon/settings" icon="⚙️" label={getMenu('amazonSettings')} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('settings')}</div>
                    <NavItem to="/admin/config" icon="⚙️" label={getMenu('globalSettings')} />
                    <NavItem to="/admin/translations" icon="🌍" label={getMenu('translations')} />
                    <NavItem to="/admin/help" icon="❓" label={getMenu('helpGuide')} description={menuDescriptions.helpGuide} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{getLabel('community')}</div>
                    <NavItem to="/admin/forum" icon="🎮" label={getMenu('forumSettings')} />
                    <NavItem to="/admin/forum-categories" icon="📂" label={getMenu('forumCategories')} />
                    <NavItem to="/admin/avatars" icon="🎨" label={getMenu('avatars')} />
                    <NavItem to="/admin/forum-ghosts" icon="👻" label={getMenu('ghostMode')} />
                    <NavItem to="/admin/forum-bots" icon="🤖" label={getMenu('botManagement')} />
                    <NavItem to="/admin/forum-moderation" icon="🛡️" label={getMenu('moderation')} />
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <span className="icon">🚪</span>
                        {getMenu('logout')}
                    </button>
                    <a href="/" className="back-to-site">
                        ← {getMenu('backToSite')}
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-topbar">
                    <div className="admin-breadcrumbs">
                        <span className="breadcrumb-home">🏠 {dictionary?.adminPanel?.topbar?.admin?.[language] || 'Admin'}</span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current">{getCurrentPageTitle()}</span>
                    </div>
                    <div className="admin-user-menu">
                        <LanguageSwitcher />
                        <span className="admin-time">
                            🕐 {currentTime.toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="admin-user-info">
                            👤 {user?.email?.split('@')[0] || 'Admin'}
                        </span>
                    </div>
                </header>
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

