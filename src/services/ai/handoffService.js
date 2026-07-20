import i18n from '../../i18n';
import { dictionary } from '../../locales/dictionary';

export const HANDOFF_CHANNELS = {
    WHATSAPP: 'whatsapp',
    PHONE: 'phone'
};

/**
 * Robust translation helper that uses the main i18next instance if initialized,
 * and falls back directly to traversing the local dictionary.js if i18n is not loaded.
 * Ensures the service works under any environment (testing, pre-rendering, etc.).
 * 
 * @param {string} key - Dot-separated path to translation key (e.g. 'handoff.greeting')
 * @param {string} lang - The requested language ('de', 'tr', 'en')
 * @param {Object} options - Interpolation variables (e.g. { name: 'Ahmet' })
 * @returns {string}
 */
function getTranslation(key, lang, options = {}) {
    if (i18n && typeof i18n.t === 'function' && i18n.isInitialized) {
        return i18n.t(key, { lng: lang, ...options });
    }

    const parts = key.split('.');
    let node = dictionary;
    for (const part of parts) {
        if (node && node[part] !== undefined) {
            node = node[part];
        } else {
            node = null;
            break;
        }
    }

    if (node && typeof node === 'object') {
        const val = node[lang] || node['de'] || node['en'] || '';
        if (typeof val === 'string') {
            return val.replace(/\{\{(\w+)\}\}/g, (_, match) => options[match] ?? '');
        }
        return val;
    }

    return '';
}

class WhatsAppStrategy {
    generateLink(targetNumber, data, language) {
        const text = this.buildMessage(data, language);
        // Remove non-numeric characters from phone number
        const cleanNumber = targetNumber.replace(/[^\d+]/g, '');
        return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    }

    buildMessage(data, lang) {
        const fallbackName = getTranslation('handoff.fallbackName', lang);
        const name = data.name || fallbackName;
        const greeting = getTranslation('handoff.greeting', lang, { name });
        const details = getTranslation('handoff.details', lang);
        const cityLabel = getTranslation('handoff.city', lang);
        const dateLabel = getTranslation('handoff.date', lang);
        const guestsLabel = getTranslation('handoff.guests', lang);
        const budgetLabel = getTranslation('handoff.budget', lang);
        const categoryLabel = getTranslation('handoff.category', lang);
        const lastQueryLabel = getTranslation('handoff.lastQuery', lang);

        return `${greeting}

📍 ${details}
- ${cityLabel}: ${data.city || '—'}
- ${dateLabel}: ${data.date || '—'}
- ${guestsLabel}: ${data.guests || '—'}
- ${budgetLabel}: ${data.budget || '—'} €
${data.category ? `- ${categoryLabel}: ${data.category}\n` : ''}${data.lastQuery ? `- ${lastQueryLabel}: "${data.lastQuery}"` : ''}`;
    }
}

class PhoneStrategy {
    generateLink(targetNumber) {
        const cleanNumber = targetNumber.replace(/[^\d+]/g, '');
        return `tel:${cleanNumber}`;
    }
}

class HandoffService {
    constructor() {
        this.strategies = {
            [HANDOFF_CHANNELS.WHATSAPP]: new WhatsAppStrategy(),
            [HANDOFF_CHANNELS.PHONE]: new PhoneStrategy()
        };
    }

    getLink(channel, targetNumber, data = {}, language = 'de') {
        const strategy = this.strategies[channel];
        if (!strategy) {
            throw new Error(`Unsupported handoff channel: ${channel}`);
        }
        return strategy.generateLink(targetNumber, data, language);
    }
}

export const handoffService = new HandoffService();
