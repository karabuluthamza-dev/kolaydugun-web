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
    const [videoLoaded, setVideoLoaded] = useState(false);

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

    // Lazy load video - start loading after initial paint for better LCP
    useEffect(() => {
        if (!hasVideo) return;

        // Delay video load to prioritize LCP (2 seconds to ensure LCP completes first)
        const loadTimer = setTimeout(() => {
            setVideoLoaded(true);
        }, 2000); // Increased delay for LCP optimization

        return () => clearTimeout(loadTimer);
    }, [hasVideo]);

    // Manage video playback state
    useEffect(() => {
        if (!hasVideo || !videoLoaded) return;

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
    }, [hasVideo, videoLoaded, heroSettings?.video_url]);


    // Only show background image when video is NOT enabled
    const heroStyle = hasVideo
        ? { background: '#1a1a2e' }
        : backgroundImage
            ? {
                background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("${backgroundImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }
            : {};

    return (
        <section id="home" className={`hero-section ${hasVideo ? 'has-video' : ''}`} style={heroStyle}>
            {/* Video Background */}
            {hasVideo && (
                <>
                    {/* Gradient placeholder for instant LCP - no image load required */}
                    {!videoLoaded && (
                        <div
                            className="hero-poster-bg"
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 50%, #1a1a2e 100%)',
                            }}
                        />
                    )}
                    {/* Video loads after LCP */}
                    {videoLoaded && (
                        <video
                            ref={videoRef}
                            className="hero-video-bg"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="none"
                            poster={heroSettings?.poster_image || '/hero-image.png'}
                            disablePictureInPicture
                            disableRemotePlayback
                            aria-hidden="true"
                        >
                            <source src={heroSettings.video_url} type="video/mp4" />
                        </video>
                    )}
                </>
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
                    <label htmlFor="country-search" className="sr-only">{t('search.label.country', 'Land wählen')}</label>
                    <select
                        id="country-search"
                        className="hero-search-input country-select"
                        value={country}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            setCity(''); // Reset city when country changes
                        }}
                    >
                        {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c[language] || c.name}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="city-search" className="sr-only">{t('search.label.city', 'Stadt wählen')}</label>
                    <select
                        id="city-search"
                        className="hero-search-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="">{t('search.cityPlaceholder') || 'Stadt wählen'}</option>
                        {/* Show Country specific popular cities if available, or just fallback */}
                        {popularCities.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="category-search" className="sr-only">{t('search.label.category', 'Kategorie wählen')}</label>
                    <select
                        id="category-search"
                        className="hero-search-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                        <span className="cta-icon" role="img" aria-hidden="true">✨</span>
                        <span className="cta-text">{t('hero.getFreeQuote')}</span>
                        <span className="cta-subtext">{t('hero.ctaSubtext')}</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
