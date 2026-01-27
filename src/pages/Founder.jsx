import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Youtube, Linkedin, Instagram, ExternalLink, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import './Founder.css';

const Founder = () => {
    const { language, t } = useLanguage();
    const [settings, setSettings] = useState(null);
    const [projects, setProjects] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    const lang = language || 'tr';

    useEffect(() => {
        const loadFounderData = async () => {
            const { data: sData } = await supabase.from('founder_settings').select('*').eq('is_active', true).single();
            const { data: pData } = await supabase.from('founder_projects').select('*').eq('is_active', true).order('order_index', { ascending: true });
            const { data: mData } = await supabase.from('founder_media').select('*').eq('is_active', true).order('order_index', { ascending: true });

            if (sData) setSettings(sData);

            // Add new projects that aren't in DB yet
            const additionalProjects = [
                {
                    id: 'live-request-system',
                    title_tr: 'Canlı İstek Sistemi',
                    title_de: 'Live-Anfrage-System',
                    title_en: 'Live Request System',
                    description_tr: 'DJ ve müzisyenler için QR kod tabanlı şarkı istek sistemi. Misafirler telefonlarından anlık istek gönderebilir, VIP önceliklendirme ve bahşiş özelliği.',
                    description_de: 'QR-Code-basiertes Song-Anfrage-System für DJs und Musiker. Gäste können Anfragen über ihr Telefon senden, mit VIP-Priorisierung und Trinkgeld-Funktion.',
                    description_en: 'QR code-based song request system for DJs and musicians. Guests can send requests from their phones, with VIP prioritization and tipping feature.',
                    status: 'current',
                    order_index: 3
                },
                {
                    id: 'vendor-shops',
                    title_tr: 'Tedarikçi Mağazaları',
                    title_de: 'Anbieter-Shops',
                    title_en: 'Vendor Shops',
                    description_tr: 'Düğün tedarikçilerinin kendi ürünlerini ve hizmetlerini doğrudan satabileceği entegre pazaryeri. Çiftler tek noktadan alışveriş yapabilir.',
                    description_de: 'Integrierter Marktplatz, auf dem Hochzeitsanbieter ihre eigenen Produkte und Dienstleistungen direkt verkaufen können.',
                    description_en: 'Integrated marketplace where wedding vendors can sell their own products and services directly.',
                    status: 'current',
                    order_index: 4
                }
            ];

            // Merge DB projects with additional projects
            const allProjects = [...(pData || []), ...additionalProjects].sort((a, b) => a.order_index - b.order_index);
            setProjects(allProjects);

            if (mData) setMedia(mData);
            setLoading(false);
        };
        loadFounderData();
    }, []);

    const getYouTubeEmbedUrl = (url) => {
        let vid = '';
        if (url.includes('v=')) vid = url.split('v=')[1].split('&')[0];
        else if (url.includes('shorts/')) vid = url.split('shorts/')[1].split('?')[0];
        else if (url.includes('youtu.be/')) vid = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${vid}`;
    };

    const ensureHttps = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    if (loading || !settings) return <div className="loading">Loading...</div>;

    const bio = settings[`bio_${lang}`] || settings.bio_tr;

    return (
        <div className="founder-page">
            <SEO
                title={lang === 'tr' ? 'Kurucumuz ve Vizyonumuz' : 'Our Founder & Vision'}
                description={bio.substring(0, 160)}
                image={settings.photo_url}
            />

            {/* HERO SECTION */}
            <section className="founder-hero">
                <div className="container">
                    <div className="hero-grid" data-aos="fade-up">
                        <div className="founder-photo-container">
                            <img src={settings.photo_url} alt="Founder" className="founder-photo" />
                            <div className="founder-quote">
                                "{lang === 'tr' ? 'Gelenekseli dijitalle buluşturarak geleceği inşa ediyoruz.' : lang === 'de' ? 'Wir bauen die Zukunft, indem wir Tradition mit Digital verbinden.' : 'Building the future by merging tradition with digital.'}"
                            </div>
                        </div>
                        <div className="founder-content">
                            <span className="badge" style={{ background: '#ff4d6d', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {lang === 'tr' ? 'KOLAYDUGUN KURUCU' : lang === 'de' ? 'KOLAYDUGUN GRÜNDER' : 'KOLAYDUGUN FOUNDER'}
                            </span>
                            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginTop: '20px', lineHeight: '1.1' }}>
                                {lang === 'tr' ? 'Vizyonumuz ve Hikayemiz' : lang === 'de' ? 'Unsere Vision & Geschichte' : 'Our Vision & Story'}
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#555', marginTop: '30px', lineHeight: '1.8' }}>
                                {bio}
                            </p>
                            <div className="social-links" style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                                {settings.social_links?.linkedin && (
                                    <a href={settings.social_links.linkedin} target="_blank" rel="noreferrer" className="social-btn"><Linkedin size={24} /></a>
                                )}
                                {settings.social_links?.youtube && (
                                    <a href={settings.social_links.youtube} target="_blank" rel="noreferrer" className="social-btn"><Youtube size={24} /></a>
                                )}
                                {settings.social_links?.instagram && (
                                    <a href={settings.social_links.instagram} target="_blank" rel="noreferrer" className="social-btn"><Instagram size={24} /></a>
                                )}
                                <a href="https://wa.me/491628726192" target="_blank" rel="noreferrer" className="social-btn" title="Contact on WhatsApp">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROADMAP SECTION */}
            <section className="roadmap-section">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2>{lang === 'tr' ? 'Yol Haritamız' : lang === 'de' ? 'Unser Fahrplan' : 'Our Roadmap'}</h2>
                        <p>{lang === 'tr' ? 'Geçmişten geleceğe, düğün dünyasını nasıl dönüştürüyoruz?' : lang === 'de' ? 'Wie wir die Hochzeitswelt von der Vergangenheit in die Zukunft transformieren.' : 'How we transform the wedding world from past to future.'}</p>
                    </div>

                    <div className="roadmap-timeline">
                        {projects.map((proj, index) => (
                            <div key={proj.id} className={`roadmap-item ${index % 2 === 0 ? 'left' : 'right'}`} data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'}>
                                <div className="roadmap-dot"></div>
                                <div className="roadmap-card">
                                    <span className="roadmap-status">
                                        {proj.status === 'past' && (lang === 'tr' ? 'Tamamlandı' : lang === 'de' ? 'Abgeschlossen' : 'Completed')}
                                        {proj.status === 'current' && (lang === 'tr' ? 'Aktif Geliştirme' : lang === 'de' ? 'Jetzt Live' : 'Now Live')}
                                        {proj.status === 'future' && (lang === 'tr' ? 'Yakında' : lang === 'de' ? 'Demnächst' : 'Coming Soon')}
                                    </span>
                                    <h4>{proj[`title_${lang}`] || proj.title_tr}</h4>
                                    <p>{proj[`description_${lang}`] || proj.description_tr}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MEDIA SECTION */}
            <section className="media-section">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2>{lang === 'tr' ? 'Kurucunun Sesi' : lang === 'de' ? 'Stimmen des Gründers' : 'Voices from the Founder'}</h2>
                        <p>{lang === 'tr' ? 'Düğün dünyasına dair ipuçları, eğitimler ve basın haberleri.' : lang === 'de' ? 'Tipps, Tutorials und Pressemitteilungen über die Hochzeitswelt.' : 'Tips, tutorials and press news about the wedding world.'}</p>
                    </div>

                    <div className="video-grid">
                        {media.map((item) => (
                            <div key={item.id} className="video-card" data-aos="zoom-in">
                                {item.type === 'youtube' ? (
                                    <div className={`video-container ${item.media_format === 'short' ? 'short' : ''}`}>
                                        <iframe
                                            src={getYouTubeEmbedUrl(item.url)}
                                            title={item.title_tr}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="press-link" style={{ position: 'relative' }}>
                                        <img src={item.thumbnail_url} alt="press" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                        <div style={{ padding: '20px' }}>
                                            <span className="badge" style={{ background: '#eee', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>{lang === 'tr' ? 'BASIN' : lang === 'de' ? 'PRESSE' : 'PRESS'}</span>
                                            <h5 style={{ marginTop: '10px' }}>{item[`title_${lang}`] || item.title_tr}</h5>
                                            <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ff4d6d', fontWeight: 'bold', marginTop: '10px' }}>
                                                {lang === 'tr' ? 'Habere Git' : lang === 'de' ? 'Vollständige Geschichte lesen' : 'Read Full Story'} <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Founder;
