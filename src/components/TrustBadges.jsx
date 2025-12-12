import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './TrustBadges.css';

const TrustBadges = ({ badges }) => {
    const { language } = useLanguage();

    if (!badges?.enabled || !badges?.items?.length) {
        return null;
    }

    return (
        <div className="trust-badges-container">
            <div className="trust-badges">
                {badges.items.map((badge, index) => (
                    <div key={index} className="trust-badge">
                        <span className="trust-badge-icon">{badge.icon}</span>
                        <span className="trust-badge-text">
                            {badge.text?.[language] || badge.text?.tr || badge.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrustBadges;
