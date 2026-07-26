import i18n from '../../i18n';
import { dictionary } from '../../locales/dictionary';

export const DEFAULT_WHATSAPP_NUMBER = '+491628726192';

export const HANDOFF_CHANNELS = {
    WHATSAPP: 'whatsapp',
    PHONE: 'phone'
};

/**
 * Robust translation helper that uses the main i18next instance if initialized,
 * and falls back directly to traversing the local dictionary.js if i18n is not loaded.
 * 
 * @param {string} key - Dot-separated path to translation key
 * @param {string} lang - Requested language ('de', 'tr', 'en')
 * @param {Object} options - Interpolation variables
 * @returns {string}
 */
function getTranslation(key, lang = 'de', options = {}) {
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
        const val = node[lang] || node['de'] || node['tr'] || node['en'] || '';
        if (typeof val === 'string') {
            return val.replace(/\{\{(\w+)\}\}/g, (_, match) => options[match] ?? '');
        }
        return val;
    }

    return '';
}

class WhatsAppStrategy {
    generateLink(targetNumber = DEFAULT_WHATSAPP_NUMBER, data, language = 'de') {
        const text = data.isFormSubmission 
            ? this.buildFormMessage(data, language)
            : this.buildMessage(data, language);
            
        const phone = targetNumber || DEFAULT_WHATSAPP_NUMBER;
        const cleanNumber = phone.replace(/[^\d+]/g, '');
        return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    }

    /**
     * Builds structured inquiry form message formatted for WhatsApp
     * Uses clean native WhatsApp Markdown formatting (*bold*, • bullets)
     * to ensure 100% compatibility across all browsers and devices without broken emoji symbols.
     */
    buildFormMessage(data, lang) {
        const isTr = lang === 'tr';
        const isEn = lang === 'en';

        const header = isTr 
            ? '*KOLAYDÜĞÜN TALEP FORMU*' 
            : isEn 
            ? '*KOLAYDÜĞÜN INQUIRY FORM*' 
            : '*KOLAYDÜĞÜN ANFRAGEFORMULAR*';

        const nameLabel = isTr ? 'Ad Soyad' : isEn ? 'Full Name' : 'Name';
        const phoneLabel = isTr ? 'Telefon / WhatsApp' : isEn ? 'Phone / WhatsApp' : 'Telefon / WhatsApp';
        const categoryLabel = isTr ? 'Kategori' : isEn ? 'Category' : 'Kategorie';
        const cityLabel = isTr ? 'Şehir / Bölge' : isEn ? 'City / Location' : 'Stadt / Ort';
        const dateLabel = isTr ? 'Düğün Tarihi' : isEn ? 'Wedding Date' : 'Hochzeitsdatum';
        const guestsLabel = isTr ? 'Davetli Sayısı' : isEn ? 'Guest Count' : 'Gästeanzahl';
        const budgetLabel = isTr ? 'Tahmini Bütçe' : isEn ? 'Estimated Budget' : 'Geschätztes Budget';
        const servicesLabel = isTr ? 'İstenen Hizmetler' : isEn ? 'Requested Services' : 'Gewünschte Dienstleistungen';
        const vendorCompanyLabel = isTr ? 'Firma / Salon Adı' : isEn ? 'Company / Venue Name' : 'Firmen / Saalname';
        const vendorSectorLabel = isTr ? 'Hizmet Alanı' : isEn ? 'Service Sector' : 'Dienstleistungsbereich';
        const notesLabel = isTr ? 'Mesaj / Özel Notlar' : isEn ? 'Message / Special Notes' : 'Nachricht / Wünsche';

        // Strip non-standard emojis from category string to prevent URL encoding corruption
        const rawCategory = data.categoryLabel || data.category || '—';
        const cleanCategory = rawCategory
            .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .trim();

        let lines = [];
        lines.push(header);
        lines.push('────────────────────');
        lines.push(`• *${nameLabel}:* ${data.name || '—'}`);
        lines.push(`• *${phoneLabel}:* ${data.phone || '—'}`);
        lines.push(`• *${categoryLabel}:* ${cleanCategory}`);
        
        if (data.city) lines.push(`• *${cityLabel}:* ${data.city}`);
        if (data.date) lines.push(`• *${dateLabel}:* ${data.date}`);
        if (data.guests) lines.push(`• *${guestsLabel}:* ${data.guests}`);
        if (data.budget) lines.push(`• *${budgetLabel}:* ${data.budget} €`);
        
        if (data.companyName) lines.push(`• *${vendorCompanyLabel}:* ${data.companyName}`);
        if (data.vendorSector) lines.push(`• *${vendorSectorLabel}:* ${data.vendorSector}`);

        if (Array.isArray(data.services) && data.services.length > 0) {
            lines.push('');
            lines.push(`*${servicesLabel}:*`);
            data.services.forEach(s => lines.push(`  - ${s}`));
        }

        if (data.notes && data.notes.trim()) {
            lines.push('');
            lines.push(`*${notesLabel}:*`);
            lines.push(`"${data.notes.trim()}"`);
        }

        return lines.join('\n');
    }

    /**
     * Fallback for standard AI Handoff
     */
    buildMessage(data, lang) {
        const fallbackName = getTranslation('handoff.fallbackName', lang) || 'Ziyaretçi';
        const name = data.name || fallbackName;
        const greeting = getTranslation('handoff.greeting', lang, { name }) || `Merhaba, ben ${name}.`;
        const details = getTranslation('handoff.details', lang) || 'Düğün Detaylarım:';
        const cityLabel = getTranslation('handoff.city', lang) || 'Şehir';
        const dateLabel = getTranslation('handoff.date', lang) || 'Tarih';
        const guestsLabel = getTranslation('handoff.guests', lang) || 'Davetli Sayısı';
        const budgetLabel = getTranslation('handoff.budget', lang) || 'Bütçe';
        const categoryLabel = getTranslation('handoff.category', lang) || 'Kategori';
        const lastQueryLabel = getTranslation('handoff.lastQuery', lang) || 'Son Soru';

        return `${greeting}

*${details}*
- ${cityLabel}: ${data.city || '—'}
- ${dateLabel}: ${data.date || '—'}
- ${guestsLabel}: ${data.guests || '—'}
- ${budgetLabel}: ${data.budget ? `${data.budget} €` : '—'}
${data.category ? `- ${categoryLabel}: ${data.category}\n` : ''}${data.lastQuery ? `- ${lastQueryLabel}: "${data.lastQuery}"` : ''}`;
    }
}

class PhoneStrategy {
    generateLink(targetNumber = DEFAULT_WHATSAPP_NUMBER) {
        const phone = targetNumber || DEFAULT_WHATSAPP_NUMBER;
        const cleanNumber = phone.replace(/[^\d+]/g, '');
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

    getLink(channel, targetNumber = DEFAULT_WHATSAPP_NUMBER, data = {}, language = 'de') {
        const strategy = this.strategies[channel];
        if (!strategy) {
            throw new Error(`Unsupported handoff channel: ${channel}`);
        }
        return strategy.generateLink(targetNumber, data, language);
    }
}

export const handoffService = new HandoffService();
