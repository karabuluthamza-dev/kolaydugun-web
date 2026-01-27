import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './PlanningTools.css';

const PlanningTools = () => {
    const { t } = useLanguage();

    const tools = [
        {
            key: 'website',
            icon: '💌',
            link: '/tools/website'
        },
        {
            key: 'timeline',
            icon: '📋',
            link: '/tools/timeline'
        },
        {
            key: 'budget',
            icon: '💰',
            link: '/tools/budget'
        },
        {
            key: 'liveDJ',
            icon: '🎧',
            link: '/canli-istek-sistemi'
        },
        {
            key: 'weather',
            icon: '🌤️',
            link: '/tools/weather'
        }
    ];

    return (
        <section className="section container planning-tools-section">
            <div className="planning-tools-header">
                <h2 className="planning-tools-title">{t('planningTools.title')}</h2>
                <p className="planning-tools-subtitle">{t('planningTools.subtitle')}</p>
                <Link to="/register" className="btn btn-primary planning-tools-cta">
                    {t('planningTools.cta')}
                </Link>
            </div>

            <div className="planning-tools-grid">
                {tools.map(tool => (
                    <div
                        key={tool.key}
                        className={`planning-tool-card ${tool.key === 'liveDJ' ? 'featured-tool' : ''}`}
                    >
                        <span className="planning-tool-badge">
                            {tool.key === 'liveDJ' ? t('planningTools.trial') : t('planningTools.free')}
                        </span>
                        <div className="planning-tool-icon-wrapper">
                            <span className="planning-tool-icon" role="img" aria-hidden="true">{tool.icon}</span>
                        </div>
                        <h3 className="planning-tool-name">{t(`planningTools.${tool.key}.title`)}</h3>
                        <p className="planning-tool-desc">{t(`planningTools.${tool.key}.desc`)}</p>
                        <Link to={tool.link} className="planning-tool-link">
                            {t('planningTools.cta')}
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PlanningTools;


