import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './AffiliateDisclosure.css';

/**
 * AffiliateDisclosure Component
 * 
 * German law (TMG) requires disclosure when affiliate links are used.
 * This component displays a notice informing users about affiliate links.
 * 
 * Placement: Must be visible on product pages with affiliate links.
 */
const AffiliateDisclosure = ({ compact = false }) => {
    const { language } = useLanguage();

    const texts = {
        tr: {
            title: 'Affiliate Bağlantısı',
            text: 'Bu bağlantı üzerinden yapılan alışverişlerde küçük bir komisyon alıyoruz. Sizin için fiyat değişmiyor.',
            compactText: '🔗 Affiliate bağlantısı'
        },
        de: {
            title: 'Affiliate-Link',
            text: 'Bei Käufen über diesen Link erhalten wir eine kleine Provision. Für Sie ändert sich der Preis nicht.',
            compactText: '🔗 Affiliate-Link'
        },
        en: {
            title: 'Affiliate Link',
            text: 'We earn a small commission on purchases made through this link. The price remains the same for you.',
            compactText: '🔗 Affiliate link'
        }
    };

    const t = texts[language] || texts.de;

    if (compact) {
        return (
            <div className="affiliate-disclosure-compact" title={t.text}>
                🔗 <strong>{t.title}:</strong> {t.text}
            </div>
        );
    }

    return (
        <div className="affiliate-disclosure">
            <div className="disclosure-icon">🔗</div>
            <div className="disclosure-content">
                <span className="disclosure-title">{t.title}:</span>
                <span className="disclosure-text">{t.text}</span>
            </div>
        </div>
    );
};

export default AffiliateDisclosure;
