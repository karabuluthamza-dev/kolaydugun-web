import React, { useState, useEffect } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerAnalytics = () => {
    const { shopAccount, hasFeature } = useShopOwner();
    const { language } = useLanguage();
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // 7, 30, 90 days
    const [totals, setTotals] = useState({
        pageViews: 0,
        productViews: 0,
        contactClicks: 0,
        whatsappClicks: 0,
        phoneClicks: 0,
        shareClicks: 0
    });

    const texts = {
        tr: {
            title: 'İstatistikler',
            subtitle: 'Mağazanızın performansını takip edin',
            pageViews: 'Sayfa Görüntüleme',
            productViews: 'Ürün Görüntüleme',
            contactClicks: 'İletişim Tıklaması',
            whatsappClicks: 'WhatsApp Tıklaması',
            phoneClicks: 'Telefon Tıklaması',
            shareClicks: 'Paylaşım',
            last7Days: 'Son 7 Gün',
            last30Days: 'Son 30 Gün',
            last90Days: 'Son 90 Gün',
            noData: 'Henüz veri yok',
            upgradeTitle: 'İstatistik Özelliği',
            upgradeDesc: 'Detaylı istatistiklere erişmek için planınızı yükseltin',
            upgradePlan: 'Plan Yükselt',
            date: 'Tarih',
            totalViews: 'Toplam Görüntüleme',
            conversionRate: 'Dönüşüm Oranı'
        },
        de: {
            title: 'Statistiken',
            subtitle: 'Verfolgen Sie die Leistung Ihres Shops',
            pageViews: 'Seitenaufrufe',
            productViews: 'Produktansichten',
            contactClicks: 'Kontaktklicks',
            whatsappClicks: 'WhatsApp-Klicks',
            phoneClicks: 'Telefonklicks',
            shareClicks: 'Geteilt',
            last7Days: 'Letzte 7 Tage',
            last30Days: 'Letzte 30 Tage',
            last90Days: 'Letzte 90 Tage',
            noData: 'Noch keine Daten',
            upgradeTitle: 'Statistik-Funktion',
            upgradeDesc: 'Upgraden Sie Ihren Plan für detaillierte Statistiken',
            upgradePlan: 'Plan upgraden',
            date: 'Datum',
            totalViews: 'Gesamtansichten',
            conversionRate: 'Conversion-Rate'
        },
        en: {
            title: 'Analytics',
            subtitle: 'Track your shop performance',
            pageViews: 'Page Views',
            productViews: 'Product Views',
            contactClicks: 'Contact Clicks',
            whatsappClicks: 'WhatsApp Clicks',
            phoneClicks: 'Phone Clicks',
            shareClicks: 'Shares',
            last7Days: 'Last 7 Days',
            last30Days: 'Last 30 Days',
            last90Days: 'Last 90 Days',
            noData: 'No data yet',
            upgradeTitle: 'Analytics Feature',
            upgradeDesc: 'Upgrade your plan for detailed analytics',
            upgradePlan: 'Upgrade Plan',
            date: 'Date',
            totalViews: 'Total Views',
            conversionRate: 'Conversion Rate'
        }
    };

    const txt = texts[language] || texts.tr;

    useEffect(() => {
        if (shopAccount?.id) {
            fetchAnalytics();
        }
    }, [shopAccount?.id, dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const { data, error } = await supabase
                .from('shop_analytics')
                .select('*')
                .eq('shop_id', shopAccount.id)
                .gte('date', startDate.toISOString().split('T')[0])
                .order('date', { ascending: false });

            if (error) throw error;

            setAnalytics(data || []);

            // Calculate totals
            const sums = (data || []).reduce((acc, day) => ({
                pageViews: acc.pageViews + (day.page_views || 0),
                productViews: acc.productViews + (day.product_views || 0),
                contactClicks: acc.contactClicks + (day.contact_clicks || 0),
                whatsappClicks: acc.whatsappClicks + (day.whatsapp_clicks || 0),
                phoneClicks: acc.phoneClicks + (day.phone_clicks || 0),
                shareClicks: acc.shareClicks + (day.share_clicks || 0)
            }), { pageViews: 0, productViews: 0, contactClicks: 0, whatsappClicks: 0, phoneClicks: 0, shareClicks: 0 });

            setTotals(sums);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'tr-TR', {
            day: '2-digit',
            month: 'short'
        });
    };

    // Check if user has analytics feature
    const canViewAnalytics = hasFeature('has_analytics');

    // Show upgrade prompt if no analytics access
    if (!canViewAnalytics) {
        return (
            <div className="shop-owner-analytics">
                <div className="shop-page-header">
                    <h1>📊 {txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>

                <div className="upgrade-prompt">
                    <div className="upgrade-icon">🔒</div>
                    <h2>{txt.upgradeTitle}</h2>
                    <p>{txt.upgradeDesc}</p>
                    <a href="/shop-basvuru" className="upgrade-btn">
                        ⬆️ {txt.upgradePlan}
                    </a>
                </div>

                <style>{`
                    .upgrade-prompt {
                        text-align: center;
                        padding: 4rem 2rem;
                        background: white;
                        border-radius: 20px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }

                    .upgrade-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                    }

                    .upgrade-prompt h2 {
                        color: #111827;
                        margin-bottom: 0.5rem;
                    }

                    .upgrade-prompt p {
                        color: #6b7280;
                        margin-bottom: 2rem;
                    }

                    .upgrade-btn {
                        display: inline-block;
                        padding: 14px 32px;
                        background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 12px;
                        font-weight: 600;
                        transition: all 0.2s;
                    }

                    .upgrade-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(255, 107, 157, 0.3);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="shop-owner-analytics">
            <div className="shop-page-header">
                <div className="header-content">
                    <h1>📊 {txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
                <div className="date-filter">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="7">{txt.last7Days}</option>
                        <option value="30">{txt.last30Days}</option>
                        <option value="90">{txt.last90Days}</option>
                    </select>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-info">
                        <div className="stat-value">{totals.pageViews + totals.productViews}</div>
                        <div className="stat-label">{txt.totalViews}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <div className="stat-value">{totals.productViews}</div>
                        <div className="stat-label">{txt.productViews}</div>
                    </div>
                </div>
                <div className="stat-card highlight">
                    <div className="stat-icon">💬</div>
                    <div className="stat-info">
                        <div className="stat-value">{totals.contactClicks + totals.whatsappClicks + totals.phoneClicks}</div>
                        <div className="stat-label">{txt.contactClicks}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-info">
                        <div className="stat-value">{totals.shareClicks}</div>
                        <div className="stat-label">{txt.shareClicks}</div>
                    </div>
                </div>
            </div>

            {/* Daily Breakdown */}
            <div className="analytics-table-container">
                <h3>📅 {txt.date === 'Tarih' ? 'Günlük Detay' : txt.date === 'Datum' ? 'Tägliche Details' : 'Daily Details'}</h3>

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : analytics.length === 0 ? (
                    <div className="no-data">
                        <span>📭</span>
                        <p>{txt.noData}</p>
                    </div>
                ) : (
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>{txt.date}</th>
                                <th>👁️ {txt.pageViews}</th>
                                <th>📦 {txt.productViews}</th>
                                <th>💬 {txt.contactClicks}</th>
                                <th>📱 {txt.whatsappClicks}</th>
                                <th>🔗 {txt.shareClicks}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.map(day => (
                                <tr key={day.id}>
                                    <td className="date-cell">{formatDate(day.date)}</td>
                                    <td>{day.page_views || 0}</td>
                                    <td>{day.product_views || 0}</td>
                                    <td className="highlight-cell">{day.contact_clicks || 0}</td>
                                    <td>{day.whatsapp_clicks || 0}</td>
                                    <td>{day.share_clicks || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .shop-owner-analytics .shop-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .date-filter select {
                    padding: 10px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    background: white;
                    cursor: pointer;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .stat-card.highlight {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                }

                .stat-card.highlight .stat-value,
                .stat-card.highlight .stat-label {
                    color: white;
                }

                .stat-icon {
                    font-size: 2rem;
                    min-width: 50px;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #111827;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: #6b7280;
                }

                .analytics-table-container {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    overflow-x: auto;
                }

                .analytics-table-container h3 {
                    margin: 0 0 1rem 0;
                    color: #111827;
                }

                .analytics-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .analytics-table th {
                    text-align: left;
                    padding: 12px;
                    background: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.85rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .analytics-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f0f0f0;
                    color: #374151;
                }

                .analytics-table tr:hover {
                    background: #f9fafb;
                }

                .date-cell {
                    font-weight: 600;
                    color: #111827;
                }

                .highlight-cell {
                    color: #FF6B9D;
                    font-weight: 600;
                }

                .no-data {
                    text-align: center;
                    padding: 3rem;
                    color: #6b7280;
                }

                .no-data span {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .loading {
                    text-align: center;
                    padding: 2rem;
                    color: #6b7280;
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShopOwnerAnalytics;
