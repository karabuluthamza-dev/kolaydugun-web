import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './PrivacyBanner.css';

const PrivacyBanner = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Show banner after a short delay
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-banner">
            <div className="cookie-content">
                <p>
                    {t('cookie.text')}{' '}
                    <Link to="/p/datenschutz" className="cookie-link">
                        {t('cookie.policyLink')}
                    </Link>.
                </p>
            </div>
            <div className="cookie-actions">
                <button onClick={handleDecline} className="btn-cookie btn-decline">
                    {t('cookie.decline')}
                </button>
                <button onClick={handleAccept} className="btn-cookie btn-accept">
                    {t('cookie.accept')}
                </button>
            </div>
        </div>
    );
};

export default PrivacyBanner;
