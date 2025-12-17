import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useLanguage } from '../context/LanguageContext';

import CategoryGrid from '../components/CategoryGrid';

const VendorLanding = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { settings } = useSiteSettings();

    // Admin tarafından değiştirilebilir hero resmi
    const heroImage = settings?.vendor_hero_image || '/images/vendor-hero-bg.png';

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/vendors?search=${encodeURIComponent(searchQuery)}`);
        }
    };


    return (
        <div className="vendor-landing-page">
            {/* Hero Section with Background Image */}
            <div style={{
                background: `linear-gradient(135deg, rgba(255, 107, 157, 0.85) 0%, rgba(192, 132, 252, 0.85) 50%, rgba(129, 140, 248, 0.85) 100%), url('${heroImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: 'clamp(3rem, 8vw, 6rem) 1rem',
                marginTop: '-2rem',
                marginBottom: '0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <h1 style={{
                        color: 'white',
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        marginBottom: '1rem',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                        {t('vendorLanding.title')}
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                        maxWidth: '700px',
                        margin: '0 auto 2rem',
                        lineHeight: '1.6',
                        textShadow: '0 1px 5px rgba(0,0,0,0.2)'
                    }}>
                        {t('vendorLanding.heroSubtitle')}
                    </p>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} style={{
                        display: 'flex',
                        maxWidth: '600px',
                        margin: '0 auto',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <input
                            type="text"
                            placeholder={t('vendorLanding.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: '1',
                                minWidth: '250px',
                                padding: '16px 24px',
                                borderRadius: '50px',
                                border: 'none',
                                fontSize: '1rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '16px 32px',
                                borderRadius: '50px',
                                border: 'none',
                                background: 'white',
                                color: '#FF6B9D',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t('vendorLanding.searchButton')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Category Grid */}
            <CategoryGrid />

            {/* Shop Marketplace Promo Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '3rem 1rem',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h3 style={{
                        color: 'white',
                        fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                        marginBottom: '0.75rem',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                        🛍️ {language === 'tr' ? 'Kendi Mağazanızı da Açabilirsiniz!' :
                            language === 'de' ? 'Eröffnen Sie auch Ihren eigenen Shop!' :
                                'You Can Also Open Your Own Shop!'}
                    </h3>
                    <p style={{
                        color: 'rgba(255,255,255,0.9)',
                        marginBottom: '1.5rem',
                        maxWidth: '600px',
                        margin: '0 auto 1.5rem',
                        fontSize: '1rem'
                    }}>
                        {language === 'tr' ? 'KolayDugun Shop Marketplace\'te dijital davetiyeler, süslemeler ve hediyeler satın. İlk 10 tedarikçiye özel avantajlar!' :
                            language === 'de' ? 'Verkaufen Sie digitale Einladungen, Dekorationen und Geschenke im KolayDugun Shop Marketplace. Exklusive Vorteile für die ersten 10 Anbieter!' :
                                'Sell digital invitations, decorations and gifts in KolayDugun Shop Marketplace. Exclusive benefits for first 10 vendors!'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                        <a
                            href="/shop/magaza/wedding-essentials-demo-mj7uva80"
                            target="_blank"
                            style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: '0.95rem',
                                textDecoration: 'underline'
                            }}
                        >
                            🎨 {language === 'tr' ? 'Demo Mağazayı İncele' :
                                language === 'de' ? 'Demo-Shop ansehen' :
                                    'View Demo Shop'}
                        </a>
                        <a
                            href="/shop-panel/demo"
                            target="_blank"
                            style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: '0.95rem',
                                textDecoration: 'underline'
                            }}
                        >
                            ⚙️ {language === 'tr' ? 'Demo Paneli Gör' :
                                language === 'de' ? 'Demo-Panel ansehen' :
                                    'View Demo Panel'}
                        </a>
                    </div>
                    <Link
                        to="/shop/basvuru"
                        style={{
                            display: 'inline-block',
                            padding: '14px 36px',
                            background: 'white',
                            color: '#667eea',
                            borderRadius: '50px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {language === 'tr' ? 'Mağaza Başvurusu Yap →' :
                            language === 'de' ? 'Shop-Bewerbung einreichen →' :
                                'Apply for Shop →'}
                    </Link>
                </div>
            </div>

            {/* CTA Section */}
            <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%)',
                padding: '3.5rem 1rem',
                textAlign: 'center',
                borderTop: '1px solid rgba(255, 107, 157, 0.1)'
            }}>
                <div className="container">
                    <h3 style={{
                        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                        marginBottom: '0.75rem',
                        color: '#374151'
                    }}>
                        {t('vendorLanding.ctaTitle')}
                    </h3>
                    <p style={{
                        color: '#6b7280',
                        marginBottom: '1.25rem',
                        maxWidth: '450px',
                        margin: '0 auto 1.25rem'
                    }}>
                        {t('vendorLanding.ctaSubtitle')}
                    </p>
                    <Link
                        to="/register"
                        className="btn btn-primary"
                        style={{
                            padding: '12px 32px',
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>🚀</span> {t('nav.registerBtn')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VendorLanding;
