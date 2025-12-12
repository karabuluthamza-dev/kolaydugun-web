import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Services.css';

const ServiceCard = ({ title, desc, icon, delay = 0 }) => (
    <div className="service-card" data-aos="fade-up" data-aos-delay={delay}>
        <div className="service-icon">
            {icon}
        </div>
        <h3 className="service-title">{title}</h3>
        <p className="service-desc">{desc}</p>
    </div>
);

const Services = () => {
    const { t } = useLanguage();

    return (
        <section id="services" className="section services-section">
            <div className="container">
                <h2 className="text-center mb-lg" data-aos="fade-up">{t('services.title')}</h2>

                <div className="services-grid">
                    <ServiceCard
                        title={t('services.venue')}
                        desc={t('services.venueDesc')}
                        icon="🏰"
                        delay={0}
                    />
                    <ServiceCard
                        title={t('services.catering')}
                        desc={t('services.cateringDesc')}
                        icon="🍽️"
                        delay={100}
                    />
                    <ServiceCard
                        title={t('services.decor')}
                        desc={t('services.decorDesc')}
                        icon="✨"
                        delay={200}
                    />
                    <ServiceCard
                        title={t('services.planning')}
                        desc={t('services.planningDesc')}
                        icon="📋"
                        delay={300}
                    />
                </div>
            </div>
        </section>
    );
};

export default Services;
