import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext'; // Added useLanguage import
import RevenueChart from '../components/Charts/RevenueChart';
import LeadsChart from '../components/Charts/LeadsChart';
import VendorGrowthChart from '../components/Charts/VendorGrowthChart';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage(); // Added useLanguage hook
    usePageTitle(t('adminPanel.dashboard.pageTitle', 'Admin Dashboard')); // Updated page title
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalVendors: 0,
        proVendors: 0,
        totalLeads: 0,
        wonLeads: 0,
        newLeads: 0,
        conversionRate: 0,
        pendingCreditRequests: 0,
        totalRevenue: 0,
        todayLeads: 0,
        pendingCommissions: 0,
        activeAffiliates: 0,
        totalPosts: 0, // Added for blog posts
        publishedPosts: 0 // Added for blog posts
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState({
        revenue: [],
        leads: [],
        vendorGrowth: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Try to load from cache first
            const cachedStats = sessionStorage.getItem('admin_dashboard_stats');
            const cachedActivity = sessionStorage.getItem('admin_dashboard_activity');
            const cacheTime = sessionStorage.getItem('admin_dashboard_cache_time');

            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (cachedStats && cachedActivity && cacheTime && (now - parseInt(cacheTime) < fiveMinutes)) {
                setStats(JSON.parse(cachedStats));
                setRecentActivity(JSON.parse(cachedActivity));
                setLoading(false);
                // Still fetch in background to keep it fresh
                fetchStats(false);
            } else {
                fetchStats(true);
            }
        }
    }, [user]);

    const fetchStats = async (showLoader = true) => {
        if (showLoader) setLoading(true);

        // Total vendors (excluding soft-deleted)
        const { count: vendorCount } = await supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        // Premium/Basic vendors (not free, excluding soft-deleted)
        const { count: premiumCount } = await supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true })
            .in('subscription_tier', ['premium', 'basic'])
            .is('deleted_at', null);

        // Total leads
        const { count: leadCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true });

        // Won leads
        const { count: wonCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'won');

        // New leads
        const { count: newCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new');

        // Today's leads
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);

        // Pending credit requests
        const { count: pendingCount } = await supabase
            .from('credit_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Total revenue (from transactions)
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .in('type', ['credit_purchase', 'pro_subscription']);

        const totalRevenue = transactions?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;

        // Blog Posts
        const { count: postCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        const { count: publishedPostCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published');

        // Recent Activity (Last 5 leads)
        const { data: recentLeads } = await supabase
            .from('leads')
            .select('id, contact_name, status, created_at, category:categories(name)')
            .order('created_at', { ascending: false })
            .limit(5);

        // Recent Couple-Vendor Messages (Last 5)
        const { data: recentCoupleVendorMessages } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                created_at,
                read_at,
                sender_id,
                receiver_id,
                lead:lead_id(contact_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        // Recent Reviews (Last 5)
        const { data: recentReviews } = await supabase
            .from('reviews')
            .select(`
                id, 
                rating, 
                comment, 
                created_at, 
                is_approved,
                profiles:user_id (full_name, email),
                vendors:vendor_id (business_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        // Recent Credit Requests (Last 5)
        const { data: recentCreditRequests } = await supabase
            .from('credit_requests')
            .select(`
                id,
                amount,
                status,
                created_at,
                vendors:vendor_id (business_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        // Recent Registrations (Last 5)
        const { data: recentRegistrations } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        // Affiliate Statistics
        const { data: affiliateEarnings } = await supabase
            .from('shop_affiliate_earnings')
            .select('commission_amount, status, earning_shop_id');

        const pendingCommissions = affiliateEarnings
            ?.filter(e => e.status === 'pending' || e.status === 'approved')
            .reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0) || 0;

        const activeAffiliates = new Set(affiliateEarnings?.map(e => e.earning_shop_id)).size;

        // Recent Transactions (Last 5)
        const { data: recentTransactions } = await supabase
            .from('transactions')
            .select(`
                id,
                amount,
                type,
                status,
                created_at,
                user_id,
                vendors (business_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        // Combine and sort all activities
        const combinedActivity = [
            ...(recentLeads || []).map(l => ({ ...l, type: 'lead' })),
            ...(recentCoupleVendorMessages || []).map(m => ({ ...m, type: 'couple_vendor_message' })),
            ...(recentReviews || []).map(r => ({ ...r, type: 'review' })),
            ...(recentCreditRequests || []).map(cr => ({ ...cr, type: 'credit_request' })),
            ...(recentRegistrations || []).map(reg => ({ ...reg, type: 'registration' })),
            ...(recentTransactions || []).map(t => ({ ...t, type: 'transaction' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 15); // Show top 15 most recent activities

        setRecentActivity(combinedActivity);

        // Update Cache
        sessionStorage.setItem('admin_dashboard_stats', JSON.stringify({
            totalVendors: vendorCount || 0,
            proVendors: premiumCount || 0,
            totalLeads: leadCount || 0,
            wonLeads: wonCount || 0,
            newLeads: newCount || 0,
            conversionRate: leadCount > 0 ? ((wonCount || 0) / leadCount * 100).toFixed(1) : 0,
            todayLeads: todayCount || 0,
            pendingCreditRequests: pendingCount || 0,
            totalRevenue: totalRevenue,
            totalPosts: postCount || 0,
            publishedPosts: publishedPostCount || 0,
            pendingCommissions: pendingCommissions,
            activeAffiliates: activeAffiliates
        }));
        sessionStorage.setItem('admin_dashboard_activity', JSON.stringify(combinedActivity));
        sessionStorage.setItem('admin_dashboard_cache_time', Date.now().toString());

        // Update local state (incase it was a background refresh)
        setStats({
            totalVendors: vendorCount || 0,
            proVendors: premiumCount || 0,
            totalLeads: leadCount || 0,
            wonLeads: wonCount || 0,
            newLeads: newCount || 0,
            conversionRate: leadCount > 0 ? ((wonCount || 0) / leadCount * 100).toFixed(1) : 0,
            todayLeads: todayCount || 0,
            pendingCreditRequests: pendingCount || 0,
            totalRevenue: totalRevenue,
            totalPosts: postCount || 0,
            publishedPosts: publishedPostCount || 0,
            pendingCommissions: pendingCommissions,
            activeAffiliates: activeAffiliates
        });

        // Fetch chart data
        await fetchChartData();

        setLoading(false);
    };

    const fetchChartData = async () => {
        try {
            // Revenue Chart Data (Last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount, created_at')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .in('status', ['completed', 'success']);

            // Group by date
            const revenueByDate = {};
            transactions?.forEach(t => {
                const date = new Date(t.created_at).toLocaleDateString(language, { month: 'short', day: 'numeric' });
                revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(t.amount || 0);
            });

            const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({
                date,
                revenue: parseFloat(revenue.toFixed(2))
            }));

            // Leads Chart Data (Last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: leads } = await supabase
                .from('leads')
                .select('status, created_at')
                .gte('created_at', sevenDaysAgo.toISOString());

            // Group by date and status
            const leadsByDate = {};
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString(language, { month: 'short', day: 'numeric' });
                leadsByDate[dateStr] = { date: dateStr, new: 0, won: 0, lost: 0 };
            }

            leads?.forEach(l => {
                const date = new Date(l.created_at).toLocaleDateString(language, { month: 'short', day: 'numeric' });
                if (leadsByDate[date]) {
                    if (l.status === 'new') leadsByDate[date].new++;
                    else if (l.status === 'won') leadsByDate[date].won++;
                    else if (l.status === 'lost') leadsByDate[date].lost++;
                }
            });

            const leadsData = Object.values(leadsByDate);

            // Vendor Growth Chart Data (Last 3 months)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const { data: vendors } = await supabase
                .from('vendors')
                .select('created_at')
                .gte('created_at', threeMonthsAgo.toISOString());

            // Group by month
            const vendorsByMonth = {};
            for (let i = 2; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthStr = date.toLocaleDateString(language, { month: 'short' });
                vendorsByMonth[monthStr] = { month: monthStr, total: 0 };
            }

            let cumulativeCount = 0;
            vendors?.forEach(v => {
                const month = new Date(v.created_at).toLocaleDateString(language, { month: 'short' });
                if (vendorsByMonth[month]) {
                    cumulativeCount++;
                    vendorsByMonth[month].total = cumulativeCount;
                }
            });

            const vendorGrowthData = Object.values(vendorsByMonth);

            setChartData({
                revenue: revenueData,
                leads: leadsData,
                vendorGrowth: vendorGrowthData
            });
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container admin-dashboard-container">
            <div className="admin-dashboard-header">
                <h1>👋 {t('adminPanel.dashboard.welcome', 'Hoş Geldiniz!')}</h1>
                <p>
                    {new Date().toLocaleDateString(language, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })} • {t('adminPanel.dashboard.subtitle', 'KolayDugun Yönetim Paneli')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.totalVendors', 'Toplam Vendor')}</div>
                        <div className="stat-value">{stats.totalVendors}</div>
                        <div className="stat-trend neutral">
                            {stats.proVendors} {t('adminPanel.dashboard.stats.proVendors', 'Premium/Basic')}
                        </div>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.totalLeads', 'Toplam Lead')}</div>
                        <div className="stat-value">{stats.totalLeads}</div>
                        <div className="stat-trend neutral">
                            {t('adminPanel.dashboard.stats.todayLeads', 'Bugün')}: {stats.todayLeads}
                        </div>
                    </div>
                </div>

                <div className="stat-card info" style={{ borderLeft: '4px solid #2e7d32' }}>
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.wonLeads', 'Kazanılan İşler')}</div>
                        <div className="stat-value">{stats.wonLeads}</div>
                        <div className="stat-trend neutral">
                            {t('adminPanel.dashboard.stats.conversionRate', 'Dönüşüm')}: %{stats.conversionRate}
                        </div>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.pendingLeads', 'Bekleyen İşler')}</div>
                        <div className="stat-value">{stats.pendingCreditRequests}</div>
                        <div className="stat-trend neutral">
                            {stats.newLeads} {t('adminPanel.dashboard.stats.newLeads', 'Yeni Lead')}
                        </div>
                    </div>
                </div>

                <div className="stat-card revenue">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.totalRevenue', 'Toplam Gelir')}</div>
                        <div className="stat-value">€{stats.totalRevenue.toFixed(2)}</div>
                        <div className="stat-trend neutral">
                            {t('adminPanel.dashboard.stats.allTime', 'Tüm zamanlar')}
                        </div>
                    </div>
                </div>

                <div className="stat-card info" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.blogPosts', 'Blog Yazıları')}</div>
                        <div className="stat-value">{stats.totalPosts || 0}</div>
                        <div className="stat-trend neutral">
                            {stats.publishedPosts || 0} {t('adminPanel.dashboard.stats.published', 'Yayında')}
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #FF6B9D', background: 'linear-gradient(135deg, #fff5f8 0%, #ffe8ef 100%)' }} onClick={() => navigate('/admin/shop-commissions')}>
                    <div className="stat-icon">🤝</div>
                    <div className="stat-content">
                        <div className="stat-label">{t('adminPanel.dashboard.stats.affiliate', 'Affiliate')}</div>
                        <div className="stat-value">€{stats.pendingCommissions?.toFixed(2) || '0.00'}</div>
                        <div className="stat-trend neutral">
                            {stats.activeAffiliates || 0} {t('adminPanel.dashboard.stats.activeReferrers', 'Aktif Referrer')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <RevenueChart data={chartData.revenue} />
                <LeadsChart data={chartData.leads} />
                <VendorGrowthChart data={chartData.vendorGrowth} />
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section" style={{ marginTop: '2rem' }}>
                <h2>{t('adminPanel.dashboard.recentActivity.title', 'Son Aktiviteler')}</h2>
                {recentActivity.length > 0 ? (
                    <div className="activity-list" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {recentActivity.map(item => {
                            // Determine icon, title, description, and navigation based on type
                            let icon, title, description, navPath, statusBadge;

                            switch (item.type) {
                                case 'lead':
                                    icon = '📋';
                                    title = `${t('adminPanel.dashboard.recentActivity.types.lead', 'Yeni Lead')}: ${item.contact_name}`;
                                    description = item.category?.name || t('adminPanel.dashboard.recentActivity.noCategory', 'Kategori Yok');
                                    navPath = '/admin/leads';
                                    statusBadge = item.status === 'won' ? t('adminPanel.dashboard.recentActivity.won', 'Kazanıldı') : item.status === 'lost' ? t('adminPanel.dashboard.recentActivity.lost', 'Kaybedildi') : item.status === 'new' ? t('adminPanel.dashboard.recentActivity.new', 'Yeni') : item.status;

                                    break;

                                case 'couple_vendor_message':
                                    icon = '💬';
                                    title = t('adminPanel.dashboard.recentActivity.newMessage', 'Yeni Mesaj');
                                    description = item.lead?.contact_name ? `${t('adminPanel.dashboard.recentActivity.request', 'Talep')}: ${item.lead.contact_name}` : (item.content || '').substring(0, 50) + '...';
                                    navPath = '/admin/messages';
                                    statusBadge = item.read_at ? t('adminPanel.dashboard.recentActivity.read', 'Okundu') : t('adminPanel.dashboard.recentActivity.unread', 'Okunmadı');
                                    break;

                                case 'review':
                                    icon = item.rating >= 4 ? '⭐' : item.rating >= 3 ? '🌟' : '⚠️';
                                    title = `${t('adminPanel.dashboard.recentActivity.newReview', 'Yeni Yorum')}: ${item.vendors?.business_name || t('adminPanel.dashboard.recentActivity.vendor', 'Vendor')}`;
                                    description = `${item.rating} ${t('adminPanel.dashboard.recentActivity.stars', 'yıldız')} - ${item.profiles?.full_name || item.profiles?.email || t('adminPanel.dashboard.recentActivity.anonymous', 'Anonim')}`;
                                    navPath = '/admin/reviews';
                                    statusBadge = item.is_approved ? t('adminPanel.dashboard.recentActivity.approved', 'Onaylandı') : t('adminPanel.dashboard.recentActivity.pending', 'Bekliyor');
                                    break;

                                case 'credit_request':
                                    icon = '💳';
                                    title = `${t('adminPanel.dashboard.recentActivity.creditRequest', 'Kredi Talebi')}: ${item.vendors?.business_name || t('adminPanel.dashboard.recentActivity.vendor', 'Vendor')}`;
                                    description = `${item.amount} ${t('adminPanel.dashboard.recentActivity.creditRequestAmount', 'kredi talebi')}`;
                                    navPath = '/admin/credit-approval';
                                    statusBadge = item.status === 'approved' ? t('adminPanel.dashboard.recentActivity.approved', 'Onaylandı') : item.status === 'rejected' ? t('adminPanel.dashboard.recentActivity.rejected', 'Reddedildi') : t('adminPanel.dashboard.recentActivity.pending', 'Bekliyor');
                                    break;

                                case 'registration':
                                    icon = item.role === 'vendor' ? '🏪' : '👥';
                                    title = `${t('adminPanel.dashboard.recentActivity.newRegistration', 'Yeni Kayıt')}: ${item.full_name || item.email}`;
                                    description = item.role === 'vendor' ? t('adminPanel.dashboard.recentActivity.vendorRegistration', 'Vendor Kaydı') : item.role === 'couple' ? t('adminPanel.dashboard.recentActivity.coupleRegistration', 'Çift Kaydı') : t('adminPanel.dashboard.recentActivity.userRegistration', 'Kullanıcı Kaydı');
                                    navPath = item.role === 'vendor' ? '/admin/vendors' : '/admin/users';
                                    statusBadge = t('adminPanel.dashboard.recentActivity.new', 'Yeni');
                                    break;

                                case 'transaction':
                                    icon = '💰';
                                    title = `${t('adminPanel.dashboard.recentActivity.transaction', 'İşlem')}: ${item.vendors?.business_name || t('adminPanel.dashboard.recentActivity.vendor', 'Vendor')}`;
                                    description = `€${item.amount} - ${item.type === 'credit_purchase' ? t('adminPanel.dashboard.recentActivity.creditPurchase', 'Kredi Alımı') : item.type === 'pro_subscription' ? t('adminPanel.dashboard.recentActivity.proSubscription', 'Pro Abonelik') : item.type}`;
                                    navPath = '/admin/credit-approval';
                                    statusBadge = item.status === 'completed' ? t('adminPanel.dashboard.recentActivity.completed', 'Tamamlandı') : item.status === 'pending' ? t('adminPanel.dashboard.recentActivity.pending', 'Bekliyor') : item.status;
                                    break;

                                default:
                                    icon = '📌';
                                    title = t('adminPanel.dashboard.recentActivity.activity', 'Aktivite');
                                    description = '';
                                    navPath = '/admin';
                                    statusBadge = '';
                            }

                            // Determine badge color
                            let badgeColor = '#e3f2fd';
                            let badgeTextColor = '#1976d2';

                            if (item.type === 'lead') {
                                if (item.status === 'won') { badgeColor = '#e8f5e9'; badgeTextColor = '#2e7d32'; }
                                else if (item.status === 'lost') { badgeColor = '#ffebee'; badgeTextColor = '#c62828'; }
                            } else if (item.type === 'couple_vendor_message') {
                                if (item.read_at) { badgeColor = '#e8f5e9'; badgeTextColor = '#2e7d32'; }
                                else { badgeColor = '#fff3e0'; badgeTextColor = '#ef6c00'; }
                            } else if (item.type === 'review') {
                                if (item.is_approved) { badgeColor = '#e8f5e9'; badgeTextColor = '#2e7d32'; }
                                else { badgeColor = '#fff3e0'; badgeTextColor = '#ef6c00'; }
                            } else if (item.type === 'credit_request') {
                                if (item.status === 'approved') { badgeColor = '#e8f5e9'; badgeTextColor = '#2e7d32'; }
                                else if (item.status === 'rejected') { badgeColor = '#ffebee'; badgeTextColor = '#c62828'; }
                                else { badgeColor = '#fff3e0'; badgeTextColor = '#ef6c00'; }
                            } else if (item.type === 'transaction') {
                                if (item.status === 'completed') { badgeColor = '#e8f5e9'; badgeTextColor = '#2e7d32'; }
                            }

                            return (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className="activity-item"
                                    onClick={() => navigate(navPath)}
                                    style={{ cursor: 'pointer', padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ marginRight: '15px', fontSize: '1.2rem', width: '30px', textAlign: 'center' }}>
                                            {icon}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 'bold', display: 'block' }}>{title}</span>
                                            <span style={{ color: '#666', fontSize: '0.85rem' }}>
                                                {description}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className={`status-badge ${item.status || 'new'}`} style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            backgroundColor: badgeColor,
                                            color: badgeTextColor
                                        }}>
                                            {statusBadge}
                                        </span>
                                        <small style={{ color: '#999' }}>
                                            {new Date(item.created_at).toLocaleDateString(language)}
                                        </small>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="activity-placeholder">
                        <p>{t('adminPanel.dashboard.recentActivity.noActivity', 'Henüz aktivite yok.')}</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>{t('adminPanel.dashboard.quickActions.title', 'Hızlı Erişim')}</h2>
                <div className="quick-actions-grid">
                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/credit-approval')}
                    >
                        <div className="action-icon">✅</div>
                        <h3>{t('adminPanel.dashboard.quickActions.creditApproval', 'Kredi Onayları')}</h3>
                        <p>{stats.pendingCreditRequests} {t('common.pendingTask' || 'bekleyen talep')}</p>

                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/vendors')}
                    >
                        <div className="action-icon">🏪</div>
                        <h3>{t('adminPanel.dashboard.quickActions.vendorManagement', 'Vendor Yönetimi')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.viewAllVendors', "Tüm vendor'ları görüntüle")}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/leads')}
                    >
                        <div className="action-icon">📨</div>
                        <h3>{t('adminPanel.dashboard.quickActions.leadManagement', 'Lead Yönetimi')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.viewAllLeads', "Tüm lead'leri görüntüle")}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/transactions')}
                    >
                        <div className="action-icon">💳</div>
                        <h3>{t('adminPanel.dashboard.quickActions.transactions', 'İşlemler')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.transactionHistory', 'Transaction geçmişi')}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/config')}
                    >
                        <div className="action-icon">⚙️</div>
                        <h3>{t('adminPanel.dashboard.quickActions.settings', 'Ayarlar')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.systemConfig', 'Sistem konfigürasyonu')}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/analytics')}
                    >
                        <div className="action-icon">📊</div>
                        <h3>{t('adminPanel.dashboard.quickActions.analytics', 'Analitikler')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.detailedReports', 'Detaylı raporlar')}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/categories')}
                    >
                        <div className="action-icon">🏷️</div>
                        <h3>{t('adminPanel.dashboard.quickActions.categoryFeatures', 'Kategori Özellikleri')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.manageCustomFields', 'Özel alanları yönet')}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/popular-cities')}
                    >
                        <div className="action-icon">⭐</div>
                        <h3>{t('adminPanel.dashboard.quickActions.popularCities', 'Popüler Şehirler')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.manageHomepageCities', 'Ana sayfa şehir dropdown\'ını yönet')}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/messages')}
                    >
                        <div className="action-icon">💬</div>
                        <h3>{t('adminPanel.dashboard.quickActions.messages', 'Mesajlar')}</h3>
                        <p>{t('adminPanel.dashboard.quickActions.contactFormMessages', 'İletişim formu mesajları')}</p>
                    </button>

                    <button
                        className="action-card"
                        onClick={() => navigate('/admin/live-requests')}
                        style={{ borderLeft: '4px solid #f43f5e', background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' }}
                    >
                        <div className="action-icon">🔥</div>
                        <h3>Canlı İstek Monitörü</h3>
                        <p>Tüm canlı etkinlikleri ve bahşişleri izle</p>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}

        </div>
    );
};

export default AdminDashboard;
