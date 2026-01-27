import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import './FAQPage.css';

const FAQPage = () => {
    const { t, language } = useLanguage();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const categories = [
        { value: 'all', label: t('faq.categories.all') || 'Tümü', icon: '📋' },
        { value: 'general', label: t('faq.categories.general') || 'Genel', icon: '❓' },
        { value: 'couples', label: t('faq.categories.couples') || 'Çiftler İçin', icon: '👰' },
        { value: 'vendors', label: t('faq.categories.vendors') || 'Tedarikçiler İçin', icon: '🏢' },
        { value: 'payment', label: t('faq.categories.payment') || 'Ödeme & Fiyatlandırma', icon: '💳' },
        { value: 'technical', label: t('faq.categories.technical') || 'Teknik Destek', icon: '🔧' }
    ];

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_faqs')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setFaqs(data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getQuestionByLanguage = (faq) => {
        return faq[`question_${language}`] || faq.question_tr;
    };

    const getAnswerByLanguage = (faq) => {
        return faq[`answer_${language}`] || faq.answer_tr;
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            getQuestionByLanguage(faq).toLowerCase().includes(searchQuery.toLowerCase()) ||
            getAnswerByLanguage(faq).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Group FAQs by category for display
    const groupedFaqs = {};
    filteredFaqs.forEach(faq => {
        if (!groupedFaqs[faq.category]) {
            groupedFaqs[faq.category] = [];
        }
        groupedFaqs[faq.category].push(faq);
    });

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Generate structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": filteredFaqs.map(faq => ({
            "@type": "Question",
            "name": getQuestionByLanguage(faq),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": getAnswerByLanguage(faq)
            }
        }))
    };

    return (
        <div className="faq-page">
            {/* SEO with Structured Data and Hreflang */}
            <SEO
                title={t('faq.title') || 'Sıkça Sorulan Sorular'}
                description={t('faq.subtitle') || 'KolayDugun hakkında merak ettiğiniz her şey. Platform kullanımı, fiyatlandırma, tedarikçi kayıt ve daha fazlası.'}
                keywords="düğün planlama faq, kolaydugun sorular, düğün tedarikçi, wedding planning germany"
                url="/faq"
                structuredData={structuredData}
                hreflangUrls={{ de: '/faq', tr: '/faq', en: '/faq' }}
            />

            <div className="section container" style={{ marginTop: '80px' }}>
                {/* Header */}
                <div className="faq-header">
                    <h1>{t('faq.title') || 'Sıkça Sorulan Sorular'}</h1>
                    <p>{t('faq.subtitle') || 'Merak ettiğiniz her şeyin cevabı burada'}</p>
                </div>

                {/* Search Bar */}
                <div className="faq-search-container">
                    <input
                        type="text"
                        className="faq-search-input"
                        placeholder={t('faq.search') || 'Soru ara...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>

                {/* Category Filter */}
                <div className="faq-category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(cat.value);
                                setExpandedFaq(null);
                            }}
                        >
                            <span className="cat-icon">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                {filteredFaqs.length === 0 ? (
                    <div className="faq-empty-state">
                        <p>{t('faq.noResults') || 'Aradığınız kriterlere uygun soru bulunamadı.'}</p>
                    </div>
                ) : (
                    <div className="faq-content">
                        {selectedCategory === 'all' ? (
                            // Show grouped by category
                            Object.entries(groupedFaqs).map(([category, categoryFaqs]) => {
                                const categoryInfo = categories.find(c => c.value === category);
                                return (
                                    <div key={category} className="faq-category-section">
                                        <h2 className="faq-category-title">
                                            <span className="cat-icon">{categoryInfo?.icon}</span>
                                            {categoryInfo?.label}
                                        </h2>
                                        <div className="faq-accordion">
                                            {categoryFaqs.map(faq => (
                                                <div
                                                    key={faq.id}
                                                    className={`faq-item ${expandedFaq === faq.id ? 'active' : ''}`}
                                                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                >
                                                    <div className="faq-question">
                                                        <h3>{getQuestionByLanguage(faq)}</h3>
                                                        <span className="faq-toggle">{expandedFaq === faq.id ? '−' : '+'}</span>
                                                    </div>
                                                    <div className="faq-answer">
                                                        <p>{getAnswerByLanguage(faq)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            // Show single category
                            <div className="faq-accordion">
                                {filteredFaqs.map(faq => (
                                    <div
                                        key={faq.id}
                                        className={`faq-item ${expandedFaq === faq.id ? 'active' : ''}`}
                                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                    >
                                        <div className="faq-question">
                                            <h3>{getQuestionByLanguage(faq)}</h3>
                                            <span className="faq-toggle">{expandedFaq === faq.id ? '−' : '+'}</span>
                                        </div>
                                        <div className="faq-answer">
                                            <p>{getAnswerByLanguage(faq)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Contact CTA */}
                <div className="faq-contact-cta">
                    <h3>{t('faq.stillHaveQuestions') || 'Hala sorunuz mu var?'}</h3>
                    <p>{t('faq.contactUs') || 'Bizimle iletişime geçmekten çekinmeyin!'}</p>
                    <div style={{
                        backgroundColor: '#ffffff',
                        color: '#e91e63',
                        padding: '20px 40px',
                        fontSize: '24px',
                        fontWeight: '700',
                        borderRadius: '12px',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                        display: 'inline-block',
                        marginTop: '10px'
                    }}>
                        ✉️ kontakt@kolaydugun.de
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
