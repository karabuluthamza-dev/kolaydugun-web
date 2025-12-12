import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './FloatingCTA.css';

const FloatingCTA = ({ settings }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling 500px
            setIsVisible(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Don't show if disabled in settings
    if (!settings?.show_floating) return null;

    return (
        <button
            className={`floating-cta ${isVisible ? 'visible' : ''}`}
            onClick={() => navigate('/contact')}
            aria-label="Ücretsiz Teklif Al"
        >
            <span className="floating-cta-icon">💌</span>
            <span className="floating-cta-text">{t('hero.getFreeQuote') || 'Ücretsiz Teklif'}</span>
        </button>
    );
};

export default FloatingCTA;
