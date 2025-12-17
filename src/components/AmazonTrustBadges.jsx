import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './AmazonTrustBadges.css';

/**
 * AmazonTrustBadges Component
 * 
 * Displays trust-building badges specific to Amazon products:
 * - Amazon guarantee
 * - Fast shipping
 * - Easy returns
 * - Secure payment
 */
const AmazonTrustBadges = ({ compact = false }) => {
    const { language } = useLanguage();

    const badges = {
        tr: [
            { icon: '🛡️', text: 'Amazon Güvencesi', compact: 'Amazon' },
            { icon: '🚚', text: 'Prime Hızlı Kargo', compact: 'Hızlı' },
            { icon: '↩️', text: '30 Gün İade', compact: 'İade' },
            { icon: '🔒', text: 'Güvenli Ödeme', compact: 'Güvenli' }
        ],
        de: [
            { icon: '🛡️', text: 'Amazon Garantie', compact: 'Amazon' },
            { icon: '🚚', text: 'Prime Schnellversand', compact: 'Schnell' },
            { icon: '↩️', text: '30 Tage Rückgabe', compact: 'Rückgabe' },
            { icon: '🔒', text: 'Sichere Zahlung', compact: 'Sicher' }
        ],
        en: [
            { icon: '🛡️', text: 'Amazon Guarantee', compact: 'Amazon' },
            { icon: '🚚', text: 'Prime Fast Shipping', compact: 'Fast' },
            { icon: '↩️', text: '30-Day Returns', compact: 'Returns' },
            { icon: '🔒', text: 'Secure Payment', compact: 'Secure' }
        ]
    };

    const currentBadges = badges[language] || badges.de;

    return (
        <div className={`amazon-trust-badges ${compact ? 'compact' : ''}`}>
            {currentBadges.map((badge, idx) => (
                <div key={idx} className="amazon-badge">
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-text">{compact ? badge.compact : badge.text}</span>
                </div>
            ))}
        </div>
    );
};

export default AmazonTrustBadges;
