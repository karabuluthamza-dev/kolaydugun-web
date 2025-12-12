import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, CITIES, getCategoryTranslationKey } from '../constants/vendorData';
import FakeOnlineCounter from './FakeOnlineCounter';
import TrustBadges from './TrustBadges';
import './Hero.css';

const Hero = ({ title, subtitle, backgroundImage, onlineConfig, trustBadges, heroSettings }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const videoRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (category) params.append('category', category);
        navigate(`/vendors?${params.toString()}`);
    };

    // Check if video background is enabled
    const hasVideo = heroSettings?.use_video && heroSettings?.video_url;

    // Force video to play - robust approach
    useEffect(() => {
        if (!hasVideo) return;

        const video = videoRef.current;
        if (!video) return;

        const attemptPlay = () => {
            if (video.paused) {
                video.play().catch(() => {
                    // Silently handle - will retry
                });
            }
        };

        // Try to play immediately
        attemptPlay();

        // Retry every 500ms for first 3 seconds
        const retryInterval = setInterval(attemptPlay, 500);
        setTimeout(() => clearInterval(retryInterval), 3000);

        // Also play on user interaction with page
        const handleInteraction = () => attemptPlay();
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('scroll', handleInteraction, { once: true });

        return () => {
            clearInterval(retryInterval);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('scroll', handleInteraction);
        };
    }, [hasVideo, heroSettings?.video_url]);

    // Only show background image when video is NOT enabled
    const heroStyle = hasVideo
        ? { background: '#1a1a2e' }
        : backgroundImage
            ? {
                background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url("${backgroundImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }
            : {};

    return (
        <section id="home" className={`hero-section ${hasVideo ? 'has-video' : ''}`} style={heroStyle}>
            {/* Video Background */}
            {hasVideo && (
                <video
                    ref={videoRef}
                    className="hero-video-bg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                >
                    <source src={heroSettings.video_url} type="video/mp4" />
                </video>
            )}
            <div className="hero-overlay"></div>

            <div className="container hero-content">
                <div className="hero-counter-wrapper">
                    <FakeOnlineCounter config={onlineConfig} />
                </div>
                <h1 className="hero-title">
                    {title || t('hero.title')}
                </h1>
                <p className="hero-subtitle">
                    {subtitle || t('hero.subtitle')}
                </p>

                {/* Trust Badges */}
                <TrustBadges badges={trustBadges} />

                <form className="hero-search-form" onSubmit={handleSearch}>
                    <select
                        className="hero-search-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        aria-label="Select City"
                    >
                        <option value="">{t('search.cityPlaceholder') || 'Stadt wählen'}</option>
                        {CITIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <select
                        className="hero-search-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label="Select Category"
                    >
                        <option value="">{t('search.categoryPlaceholder') || 'Kategorie wählen'}</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {t('categories.' + getCategoryTranslationKey(cat))}
                            </option>
                        ))}
                    </select>

                    <button type="submit" className="btn btn-primary hero-search-btn">
                        {t('search.button') || 'ARA'}
                    </button>
                </form>

                <div className="hero-cta-container">
                    <button
                        type="button"
                        className="hero-cta-button"
                        onClick={() => navigate('/contact')}
                    >
                        <span className="cta-icon">✨</span>
                        <span className="cta-text">{t('hero.getFreeQuote')}</span>
                        <span className="cta-subtext">{t('hero.ctaSubtext')}</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
