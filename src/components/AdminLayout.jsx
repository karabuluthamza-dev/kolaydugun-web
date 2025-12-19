import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dictionary } from '../locales/dictionary';
import LanguageSwitcher from './LanguageSwitcher';
import './AdminLayout.css';

// Her modül için açıklama metinleri
const menuDescriptions = dictionary.adminPanel.sidebar.menuDescriptions;

// Sayfa başlıkları
const pageTitles = dictionary.adminPanel.sidebar.pageTitles;

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

    const strings = dictionary.adminPanel.sidebar;

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
                    <span className="admin-badge">{dictionary.adminPanel.badge[language]}</span>
                </div>

                <nav className="admin-nav">
                    <NavItem to="/admin" icon="📊" label={strings.menu.dashboard[language]} end={true} description={menuDescriptions.dashboard} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.daily[language]}</div>
                    <NavItem to="/admin/leads" icon="📨" label={strings.menu.leads[language]} />
                    <NavItem to="/admin/credit-approval" icon="✅" label={strings.menu.creditApproval[language]} />
                    <NavItem to="/admin/reviews" icon="⭐" label={strings.menu.reviews[language]} />
                    <NavItem to="/admin/messaging" icon="🆘" label={strings.menu.support[language]} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.marketplace[language]}</div>
                    <NavItem to="/admin/vendors" icon="🏪" label={strings.menu.vendors[language]} description={menuDescriptions.vendors} />
                    <NavItem to="/admin/users" icon="👥" label={strings.menu.users[language]} description={menuDescriptions.users} />
                    <NavItem to="/admin/categories" icon="🖼️" label={strings.menu.categories[language]} />
                    <NavItem to="/admin/messages" icon="💬" label={strings.menu.messages[language]} />
                    <NavItem to="/admin/claims" icon="🛡️" label={strings.menu.claims[language]} description={menuDescriptions.claims} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.content[language]}</div>
                    <NavItem to="/admin/blog" icon="📝" label={strings.menu.blog[language]} />
                    <NavItem to="/admin/comments" icon="💬" label={strings.menu.blogComments[language]} />
                    <NavItem to="/admin/pages" icon="📄" label={strings.menu.pages[language]} />
                    <NavItem to="/admin/faq" icon="❓" label={strings.menu.faq[language]} />
                    <NavItem to="/admin/notifications" icon="📢" label={strings.menu.notifications[language]} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.finance[language]}</div>
                    <NavItem to="/admin/pricing" icon="💰" label={strings.menu.pricing[language]} />
                    <NavItem to="/admin/finance" icon="📊" label={strings.menu.finance[language]} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.shop[language]}</div>
                    <NavItem to="/admin/shop-applications" icon="📋" label={strings.menu.shopApplications[language]} />
                    <NavItem to="/admin/shop-accounts" icon="🏪" label={strings.menu.shopAccounts[language]} />
                    <NavItem to="/admin/shop-categories" icon="🏷️" label={strings.menu.shopCategories[language]} />
                    <NavItem to="/admin/shop-products" icon="🛍️" label={strings.menu.shopProducts[language]} />
                    <NavItem to="/admin/shop-product-requests" icon="📥" label={strings.menu.shopProductRequests[language]} />
                    <NavItem to="/admin/shop-inquiries" icon="📩" label={strings.menu.shopInquiries[language]} />
                    <NavItem to="/admin/shop-plans" icon="💎" label={strings.menu.shopPlans[language]} />
                    <NavItem to="/admin/shop-faqs" icon="❓" label={strings.menu.shopFaq[language]} />
                    <NavItem to="/admin/shop-announcements" icon="📢" label={strings.menu.shopAnnouncements[language]} />
                    <NavItem to="/admin/shop-commissions" icon="💸" label={strings.menu.shopCommissions[language]} />
                    <NavItem to="/admin/shop-settings" icon="⚙️" label={strings.menu.shopSettings[language]} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.amazon[language]}</div>
                    <NavItem to="/admin/amazon" icon="💰" label={strings.menu.amazonDashboard[language]} />
                    <NavItem to="/admin/amazon/products" icon="📦" label={strings.menu.amazonProducts[language]} />
                    <NavItem to="/admin/amazon/add" icon="➕" label={strings.menu.amazonAdd[language]} />
                    <NavItem to="/admin/amazon/settings" icon="⚙️" label={strings.menu.amazonSettings[language]} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.settings[language]}</div>
                    <NavItem to="/admin/config" icon="⚙️" label={strings.menu.globalSettings[language]} />
                    <NavItem to="/admin/translations" icon="🌍" label={strings.menu.translations[language]} />
                    <NavItem to="/admin/help" icon="❓" label={strings.menu.helpGuide[language]} description={menuDescriptions.helpGuide} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">{strings.labels.community[language]}</div>
                    <NavItem to="/admin/forum" icon="🎮" label={strings.menu.forumSettings[language]} />
                    <NavItem to="/admin/forum-categories" icon="📂" label={strings.menu.forumCategories[language]} />
                    <NavItem to="/admin/avatars" icon="🎨" label={strings.menu.avatars[language]} />
                    <NavItem to="/admin/forum-ghosts" icon="👻" label={strings.menu.ghostMode[language]} />
                    <NavItem to="/admin/forum-bots" icon="🤖" label={strings.menu.botManagement[language]} />
                    <NavItem to="/admin/forum-moderation" icon="🛡️" label={strings.menu.moderation[language]} />
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <span className="icon">🚪</span>
                        {strings.menu.logout[language]}
                    </button>
                    <a href="/" className="back-to-site">
                        ← {strings.menu.backToSite[language]}
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-topbar">
                    <div className="admin-breadcrumbs">
                        <span className="breadcrumb-home">🏠 {dictionary.adminPanel.topbar.admin[language]}</span>
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

