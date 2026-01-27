import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import './DynamicPage.css';

const DynamicPage = () => {
    const { slug } = useParams();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        if (slug) {
            fetchPage();
        }
    }, [slug]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            // PGRST116 = no rows found, which is expected for pages not in DB
            if (error && error.code !== 'PGRST116') throw error;

            if (!data || error?.code === 'PGRST116') {
                // Fallback for About Us if not in DB
                if (slug === 'ueber-uns') {
                    setPage({
                        title: {
                            tr: 'Hakkımızda',
                            en: 'About Us',
                            de: 'Über Uns'
                        },
                        content: {
                            tr: `
                                <div class="about-us-content">
                                    <h2>Hayallerinizdeki Düğün İçin Yanınızdayız</h2>
                                    <p>KolayDugun.de, Almanya'da yaşayan Türk toplumu için özel olarak tasarlanmış, en kapsamlı düğün planlama platformudur. Amacımız, gurbetçi çiftlerimizin en mutlu günlerini planlarken yaşadıkları zorlukları ortadan kaldırmak ve onları güvenilir tedarikçilerle bir araya getirmektir.</p>
                                    <h3>Neden KolayDugun.de?</h3>
                                    <ul>
                                    <li><strong>Kapsamlı Tedarikçi Ağı:</strong> Düğün mekanlarından fotoğrafçılara, gelinlikçilerden organizasyon firmalarına kadar binlerce onaylı tedarikçi.</li>
                                    <li><strong>Güvenilirlik:</strong> Tüm tedarikçilerimiz özenle seçilir ve doğrulanır.</li>
                                    <li><strong>Çok Dilli Destek:</strong> Almanca, İngilizce ve Türkçe tam destek ile dil engeli olmadan hizmet alın.</li>
                                    </ul>
                                </div>
                            `,
                            en: `
                                <div class="about-us-content">
                                    <h2>We Are Here For Your Dream Wedding</h2>
                                    <p>KolayDugun.de is the most comprehensive wedding planning platform designed specifically for the Turkish community living in Germany. Our goal is to eliminate the challenges that expat couples face while planning their happiest day and to connect them with reliable vendors.</p>
                                    <h3>Why KolayDugun.de?</h3>
                                    <ul>
                                    <li><strong>Comprehensive Vendor Network:</strong> Thousands of verified vendors from wedding venues to photographers, bridal shops to event planners.</li>
                                    <li><strong>Reliability:</strong> All our vendors are carefully selected and verified.</li>
                                    <li><strong>Multilingual Support:</strong> Full support in German, English, and Turkish — no language barriers.</li>
                                    </ul>
                                </div>
                            `,
                            de: `
                                <div class="about-us-content">
                                    <h2>Wir sind für Ihre Traumhochzeit da</h2>
                                    <p>KolayDugun.de ist die umfassendste Hochzeitsplanungsplattform, die speziell für die türkische Community in Deutschland entwickelt wurde. Unser Ziel ist es, die Herausforderungen zu beseitigen, denen Paare bei der Planung ihres schönsten Tages begegnen, und sie mit zuverlässigen Dienstleistern zusammenzubringen.</p>
                                    <h3>Warum KolayDugun.de?</h3>
                                    <ul>
                                    <li><strong>Umfassendes Dienstleister-Netzwerk:</strong> Tausende verifizierte Dienstleister von Hochzeitslocations über Fotografen bis hin zu Brautmodengeschäften und Eventplanern.</li>
                                    <li><strong>Zuverlässigkeit:</strong> Alle unsere Dienstleister werden sorgfältig ausgewählt und überprüft.</li>
                                    <li><strong>Mehrsprachige Unterstützung:</strong> Vollständige Unterstützung auf Deutsch, Englisch und Türkisch — ohne Sprachbarrieren.</li>
                                    </ul>
                                </div>
                            `
                        }
                    });
                    return;
                }

                navigate('/404'); // Or handle not found
                return;
            }

            setPage(data);
        } catch (error) {
            console.error('Error fetching page:', error);
            // navigate('/404');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="section container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Sayfa Bulunamadı</h2>
                <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Anasayfaya Dön
                </button>
            </div>
        );
    }

    const title = page.title?.[language] || page.title?.en || 'Page';
    const content = page.content?.[language] || page.content?.en || '';

    return (
        <div className="section container dynamic-page">
            <SEO title={title} description={title} />
            <h1 className="page-title">{title}</h1>
            <div
                className="page-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        </div>
    );
};

export default DynamicPage;
