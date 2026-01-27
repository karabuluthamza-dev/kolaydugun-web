import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './VIPDemoPage.css';

const VIPDemoPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, language } = useLanguage(); // i18n Hook
    const [scrolled, setScrolled] = useState(false);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tourIndex, setTourIndex] = useState(0);
    const [formData, setFormData] = useState({ name: '', phone: '', month: '', year: '2026', guestCount: '', message: '' });

    // Helper for localized content
    const getLocalized = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[language] || val.tr || val.en || '';
    };

    // Countdown Timer State (48 hours = 172800 seconds)
    const [timeLeft, setTimeLeft] = useState(48 * 60 * 60);
    const hasTrackedView = useRef(false);

    // Initial values from URL for fast loading
    const venueName = searchParams.get('venue') || 'Kemer Country Club';
    const cityName = searchParams.get('city') || 'Eyüp, İstanbul';

    // Analytics tracking function
    const trackEvent = async (eventType) => {
        try {
            await supabase.from('vip_demo_analytics').insert({
                vendor_id: vendor?.id || null,
                venue_name: venueName,
                city: cityName,
                event_type: eventType,
                referrer: document.referrer || null,
                user_agent: navigator.userAgent
            });
        } catch (err) {
            console.error('Analytics tracking error:', err);
        }
    };

    // Format countdown time
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleQuoteSubmit = async () => {
        if (!formData.name || !formData.phone) {
            alert(language === 'tr' ? 'Lütfen ad ve telefon giriniz.' : 'Please enter name and phone.');
            return;
        }

        // 1. DB'ye Kaydet (Analytics için)
        try {
            await supabase.from('leads').insert({
                vendor_id: vendor?.id,
                name: formData.name, // Try generic columns
                phone: formData.phone,
                event_date: formData.month ? `${formData.year}-${formData.month.padStart(2, '0')}-01` : `${formData.year}-01-01`,
                status: 'new',
                notes: `VIP Demo Form - Tarih: ${formData.month || '?'}/${formData.year}. Kişi: ${formData.guestCount || '-'}. Mesaj: ${formData.message || '-'}`
            });
            trackEvent('form_submit');
        } catch (e) {
            console.error('Lead save error (non-blocking):', e);
        }

        // 2. WhatsApp Yönlendirme
        // Replace non-numeric with empty string, but keep + if exists (simplified)
        const rawPhone = vendor?.vip_demo_config?.contact?.phone || '905555555555';
        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

        const dateStr = formData.month
            ? (language === 'tr' ? `${formData.month}/${formData.year}` : `${formData.month}/${formData.year}`)
            : formData.year;
        const guestInfo = formData.guestCount ? `\n👥 Tahmini Kişi Sayısı: ${formData.guestCount}` : '';
        const userMsg = formData.message ? `\n💬 Notum: ${formData.message}` : '';

        const message = language === 'tr'
            ? `Merhaba ${venueName},\n\nBen ${formData.name}.\n📅 Düğün Tarihi: ${dateStr}\n📞 Telefonum: ${formData.phone}${guestInfo}${userMsg}\n\nVIP Demo sayfanızı gördüm ve fiyat teklifi almak istiyorum.`
            : (language === 'de'
                ? `Hallo ${venueName},\n\nIch bin ${formData.name}.\n📅 Hochzeitsdatum: ${dateStr}\n📞 Meine Telefon: ${formData.phone}${guestInfo}${userMsg}\n\nIch habe Ihre VIP Demo Seite gesehen und möchte ein Angebot erhalten.`
                : `Hello ${venueName},\n\nI am ${formData.name}.\n📅 Wedding Date: ${dateStr}\n📞 My Phone: ${formData.phone}${guestInfo}${userMsg}\n\nI saw your VIP Demo page and would like to get a quote.`);

        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

        window.open(waLink, '_blank');
    };

    const handleTourNext = () => {
        const gallery = vendor?.vip_demo_config?.gallery || [];
        if (gallery.length === 0) return;
        setTourIndex((prev) => (prev + 1) % gallery.length);
    };

    const handleTourPrev = () => {
        const gallery = vendor?.vip_demo_config?.gallery || [];
        if (gallery.length === 0) return;
        setTourIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    };

    useEffect(() => {
        const fetchDeepData = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('business_name', venueName)
                    .eq('city', cityName)
                    .maybeSingle();

                if (data) {
                    setVendor({
                        ...data,
                        vip_demo_config: data.details?.vip_demo_config || {
                            prices: [],
                            usps: []
                        }
                    });
                }
            } catch (err) {
                console.error('Error fetching VIP data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (venueName !== 'Kemer Country Club') {
            fetchDeepData();
        } else {
            setLoading(false);
        }
    }, [venueName, cityName]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track page view on mount (only once)
    useEffect(() => {
        if (!hasTrackedView.current) {
            hasTrackedView.current = true;
            trackEvent('view');
        }
    }, [venueName]);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="vip-page-v2">
            {/* VIP Golden Top Bar */}
            <div className="vip-gold-line">
                <span>✨ KOLAYDUGUN ELITE PARTNER SEÇKİSİ</span>
            </div>

            {/* Social Proof Banner */}
            {vendor?.vip_demo_config?.show_social_proof !== false && (
                <div className="social-proof-banner">
                    <div className="proof-item">
                        <span className="proof-icon">📈</span>
                        <span>{language === 'tr' ? 'Bu ay' : (language === 'de' ? 'Diesen Monat' : 'This month')} <strong>47 {language === 'tr' ? 'çift' : (language === 'de' ? 'Paare' : 'couples')}</strong> {t('vip.badges.eliteSalon')} ({language === 'tr' ? 'talep aldı' : (language === 'de' ? 'angefragt' : 'requested')})</span>
                    </div>
                    <div className="proof-divider">•</div>
                    <div className="proof-item">
                        <span className="proof-icon">🏆</span>
                        <span>{t('vip.hero.regionAvg')}: <strong>12 {language === 'tr' ? 'teklif/hafta' : (language === 'de' ? 'Anfragen/Woche' : 'requests/week')}</strong></span>
                    </div>
                </div>
            )}

            {/* Premium Header Container */}
            <header className="v2-header">
                <div className="v2-hero-content">
                    <div className="v2-top-badges">
                        <span className="v2-badge gold">✨ {t('vip.badges.eliteCandidate')}</span>
                        {vendor?.vip_demo_config?.show_live_viewing !== false && (
                            <span className="v2-badge v2-pulse">🔥 {t('vip.badges.viewingNow', { count: 14 })}</span>
                        )}
                    </div>
                    <h1 className="v2-hero-title">{venueName}</h1>
                    <div className="v2-hero-meta">
                        <span>📍 {cityName}</span>
                        <span>⭐ 4.9 {t('vip.hero.regionAvg')}</span>
                        <span>🚀 {t('vip.badges.vipPromo')}</span>
                        <span className="v2-phone">📞 {vendor?.vip_demo_config?.contact?.phone || '0212 963 24 96'}</span>
                    </div>
                </div>

                {/* Dugun.com Tarzı Horizontal Menu - Premium Versiyon */}
                <nav className={`v2-nav ${scrolled ? 'v2-nav-fixed' : ''}`}>
                    <div className="v2-nav-inner">
                        <a href="#genel" className="active">{t('vip.nav.general')}</a>
                        <a href="#fiyat">{t('vip.nav.prices')}</a>
                        {vendor?.vip_demo_config?.show_calendar !== false && <a href="#takvim">{t('vip.nav.calendar')}</a>}
                        <a href="#foto">{t('vip.nav.virtualTour')}</a>
                        <a href="#kapasite">{t('vip.nav.capacity')}</a>
                        {vendor?.vip_demo_config?.show_stats !== false && <a href="#stats">{t('vip.nav.stats')}</a>}
                        <a href="#neden">{t('vip.nav.whyUs')}</a>
                        {vendor?.vip_demo_config?.show_partner !== false && <a href="#ekip">{t('vip.nav.partner')}</a>}
                        {vendor?.vip_demo_config?.show_reviews !== false && <a href="#yorum">{t('vip.nav.reviews')}</a>}
                    </div>
                </nav>
            </header>

            <main className="v2-main">
                <div className="v2-content-wrapper">
                    <div className="v2-left-content">
                        {/* Hero / Hero Slider Placeholder */}
                        <section id="genel" className="v2-section hero-v2">
                            <div className="hero-badge">{t('vip.badges.eliteSalon')}</div>
                            <img
                                src={vendor?.vip_demo_config?.hero_image || "/kemer_country_club_demo_hero.png"}
                                alt="Hero"
                                className="hero-img-v2"
                            />
                            <div className="hero-overlay-v2"></div>
                            <div className="hero-text-overlay">
                                <h2>{getLocalized(vendor?.vip_demo_config?.hero_title) || 'Doğanın Kalbinde Unutulmaz Bir Hikaye'}</h2>
                                <p>{getLocalized(vendor?.vip_demo_config?.hero_description) || 'Kemer Country Club, İstanbul’un en seçkin kır düğünü mekanlarından biri olarak, hayallerinizdeki daveti gerçeğe dönüştürüyor.'}</p>
                            </div>
                        </section>

                        {/* Fiyat Kartları */}
                        <section id="fiyat" className="v2-section">
                            <h2 className="v2-title">{t('vip.sections.pricesTitle', { name: venueName })}</h2>
                            <div className="v2-price-grid">
                                {vendor?.vip_demo_config?.prices?.length > 0 ? (
                                    vendor.vip_demo_config.prices.map((p, idx) => (
                                        <div key={idx} className={`v2-price-card ${idx === 1 ? 'highlight-card' : ''}`}>
                                            <div className="card-icon">{p.icon || '🍹'}</div>
                                            <h3>{getLocalized(p.name)}</h3>
                                            <div className="price-row">
                                                <span>{t('vip.common.weekDay')}</span>
                                                <strong>{getLocalized(p.weekday)}</strong>
                                            </div>
                                            <div className="price-row">
                                                <span>{t('vip.common.weekEnd')}</span>
                                                <strong>{getLocalized(p.weekend)}</strong>
                                            </div>
                                            <p className="price-updated">{t('vip.common.updated')}</p>
                                        </div>
                                    ))
                                ) : (
                                    // Fallback UI
                                    <>
                                        <div className="v2-price-card">
                                            <div className="card-icon">🍹</div>
                                            <h3>Kokteyl Menü</h3>
                                            <div className="price-row">
                                                <span>{t('vip.common.weekDay')}</span>
                                                <strong>80 EUR</strong>
                                            </div>
                                            <div className="price-row">
                                                <span>{t('vip.common.weekEnd')}</span>
                                                <strong>110 EUR</strong>
                                            </div>
                                            <p className="price-updated">{t('vip.common.lastUpdated', { date: '07.01.2026' })}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Sanal Tur / Galeri Gelişmiş */}
                        <section id="galeri" className="v2-section">
                            <div className="section-header-flex">
                                <h2 className="v2-title">{t('vip.sections.virtualTourTitle')}</h2>
                                <span className="badge-360">INTERAKTİF</span>
                            </div>
                            <div className="v2-virtual-tour-sim">
                                <img
                                    src={vendor?.vip_demo_config?.gallery?.[tourIndex] || vendor?.vip_demo_config?.hero_image || "/kemer_country_club_demo_hero.png"}
                                    alt="360 View"
                                    className="tour-img"
                                />
                                <div className="tour-controls">
                                    <button className="btn-tour" onClick={handleTourPrev}>⬅️</button>
                                    <button className="btn-tour-center">📍 360° {language === 'tr' ? 'TUR' : 'TOUR'}</button>
                                    <button className="btn-tour" onClick={handleTourNext}>➡️</button>
                                </div>
                            </div>
                            <div className="v2-gallery-compact">
                                {vendor?.vip_demo_config?.gallery?.length > 0 ? (
                                    <>
                                        <div className="gallery-main"><img src={vendor.vip_demo_config.gallery[0]} alt="1" /></div>
                                        {vendor.vip_demo_config.gallery.slice(1, 3).map((img, idx) => (
                                            <div key={idx} className="gallery-side"><img src={img} alt={idx + 2} /></div>
                                        ))}
                                        {vendor.vip_demo_config.gallery.length > 3 && (
                                            <div className="gallery-overlay-btn">+{vendor.vip_demo_config.gallery.length - 3}</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="gallery-main"><img src="/kemer_country_club_demo_hero.png" alt="1" /></div>
                                        <div className="gallery-side"><img src="/kemer_country_club_demo_hero.png" alt="2" /></div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Kapasite Bilgileri */}
                        <section id="kapasite" className="v2-section">
                            <h2 className="v2-title">{t('vip.sections.capacityTitle')}</h2>
                            <table className="v2-cap-table">
                                <thead>
                                    <tr>
                                        <th>{t('vip.sections.capacity.area')}</th>
                                        <th>{t('vip.sections.capacity.meal')}</th>
                                        <th>{t('vip.sections.capacity.cocktail')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Orman Evi Bahçesi</td>
                                        <td>1000 - 1200 {language === 'tr' ? 'Kişi' : 'Pax'}</td>
                                        <td>1500 {language === 'tr' ? 'Kişi' : 'Pax'}</td>
                                    </tr>
                                    <tr>
                                        <td>Havuz Başı</td>
                                        <td>400 - 500 {language === 'tr' ? 'Kişi' : 'Pax'}</td>
                                        <td>750 {language === 'tr' ? 'Kişi' : 'Pax'}</td>
                                    </tr>
                                    <tr>
                                        <td>Kapalı Balo Salonu</td>
                                        <td>300 - 400 {language === 'tr' ? 'Kişi' : 'Pax'}</td>
                                        <td>500 {language === 'tr' ? 'Kişi' : 'Pax'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        {/* Müsaitlik Takvimi - Canlı Veri Simülasyonu */}
                        {vendor?.vip_demo_config?.show_calendar !== false && (
                            <section id="takvim" className="v2-section calendar-box">
                                <h2 className="v2-title">{t('vip.sections.availabilityTitle', { year: 2026 })}</h2>
                                <div className="calendar-info-banner">
                                    <span className="dot-live"></span>
                                    <p><strong>{cityName}</strong>: %85 {language === 'tr' ? 'doluluk' : (language === 'de' ? 'Auslastung' : 'occupancy')}.</p>
                                </div>
                                <div className="v2-calendar-grid">
                                    {(vendor?.vip_demo_config?.availability || [
                                        { month: 'May', status: 'available' },
                                        { month: 'Jun', status: 'full' },
                                        { month: 'Jul', status: 'critical' },
                                        { month: 'Aug', status: 'full' },
                                        { month: 'Sep', status: 'available' },
                                        { month: 'Oct', status: 'available' },
                                    ]).map((item, idx) => (
                                        <div key={idx} className={`calendar-card ${item.status === 'available' ? 'müsait' : (item.status === 'full' ? 'dolu' : 'kritik')}`}>
                                            <div className="month-name">{item.month}</div>
                                            <div className={`status-badge ${item.status === 'available' ? 'müsait' : (item.status === 'full' ? 'dolu' : 'kritik')}`}>
                                                {item.status === 'available' ? '✓' : item.status === 'full' ? '✗' : '!'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Neden Biz? */}
                        <section id="neden" className="v2-section v2-card-flat">
                            <h2 className="v2-title">{t('vip.sections.whyUsTitle')}</h2>
                            <div className="v2-usp-grid">
                                {vendor?.vip_demo_config?.usps?.length > 0 ? (
                                    vendor.vip_demo_config.usps.map((usp, idx) => (
                                        <div key={idx} className="usp-item">✨ {getLocalized(usp)}</div>
                                    ))
                                ) : (
                                    <div className="usp-item">✨ {t('vip.sections.whyUsTitle')}</div>
                                )}
                            </div>
                        </section>

                        {/* SALON ANALYTICS PREVIEW */}
                        {vendor?.vip_demo_config?.show_stats !== false && (
                            <section id="stats" className="v2-section stats-preview-box">
                                <div className="stats-header">
                                    <h2 className="v2-title">{t('vip.sections.statsTitle')}</h2>
                                    <p>{t('vip.sections.statsSubtitle')}</p>
                                </div>
                                <div className="v2-stats-grid">
                                    <div className="stat-card">
                                        <span className="stat-label">Views</span>
                                        <div className="stat-value">12.482</div>
                                        <span className="stat-trend positive">↑ %100</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Leads</span>
                                        <div className="stat-value">8</div>
                                    </div>
                                </div>
                                <div className="stats-cta-box">
                                    <button
                                        className="btn-stats-action"
                                        onClick={() => {
                                            trackEvent('dashboard_click');
                                            navigate('/vendor-dashboard-demo');
                                        }}
                                    >
                                        {t('vip.cta.testDashboard')}
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* OFFICIAL PARTNER SECTION */}
                        {/* OFFICIAL PARTNER SECTION */}
                        {vendor?.vip_demo_config?.show_partner !== false && (
                            <section id="ekip" className="v2-section partner-black-box">
                                <div className="partner-header">
                                    <span className="partner-label">OFFICIAL PARTNER</span>
                                    <h2>{t('vip.sections.partnerTitle')}</h2>
                                </div>
                                <div className="partner-content">
                                    <img src="/hamza_karabulut_dj_performance.png" alt="DJ Hamza" className="partner-avatar" />
                                    <div className="partner-details">
                                        <h3>Hamza Karabulut</h3>
                                        <p className="partner-role">Official Music Director</p>
                                        <div className="partner-bio">
                                            "Excellence in music and entertainment."
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Yorumlar */}
                        {vendor?.vip_demo_config?.show_reviews !== false && (
                            <section id="yorum" className="v2-section">
                                <h2 className="v2-title">{t('vip.sections.reviewsTitle')}</h2>
                                <div className="v2-review-card">
                                    <div className="review-header">
                                        <span className="review-user">Zeynep & Ruşit</span>
                                        <div className="review-stars">⭐⭐⭐⭐⭐</div>
                                    </div>
                                    <p>"Mükemmel bir deneyimdi!"</p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sticky Sidebar */}
                    <aside className="v2-sidebar">
                        <div className="v2-sticky-form">
                            {/* Countdown Timer */}
                            {vendor?.vip_demo_config?.show_countdown !== false && (
                                <div className="countdown-banner">
                                    <span className="countdown-icon">⏰</span>
                                    <span className="countdown-text">
                                        <strong className="countdown-time">{formatTime(timeLeft)}</strong>
                                    </span>
                                </div>
                            )}

                            <h3>{t('vip.common.freeQuote')}</h3>
                            <p>{t('vip.common.fastResponse')}</p>
                            <div className="v2-form-mini">
                                <input
                                    type="text"
                                    placeholder={language === 'tr' ? "Ad Soyad" : "Name Surname"}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder={language === 'tr' ? "Telefon" : "Phone"}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <select
                                        value={formData.month}
                                        onChange={e => setFormData({ ...formData, month: e.target.value })}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    >
                                        <option value="">{language === 'tr' ? 'Ay Seçin' : 'Month'}</option>
                                        <option value="01">{language === 'tr' ? 'Ocak' : 'January'}</option>
                                        <option value="02">{language === 'tr' ? 'Şubat' : 'February'}</option>
                                        <option value="03">{language === 'tr' ? 'Mart' : 'March'}</option>
                                        <option value="04">{language === 'tr' ? 'Nisan' : 'April'}</option>
                                        <option value="05">{language === 'tr' ? 'Mayıs' : 'May'}</option>
                                        <option value="06">{language === 'tr' ? 'Haziran' : 'June'}</option>
                                        <option value="07">{language === 'tr' ? 'Temmuz' : 'July'}</option>
                                        <option value="08">{language === 'tr' ? 'Ağustos' : 'August'}</option>
                                        <option value="09">{language === 'tr' ? 'Eylül' : 'September'}</option>
                                        <option value="10">{language === 'tr' ? 'Ekim' : 'October'}</option>
                                        <option value="11">{language === 'tr' ? 'Kasım' : 'November'}</option>
                                        <option value="12">{language === 'tr' ? 'Aralık' : 'December'}</option>
                                    </select>
                                    <select
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    >
                                        <option>2026</option>
                                        <option>2027</option>
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    placeholder={language === 'tr' ? 'Tahmini Kişi Sayısı' : 'Guest Count'}
                                    value={formData.guestCount}
                                    onChange={e => setFormData({ ...formData, guestCount: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '10px' }}
                                />
                                <textarea
                                    placeholder={language === 'tr' ? 'Mesajınız (Opsiyonel)' : 'Your Message (Optional)'}
                                    value={formData.message || ''}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '10px', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                                <button className="btn-v2-submit" onClick={handleQuoteSubmit}>
                                    {t('vip.cta.getOffer')}
                                </button>
                            </div>
                            <div className="v2-direct-contact">
                                <button
                                    className="btn-v2-whatsapp"
                                    onClick={() => {
                                        trackEvent('whatsapp_click');
                                        const rawPhone = vendor?.vip_demo_config?.contact?.phone || '905555555555';
                                        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                                        const message = language === 'tr'
                                            ? `Merhaba ${venueName}, VIP Demo sayfanızı gördüm ve fiyat bilgisi almak istiyorum.`
                                            : (language === 'de'
                                                ? `Hallo ${venueName}, ich habe Ihre VIP Demo Seite gesehen und würde gerne Preisinformationen erhalten.`
                                                : `Hello ${venueName}, I saw your VIP Demo page and would like to get pricing information.`);
                                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                >
                                    💬 {t('vip.cta.whatsapp')}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* CLAIM PROFILE CTA */}
                <section className="v2-claim-section">
                    <div className="claim-box">
                        <div className="claim-content">
                            <h3>{t('vip.cta.claimTitle')}</h3>
                            <p>{t('vip.cta.claimDesc')}</p>
                        </div>
                        <button
                            className="btn-claim-now"
                            onClick={() => {
                                trackEvent('claim_click');
                                navigate(`/register?type=vendor&claim=${encodeURIComponent(venueName)}`);
                            }}
                        >
                            🔐 {t('vip.cta.claimProfile')}
                        </button>
                    </div>
                </section>
            </main>

            {/* Mobile Sticky CTA Bar */}
            <div className="mobile-cta-bar">
                <button
                    className="btn-v2-whatsapp"
                    onClick={() => {
                        trackEvent('whatsapp_click');
                        const rawPhone = vendor?.vip_demo_config?.contact?.phone || '905555555555';
                        const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                        const message = language === 'tr'
                            ? `Merhaba ${venueName}, VIP Demo sayfanızı gördüm ve fiyat bilgisi almak istiyorum.`
                            : (language === 'de'
                                ? `Hallo ${venueName}, ich habe Ihre VIP Demo Seite gesehen und würde gerne Preisinformationen erhalten.`
                                : `Hello ${venueName}, I saw your VIP Demo page and would like to get pricing information.`);
                        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                >
                    💬 {t('vip.cta.whatsapp')}
                </button>
                <button className="btn-v2-submit">{t('vip.cta.getOffer')}</button>
            </div>
        </div>
    );
};

export default VIPDemoPage;
