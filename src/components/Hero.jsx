import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, CITIES, COUNTRIES, POPULAR_CITIES, getCategoryTranslationKey } from '../constants/vendorData';
import { supabase } from '../supabaseClient';
import FakeOnlineCounter from './FakeOnlineCounter';
import TrustBadges from './TrustBadges';
import './Hero.css';

const Hero = ({ title, subtitle, backgroundImage, onlineConfig, trustBadges, heroSettings }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [country, setCountry] = useState('DE');
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [popularCities, setPopularCities] = useState(POPULAR_CITIES); // Start with fallback
    const videoRef = useRef(null);

    // Load popular cities from database
    useEffect(() => {
        const loadPopularCities = async () => {
            try {
                const { data, error } = await supabase
                    .from('admin_popular_cities')
                    .select('city_name')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setPopularCities(data.map(c => c.city_name));
                }
            } catch (error) {
                console.error('Failed to load popular cities, using fallback:', error);
                // Keep using POPULAR_CITIES fallback
            }
        };

        loadPopularCities();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (country) params.append('country', country);
        if (city) params.append('city', city);
        if (category) params.append('category', category);
        navigate(`/vendors?${params.toString()}`);
    };

    // Check if video background is enabled
    // Support both 'use_video' (boolean) and 'background_type === "video"'
    const hasVideo = (heroSettings?.use_video || heroSettings?.background_type === 'video') && heroSettings?.video_url;

    // Manage video playback state
    useEffect(() => {
        if (!hasVideo) return;

        const video = videoRef.current;
        if (!video) return;

        // Auto-play attempt
        const playVideo = async () => {
            try {
                if (video.paused) {
                    await video.play();
                }
            } catch (err) {
                console.warn('Video autoplay failed, will wait for user interaction:', err);
            }
        };

        // Standard canplay event is enough
        video.addEventListener('canplay', playVideo);

        // One-time interaction listener as safety net for aggressive autoplay blocks
        const handleInteraction = () => {
            playVideo();
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
            video.removeEventListener('canplay', playVideo);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
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
                    poster={heroSettings?.hero_image || backgroundImage || ''}
                    disablePictureInPicture
                    disableRemotePlayback
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
                        className="hero-search-input country-select"
                        value={country}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            setCity(''); // Reset city when country changes
                        }}
                        aria-label="Select Country"
                    >
                        {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c[language] || c.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="hero-search-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        aria-label="Select City"
                    >
                        <option value="">{t('search.cityPlaceholder') || 'Stadt wählen'}</option>
                        {/* Show Country specific popular cities if available, or just fallback */}
                        {popularCities.map((c) => (
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
