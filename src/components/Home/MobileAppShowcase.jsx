import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Smartphone, Bell, Zap, Cloud } from 'lucide-react';
import './MobileAppShowcase.css';

const MobileAppShowcase = () => {
    const { t } = useLanguage();

    return (
        <section className="mobile-app-showcase">
            <div className="container mx-auto">
                <div className="showcase-grid">
                    <div className="showcase-content" data-aos="fade-right">
                        <span className="badge">{t('pwa.mobileExperience') || 'Mobil Deneyim'}</span>
                        <h2>{t('pwa.showcaseTitle')}</h2>
                        <p>{t('pwa.showcaseText')}</p>

                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon"><Bell size={20} /></div>
                                <div>
                                    <h3>{t('pwa.feature1Title') || 'Anlık Bildirimler'}</h3>
                                    <p>{t('pwa.feature1Text') || 'Düğün hazırlıklarında hiçbir detayı kaçırmayın.'}</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Zap size={20} /></div>
                                <div>
                                    <h3>{t('pwa.feature2Title') || 'Hızlı Erişim'}</h3>
                                    <p>{t('pwa.feature2Text') || 'Ana ekranınızdan tek tıkla platforma ulaşın.'}</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Cloud size={20} /></div>
                                <div>
                                    <h3>{t('pwa.feature3Title') || 'Çevrimdışı Mod'}</h3>
                                    <p>{t('pwa.feature3Text') || 'Planlarınıza internetiniz olmasa bile göz atın.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="showcase-visual" data-aos="fade-left">
                        <div className="mockup-container">
                            <img
                                src="/mobile-app-preview.png"
                                alt={t('pwa.showcaseAlt', 'KolayDugun Mobile App Vorschau')}
                                className="app-mockup-img"
                                loading="lazy"
                                decoding="async"
                                width="380"
                                height="780"
                            />
                        </div>
                        <div className="floating-elements">
                            <div className="float-card card-1"><Smartphone size={24} /></div>
                            <div className="float-card card-2"><Zap size={24} /></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MobileAppShowcase;
