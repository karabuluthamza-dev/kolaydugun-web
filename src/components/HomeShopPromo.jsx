import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

/**
 * HomeShopPromo - Shop Marketplace promo section for Home page
 */
const HomeShopPromo = () => {
    const { language } = useLanguage();

    const texts = {
        tr: {
            title: 'Kendi Düğün Mağazanızı Açın',
            subtitle: 'Dijital davetiyeler, süslemeler, hediyeler ve daha fazlasını satın. Tedarikçilere özel Shop Marketplace!',
            viewDemo: '🎨 Demo Mağazayı İncele',
            viewPanel: '⚙️ Demo Paneli Gör',
            apply: 'Mağaza Başvurusu Yap →'
        },
        de: {
            title: 'Eröffnen Sie Ihren Hochzeits-Shop',
            subtitle: 'Verkaufen Sie digitale Einladungen, Dekorationen, Geschenke und mehr. Exklusiver Shop Marketplace für Anbieter!',
            viewDemo: '🎨 Demo-Shop ansehen',
            viewPanel: '⚙️ Demo-Panel ansehen',
            apply: 'Shop-Bewerbung einreichen →'
        },
        en: {
            title: 'Open Your Wedding Shop',
            subtitle: 'Sell digital invitations, decorations, gifts and more. Exclusive Shop Marketplace for vendors!',
            viewDemo: '🎨 View Demo Shop',
            viewPanel: '⚙️ View Demo Panel',
            apply: 'Apply for Shop →'
        }
    };

    const txt = texts[language] || texts.tr;

    return (
        <section style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '4rem 1rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-80px',
                right: '-80px',
                width: '250px',
                height: '250px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: 'white',
                    fontWeight: '500'
                }}>
                    🛍️ Shop Marketplace
                </div>

                <h2 style={{
                    color: 'white',
                    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                    marginBottom: '0.75rem',
                    textShadow: '0 2px 15px rgba(0,0,0,0.2)'
                }}>
                    {txt.title}
                </h2>

                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: '600px',
                    margin: '0 auto 1.5rem',
                    fontSize: '1.05rem',
                    lineHeight: '1.6'
                }}>
                    {txt.subtitle}
                </p>

                <div style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem'
                }}>
                    <a
                        href="/shop/magaza/wedding-essentials-demo-mj7uva80"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'white',
                            fontSize: '0.95rem',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px'
                        }}
                    >
                        {txt.viewDemo}
                    </a>
                    <a
                        href="/shop-panel/demo"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'white',
                            fontSize: '0.95rem',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px'
                        }}
                    >
                        {txt.viewPanel}
                    </a>
                </div>

                <Link
                    to="/shop/basvuru"
                    style={{
                        display: 'inline-block',
                        padding: '14px 40px',
                        background: 'white',
                        color: '#667eea',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        textDecoration: 'none',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {txt.apply}
                </Link>
            </div>
        </section>
    );
};

export default HomeShopPromo;
