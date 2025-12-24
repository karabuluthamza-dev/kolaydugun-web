import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Rocket, Zap, BarChart3 } from 'lucide-react';
import './VendorAcceleratorBanner.css';

const VendorAcceleratorBanner = ({ variant = 'hero' }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleAction = () => {
        navigate('/register?type=vendor&promo=accelerator');
    };

    if (variant === 'dashboard') {
        return (
            <div className="accelerator-banner dashboard">
                <div className="accent-glow"></div>
                <div className="content">
                    <Rocket className="icon-main" />
                    <p>{t('dashboard.accelerator.dashboardBanner')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="accelerator-banner-hero">
            <div className="hero-gradient-bg"></div>
            <div className="floating-elements">
                <div className="float-item one"><Zap size={40} /></div>
                <div className="float-item two"><BarChart3 size={30} /></div>
            </div>

            <div className="container banner-inner">
                <div className="badge">
                    <span className="pulse"></span>
                    {t('dashboard.demo.badge')}
                </div>

                <h2>{t('dashboard.accelerator.heroTitle')}</h2>
                <p>{t('dashboard.accelerator.heroSubtitle')}</p>

                <button className="cta-button" onClick={handleAction}>
                    {t('dashboard.accelerator.heroButton')}
                </button>
            </div>
        </div>
    );
};

export default VendorAcceleratorBanner;
