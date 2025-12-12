import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './FAQSection.css';

const FAQSection = () => {
    const { t, language } = useLanguage();
    const [faqs, setFaqs] = useState([]);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopFAQs();
    }, []);

    const fetchTopFAQs = async () => {
        try {
            // Fetch top 6 FAQs (2 from each popular category)
            const { data, error } = await supabase
                .from('site_faqs')
                .select('*')
                .eq('is_active', true)
                .in('category', ['general', 'couples', 'vendors'])
                .order('display_order', { ascending: true })
                .limit(6);

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

    if (loading || faqs.length === 0) {
        return null; // Don't show section if no FAQs
    }

    return (
        <section className="faq-section section">
            <div className="container">
                <div className="faq-section-header" data-aos="fade-up">
                    <h2>{t('faq.title') || 'Sıkça Sorulan Sorular'}</h2>
                    <p>{t('faq.subtitle') || 'Merak ettiğiniz soruların cevapları'}</p>
                </div>

                <div className="faq-grid">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className={`faq-card ${expandedFaq === faq.id ? 'active' : ''}`}
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                        >
                            <div className="faq-card-question">
                                <h3>{getQuestionByLanguage(faq)}</h3>
                                <span className="faq-card-toggle">{expandedFaq === faq.id ? '−' : '+'}</span>
                            </div>
                            <div className="faq-card-answer">
                                <p>{getAnswerByLanguage(faq)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="faq-section-footer" data-aos="fade-up">
                    <Link to="/faq" className="btn btn-primary">
                        {t('faq.viewAll') || 'Tüm Soruları Görüntüle'} →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
