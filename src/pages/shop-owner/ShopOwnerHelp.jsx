import React, { useState, useEffect } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerHelp = () => {
    const { shopAccount } = useShopOwner();
    const { language } = useLanguage();
    const [faqs, setFaqs] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('announcements');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [readAnnouncements, setReadAnnouncements] = useState([]);

    const texts = {
        tr: {
            title: 'Yardım & Duyurular',
            subtitle: 'Önemli bilgiler ve sık sorulan sorular',
            announcements: 'Duyurular',
            faqs: 'Sık Sorulan Sorular',
            noAnnouncements: 'Yeni duyuru yok',
            noFaqs: 'Henüz SSS eklenmemiş',
            markAsRead: 'Okundu olarak işaretle',
            new: 'Yeni',
            categories: {
                general: 'Genel',
                products: 'Ürünler',
                profile: 'Mağaza Profili',
                categories: 'Kategoriler',
                analytics: 'İstatistikler',
                affiliate: 'Affiliate',
                billing: 'Ödeme',
                account: 'Hesap',
                support: 'Destek'
            }
        },
        de: {
            title: 'Hilfe & Ankündigungen',
            subtitle: 'Wichtige Informationen und häufig gestellte Fragen',
            announcements: 'Ankündigungen',
            faqs: 'Häufig gestellte Fragen',
            noAnnouncements: 'Keine neuen Ankündigungen',
            noFaqs: 'Noch keine FAQ hinzugefügt',
            markAsRead: 'Als gelesen markieren',
            new: 'Neu',
            categories: {
                general: 'Allgemein',
                products: 'Produkte',
                profile: 'Shop-Profil',
                categories: 'Kategorien',
                analytics: 'Statistiken',
                affiliate: 'Affiliate',
                billing: 'Zahlung',
                account: 'Konto',
                support: 'Support'
            }
        },
        en: {
            title: 'Help & Announcements',
            subtitle: 'Important information and frequently asked questions',
            announcements: 'Announcements',
            faqs: 'FAQ',
            noAnnouncements: 'No new announcements',
            noFaqs: 'No FAQ added yet',
            markAsRead: 'Mark as read',
            new: 'New',
            categories: {
                general: 'General',
                products: 'Products',
                profile: 'Shop Profile',
                categories: 'Categories',
                analytics: 'Analytics',
                affiliate: 'Affiliate',
                billing: 'Billing',
                account: 'Account',
                support: 'Support'
            }
        }
    };

    const txt = texts[language] || texts.tr;

    const typeStyles = {
        info: { bg: '#dbeafe', color: '#1d4ed8', icon: 'ℹ️' },
        warning: { bg: '#fef3c7', color: '#92400e', icon: '⚠️' },
        new_feature: { bg: '#dcfce7', color: '#166534', icon: '🎉' },
        update: { bg: '#f3e8ff', color: '#6b21a8', icon: '🔄' },
        important: { bg: '#fee2e2', color: '#991b1b', icon: '🚨' }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch FAQs
            const { data: faqData } = await supabase
                .from('shop_faqs')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            setFaqs(faqData || []);

            // Fetch Announcements
            const { data: annData } = await supabase
                .from('shop_announcements')
                .select('*')
                .eq('is_active', true)
                .lte('publish_at', new Date().toISOString())
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });
            setAnnouncements(annData || []);

            // Fetch read status
            if (shopAccount?.id) {
                const { data: readData } = await supabase
                    .from('shop_announcement_reads')
                    .select('announcement_id')
                    .eq('shop_id', shopAccount.id);
                setReadAnnouncements((readData || []).map(r => r.announcement_id));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (announcementId) => {
        if (!shopAccount?.id || readAnnouncements.includes(announcementId)) return;

        try {
            await supabase
                .from('shop_announcement_reads')
                .insert([{
                    announcement_id: announcementId,
                    shop_id: shopAccount.id
                }]);
            setReadAnnouncements([...readAnnouncements, announcementId]);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getLocalizedField = (item, field) => {
        const langField = `${field}_${language}`;
        return item?.[langField] || item?.[`${field}_tr`] || '';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(
            language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'tr-TR',
            { day: '2-digit', month: 'short', year: 'numeric' }
        );
    };

    const unreadCount = announcements.filter(a => !readAnnouncements.includes(a.id)).length;

    if (loading) {
        return (
            <div className="shop-owner-help">
                <div className="shop-page-header">
                    <h1>📚 {txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="shop-owner-help">
            <div className="shop-page-header">
                <h1>📚 {txt.title}</h1>
                <p>{txt.subtitle}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('announcements')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '12px',
                        background: activeTab === 'announcements' ? 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)' : 'white',
                        color: activeTab === 'announcements' ? 'white' : '#374151',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    📢 {txt.announcements}
                    {unreadCount > 0 && (
                        <span style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('faqs')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '12px',
                        background: activeTab === 'faqs' ? 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)' : 'white',
                        color: activeTab === 'faqs' ? 'white' : '#374151',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    ❓ {txt.faqs}
                </button>
            </div>

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div className="announcements-list">
                    {announcements.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'white',
                            borderRadius: '16px',
                            color: '#6b7280'
                        }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                            {txt.noAnnouncements}
                        </div>
                    ) : (
                        announcements.map(ann => {
                            const style = typeStyles[ann.type] || typeStyles.info;
                            const isRead = readAnnouncements.includes(ann.id);

                            return (
                                <div
                                    key={ann.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        marginBottom: '1rem',
                                        boxShadow: isRead ? '0 1px 3px rgba(0,0,0,0.05)' : '0 4px 15px rgba(0,0,0,0.1)',
                                        borderLeft: `4px solid ${style.color}`,
                                        opacity: isRead ? 0.7 : 1
                                    }}
                                    onClick={() => markAsRead(ann.id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                background: style.bg,
                                                color: style.color,
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}>
                                                {style.icon} {ann.type === 'new_feature' ? 'Yeni Özellik' :
                                                    ann.type === 'warning' ? 'Uyarı' :
                                                        ann.type === 'update' ? 'Güncelleme' :
                                                            ann.type === 'important' ? 'Önemli' : 'Bilgi'}
                                            </span>
                                            {ann.is_pinned && (
                                                <span style={{ fontSize: '0.85rem' }}>📌</span>
                                            )}
                                            {!isRead && (
                                                <span style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {txt.new}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                            {formatDate(ann.created_at)}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.1rem' }}>
                                        {getLocalizedField(ann, 'title')}
                                    </h3>
                                    <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {getLocalizedField(ann, 'content')}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
                <div className="faqs-list">
                    {faqs.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'white',
                            borderRadius: '16px',
                            color: '#6b7280'
                        }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                            {txt.noFaqs}
                        </div>
                    ) : (
                        /* Group FAQs by category */
                        (() => {
                            const categoryOrder = ['general', 'products', 'profile', 'categories', 'analytics', 'billing', 'affiliate', 'account', 'support'];
                            const categoryIcons = {
                                general: '📋',
                                products: '📦',
                                profile: '🏪',
                                categories: '🏷️',
                                analytics: '📊',
                                billing: '💳',
                                affiliate: '🔗',
                                account: '👤',
                                support: '🆘'
                            };

                            const grouped = faqs.reduce((acc, faq) => {
                                const cat = faq.category || 'general';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(faq);
                                return acc;
                            }, {});

                            const sortedCategories = Object.keys(grouped).sort((a, b) => {
                                return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
                            });

                            return sortedCategories.map(category => (
                                <div key={category} style={{ marginBottom: '1.5rem' }}>
                                    {/* Category Header */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)',
                                        color: 'white',
                                        padding: '12px 20px',
                                        borderRadius: '12px 12px 0 0',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>{categoryIcons[category] || '❓'}</span>
                                        {txt.categories[category] || category}
                                        <span style={{
                                            background: 'rgba(255,255,255,0.3)',
                                            padding: '2px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            marginLeft: 'auto'
                                        }}>
                                            {grouped[category].length}
                                        </span>
                                    </div>

                                    {/* Category FAQs */}
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '0 0 12px 12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                    }}>
                                        {grouped[category].map((faq, index) => (
                                            <div key={faq.id} style={{
                                                borderBottom: index < grouped[category].length - 1 ? '1px solid #f0f0f0' : 'none'
                                            }}>
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1.25rem',
                                                        border: 'none',
                                                        background: expandedFaq === faq.id ? '#faf5ff' : 'transparent',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '500', color: '#374151', flex: 1 }}>
                                                        {getLocalizedField(faq, 'question')}
                                                    </span>
                                                    <span style={{
                                                        transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0)',
                                                        transition: 'transform 0.2s',
                                                        fontSize: '0.9rem',
                                                        color: '#9ca3af',
                                                        marginLeft: '12px'
                                                    }}>
                                                        ▼
                                                    </span>
                                                </button>
                                                {expandedFaq === faq.id && (
                                                    <div style={{
                                                        padding: '0 1.25rem 1.25rem',
                                                        color: '#4b5563',
                                                        lineHeight: '1.7',
                                                        background: '#faf5ff',
                                                        whiteSpace: 'pre-wrap',
                                                        fontSize: '0.95rem'
                                                    }}>
                                                        {getLocalizedField(faq, 'answer')}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()
                    )}
                </div>
            )}

            <style>{`
                .shop-owner-help .shop-page-header {
                    margin-bottom: 1.5rem;
                }
                
                .shop-owner-help .shop-page-header h1 {
                    color: #111827;
                    margin: 0 0 0.25rem 0;
                }
                
                .shop-owner-help .shop-page-header p {
                    color: #6b7280;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default ShopOwnerHelp;
