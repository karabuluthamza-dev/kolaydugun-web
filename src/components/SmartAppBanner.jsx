import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { usePWAInstall } from '../context/PWAInstallContext';
import { useLanguage } from '../context/LanguageContext';
import './SmartAppBanner.css';

const SmartAppBanner = () => {
    const { isInstallable, isInstalled, installPWA } = usePWAInstall();
    const languageContext = useLanguage();
    const { t } = languageContext;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show banner only on mobile and if not already installed
        const isMobile = window.innerWidth < 1024;
        const wasDismissed = localStorage.getItem('pwa-banner-dismissed');

        if (isMobile && !isInstalled && isInstallable && !wasDismissed) {
            setIsVisible(true);
        }
    }, [isInstallable, isInstalled]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-banner-dismissed', 'true');
    };

    const handleInstall = () => {
        installPWA();
        setIsVisible(false);
    };

    if (!isVisible) return null;

    // Detect iOS to show special instructions if needed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    return (
        <div className="smart-app-banner">
            <button className="banner-close" onClick={handleDismiss} aria-label="Kapat">
                <X size={18} />
            </button>

            <div className="banner-icon">
                <img src="/pwa-icon.png" alt="KolayDüğün Uygulama İkonu" width="48" height="48" loading="lazy" decoding="async" />
            </div>

            <div className="banner-content">
                <h3>KolayDüğün</h3>
                <p>{isIOS ? t('pwa.iosInstructions') : t('pwa.installText')}</p>
            </div>

            {isIOS ? (
                <div className="ios-share-hint">
                    <Share size={16} />
                </div>
            ) : (
                <button className="banner-install-btn" onClick={handleInstall}>
                    <Download size={16} />
                    <span>{t('pwa.install')}</span>
                </button>
            )}
        </div>
    );
};

export default SmartAppBanner;
