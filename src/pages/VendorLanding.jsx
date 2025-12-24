import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useLanguage } from '../context/LanguageContext';

import CategoryGrid from '../components/CategoryGrid';
import VendorAcceleratorBanner from '../components/VendorAcceleratorBanner';

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

            {/* Premium CTA Section */}
            <div style={{
                background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
                padding: '6rem 1rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(192, 132, 252, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-100px',
                    left: '-100px',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255, 107, 157, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        padding: '3rem 2rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'white',
                            padding: '8px 16px',
                            borderRadius: '50px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#FF6B9D',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 12px rgba(255, 107, 157, 0.15)'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>✨</span>
                            4500+ Tedarikçiye Katılın
                        </div>

                        <h3 style={{
                            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            color: '#1f2937',
                            lineHeight: '1.2'
                        }}>
                            {t('vendorLanding.ctaTitle')}
                        </h3>

                        <p style={{
                            color: '#6b7280',
                            fontSize: '1.1rem',
                            lineHeight: '1.7',
                            marginBottom: '2.5rem',
                            maxWidth: '600px',
                            margin: '0 auto 2.5rem'
                        }}>
                            {t('vendorLanding.ctaSubtitle')}
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link
                                to="/register?type=vendor"
                                className="btn btn-primary"
                                style={{
                                    padding: '16px 40px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 30px rgba(255, 107, 157, 0.3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <span>🚀</span> {t('nav.registerBtn')}
                            </Link>

                            <Link
                                to="/vendors"
                                className="btn btn-outline"
                                style={{
                                    padding: '16px 40px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    borderRadius: '16px',
                                    border: '2px solid #e5e7eb',
                                    background: 'white',
                                    color: '#4b5563',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {t('nav.services')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLanding;
