const fs = require('fs');
const path = './src/locales/dictionary.js';

let content = fs.readFileSync(path, 'utf8');

// Ensure vip.whatsappForm has catGeneral and required keys
const newWhatsappFormKeys = `
        catGeneral: {
            en: "❓ General Inquiry",
            de: "❓ Allgemeine Anfrage",
            tr: "❓ Genel Soru & İletişim"
        },
        requiredError: {
            en: "Please fill in all required fields (Name & Phone).",
            de: "Bitte füllen Sie die Pflichtfelder aus (Name & Telefon).",
            tr: "Lütfen zorunlu alanları (Ad Soyad & Telefon) doldurun."
        },
        submitBtn: {
            en: "Send via WhatsApp",
            de: "Per WhatsApp senden",
            tr: "WhatsApp'tan Gönder"
        },
        labels: {
            fullName: { en: "Full Name *", de: "Vollständiger Name *", tr: "Ad Soyad *" },
            phone: { en: "Phone / WhatsApp *", de: "Telefon / WhatsApp *", tr: "Telefon / WhatsApp *" },
            city: { en: "City / Region", de: "Stadt / Region", tr: "Şehir / Bölge" },
            date: { en: "Wedding Date", de: "Hochzeitsdatum", tr: "Düğün Tarihi" },
            guests: { en: "Estimated Guests", de: "Geschätzte Gäste", tr: "Tahmini Davetli Sayısı" },
            budget: { en: "Target Budget (€)", de: "Zielbudget (€)", tr: "Tahmini Bütçe (€)" },
            companyName: { en: "Company / Venue Name", de: "Firmen- / Saalname", tr: "Firma / Salon Adı" },
            vendorSector: { en: "Service Sector", de: "Dienstleistungsbereich", tr: "Hizmet Alanı" },
            servicesNeeded: { en: "Services Needed", de: "Benötigte Dienstleistungen", tr: "İhtiyaç Duyduğunuz Hizmetler" },
            notes: { en: "Message / Notes", de: "Nachricht / Wünsche", tr: "Mesajınız / Özel Notlar" }
        },
        placeholders: {
            fullName: { en: "e.g. John Doe", de: "z.B. Max Mustermann", tr: "Örn: Ahmet Yılmaz" },
            phone: { en: "e.g. +49 162 8726192", de: "z.B. +49 162 8726192", tr: "Örn: +49 162 8726192" },
            city: { en: "e.g. Frankfurt, Munich", de: "z.B. Frankfurt, München", tr: "Örn: Frankfurt, München" },
            guests: { en: "e.g. 200", de: "z.B. 200", tr: "Örn: 200" },
            budget: { en: "e.g. 15000", de: "z.B. 15000", tr: "Örn: 15000" },
            companyName: { en: "e.g. Royal Wedding Hall", de: "z.B. Grand Saal Mainz", tr: "Örn: Kral Düğün Salonu" },
            vendorSector: { en: "e.g. Photography / Venue", de: "z.B. Fotografie / Location", tr: "Örn: Fotoğraf / Mekan" },
            notes: { en: "Write your requests or questions here...", de: "Schreiben Sie Ihre Wünsche oder Fragen hier...", tr: "İsteklerinizi veya sorularınızı buraya yazabilirsiniz..." }
        },
        services: {
            venue: { en: "Wedding Venue", de: "Hochzeitslocation", tr: "Düğün Salonu" },
            photo: { en: "Photo & Video", de: "Foto & Video", tr: "Fotoğraf & Video" },
            dress: { en: "Bridal & Suit", de: "Brautkleid & Anzug", tr: "Gelinlik & Damatlık" },
            music: { en: "Music / DJ", de: "Musik / DJ", tr: "Müzik / DJ" },
            deco: { en: "Decoration", de: "Dekoration", tr: "Süsleme & Dekor" },
            catering: { en: "Catering", de: "Catering", tr: "Catering & Yemek" }
        },`;

if (!content.includes('labels: {')) {
    content = content.replace(
        'catVendor: { en: "🤝 Vendor & Partnership", de: "🤝 Partner & Dienstleister-Anmeldung", tr: "🤝 Tedarikçi & İş Ortaklığı" },',
        'catVendor: { en: "🤝 Vendor & Partnership", de: "🤝 Partner & Dienstleister-Anmeldung", tr: "🤝 Tedarikçi & İş Ortaklığı" },' + newWhatsappFormKeys
    );
}

// Update top-level dictionary.whatsappForm and dictionary.aiChat exports at end of file
const updatedFooter = `
dictionary.whatsappForm = dictionary.vip?.whatsappForm || {};
if (dictionary.vip?.whatsappForm) {
    Object.assign(dictionary.whatsappForm, dictionary.vip.whatsappForm);
}

dictionary.aiChat = {
    headerTitle: { en: 'KolayDüğün WhatsApp & Assistant', de: 'KolayDüğün WhatsApp & KI-Assistent', tr: 'KolayDüğün WhatsApp & Asistan' },
    onlineStatus: { en: 'online', de: 'online', tr: 'çevrimiçi' },
    chatHistory: { en: 'Chat History', de: 'Verlauf', tr: 'Sohbet Geçmişi' },
    newChatBtn: { en: 'New', de: 'Neu', tr: 'Yeni' },
    triggerBadge: { en: 'WhatsApp & AI', de: 'WhatsApp & KI', tr: 'WhatsApp & Asistan' },
    triggerTooltip: { en: 'AI Wedding Assistant', de: 'KI-Hochzeitsplaner', tr: 'Yapay Zekâ Düğün Asistanı' },
    title: { en: 'AI Wedding Planner', de: 'KI-Hochzeitsplaner', tr: 'Yapay Zekâ Düğün Asistanı' },
    placeholder: { en: 'Type your message here...', de: 'Schreiben Sie Ihre Nachricht...', tr: 'Mesajınızı buraya yazın...' },
    newChat: { en: 'New Chat', de: 'Neuer Chat', tr: 'Yeni Sohbet' },
    deleteChat: { en: 'Delete Chat', de: 'Chat löschen', tr: 'Sohbeti Sil' },
    guestWelcomeTitle: { en: 'Meet Your AI Wedding Planner!', de: 'Lernen Sie Ihren KI-Hochzeitsplaner kennen!', tr: 'Yapay Zekâ Düğün Asistanıyla Tanışın!' },
    guestWelcomeDesc: { en: 'Plan your dream wedding effortlessly!', de: 'Planen Sie Ihre Traumhochzeit mühelos!', tr: 'Hayalinizdeki düğünü kolayca planlayın!' },
    loginBtn: { en: 'Log In', de: 'Einloggen', tr: 'Giriş Yap' },
    registerBtn: { en: 'Register Now', de: 'Jetzt registrieren', tr: 'Şimdi Üye Ol' },
    handoffTooltip: { en: 'Contact Support via WhatsApp', de: 'Support per WhatsApp kontaktieren', tr: 'WhatsApp ile Canlı Desteğe Bağlan' },
    aiTyping: { en: 'Assistant is typing...', de: 'Assistent schreibt...', tr: 'Asistan yazıyor...' },
    noSessions: { en: 'No active chat sessions. Start a new one!', de: 'Keine aktiven Chats. Starten Sie einen neuen!', tr: 'Aktif sohbetiniz bulunmuyor. Yeni bir sohbet başlatın!' },
    welcomeMessage: { en: 'Hello! I am your AI Wedding Assistant. Connected to your wedding planner panel. How can I help optimize your budget, manage guests, or organize tasks today?', de: 'Hallo! Ich bin Ihr KI-Hochzeitsplaner. Mit Ihrem Hochzeitsplaner-Panel verbunden. Wie kann ich Ihnen heute bei Budget, Gästen oder Aufgaben helfen?', tr: 'Merhaba! Ben Yapay Zekâ Düğün Asistanınız. Düğün planlama panelinize bağlandım. Bugün bütçenizi optimize etmeye, davetlileri yönetmeye veya işlerinizi organize etmeye nasıl yardımcı olabilirim?' },
    failedMessage: { en: 'Failed to send. Click to retry.', de: 'Senden fehlgeschlagen.', tr: 'Gönderilemedi. Tekrar deneyin.' },
    retryBtn: { en: 'Retry', de: 'Wiederholen', tr: 'Yeniden Dene' },
    sending: { en: 'Sending...', de: 'Wird gesendet...', tr: 'Gönderiliyor...' }
};

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

content = content.replace(/dictionary\.aiChat = \{[\s\S]*$/, updatedFooter);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated dictionary.js!');
