const fs = require('fs');
const filePath = 'src/locales/dictionary.js';
let code = fs.readFileSync(filePath, 'utf8');

// Remove invalid top lines if guestsManager: { ... } was prepended before export
if (code.startsWith('\n    guestsManager: {')) {
    const exportIdx = code.indexOf('export const dictionary');
    code = code.substring(exportIdx);
}

// Append dictionary.guestsManager = { ... }; at the very end
const guestsManagerBlock = `
dictionary.guestsManager = {
    title: { en: 'Guest List', de: 'Gästeliste', tr: 'Davetli Listesi' },
    totalGuests: { en: 'Total Guests', de: 'Gäste Gesamt', tr: 'Toplam Davetli' },
    name: { en: 'Name', de: 'Name', tr: 'Ad Soyad' },
    rsvp: { en: 'RSVP', de: 'Rückmeldung', tr: 'LCV (RSVP)' },
    meal: { en: 'Meal Preference', de: 'Essenswunsch', tr: 'Yemek Tercihi' },
    action: { en: 'Action', de: 'Aktion', tr: 'İşlem' },
    addGuest: { en: 'Add Guest', de: 'Gast hinzufügen', tr: 'Davetli Ekle' },
    guestNamePlaceholder: { en: 'Guest Name', de: 'Name des Gastes', tr: 'Davetli Adı Soyadı' },
    remove: { en: 'Remove', de: 'Entfernen', tr: 'Kaldır' },
    pending: { en: 'Pending', de: 'Ausstehend', tr: 'Beklemede' },
    confirmed: { en: 'Confirmed', de: 'Zugesagt', tr: 'Onaylandı' },
    declined: { en: 'Declined', de: 'Abgesagt', tr: 'Reddedildi' }
};
`;

if (!code.includes('dictionary.guestsManager =')) {
    code = code.trim() + '\n' + guestsManagerBlock;
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ dictionary.js syntax fixed!');
