import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const LiveRequestBanner = () => {
    const { t, language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if banner was dismissed within last 7 days
        const dismissedAt = localStorage.getItem('liveRequestBannerDismissed');
        if (dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return; // Don't show banner
            }
        }
        // Show banner after a short delay for better UX
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('liveRequestBannerDismissed', Date.now().toString());
    };

    const translations = {
        tr: {
            badge: 'YENİ',
            title: 'Canlı Şarkı İstek Sistemi',
            desc: 'Misafirleriniz QR kod ile şarkı isteği göndersin!',
            cta: 'Hemen Üye Ol',
            learnMore: 'Nasıl Çalışır?'
        },
        de: {
            badge: 'NEU',
            title: 'Live Song Request System',
            desc: 'Gäste können per QR-Code Musikwünsche senden!',
            cta: 'Jetzt Registrieren',
            learnMore: 'Wie funktioniert es?'
        },
        en: {
            badge: 'NEW',
            title: 'Live Song Request System',
            desc: 'Let your guests request songs via QR code!',
            cta: 'Register Now',
            learnMore: 'How does it work?'
        }
    };

    const content = translations[language] || translations.tr;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="live-request-banner"
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                        padding: '16px 24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated background particles */}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    x: [0, 100, 0],
                                    y: [0, -50, 0],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                                style={{
                                    position: 'absolute',
                                    width: 100 + i * 20,
                                    height: 100 + i * 20,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                    left: `${i * 20}%`,
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            />
                        ))}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        flexWrap: 'wrap',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Icon with pulse */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Music style={{ color: 'white', width: 24, height: 24 }} />
                        </motion.div>

                        {/* Badge */}
                        <span style={{
                            background: '#fbbf24',
                            color: '#1f2937',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Sparkles style={{ width: 12, height: 12 }} />
                            {content.badge}
                        </span>

                        {/* Title & Description */}
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{
                                color: 'white',
                                margin: 0,
                                fontSize: '1.1rem',
                                fontWeight: 700
                            }}>
                                {content.title}
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.9)',
                                margin: '4px 0 0 0',
                                fontSize: '0.9rem'
                            }}>
                                {content.desc}
                            </p>
                        </div>

                        {/* CTA Button */}
                        <Link
                            to="/register?type=vendor"
                            style={{
                                background: 'white',
                                color: '#6366f1',
                                padding: '10px 24px',
                                borderRadius: '30px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                            }}
                        >
                            {content.cta}
                            <ArrowRight style={{ width: 16, height: 16 }} />
                        </Link>

                        {/* Demo Button */}
                        <Link
                            to="/live-demo"
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(255,255,255,0.4)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            <Sparkles style={{ width: 16, height: 16 }} />
                            Demo
                        </Link>

                        {/* Learn More Blog Link */}
                        <Link
                            to="/blog/canli-sarki-istek-sistemi"
                            style={{
                                color: 'white',
                                fontSize: '0.85rem',
                                textDecoration: 'underline',
                                opacity: 0.9,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                        >
                            {content.learnMore}
                        </Link>

                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            style={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            <X style={{ color: 'white', width: 18, height: 18 }} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LiveRequestBanner;
