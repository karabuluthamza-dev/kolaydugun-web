const fs = require('fs');
const filePath = 'src/locales/dictionary.js';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add planningTools.guests right after planningTools.budget
const budgetTarget = `"budgetDesc": {
            "en": "Keep track of your expenses.",
            "de": "Behalten Sie Ihre Ausgaben im Blick.",
            "tr": "Evlenirken nelere para harcayacağını tek tek kontrol et, hesabını en baştan tut!"
        },`;

const guestsEntry = `
        "guests": {
            "en": "Guest List",
            "de": "Gästeliste",
            "tr": "Davetli Listesi",
            "title": {
                "en": "Guest List",
                "de": "Gästeliste",
                "tr": "Davetli Listesi"
            },
            "desc": {
                "en": "Manage your guests, track RSVPs and meal choices.",
                "de": "Verwalten Sie Ihre Gäste, verfolgen Sie Rückmeldungen und Essenswünsche.",
                "tr": "Davetlilerinizi listeleyin, LCV (RSVP) durumlarını ve yemek tercihlerini takip edin."
            }
        },
        "guestsDesc": {
            "en": "Manage your wedding guest list and RSVPs easily.",
            "de": "Verwalten Sie Ihre Hochzeitsgästeliste und Rückmeldungen einfach.",
            "tr": "Davetlilerinizi listeleyin, LCV (RSVP) durumlarını ve yemek tercihlerini kolayca takip edin!"
        },`;

if (!code.includes('"guests": {')) {
    code = code.replace(budgetTarget, budgetTarget + guestsEntry);
    console.log('✅ Added planningTools.guests');
} else {
    console.log('ℹ️ planningTools.guests already exists');
}

// 2. Add guestsManager dictionary entry at the bottom before export
const guestsManagerEntry = `
    guestsManager: {
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
    },
`;

if (!code.includes('guestsManager: {')) {
    const lastExport = 'export const dictionary';
    code = code.replace(lastExport, guestsManagerEntry + '\n' + lastExport);
    console.log('✅ Added guestsManager');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 dictionary.js successfully updated!');
