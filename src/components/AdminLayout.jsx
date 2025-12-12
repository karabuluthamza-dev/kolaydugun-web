import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

// Her modül için açıklama metinleri
const menuDescriptions = {
    '/admin': 'Genel istatistikler ve hızlı erişim kartları. Tüm paneli buradan yönetin.',
    '/admin/translations': 'Site içeriklerinin Türkçe, Almanca ve İngilizce çevirilerini yönetin.',
    '/admin/blog': 'Blog yazıları oluşturun, düzenleyin ve yayınlayın. SEO ayarlarını yapın.',
    '/admin/comments': 'Blog yazılarına gelen yorumları onaylayın, düzenleyin veya silin.',
    '/admin/pages': 'Hakkımızda, Gizlilik Politikası gibi statik sayfaları düzenleyin.',
    '/admin/faq': 'Sıkça Sorulan Sorular bölümünü güncelleyin.',
    '/admin/notifications': 'Kullanıcılara ve tedarikçilere toplu bildirim gönderin.',
    '/admin/categories': 'Tedarikçi kategorilerini (DJ, Fotoğrafçı, Mekan vb.) yönetin.',
    '/admin/vendors': 'Tüm tedarikçileri görüntüleyin, profillerini düzenleyin ve onaylayın.',
    '/admin/leads': 'Çiftlerden gelen teklif taleplerini görüntüleyin ve yönetin.',
    '/admin/users': 'Kayıtlı kullanıcıları (çiftler) görüntüleyin ve hesaplarını yönetin.',
    '/admin/reviews': 'Tedarikçilere yapılan değerlendirmeleri onaylayın veya reddedin.',
    '/admin/credit-approval': 'Tedarikçilerin kredi satın alma taleplerini onaylayın.',
    '/admin/config': 'Site ayarları, logo, sosyal medya linkleri ve genel konfigürasyonlar.',
    '/admin/pricing': 'Kredi paketleri ve fiyatlandırma seçeneklerini düzenleyin.',
    '/admin/finance': 'Gelir raporları, ödeme geçmişi ve finansal istatistikler.',
    '/admin/messaging': 'Kullanıcılardan gelen destek taleplerini yanıtlayın.',
    '/admin/messages': 'Platform içi mesajlaşma - tedarikçi ve çift arasındaki iletişim.',
    '/admin/forum': 'Forum genel ayarları - kurallar, açıklama ve temel yapılandırma.',
    '/admin/avatars': 'Kullanıcıların seçebileceği varsayılan avatar koleksiyonunu yönetin.',
    '/admin/forum-categories': 'Forum kategorilerini (Mekan Tavsiyeleri, Düğün Hikayeleri vb.) yönetin.',
    '/admin/forum-ghosts': 'Hayalet kullanıcılar - foruma gerçekçi görünüm katmak için sahte hesaplar.',
    '/admin/forum-bots': 'Bot kullanıcılar oluşturun, konu açtırın ve yorum yaptırın.',
    '/admin/forum-moderation': 'Forum içeriklerini denetleyin, şikayetleri yönetin, kullanıcıları yasaklayın.'
};

// Sayfa başlıkları
const pageTitles = {
    '/admin': 'Başlangıç',
    '/admin/leads': 'Talepler',
    '/admin/credit-approval': 'Kredi Onayları',
    '/admin/reviews': 'Yorumlar',
    '/admin/messaging': 'Destek Hattı',
    '/admin/vendors': 'Tedarikçiler',
    '/admin/users': 'Kullanıcılar',
    '/admin/categories': 'Kategoriler',
    '/admin/messages': 'Platform Mesajları',
    '/admin/blog': 'Blog',
    '/admin/comments': 'Blog Yorumları',
    '/admin/pages': 'Sayfalar',
    '/admin/faq': 'S.S.S.',
    '/admin/notifications': 'Bildirimler',
    '/admin/pricing': 'Fiyatlandırma',
    '/admin/finance': 'Finans',
    '/admin/config': 'Genel Ayarlar',
    '/admin/translations': 'Çeviriler',
    '/admin/forum': 'Forum Ayarları',
    '/admin/forum-categories': 'Forum Kategorileri',
    '/admin/avatars': 'Avatarlar',
    '/admin/forum-ghosts': 'Hayalet Modu',
    '/admin/forum-bots': 'Bot Yönetimi',
    '/admin/forum-moderation': 'Moderasyon',
    '/admin/analytics': 'Analitikler'
};

// NavItem komponenti - tooltip ile
const NavItem = ({ to, icon, label, end = false }) => {
    const description = menuDescriptions[to] || '';

    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            title={description}
        >
            <span className="icon">{icon}</span>
            <span className="nav-label">{label}</span>
            {description && <span className="nav-tooltip">{description}</span>}
        </NavLink>
    );
};

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());

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
        return pageTitles[path] || 'Yönetim Paneli';
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>KolayDugun</h2>
                    <span className="admin-badge">Yönetim</span>
                </div>

                <nav className="admin-nav">
                    <NavItem to="/admin" icon="📊" label="Başlangıç" end={true} />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">Günlük İşler</div>
                    <NavItem to="/admin/leads" icon="📨" label="Talepler" />
                    <NavItem to="/admin/credit-approval" icon="✅" label="Kredi Onayları" />
                    <NavItem to="/admin/reviews" icon="⭐" label="Yorumlar" />
                    <NavItem to="/admin/messaging" icon="🆘" label="Destek Hattı" />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">Pazaryeri</div>
                    <NavItem to="/admin/vendors" icon="🏪" label="Tedarikçiler" />
                    <NavItem to="/admin/users" icon="👥" label="Kullanıcılar" />
                    <NavItem to="/admin/categories" icon="🖼️" label="Kategoriler" />
                    <NavItem to="/admin/messages" icon="💬" label="Platform Mesajları" />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">İçerik</div>
                    <NavItem to="/admin/blog" icon="📝" label="Blog" />
                    <NavItem to="/admin/comments" icon="💬" label="Blog Yorumları" />
                    <NavItem to="/admin/pages" icon="📄" label="Sayfalar" />
                    <NavItem to="/admin/faq" icon="❓" label="S.S.S." />
                    <NavItem to="/admin/notifications" icon="📢" label="Bildirimler" />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">Finans</div>
                    <NavItem to="/admin/pricing" icon="💰" label="Fiyatlandırma" />
                    <NavItem to="/admin/finance" icon="📊" label="Finans" />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">Ayarlar</div>
                    <NavItem to="/admin/config" icon="⚙️" label="Genel Ayarlar" />
                    <NavItem to="/admin/translations" icon="🌍" label="Çeviriler" />

                    <div className="admin-nav-divider"></div>
                    <div className="admin-nav-label">Topluluk</div>
                    <NavItem to="/admin/forum" icon="🎮" label="Forum Ayarları" />
                    <NavItem to="/admin/forum-categories" icon="📂" label="Forum Kategorileri" />
                    <NavItem to="/admin/avatars" icon="🎨" label="Avatarlar" />
                    <NavItem to="/admin/forum-ghosts" icon="👻" label="Hayalet Modu" />
                    <NavItem to="/admin/forum-bots" icon="🤖" label="Bot Yönetimi" />
                    <NavItem to="/admin/forum-moderation" icon="🛡️" label="Moderasyon" />
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <span className="icon">🚪</span>
                        Çıkış Yap
                    </button>
                    <a href="/" className="back-to-site">
                        ← Siteye Dön
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-topbar">
                    <div className="admin-breadcrumbs">
                        <span className="breadcrumb-home">🏠 Admin</span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current">{getCurrentPageTitle()}</span>
                    </div>
                    <div className="admin-user-menu">
                        <span className="admin-time">
                            🕐 {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
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

