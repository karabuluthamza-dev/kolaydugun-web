import { community } from './community';
// Unified Translation Dictionary

// Updated: 2025-12-07 16:55
// All languages are defined side-by-side to ensure consistency.

export const dictionary = {
    checklist: {
        title: {
            en: "Checklist",
            de: "Checkliste",
            tr: "Yapılacaklar Listesi"
        },
        placeholder: {
            en: "Add a new task...",
            de: "Neue Aufgabe hinzufügen...",
            tr: "Yeni görev ekle..."
        },
        empty: {
            en: "No tasks yet. Add one above!",
            de: "Noch keine Aufgaben. Fügen Sie oben eine hinzu!",
            tr: "Henüz görev yok. Yukarıdan ekleyin!"
        },
        add: {
            en: "Add",
            de: "Hinzufügen",
            tr: "Ekle"
        },
        delete: {
            en: "Delete",
            de: "Löschen",
            tr: "Sil"
        },
        completed: {
            en: "Completed",
            de: "Erledigt",
            tr: "Tamamlandı"
        }
    },
    faq: {
        title: {
            en: "Frequently Asked Questions",
            de: "Häufig gestellte Fragen",
            tr: "Sıkça Sorulan Sorular"
        },
        subtitle: {
            en: "Find answers to common questions",
            de: "Finden Sie Antworten auf häufige Fragen",
            tr: "Sık sorulan soruların cevaplarını bulun"
        },
        viewAll: {
            en: "View All Questions",
            de: "Alle Fragen ansehen",
            tr: "Tüm Soruları Görüntüle"
        },
        categories: {
            all: {
                en: "All",
                de: "Alle",
                tr: "Tümü"
            },
            general: {
                en: "General",
                de: "Allgemein",
                tr: "Genel"
            },
            couples: {
                en: "For Couples",
                de: "Für Paare",
                tr: "Çiftler İçin"
            },
            vendors: {
                en: "For Vendors",
                de: "Für Anbieter",
                tr: "Tedarikçiler İçin"
            },
            payment: {
                en: "Payment & Pricing",
                de: "Zahlung & Preise",
                tr: "Ödeme ve Fiyatlandırma"
            },
            technical: {
                en: "Technical Support",
                de: "Technischer Support",
                tr: "Teknik Destek"
            }
        },
        search: {
            en: "Search questions...",
            de: "Fragen suchen...",
            tr: "Soru ara..."
        },
        noResults: {
            en: "No questions found",
            de: "Keine Fragen gefunden",
            tr: "Soru bulunamadı"
        },
        stillHaveQuestions: {
            en: "Still have questions?",
            de: "Haben Sie noch Fragen?",
            tr: "Hala sorunuz mu var?"
        },
        contactUs: {
            en: "Don't hesitate to contact us!",
            de: "Zögern Sie nicht, uns zu kontaktieren!",
            tr: "Bizimle iletişime geçmekten çekinmeyin!"
        },
        contactButton: {
            en: "Contact Us",
            de: "Kontakt aufnehmen",
            tr: "İletişime Geç"
        }
    },
    filters: {
        title: { en: "Filter", de: "Filtern", tr: "Filtrele" },
        search: { en: "Search", de: "Suche", tr: "Arama" },
        searchPlaceholder: { en: "Search by name or tag...", de: "Nach Name oder Tag suchen...", tr: "İsim veya etiket ara..." },
        category: { en: "Category", de: "Kategorie", tr: "Kategori" },
        all: { en: "All", de: "Alle", tr: "Tümü" },
        options: { en: "Options", de: "Optionen", tr: "Seçenekleri" },
        sort: { en: "Sort", de: "Sortieren", tr: "Sıralama" },
        sortRecommended: { en: "Recommended", de: "Empfohlen", tr: "Önerilen" },
        sortPriceAsc: { en: "Price: Low to High", de: "Preis: Niedrig bis Hoch", tr: "Fiyat: Düşükten Yükseğe" },
        sortPriceDesc: { en: "Price: High to Low", de: "Preis: Hoch bis Niedrig", tr: "Fiyat: Yüksekten Düşüğe" },
        sortRating: { en: "Rating: High to Low", de: "Bewertung: Hoch bis Niedrig", tr: "Puan: Yüksekten Düşüğe" },
        city: { en: "City", de: "Stadt", tr: "Şehir" },
        price: { en: "Price", de: "Preis", tr: "Fiyat" },
        price_1: { en: "€ (Economic)", de: "€ (Günstig)", tr: "€ (Ekonomik)" },
        price_2: { en: "€€ (Moderate)", de: "€€ (Mittel)", tr: "€€ (Orta)" },
        price_3: { en: "€€€ (High)", de: "€€€ (Hoch)", tr: "€€€ (Yüksek)" },
        price_4: { en: "€€€€ (Luxury)", de: "€€€€ (Luxus)", tr: "€€€€ (Lüks)" },
        capacity: { en: "Min. Capacity", de: "Min. Kapazität", tr: "Min. Kapasite" },
        tags: { en: "Tags", de: "Stichworte", tr: "Etiketler" }
    },
    dashboard: {
        welcome: {
            en: "Welcome",
            de: "Willkommen",
            tr: "Hoşgeldiniz"
        },
        weddingPanel: {
            en: "Wedding Panel",
            de: "Hochzeits-Panel",
            tr: "Düğün Paneli"
        },
        sidebar: {
            overview: { en: "Overview", de: "Übersicht", tr: "Özet" },
            favorites: { en: "Favorites", de: "Favoriten", tr: "Favoriler" },
            budget: { en: "Budget", de: "Budget", tr: "Bütçe" },
            checklist: { en: "Checklist", de: "Checkliste", tr: "Yapılacaklar" },
            wallet: { en: "Wallet", de: "Geldbörse", tr: "Cüzdan" }
        },
        userOverview: {
            welcomeTitle: { en: "Welcome, {{email}}", de: "Willkommen, {{email}}", tr: "Hoşgeldin, {{email}}" },
            welcomeSubtitle: { en: "Manage your wedding planning here.", de: "Verwalten Sie hier Ihre Hochzeitsplanung.", tr: "Düğün planlamanı buradan yönetebilirsin." },
            favoritesCard: {
                title: { en: "Favorites", de: "Favoriten", tr: "Favoriler" },
                desc: { en: "Manage vendors", de: "Anbieter verwalten", tr: "Satıcıları yönet" }
            },
            budgetCard: {
                title: { en: "Budget", de: "Budget", tr: "Bütçe" },
                desc: { en: "Track expenses", de: "Ausgaben verfolgen", tr: "Harcamaları takip et" }
            },
            checklistCard: {
                title: { en: "Checklist", de: "Checkliste", tr: "Yapılacaklar" },
                desc: { en: "Complete tasks", de: "Aufgaben erledigen", tr: "Görevleri tamamla" }
            }
        },
        liveSupport: {
            en: "Live Support",
            de: "Live-Support",
            tr: "Canlı Destek"
        },
        supportVendorName: {
            en: "KolayDugun Support",
            de: "KolayDugun Kundenservice",
            tr: "KolayDugun Destek"
        },
        supportRequest: {
            en: "Support Request",
            de: "Support-Anfrage",
            tr: "Destek Talebi"
        },
        welcomeMsg: {
            en: "Please complete your profile to get started.",
            de: "Bitte vervollständigen Sie Ihr Profil, um zu beginnen.",
            tr: "İşletmenizin durumuna genel bir bakış."
        },
        completeProfile: {
            en: "Complete Profile",
            de: "Profil vervollständigen",
            tr: "Profili Tamamla"
        },
        overview: {
            en: "Overview",
            de: "Übersicht",
            tr: "Genel Bakış"
        },
        panel: {
            en: "Vendor Panel",
            de: "Anbieter-Panel",
            tr: "Tedarikçi Paneli"
        },
        profileLabel: {
            en: "Profile",
            de: "Profil",
            tr: "Profil"
        },
        gallery: {
            en: "Gallery",
            de: "Galerie",
            tr: "Galeri"
        },
        inquiriesLabel: {
            en: "Quote Requests",
            de: "Angebotsanfragen",
            tr: "Teklif İstekleri"
        },
        messages: {
            en: "Messages",
            de: "Nachrichten",
            tr: "Mesajlar"
        },
        statusNew: {
            en: "New",
            de: "Neu",
            tr: "Yeni"
        },
        contactAdmin: {
            en: "Contact Admin",
            de: "Admin kontaktieren",
            tr: "Yönetici ile Görüş"
        },
        noMessages: {
            en: "No messages yet",
            de: "Noch keine Nachrichten",
            tr: "Henüz mesajınız yok"
        },
        noMessage: {
            en: "No message",
            de: "Keine Nachricht",
            tr: "Mesaj yok"
        },
        justNow: {
            en: "Just now",
            de: "Gerade eben",
            tr: "Az önce"
        },
        minutesAgo: {
            en: "minutes ago",
            de: "vor Minuten",
            tr: "dakika önce"
        },
        hoursAgo: {
            en: "hours ago",
            de: "vor Stunden",
            tr: "saat önce"
        },
        daysAgo: {
            en: "days ago",
            de: "vor Tagen",
            tr: "gün önce"
        },
        loading: {
            en: "Loading...",
            de: "Laden...",
            tr: "Yükleniyor..."
        },
        noLeadsYet: {
            en: "💬 No leads to message yet",
            de: "💬 Noch keine Anfragen zum Nachrichtenaustausch",
            tr: "💬 Henüz mesajlaşabileceğiniz talep yok"
        },
        noLeadsInstructions: {
            en: "To start messaging, first unlock contact information from a lead in the \"Quote Requests\" section.",
            de: "Um mit dem Nachrichtenaustausch zu beginnen, entsperren Sie zunächst die Kontaktinformationen einer Anfrage im Bereich \"Angebotsanfragen\".",
            tr: "Mesajlaşmak için önce \"Teklif İstekleri\" bölümünden bir talebin iletişim bilgilerini açmalısınız."
        },
        me: {
            en: "Me",
            de: "Ich",
            tr: "Ben"
        },
        wallet: {
            en: "Wallet",
            de: "Geldbörse",
            tr: "Cüzdan"
        },
        package: {
            en: "Package",
            de: "Paket",
            tr: "Paket"
        },
        status: {
            en: "Status",
            de: "Status",
            tr: "Durum"
        },
        active: {
            en: "Active",
            de: "Aktiv",
            tr: "Aktif"
        },
        notifications: {
            title: {
                en: "Notifications",
                de: "Benachrichtigungen",
                tr: "Bildirimler"
            },
            unread: {
                en: "unread",
                de: "ungelesen",
                tr: "okunmamış"
            },
            empty: {
                en: "No notifications yet",
                de: "Noch keine Benachrichtigungen",
                tr: "Henüz bildiriminiz yok"
            },
            viewAll: {
                en: "View All",
                de: "Alle anzeigen",
                tr: "Tümünü Görüntüle"
            },
            new_quote_title: {
                en: "New Job Opportunity 💍",
                de: "Neue Geschäftsmöglichkeit 💍",
                tr: "Yeni İş Fırsatı 💍"
            },
            new_quote_message: {
                en: "{{name}} is waiting for a quote for their wedding. Click to view details and reply!",
                de: "{{name}} wartet auf ein Angebot für die Hochzeit. Klicken Sie hier für Details und Antwort!",
                tr: "{{name}} düğünü için fiyat teklifi bekliyor. Detayları incelemek ve cevaplamak için tıklayın!"
            },
            new_message_title: {
                en: "You have a new message 💌",
                de: "Sie haben eine neue Nachricht 💌",
                tr: "Yeni Mesajın Var 💌"
            },
            new_message_message: {
                en: "{{name}} sent you a new message. Click to reply.",
                de: "{{name}} hat Ihnen eine neue Nachricht gesendet. Klicken Sie zum Antworten.",
                tr: "{{name}} sana yeni bir mesaj gönderdi. Cevaplamak için tıklayın."
            },
            type: {
                announcement: { en: "Announcement", de: "Ankündigung", tr: "Duyuru" },
                campaign: { en: "Campaign", de: "Kampagne", tr: "Kampanya" },
                system: { en: "Info", de: "Info", tr: "Bilgilendirme" },
                new_message: { en: "Message", de: "Nachricht", tr: "Mesaj" },
                new_quote: { en: "Quote Request", de: "Angebotsanfrage", tr: "Teklif İsteği" }
            }
        },
        profile: {
            businessName: { en: "Business Name", de: "Firmenname", tr: "İşletme Adı" },
            description: { en: "Description", de: "Beschreibung", tr: "Açıklama" },
            category: { en: "Category", de: "Kategorie", tr: "Kategori" },
            city: { en: "City", de: "Stadt", tr: "Şehir" },
            gallery: { en: "Gallery", de: "Galerie", tr: "Galeri" },
            specialDetails: { en: "Special Details", de: "Besondere Details", tr: "Özel Detaylar" },
            multiSelectHint: { en: "Hold Ctrl/Cmd to select multiple", de: "Halten Sie Strg/Cmd gedrückt, um mehrere auszuwählen", tr: "Birden fazla seçim yapmak için Ctrl/Cmd tuşuna basılı tutun" },
            details: { en: "Details", de: "Details", tr: "Detaylar" },
            priceRange: { en: "Price Range", de: "Preisklasse", tr: "Fiyat Aralığı" },
            selectPrice: { en: "Select Price", de: "Preis wählen", tr: "Fiyat Seçiniz" },
            capacity: { en: "Capacity", de: "Kapazität", tr: "Kapasite" },
            yearsExperience: { en: "Years of Experience", de: "Jahre Erfahrung", tr: "Deneyim Yılı" },
            paymentMethods: { en: "Payment Methods", de: "Zahlungsmethoden", tr: "Ödeme Yöntemleri" },
            languages: { en: "Languages", de: "Sprachen", tr: "Diller" },
            website: { en: "Website", de: "Webseite", tr: "Web Sitesi" },
            socialMedia: { en: "Social Media", de: "Soziale Medien", tr: "Sosyal Medya" },
            save: { en: "Save Changes", de: "Änderungen speichern", tr: "Değişiklikleri Kaydet" },
            additionalCategories: {
                en: "Additional Categories",
                de: "Zusätzliche Kategorien",
                tr: "Ek Kategoriler"
            },
            videoUrl: {
                en: "Video URL",
                de: "Video-URL",
                tr: "Video Linki"
            },
            videoHint: {
                en: "Paste your YouTube or Vimeo link here. It will appear on your profile.",
                de: "Fügen Sie hier Ihren YouTube- oder Vimeo-Link ein. Er wird auf Ihrem Profil angezeigt.",
                tr: "Tanıtım videonuzun linkini buraya yapıştırın. Profilinizde görünecektir."
            }
        },
        services: { en: "Services", de: "Leistungen", tr: "Hizmetler" },
        calendar: { en: "Calendar", de: "Kalender", tr: "Takvim" },
        settings: { en: "Settings", de: "Einstellungen", tr: "Ayarlar" },
        views: { en: "Profile Views", de: "Profilaufrufe", tr: "Profil Görüntülenme" },
        inquiries: {
            en: "Inquiries",
            de: "Anfragen",
            tr: "Teklif İstekleri"
        },
        rating: { en: "Rating", de: "Bewertung", tr: "Değerlendirme" }
    },
    common: {
        select: {
            en: "Select",
            de: "Auswählen",
            tr: "Seç"
        },
        add: {
            en: "Add",
            de: "Hinzufügen",
            tr: "Ekle"
        },
        save: {
            en: "Save",
            de: "Speichern",
            tr: "Kaydet"
        },
        saved: {
            en: "Saved",
            de: "Gespeichert",
            tr: "Kaydedildi"
        },
        share: {
            en: "Share",
            de: "Teilen",
            tr: "Paylaş"
        },
        shareOptions: {
            whatsapp: { en: "WhatsApp", de: "WhatsApp", tr: "WhatsApp" },
            facebook: { en: "Facebook", de: "Facebook", tr: "Facebook" },
            copyLink: { en: "Copy Link", de: "Link kopieren", tr: "Linki Kopyala" },
            copied: { en: "Link Copied!", de: "Link kopiert!", tr: "Link Kopyalandı!" },
            title: { en: "Share on", de: "Teilen auf", tr: "Şurada paylaş" }
        },
        claimed: {
            en: "Claimed",
            de: "Verifiziert",
            tr: "Onaylı"
        },
        cancel: {
            en: "Cancel",
            de: "Abbrechen",
            tr: "İptal"
        },
        yes: {
            en: "Yes",
            de: "Ja",
            tr: "Evet"
        },
        no: {
            en: "No",
            de: "Nein",
            tr: "Hayır"
        },
        view: {
            en: "View",
            de: "Ansehen",
            tr: "Görüntüle"
        },
        viewAll: {
            en: "View All",
            de: "Alle anzeigen",
            tr: "Tümünü Gör"
        },
        delete: {
            en: "Delete",
            de: "Löschen",
            tr: "Sil"
        },
        edit: {
            en: "Edit",
            de: "Bearbeiten",
            tr: "Düzenle"
        },
        confirmDelete: {
            en: "Are you sure?",
            de: "Sind Sie sicher?",
            tr: "Emin misiniz?"
        },
        confirm: {
            en: "Confirm",
            de: "Bestätigen",
            tr: "Onayla"
        },
        monthsRemaining: {
            en: "months remaining!",
            de: "Monate verbleibend!",
            tr: "ay kaldı!"
        },
        monthsAgo: {
            en: "months ago",
            de: "Monate zuvor",
            tr: "ay önce"
        },
        weddingMonth: {
            en: "Wedding Month",
            de: "Hochzeitsmonat",
            tr: "Düğün Ayı"
        },
        home: {
            en: "Home",
            de: "Startseite",
            tr: "Ana Sayfa"
        },
        back: {
            en: "Back",
            de: "Zurück",
            tr: "Geri"
        },
        loading: {
            en: "Loading...",
            de: "Wird geladen...",
            tr: "Yükleniyor..."
        },
        error: {
            en: "An error occurred",
            de: "Ein Fehler ist aufgetreten",
            tr: "Bir hata oluştu"
        },
        or: {
            en: "or",
            de: "oder",
            tr: "veya"
        },
        addToFavorites: {
            en: "Add to Favorites",
            de: "Zu Favoriten hinzufügen",
            tr: "Favorilere Ekle"
        }
    },
    reviews: {
        title: {
            en: "Reviews",
            de: "Bewertungen",
            tr: "Değerlendirmeler"
        },
        writeReview: {
            en: "Write a Review",
            de: "Bewertung schreiben",
            tr: "Yorum Yaz"
        },
        noReviews: {
            en: "No reviews yet. Be the first to review!",
            de: "Noch keine Bewertungen. Seien Sie der Erste!",
            tr: "Henüz yorum yapılmamış. İlk yorumu siz yapın!"
        },
        submit: {
            en: "Submit",
            de: "Absenden",
            tr: "Gönder"
        },
        cancel: {
            en: "Cancel",
            de: "Abbrechen",
            tr: "İptal"
        },
        placeholder: {
            en: "Share your experience...",
            de: "Teilen Sie Ihre Erfahrung...",
            tr: "Deneyiminizi paylaşın..."
        },
        rating: {
            en: "Rating",
            de: "Bewertung",
            tr: "Puan"
        },
        comment: {
            en: "Comment",
            de: "Kommentar",
            tr: "Yorum"
        },
        commentPlaceholder: {
            en: "Share your experience...",
            de: "Teilen Sie Ihre Erfahrung...",
            tr: "Deneyiminizi paylaşın..."
        },
        submitError: {
            en: "Error submitting review",
            de: "Fehler beim Senden der Bewertung",
            tr: "Yorum gönderilirken hata oluştu"
        },
        ratingRequired: {
            en: "Please select a rating",
            de: "Bitte wählen Sie eine Bewertung",
            tr: "Lütfen puan verin"
        },
        commentRequired: {
            en: "Please write a comment",
            de: "Bitte schreiben Sie einen Kommentar",
            tr: "Lütfen yorum yazın"
        },
        success: {
            en: "Review submitted successfully!",
            de: "Bewertung erfolgreich gesendet!",
            tr: "Yorumunuz başarıyla gönderildi!"
        },
        error: {
            en: "Error submitting review",
            de: "Fehler beim Senden der Bewertung",
            tr: "Yorum gönderilirken hata oluştu"
        }
    },
    weddingWebsite: {
        setupTitle: {
            en: "Wedding Website Setup",
            de: "Hochzeitswebseite Einrichtung",
            tr: "Düğün Web Sitesi Kurulumu"
        },
        preview: {
            en: "Preview Website",
            de: "Webseite Vorschau",
            tr: "Web Sitesini Önizle"
        },
        settingsTab: {
            en: "Settings",
            de: "Einstellungen",
            tr: "Ayarlar"
        },
        guestsTab: {
            en: "Guests",
            de: "Gäste",
            tr: "Davetliler"
        },
        slugLabel: {
            en: "URL Slug",
            de: "URL-Endung",
            tr: "URL Uzantısı"
        },
        dateLabel: {
            en: "Wedding Date",
            de: "Hochzeitsdatum",
            tr: "Düğün Tarihi"
        },
        coverImageLabel: {
            en: "Cover Image URL",
            de: "Titelbild-URL",
            tr: "Kapak Resmi URL"
        },
        welcomeMessageLabel: {
            en: "Welcome Message",
            de: "Willkommensnachricht",
            tr: "Karşılama Mesajı"
        },
        storyLabel: {
            en: "Our Story",
            de: "Unsere Geschichte",
            tr: "Hikayemiz"
        },
        venueNameLabel: {
            en: "Venue Name",
            de: "Name des Veranstaltungsortes",
            tr: "Mekan Adı"
        },
        venueMapLabel: {
            en: "Venue Map URL",
            de: "Karten-URL des Veranstaltungsortes",
            tr: "Mekan Harita URL"
        },
        venueAddressLabel: {
            en: "Venue Address",
            de: "Adresse des Veranstaltungsortes",
            tr: "Mekan Adresi"
        },
        galleryLabel: {
            en: "Photo Gallery",
            de: "Fotogalerie",
            tr: "Fotoğraf Galerisi"
        },
        galleryPlaceholder: {
            en: "Add photo URLs here...",
            de: "Foto-URLs hier hinzufügen...",
            tr: "Fotoğraf URL'lerini buraya ekleyin..."
        },
        countdown: {
            days: { en: "Days", de: "Tage", tr: "Gün" },
            hours: { en: "Hours", de: "Stunden", tr: "Saat" },
            minutes: { en: "Minutes", de: "Minuten", tr: "Dakika" },
            seconds: { en: "Seconds", de: "Sekunden", tr: "Saniye" }
        },
        publicView: {
            rsvpTitle: {
                en: "RSVP",
                de: "U.A.w.g.",
                tr: "LCV"
            },
            yes: {
                en: "Yes, I will attend",
                de: "Ja, ich werde teilnehmen",
                tr: "Evet, katılacağım"
            },
            no: {
                en: "No, I cannot attend",
                de: "Nein, ich kann nicht teilnehmen",
                tr: "Hayır, katılamayacağım"
            },
            message: {
                en: "Message to the couple",
                de: "Nachricht an das Paar",
                tr: "Çifte mesajınız"
            },
            submit: {
                en: "Send RSVP",
                de: "Antwort senden",
                tr: "LCV Gönder"
            },
            guestCountOptions: {
                justMe: { en: "Just me", de: "Nur ich", tr: "Sadece ben" },
                plusOne: { en: "+1 Guest", de: "+1 Gast", tr: "+1 Misafir" },
                plusTwo: { en: "+2 Guests", de: "+2 Gäste", tr: "+2 Misafir" },
                plusThree: { en: "+3 Guests", de: "+3 Gäste", tr: "+3 Misafir" },
                plusFour: { en: "+4 Guests", de: "+4 Gäste", tr: "+4 Misafir" }
            }
        },
        save: {
            en: "Save Changes",
            de: "Änderungen speichern",
            tr: "Değişiklikleri Kaydet"
        }
    },
    messages: {
        send: {
            en: "Send",
            de: "Senden",
            tr: "Gönder"
        },
        typePlaceholder: {
            en: "Type your message...",
            de: "Nachricht eingeben...",
            tr: "Mesajınızı yazın..."
        },
        search: {
            en: "Search...",
            de: "Suchen...",
            tr: "Ara..."
        },
        noSelection: {
            en: "Select a conversation",
            de: "Wählen Sie eine Konversation",
            tr: "Bir konuşma seçin"
        }
    },
    vendorDetail: {
        notFound: { en: "Vendor Not Found", de: "Dienstleister nicht gefunden", tr: "Firma Bulunamadı" },
        backToVendors: { en: "Back to Vendors", de: "Zurück zur Übersicht", tr: "Firmalara Dön" },
        viewAllPhotos: { en: "View All Photos", de: "Alle Fotos ansehen", tr: "Tüm Fotoğrafları Gör" },
        reviews: { en: "Reviews", de: "Bewertungen", tr: "Değerlendirme" },
        featured: { en: "Featured", de: "Empfohlen", tr: "Öne Çıkan" },
        about: { en: "About", de: "Über uns", tr: "Hakkında" },
        faq: { en: "FAQ", de: "FAQ", tr: "S.S.S." },
        features: { en: "Features", de: "Eigenschaften", tr: "Özellikler" },
        noFeatures: { en: "No features listed yet.", de: "Noch keine Eigenschaften gelistet.", tr: "Henüz özellik eklenmemiş." },
        faqPlaceholder: { en: "No FAQ added yet.", de: "Noch keine FAQ hinzugefügt.", tr: "Henüz S.S.S. eklenmemiş." },
        startingPrice: { en: "starting price", de: "ab", tr: "başlangıç fiyatı" },
        requestQuote: { en: "Get Free Quote", de: "Kostenloses Angebot", tr: "Ücretsiz Teklif Al" },
        date: { en: "Wedding Date", de: "Hochzeitsdatum", tr: "Düğün Tarihi" },
        send: { en: "Request Quote", de: "Angebot anfordern", tr: "Teklif İste" },
        noObligation: { en: "Free & no obligation.", de: "Kostenlos & unverbindlich.", tr: "Ücretsiz ve bağlayıcılığı yoktur." },
        success: { en: "Quote request sent!", de: "Anfrage gesendet!", tr: "Teklif isteği gönderildi!" },
        error: { en: "Error sending request.", de: "Fehler beim Senden.", tr: "Gönderim hatası." },
        back: { en: "Back", de: "Zurück", tr: "Geri" }
    },
    map: {
        location: {
            en: "Location",
            de: "Standort",
            tr: "Konum"
        },
        getDirections: {
            en: "Get Directions",
            de: "Route planen",
            tr: "Yol Tarifi Al"
        }
    },
    nav: {
        services: {
            en: "Services",
            de: "Dienstleister",
            tr: "Hizmetler"
        },
        dashboard: {
            en: "Dashboard",
            de: "Dashboard",
            tr: "Panel"
        },
        logout: {
            en: "Logout",
            de: "Abmelden",
            tr: "Çıkış Yap"
        },
        forum: {
            en: "Community",
            de: "Community",
            tr: "Forum"
        },

        newTopic: {
            button: { en: "New Topic", de: "Neues Thema", tr: "Yeni Konu Aç" },
            title: { en: "Create New Topic", de: "Neues Thema erstellen", tr: "Yeni Konu Oluştur" },
            inputTitle: { en: "Topic Title", de: "Thementitel", tr: "Konu Başlığı" },
            inputTitlePlaceholder: { en: "e.g. Which wedding dress model?", de: "z.B. Welches Brautkleid-Modell?", tr: "Örn: Hangi gelinlik modeli daha rahat?" },
            inputCategory: { en: "Category", de: "Kategorie", tr: "Kategori" },
            inputCategoryPlaceholder: { en: "Select a Category", de: "Kategorie wählen", tr: "Bir Kategori Seçin" },
            inputDetails: { en: "Details", de: "Details", tr: "Detaylar" },
            inputDetailsPlaceholder: { en: "Share the details of your question...", de: "Teilen Sie die Details Ihrer Frage...", tr: "Sorunuzun veya konunuzun detaylarını paylaşın..." },
            cancel: { en: "Cancel", de: "Abbrechen", tr: "İptal" },
            submit: { en: "Create Topic", de: "Thema erstellen", tr: "Konuyu Oluştur" },
            submitting: { en: "Creating...", de: "Erstellen...", tr: "Oluşturuluyor..." },
            loginRequired: { en: "You must be logged in.", de: "Sie müssen eingeloggt sein.", tr: "Giriş yapmalısınız." },
            loginMessage: { en: "Please login to start a topic.", de: "Bitte melden Sie sich an, um ein Thema zu starten.", tr: "Konu başlatmak için lütfen giriş yapın." },
            loginButton: { en: "Login", de: "Anmelden", tr: "Giriş Yap" }
        },

        tools: {
            en: "Planning Tools",
            de: "Planungstools",
            tr: "Planlama Araçları"
        },
        vendorJoin: {
            en: "For Vendors",
            de: "Für Dienstleister",
            tr: "Tedarikçiler İçin"
        },
        registerBtn: {
            en: "Register",
            de: "Registrieren",
            tr: "Kayıt Ol"
        },
        messages: {
            en: "My Messages",
            de: "Nachrichten",
            tr: "Mesajlar"
        }
    },

    vendors: {
        title: {
            en: "Vendor Marketplace",
            de: "Anbieter-Marktplatz",
            tr: "Tedarikçi Pazarı"
        },
        join: {
            en: "Register Your Business",
            de: "Unternehmen registrieren",
            tr: "İşletmenizi Kaydedin"
        },
        noResults: {
            en: "No vendors found matching your filters.",
            de: "Keine Anbieter gefunden, die Ihren Filtern entsprechen.",
            tr: "Seçilen filtrelere uygun tedarikçi bulunamadı."
        }
    },
    planningTools: {
        title: {
            en: "Planning Tools",
            de: "Planungstools",
            tr: "Planlama Araçları"
        },
        subtitle: {
            en: "From your own website to budget planning – all the tools you need.",
            de: "Von der eigenen Webseite bis zur Budgetplanung – alle Tools, die Sie brauchen.",
            tr: "Size özel web sitesinden yapılacaklar listesine, bütçe hesaplamaktan oturma planına, düğününüzü daha kolay planlamanızı sağlayacak tüm araçlar burada!"
        },
        cta: {
            en: "Register for Free",
            de: "Kostenlos Registrieren",
            tr: "Ücretsiz Üye Ol"
        },
        website: {
            en: "My Website",
            de: "Meine Webseite",
            tr: "Web sitem"
        },
        websiteDesc: {
            en: "Create your free wedding website.",
            de: "Erstellen Sie Ihre kostenlose Hochzeitswebseite.",
            tr: "Düğünün için tamamen ücretsiz ve çok şık bir web sitesi yap!"
        },
        agenda: {
            en: "My Agenda",
            de: "Meine Agenda",
            tr: "Ajandam"
        },
        agendaDesc: {
            en: "Plan step by step what needs to be done.",
            de: "Planen Sie Schritt für Schritt, was zu tun ist.",
            tr: "Ay ay ne yapman gerektiğini öğren, düğününü eksiksiz planla!"
        },
        budget: {
            en: "My Budget",
            de: "Mein Budget",
            tr: "Bütçem"
        },
        budgetDesc: {
            en: "Keep track of your expenses.",
            de: "Behalten Sie Ihre Ausgaben im Blick.",
            tr: "Evlenirken nelere para harcayacağını tek tek kontrol et, hesabını en baştan tut!"
        },
        seating: {
            en: "Seating Plan",
            de: "Sitzplan",
            tr: "Oturma planım"
        },
        seatingDesc: {
            en: "Easily create your seating arrangement.",
            de: "Erstellen Sie ganz einfach Ihre Sitzordnung.",
            tr: "Davetlilerin oturma düzenini kolayca oluştur, 'aman kimse kırılmasın' diye dert etme!"
        },
        weather: {
            en: "Weather Forecast",
            de: "Wettervorhersage",
            tr: "Hava durumu tahmini"
        },
        weatherDesc: {
            en: "What will the weather be like? Check forecasts based on historical data.",
            de: "Wie wird das Wetter? Prüfen Sie Vorhersagen basierend auf historischen Daten.",
            tr: "Düğün gününde hava nasıl olacak? Geçmiş yılların verilerine göre tahminleri gör."
        }
    },
    hero: {
        title: {
            en: "The Perfect Start for Your Dream Wedding",
            de: "Der perfekte Start für Ihre Traumhochzeit",
            tr: "Hayalinizdeki Düğün İçin Kusursuz Başlangıç"
        },
        subtitle: {
            en: "Perfection down to the last detail. We create unforgettable moments.",
            de: "Perfektion bis ins kleinste Detail. Wir gestalten unvergessliche Momente.",
            tr: "En ince ayrıntısına kadar mükemmellik. Unutulmaz anlar tasarlıyoruz."
        },
        getFreeQuote: {
            en: "Get Free Quote",
            de: "Kostenloses Angebot",
            tr: "Ücretsiz Teklif Al"
        },
        ctaSubtext: {
            en: "Take the first step for your dream wedding",
            de: "Machen Sie den ersten Schritt für Ihre Traumhochzeit",
            tr: "Hayalindeki düğün için ilk adımı at"
        }
    },
    whyUs: {
        title: {
            en: "Why KolayDugun?",
            de: "Warum KolayDugun?",
            tr: "Neden KolayDugun?"
        },
        verified: {
            title: {
                en: "Verified Vendors",
                de: "Geprüfte Dienstleister",
                tr: "Onaylı Tedarikçiler"
            },
            desc: {
                en: "We personally verify every vendor to guarantee the highest quality.",
                de: "Wir prüfen jeden Anbieter persönlich, um höchste Qualität zu garantieren.",
                tr: "En yüksek kaliteyi garanti etmek için her tedarikçiyi bizzat kontrol ediyoruz."
            }
        },
        tools: {
            title: {
                en: "Free Planning Tools",
                de: "Kostenlose Planungstools",
                tr: "Ücretsiz Planlama Araçları"
            },
            desc: {
                en: "Use our smart tools for budgeting, guest lists, and more.",
                de: "Nutzen Sie unsere intelligenten Tools für Budget, Gästeliste und mehr.",
                tr: "Bütçe, davetli listesi ve daha fazlası için akıllı araçlarımızı kullanın."
            }
        },
        support: {
            title: {
                en: "Multilingual Support",
                de: "Mehrsprachiger Support",
                tr: "Çok Dilli Destek"
            },
            desc: {
                en: "We support you in German, Turkish, and English.",
                de: "Wir unterstützen Sie auf Deutsch, Türkisch und Englisch.",
                tr: "Size Almanca, Türkçe ve İngilizce dillerinde destek sunuyoruz."
            }
        }
    },
    search: {
        cityPlaceholder: {
            en: "Select City",
            de: "Stadt wählen",
            tr: "Şehir Seçin"
        },
        categoryPlaceholder: {
            en: "Select Category",
            de: "Kategorie wählen",
            tr: "Kategori Seçin"
        },
        button: {
            en: "Search",
            de: "Suchen",
            tr: "Ara"
        }
    },
    featured: {
        title: {
            en: "Popular Categories",
            de: "Beliebte Kategorien",
            tr: "Popüler Kategoriler"
        },
        vendorsTitle: {
            en: "Featured Vendors",
            de: "Empfohlene Dienstleister",
            tr: "Öne Çıkan Tedarikçiler"
        },
        venue: {
            en: "Wedding Venues",
            de: "Hochzeitslocations",
            tr: "Düğün Mekanları"
        },
        photo: {
            en: "Wedding Photographers",
            de: "Hochzeitsfotos",
            tr: "Düğün Fotoğrafçıları"
        },
        dress: {
            en: "Bridal Wear",
            de: "Brautmode",
            tr: "Gelinlik"
        },
        catering: {
            en: "Catering",
            de: "Catering",
            tr: "Catering"
        },
        music: {
            en: "Music",
            de: "Musik",
            tr: "Müzik"
        },
        flowers: {
            en: "Flowers",
            de: "Blumen",
            tr: "Çiçekler"
        },
        decor: {
            en: "Decoration",
            de: "Dekoration",
            tr: "Dekorasyon"
        },
        cake: {
            en: "Wedding Cakes",
            de: "Hochzeitstorten",
            tr: "Düğün Pastası"
        },
        planners: {
            en: "Wedding Planners",
            de: "Hochzeitsplaner",
            tr: "Düğün Organizasyonu"
        },
        cars: {
            en: "Wedding Cars",
            de: "Hochzeitsautos",
            tr: "Gelin Arabası"
        },
        rings: {
            en: "Wedding Rings",
            de: "Trauringe",
            tr: "Alyans & Takı"
        },
        dj: {
            en: "DJs",
            de: "DJs",
            tr: "DJ"
        },
        musicians: {
            en: "Musicians",
            de: "Musiker",
            tr: "Müzisyenler"
        },
        catering_party: {
            en: "Catering & Party Service",
            de: "Catering & Partyservice",
            tr: "Catering & Parti"
        },
        hair_makeup: {
            en: "Hair & Make-Up",
            de: "Haare & Make-up",
            tr: "Saç & Makyaj"
        },
        invitations: {
            en: "Invitations & Stationery",
            de: "Einladungen & Papeterie",
            tr: "Davetiye & Kırtasiye"
        },
        flowers_decor: {
            en: "Flowers & Decoration",
            de: "Blumen & Dekoration",
            tr: "Çiçek & Dekorasyon"
        },
        video: {
            en: "Wedding Videography",
            de: "Hochzeitsvideografie",
            tr: "Düğün Videocusu"
        },
        photobox: {
            en: "Photobox",
            de: "Fotobox",
            tr: "Fotoğraf Kabini"
        },
        entertainment: {
            en: "Entertainment",
            de: "Unterhaltung",
            tr: "Eğlence"
        },
        speakers: {
            en: "Wedding Speakers",
            de: "Trauredner",
            tr: "Nikah Memuru"
        },
        groom: {
            en: "Groom Suits",
            de: "Herrenmode",
            tr: "Damatlık"
        }
    },
    filters: {
        title: {
            en: "Filters",
            de: "Filter",
            tr: "Filtreler"
        },
        search: {
            en: "Search",
            de: "Suche",
            tr: "Arama"
        },
        searchPlaceholder: {
            en: "Search name or tag...",
            de: "Name oder Tag suchen...",
            tr: "İsim veya etiket ara..."
        },
        sort: {
            en: "Sort By",
            de: "Sortieren nach",
            tr: "Sıralama"
        },
        sortRecommended: {
            en: "Recommended",
            de: "Empfohlen",
            tr: "Önerilen"
        },
        sortPriceAsc: {
            en: "Price: Low to High",
            de: "Preis: Aufsteigend",
            tr: "Fiyat: Düşükten Yükseğe"
        },
        sortPriceDesc: {
            en: "Price: High to Low",
            de: "Preis: Absteigend",
            tr: "Fiyat: Yüksekten Düşüğe"
        },
        sortRating: {
            en: "Rating: High to Low",
            de: "Bewertung: Absteigend",
            tr: "Puan: Yüksekten Düşüğe"
        },
        category: {
            en: "Category",
            de: "Kategorie",
            tr: "Kategori"
        },
        all: {
            en: "All",
            de: "Alle",
            tr: "Tümü"
        },
        city: {
            en: "City",
            de: "Stadt",
            tr: "Şehir"
        },
        price: {
            en: "Price Range",
            de: "Preisklasse",
            tr: "Fiyat Aralığı"
        },
        capacity: {
            en: "Min. Capacity",
            de: "Min. Kapazität",
            tr: "Min. Kapasite"
        },
        tags: {
            en: "Tags",
            de: "Tags",
            tr: "Etiketler"
        },
        price_1: {
            en: "€ (Budget)",
            de: "€ (Günstig)",
            tr: "€ (Ekonomik)"
        },
        price_2: {
            en: "€€ (Moderate)",
            de: "€€ (Mittel)",
            tr: "€€ (Orta)"
        },
        price_3: {
            en: "€€€ (High)",
            de: "€€€ (Gehoben)",
            tr: "€€€ (Yüksek)"
        },
        price_4: {
            en: "€€€€ (Luxury)",
            de: "€€€€ (Luxus)",
            tr: "€€€€ (Lüks)"
        },
        noResults: {
            en: "No vendors found matching your filters.",
            de: "Keine Anbieter gefunden, die Ihren Filtern entsprechen.",
            tr: "Seçilen filtrelere uygun tedarikçi bulunamadı."
        }
    },


    vendorHero: {
        title: {
            en: "Find Your Dream Wedding Team",
            de: "Finden Sie Ihr Traum-Hochzeitsteam",
            tr: "Hayalinizdeki Düğün Ekibini Bulun"
        },
        subtitle: {
            en: "The best wedding venues, photographers, and planners are here.",
            de: "Die besten Hochzeitslocations, Fotografen und Planer sind hier.",
            tr: "En iyi düğün mekanları, fotoğrafçılar ve organizasyon firmaları burada."
        },
        vendors: {
            en: "Vendors",
            de: "Dienstleister",
            tr: "Tedarikçi"
        },
        verified: {
            en: "Verified",
            de: "Geprüft",
            tr: "Doğrulanmış"
        }
    },
    vendorDetail: {
        back: {
            en: "Back to Vendors",
            de: "Zurück zu Dienstleistern",
            tr: "Tedarikçilere Dön"
        },
        vendorsTitle: {
            en: "Featured Vendors",
            de: "Empfohlene Dienstleister",
            tr: "Öne Çıkan Tedarikçiler"
        },
        reviews: {
            en: "reviews",
            de: "Bewertungen",
            tr: "Değerlendirme"
        },
        featured: {
            en: "Featured",
            de: "Empfohlen",
            tr: "Öne Çıkan"
        },
        topRated: {
            en: "Top Rated",
            de: "Top Bewertet",
            tr: "En İyiler"
        },
        about: {
            en: "About",
            de: "Über",
            tr: "Hakkında"
        },
        faq: {
            en: "FAQ",
            de: "FAQ",
            tr: "SSS"
        },
        features: {
            en: "Features",
            de: "Merkmale",
            tr: "Özellikler"
        },
        faqPlaceholder: {
            en: "Frequently Asked Questions content would go here.",
            de: "Hier finden Sie häufig gestellte Fragen.",
            tr: "Sıkça sorulan sorular burada yer alacak."
        },
        requestQuote: {
            en: "Get Free Quote",
            de: "Kostenloses Angebot anfordern",
            tr: "Ücretsiz Fiyat Teklifi Al"
        },
        date: {
            en: "Wedding Date",
            de: "Hochzeitsdatum",
            tr: "Düğün Tarihi"
        },
        send: {
            en: "Send Request",
            de: "Anfrage senden",
            tr: "Fiyat Teklifi İste"
        },
        viewAllPhotos: {
            en: "View All Photos",
            de: "Alle Fotos ansehen",
            tr: "Tüm Fotoğraflar"
        },
        startingPrice: {
            en: "starting price",
            de: "ab Preis",
            tr: "başlangıç fiyatı"
        },
        noObligation: {
            en: "Request is free and non-binding.",
            de: "Anfrage ist kostenlos und unverbindlich.",
            tr: "Teklif isteği ücretsizdir ve bağlayıcılığı yoktur."
        },
        noFeatures: {
            en: "No features added yet.",
            de: "Noch keine Merkmale hinzugefügt.",
            tr: "Henüz özellik eklenmemiş."
        },
        success: {
            en: "Your request has been sent successfully!",
            de: "Ihre Anfrage wurde erfolgreich gesendet!",
            tr: "Talebiniz başarıyla gönderildi!"
        }
    },
    register: {
        title: {
            en: "Create Account",
            de: "Konto erstellen",
            tr: "Hesap Oluştur"
        },
        successTitle: {
            en: "Check Your Email",
            de: "Prüfen Sie Ihre E-Mails",
            tr: "E-postanızı Kontrol Edin"
        },
        successMessage: {
            en: "We have sent a verification link to your email address. Please click the link to verify your account.",
            de: "Wir haben einen Bestätigungslink an Ihre E-Mail-Adresse gesendet. Bitte klicken Sie auf den Link, um Ihr Konto zu bestätigen.",
            tr: "E-posta adresinizi doğrulamanız için bir bağlantı gönderdik. Hesabınızı onaylamak için lütfen bağlantıya tıklayın."
        },
        forCouples: {
            en: "For Couples",
            de: "Für Paare",
            tr: "Çiftler İçin"
        },
        forVendors: {
            en: "For Vendors",
            de: "Für Dienstleister",
            tr: "Tedarikçiler İçin"
        },
        fullName: {
            en: "Full Name",
            de: "Vollständiger Name",
            tr: "Ad Soyad"
        },
        businessName: {
            en: "Business Name",
            de: "Firmenname",
            tr: "İşletme Adı"
        },
        email: {
            en: "Email Address",
            de: "E-Mail-Adresse",
            tr: "E-posta Adresi"
        },
        category: {
            en: "Category",
            de: "Kategorie",
            tr: "Kategori"
        },
        location: {
            en: "Location",
            de: "Standort",
            tr: "Konum"
        },
        promoCode: {
            en: "Promo Code (Optional)",
            de: "Gutscheincode (Optional)",
            tr: "Promosyon Kodu (İsteğe Bağlı)"
        },
        selectCity: {
            en: "Select City...",
            de: "Stadt wählen...",
            tr: "Şehir seçin..."
        },
        password: {
            en: "Password",
            de: "Passwort",
            tr: "Şifre"
        },
        confirmPassword: {
            en: "Confirm Password",
            de: "Passwort bestätigen",
            tr: "Şifreyi Onayla"
        },
        submitCouple: {
            en: "Register as Couple",
            de: "Als Paar registrieren",
            tr: "Çift Olarak Kaydol"
        },
        submitVendor: {
            en: "Register as Vendor",
            de: "Partner werden",
            tr: "Tedarikçi Olarak Kaydol"
        },
        loginLink: {
            en: "Already have an account?",
            de: "Bereits ein Konto?",
            tr: "Zaten hesabınız var mı?"
        },
        errors: {
            name: {
                en: "Name is required",
                de: "Name ist erforderlich",
                tr: "İsim gereklidir"
            },
            email: {
                en: "Invalid email address",
                de: "Ungültige E-Mail-Adresse",
                tr: "Geçersiz e-posta adresi"
            },
            password: {
                en: "Password must be at least 6 characters",
                de: "Passwort muss mindestens 6 Zeichen lang sein",
                tr: "Şifre en az 6 karakter olmalıdır"
            },
            confirmPassword: {
                en: "Passwords do not match",
                de: "Passwörter stimmen nicht überein",
                tr: "Şifreler eşleşmiyor"
            },
            location: {
                en: "Please select a location",
                de: "Bitte wählen Sie einen Standort",
                tr: "Lütfen bir konum seçin"
            }
        },
        priceRange: {
            en: "Price Range",
            de: "Preisklasse",
            tr: "Fiyat Aralığı"
        },
        capacity: {
            en: "Capacity (Guests)",
            de: "Kapazität (Gäste)",
            tr: "Kapasite (Kişi Sayısı)"
        },
        selectTypeParams: {
            en: "Please select your registration type:",
            de: "Bitte wählen Sie Ihren Registrierungstyp:",
            tr: "Lütfen kayıt türünüzü seçin:"
        },
        coupleDesc: {
            en: "I want to plan my wedding. Compare venues, get quotes and use planning tools.",
            de: "Ich möchte meine Hochzeit planen. Orte vergleichen, Angebote einholen.",
            tr: "Düğünümü planlamak istiyorum. Mekanları incele, teklif al ve planlama araçlarını kullan."
        },
        vendorDesc: {
            en: "I want to offer services. Reach couples, send quotes and grow your business.",
            de: "Ich möchte Dienstleistungen anbieten. Paare erreichen, Angebote senden.",
            tr: "Hizmet vermek istiyorum. Çiftlere ulaş, teklif ver ve işini büyüt."
        },
        selectPrice: {
            en: "Select Price",
            de: "Preis wählen",
            tr: "Fiyat Seçiniz"
        },
        promoCode: {
            en: "Promo Code (Optional)",
            de: "Gutscheincode (Optional)",
            tr: "Promosyon Kodu (İsteğe Bağlı)"
        },
        creating: {
            en: "Creating Account...",
            de: "Konto wird erstellt...",
            tr: "Hesap Oluşturuluyor..."
        }
    },
    services: {
        title: {
            en: "Our Services",
            de: "Unsere Leistungen",
            tr: "Hizmetlerimiz"
        },
        venue: {
            en: "Amazing Venues",
            de: "Traumhafte Locations",
            tr: "Muhteşem Mekanlar"
        },
        venueDesc: {
            en: "From historic castles to modern lofts.",
            de: "Von historischen Schlössern bis zu modernen Lofts.",
            tr: "Tarihi şatolardan modern loftlara kadar."
        },
        catering: {
            en: "Exquisite Catering",
            de: "Exquisites Catering",
            tr: "Seçkin İkramlar"
        },
        cateringDesc: {
            en: "A feast for you and your guests.",
            de: "Ein Festmahl für Sie und Ihre Gäste.",
            tr: "Siz ve misafirleriniz için lezzet şöleni."
        },
        decor: {
            en: "Design & Decor",
            de: "Design & Dekoration",
            tr: "Tasarım & Dekorasyon"
        },
        decorDesc: {
            en: "Stylish concepts that reflect your personality.",
            de: "Stilvolle Konzepte, die Ihre Persönlichkeit widerspiegeln.",
            tr: "Kişiliğinizi yansıtan şık konseptler."
        },
        planning: {
            en: "Full Planning",
            de: "Komplettplanung",
            tr: "Tam Kapsamlı Planlama"
        },
        planningDesc: {
            en: "Sit back and let us handle everything.",
            de: "Lehnen Sie sich zurück, wir kümmern uns um alles.",
            tr: "Arkanıza yaslanın, her şeyi biz halledelim."
        },
        add: {
            en: "Add Service",
            de: "Dienstleistung hinzufügen",
            tr: "Hizmet Ekle"
        },
        edit: {
            en: "Edit Service",
            de: "Dienstleistung bearbeiten",
            tr: "Hizmeti Düzenle"
        },
        addNew: {
            en: "Add New Service",
            de: "Neue Dienstleistung hinzufügen",
            tr: "Yeni Hizmet Ekle"
        },
        name: {
            en: "Service Name",
            de: "Name der Dienstleistung",
            tr: "Hizmet Adı"
        },
        description: {
            en: "Description",
            de: "Beschreibung",
            tr: "Açıklama"
        },
        price: {
            en: "Starting Price",
            de: "Startpreis",
            tr: "Başlangıç Fiyatı"
        },
        duration: {
            en: "Duration",
            de: "Dauer",
            tr: "Süre"
        },
        empty: {
            en: "No services added yet. Add your first service!",
            de: "Noch keine Dienstleistungen hinzugefügt. Fügen Sie Ihre erste hinzu!",
            tr: "Henüz hizmet eklenmedi. İlk hizmetinizi ekleyin!"
        }
    },
    about: {
        title: {
            en: "Why Germany?",
            de: "Warum Deutschland?",
            tr: "Neden Almanya?"
        },
        desc: {
            en: "Phone",
            de: "Telefon",
            tr: "Telefon"
        },
        success: {
            en: "Message sent successfully! We will contact you soon.",
            de: "Nachricht erfolgreich gesendet! Wir werden uns bald bei Ihnen melden.",
            tr: "Mesaj başarıyla gönderildi! Sizinle en kısa sürede iletişime geçeceğiz."
        },
        error: {
            en: "Failed to send message. Please try again.",
            de: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
            tr: "Mesaj gönderilemedi. Lütfen tekrar deneyin."
        }
    },
    footer: {
        rights: {
            en: "All rights reserved.",
            de: "Alle Rechte vorbehalten.",
            tr: "Tüm hakları saklıdır."
        }
    },
    tools: {
        en: "Planning Tools",
        de: "Planungstools",
        tr: "Planlama Araçları"
    },
    login: {
        title: {
            en: "Login",
            de: "Anmelden",
            tr: "Giriş Yap"
        },
        verifyEmail: {
            en: "Please verify your email address before logging in.",
            de: "Bitte bestätigen Sie Ihre E-Mail-Adresse vor der Anmeldung.",
            tr: "Giriş yapmadan önce lütfen e-posta adresinizi doğrulayın."
        },
        invalidCredentials: {
            en: "Invalid email or password.",
            de: "Ungültige E-Mail oder Passwort.",
            tr: "E-posta veya şifre hatalı."
        },
        welcomeBack: {
            en: "Welcome Back",
            de: "Willkommen zurück",
            tr: "Tekrar Hoşgeldiniz"
        },
        coupleLogin: {
            en: "Couple Login",
            de: "Paar Login",
            tr: "Çift Girişi"
        },
        vendorLogin: {
            en: "Vendor Login",
            de: "Dienstleister Login",
            tr: "Tedarikçi Girişi"
        },
        email: {
            en: "Email Address",
            de: "E-Mail-Adresse",
            tr: "E-posta Adresi"
        },
        password: {
            en: "Password",
            de: "Passwort",
            tr: "Şifre"
        },
        submitCouple: {
            en: "Login as Couple",
            de: "Als Paar anmelden",
            tr: "Çift Olarak Giriş Yap"
        },
        submitVendor: {
            en: "Login as Vendor",
            de: "Als Dienstleister anmelden",
            tr: "Tedarikçi Olarak Giriş Yap"
        },
        loading: {
            en: "Logging in...",
            de: "Anmeldung läuft...",
            tr: "Giriş yapılıyor..."
        },
        noAccount: {
            en: "Don't have an account?",
            de: "Noch kein Konto?",
            tr: "Hesabınız yok mu?"
        },
        signUp: {
            en: "Sign up",
            de: "Registrieren",
            tr: "Kayıt Ol"
        },
        failed: {
            en: "Failed to login",
            de: "Anmeldung fehlgeschlagen",
            tr: "Giriş başarısız"
        }
    },
    forgotPassword: {
        title: {
            en: "Forgot Password",
            de: "Passwort vergessen",
            tr: "Şifremi Unuttum"
        },
        description: {
            en: "Enter your email address and we'll send you a link to reset your password.",
            de: "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.",
            tr: "E-posta adresinizi girin, şifrenizi sıfırlamanız için size bir bağlantı gönderelim."
        },
        emailLabel: {
            en: "Email Address",
            de: "E-Mail-Adresse",
            tr: "E-posta Adresi"
        },
        submitButton: {
            en: "Send Reset Link",
            de: "Link senden",
            tr: "Sıfırlama Bağlantısı Gönder"
        },
        backToLogin: {
            en: "Back to Login",
            de: "Zurück zur Anmeldung",
            tr: "Girişe Dön"
        },
        successMessage: {
            en: "Password reset link sent to your email address. Please check your inbox (don't forget to check spam folder).",
            de: "Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihren Posteingang (auch Spam-Ordner).",
            tr: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen kutunuzu kontrol edin (spam klasörüne de bakmayı unutmayın)."
        }
    },
    vendorLeads: {
        date: { en: "Date", de: "Datum", tr: "Tarih" },
        guests: { en: "Guests", de: "Gäste", tr: "Misafir" },
        phone: { en: "Phone", de: "Telefon", tr: "Telefon" },
        email: { en: "Email", de: "E-Mail", tr: "E-posta" },
        processing: { en: "Processing...", de: "Wird verarbeitet...", tr: "İşleniyor..." },
        unlockBtn: { en: "🔓 Unlock Contact Info (5 Credits)", de: "🔓 Kontaktinfo freischalten (5 Credits)", tr: "🔓 İletişim Bilgilerini Aç (5 Kredi)" },
        status: { en: "Status", de: "Status", tr: "Durum" },
        notes: { en: "Notes", de: "Notizen", tr: "Notlar" },
        notesPlaceholder: { en: "Notes about this client...", de: "Notizen zu diesem Kunden...", tr: "Bu müşteri hakkında notlar..." },
        saved: { en: "Saved", de: "Gespeichert", tr: "Kaydedildi" },
        statuses: {
            new: { en: "🆕 New", de: "🆕 Neu", tr: "🆕 Yeni" },
            contacted: { en: "📞 Contacted", de: "📞 Kontaktiert", tr: "📞 İletişimde" },
            booked: { en: "✅ Booked", de: "✅ Gebucht", tr: "✅ Anlaşıldı" },
            lost: { en: "❌ Lost", de: "❌ Verloren", tr: "❌ Olumsuz" }
        },
        alerts: {
            statusError: { en: "Could not update status.", de: "Status konnte nicht aktualisiert werden.", tr: "Durum güncellenemedi." },
            unlockConfirm: { en: "5 credits will be spent to unlock contact info. Confirm?", de: "5 Credits werden für die Freischaltung abgebucht. Bestätigen?", tr: "Bu talebin iletişim bilgilerini açmak için 5 kredi harcanacak. Onaylıyor musunuz?" },
            unlockSuccess: { en: "✅ Contact info unlocked! Remaining credits: ", de: "✅ Kontaktinfo freigeschaltet! Verbleibende Credits: ", tr: "✅ İletişim bilgileri açıldı! Kalan kredi: " },
            unlockError: { en: "❌ Error: ", de: "❌ Fehler: ", tr: "❌ Hata: " },
            genericError: { en: "Operation failed. Please check your balance.", de: "Vorgang fehlgeschlagen. Bitte Guthaben prüfen.", tr: "İşlem başarısız. Lütfen bakiyenizi kontrol edin." }
        }
    },
    edit: {
        en: "Edit",
        de: "Bearbeiten",
        tr: "Düzenle"
    },
    budget: {
        title: {
            en: "My Budget",
            de: "Mein Budget",
            tr: "Bütçem"
        },
        desc: {
            en: "Set your total wedding budget, manage expenses, and track payments.",
            de: "Legen Sie Ihr Gesamtbudget fest, verwalten Sie Ausgaben und verfolgen Sie Zahlungen.",
            tr: "Toplam düğün bütçenizi belirleyin, harcama kalemlerini yönetin ve ödemelerinizi takip edin."
        },
        totalLabel: {
            en: "Total Wedding Budget (€)",
            de: "Gesamtbudget (€)",
            tr: "Toplam Düğün Bütçeniz (€)"
        },
        totalPlaceholder: {
            en: "e.g. 20000",
            de: "z.B. 20000",
            tr: "Örn: 20000"
        },
        summaryTotal: {
            en: "Total Budget",
            de: "Gesamt",
            tr: "Toplam Bütçe"
        },
        summaryEstimated: {
            en: "Planned",
            de: "Geplant",
            tr: "Planlanan"
        },
        summaryActual: {
            en: "Spent",
            de: "Ausgegeben",
            tr: "Harcanan"
        },
        summaryRemaining: {
            en: "Remaining",
            de: "Verbleibend",
            tr: "Kalan"
        },
        addItemTitle: {
            en: "Add New Expense",
            de: "Neue Ausgabe hinzufügen",
            tr: "Yeni Harcama Kalemi Ekle"
        },
        categoryPlaceholder: {
            en: "Category name...",
            de: "Kategorie...",
            tr: "Kategori adı..."
        },
        amountPlaceholder: {
            en: "Estimated amount (€)",
            de: "Geschätzter Betrag (€)",
            tr: "Tahmini tutar (€)"
        },
        addBtn: {
            en: "Add",
            de: "Hinzufügen",
            tr: "Ekle"
        },
        notesPlaceholder: {
            en: "Description (Optional)",
            de: "Beschreibung (Optional)",
            tr: "Açıklama (Opsiyonel)"
        },
        tableNotes: {
            en: "Description",
            de: "Beschreibung",
            tr: "Açıklama"
        },
        tableCategory: {
            en: "Category",
            de: "Kategorie",
            tr: "Kategori"
        },
        tableEstimated: {
            en: "Planned",
            de: "Geplant",
            tr: "Planlanan"
        },
        tableActual: {
            en: "Spent",
            de: "Ausgegeben",
            tr: "Harcanan"
        },
        tableDiff: {
            en: "Diff",
            de: "Differenz",
            tr: "Fark"
        },
        tableAction: {
            en: "Action",
            de: "Aktion",
            tr: "İşlem"
        },
        tableStatus: {
            en: "Status",
            de: "Status",
            tr: "Durum"
        },
        paymentBtn: {
            en: "Payment",
            de: "Zahlung",
            tr: "Ödeme"
        },
        paymentPrompt: {
            en: "Enter payment amount (€):",
            de: "Zahlungsbetrag eingeben (€):",
            tr: "Ödeme tutarını girin (€):"
        },
        emptyState: {
            en: "No expenses added yet. Add your expenses above!",
            de: "Noch keine Ausgaben hinzugefügt. Fügen Sie oben Ihre Ausgaben hinzu!",
            tr: "Henüz bütçe kalemi eklenmedi. Yukarıdaki formdan harcama kalemlerinizi ekleyin!"
        },
        errors: {
            category: {
                en: "Please enter a category name.",
                de: "Bitte geben Sie einen Kategorienamen ein.",
                tr: "Lütfen bir kategori adı girin."
            },
            amount: {
                en: "Please enter a valid estimated amount.",
                de: "Bitte geben Sie einen gültigen Betrag ein.",
                tr: "Lütfen geçerli bir tahmini tutar girin."
            }
        },
        categories: {
            "Wedding Venues": {
                en: "Wedding Venues",
                de: "Hochzeitslocations",
                tr: "Düğün Mekanları"
            },
            "Bridal Fashion": {
                en: "Bridal Fashion",
                de: "Brautmode",
                tr: "Gelinlik & Moda"
            },
            "Hair & Make-Up": {
                en: "Hair & Make-Up",
                de: "Haare & Make-up",
                tr: "Saç & Makyaj"
            },
            "Groom Suits": {
                en: "Groom Suits",
                de: "Bräutigam Mode",
                tr: "Damatlık"
            },
            "Wedding Cakes": {
                en: "Wedding Cakes",
                de: "Hochzeitstorten",
                tr: "Düğün Pastası"
            },
            "Wedding Planners": {
                en: "Wedding Planners",
                de: "Hochzeitsplaner",
                tr: "Düğün Organizasyonu"
            },
            "Wedding Cars": {
                en: "Wedding Cars",
                de: "Hochzeitsautos",
                tr: "Gelin Arabası"
            },
            "Catering & Party Service": {
                en: "Catering & Party Service",
                de: "Catering & Partyservice",
                tr: "Catering"
            },
            "Wedding Speakers (Trauredner)": {
                en: "Wedding Speakers",
                de: "Trauredner",
                tr: "Nikah Memuru & Konuşmacı"
            },
            "Flowers & Decoration": {
                en: "Flowers & Decoration",
                de: "Blumen & Deko",
                tr: "Çiçek & Dekorasyon"
            },
            "Invitations & Stationery": {
                en: "Invitations & Stationery",
                de: "Einladungen & Papeterie",
                tr: "Davetiye"
            },
            "Wedding Rings": {
                en: "Wedding Rings",
                de: "Trauringe",
                tr: "Alyans & Takı"
            },
            "Wedding Photography": {
                en: "Wedding Photography",
                de: "Hochzeitsfotografie",
                tr: "Düğün Fotoğrafçısı"
            },
            "Wedding Videography": {
                en: "Wedding Videography",
                de: "Hochzeitsvideografie",
                tr: "Düğün Videocusu"
            },
            "Photobox": {
                en: "Photobox",
                de: "Fotobox",
                tr: "Fotoğraf Kabini"
            },
            "DJs": {
                en: "DJs",
                de: "DJs",
                tr: "DJ"
            },
            "Musicians": {
                en: "Musicians",
                de: "Musiker",
                tr: "Müzisyenler"
            },
            "Entertainment": {
                en: "Entertainment",
                de: "Unterhaltung",
                tr: "Eğlence"
            },
            // Legacy keys kept for safety
            venue: {
                en: "Wedding Venue",
                de: "Hochzeitslocation",
                tr: "Düğün Mekânı"
            },
            food: {
                en: "Food & Drink",
                de: "Essen & Trinken",
                tr: "Yemek & İçecek"
            },
            photo: {
                en: "Photo & Video",
                de: "Foto & Video",
                tr: "Fotoğraf & Video"
            },
            dress: {
                en: "Bridal Wear",
                de: "Brautmode",
                tr: "Gelinlik & Damatlık"
            },
            music: {
                en: "Music & DJ",
                de: "Musik & DJ",
                tr: "Müzik & DJ"
            },
            flowers: {
                en: "Flowers",
                de: "Blumen",
                tr: "Çiçek Süsleme"
            },
            invite: {
                en: "Invitations",
                de: "Einladungen",
                tr: "Davetiye"
            },
            cake: {
                en: "Wedding Cake",
                de: "Hochzeitstorte",
                tr: "Düğün Pastası"
            },
            transport: {
                en: "Transport",
                de: "Transport",
                tr: "Ulaşım"
            },
            honeymoon: {
                en: "Honeymoon",
                de: "Flitterwochen",
                tr: "Balayı"
            },
            other: {
                en: "Other",
                de: "Sonstiges",
                tr: "Diğer"
            }
        }
    },
    seating: {
        title: {
            en: "Seating Plan",
            de: "Sitzplan",
            tr: "Oturma Planı"
        },
        desc: {
            en: "Plan your tables and easily seat your guests with drag-and-drop.",
            de: "Planen Sie Ihre Tische und platzieren Sie Ihre Gäste einfach per Drag-and-Drop.",
            tr: "Masalarınızı planlayın ve misafirlerinizi sürükle-bırak yöntemiyle kolayca yerleştirin."
        },
        addTable: {
            en: "Add Table",
            de: "Tisch hinzufügen",
            tr: "Masa Ekle"
        },
        addRoundTable: {
            en: "Round Table",
            de: "Runder Tisch",
            tr: "Yuvarlak Masa"
        },
        addRectTable: {
            en: "Rectangular Table",
            de: "Rechteckiger Tisch",
            tr: "Dikdörtgen Masa"
        },
        tableName: {
            en: "Table Name",
            de: "Tischname",
            tr: "Masa Adı"
        },
        capacity: {
            en: "Capacity",
            de: "Kapazität",
            tr: "Kapasite"
        },
        addGuest: {
            en: "Add Guest",
            de: "Gast hinzufügen",
            tr: "Misafir Ekle"
        },
        guestName: {
            en: "Guest Name",
            de: "Gastname",
            tr: "Misafir Adı"
        },
        removeGuest: {
            en: "Remove from Table",
            de: "Vom Tisch entfernen",
            tr: "Masadan Kaldır"
        },
        unassigned: {
            en: "Unassigned Guests",
            de: "Nicht zugewiesene Gäste",
            tr: "Atanmamış Misafirler"
        },
        assignTo: {
            en: "Assign to",
            de: "Zuweisen an",
            tr: "Ata:"
        },
        allSeated: {
            en: "All guests seated!",
            de: "Alle Gäste platziert!",
            tr: "Tüm misafirler yerleştirildi!"
        },
        dragDrop: {
            en: "Drag guests here",
            de: "Gäste hierher ziehen",
            tr: "Misafirleri buraya sürükleyin"
        },
        selectTable: {
            en: "Select Table",
            de: "Tisch auswählen",
            tr: "Masa Seçin"
        },
        selectTableDesc: {
            en: "Select a table from the map to edit or add a new one.",
            de: "Wählen Sie einen Tisch von der Karte, um ihn zu bearbeiten, oder fügen Sie einen neuen hinzu.",
            tr: "Düzenlemek için haritadan bir masa seçin veya yeni bir masa ekleyin."
        }
    },
    weather: {
        title: {
            en: "Wedding Weather",
            de: "Hochzeitswetter",
            tr: "Düğün Havası"
        },
        desc: {
            en: "Check the weather forecast for your wedding date and location.",
            de: "Prüfen Sie die Wettervorhersage für Ihren Hochzeitstermin und -ort.",
            tr: "Düğün tarihiniz ve mekanınız için hava durumu tahminini kontrol edin."
        },
        cityLabel: {
            en: "Wedding City",
            de: "Hochzeitsstadt",
            tr: "Düğün Şehri"
        },
        showForecast: {
            en: "Show Forecast",
            de: "Vorhersage anzeigen",
            tr: "Tahmini Göster"
        },
        results: {
            en: "Forecast Results",
            de: "Vorhersageergebnisse",
            tr: "Tahmin Sonuçları"
        },
        avgTemp: {
            en: "Avg. Temp",
            de: "Ø Temp.",
            tr: "Ort. Sıcaklık"
        },
        sunset: {
            en: "Sunset",
            de: "Sonnenuntergang",
            tr: "Gün Batımı"
        },
        rainChance: {
            en: "Rain Chance",
            de: "Regenwahrscheinlichkeit",
            tr: "Yağış İhtimali"
        },
        condition: {
            en: "Condition",
            de: "Bedingung",
            tr: "Durum"
        },
        recommendationsTitle: {
            en: "Recommendations",
            de: "Empfehlungen",
            tr: "Öneriler"
        },
        emptyState: {
            en: "Select your wedding city and date to see the forecast.",
            de: "Wählen Sie Ihre Hochzeitsstadt und das Datum, um die Vorhersage zu sehen.",
            tr: "Hava durumu tahminini görmek için düğün şehrinizi ve tarihinizi seçin."
        },
        disclaimer: {
            en: "These are historical averages.",
            de: "Dies sind historische Durchschnittswerte.",
            tr: "Bu veriler geçmiş ortalamalara dayanmaktadır."
        },
        conditions: {
            coldSnow: {
                en: "Cold & Snowy",
                de: "Kalt & Schnee",
                tr: "Soğuk & Karlı"
            },
            cold: {
                en: "Cold",
                de: "Kalt",
                tr: "Soğuk"
            },
            cool: {
                en: "Cool",
                de: "Kühl",
                tr: "Serin"
            },
            mild: {
                en: "Mild",
                de: "Mild",
                tr: "Ilıman"
            },
            warm: {
                en: "Warm",
                de: "Warm",
                tr: "Sıcak"
            },
            hot: {
                en: "Hot",
                de: "Heiß",
                tr: "Çok Sıcak"
            },
            coldWindy: {
                en: "Cold & Windy",
                de: "Kalt & Windig",
                tr: "Soğuk & Rüzgarlı"
            }
        },
        recommendations: {
            cold1: {
                en: "Prepare blankets or shawls for guests.",
                de: "Bereiten Sie Decken oder Schals für Gäste vor.",
                tr: "Misafirleriniz için battaniye veya şal hazırlayın."
            },
            cold2: {
                en: "Consider outdoor heaters.",
                de: "Erwägen Sie Heizstrahler für draußen.",
                tr: "Açık havada ısıtıcı kullanmayı düşünün."
            },
            rain1: {
                en: "Have a rain plan - indoor alternative.",
                de: "Haben Sie einen Regenplan - Indoor-Alternative.",
                tr: "Yağmur planı hazırlayın - kapalı alan alternatifi."
            },
            rain2: {
                en: "Provide umbrellas for guests.",
                de: "Stellen Sie Regenschirme bereit.",
                tr: "Misafirler için şemsiye temin edin."
            },
            hot1: {
                en: "Provide plenty of water and cool drinks.",
                de: "Sorgen Sie für viel Wasser und kühle Getränke.",
                tr: "Bol miktarda su ve serinletici içecek hazırlayın."
            },
            hot2: {
                en: "Create shaded areas.",
                de: "Schaffen Sie schattige Bereiche.",
                tr: "Gölgelik alanlar oluşturun."
            },
            hot3: {
                en: "Plan for fans or air conditioning.",
                de: "Planen Sie Ventilatoren oder Klimaanlagen ein.",
                tr: "Vantilatör veya klima kullanımını planlayın."
            },
            dark1: {
                en: "Plan early lighting.",
                de: "Planen Sie frühe Beleuchtung.",
                tr: "Erken aydınlatma planlayın."
            },
            dark2: {
                en: "Arrange romantic candles and lights.",
                de: "Arrangieren Sie romantische Kerzen und Lichter.",
                tr: "Romantik mum ve ışık düzenlemesi yapın."
            }
        },
        errors: {
            city: {
                en: "Please select a city.",
                de: "Bitte wählen Sie eine Stadt.",
                tr: "Lütfen bir şehir seçin."
            },
            date: {
                en: "Please select a date.",
                de: "Bitte wählen Sie ein Datum.",
                tr: "Lütfen bir tarih seçin."
            },
            noData: {
                en: "No data found.",
                de: "Keine Daten gefunden.",
                tr: "Veri bulunamadı."
            }
        }
    },
    calendar: {
        available: {
            en: "Available",
            de: "Verfügbar",
            tr: "Müsait"
        },
        booked: {
            en: "Booked",
            de: "Gebucht",
            tr: "Dolu"
        },
        hint: {
            en: "Click on a date to toggle availability.",
            de: "Klicken Sie auf ein Datum, um die Verfügbarkeit zu ändern.",
            tr: "Müsaitlik durumunu değiştirmek için tarihe tıklayın."
        }
    },
    months: {
        january: {
            en: "January",
            de: "Januar",
            tr: "Ocak"
        },
        february: {
            en: "February",
            de: "Februar",
            tr: "Şubat"
        },
        march: {
            en: "March",
            de: "März",
            tr: "Mart"
        },
        april: {
            en: "April",
            de: "April",
            tr: "Nisan"
        },
        may: {
            en: "May",
            de: "Mai",
            tr: "Mayıs"
        },
        june: {
            en: "June",
            de: "Juni",
            tr: "Haziran"
        },
        july: {
            en: "July",
            de: "Juli",
            tr: "Temmuz"
        },
        august: {
            en: "August",
            de: "August",
            tr: "Ağustos"
        },
        september: {
            en: "September",
            de: "September",
            tr: "Eylül"
        },
        october: {
            en: "October",
            de: "Oktober",
            tr: "Ekim"
        },
        november: {
            en: "November",
            de: "November",
            tr: "Kasım"
        },
        december: {
            en: "December",
            de: "Dezember",
            tr: "Aralık"
        }
    },
    weekdays: {
        mon: {
            en: "Mon",
            de: "Mo",
            tr: "Pzt"
        },
        tue: {
            en: "Tue",
            de: "Di",
            tr: "Sal"
        },
        wed: {
            en: "Wed",
            de: "Mi",
            tr: "Çar"
        },
        thu: {
            en: "Thu",
            de: "Do",
            tr: "Per"
        },
        fri: {
            en: "Fri",
            de: "Fr",
            tr: "Cum"
        },
        sat: {
            en: "Sat",
            de: "Sa",
            tr: "Cmt"
        },
        sun: {
            en: "Sun",
            de: "So",
            tr: "Paz"
        }
    },
    schemas: {
        performance_duration_label: { en: "Performance Duration", de: "Auftrittsdauer", tr: "Performans Süresi" },
        performance_duration: { en: "Performance Duration", de: "Auftrittsdauer", tr: "Performans Süresi" },
        experience_years_label: { en: "Years of Experience", de: "Jahre Erfahrung", tr: "Deneyim Yılı" },
        experience_years: { en: "Years of Experience", de: "Jahre Erfahrung", tr: "Deneyim Yılı" },
        music_genre_label: { en: "Music Genres", de: "Musikrichtungen", tr: "Müzik Tarzları" },
        music_genres_label: { en: "Music Genres", de: "Musikrichtungen", tr: "Müzik Tarzları" },
        equipment_label: { en: "Equipment", de: "Ausrüstung", tr: "Ekipman" },
        wedding_types_label: { en: "Wedding Types", de: "Hochzeitsarten", tr: "Düğün Türleri" },
        services_label: { en: "Services", de: "Leistungen", tr: "Hizmetler" },
        catering_types_label: { en: "Catering Types", de: "Catering-Arten", tr: "Catering Türleri" },
        menu_options_label: { en: "Menu Options", de: "Menüoptionen", tr: "Menü Seçenekleri" },
        vehicle_type_label: { en: "Vehicle Type", de: "Fahrzeugtyp", tr: "Araç Tipi" },
        driver_included_label: { en: "Driver Included", de: "Fahrer inklusive", tr: "Şoför Dahil" },
        jewelry_type_label: { en: "Jewelry Type", de: "Schmuckart", tr: "Takı Türü" },
        material_label: { en: "Material", de: "Material", tr: "Malzeme" },
        custom_design_label: { en: "Custom Design", de: "Individuelles Design", tr: "Özel Tasarım" },
        maintenance_service_label: { en: "Maintenance Service", de: "Wartungsservice", tr: "Bakım Hizmeti" },
        invitation_type_label: { en: "Invitation Type", de: "Einladungsart", tr: "Davetiye Türü" },
        design_style_label: { en: "Design Style", de: "Designstil", tr: "Tasarım Tarzı" },
        flower_type_label: { en: "Flower Type", de: "Blumenart", tr: "Çiçek Türü" },
        arrangement_style_label: { en: "Arrangement Style", de: "Arrangement-Stil", tr: "Aranjman Tarzı" },
        video_style_label: { en: "Video Style", de: "Videostil", tr: "Video Tarzı" },
        resolution_label: { en: "Resolution", de: "Auflösung", tr: "Çözünürlük" },
        photo_style_label: { en: "Photo Style", de: "Fotostil", tr: "Fotoğraf Tarzı" },
        print_options_label: { en: "Print Options", de: "Druckoptionen", tr: "Baskı Seçenekleri" },
        entertainment_type_label: { en: "Entertainment Type", de: "Unterhaltungsart", tr: "Eğlence Türü" },
        suit_style_label: { en: "Suit Style", de: "Anzugstil", tr: "Takım Elbise Tarzı" },
        fabric_label: { en: "Fabric", de: "Stoff", tr: "Kumaş" },
        venue_type_label: { en: "Venue Type", de: "Location-Typ", tr: "Mekan Tipi" },
        capacity_label: { en: "Capacity", de: "Kapazität", tr: "Kapasite" },
        dress_style_label: { en: "Dress Style", de: "Kleidungsstil", tr: "Gelinlik Tarzı" },
        brand_label: { en: "Brand", de: "Marke", tr: "Marka" },
        genre_pop: { en: "Pop", de: "Pop", tr: "Pop" },
        genre_turkish_pop: { en: "Turkish Pop", de: "Türkischer Pop", tr: "Türkçe Pop" },
        genre_foreign_pop: { en: "Foreign Pop", de: "Ausländischer Pop", tr: "Yabancı Pop" },
        genre_rnb: { en: "R&B", de: "R&B", tr: "R&B" },
        genre_hiphop: { en: "Hip Hop", de: "Hip Hop", tr: "Hip Hop" },
        genre_electronic: { en: "Electronic", de: "Elektronisch", tr: "Elektronik" },
        genre_house: { en: "House", de: "House", tr: "House" },
        genre_techno: { en: "Techno", de: "Techno", tr: "Tekno" },
        genre_90s: { en: "90s", de: "90er", tr: "90'lar" },
        genre_80s: { en: "80s", de: "80er", tr: "80'ler" },
        equip_sound: { en: "Sound System", de: "Tonsystem", tr: "Ses Sistemi" },
        equip_light: { en: "Light System", de: "Lichtsystem", tr: "Işık Sistemi" },
        equip_fog: { en: "Fog Machine", de: "Nebelmaschine", tr: "Sis Makinesi" },
        equip_dj_booth: { en: "DJ Booth", de: "DJ-Pult", tr: "DJ Kabini" },
        equip_mic: { en: "Microphone", de: "Mikrofon", tr: "Mikrofon" }
    },
    messages: {
        title: {
            en: "Messages",
            de: "Nachrichten",
            tr: "Mesajlar"
        },
        noSelection: {
            en: "Select a conversation to start messaging.",
            de: "Wählen Sie eine Unterhaltung aus, um zu beginnen.",
            tr: "Mesajlaşmaya başlamak için bir sohbet seçin."
        },
        typePlaceholder: {
            en: "Type your message...",
            de: "Schreiben Sie Ihre Nachricht...",
            tr: "Mesajınızı yazın..."
        },
        send: {
            en: "Send Reply",
            de: "Antwort senden",
            tr: "Yanıt Gönder"
        },
        search: {
            en: "Search messages...",
            de: "Nachrichten suchen...",
            tr: "Mesajlarda ara..."
        },
        myRequests: {
            en: "My Quote Requests",
            de: "Meine Anfragen",
            tr: "Teklif Taleplerim"
        },
        noRequests: {
            en: "No quote requests yet.",
            de: "Noch keine Anfragen.",
            tr: "Henüz teklif talebiniz yok."
        },
        loading: {
            en: "Loading...",
            de: "Lädt...",
            tr: "Yükleniyor..."
        },
        weddingDate: {
            en: "Wedding Date",
            de: "Hochzeitsdatum",
            tr: "Düğün Tarihi"
        },
        notSpecified: {
            en: "Not specified",
            de: "Nicht angegeben",
            tr: "Belirtilmemiş"
        },
        selectConversation: {
            en: "👈 Select a conversation",
            de: "👈 Wählen Sie eine Unterhaltung",
            tr: "👈 Bir konuşma seçin"
        },
        statusNew: {
            en: "New",
            de: "Neu",
            tr: "Yeni"
        },
        statusPending: {
            en: "Pending",
            de: "Ausstehend",
            tr: "Beklemede"
        },
        statusReplied: {
            en: "Replied",
            de: "Beantwortet",
            tr: "Yanıtlandı"
        },
        searchPlaceholder: {
            en: "Search messages...",
            de: "Nachrichten suchen...",
            tr: "Mesajlarda ara..."
        },
        noResults: {
            en: "No messages found",
            de: "Keine Nachrichten gefunden",
            tr: "Mesaj bulunamadı"
        },
        typing: {
            en: "typing...",
            de: "schreibt...",
            tr: "yazıyor..."
        }
    },
    settings: {
        title: {
            en: "Settings",
            de: "Einstellungen",
            tr: "Ayarlar"
        },
        general: {
            en: "General",
            de: "Allgemein",
            tr: "Genel"
        },
        notifications: {
            en: "Notifications",
            de: "Benachrichtigungen",
            tr: "Bildirimler"
        },
        security: {
            en: "Security",
            de: "Sicherheit",
            tr: "Güvenlik"
        },
        businessName: {
            en: "Business Name",
            de: "Firmenname",
            tr: "İşletme Adı"
        },
        email: {
            en: "Email Address",
            de: "E-Mail-Adresse",
            tr: "E-posta Adresi"
        },
        emailNotifications: {
            en: "Email Notifications",
            de: "E-Mail-Benachrichtigungen",
            tr: "E-posta Bildirimleri"
        },
        changePassword: {
            en: "Change Password",
            de: "Passwort ändern",
            tr: "Şifre Değiştir"
        },
        currentPassword: {
            en: "Current Password",
            de: "Aktuelles Passwort",
            tr: "Mevcut Şifre"
        },
        newPassword: {
            en: "New Password",
            de: "Neues Passwort",
            tr: "Yeni Şifre"
        },
        confirmNewPassword: {
            en: "Confirm New Password",
            de: "Neues Passwort bestätigen",
            tr: "Yeni Şifreyi Onayla"
        },
        saveSuccess: {
            en: "Settings saved successfully!",
            de: "Einstellungen erfolgreich gespeichert!",
            tr: "Ayarlar başarıyla kaydedildi!"
        }
    },

    leadForm: {
        title: {
            en: "Get Free Quote",
            de: "Kostenloses Angebot erhalten",
            tr: "Ücretsiz Teklif Al"
        },
        subtitle: {
            en: "Fill in your details to get quotes from the best vendors.",
            de: "Füllen Sie Ihre Daten aus, um Angebote von den besten Dienstleistern zu erhalten.",
            tr: "Bilgilerinizi doldurun, size en uygun tedarikçilerden teklifler alın."
        },
        category: {
            en: "Service Category",
            de: "Dienstleistungskategorie",
            tr: "Hizmet Kategorisi"
        },
        selectCategory: {
            en: "Select Category",
            de: "Kategorie wählen",
            tr: "Kategori Seçin"
        },
        city: {
            en: "City",
            de: "Stadt",
            tr: "Şehir"
        },
        selectCity: {
            en: "Select City",
            de: "Stadt wählen",
            tr: "Şehir Seçin"
        },
        date: {
            en: "Event Date",
            de: "Veranstaltungsdatum",
            tr: "Etkinlik Tarihi"
        },
        budget: {
            en: "Budget Range (€)",
            de: "Budgetbereich (€)",
            tr: "Bütçe Aralığı (€)"
        },
        name: {
            en: "Your Name",
            de: "Ihr Name",
            tr: "Adınız"
        }
    },
    footer: {
        rights: {
            en: "All rights reserved.",
            de: "Alle Rechte vorbehalten.",
            tr: "Tüm hakları saklıdır."
        },
        impressum: {
            en: "Imprint",
            de: "Impressum",
            tr: "Künye"
        },
        privacy: {
            en: "Privacy Policy",
            de: "Datenschutzerklärung",
            tr: "Gizlilik Politikası"
        },
        terms: {
            en: "Terms of Service",
            de: "AGB",
            tr: "Kullanım Koşulları"
        }
    },
    email: {
        en: "Email",
        de: "E-Mail",
        tr: "E-posta"
    },
    phone: {
        en: "Phone",
        de: "Telefon",
        tr: "Telefon"
    },
    notes: {
        en: "Additional Notes",
        de: "Zusätzliche Anmerkungen",
        tr: "Ek Notlar"
    },
    notesPlaceholder: {
        en: "Special requests or details...",
        de: "Besondere Wünsche oder Details...",
        tr: "Özel istekleriniz veya detaylar..."
    },
    submit: {
        en: "Request Quote",
        de: "Angebot anfordern",
        tr: "Teklif Talep Et"
    },
    submitting: {
        en: "Sending...",
        de: "Wird gesendet...",
        tr: "Gönderiliyor..."
    },
    success: {
        en: "Request sent successfully! Vendors will contact you soon.",
        de: "Anfrage erfolgreich gesendet! Dienstleister werden Sie bald kontaktieren.",
        tr: "Talebiniz başarıyla gönderildi! Tedarikçiler en kısa sürede sizinle iletişime geçecek."
    },
    error: {
        en: "An error occurred. Please try again.",
        de: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        tr: "Bir hata oluştu. Lütfen tekrar deneyin."
    },
    leadForm: {
        title: {
            en: "Get Free Quotes",
            de: "Kostenlose Angebote erhalten",
            tr: "Ücretsiz Teklif Al"
        },
        subtitle: {
            en: "Tell us what you need, and we'll find the best vendors for you.",
            de: "Sagen Sie uns, was Sie brauchen, und wir finden die besten Anbieter für Sie.",
            tr: "İhtiyaçlarınızı bize bildirin, sizin için en iyi tedarikçileri bulalım."
        },
        category: {
            en: "Category",
            de: "Kategorie",
            tr: "Kategori"
        },
        selectCategory: {
            en: "Select Category",
            de: "Kategorie wählen",
            tr: "Kategori Seçin"
        },
        city: {
            en: "City",
            de: "Stadt",
            tr: "Şehir"
        },
        selectCity: {
            en: "Select City",
            de: "Stadt wählen",
            tr: "Şehir Seçin"
        },
        date: {
            en: "Event Date",
            de: "Veranstaltungsdatum",
            tr: "Etkinlik Tarihi"
        },
        budget: {
            en: "Budget Range (€)",
            de: "Budgetrahmen (€)",
            tr: "Bütçe Aralığı (€)"
        },
        name: {
            en: "Your Name",
            de: "Ihr Name",
            tr: "Adınız"
        },
        email: {
            en: "Email Address",
            de: "E-Mail-Adresse",
            tr: "E-posta Adresi"
        },
        phone: {
            en: "Phone Number",
            de: "Telefonnummer",
            tr: "Telefon Numarası"
        },
        notes: {
            en: "Additional Notes",
            de: "Zusätzliche Anmerkungen",
            tr: "Ek Notlar"
        },
        notesPlaceholder: {
            en: "Describe your dream wedding, specific requirements, or questions...",
            de: "Beschreiben Sie Ihre Traumhochzeit, spezielle Anforderungen oder Fragen...",
            tr: "Hayalinizdeki düğünü, özel isteklerinizi veya sorularınızı anlatın..."
        },
        submit: {
            en: "Get Free Quotes",
            de: "Kostenlose Angebote anfordern",
            tr: "Ücretsiz Teklif Al"
        },
        submitting: {
            en: "Sending...",
            de: "Wird gesendet...",
            tr: "Gönderiliyor..."
        },
        success: {
            en: "Your request has been sent successfully! Vendors will contact you soon.",
            de: "Ihre Anfrage wurde erfolgreich gesendet! Dienstleister werden Sie bald kontaktieren.",
            tr: "Talebiniz başarıyla gönderildi! Tedarikçiler en kısa sürede sizinle iletişime geçecek."
        },
        error: {
            en: "An error occurred. Please try again.",
            de: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
            tr: "Bir hata oluştu. Lütfen tekrar deneyin."
        }
    },
    cookie: {
        text: {
            en: "We use cookies to improve your experience. By using our site, you agree to our",
            de: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die Nutzung unserer Website stimmen Sie unserer",
            tr: "Deneyiminizi geliştirmek için çerezleri kullanıyoruz. Sitemizi kullanarak,"
        },
        policyLink: {
            en: "Privacy Policy",
            de: "Datenschutzerklärung",
            tr: "Gizlilik Politikamızı"
        },
        accept: {
            en: "Accept",
            de: "Akzeptieren",
            tr: "Kabul Et"
        },
        decline: {
            en: "Decline",
            de: "Ablehnen",
            tr: "Reddet"
        }
    },
    vendorDashboard: {
        tiers: {
            free: {
                name: { en: "Free", de: "Kostenlos", tr: "Ücretsiz" },
                desc: { en: "Basic visibility", de: "Grundlegende Sichtbarkeit", tr: "Temel görünürlük" }
            },
            basic: {
                name: { en: "Basic", de: "Basic", tr: "Temel" },
                desc: { en: "More photos & info", de: "Mehr Fotos & Infos", tr: "Daha fazla fotoğraf & bilgi" }
            },
            premium: {
                name: { en: "Premium", de: "Premium", tr: "Premium" },
                desc: { en: "Full access & top ranking", de: "Voller Zugriff & Top-Ranking", tr: "Tam erişim & üst sıra" }
            }
        },
        profile: {
            locationSettings: {
                en: "Location Settings",
                de: "Standorteinstellungen",
                tr: "Konum Ayarları"
            },
            useMyLocation: {
                en: "Use My Location",
                de: "Meinen Standort verwenden",
                tr: "Konumumu Kullan"
            },
            latitude: {
                en: "Latitude",
                de: "Breitengrad",
                tr: "Enlem"
            },
            longitude: {
                en: "Longitude",
                de: "Längengrad",
                tr: "Boylam"
            },
            businessName: { en: "Business Name", de: "Firmenname", tr: "İşletme Adı" },
            category: { en: "Category", de: "Kategorie", tr: "Kategori" },
            additionalCategories: {
                en: "Additional Categories",
                de: "Zusätzliche Kategorien",
                tr: "Ek Kategoriler"
            },
            city: { en: "City", de: "Stadt", tr: "Şehir" },
            description: { en: "Description", de: "Beschreibung", tr: "Açıklama" },
            priceRange: { en: "Price Range", de: "Preisklasse", tr: "Fiyat Aralığı" },
            capacity: { en: "Capacity", de: "Kapazität", tr: "Kapasite" }
        }
    },
    paymentMethods: {
        cash: { en: "Cash", de: "Barzahlung", tr: "Nakit" },
        creditCard: { en: "Credit Card", de: "Kreditkarte", tr: "Kredi Kartı" },
        bankTransfer: { en: "Bank Transfer", de: "Überweisung", tr: "Havale/EFT" },
        paypal: { en: "PayPal", de: "PayPal", tr: "PayPal" }
    },
    languages: {
        tr: { en: "Turkish", de: "Türkisch", tr: "Türkçe" },
        de: { en: "German", de: "Deutsch", tr: "Almanca" },
        en: { en: "English", de: "Englisch", tr: "İngilizce" },
        fr: { en: "French", de: "Französisch", tr: "Fransızca" },
        es: { en: "Spanish", de: "Spanisch", tr: "İspanyolca" },
        it: { en: "Italian", de: "Italienisch", tr: "İtalyanca" },
        ar: { en: "Arabic", de: "Arabisch", tr: "Arapça" },
        ru: { en: "Russian", de: "Russisch", tr: "Rusça" }
    },
    leads: {
        title: { en: "Inquiries", de: "Anfragen", tr: "Gelen Talepler" },
        noLeads: { en: "No inquiries yet.", de: "Noch keine Anfragen.", tr: "Henüz talep yok." },
        date: { en: "Date", de: "Datum", tr: "Tarih" },
        name: { en: "Name", de: "Name", tr: "İsim" },
        email: { en: "Email", de: "E-Mail", tr: "E-posta" },
        message: { en: "Message", de: "Nachricht", tr: "Mesaj" },
        phone: { en: "Phone", de: "Telefon", tr: "Telefon" },
        status: { en: "Status", de: "Status", tr: "Durum" },
        weddingDate: { en: "Wedding Date", de: "Hochzeitsdatum", tr: "Düğün Tarihi" }
    },

    // Schema Translations
    schemas: {
        // Common
        capacity_meal_label: { tr: "Yemekli Kapasite", en: "Dining Capacity", de: "Kapazität (Essen)" },
        capacity_cocktail_label: { tr: "Kokteyl Kapasite", en: "Cocktail Capacity", de: "Kapazität (Cocktail)" },
        view_label: { tr: "Manzara", en: "View", de: "Aussicht" },
        features_label: { tr: "İmkanlar", en: "Features", de: "Eigenschaften" },
        allowed_services_label: { tr: "Dışarıdan İzin Verilenler", en: "Allowed External Services", de: "Erlaubte externe Dienstleister" },
        delivery_time_weeks_label: { tr: "Teslim Süresi (Hafta)", en: "Delivery Time (Weeks)", de: "Lieferzeit (Wochen)" },
        team_size_label: { tr: "Ekip Kişi Sayısı", en: "Team Size", de: "Teamgröße" },
        services_label: { tr: "Hizmetler", en: "Services", de: "Dienstleistungen" },
        start_price_label: { tr: "Başlangıç Fiyatı", en: "Starting Price", de: "Startpreis" },
        min_guests_label: { tr: "Minimum Kişi Sayısı", en: "Minimum Guests", de: "Mindestanzahl Gäste" },
        max_guests_label: { tr: "Maksimum Kişi Sayısı", en: "Maximum Guests", de: "Maximale Gästeanzahl" },

        // Wedding Venues
        venue_type_label: { tr: "Mekan Tipi", en: "Venue Type", de: "Art der Location" },
        venue_option_country: { tr: "Kır Düğünü", en: "Country Wedding", de: "Landhochzeit" },
        venue_option_hotel: { tr: "Otel", en: "Hotel", de: "Hotel" },
        venue_option_historic: { tr: "Tarihi Mekan", en: "Historic Venue", de: "Historischer Ort" },
        venue_option_restaurant: { tr: "Restoran", en: "Restaurant", de: "Restaurant" },
        venue_option_boat: { tr: "Tekne", en: "Boat", de: "Boot" },
        venue_option_social: { tr: "Sosyal Tesis", en: "Social Facility", de: "Soziale Einrichtung" },
        venue_option_hall: { tr: "Düğün Salonu", en: "Wedding Hall", de: "Hochzeitssaal" },

        view_sea: { tr: "Deniz", en: "Sea", de: "Meer" },
        view_nature: { tr: "Doğa", en: "Nature", de: "Natur" },
        view_city: { tr: "Şehir", en: "City", de: "Stadt" },
        view_bosphorus: { tr: "Boğaz", en: "Bosphorus", de: "Bosporus" },
        view_historic: { tr: "Tarihi", en: "Historic", de: "Historisch" },
        view_lake: { tr: "Göl", en: "Lake", de: "See" },
        view_forest: { tr: "Orman", en: "Forest", de: "Wald" },

        feature_accommodation: { tr: "Konaklama", en: "Accommodation", de: "Unterkunft" },
        feature_parking: { tr: "Otopark", en: "Parking", de: "Parkplatz" },
        feature_valet: { tr: "Vale", en: "Valet", de: "Valet" },
        feature_disabled_access: { tr: "Engelli Girişi", en: "Disabled Access", de: "Barrierefreier Zugang" },
        feature_after_party: { tr: "After Party Alanı", en: "After Party Area", de: "After-Party-Bereich" },
        feature_menu_tasting: { tr: "Menü Tadımı", en: "Menu Tasting", de: "Menüverkostung" },
        feature_sound_light: { tr: "Işık, Ses ve Sahne", en: "Light, Sound & Stage", de: "Licht, Ton & Bühne" },

        allowed_catering: { tr: "Dışarıdan Catering", en: "External Catering", de: "Externes Catering" },
        allowed_organization: { tr: "Dışarıdan Organizasyon", en: "External Organization", de: "Externe Organisation" },
        allowed_photography: { tr: "Dışarıdan Fotoğrafçı", en: "External Photographer", de: "Externer Fotograf" },

        // Wedding Photography
        shooting_types_label: { tr: "Çekim Türleri", en: "Shooting Types", de: "Aufnahmearten" },
        shoot_documentary: { tr: "Düğün Belgeseli", en: "Wedding Documentary", de: "Hochzeitsdokumentation" },
        shoot_story: { tr: "Düğün Hikayesi", en: "Wedding Story", de: "Hochzeitsgeschichte" },
        shoot_catalog: { tr: "Katalog Çekimi", en: "Catalog Shoot", de: "Katalogaufnahme" },
        shoot_save_the_date: { tr: "Save the Date", en: "Save the Date", de: "Save the Date" },
        shoot_trashday: { tr: "Trashday", en: "Trash the Dress", de: "Trash the Dress" },
        shoot_engagement: { tr: "Nişan/Kına", en: "Engagement/Henna", de: "Verlobung/Henna" },
        shoot_studio: { tr: "Stüdyo Çekimi", en: "Studio Shoot", de: "Studioaufnahme" },
        shoot_clip: { tr: "Düğün Klibi", en: "Wedding Clip", de: "Hochzeitsclip" },
        shoot_teaser: { tr: "Teaser", en: "Teaser", de: "Teaser" },

        service_drone: { tr: "Drone Çekimi", en: "Drone Shot", de: "Drohnenaufnahme" },
        service_jimmy_jib: { tr: "Jimmy Jib", en: "Jimmy Jib", de: "Jimmy Jib" },
        service_album_print: { tr: "Albüm Baskı", en: "Album Print", de: "Albumdruck" },
        service_digital: { tr: "Dijital Teslim", en: "Digital Delivery", de: "Digitale Lieferung" },
        service_full_day: { tr: "Tüm Gün Çekim", en: "Full Day Shoot", de: "Ganztägige Aufnahme" },
        service_video_clip: { tr: "Video Klip", en: "Video Clip", de: "Videoclip" },
        service_4k: { tr: "4K Çekim", en: "4K Shooting", de: "4K-Aufnahme" },
        service_editing: { tr: "Montaj/Kurgu", en: "Editing", de: "Bearbeitung" },
        service_social_clip: { tr: "Sosyal Medya Klibi", en: "Social Media Clip", de: "Social-Media-Clip" },

        // Musicians
        performance_type_label: { tr: "Performans Türü", en: "Performance Type", de: "Auftrittsart" },
        perf_dj: { tr: "DJ", en: "DJ", de: "DJ" },
        perf_orchestra: { tr: "Canlı Orkestra", en: "Live Orchestra", de: "Live-Orchester" },
        perf_fasil: { tr: "Fasıl Grubu", en: "Fasil Group", de: "Fasil-Gruppe" },
        perf_trio: { tr: "Trio", en: "Trio", de: "Trio" },
        perf_band: { tr: "Bando", en: "Marching Band", de: "Blaskapelle" },
        perf_solist: { tr: "Solist", en: "Soloist", de: "Solist" },
        perf_duo: { tr: "Duo", en: "Duo", de: "Duo" },

        music_genres_label: { tr: "Müzik Tarzları", en: "Music Genres", de: "Musikrichtungen" },
        genre_pop: { tr: "Pop", en: "Pop", de: "Pop" },
        genre_jazz: { tr: "Caz", en: "Jazz", de: "Jazz" },
        genre_turkish_pop: { tr: "Türkçe Pop", en: "Turkish Pop", de: "Türkischer Pop" },
        genre_foreign: { tr: "Yabancı", en: "Foreign", de: "Ausländisch" },
        genre_local: { tr: "Yöresel/Oyun Havası", en: "Local/Folk", de: "Lokal/Volksmusik" },
        genre_classic: { tr: "Klasik", en: "Classical", de: "Klassik" },
        genre_rock: { tr: "Rock", en: "Rock", de: "Rock" },
        genre_rnb: { tr: "R&B", en: "R&B", de: "R&B" },
        genre_electronic: { tr: "Elektronik", en: "Electronic", de: "Elektronisch" },
        genre_foreign_pop: { tr: "Yabancı Pop", en: "Foreign Pop", de: "Ausländischer Pop" },
        genre_hiphop: { tr: "Hip Hop", en: "Hip Hop", de: "Hip Hop" },
        genre_house: { tr: "House", en: "House", de: "House" },
        genre_techno: { tr: "Techno", en: "Techno", de: "Techno" },
        genre_90s: { tr: "90'lar", en: "90s", de: "90er" },
        genre_80s: { tr: "80'ler", en: "80s", de: "80er" },

        orchestra_size_label: { tr: "Orkestra Kişi Sayısı", en: "Orchestra Size", de: "Orchestergröße" },
        equipment_label: { tr: "Ekipman", en: "Equipment", de: "Ausrüstung" },
        equip_sound: { tr: "Ses Sistemi", en: "Sound System", de: "Tonsystem" },
        equip_light: { tr: "Işık Sistemi", en: "Lighting System", de: "Beleuchtungssystem" },
        equip_stage: { tr: "Sahne Kurulumu", en: "Stage Setup", de: "Bühnenaufbau" },
        equip_fog: { tr: "Sis Makinesi", en: "Fog Machine", de: "Nebelmaschine" },
        equip_truss: { tr: "Truss Sistemi", en: "Truss System", de: "Traversensystem" },
        equip_dj_booth: { tr: "DJ Kabini", en: "DJ Booth", de: "DJ-Pult" },
        equip_mic: { tr: "Mikrofon", en: "Microphone", de: "Mikrofon" },
        demo_available_label: { tr: "Demo Dinletisi Var mı?", en: "Demo Available?", de: "Demo verfügbar?" },

        // Wedding Planners
        concepts_label: { tr: "Konsept Seçenekleri", en: "Concept Options", de: "Konzeptoptionen" },
        concept_bohemian: { tr: "Bohem", en: "Bohemian", de: "Bohemian" },
        concept_rustic: { tr: "Rustik", en: "Rustic", de: "Rustikal" },
        concept_modern: { tr: "Modern", en: "Modern", de: "Modern" },
        concept_classic: { tr: "Klasik", en: "Classic", de: "Klassisch" },
        concept_vintage: { tr: "Vintage", en: "Vintage", de: "Vintage" },
        concept_romantic: { tr: "Romantik", en: "Romantic", de: "Romantisch" },
        concept_industrial: { tr: "Endüstriyel", en: "Industrial", de: "Industriell" },

        demo_table_label: { tr: "Demo Masa Hazırlığı", en: "Demo Table Setup", de: "Mustertisch" },
        city_out_label: { tr: "Şehir Dışına Hizmet", en: "Out of City Service", de: "Service außerhalb der Stadt" },

        service_table_chair: { tr: "Masa/Sandalye Temini", en: "Table/Chair Supply", de: "Tisch/Stuhl-Bereitstellung" },
        service_decoration: { tr: "Mekan Süsleme", en: "Venue Decoration", de: "Location-Dekoration" },
        service_flowers: { tr: "Çiçek", en: "Flowers", de: "Blumen" },
        service_rsvp: { tr: "LCV Hizmeti", en: "RSVP Service", de: "RSVP-Service" },
        service_barkovision: { tr: "Barkovizyon", en: "Barcovision", de: "Barcovision" },
        service_fireworks: { tr: "Havai Fişek", en: "Fireworks", de: "Feuerwerk" },
        service_artist: { tr: "Sanatçı Temini", en: "Artist Booking", de: "Künstlervermittlung" },
        service_catering: { tr: "Catering", en: "Catering", de: "Catering" },

        // Bridal Fashion
        service_type_label: { tr: "Hizmet Türü", en: "Service Type", de: "Serviceart" },
        service_ready_made: { tr: "Hazır Model", en: "Ready Made", de: "Konfektion" },
        service_custom_made: { tr: "Özel Dikim", en: "Custom Made", de: "Maßanfertigung" },
        service_rental: { tr: "Kiralama", en: "Rental", de: "Verleih" },
        service_haute_couture: { tr: "Haute Couture", en: "Haute Couture", de: "Haute Couture" },

        accessory_services_label: { tr: "Aksesuar", en: "Accessories", de: "Accessoires" },
        acc_veil: { tr: "Duvak", en: "Veil", de: "Schleier" },
        acc_pouch: { tr: "Kese", en: "Pouch", de: "Beutel" },
        acc_gloves: { tr: "Eldiven", en: "Gloves", de: "Handschuhe" },
        acc_bouquet: { tr: "Gelin Buketi", en: "Bridal Bouquet", de: "Brautstrauß" },
        acc_hair: { tr: "Saç Aksesuarı", en: "Hair Accessory", de: "Haarschmuck" },
        acc_shoes: { tr: "Ayakkabı", en: "Shoes", de: "Schuhe" },

        appointment_required_label: { tr: "Randevu Zorunlu mu?", en: "Appointment Required?", de: "Termin erforderlich?" },
        rehearsals_label: { tr: "Prova Sayısı", en: "Number of Rehearsals", de: "Anzahl der Anproben" },

        // Catering
        cuisine_types_label: { tr: "Mutfak Türleri", en: "Cuisine Types", de: "Küchenarten" },
        cuisine_turkish: { tr: "Türk Mutfağı", en: "Turkish Cuisine", de: "Türkische Küche" },
        cuisine_world: { tr: "Dünya Mutfağı", en: "World Cuisine", de: "Internationale Küche" },
        cuisine_vegetarian: { tr: "Vejetaryen", en: "Vegetarian", de: "Vegetarisch" },
        cuisine_vegan: { tr: "Vegan", en: "Vegan", de: "Vegan" },
        cuisine_kosher: { tr: "Kosher", en: "Kosher", de: "Koscher" },
        cuisine_kids: { tr: "Çocuk Menüsü", en: "Kids Menu", de: "Kindermenü" },
        cuisine_ottoman: { tr: "Osmanlı Mutfağı", en: "Ottoman Cuisine", de: "Osmanische Küche" },

        service_waiters: { tr: "Servis Personeli", en: "Waiters", de: "Servicepersonal" },
        service_equipment: { tr: "Ekipman Kiralama", en: "Equipment Rental", de: "Ausrüstungsverleih" },
        service_menu_tasting: { tr: "Menü Tadımı", en: "Menu Tasting", de: "Menüverkostung" },
        service_cake_cutting: { tr: "Pasta Kesimi", en: "Cake Cutting", de: "Tortenschnitt" },
        service_beverage: { tr: "İçecek Servisi", en: "Beverage Service", de: "Getränkeservice" },

        // Wedding Cars
        vehicle_types_label: { tr: "Araç Tipi", en: "Vehicle Type", de: "Fahrzeugtyp" },
        car_classic: { tr: "Klasik", en: "Classic", de: "Oldtimer" },
        car_sports: { tr: "Spor", en: "Sports Car", de: "Sportwagen" },
        car_limo: { tr: "Limuzin", en: "Limousine", de: "Limousine" },
        car_vosvos: { tr: "Vosvos", en: "Beetle", de: "Käfer" },
        car_vip_minibus: { tr: "VIP Minibüs", en: "VIP Minibus", de: "VIP-Minibus" },
        car_cabrio: { tr: "Cabrio", en: "Convertible", de: "Cabrio" },
        car_helicopter: { tr: "Helikopter", en: "Helicopter", de: "Hubschrauber" },
        car_boat: { tr: "Tekne", en: "Boat", de: "Boot" },

        driver_included_label: { tr: "Şoförlü Hizmet", en: "Driver Included", de: "Mit Fahrer" },
        decoration_included_label: { tr: "Süsleme Dahil mi?", en: "Decoration Included?", de: "Dekoration inklusive?" },
        min_rental_hours_label: { tr: "Minimum Kiralama Süresi (Saat)", en: "Min Rental Hours", de: "Mindestmietdauer (Std)" },

        // Hair & Make-Up
        service_location_label: { tr: "Hizmet Yeri", en: "Service Location", de: "Serviceort" },
        loc_salon: { tr: "Salonda", en: "At Salon", de: "Im Salon" },
        loc_home_hotel: { tr: "Evde/Otelde Hizmet", en: "At Home/Hotel", de: "Zu Hause/Hotel" },
        loc_out_city: { tr: "Şehir Dışında Hizmet", en: "Out of City", de: "Außerhalb der Stadt" },

        service_bridal_hair: { tr: "Gelin Başı", en: "Bridal Hair", de: "Brautfrisur" },
        service_makeup: { tr: "Makyaj", en: "Make-up", de: "Make-up" },
        service_manicure: { tr: "Manikür/Pedikür", en: "Manicure/Pedicure", de: "Maniküre/Pediküre" },
        service_waxing: { tr: "Ağda", en: "Waxing", de: "Waxing" },
        service_skincare: { tr: "Cilt Bakımı", en: "Skincare", de: "Hautpflege" },
        service_lashes: { tr: "Takma Kirpik", en: "False Lashes", de: "Falsche Wimpern" },
        service_massage: { tr: "El/Ayak Masajı", en: "Hand/Foot Massage", de: "Hand-/Fußmassage" },

        rehearsal_available_label: { tr: "Prova İmkanı", en: "Rehearsal Available", de: "Probe verfügbar" },
        team_capacity_label: { tr: "Aynı Anda Hizmet Kapasitesi", en: "Team Capacity", de: "Teamkapazität" },

        // Invitations
        products_label: { tr: "Ürünler", en: "Products", de: "Produkte" },
        prod_invitation: { tr: "Davetiye", en: "Invitation", de: "Einladung" },
        prod_candy: { tr: "Nikah Şekeri", en: "Wedding Candy", de: "Hochzeitsbonbons" },
        prod_gift: { tr: "Hediyelik", en: "Gifts", de: "Gastgeschenke" },
        prod_guestbook: { tr: "Anı Defteri", en: "Guestbook", de: "Gästebuch" },
        prod_table_card: { tr: "Masa Kartı", en: "Table Card", de: "Tischkarte" },
        prod_menu_card: { tr: "Menü Kartı", en: "Menu Card", de: "Menükarte" },
        prod_welcome_board: { tr: "Karşılama Panosu", en: "Welcome Board", de: "Willkommensschild" },

        min_order_quantity_label: { tr: "Minimum Sipariş Adedi", en: "Min Order Quantity", de: "Mindestbestellmenge" },
        design_service_label: { tr: "Özel Tasarım Hizmeti", en: "Custom Design Service", de: "Individuelles Design" },

        // Flowers
        service_bridal_bouquet: { tr: "Gelin Buketi", en: "Bridal Bouquet", de: "Brautstrauß" },
        service_boutonniere: { tr: "Damat Yaka Çiçeği", en: "Boutonniere", de: "Ansteckblume" },
        service_venue_decor: { tr: "Mekan Süsleme", en: "Venue Decoration", de: "Raumdekoration" },
        service_car_decor: { tr: "Araç Süsleme", en: "Car Decoration", de: "Autoschmuck" },
        service_aisle: { tr: "Gelin Yolu", en: "Aisle Decor", de: "Gangdekoration" },
        service_table_decor: { tr: "Masa Süsleme", en: "Table Decoration", de: "Tischdekoration" },
        service_altar: { tr: "Nikah Kürsüsü", en: "Altar/Arch", de: "Traubogen" },

        flower_types_label: { tr: "Çiçek Türleri", en: "Flower Types", de: "Blumenarten" },
        flower_fresh: { tr: "Canlı Çiçek", en: "Fresh Flowers", de: "Frische Blumen" },
        flower_artificial: { tr: "Yapay Çiçek", en: "Artificial Flowers", de: "Künstliche Blumen" },
        flower_dried: { tr: "Kurutulmuş Çiçek", en: "Dried Flowers", de: "Trockenblumen" },
        flower_preserved: { tr: "Şoklanmış Çiçek", en: "Preserved Flowers", de: "Konservierte Blumen" },

        delivery_setup_available_label: { tr: "Teslimat/Kurulum Var mı?", en: "Delivery/Setup Available?", de: "Lieferung/Aufbau verfügbar?" },

        // Cakes
        prod_wedding_cake: { tr: "Düğün Pastası", en: "Wedding Cake", de: "Hochzeitstorte" },
        prod_cupcake: { tr: "Cupcake", en: "Cupcake", de: "Cupcake" },
        prod_macaron: { tr: "Makaron", en: "Macaron", de: "Macaron" },
        prod_engagement_cake: { tr: "Nişan Pastası", en: "Engagement Cake", de: "Verlobungstorte" },
        prod_candy_buffet: { tr: "Şeker Büfesi", en: "Candy Buffet", de: "Süßigkeitenbuffet" },

        dietary_options_label: { tr: "Özel Beslenme Seçenekleri", en: "Dietary Options", de: "Diätoptionen" },
        diet_gluten_free: { tr: "Glutensiz", en: "Gluten Free", de: "Glutenfrei" },
        diet_lactose_free: { tr: "Laktozsuz", en: "Lactose Free", de: "Laktosefrei" },
        diet_vegan: { tr: "Vegan", en: "Vegan", de: "Vegan" },
        diet_sugar_free: { tr: "Şekersiz", en: "Sugar Free", de: "Zuckerfrei" },
        diet_egg_free: { tr: "Yumurta İçermeyen", en: "Egg Free", de: "Eifrei" },

        tasting_available_label: { tr: "Tadım İmkanı", en: "Tasting Available", de: "Verkostung möglich" },
        delivery_available_label: { tr: "Teslimat Var mı?", en: "Delivery Available?", de: "Lieferung möglich?" },

        // Groom Suits
        prod_groom_suit: { tr: "Damatlık", en: "Groom Suit", de: "Bräutigamanzug" },
        prod_tuxedo: { tr: "Smokin", en: "Tuxedo", de: "Smoking" },
        prod_tailcoat: { tr: "Frak", en: "Tailcoat", de: "Frack" },
        prod_shirt: { tr: "Gömlek", en: "Shirt", de: "Hemd" },
        prod_shoes: { tr: "Ayakkabı", en: "Shoes", de: "Schuhe" },
        prod_cufflinks: { tr: "Kol Düğmesi", en: "Cufflinks", de: "Manschettenknöpfe" },
        prod_bowtie: { tr: "Papyon/Kravat", en: "Bowtie/Tie", de: "Fliege/Krawatte" },

        alteration_service_label: { tr: "Tadilat Hizmeti", en: "Alteration Service", de: "Änderungsschneiderei" },

        // Photobox
        features_label: { tr: "Özellikler", en: "Features", de: "Funktionen" },
        feat_unlimited_print: { tr: "Sınırsız Baskı", en: "Unlimited Prints", de: "Unbegrenzte Ausdrucke" },
        feat_gif: { tr: "GIF Yapma", en: "GIF Creation", de: "GIF-Erstellung" },
        feat_boomerang: { tr: "Boomerang", en: "Boomerang", de: "Boomerang" },
        feat_green_screen: { tr: "Yeşil Perde (Green Screen)", en: "Green Screen", de: "Green Screen" },
        feat_custom_bg: { tr: "Özel Arka Plan", en: "Custom Background", de: "Individueller Hintergrund" },
        feat_props: { tr: "Aksesuar Temini", en: "Props Provided", de: "Requisiten" },

        print_size_label: { tr: "Baskı Boyutu", en: "Print Size", de: "Druckgröße" },
        size_10x15: { tr: "10x15", en: "10x15", de: "10x15" },
        size_strip: { tr: "Şerit (Strip)", en: "Strip", de: "Streifen" },
        size_polaroid: { tr: "Polaroid", en: "Polaroid", de: "Polaroid" },

        digital_copy_label: { tr: "Dijital Kopya Teslimi", en: "Digital Copy", de: "Digitale Kopie" },
        assistant_included_label: { tr: "Asistan Dahil mi?", en: "Assistant Included?", de: "Assistent inklusive?" },

        // Speakers
        languages_label: { tr: "Diller", en: "Languages", de: "Sprachen" },
        lang_turkish: { tr: "Türkçe", en: "Turkish", de: "Türkisch" },
        lang_german: { tr: "Almanca", en: "German", de: "Deutsch" },
        lang_english: { tr: "İngilizce", en: "English", de: "Englisch" },
        lang_french: { tr: "Fransızca", en: "French", de: "Französisch" },
        lang_spanish: { tr: "İspanyolca", en: "Spanish", de: "Spanisch" },

        service_custom_text: { tr: "Kişiye Özel Metin", en: "Custom Text", de: "Individueller Text" },
        service_symbolic: { tr: "Sembolik Nikah", en: "Symbolic Ceremony", de: "Symbolische Trauung" },
        service_vow_renewal: { tr: "Yemin Yenileme", en: "Vow Renewal", de: "Eheerneuerung" },
        service_story_writing: { tr: "Hikaye Yazımı", en: "Story Writing", de: "Geschichtenschreiben" },

        meeting_count_label: { tr: "Görüşme Sayısı", en: "Meeting Count", de: "Anzahl der Treffen" },
        duration_minutes_label: { tr: "Ortalama Süre (Dakika)", en: "Duration (Minutes)", de: "Dauer (Minuten)" },

        // Rings
        prod_wedding_ring: { tr: "Alyans", en: "Wedding Ring", de: "Ehering" },
        prod_solitaire: { tr: "Tektaş", en: "Solitaire", de: "Solitär" },
        prod_five_stone: { tr: "Beştaş", en: "Five Stone", de: "Fünf-Steine-Ring" },
        prod_necklace: { tr: "Gerdanlık", en: "Necklace", de: "Halskette" },
        prod_earrings: { tr: "Küpe", en: "Earrings", de: "Ohrringe" },
        prod_bracelet: { tr: "Bileklik", en: "Bracelet", de: "Armband" },
        prod_watch: { tr: "Saat", en: "Watch", de: "Uhr" },

        material_label: { tr: "Materyaller", en: "Materials", de: "Materialien" },
        mat_gold_yellow: { tr: "Altın (Sarı)", en: "Gold (Yellow)", de: "Gold (Gelb)" },
        mat_gold_white: { tr: "Altın (Beyaz)", en: "Gold (White)", de: "Gold (Weiß)" },
        mat_gold_rose: { tr: "Altın (Rose)", en: "Gold (Rose)", de: "Gold (Rosé)" },
        mat_platinum: { tr: "Platin", en: "Platinum", de: "Platin" },
        mat_silver: { tr: "Gümüş", en: "Silver", de: "Silber" },
        mat_diamond: { tr: "Elmas", en: "Diamond", de: "Diamant" },
        mat_brilliant: { tr: "Pırlanta", en: "Brilliant", de: "Brillant" },

        custom_design_label: { tr: "Özel Tasarım", en: "Custom Design", de: "Individuelles Design" },
        maintenance_service_label: { tr: "Bakım/Onarım Hizmeti", en: "Maintenance Service", de: "Wartungsservice" },

        // Entertainment
        act_type_label: { tr: "Gösteri Türü", en: "Act Type", de: "Art der Show" },
        act_dance: { tr: "Dans Ekibi", en: "Dance Group", de: "Tanzgruppe" },
        act_magician: { tr: "Sihirbaz", en: "Magician", de: "Zauberer" },
        act_fire: { tr: "Ateş Gösterisi", en: "Fire Show", de: "Feuershow" },
        act_acrobatics: { tr: "Akrobasi", en: "Acrobatics", de: "Akrobatik" },
        act_comedian: { tr: "Komedyen", en: "Comedian", de: "Komiker" },
        act_caricature: { tr: "Karikatürist", en: "Caricaturist", de: "Karikaturist" },
        act_fireworks: { tr: "Havai Fişek", en: "Fireworks", de: "Feuerwerk" },

        duration_minutes_label: { tr: "Gösteri Süresi (Dakika)", en: "Show Duration (Min)", de: "Showdauer (Min)" },
        requirements_label: { tr: "Mekan Gereksinimleri", en: "Venue Requirements", de: "Anforderungen an den Ort" },
        req_stage: { tr: "Sahne", en: "Stage", de: "Bühne" },
        req_sound: { tr: "Ses Sistemi", en: "Sound System", de: "Tonsystem" },
        req_backstage: { tr: "Kulis", en: "Backstage", de: "Backstage" },
        req_high_ceiling: { tr: "Yüksek Tavan", en: "High Ceiling", de: "Hohe Decke" }
    },
    vendorWallet: {
        title: { en: "Wallet", de: "Geldbörse", tr: "Cüzdan" },
        desc: { en: "View and manage your credit balance.", de: "Guthaben einsehen und verwalten.", tr: "Kredi bakiyenizi görüntüleyin ve yönetin." },
        currentBalance: { en: "Current Balance", de: "Aktuelles Guthaben", tr: "Mevcut Bakiye" },
        credits: { en: "Credits", de: "Credits", tr: "Kredi" },
        history: { en: "Transaction History", de: "Transaktionsverlauf", tr: "İşlem Geçmişi" },
        noTxn: { en: "No transactions yet", de: "Noch keine Transaktionen", tr: "Henüz işlem yok" },
        purchase: { en: "Credit Purchase", de: "Credit-Kauf", tr: "Kredi Yükleme" },
        usage: { en: "Credit Usage", de: "Credit-Nutzung", tr: "Kredi Kullanımı" },
        packagesTitle: { en: "Credit Packages", de: "Credit-Pakete", tr: "Kredi Paketleri" },
        loadingPackages: { en: "Loading packages...", de: "Pakete werden geladen...", tr: "Paketler yükleniyor..." },
        buyBtn: { en: "Buy Now", de: "Jetzt kaufen", tr: "Satın Al" },
        confirmPurchase: { en: "Do you want to buy {name} ({credits} Credits) for €{price}?", de: "Möchten Sie {name} ({credits} Credits) für €{price} kaufen?", tr: "{name} ({credits} Kredi) satın almak istiyor musunuz? Tutar: €{price}" },
        purchaseSuccess: { en: "✅ Credits added successfully!", de: "✅ Credits erfolgreich hinzugefügt!", tr: "✅ Kredi başarıyla yüklendi!" },
        purchaseError: { en: "Purchase failed.", de: "Kauf fehlgeschlagen.", tr: "Satın alma işlemi başarısız oldu." }
    },
    timeline: {
        title: {
            en: "My Agenda",
            de: "Meine Agenda",
            tr: "Ajandam"
        },
        desc: {
            en: "Monthly to-do list based on your wedding date. Personalize tasks and track your progress.",
            de: "Monatliche To-Do-Liste basierend auf Ihrem Hochzeitsdatum. Personalisieren Sie Aufgaben und verfolgen Sie Ihren Fortschritt.",
            tr: "Düğün tarihinize göre aylık yapılacaklar listesi. Görevleri kişiselleştirin ve ilerlemenizi takip edin."
        },
        monthsRemaining: {
            en: "months remaining",
            de: "Monate verbleibend",
            tr: "ay kaldı"
        },
        monthsAgo: {
            en: "months ago",
            de: "Monate zuvor",
            tr: "ay önce"
        },
        weddingMonth: {
            en: "Wedding Month",
            de: "Hochzeitsmonat",
            tr: "Düğün Ayı"
        },
        placeholderActivity: {
            en: "Add new task...",
            de: "Neue Aufgabe hinzufügen...",
            tr: "Yeni görev ekle..."
        },
        activity: {
            en: "Task",
            de: "Aufgabe",
            tr: "Görev"
        },
        addEvent: {
            en: "Add Task",
            de: "Aufgabe hinzufügen",
            tr: "Görev Ekle"
        },
        delete: {
            en: "Delete",
            de: "Löschen",
            tr: "Sil"
        },
        emptyState: {
            en: "No tasks added yet.",
            de: "Noch keine Aufgaben hinzugefügt.",
            tr: "Henüz görev eklenmedi."
        },
        defaultTasks: {
            setDate: { en: "Set Wedding Date", de: "Hochzeitsdatum festlegen", tr: "Düğün Tarihini Belirle" },
            budget: { en: "Determine Budget", de: "Budget festlegen", tr: "Bütçeyi Belirle" },
            venue: { en: "Book Venue", de: "Location buchen", tr: "Mekanı Ayarla" },
            photo: { en: "Book Photographer", de: "Fotograf buchen", tr: "Fotoğrafçıyı Ayarla" },
            dress: { en: "Buy Wedding Dress", de: "Brautkleid kaufen", tr: "Gelinlik Bak" },
            inviteDesign: { en: "Design Invitations", de: "Einladungen entwerfen", tr: "Davetiye Tasarla" },
            music: { en: "Book Music/DJ", de: "Musik/DJ buchen", tr: "Müzik/DJ Ayarla" },
            florist: { en: "Book Florist", de: "Florist buchen", tr: "Çiçekçiyi Ayarla" },
            cake: { en: "Order Wedding Cake", de: "Hochzeitstorte bestellen", tr: "Pastayı Sipariş Et" },
            guestList: { en: "Finalize Guest List", de: "Gästeliste finalisieren", tr: "Misafir Listesini Tamamla" },
            sendInvites: { en: "Send Invitations", de: "Einladungen versenden", tr: "Davetiyeleri Gönder" },
            honeymoon: { en: "Plan Honeymoon", de: "Flitterwochen planen", tr: "Balayını Planla" },
            fittings: { en: "Dress Fittings", de: "Kleideranprobe", tr: "Gelinlik Provası" },
            seating: { en: "Create Seating Plan", de: "Sitzplan erstellen", tr: "Oturma Planı Yap" },
            rsvp: { en: "Collect RSVPs", de: "Rückmeldungen sammeln", tr: "LCV'leri Topla" },
            schedule: { en: "Create Day Schedule", de: "Tagesablauf erstellen", tr: "Gün Akışını Planla" },
            vendors: { en: "Confirm Vendors", de: "Dienstleister bestätigen", tr: "Tedarikçileri Teyit Et" },
            emergency: { en: "Prepare Emergency Kit", de: "Notfall-Set vorbereiten", tr: "Acil Durum Çantası Hazırla" },
            final: { en: "Enjoy Your Wedding!", de: "Genießen Sie Ihre Hochzeit!", tr: "Düğününün Tadını Çıkar!" }
        }
    },
    planningTools: {
        title: {
            en: "Wedding Planning Tools",
            de: "Hochzeitsplanungstools",
            tr: "Düğün Planlama Araçları"
        },
        intro: {
            en: "Everything you need to plan your wedding perfectly, all in one place.",
            de: "Alles, was Sie für die perfekte Planung Ihrer Hochzeit benötigen, an einem Ort.",
            tr: "Düğününüzü mükemmel şekilde planlamak için ihtiyacınız olan her şey, tek bir yerde."
        },
        subtitle: {
            en: "From your own website to budget planning – all the tools you need.",
            de: "Von der eigenen Webseite bis zur Budgetplanung – alle Tools, die Sie brauchen.",
            tr: "Size özel web sitesinden yapılacaklar listesine, bütçe hesaplamaktan oturma planına, düğününüzü daha kolay planlamanızı sağlayacak tüm araçlar burada!"
        },
        cta: {
            en: "Register for Free",
            de: "Kostenlos Registrieren",
            tr: "Ücretsiz Üye Ol"
        },
        free: {
            en: "Free",
            de: "Kostenlos",
            tr: "Ücretsiz"
        },
        website: {
            title: { en: "My Website", de: "Meine Webseite", tr: "Web Sitem" },
            desc: { en: "Create a custom website for your wedding. Share your story and collect RSVPs.", de: "Erstellen Sie eine benutzerdefinierte Webseite für Ihre Hochzeit. Teilen Sie Ihre Geschichte und sammeln Sie Rückmeldungen.", tr: "Düğününüz için özel bir web sitesi oluşturun. Hikayenizi paylaşın ve LCV toplayın." }
        },
        timeline: {
            title: { en: "My Agenda", de: "Meine Agenda", tr: "Ajandam" },
            desc: { en: "Monthly to-do list based on your wedding date. Personalize tasks, add notes, and track your progress.", de: "Monatliche To-Do-Liste basierend auf Ihrem Hochzeitsdatum. Personalisieren Sie Aufgaben, fügen Sie Notizen hinzu und verfolgen Sie Ihren Fortschritt.", tr: "Düğün tarihinize göre aylık yapılacaklar listesi. Görevleri kişiselleştirin, not ekleyin ve ilerlemenizi takip edin." }
        },
        budget: {
            title: { en: "My Budget", de: "Mein Budget", tr: "Bütçem" },
            desc: { en: "Set your total budget, manage expenses, and track your payments.", de: "Legen Sie Ihr Gesamtbudget fest, verwalten Sie Ausgaben und verfolgen Sie Ihre Zahlungen.", tr: "Toplam bütçenizi belirleyin, harcama kalemlerini yönetin ve ödemelerinizi takip edin." }
        },
        seating: {
            title: { en: "Seating Plan", de: "Sitzplan", tr: "Oturma Planı" },
            desc: { en: "Place your guests at tables and easily create your seating arrangement.", de: "Platzieren Sie Ihre Gäste an Tischen und erstellen Sie einfach Ihre Sitzordnung.", tr: "Misafirlerinizi masalara yerleştirin, oturma düzenini kolayca oluşturun." }
        },
        weather: {
            title: { en: "Weather", de: "Wetter", tr: "Hava Durumu" },
            desc: { en: "Get weather forecasts based on your wedding date and city, learn average temperatures and sunset times.", de: "Erhalten Sie Wettervorhersagen basierend auf Ihrem Hochzeitsdatum und Ihrer Stadt, erfahren Sie Durchschnittstemperaturen und Sonnenuntergangszeiten.", tr: "Düğün tarihi ve şehrinize göre hava tahmini alın, ortalama sıcaklık ve gün batımı saatini öğrenin." }
        },
        progress: {
            en: "Progress",
            de: "Webseite Einrichten",
            tr: "Web Sitemi Düzenle"
        },
        settingsTab: {
            en: "Settings",
            de: "Einstellungen",
            tr: "Ayarlar"
        },
        guestsTab: {
            en: "Guest List",
        },
        venueAddressLabel: {
            en: "Address",
            de: "Adresse",
            tr: "Adres"
        },
        venueMapLabel: {
            en: "Google Maps Link",
            de: "Google Maps Link",
            tr: "Google Maps Linki"
        },
        save: {
            en: "Save",
            de: "Speichern",
            tr: "Kaydet"
        },
        preview: {
            en: "Preview",
            de: "Vorschau",
            tr: "Önizleme"
        },
        publicView: {
            rsvpTitle: {
                en: "RSVP",
                de: "Sind Sie dabei?",
                tr: "LCV - Katılım Durumu"
            },
            willYouAttend: {
                en: "Will you attend our wedding?",
                de: "Werden Sie an unserer Hochzeit teilnehmen?",
                tr: "Düğünümüze katılabilecek misiniz?"
            },
            yes: {
                en: "Yes, I'll be there!",
                de: "Ja, ich bin dabei!",
                tr: "Evet, orada olacağım!"
            },
            no: {
                en: "Regretfully no",
                de: "Leider nein",
                tr: "Maalesef katılamayacağım"
            },
            guestCount: {
                en: "Number of Plus Ones",
                de: "Anzahl der Begleitpersonen",
                tr: "Yanınızda kaç kişi gelecek?"
            },
            message: {
                en: "Message to the Couple",
                de: "Nachricht an das Brautpaar",
                tr: "Çifte notunuz"
            },
            submit: {
                en: "Send RSVP",
                de: "Antwort Senden",
                tr: "Cevabı Gönder"
            },
            success: {
                en: "Thank you for your response!",
                de: "Vielen Dank für Ihre Rückmeldung!",
                tr: "Cevabınız iletildi, teşekkürler!"
            },
            back: {
                en: "Back to Website",
                de: "Zurück zur Webseite",
                tr: "Siteye Dön"
            },
            guestCountOptions: {
                justMe: { en: "Just me", de: "Nur ich", tr: "Sadece ben" },
                plusOne: { en: "+1 Guest", de: "+1 Begleitung", tr: "+1 Kişi" },
                plusTwo: { en: "+2 Guests", de: "+2 Begleitungen", tr: "+2 Kişi" },
                plusThree: { en: "+3 Guests", de: "+3 Begleitungen", tr: "+3 Kişi" },
                plusFour: { en: "+4 Guests", de: "+4 Begleitungen", tr: "+4 Kişi" }
            },
            saveTheDate: {
                en: "SAVE THE DATE",
                de: "SAVE THE DATE",
                tr: "TARİHİ KAYDET"
            },
            bigDayHere: {
                en: "The Big Day is Here!",
                de: "Der große Tag ist da!",
                tr: "Büyük Gün Geldi!"
            }
        },
        galleryLabel: {
            en: "Photo Album Link",
            de: "Fotoalbum-Link",
            tr: "Fotoğraf Albümü Linki"
        },
        galleryPlaceholder: {
            en: "Google Photos or iCloud album link",
            de: "Google Photos oder iCloud Album-Link",
            tr: "Google Photos veya iCloud albüm linki"
        },
        setupTitle: {
            en: "Wedding Website Editor",
            de: "Hochzeitswebsite bearbeiten",
            tr: "Web Sitemi Düzenle"
        },
        settingsTab: {
            en: "Settings",
            de: "Einstellungen",
            tr: "Ayarlar"
        },
        guestsTab: {
            en: "Guest List",
            de: "Gästeliste",
            tr: "Davetli Listesi"
        },
        slugLabel: {
            en: "Website URL",
            de: "Website-URL",
            tr: "Web Sitesi Adresi"
        },
        dateLabel: {
            en: "Wedding Date",
            de: "Hochzeitsdatum",
            tr: "Düğün Tarihi"
        },
        coverImageLabel: {
            en: "Cover Image URL",
            de: "Titelbild-URL",
            tr: "Kapak Resmi Linki"
        },
        welcomeMessageLabel: {
            en: "Welcome Message",
            de: "Willkommensnachricht",
            tr: "Hoşgeldin Mesajı"
        },
        storyLabel: {
            en: "Our Story",
            de: "Unsere Geschichte",
            tr: "Hikayemiz"
        },
        venueNameLabel: {
            en: "Venue Name",
            de: "Veranstaltungsort",
            tr: "Mekan Adı"
        },
        venueAddressLabel: {
            en: "Venue Address",
            de: "Adresse",
            tr: "Mekan Adresi"
        },
        venueMapLabel: {
            en: "Google Maps Link",
            de: "Google Maps Link",
            tr: "Google Maps Linki"
        },
        preview: {
            en: "Preview",
            de: "Vorschau",
            tr: "Önizleme"
        },
        save: {
            en: "Save",
            de: "Speichern",
            tr: "Kaydet"
        },
        viewGalleryBtn: {
            en: "📷 View Photos",
            de: "📷 Fotos ansehen",
            tr: "📷 Fotoğrafları Gör"
        },
        countdown: {
            days: { en: "DAYS", de: "TAGE", tr: "GÜN" },
            hours: { en: "HOURS", de: "STUNDEN", tr: "SAAT" },
            minutes: { en: "MINUTES", de: "MINUTEN", tr: "DAKİKA" },
            seconds: { en: "SECONDS", de: "SEKUNDEN", tr: "SANİYE" }
        }
    },
    seating_chart: {
        add_guest: {
            en: "Add Guest",
            de: "Gast hinzufügen",
            tr: "Misafir Ekle"
        },
        add_guest_error: {
            en: "Error adding guest",
            de: "Fehler beim Hinzufügen des Gastes",
            tr: "Misafir eklenirken hata oluştu",
        },
        add_table: {
            en: "Add Table",
            de: "Tisch hinzufügen",
            tr: "Masa Ekle"
        },
        all: {
            en: "All",
            de: "Alle",
            tr: "Tümü",
        },
        all_tables: {
            en: "All Tables",
            de: "Alle Tische",
            tr: "Tüm Masalar",
        },
        assigned_guests: {
            en: "Assigned",
            de: "Zugewiesen",
            tr: "Yerleştirilen",
        },
        created_date: {
            en: "Created",
            de: "Erstellt",
            tr: "Oluşturulma Tarihi",
        },
        delete_table_error: {
            en: "Error deleting table",
            de: "Fehler beim Löschen des Tisches",
            tr: "Masa silinirken hata oluştu",
        },
        email_optional: {
            en: "Email (optional)",
            de: "E-Mail (optional)",
            tr: "E-posta (opsiyonel)",
        },
        empty_tables: {
            en: "Empty Tables",
            de: "Leere Tische",
            tr: "Boş Masalar",
        },
        error: {
            en: "An error occurred",
            de: "Ein Fehler ist aufgetreten",
            tr: "Bir hata oluştu",
        },
        filter: {
            en: "Filter",
            de: "Filter",
            tr: "Filtre",
        },
        full_tables: {
            en: "Full Tables",
            de: "Volle Tische",
            tr: "Dolu Masalar",
        },
        guest_count: {
            en: "Number of Seats",
            de: "Anzahl der Plätze",
            tr: "Kişi Sayısı",
        },
        guest_name: {
            en: "Guest Name",
            de: "Gastname",
            tr: "Misafir Adı",
        },
        guest_name_placeholder: {
            en: "Enter guest name",
            de: "Gastname eingeben",
            tr: "Misafir adını girin",
        },
        guest_status: {
            en: "{{assigned}} of {{total}} guests assigned",
            de: "{{assigned}} von {{total}} Gästen zugewiesen",
            tr: "{{total}} misafirin {{assigned}} tanesi yerleştirildi",
        },
        no_data: {
            en: "No data found",
            de: "Keine Daten gefunden",
            tr: "Veri bulunamadı",
        },
        no_guests_assigned: {
            en: "No guests assigned yet",
            de: "Noch keine Gäste zugewiesen",
            tr: "Henüz misafir yerleştirilmedi",
        },
        no_tables_found: {
            en: "No tables found matching filters",
            de: "Keine Tische gefunden",
            tr: "Filtreye uygun masa bulunamadı",
        },
        no_unassigned_guests: {
            en: "All guests have been assigned to tables",
            de: "Alle Gäste wurden Tischen zugewiesen",
            tr: "Tüm misafirler masalara yerleştirildi",
        },
        person: {
            en: "person",
            de: "Person",
            tr: "kişi",
        },
        phone_optional: {
            en: "Phone (optional)",
            de: "Telefon (optional)",
            tr: "Telefon (opsiyonel)",
        },
        plus_ones: {
            en: "Additional Guests (+1s)",
            de: "Begleitpersonen (+1)",
            tr: "Refakatçiler (+1)",
        },
        print_save_pdf: {
            en: "🖨️ Print / Save as PDF",
            de: "🖨️ Drucken / Als PDF speichern",
            tr: "🖨️ Yazdır / PDF Kaydet",
        },
        rectangle: {
            en: "Rectangle",
            de: "Rechteckig",
            tr: "Dikdörtgen",
        },
        round: {
            en: "Round",
            de: "Rund",
            tr: "Yuvarlak",
        },
        seat: {
            en: "seats",
            de: "Plätze",
            tr: "kişilik",
        },
        seats: {
            en: "seats",
            de: "Plätze",
            tr: "kişi",
        },
        square: {
            en: "Square",
            de: "Quadratisch",
            tr: "Kare",
        },
        status: {
            en: "Status",
            de: "Status",
            tr: "Durum",
        },
        tab_guests: {
            en: "Guests",
            de: "Gäste",
            tr: "Misafirler",
        },
        tab_schema: {
            en: "Layout",
            de: "Layout",
            tr: "Düzen",
        },
        tab_spreadsheet: {
            en: "List View",
            de: "Listenansicht",
            tr: "Liste Görünümü",
        },
        tab_tables: {
            en: "Tables",
            de: "Tische",
            tr: "Masalar",
        },
        table: {
            en: "Table",
            de: "Tisch",
            tr: "Masa",
        },
        table_name: {
            en: "Table Name",
            de: "Tischname",
            tr: "Masa Adı",
        },
        table_name_placeholder: {
            en: "e.g., Table 1, Family Table",
            de: "z.B. Tisch 1, Familientisch",
            tr: "örn. Masa 1, Aile Masası",
        },
        table_shape: {
            en: "Table Shape",
            de: "Tischform",
            tr: "Masa Şekli",
        },
        table_type: {
            en: "Table Type",
            de: "Tischtyp",
            tr: "Masa Tipi",
        },
        tables_and_guests: {
            en: "Tables and Guests",
            de: "Tische und Gäste",
            tr: "Masalar ve Misafirler",
        },
        title: {
            en: "Seating Plan",
            de: "Sitzplan",
            tr: "Oturma Planı",
        },
        total_guests: {
            en: "Total Guests",
            de: "Gäste Gesamt",
            tr: "Toplam Misafir",
        },
        total_guests_question: {
            en: "How many guests are you expecting?",
            de: "Wie viele Gäste erwarten Sie?",
            tr: "Kaç misafir bekliyorsunuz?",
        },
        total_tables: {
            en: "Total Tables",
            de: "Tische Gesamt",
            tr: "Toplam Masa",
        },
        unassigned: {
            en: "Unassigned",
            de: "Nicht zugewiesen",
            tr: "Yerleştirilmemiş",
        },
        unassigned_guests: {
            en: "Unassigned",
            de: "Nicht zugewiesen",
            tr: "Yerleştirilmemiş",
        },
        unassigned_guests_title: {
            en: "Unassigned Guests",
            de: "Nicht zugewiesene Gäste",
            tr: "Yerleştirilmemiş Misafirler",
        },
        venue_name_placeholder: {
            en: "e.g., Grand Hotel Ballroom",
            de: "z.B. Grand Hotel Ballsaal",
            tr: "örn. Grand Hotel Balo Salonu",
        },
        venue_name_question: {
            en: "What is your venue name?",
            de: "Wie heißt Ihre Location?",
            tr: "Mekanınızın adı nedir?",
        },
        welcome_subtitle: {
            en: "Let's start by setting up some basic information about your wedding.",
            de: "Beginnen wir mit einigen grundlegenden Informationen zu Ihrer Hochzeit.",
            tr: "Düğününüz hakkında bazı temel bilgilerle başlayalım.",
        },
        welcome_title: {
            en: "Welcome to Seating Planner",
            de: "Willkommen beim Sitzplaner",
            tr: "Oturma Planlayıcısına Hoş Geldiniz",
        },
    },
    vendorWallet: {
        title: { en: "Wallet", de: "Geldbörse", tr: "Cüzdan" },
        desc: { en: "Manage your credits and transactions.", de: "Verwalten Sie Ihre Credits und Transaktionen.", tr: "Kredilerinizi ve işlemlerinizi yönetin." },
        currentBalance: { en: "Current Balance", de: "Aktuelles Guthaben", tr: "Mevcut Bakiye" },
        credits: { en: "Credits", de: "Credits", tr: "Kredi" },
        history: { en: "Transaction History", de: "Transaktionsverlauf", tr: "İşlem Geçmişi" },
        noTxn: { en: "No transactions found.", de: "Keine Transaktionen gefunden.", tr: "Henüz işlem bulunmuyor." },
        date: { en: "Date", de: "Datum", tr: "Tarih" },
        transaction: { en: "Transaction", de: "Transaktion", tr: "İşlem" },
        status: { en: "Status", de: "Status", tr: "Durum" },
        amount: { en: "Amount", de: "Betrag", tr: "Tutar" },
        purchase: { en: "Credit Purchase", de: "Credit-Kauf", tr: "Kredi Yükleme" },
        usage: { en: "Credit Usage", de: "Credit-Nutzung", tr: "Kredi Kullanımı" },
        statusPending: { en: "Pending Approval", de: "Wartet auf Genehmigung", tr: "Onay Bekliyor" },
        statusApproved: { en: "Approved", de: "Genehmigt", tr: "Onaylandı" },
        statusRejected: { en: "Rejected", de: "Abgelehnt", tr: "Reddedildi" },
        filterAll: { en: "All", de: "Alle", tr: "Tümü" },
        filterSuccess: { en: "Successful", de: "Erfolgreich", tr: "Başarılı" },
        filterPending: { en: "Pending", de: "Ausstehend", tr: "Bekleyen" },
        filterSuccess: { en: "Successful", de: "Erfolgreich", tr: "Başarılı" },
        filterPending: { en: "Pending", de: "Ausstehend", tr: "Bekleyen" },
        filterRejected: { en: "Rejected", de: "Abgelehnt", tr: "Reddedilen" },
        packagesTitle: { en: "Credit Packages", de: "Credit-Pakete", tr: "Kredi Paketleri" },
        buyBtn: { en: "Buy Now", de: "Jetzt kaufen", tr: "SATIN AL" },
        loadingPackages: { en: "Loading packages...", de: "Pakete werden geladen...", tr: "Paketler yükleniyor..." },
        membershipStatus: { en: "Membership Status", de: "Mitgliedschaftsstatus", tr: "Üyelik Durumu" },
        premiumMember: { en: "Premium Member", de: "Premium-Mitglied", tr: "Premium Üye" },
        freeMember: { en: "Free Member", de: "Kostenloses Mitglied", tr: "Ücretsiz Üye" },
        expiresOn: { en: "Expires", de: "Läuft ab", tr: "Bitiş" },
        upgradeToPremium: { en: "Upgrade to Premium", de: "Auf Premium upgraden", tr: "Premium'a Yükselt" },
        packageNames: {
            starter: { en: "Starter Package", de: "Starter-Paket", tr: "Başlangıç Paketi" },
            standard: { en: "Standard Package", de: "Standard-Paket", tr: "Standart Paket" },
            pro: { en: "Pro Package", de: "Pro-Paket", tr: "Pro Paket" },
            business: { en: "Business Package", de: "Business-Paket", tr: "Kurumsal Paket" }
        },
        purchaseRequest: { en: "purchase request", de: "Kaufanfrage", tr: "satın alma talebi" }
    },
    categories: {
        wedding_venues: {
            en: "Wedding Venues",
            de: "Hochzeitslocations",
            tr: "Düğün Mekanları"
        },
        "düğün_mekanları": {
            en: "Wedding Venues",
            de: "Hochzeitslocations",
            tr: "Düğün Mekanları"
        },
        bridal_fashion: {
            en: "Bridal Fashion",
            de: "Brautmode",
            tr: "Gelinlik ve Moda"
        },
        hair_makeup: {
            en: "Hair & Make-Up",
            de: "Brautstyling & Make-up",
            tr: "Saç ve Makyaj"
        },
        groom_suits: {
            en: "Groom Suits",
            de: "Herrenmode",
            tr: "Damatlık"
        },
        wedding_cakes: {
            en: "Wedding Cakes",
            de: "Hochzeitstorten",
            tr: "Düğün Pastası"
        },
        wedding_planners: {
            en: "Wedding Planners",
            de: "Hochzeitsplaner",
            tr: "Düğün Organizasyonu"
        },
        wedding_cars: {
            en: "Wedding Cars",
            de: "Hochzeitsautos",
            tr: "Gelin Arabası"
        },
        catering_party: {
            en: "Catering & Party Service",
            de: "Catering & Partyservice",
            tr: "Catering"
        },
        wedding_speakers: {
            en: "Wedding Speakers",
            de: "Trauredner",
            tr: "Nikah Memuru / Konuşmacı"
        },
        flowers_decoration: {
            en: "Flowers & Decoration",
            de: "Floristik & Dekoration",
            tr: "Çiçek ve Dekorasyon"
        },
        invitations_stationery: {
            en: "Invitations & Stationery",
            de: "Einladungen & Papeterie",
            tr: "Davetiye ve Kırtasiye"
        },
        wedding_rings: {
            en: "Wedding Rings",
            de: "Trauringe & Schmuck",
            tr: "Alyans ve Takı"
        },
        wedding_photography: {
            en: "Wedding Photography",
            de: "Hochzeitsfotografie",
            tr: "Düğün Fotoğrafçısı"
        },
        wedding_videography: {
            en: "Wedding Videography",
            de: "Hochzeitsvideografie",
            tr: "Düğün Videografisi"
        },
        photobox: {
            en: "Photobox",
            de: "Fotobox",
            tr: "Fotobox"
        },
        djs: {
            en: "DJs",
            de: "DJs",
            tr: "DJ"
        },
        musicians: {
            en: "Musicians",
            de: "Musiker",
            tr: "Müzik Grupları"
        },
        entertainment: {
            en: "Entertainment",
            de: "Unterhaltung",
            tr: "Eğlence"
        }
    },
    schemas_2: {

        // Venue Types
        venue_type_label: { en: "Venue Type", de: "Art der Location", tr: "Mekan Tipi" },
        venue_option_country: { en: "Country Wedding", de: "Landhochzeit", tr: "Kır Düğünü" },
        venue_option_hotel: { en: "Hotel", de: "Hotel", tr: "Otel" },
        venue_option_historic: { en: "Historic Venue", de: "Historischer Ort", tr: "Tarihi Mekan" },
        venue_option_restaurant: { en: "Restaurant", de: "Restaurant", tr: "Restoran" },
        venue_option_boat: { en: "Boat / Yacht", de: "Schiff / Yacht", tr: "Tekne / Yat" },
        venue_option_social: { en: "Social Facility", de: "Soziale Einrichtung", tr: "Sosyal Tesis" },
        venue_option_hall: { en: "Wedding Hall", de: "Hochzeitssaal", tr: "Düğün Salonu" },

        // Capacity
        capacity_meal_label: { en: "Meal Capacity", de: "Kapazität (Essen)", tr: "Yemekli Kapasite" },
        capacity_cocktail_label: { en: "Cocktail Capacity", de: "Kapazität (Cocktail)", tr: "Kokteyl Kapasitesi" },

        // Views
        view_label: { en: "View", de: "Aussicht", tr: "Manzara" },
        view_sea: { en: "Sea View", de: "Meerblick", tr: "Deniz Manzaralı" },
        view_nature: { en: "Nature View", de: "Naturblick", tr: "Doğa Manzaralı" },
        view_city: { en: "City View", de: "Stadtblick", tr: "Şehir Manzaralı" },
        view_bosphorus: { en: "Bosphorus View", de: "Bosporus-Blick", tr: "Boğaz Manzaralı" },
        view_historic: { en: "Historic View", de: "Historische Aussicht", tr: "Tarihi Manzara" },
        view_garden: { en: "Garden View", de: "Gartenblick", tr: "Bahçe Manzaralı" },

        // Features
        features_label: { en: "Features", de: "Eigenschaften", tr: "Özellikler" },
        feature_accommodation: { en: "Accommodation", de: "Unterkunft", tr: "Konaklama" },
        feature_parking: { en: "Parking", de: "Parkplatz", tr: "Otopark" },
        feature_valet: { en: "Valet Service", de: "Valet-Service", tr: "Vale Hizmeti" },
        feature_disabled_access: { en: "Disabled Access", de: "Barrierefrei", tr: "Engelli Girişi" },
        feature_after_party: { en: "After Party Area", de: "After-Party-Bereich", tr: "After Party Alanı" },
        feature_catering: { en: "Catering Available", de: "Catering verfügbar", tr: "Yemek Servisi" },
        feature_music: { en: "Music System", de: "Musikanlage", tr: "Ses Sistemi" },

        // Allowed Services
        allowed_services_label: { en: "Allowed Services", de: "Erlaubte Dienstleister", tr: "İzin Verilen Hizmetler" },
        allowed_catering: { en: "External Catering", de: "Externes Catering", tr: "Dışarıdan Catering" },
        allowed_organization: { en: "External Organization", de: "Externe Organisation", tr: "Dışarıdan Organizasyon" },
        allowed_photography: { en: "External Photographer", de: "Externer Fotograf", tr: "Dışarıdan Fotoğrafçı" },

        // Other Common Labels
        performance_duration_label: { en: "Performance Duration", de: "Auftrittsdauer", tr: "Performans Süresi" },
        experience_years_label: { en: "Years of Experience", de: "Jahre Erfahrung", tr: "Deneyim Yılı" },
        event_types_label: { en: "Event Types", de: "Veranstaltungsarten", tr: "Etkinlik Türleri" },
        music_genres_label: { en: "Music Genres", de: "Musikgenres", tr: "Müzik Türleri" },
        delivery_time_weeks_label: { en: "Delivery Time (Weeks)", de: "Lieferzeit (Wochen)", tr: "Teslim Süresi (Hafta)" },
        min_guests_label: { en: "Minimum Guests", de: "Mindestanzahl Gäste", tr: "Minimum Misafir" },
        max_guests_label: { en: "Maximum Guests", de: "Maximale Gästeanzahl", tr: "Maksimum Misafir" },
        duration_minutes_label: { en: "Duration (Minutes)", de: "Dauer (Minuten)", tr: "Süre (Dakika)" },
        team_size_label: { en: "Team Size", de: "Teamgröße", tr: "Ekip Büyüklüğü" },
        min_order_quantity_label: { en: "Minimum Order Quantity", de: "Mindestbestellmenge", tr: "Minimum Sipariş Adedi" },
        start_price_label: { en: "Starting Price", de: "Startpreis", tr: "Başlangıç Fiyatı" },
        meeting_count_label: { en: "Number of Meetings", de: "Anzahl der Treffen", tr: "Görüşme Sayısı" },
        min_rental_hours_label: { en: "Minimum Rental Hours", de: "Mindestmietdauer (Stunden)", tr: "Minimum Kiralama Saati" },

        // Common Boolean Labels
        appointment_required_label: { en: "Appointment Required", de: "Termin erforderlich", tr: "Randevu Gerekli" },
        rehearsals_label: { en: "Rehearsals Included", de: "Proben inklusive", tr: "Provalar Dahil" },
        delivery_setup_available_label: { en: "Delivery & Setup Available", de: "Lieferung & Aufbau verfügbar", tr: "Teslimat & Kurulum Mevcut" },
        alteration_service_label: { en: "Alteration Service", de: "Änderungsservice", tr: "Tadilat Hizmeti" },
        rehearsal_available_label: { en: "Trial Session Available", de: "Probetermin verfügbar", tr: "Prova İmkanı" },
        design_service_label: { en: "Custom Design Service", de: "Design-Service", tr: "Tasarım Hizmeti" },
        demo_available_label: { en: "Demo Available", de: "Demo verfügbar", tr: "Demo Mevcut" },
        digital_copy_label: { en: "Digital Copy Included", de: "Digitale Kopie inklusive", tr: "Dijital Kopya Dahil" },
        assistant_included_label: { en: "Assistant Included", de: "Assistent inklusive", tr: "Asistan Dahil" },
        tasting_available_label: { en: "Tasting Available", de: "Verkostung verfügbar", tr: "Tadım İmkanı" },
        delivery_available_label: { en: "Delivery Available", de: "Lieferung verfügbar", tr: "Teslimat Mevcut" },
        driver_included_label: { en: "Driver Included", de: "Fahrer inklusive", tr: "Şoförlü" },
        decoration_included_label: { en: "Decoration Included", de: "Dekoration inklusive", tr: "Süsleme Dahil" },
        demo_table_label: { en: "Demo Table Setup", de: "Mustertisch", tr: "Demo Masa Hazırlığı" },
        city_out_label: { en: "Out of City Service", de: "Außerhalb der Stadt", tr: "Şehir Dışı Hizmet" },
        custom_design_label: { en: "Custom Design", de: "Individuelles Design", tr: "Özel Tasarım" },
        maintenance_service_label: { en: "Maintenance Service", de: "Wartungsservice", tr: "Bakım Hizmeti" },

        // Service Types & Options
        service_type_label: { en: "Service Type", de: "Serviceart", tr: "Hizmet Tipi" },
        service_ready_made: { en: "Ready Made", de: "Konfektion", tr: "Hazır Giyim" },
        service_custom_made: { en: "Custom Made", de: "Maßanfertigung", tr: "Özel Dikim" },
        service_rental: { en: "Rental", de: "Verleih", tr: "Kiralama" },
        service_haute_couture: { en: "Haute Couture", de: "Haute Couture", tr: "Haute Couture" },

        // Accessories
        accessory_services_label: { en: "Accessories", de: "Accessoires", tr: "Aksesuarlar" },
        acc_veil: { en: "Veil", de: "Schleier", tr: "Duvak" },
        acc_pouch: { en: "Pouch", de: "Beutel", tr: "Kese" },
        acc_gloves: { en: "Gloves", de: "Handschuhe", tr: "Eldiven" },
        acc_bouquet: { en: "Bouquet", de: "Brautstrauß", tr: "Çiçek" },
        acc_hair: { en: "Hair Accessories", de: "Haarschmuck", tr: "Saç Aksesuarı" },
        acc_shoes: { en: "Shoes", de: "Schuhe", tr: "Ayakkabı" },

        // Catering
        cuisine_types_label: { en: "Cuisine Types", de: "Küchenarten", tr: "Mutfak Türleri" },
        cuisine_turkish: { en: "Turkish", de: "Türkisch", tr: "Türk Mutfağı" },
        cuisine_world: { en: "World Cuisine", de: "Internationale Küche", tr: "Dünya Mutfağı" },
        cuisine_vegetarian: { en: "Vegetarian", de: "Vegetarisch", tr: "Vejetaryen" },
        cuisine_vegan: { en: "Vegan", de: "Vegan", tr: "Vegan" },
        cuisine_kosher: { en: "Kosher", de: "Koscher", tr: "Koşer" },
        cuisine_kids: { en: "Kids Menu", de: "Kindermenü", tr: "Çocuk Menüsü" },
        cuisine_ottoman: { en: "Ottoman", de: "Osmanisch", tr: "Osmanlı Mutfağı" },

        services_label: { en: "Services", de: "Dienstleistungen", tr: "Hizmetler" },
        service_waiters: { en: "Waiters", de: "Kellner", tr: "Servis Elemanı" },
        service_equipment: { en: "Equipment Rental", de: "Ausrüstungsverleih", tr: "Ekipman Kiralama" },
        service_menu_tasting: { en: "Menu Tasting", de: "Menüverkostung", tr: "Menü Tadımı" },
        service_cake_cutting: { en: "Cake Cutting", de: "Tortenanschnitt", tr: "Pasta Kesimi" },
        service_beverage: { en: "Beverage Service", de: "Getränkeservice", tr: "İçecek Servisi" },

        // DJ Genres
        genre_label: { en: "Music Genres", de: "Musikgenres", tr: "Müzik Türleri" },
        genre_pop: { en: "Pop", de: "Pop", tr: "Pop" },
        genre_electronic: { en: "Electronic", de: "Elektronisch", tr: "Elektronik" },
        genre_house: { en: "House", de: "House", tr: "House" },
        genre_techno: { en: "Techno", de: "Techno", tr: "Tekno" },
        genre_80s: { en: "80s", de: "80er", tr: "80'ler" },
        genre_90s: { en: "90s", de: "90er", tr: "90'lar" },
        genre_rnb: { en: "R&B", de: "R&B", tr: "R&B" },
        genre_rock: { en: "Rock", de: "Rock", tr: "Rock" },
        genre_jazz: { en: "Jazz", de: "Jazz", tr: "Caz" },
        genre_classical: { en: "Classical", de: "Klassik", tr: "Klasik" },
        genre_turkish: { en: "Turkish Pop/Rock", de: "Türkischer Pop/Rock", tr: "Türkçe Pop/Rock" },
        genre_turkish_pop: { en: "Turkish Pop", de: "Türkischer Pop", tr: "Türkçe Pop" },
        genre_foreign_pop: { en: "Foreign Pop", de: "Ausländischer Pop", tr: "Yabancı Pop" },
        genre_hiphop: { en: "Hip Hop", de: "Hip Hop", tr: "Hip Hop" },
        genre_foreign: { en: "Foreign Music", de: "Ausländische Musik", tr: "Yabancı Müzik" },
        genre_local: { en: "Local Music", de: "Lokale Musik", tr: "Yöresel Müzik" },
        genre_classic: { en: "Classical", de: "Klassik", tr: "Klasik" },

        // DJ Equipment & Others
        equipment_label: { en: "Equipment", de: "Ausrüstung", tr: "Ekipman" },
        equip_sound: { en: "Sound System", de: "Tonsystem", tr: "Ses Sistemi" },
        equip_light: { en: "Lighting System", de: "Lichtsystem", tr: "Işık Sistemi" },
        equip_fog: { en: "Fog Machine", de: "Nebelmaschine", tr: "Sis Makinesi" },
        equip_dj_booth: { en: "DJ Booth", de: "DJ-Pult", tr: "DJ Kabini" },
        equip_mic: { en: "Microphone", de: "Mikrofon", tr: "Mikrofon" },
        equip_stage: { en: "Stage Setup", de: "Bühnenaufbau", tr: "Sahne Kurulumu" },
        equip_truss: { en: "Truss System", de: "Traversensystem", tr: "Truss Sistemi" },

        // Entertainment
        act_type_label: { en: "Act Type", de: "Art der Darbietung", tr: "Gösteri Türü" },
        act_dance: { en: "Dance Show", de: "Tanzshow", tr: "Dans Gösterisi" },
        act_magician: { en: "Magician", de: "Zauberer", tr: "Sihirbaz" },
        act_fire: { en: "Fire Show", de: "Feuershow", tr: "Ateş Gösterisi" },
        act_acrobatics: { en: "Acrobatics", de: "Akrobatik", tr: "Akrobasi" },
        act_comedian: { en: "Comedian", de: "Komiker", tr: "Komedyen" },
        act_caricature: { en: "Caricature Artist", de: "Karikaturist", tr: "Karikatürist" },
        act_fireworks: { en: "Fireworks", de: "Feuerwerk", tr: "Havai Fişek" },

        requirements_label: { en: "Requirements", de: "Anforderungen", tr: "Gereksinimler" },
        req_stage: { en: "Stage", de: "Bühne", tr: "Sahne" },
        req_sound: { en: "Sound System", de: "Tonsystem", tr: "Ses Sistemi" },
        req_backstage: { en: "Backstage Area", de: "Backstage-Bereich", tr: "Kulis" },
        req_high_ceiling: { en: "High Ceiling", de: "Hohe Decke", tr: "Yüksek Tavan" },

        // Flowers & Decoration
        service_bridal_bouquet: { en: "Bridal Bouquet", de: "Brautstrauß", tr: "Gelin Buketi" },
        service_boutonniere: { en: "Boutonniere", de: "Ansteckblume", tr: "Yaka Çiçeği" },
        service_venue_decor: { en: "Venue Decoration", de: "Location-Dekoration", tr: "Mekan Süslemesi" },
        service_car_decor: { en: "Car Decoration", de: "Autoschmuck", tr: "Araç Süslemesi" },
        service_aisle: { en: "Aisle Decoration", de: "Gang-Dekoration", tr: "Gelin Yolu" },
        service_table_decor: { en: "Table Decoration", de: "Tischdekoration", tr: "Masa Süslemesi" },
        service_altar: { en: "Altar/Arch", de: "Altar/Bogen", tr: "Nikah Kürsüsü/Tak" },

        flower_types_label: { en: "Flower Types", de: "Blumenarten", tr: "Çiçek Türleri" },
        flower_fresh: { en: "Fresh Flowers", de: "Frische Blumen", tr: "Canlı Çiçek" },
        flower_artificial: { en: "Artificial Flowers", de: "Kunstblumen", tr: "Yapay Çiçek" },
        flower_dried: { en: "Dried Flowers", de: "Trockenblumen", tr: "Kuru Çiçek" },
        flower_preserved: { en: "Preserved Flowers", de: "Konservierte Blumen", tr: "Şoklanmış Çiçek" },

        // Groom Suits
        products_label: { en: "Products", de: "Produkte", tr: "Ürünler" },
        prod_groom_suit: { en: "Groom Suit", de: "Bräutigamanzug", tr: "Damatlık" },
        prod_tuxedo: { en: "Tuxedo", de: "Smoking", tr: "Smokin" },
        prod_tailcoat: { en: "Tailcoat", de: "Frack", tr: "Frak" },
        prod_shirt: { en: "Shirt", de: "Hemd", tr: "Gömlek" },
        prod_shoes: { en: "Shoes", de: "Schuhe", tr: "Ayakkabı" },
        prod_cufflinks: { en: "Cufflinks", de: "Manschettenknöpfe", tr: "Kol Düğmesi" },
        prod_bowtie: { en: "Bowtie/Tie", de: "Fliege/Krawatte", tr: "Papyon/Kravat" },

        // Hair & Make-Up
        service_location_label: { en: "Service Location", de: "Serviceort", tr: "Hizmet Yeri" },
        loc_salon: { en: "At Salon", de: "Im Salon", tr: "Salonda" },
        loc_home_hotel: { en: "Home/Hotel Service", de: "Haus/Hotel-Service", tr: "Evde/Otelde" },
        loc_out_city: { en: "Out of City", de: "Außerhalb der Stadt", tr: "Şehir Dışı" },

        service_bridal_hair: { en: "Bridal Hair", de: "Brautfrisur", tr: "Gelin Saçı" },
        service_makeup: { en: "Make-Up", de: "Make-Up", tr: "Makyaj" },
        service_manicure: { en: "Manicure/Pedicure", de: "Maniküre/Pediküre", tr: "Manikür/Pedikür" },
        service_waxing: { en: "Waxing", de: "Waxing", tr: "Ağda" },
        service_skincare: { en: "Skincare", de: "Hautpflege", tr: "Cilt Bakımı" },
        service_lashes: { en: "Eyelashes", de: "Wimpern", tr: "Takma Kirpik" },
        service_massage: { en: "Massage", de: "Massage", tr: "Masaj" },
        team_capacity_label: { en: "Team Capacity", de: "Teamkapazität", tr: "Ekip Kapasitesi" },

        // Invitations
        prod_invitation: { en: "Invitations", de: "Einladungen", tr: "Davetiye" },
        prod_candy: { en: "Wedding Candy", de: "Hochzeitsbonbons", tr: "Nikah Şekeri" },
        prod_gift: { en: "Gifts", de: "Gastgeschenke", tr: "Hediyelik" },
        prod_guestbook: { en: "Guestbook", de: "Gästebuch", tr: "Anı Defteri" },
        prod_table_card: { en: "Table Cards", de: "Tischkarten", tr: "Masa Kartı" },
        prod_menu_card: { en: "Menu Cards", de: "Menükarten", tr: "Menü Kartı" },
        prod_welcome_board: { en: "Welcome Board", de: "Willkommensschild", tr: "Karşılama Panosu" },

        // Musicians
        performance_type_label: { en: "Performance Type", de: "Auftrittsart", tr: "Performans Türü" },
        perf_dj: { en: "DJ", de: "DJ", tr: "DJ" },
        perf_orchestra: { en: "Orchestra", de: "Orchester", tr: "Orkestra" },
        perf_fasil: { en: "Fasil Group", de: "Fasil-Gruppe", tr: "Fasıl Grubu" },
        perf_trio: { en: "Trio", de: "Trio", tr: "Trio" },
        perf_band: { en: "Live Band", de: "Live-Band", tr: "Canlı Müzik Grubu" },
        perf_solist: { en: "Soloist", de: "Solist", tr: "Solist" },
        perf_duo: { en: "Duo", de: "Duo", tr: "Duo" },
        orchestra_size_label: { en: "Orchestra Size", de: "Orchestergröße", tr: "Orkestra Kişi Sayısı" },

        // Photobox
        features_label: { en: "Features", de: "Funktionen", tr: "Özellikler" },
        feat_unlimited_print: { en: "Unlimited Prints", de: "Unbegrenzte Ausdrucke", tr: "Sınırsız Baskı" },
        feat_gif: { en: "GIF Creation", de: "GIF-Erstellung", tr: "GIF Yapımı" },
        feat_boomerang: { en: "Boomerang", de: "Boomerang", tr: "Boomerang" },
        feat_green_screen: { en: "Green Screen", de: "Green Screen", tr: "Green Screen" },
        feat_custom_bg: { en: "Custom Background", de: "Individueller Hintergrund", tr: "Özel Arka Plan" },
        feat_props: { en: "Props/Accessories", de: "Requisiten/Accessoires", tr: "Aksesuar/Karton" },

        print_size_label: { en: "Print Size", de: "Druckgröße", tr: "Baskı Boyutu" },
        size_10x15: { en: "10x15 cm", de: "10x15 cm", tr: "10x15 cm" },
        size_strip: { en: "Photo Strip", de: "Fotostreifen", tr: "Şerit Fotoğraf" },
        size_polaroid: { en: "Polaroid", de: "Polaroid", tr: "Polaroid" },

        // Wedding Cakes
        prod_wedding_cake: { en: "Wedding Cake", de: "Hochzeitstorte", tr: "Düğün Pastası" },
        prod_cupcake: { en: "Cupcakes", de: "Cupcakes", tr: "Cupcake" },
        prod_macaron: { en: "Macarons", de: "Macarons", tr: "Makaron" },
        prod_engagement_cake: { en: "Engagement Cake", de: "Verlobungstorte", tr: "Nişan Pastası" },
        prod_candy_buffet: { en: "Candy Buffet", de: "Süßigkeitenbuffet", tr: "Şeker Büfesi" },

        dietary_options_label: { en: "Dietary Options", de: "Diätoptionen", tr: "Diyet Seçenekleri" },
        diet_gluten_free: { en: "Gluten Free", de: "Glutenfrei", tr: "Glutensiz" },
        diet_lactose_free: { en: "Lactose Free", de: "Laktosefrei", tr: "Laktozsuz" },
        diet_vegan: { en: "Vegan", de: "Vegan", tr: "Vegan" },
        diet_sugar_free: { en: "Sugar Free", de: "Zuckerfrei", tr: "Şekersiz" },
        diet_egg_free: { en: "Egg Free", de: "Eifrei", tr: "Yumurtasız" },

        // Wedding Cars
        vehicle_types_label: { en: "Vehicle Types", de: "Fahrzeugtypen", tr: "Araç Türleri" },
        car_classic: { en: "Classic Car", de: "Oldtimer", tr: "Klasik Araba" },
        car_sports: { en: "Sports Car", de: "Sportwagen", tr: "Spor Araba" },
        car_limo: { en: "Limousine", de: "Limousine", tr: "Limuzin" },
        car_vosvos: { en: "Beetle (Vosvos)", de: "Käfer", tr: "Vosvos" },
        car_vip_minibus: { en: "VIP Minibus", de: "VIP-Minibus", tr: "VIP Minibüs" },
        car_cabrio: { en: "Convertible", de: "Cabrio", tr: "Üstü Açık" },
        car_helicopter: { en: "Helicopter", de: "Hubschrauber", tr: "Helikopter" },
        car_boat: { en: "Boat/Yacht", de: "Boot/Yacht", tr: "Tekne/Yat" },

        // Wedding Photography & Videography
        shooting_types_label: { en: "Shooting Types", de: "Aufnahmearten", tr: "Çekim Türleri" },
        shoot_documentary: { en: "Documentary", de: "Dokumentarisch", tr: "Belgesel Tadında" },
        shoot_story: { en: "Wedding Story", de: "Hochzeitsgeschichte", tr: "Düğün Hikayesi" },
        shoot_catalog: { en: "Catalog Shoot", de: "Katalogaufnahme", tr: "Katalog Çekimi" },
        shoot_save_the_date: { en: "Save the Date", de: "Save the Date", tr: "Save the Date" },
        shoot_trashday: { en: "Trash the Dress", de: "Trash the Dress", tr: "Trash the Dress" },
        shoot_engagement: { en: "Engagement Shoot", de: "Verlobungsshooting", tr: "Nişan Çekimi" },
        shoot_studio: { en: "Studio Shoot", de: "Studioaufnahme", tr: "Stüdyo Çekimi" },
        shoot_clip: { en: "Video Clip", de: "Videoclip", tr: "Video Klip" },
        shoot_teaser: { en: "Teaser", de: "Teaser", tr: "Teaser" },

        service_drone: { en: "Drone Shooting", de: "Drohnenaufnahme", tr: "Drone Çekimi" },
        service_jimmy_jib: { en: "Jimmy Jib", de: "Jimmy Jib", tr: "Jimmy Jib" },
        service_album_print: { en: "Album Printing", de: "Albumdruck", tr: "Albüm Baskı" },
        service_digital: { en: "Digital Delivery", de: "Digitale Lieferung", tr: "Dijital Teslim" },
        service_full_day: { en: "Full Day Coverage", de: "Ganztagesbegleitung", tr: "Tüm Gün Çekim" },
        service_video_clip: { en: "Video Clip", de: "Videoclip", tr: "Video Klip" },
        service_4k: { en: "4K Recording", de: "4K-Aufnahme", tr: "4K Çekim" },
        service_editing: { en: "Video Editing", de: "Videobearbeitung", tr: "Kurgu/Montaj" },
        service_social_clip: { en: "Social Media Clip", de: "Social Media Clip", tr: "Sosyal Medya Klibi" },

        // Wedding Planners
        service_table_chair: { en: "Table & Chair Rental", de: "Tisch- & Stuhlverleih", tr: "Masa Sandalye Kiralama" },
        service_decoration: { en: "Decoration", de: "Dekoration", tr: "Süsleme" },
        service_flowers: { en: "Floristry", de: "Floristik", tr: "Çiçek" },
        service_rsvp: { en: "RSVP Management", de: "Gästemanagement", tr: "LCV Hizmeti" },
        service_barkovision: { en: "Barkovision", de: "Barkovision", tr: "Barkovizyon" },
        service_fireworks: { en: "Fireworks", de: "Feuerwerk", tr: "Havai Fişek" },
        service_artist: { en: "Artist Booking", de: "Künstlerbuchung", tr: "Sanatçı Temini" },
        service_catering: { en: "Catering", de: "Catering", tr: "Catering" },

        concepts_label: { en: "Concepts", de: "Konzepte", tr: "Konseptler" },
        concept_bohemian: { en: "Bohemian", de: "Bohemian", tr: "Bohem" },
        concept_rustic: { en: "Rustic", de: "Rustikal", tr: "Rustik" },
        concept_modern: { en: "Modern", de: "Modern", tr: "Modern" },
        concept_classic: { en: "Classic", de: "Klassisch", tr: "Klasik" },
        concept_vintage: { en: "Vintage", de: "Vintage", tr: "Vintage" },
        concept_romantic: { en: "Romantic", de: "Romantisch", tr: "Romantik" },
        concept_industrial: { en: "Industrial", de: "Industriell", tr: "Endüstriyel" },

        // Wedding Rings
        prod_wedding_ring: { en: "Wedding Rings", de: "Eheringe", tr: "Alyans" },
        prod_solitaire: { en: "Solitaire", de: "Solitär", tr: "Tektaş" },
        prod_five_stone: { en: "Five Stone", de: "Fünf Steine", tr: "Beştaş" },
        prod_necklace: { en: "Necklace", de: "Halskette", tr: "Kolye" },
        prod_earrings: { en: "Earrings", de: "Ohrringe", tr: "Küpe" },
        prod_bracelet: { en: "Bracelet", de: "Armband", tr: "Bileklik" },
        prod_watch: { en: "Watch", de: "Uhr", tr: "Saat" },

        material_label: { en: "Material", de: "Material", tr: "Materyal" },
        mat_gold_yellow: { en: "Yellow Gold", de: "Gelbgold", tr: "Sarı Altın" },
        mat_gold_white: { en: "White Gold", de: "Weißgold", tr: "Beyaz Altın" },
        mat_gold_rose: { en: "Rose Gold", de: "Roségold", tr: "Rose Altın" },
        mat_platinum: { en: "Platinum", de: "Platin", tr: "Platin" },
        mat_silver: { en: "Silver", de: "Silber", tr: "Gümüş" },
        mat_diamond: { en: "Diamond", de: "Diamant", tr: "Elmas" },
        mat_brilliant: { en: "Brilliant", de: "Brillant", tr: "Pırlanta" },

        // Wedding Speakers
        languages_label: { en: "Languages", de: "Sprachen", tr: "Diller" },
        lang_turkish: { en: "Turkish", de: "Türkisch", tr: "Türkçe" },
        lang_german: { en: "German", de: "Deutsch", tr: "Almanca" },
        lang_english: { en: "English", de: "Englisch", tr: "İngilizce" },
        lang_french: { en: "French", de: "Französisch", tr: "Fransızca" },
        lang_spanish: { en: "Spanish", de: "Spanisch", tr: "İspanyolca" },

        service_custom_text: { en: "Custom Speech", de: "Individuelle Rede", tr: "Kişiye Özel Metin" },
        service_symbolic: { en: "Symbolic Ceremony", de: "Symbolische Zeremonie", tr: "Sembolik Nikah" },
        service_vow_renewal: { en: "Vow Renewal", de: "Erneuerung des Eheversprechens", tr: "Nikah Tazeleme" },
        service_story_writing: { en: "Story Writing", de: "Geschichtenschreiben", tr: "Hikaye Yazımı" },


    },
    checkout: {
        title: {
            en: "Complete Your Purchase",
            de: "Kauf abschließen",
            tr: "Ödemeyi Tamamla"
        },
        summary: {
            en: "Order Summary",
            de: "Bestellübersicht",
            tr: "Sipariş Özeti"
        },
        plan: {
            en: "Premium Plan (Monthly)",
            de: "Premium-Paket (Monatlich)",
            tr: "Premium Paket (Aylık)"
        },
        total: {
            en: "Total",
            de: "Gesamt",
            tr: "Toplam"
        },
        skip: {
            en: "Skip for now (Go to Dashboard)",
            de: "Vorerst überspringen (Zum Dashboard)",
            tr: "Şimdilik atla (Panele Git)"
        },
        success: {
            en: "Payment successful! Welcome to Premium.",
            de: "Zahlung erfolgreich! Willkommen bei Premium.",
            tr: "Ödeme başarılı! Premium'a hoş geldiniz."
        },
        error: {
            en: "Payment failed. Please try again or contact support.",
            de: "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
            tr: "Ödeme başarısız. Lütfen tekrar deneyin veya destekle iletişime geçin."
        }
    },
    vendorLanding: {
        title: {
            en: "Wedding Vendors",
            de: "Hochzeitsdienstleister",
            tr: "Düğün Firmaları"
        },
        subtitle: {
            en: "Join our platform and grow your business.",
            de: "Treten Sie unserer Plattform bei und lassen Sie Ihr Geschäft wachsen.",
            tr: "Platformumuza katılın ve işinizi büyütün."
        },
        heroSubtitle: {
            en: "Discover the best vendors for your dream wedding",
            de: "Entdecken Sie die besten Dienstleister für Ihre Traumhochzeit",
            tr: "Hayalinizdeki düğün için en iyi firmaları keşfedin"
        },
        searchPlaceholder: {
            en: "🔍 Search vendors... (DJ, Photographer, Venue)",
            de: "🔍 Suchen... (DJ, Fotograf, Location)",
            tr: "🔍 Firma ara... (DJ, Fotoğrafçı, Mekan)"
        },
        searchButton: {
            en: "Search",
            de: "Suchen",
            tr: "Ara"
        },
        ctaTitle: {
            en: "🎉 Want to join as a vendor?",
            de: "🎉 Möchten Sie als Dienstleister beitreten?",
            tr: "🎉 Siz de firma olarak katılmak ister misiniz?"
        },
        ctaSubtitle: {
            en: "Reach thousands of couples, grow your business",
            de: "Erreichen Sie tausende Paare, erweitern Sie Ihr Geschäft",
            tr: "Binlerce çifte ulaşın, işinizi büyütün"
        },
        gridTitle: {
            en: "Wedding Vendors",
            de: "Hochzeitsdienstleister",
            tr: "Düğün Firmaları"
        },
        gridDesc: {
            en: "The wedding you've been dreaming of for years is just around the corner. With the help of your partner and the wedding vendors you'll work with, you can achieve the perfect wedding. KolayDugun.de brings you the best vendors in your city to make your dream wedding a reality.",
            de: "Die Hochzeit, von der Sie seit Jahren träumen, steht kurz bevor. Mit der Hilfe Ihres Partners und der Hochzeitsdienstleister, mit denen Sie zusammenarbeiten, können Sie die perfekte Hochzeit verwirklichen. KolayDugun.de bringt Ihnen die besten Dienstleister Ihrer Stadt, um Ihre Traumhochzeit Wirklichkeit werden zu lassen.",
            tr: "Yıllardır hayalini kurduğunuz o eşsiz düğüne ulaşmanıza çok az kaldı. Eşiniz ve birlikte çalışacağınız düğün firmalarının yardımıyla, kusursuz düğünne kavuşabilirsiniz. KolayDugun.de, şehrinizdeki en iyi firmaları bir araya toplayarak hayalinizdeki düğünü size getiriyor."
        }
    },

    checklist: {
        title: { en: "To-Do List", de: "Checkliste", tr: "Yapılacaklar Listesi" },
        placeholder: { en: "Add new task...", de: "Neue Aufgabe hinzufügen...", tr: "Yeni görev ekle..." },
        empty: { en: "No tasks added yet.", de: "Noch keine Aufgaben hinzugefügt.", tr: "Henüz görev eklenmedi." }
    },
    forgotPassword: {
        title: {
            en: "Forgot Password",
            de: "Passwort vergessen",
            tr: "Şifremi Unuttum"
        },
        description: {
            en: "Enter your email address and we'll send you a link to reset your password.",
            de: "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.",
            tr: "E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim."
        },
        emailLabel: {
            en: "Email Address",
            de: "E-Mail-Adresse",
            tr: "E-posta Adresi"
        },
        submitButton: {
            en: "Send Reset Link",
            de: "Link senden",
            tr: "Sıfırlama Linki Gönder"
        },
        successMessage: {
            en: "Password reset link sent to your email. Please check your inbox (and spam folder).",
            de: "Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail gesendet. Bitte prüfen Sie Ihren Posteingang (und Spam-Ordner).",
            tr: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen kutunuzu kontrol edin (spam klasörüne de bakmayı unutmayın)."
        },
        backToLogin: {
            en: "Back to Login",
            de: "Zurück zum Login",
            tr: "Giriş Yap'a Dön"
        }
    },
    updatePassword: {
        title: {
            en: "Set New Password",
            de: "Neues Passwort setzen",
            tr: "Yeni Şifre Belirle"
        },
        description: {
            en: "Please enter your new password below.",
            de: "Bitte geben Sie unten Ihr neues Passwort ein.",
            tr: "Lütfen yeni şifrenizi aşağıya girin."
        },
        passwordLabel: {
            en: "New Password",
            de: "Neues Passwort",
            tr: "Yeni Şifre"
        },
        confirmPasswordLabel: {
            en: "Confirm New Password",
            de: "Neues Passwort bestätigen",
            tr: "Yeni Şifreyi Onayla"
        },
        submitButton: {
            en: "Update Password",
            de: "Passwort aktualisieren",
            tr: "Şifreyi Güncelle"
        },
        successMessage: {
            en: "Password updated successfully! Redirecting to login...",
            de: "Passwort erfolgreich aktualisiert! Weiterleitung zum Login...",
            tr: "Şifre başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz..."
        },
        errorMismatch: {
            en: "Passwords do not match.",
            de: "Passwörter stimmen nicht überein.",
            tr: "Şifreler eşleşmiyor."
        },
        errorLength: {
            en: "Password must be at least 6 characters.",
            de: "Passwort muss mindestens 6 Zeichen lang sein.",
            tr: "Şifre en az 6 karakter olmalıdır."
        }
    },
    vendorDashboard: {
        alerts: {
            saved: {
                en: "Changes saved successfully!",
                de: "Änderungen erfolgreich gespeichert!",
                tr: "Değişiklikler başarıyla kaydedildi!"
            },
            locked: {
                en: "🔒 Upgrade to Premium to unlock this feature",
                de: "🔒 Upgrade auf Premium, um diese Funktion freizuschalten",
                tr: "🔒 Bu özelliği açmak için Premium'a yükseltin"
            }
        },
        tiers: {
            free: {
                name: {
                    en: "Free Plan",
                    de: "Kostenlos",
                    tr: "Ücretsiz Paket"
                },
                desc: {
                    en: "Basic visibility",
                    de: "Basis-Sichtbarkeit",
                    tr: "Temel görünürlük"
                }
            },
            premium: {
                name: {
                    en: "Premium Plan",
                    de: "Premium",
                    tr: "Premium Paket"
                },
                desc: {
                    en: "High visibility & more features",
                    de: "Hohe Sichtbarkeit & mehr Funktionen",
                    tr: "Yüksek görünürlük & daha fazla özellik"
                }
            }
        },
        profile: {
            locationSettings: {
                en: "Location Settings",
                de: "Standorteinstellungen",
                tr: "Konum Ayarları"
            },
            useMyLocation: {
                en: "Use My Location",
                de: "Meinen Standort verwenden",
                tr: "Konumumu Kullan"
            },
            latitude: {
                en: "Latitude",
                de: "Breitengrad",
                tr: "Enlem"
            },
            longitude: {
                en: "Longitude",
                de: "Längengrad",
                tr: "Boylam"
            }
        },
        leads: {
            noLeads: {
                en: "No inquiries yet.",
                de: "Noch keine Anfragen.",
                tr: "Henüz talep yok."
            }
        },
        faq: {
            title: {
                en: "FAQ",
                de: "Häufig gestellte Fragen",
                tr: "Sıkça Sorulan Sorular"
            },
            question: {
                en: "Question",
                de: "Frage",
                tr: "Soru"
            },
            answer: {
                en: "Answer",
                de: "Antwort",
                tr: "Cevap"
            },
            add: {
                en: "Add Question",
                de: "Frage hinzufügen",
                tr: "Soru Ekle"
            },
            remove: {
                en: "Remove",
                de: "Entfernen",
                tr: "Sil"
            }
        }
    },
    contact: {
        title: {
            en: "Contact Us",
            de: "Kontaktieren Sie uns",
            tr: "Bize Ulaşın"
        },
        desc: {
            en: "Ready to start planning? We'd love to hear from you.",
            de: "Bereit für die Planung? Wir freuen uns, von Ihnen zu hören.",
            tr: "Planlamaya başlamaya hazır mısınız? Sizinle tanışmak için sabırsızlanıyoruz."
        },
        name: {
            en: "Name",
            de: "Name",
            tr: "İsim"
        },
        email: {
            en: "Email",
            de: "E-Mail",
            tr: "E-posta"
        },
        message: {
            en: "Message",
            de: "Nachricht",
            tr: "Mesaj"
        },
        send: {
            en: "Send Message",
            de: "Nachricht senden",
            tr: "GÖNDER"
        },
        success: {
            en: "Message sent successfully!",
            de: "Nachricht erfolgreich gesendet!",
            tr: "Mesajınız başarıyla gönderildi!"
        },
        error: {
            en: "Failed to send message.",
            de: "Nachricht konnte nicht gesendet werden.",
            tr: "Mesaj gönderilemedi."
        },
        phone: {
            en: "Phone",
            de: "Telefon",
            tr: "Telefon"
        },
        namePlaceholder: {
            en: "Your Name",
            de: "Ihr Name",
            tr: "Adınız Soyadınız"
        },
        emailPlaceholder: {
            en: "example@email.com",
            de: "beispiel@email.com",
            tr: "ornek@email.com"
        },
        messagePlaceholder: {
            en: "Hello, I would like to get a quote...",
            de: "Hallo, ich möchte ein Angebot erhalten...",
            tr: "Merhaba, fiyat teklifi almak istiyorum..."
        }
    },
    schemas_3: {
        // Views
        view_label: { en: "View", de: "Aussicht", tr: "Manzara" },
        view_lake: { en: "Lake View", de: "Seeblick", tr: "Göl Manzaralı" },
        view_sea: { en: "Sea View", de: "Meerblick", tr: "Deniz Manzaralı" },
        view_nature: { en: "Nature View", de: "Naturblick", tr: "Doğa Manzaralı" },
        view_city: { en: "City View", de: "Stadtblick", tr: "Şehir Manzaralı" },
        view_bosphorus: { en: "Bosphorus View", de: "Bosporus-Blick", tr: "Boğaz Manzaralı" },
        view_forest: { en: "Forest View", de: "Waldblick", tr: "Orman Manzaralı" },
        view_historic: { en: "Historic View", de: "Historische Aussicht", tr: "Tarihi Manzara" },

        // Features
        features_label: { en: "Features", de: "Eigenschaften", tr: "Özellikler" },
        feature_menu_tasting: { en: "Menu Tasting", de: "Menüverkostung", tr: "Menü Tadımı" },
        feature_sound_light: { en: "Sound & Light System", de: "Ton- & Lichtsystem", tr: "Ses & Işık Sistemi" },
        feature_parking: { en: "Parking", de: "Parkplatz", tr: "Otopark" },
        feature_valet: { en: "Valet Service", de: "Valet-Service", tr: "Vale Hizmeti" },
        feature_disabled_access: { en: "Disabled Access", de: "Barrierefrei", tr: "Engelli Girişi" },
        feature_after_party: { en: "After Party Area", de: "After-Party-Bereich", tr: "After Party Alanı" },
        feature_accommodation: { en: "Accommodation", de: "Unterkunft", tr: "Konaklama" },

        // Venue Types
        venue_type_label: { en: "Venue Type", de: "Location-Typ", tr: "Mekan Tipi" },
        venue_option_hotel: { en: "Hotel", de: "Hotel", tr: "Otel" },
        venue_option_historic: { en: "Historic Venue", de: "Historischer Ort", tr: "Tarihi Mekan" },
        venue_option_restaurant: { en: "Restaurant", de: "Restaurant", tr: "Restoran" },
        venue_option_boat: { en: "Boat/Yacht", de: "Boot/Yacht", tr: "Tekne / Yat" },
        venue_option_social: { en: "Social Facility", de: "Soziale Einrichtung", tr: "Sosyal Tesis" },
        venue_option_hall: { en: "Wedding Hall", de: "Hochzeitssaal", tr: "Düğün Salonu" },
        venue_option_country: { en: "Country Wedding", de: "Landhochzeit", tr: "Kır Düğünü" },

        // Capacities
        capacity_meal_label: { en: "Meal Capacity", de: "Kapazität (Essen)", tr: "Yemekli Kapasite" },
        capacity_cocktail_label: { en: "Cocktail Capacity", de: "Kapazität (Cocktail)", tr: "Kokteyl Kapasitesi" },
        max_guests_label: { en: "Max Guests", de: "Max. Gäste", tr: "Maks. Davetli" },
        min_guests_label: { en: "Min Guests", de: "Min. Gäste", tr: "Min. Davetli" },

        // Services
        services_label: { en: "Services", de: "Dienstleistungen", tr: "Hizmetler" },
        service_catering: { en: "Catering", de: "Catering", tr: "Catering" },
        service_photography: { en: "Photography", de: "Fotografie", tr: "Fotoğraf" },
        service_organization: { en: "Organization", de: "Organisation", tr: "Organizasyon" },
        service_light_sound: { en: "Light & Sound", de: "Licht & Ton", tr: "Işık & Ses" },
        service_decoration: { en: "Decoration", de: "Dekoration", tr: "Süsleme" },
        service_dj: { en: "DJ", de: "DJ", tr: "DJ" },
        service_live_music: { en: "Live Music", de: "Live-Musik", tr: "Canlı Müzik" },

        // Other Schema Keys (from fetch-schemas.js)
        acc_bouquet: { en: "Bouquet", de: "Brautstrauß", tr: "Çiçek" },
        acc_gloves: { en: "Gloves", de: "Handschuhe", tr: "Eldiven" },
        acc_hair: { en: "Hair Accessories", de: "Haarschmuck", tr: "Saç Aksesuarı" },
        acc_pouch: { en: "Pouch", de: "Beutel", tr: "Kese" },
        acc_shoes: { en: "Shoes", de: "Schuhe", tr: "Ayakkabı" },
        acc_veil: { en: "Veil", de: "Schleier", tr: "Duvak" },
        accessory_services_label: { en: "Accessories", de: "Accessoires", tr: "Aksesuarlar" },
        act_acrobatics: { en: "Acrobatics", de: "Akrobatik", tr: "Akrobasi" },
        act_caricature: { en: "Caricature", de: "Karikatur", tr: "Karikatür" },
        act_comedian: { en: "Comedian", de: "Komiker", tr: "Komedyen" },
        act_dance: { en: "Dance Show", de: "Tanzshow", tr: "Dans Gösterisi" },
        act_fire: { en: "Fire Show", de: "Feuershow", tr: "Ateş Gösterisi" },
        act_fireworks: { en: "Fireworks", de: "Feuerwerk", tr: "Havai Fişek" },
        act_magician: { en: "Magician", de: "Zauberer", tr: "Sihirbaz" },
        act_type_label: { en: "Act Type", de: "Art der Darbietung", tr: "Gösteri Türü" },
        allowed_catering: { en: "Catering Allowed", de: "Catering erlaubt", tr: "Catering Getirilebilir" },
        allowed_organization: { en: "Organization Allowed", de: "Organisation erlaubt", tr: "Organizasyon Getirilebilir" },
        allowed_photography: { en: "Photography Allowed", de: "Fotografie erlaubt", tr: "Fotoğrafçı Getirilebilir" },
        allowed_services_label: { en: "Allowed Services", de: "Erlaubte Dienste", tr: "İzin Verilen Hizmetler" },
        alteration_service_label: { en: "Alteration Service", de: "Änderungsservice", tr: "Tadilat Hizmeti" },
        appointment_required_label: { en: "Appointment Required", de: "Termin erforderlich", tr: "Randevu Gerekli" },
        assistant_included_label: { en: "Assistant Included", de: "Assistent inklusive", tr: "Asistan Dahil" },
        car_boat: { en: "Boat/Yacht", de: "Boot/Yacht", tr: "Tekne/Yat" },
        car_cabrio: { en: "Convertible", de: "Cabrio", tr: "Üstü Açık" },
        car_classic: { en: "Classic Car", de: "Oldtimer", tr: "Klasik Araba" },
        car_helicopter: { en: "Helicopter", de: "Hubschrauber", tr: "Helikopter" },
        car_limo: { en: "Limousine", de: "Limousine", tr: "Limuzin" },
        car_sports: { en: "Sports Car", de: "Sportwagen", tr: "Spor Araba" },
        car_vip_minibus: { en: "VIP Minibus", de: "VIP-Minibus", tr: "VIP Minibüs" },
        car_vosvos: { en: "Beetle (Vosvos)", de: "Käfer", tr: "Vosvos" },
        city_out_label: { en: "Out of City", de: "Außerhalb der Stadt", tr: "Şehir Dışı" },
        concept_bohemian: { en: "Bohemian", de: "Bohemian", tr: "Bohem" },
        concept_classic: { en: "Classic", de: "Klassisch", tr: "Klasik" },
        concept_industrial: { en: "Industrial", de: "Industriell", tr: "Endüstriyel" },
        concept_modern: { en: "Modern", de: "Modern", tr: "Modern" },
        concept_romantic: { en: "Romantic", de: "Romantisch", tr: "Romantik" },
        concept_rustic: { en: "Rustic", de: "Rustikal", tr: "Rustik" },
        concept_vintage: { en: "Vintage", de: "Vintage", tr: "Vintage" },
        concepts_label: { en: "Concepts", de: "Konzepte", tr: "Konseptler" },
        cuisine_kids: { en: "Kids Menu", de: "Kindermenü", tr: "Çocuk Menüsü" },
        cuisine_kosher: { en: "Kosher", de: "Koscher", tr: "Koşer" },
        cuisine_ottoman: { en: "Ottoman", de: "Osmanisch", tr: "Osmanlı Mutfağı" },
        cuisine_turkish: { en: "Turkish", de: "Türkisch", tr: "Türk Mutfağı" },
        cuisine_types_label: { en: "Cuisine Types", de: "Küchenarten", tr: "Mutfak Türleri" },
        cuisine_vegan: { en: "Vegan", de: "Vegan", tr: "Vegan" },
        cuisine_vegetarian: { en: "Vegetarian", de: "Vegetarisch", tr: "Vejetaryen" },
        cuisine_world: { en: "World Cuisine", de: "Internationale Küche", tr: "Dünya Mutfağı" },
        custom_design_label: { en: "Custom Design", de: "Individuelles Design", tr: "Özel Tasarım" },
        decoration_included_label: { en: "Decoration Included", de: "Dekoration inklusive", tr: "Süsleme Dahil" },
        delivery_available_label: { en: "Delivery Available", de: "Lieferung möglich", tr: "Eve Teslim" },
        delivery_setup_available_label: { en: "Delivery & Setup", de: "Lieferung & Aufbau", tr: "Teslimat ve Kurulum" },
        delivery_time_weeks_label: { en: "Delivery Time (Weeks)", de: "Lieferzeit (Wochen)", tr: "Teslim Süresi (Hafta)" },
        demo_available_label: { en: "Demo Available", de: "Demo verfügbar", tr: "Demo İmkanı" },
        demo_table_label: { en: "Demo Table", de: "Demotisch", tr: "Demo Masa" },
        design_service_label: { en: "Design Service", de: "Design-Service", tr: "Tasarım Hizmeti" },
        diet_egg_free: { en: "Egg Free", de: "Eifrei", tr: "Yumurtasız" },
        diet_gluten_free: { en: "Gluten Free", de: "Glutenfrei", tr: "Glutensiz" },
        diet_lactose_free: { en: "Lactose Free", de: "Laktosefrei", tr: "Laktozsuz" },
        diet_sugar_free: { en: "Sugar Free", de: "Zuckerfrei", tr: "Şekersiz" },
        diet_vegan: { en: "Vegan", de: "Vegan", tr: "Vegan" },
        dietary_options_label: { en: "Dietary Options", de: "Diätoptionen", tr: "Diyet Seçenekleri" },
        digital_copy_label: { en: "Digital Copy", de: "Digitale Kopie", tr: "Dijital Kopya" },
        driver_included_label: { en: "Driver Included", de: "Fahrer inklusive", tr: "Şoförlü" },
        duration_minutes_label: { en: "Duration (Minutes)", de: "Dauer (Minuten)", tr: "Süre (Dakika)" },
        equip_dj_booth: { en: "DJ Booth", de: "DJ-Pult", tr: "DJ Kabini" },
        equip_fog: { en: "Fog Machine", de: "Nebelmaschine", tr: "Sis Makinesi" },
        equip_light: { en: "Lighting System", de: "Lichtsystem", tr: "Işık Sistemi" },
        equip_mic: { en: "Microphone", de: "Mikrofon", tr: "Mikrofon" },
        equip_sound: { en: "Sound System", de: "Tonsystem", tr: "Ses Sistemi" },
        equip_stage: { en: "Stage Setup", de: "Bühnenaufbau", tr: "Sahne Kurulumu" },
        equip_truss: { en: "Truss System", de: "Traversensystem", tr: "Truss Sistemi" },
        equipment_label: { en: "Equipment", de: "Ausrüstung", tr: "Ekipman" },
        experience_years_label: { en: "Experience (Years)", de: "Erfahrung (Jahre)", tr: "Tecrübe (Yıl)" },
        feat_boomerang: { en: "Boomerang", de: "Boomerang", tr: "Boomerang" },
        feat_custom_bg: { en: "Custom Background", de: "Individueller Hintergrund", tr: "Özel Arka Plan" },
        feat_gif: { en: "GIF Creation", de: "GIF-Erstellung", tr: "GIF Yapımı" },
        feat_green_screen: { en: "Green Screen", de: "Green Screen", tr: "Green Screen" },
        feat_props: { en: "Props", de: "Requisiten", tr: "Aksesuar" },
        feat_unlimited_print: { en: "Unlimited Prints", de: "Unbegrenzte Ausdrucke", tr: "Sınırsız Baskı" },
        flower_artificial: { en: "Artificial Flowers", de: "Kunstblumen", tr: "Yapay Çiçek" },
        flower_dried: { en: "Dried Flowers", de: "Trockenblumen", tr: "Kuru Çiçek" },
        flower_fresh: { en: "Fresh Flowers", de: "Frische Blumen", tr: "Canlı Çiçek" },
        flower_preserved: { en: "Preserved Flowers", de: "Konservierte Blumen", tr: "Şoklanmış Çiçek" },
        flower_types_label: { en: "Flower Types", de: "Blumenarten", tr: "Çiçek Türleri" },
        genre_80s: { en: "80s", de: "80er", tr: "80'ler" },
        genre_90s: { en: "90s", de: "90er", tr: "90'lar" },
        genre_classic: { en: "Classical", de: "Klassik", tr: "Klasik" },
        genre_electronic: { en: "Electronic", de: "Elektronisch", tr: "Elektronik" },
        genre_foreign: { en: "Foreign Music", de: "Ausländische Musik", tr: "Yabancı Müzik" },
        genre_foreign_pop: { en: "Foreign Pop", de: "Ausländischer Pop", tr: "Yabancı Pop" },
        genre_hiphop: { en: "Hip Hop", de: "Hip Hop", tr: "Hip Hop" },
        genre_house: { en: "House", de: "House", tr: "House" },
        genre_jazz: { en: "Jazz", de: "Jazz", tr: "Caz" },
        genre_local: { en: "Local Music", de: "Lokale Musik", tr: "Yöresel Müzik" },
        genre_pop: { en: "Pop", de: "Pop", tr: "Pop" },
        genre_rnb: { en: "R&B", de: "R&B", tr: "R&B" },
        genre_rock: { en: "Rock", de: "Rock", tr: "Rock" },
        genre_techno: { en: "Techno", de: "Techno", tr: "Tekno" },
        genre_turkish_pop: { en: "Turkish Pop", de: "Türkischer Pop", tr: "Türkçe Pop" },
        lang_english: { en: "English", de: "Englisch", tr: "İngilizce" },
        lang_french: { en: "French", de: "Französisch", tr: "Fransızca" },
        lang_german: { en: "German", de: "Deutsch", tr: "Almanca" },
        lang_spanish: { en: "Spanish", de: "Spanisch", tr: "İspanyolca" },
        lang_turkish: { en: "Turkish", de: "Türkisch", tr: "Türkçe" },
        languages_label: { en: "Languages", de: "Sprachen", tr: "Diller" },
        loc_home_hotel: { en: "Home/Hotel Service", de: "Haus/Hotel-Service", tr: "Evde/Otelde" },
        loc_out_city: { en: "Out of City", de: "Außerhalb der Stadt", tr: "Şehir Dışı" },
        loc_salon: { en: "At Salon", de: "Im Salon", tr: "Salonda" },
        maintenance_service_label: { en: "Maintenance Service", de: "Wartungsservice", tr: "Bakım Hizmeti" },
        mat_brilliant: { en: "Brilliant", de: "Brillant", tr: "Pırlanta" },
        mat_diamond: { en: "Diamond", de: "Diamant", tr: "Elmas" },
        mat_gold_rose: { en: "Rose Gold", de: "Roségold", tr: "Rose Altın" },
        mat_gold_white: { en: "White Gold", de: "Weißgold", tr: "Beyaz Altın" },
        mat_gold_yellow: { en: "Yellow Gold", de: "Gelbgold", tr: "Sarı Altın" },
        mat_platinum: { en: "Platinum", de: "Platin", tr: "Platin" },
        mat_silver: { en: "Silver", de: "Silber", tr: "Gümüş" },
        material_label: { en: "Material", de: "Material", tr: "Materyal" },
        meeting_count_label: { en: "Meeting Count", de: "Anzahl der Treffen", tr: "Görüşme Sayısı" },
        min_order_quantity_label: { en: "Min Order Quantity", de: "Mindestbestellmenge", tr: "Min. Sipariş Adedi" },
        min_rental_hours_label: { en: "Min Rental Hours", de: "Mindestmietdauer", tr: "Min. Kiralama Süresi" },
        music_genres_label: { en: "Music Genres", de: "Musikgenres", tr: "Müzik Türleri" },
        orchestra_size_label: { en: "Orchestra Size", de: "Orchestergröße", tr: "Orkestra Kişi Sayısı" },
        perf_band: { en: "Live Band", de: "Live-Band", tr: "Canlı Müzik Grubu" },
        perf_dj: { en: "DJ", de: "DJ", tr: "DJ" },
        perf_duo: { en: "Duo", de: "Duo", tr: "Duo" },
        perf_fasil: { en: "Fasil Group", de: "Fasil-Gruppe", tr: "Fasıl Grubu" },
        perf_orchestra: { en: "Orchestra", de: "Orchester", tr: "Orkestra" },
        perf_solist: { en: "Soloist", de: "Solist", tr: "Solist" },
        perf_trio: { en: "Trio", de: "Trio", tr: "Trio" },
        performance_duration_label: { en: "Performance Duration", de: "Auftrittsdauer", tr: "Performans Süresi" },
        performance_type_label: { en: "Performance Type", de: "Auftrittsart", tr: "Performans Türü" },
        print_size_label: { en: "Print Size", de: "Druckgröße", tr: "Baskı Boyutu" },
        prod_bowtie: { en: "Bowtie", de: "Fliege", tr: "Papyon" },
        prod_bracelet: { en: "Bracelet", de: "Armband", tr: "Bileklik" },
        prod_candy: { en: "Wedding Candy", de: "Hochzeitsbonbons", tr: "Nikah Şekeri" },
        prod_candy_buffet: { en: "Candy Buffet", de: "Süßigkeitenbuffet", tr: "Şeker Büfesi" },
        prod_cufflinks: { en: "Cufflinks", de: "Manschettenknöpfe", tr: "Kol Düğmesi" },
        prod_cupcake: { en: "Cupcakes", de: "Cupcakes", tr: "Cupcake" },
        prod_earrings: { en: "Earrings", de: "Ohrringe", tr: "Küpe" },
        prod_engagement_cake: { en: "Engagement Cake", de: "Verlobungstorte", tr: "Nişan Pastası" },
        prod_five_stone: { en: "Five Stone", de: "Fünf Steine", tr: "Beştaş" },
        prod_gift: { en: "Gifts", de: "Gastgeschenke", tr: "Hediyelik" },
        prod_groom_suit: { en: "Groom Suit", de: "Bräutigamanzug", tr: "Damatlık" },
        prod_guestbook: { en: "Guestbook", de: "Gästebuch", tr: "Anı Defteri" },
        prod_invitation: { en: "Invitations", de: "Einladungen", tr: "Davetiye" },
        prod_macaron: { en: "Macarons", de: "Macarons", tr: "Makaron" },
        prod_menu_card: { en: "Menu Cards", de: "Menükarten", tr: "Menü Kartı" },
        prod_necklace: { en: "Necklace", de: "Halskette", tr: "Kolye" },
        prod_shirt: { en: "Shirt", de: "Hemd", tr: "Gömlek" },
        prod_shoes: { en: "Shoes", de: "Schuhe", tr: "Ayakkabı" },
        prod_solitaire: { en: "Solitaire", de: "Solitär", tr: "Tektaş" },
        prod_table_card: { en: "Table Cards", de: "Tischkarten", tr: "Masa Kartı" },
        prod_tailcoat: { en: "Tailcoat", de: "Frack", tr: "Frak" },
        prod_tuxedo: { en: "Tuxedo", de: "Smoking", tr: "Smokin" },
        prod_watch: { en: "Watch", de: "Uhr", tr: "Saat" },
        prod_wedding_cake: { en: "Wedding Cake", de: "Hochzeitstorte", tr: "Düğün Pastası" },
        prod_wedding_ring: { en: "Wedding Rings", de: "Eheringe", tr: "Alyans" },
        prod_welcome_board: { en: "Welcome Board", de: "Willkommensschild", tr: "Karşılama Panosu" },
        products_label: { en: "Products", de: "Produkte", tr: "Ürünler" },
        rehearsal_available_label: { en: "Rehearsal Available", de: "Probe verfügbar", tr: "Prova İmkanı" },
        rehearsals_label: { en: "Rehearsals", de: "Proben", tr: "Provalar" },
        req_backstage: { en: "Backstage", de: "Backstage", tr: "Kulis" },
        req_high_ceiling: { en: "High Ceiling", de: "Hohe Decke", tr: "Yüksek Tavan" },
        req_sound: { en: "Sound System", de: "Tonsystem", tr: "Ses Sistemi" },
        req_stage: { en: "Stage", de: "Bühne", tr: "Sahne" },
        requirements_label: { en: "Requirements", de: "Anforderungen", tr: "Gereksinimler" },
        service_4k: { en: "4K Recording", de: "4K-Aufnahme", tr: "4K Çekim" },
        service_aisle: { en: "Aisle Decoration", de: "Gang-Dekoration", tr: "Gelin Yolu" },
        service_album_print: { en: "Album Printing", de: "Albumdruck", tr: "Albüm Baskı" },
        service_altar: { en: "Altar/Arch", de: "Altar/Bogen", tr: "Nikah Kürsüsü/Tak" },
        service_artist: { en: "Artist Booking", de: "Künstlerbuchung", tr: "Sanatçı Temini" },
        service_barkovision: { en: "Barkovision", de: "Barkovision", tr: "Barkovizyon" },
        service_beverage: { en: "Beverage Service", de: "Getränkeservice", tr: "İçecek Servisi" },
        service_boutonniere: { en: "Boutonniere", de: "Ansteckblume", tr: "Yaka Çiçeği" },
        service_bridal_bouquet: { en: "Bridal Bouquet", de: "Brautstrauß", tr: "Gelin Buketi" },
        service_bridal_hair: { en: "Bridal Hair", de: "Brautfrisur", tr: "Gelin Saçı" },
        service_cake_cutting: { en: "Cake Cutting", de: "Tortenanschnitt", tr: "Pasta Kesimi" },
        service_car_decor: { en: "Car Decoration", de: "Autoschmuck", tr: "Araç Süslemesi" },
        service_custom_text: { en: "Custom Speech", de: "Individuelle Rede", tr: "Kişiye Özel Metin" },
        service_digital: { en: "Digital Delivery", de: "Digitale Lieferung", tr: "Dijital Teslim" },
        service_drone: { en: "Drone Shooting", de: "Drohnenaufnahme", tr: "Drone Çekimi" },
        service_editing: { en: "Video Editing", de: "Videobearbeitung", tr: "Kurgu/Montaj" },
        service_equipment: { en: "Equipment Rental", de: "Ausrüstungsverleih", tr: "Ekipman Kiralama" },
        service_fireworks: { en: "Fireworks", de: "Feuerwerk", tr: "Havai Fişek" },
        service_flowers: { en: "Floristry", de: "Floristik", tr: "Çiçek" },
        service_full_day: { en: "Full Day Coverage", de: "Ganztagesbegleitung", tr: "Tüm Gün Çekim" },
        service_haute_couture: { en: "Haute Couture", de: "Haute Couture", tr: "Haute Couture" },
        service_jimmy_jib: { en: "Jimmy Jib", de: "Jimmy Jib", tr: "Jimmy Jib" },
        service_lashes: { en: "Eyelashes", de: "Wimpern", tr: "Takma Kirpik" },
        service_location_label: { en: "Service Location", de: "Serviceort", tr: "Hizmet Yeri" },
        service_makeup: { en: "Make-Up", de: "Make-Up", tr: "Makyaj" },
        service_manicure: { en: "Manicure/Pedicure", de: "Maniküre/Pediküre", tr: "Manikür/Pedikür" },
        service_massage: { en: "Massage", de: "Massage", tr: "Masaj" },
        service_menu_tasting: { en: "Menu Tasting", de: "Menüverkostung", tr: "Menü Tadımı" },
        service_ready_made: { en: "Ready Made", de: "Konfektion", tr: "Hazır Giyim" },
        service_rental: { en: "Rental", de: "Verleih", tr: "Kiralama" },
        service_rsvp: { en: "RSVP Management", de: "Gästemanagement", tr: "LCV Hizmeti" },
        service_skincare: { en: "Skincare", de: "Hautpflege", tr: "Cilt Bakımı" },
        service_social_clip: { en: "Social Media Clip", de: "Social Media Clip", tr: "Sosyal Medya Klibi" },
        service_story_writing: { en: "Story Writing", de: "Geschichtenschreiben", tr: "Hikaye Yazımı" },
        service_symbolic: { en: "Symbolic Ceremony", de: "Symbolische Zeremonie", tr: "Sembolik Nikah" },
        service_table_chair: { en: "Table & Chair Rental", de: "Tisch- & Stuhlverleih", tr: "Masa Sandalye Kiralama" },
        service_table_decor: { en: "Table Decoration", de: "Tischdekoration", tr: "Masa Süslemesi" },
        service_type_label: { en: "Service Type", de: "Serviceart", tr: "Hizmet Tipi" },
        service_venue_decor: { en: "Venue Decoration", de: "Location-Dekoration", tr: "Mekan Süslemesi" },
        service_video_clip: { en: "Video Clip", de: "Videoclip", tr: "Video Klip" },
        service_vow_renewal: { en: "Vow Renewal", de: "Erneuerung des Eheversprechens", tr: "Nikah Tazeleme" },
        service_waiters: { en: "Waiters", de: "Kellner", tr: "Servis Elemanı" },
        service_waxing: { en: "Waxing", de: "Waxing", tr: "Ağda" },
        shoot_catalog: { en: "Catalog Shoot", de: "Katalogaufnahme", tr: "Katalog Çekimi" },
        shoot_clip: { en: "Video Clip", de: "Videoclip", tr: "Video Klip" },
        shoot_documentary: { en: "Documentary", de: "Dokumentarisch", tr: "Belgesel Tadında" },
        shoot_engagement: { en: "Engagement Shoot", de: "Verlobungsshooting", tr: "Nişan Çekimi" },
        shoot_save_the_date: { en: "Save the Date", de: "Save the Date", tr: "Save the Date" },
        shoot_story: { en: "Wedding Story", de: "Hochzeitsgeschichte", tr: "Düğün Hikayesi" },
        shoot_studio: { en: "Studio Shoot", de: "Studioaufnahme", tr: "Stüdyo Çekimi" },
        shoot_teaser: { en: "Teaser", de: "Teaser", tr: "Teaser" },
        shoot_trashday: { en: "Trash the Dress", de: "Trash the Dress", tr: "Trash the Dress" },
        shooting_types_label: { en: "Shooting Types", de: "Aufnahmearten", tr: "Çekim Türleri" },
        size_10x15: { en: "10x15 cm", de: "10x15 cm", tr: "10x15 cm" },
        size_polaroid: { en: "Polaroid", de: "Polaroid", tr: "Polaroid" },
        size_strip: { en: "Photo Strip", de: "Fotostreifen", tr: "Şerit Fotoğraf" },
        start_price_label: { en: "Starting Price", de: "Startpreis", tr: "Başlangıç Fiyatı" },
        tasting_available_label: { en: "Tasting Available", de: "Verkostung möglich", tr: "Tadım İmkanı" },
        team_capacity_label: { en: "Team Capacity", de: "Teamkapazität", tr: "Ekip Kapasitesi" },
        team_size_label: { en: "Team Size", de: "Teamgröße", tr: "Ekip Sayısı" },
        vehicle_types_label: { en: "Vehicle Types", de: "Fahrzeugtypen", tr: "Araç Türleri" },
        venue_type_label: { en: "Venue Type", de: "Location-Typ", tr: "Mekan Tipi" },
        view_bosphorus: { en: "Bosphorus View", de: "Bosporus-Blick", tr: "Boğaz Manzaralı" },
        view_city: { en: "City View", de: "Stadtblick", tr: "Şehir Manzaralı" },
        view_forest: { en: "Forest View", de: "Waldblick", tr: "Orman Manzaralı" },
        view_historic: { en: "Historic View", de: "Historische Aussicht", tr: "Tarihi Manzara" },
        view_label: { en: "View", de: "Aussicht", tr: "Manzara" },
        view_lake: { en: "Lake View", de: "Seeblick", tr: "Göl Manzaralı" },
        view_nature: { en: "Nature View", de: "Naturblick", tr: "Doğa Manzaralı" },
        view_sea: { en: "Sea View", de: "Meerblick", tr: "Deniz Manzaralı" }
    },
    messages: {
        myMessages: {
            en: "My Messages",
            de: "Meine Nachrichten",
            tr: "Mesajlarım"
        },
        myRequests: {
            en: "My Requests",
            de: "Meine Anfragen",
            tr: "Taleplerim"
        },
        startMessage: {
            en: "Start messaging...",
            de: "Beginnen Sie mit dem Nachrichtenaustausch...",
            tr: "Mesajlaşmaya başlayın..."
        },
        typePlaceholder: {
            en: "Write your message...",
            de: "Schreiben Sie Ihre Nachricht...",
            tr: "Mesajınızı yazın..."
        },
        noRequests: {
            en: "No messages yet.",
            de: "Noch keine Nachrichten.",
            tr: "Henüz mesajınız yok."
        },
        selectConversation: {
            en: "Select a conversation",
            de: "Wählen Sie eine Unterhaltung",
            tr: "Bir konuşma seçin"
        },
        weddingDate: {
            en: "Wedding Date",
            de: "Hochzeitsdatum",
            tr: "Düğün Tarihi"
        },
        notSpecified: {
            en: "Not Specified",
            de: "Nicht angegeben",
            tr: "Belirtilmemiş"
        },
        loading: {
            en: "Loading...",
            de: "Laden...",
            tr: "Yükleniyor..."
        },
        send: {
            en: "Send",
            de: "Senden",
            tr: "Gönder"
        },
        sendError: {
            en: "Message could not be sent",
            de: "Nachricht konnte nicht gesendet werden",
            tr: "Mesaj gönderilemedi"
        },
        statusNew: {
            en: "New",
            de: "Neu",
            tr: "Yeni"
        },
        search: {
            en: "Search messages...",
            de: "Nachrichten suchen...",
            tr: "Mesajlarda ara..."
        },
        noSelection: {
            en: "Select a conversation to start messaging",
            de: "Wählen Sie eine Unterhaltung, um zu beginnen",
            tr: "Mesajlaşmaya başlamak için bir konuşma seçin"
        }
    },
    blog: {
        readMore: {
            en: "Read More",
            de: "Weiterlesen",
            tr: "Devamını Oku"
        }
    },
    nav_2: {
        services: { en: "Services", de: "Dienstleister", tr: "Hizmetler" },
        tools: { en: "Planning Tools", de: "Planungstools", tr: "Planlama Araçları" },
        vendorJoin: { en: "For Vendors", de: "Für Dienstleister", tr: "Tedarikçiler İçin" },
        dashboard: { en: "Dashboard", de: "Dashboard", tr: "Panel" },
        logout: { en: "Logout", de: "Abmelden", tr: "Çıkış Yap" },
        messages: { en: "Messages", de: "Nachrichten", tr: "Mesajlarım" },
        registerBtn: { en: "Sign Up", de: "Registrieren", tr: "Kayıt Ol" }
    },
    schemas_4: {
        enstrumanlar_label: {
            en: "Instruments / Team Type",
            de: "Instrumente / Team-Typ",
            tr: "Enstrümanlar / Ekip Tipi"
        },
        instr_davul_zurna: {
            en: "Davul & Zurna",
            de: "Davul & Zurna (Trommel & Flöte)",
            tr: "Davul Zurna"
        },
        instr_solist: {
            en: "Soloist",
            de: "Solist",
            tr: "Solist"
        },
        instr_bendir: {
            en: "Bendir",
            de: "Bendir",
            tr: "Bendir"
        },
        instr_darbuka: {
            en: "Darbuka",
            de: "Darbuka",
            tr: "Darbuka"
        },
        instr_baglama: {
            en: "Baglama / Saz",
            de: "Baglama / Saz",
            tr: "Bağlama / Saz"
        },
        instr_ud: {
            en: "Oud",
            de: "Oud",
            tr: "Ud (Oud)"
        },
        instr_kanun: {
            en: "Kanun",
            de: "Kanun (Zither)",
            tr: "Kanun"
        },
        music_genres_label: {
            en: "Music Genres",
            de: "Musikrichtungen",
            tr: "Müzik Türleri"
        },
        genre_pop: { en: "Pop", de: "Pop", tr: "Pop" },
        genre_turkish_pop: { en: "Turkish Pop", de: "Türkisch Pop", tr: "Türkçe Pop" },
        genre_halay: { en: "Halay / Folk", de: "Halay / Volksmusik", tr: "Halay / Oyun Havası" },
        genre_arabesque: { en: "Arabesque", de: "Arabesque", tr: "Arabesk" },
        genre_classical: { en: "Classical", de: "Klassik", tr: "Klasik" },
        genre_jazz: { en: "Jazz", de: "Jazz", tr: "Caz" },
        genre_rock: { en: "Rock", de: "Rock", tr: "Rock" },
        genre_folk: { en: "Folk", de: "Volksmusik", tr: "Halk Müziği" },
        instr_dj: { en: "DJ", de: "DJ", tr: "DJ" },
        instr_quartet: { en: "Quartet", de: "Quartett", tr: "Quartet" },
        instr_trio: { en: "Trio", de: "Trio", tr: "Trio" },
        instr_bando: { en: "Marching Band", de: "Blaskapelle", tr: "Bando" },
        // Photographer Schema Translations
        photo_services_label: {
            en: "Services Offered",
            de: "Angebotene Dienstleistungen",
            tr: "Sunulan Hizmetler"
        },
        photo_service_story: {
            en: "Wedding Story (Full Day)",
            de: "Hochzeitsreportage (Ganztags)",
            tr: "Düğün Hikayesi"
        },
        photo_service_save_date: {
            en: "Save the Date",
            de: "Save the Date Shooting",
            tr: "Save the Date"
        },
        photo_service_trash_dress: {
            en: "Trash the Dress",
            de: "Trash the Dress",
            tr: "Trash the Dress"
        },
        photo_service_drone: {
            en: "Drone Shooting",
            de: "Drohnenaufnahmen",
            tr: "Drone Çekimi"
        },
        photo_service_album: {
            en: "Album / Print",
            de: "Album / Druck",
            tr: "Albüm / Baskı"
        },
        photo_service_digital: {
            en: "Digital Delivery",
            de: "Digitale Lieferung",
            tr: "Dijital Teslim"
        },
        photo_service_jimmy_jib: {
            en: "Jimmy Jib",
            de: "Jimmy Jib",
            tr: "Jimmy Jib"
        },
        photo_service_studio: {
            en: "Studio Shooting",
            de: "Studioaufnahme",
            tr: "Stüdyo Çekimi"
        },
        photo_shooting_types_label: {
            en: "Shooting Style",
            de: "Aufnahmestil",
            tr: "Çekim Türleri"
        },
        shoot_documentary: {
            en: "Documentary",
            de: "Dokumentarisch",
            tr: "Belgesel / Doğal"
        },
        shoot_story: {
            en: "Storytelling",
            de: "Storytelling",
            tr: "Hikaye Anlatımı"
        },
        shoot_catalog: {
            en: "Catalog / Fashion",
            de: "Katalog / Fashion",
            tr: "Katalog / Moda"
        },
        shoot_concept: {
            en: "Concept",
            de: "Konzept",
            tr: "Konsept Çekim"
        },
        shoot_engagement: {
            en: "Engagement",
            de: "Verlobung",
            tr: "Nişan Çekimi"
        },
        shoot_classic: {
            en: "Classic",
            de: "Klassisch",
            tr: "Klasik"
        },
        photo_team_size_label: {
            en: "Team Size",
            de: "Teamgröße",
            tr: "Ekip Büyüklüğü"
        },
        team_size_1: {
            en: "1 Photographer",
            de: "1 Fotograf",
            tr: "1 Fotoğrafçı"
        },
        team_size_2: {
            en: "2 Photographers",
            de: "2 Fotografen",
            tr: "2 Fotoğrafçı"
        },
        team_size_3: {
            en: "3 Photographers",
            de: "3 Fotografen",
            tr: "3 Fotoğrafçı"
        },
        team_size_4_plus: {
            en: "4+ Photographers",
            de: "4+ Fotografen",
            tr: "4+ Fotoğrafçı"
        },
        photo_delivery_time_label: {
            en: "Delivery Time",
            de: "Lieferzeit",
            tr: "Teslim Süresi"
        },
        delivery_2_weeks: {
            en: "2 Weeks",
            de: "2 Wochen",
            tr: "2 Hafta"
        },
        delivery_4_weeks: {
            en: "4 Weeks",
            de: "4 Wochen",
            tr: "4 Hafta"
        },
        delivery_8_weeks: {
            en: "8 Weeks",
            de: "8 Wochen",
            tr: "8 Hafta"
        },
        delivery_3_months: {
            en: "3 Months",
            de: "3 Monate",
            tr: "3 Ay"
        },
        // Videography Schema
        video_services_label: { en: "Services Offered", de: "Dienstleistungen", tr: "Sunulan Hizmetler" },
        video_service_drone: { en: "Drone Recording", de: "Drohnenaufnahme", tr: "Drone Çekimi" },
        video_service_story: { en: "Wedding Story", de: "Hochzeitsstory", tr: "Düğün Hikayesi" },
        video_service_save_date: { en: "Save the Date", de: "Save the Date", tr: "Save the Date" },
        video_service_clip: { en: "Wedding Clip (Highlight)", de: "Hochzeitsclip (Highlight)", tr: "Düğün Klibi" },
        video_service_4k: { en: "4K Recording", de: "4K Aufnahme", tr: "4K Çekim" },
        video_service_jimmy_jib: { en: "Jimmy Jib", de: "Jimmy Jib", tr: "Jimmy Jib" },
        video_service_live_stream: { en: "Live Stream", de: "Live-Übertragung", tr: "Canlı Yayın" },
        video_shooting_types_label: { en: "Shooting Types", de: "Aufnahmearten", tr: "Çekim Türleri" },
        shoot_music_clip: { en: "Music Clip", de: "Musikclip", tr: "Müzik Klibi" },
        shoot_short_film: { en: "Short Film", de: "Kurzfilm", tr: "Kısa Film" },
        video_delivery_options_label: { en: "Delivery Format", de: "Lieferformat", tr: "Teslimat Formatı" },
        delivery_usb: { en: "USB / Hard Drive", de: "USB / Festplatte", tr: "USB / Hard Disk" },
        delivery_digital: { en: "Digital Cloud", de: "Digitale Cloud", tr: "Dijital Bulut" },
        delivery_bluray: { en: "Blu-ray / DVD", de: "Blu-ray / DVD", tr: "Blu-ray / DVD" },
        video_team_size_label: { en: "Videographer Count", de: "Anzahl Videoteam", tr: "Kameraman Sayısı" },
        video_delivery_time_label: { en: "Delivery Time", de: "Lieferzeit", tr: "Teslim Süresi" },

        // Hair & Makeup Schema
        beauty_services_label: { en: "Services", de: "Dienstleistungen", tr: "Hizmetler" },
        beauty_service_bridal_hair: { en: "Bridal Hair", de: "Brautfrisur", tr: "Gelin Başı" },
        beauty_service_bridal_makeup: { en: "Bridal Makeup", de: "Braut Make-up", tr: "Gelin Makyajı" },
        beauty_service_trial: { en: "Trial Session", de: "Probetermin", tr: "Prova" },
        beauty_service_gel_nails: { en: "Gel Nails", de: "Gelnägel", tr: "Jel Tırnak" },
        beauty_service_manicure_pedicure: { en: "Manicure / Pedicure", de: "Maniküre / Pediküre", tr: "Manikür / Pedikür" },
        beauty_service_waxing: { en: "Waxing", de: "Waxing (Haarentfernung)", tr: "Ağda" },
        beauty_service_guests: { en: "Guest Hair & Makeup", de: "Gäste Styling", tr: "Toplu Saç/Makyaj" },
        beauty_features_label: { en: "Features", de: "Inklusivleistungen", tr: "İmkanlar" },
        beauty_feature_home_service: { en: "Home / Hotel Service", de: "Haus / Hotel Service", tr: "Eve/Otele Servis" },
        beauty_feature_city_wide: { en: "City-wide Service", de: "Stadtweiter Service", tr: "Şehir Geneli Hizmet" },
        beauty_feature_group_discount: { en: "Group Discount", de: "Gruppenrabatt", tr: "Grup İndirimi" },
        beauty_brands_label: { en: "Brands Used", de: "Verwendete Marken", tr: "Kullanılan Markalar" },

        // Venues Schema
        venue_type_label: { en: "Venue Type", de: "Location Art", tr: "Mekan Tipi" },
        venue_type_hotel: { en: "Hotel", de: "Hotel", tr: "Otel" },
        venue_type_garden: { en: "Country Garden", de: "Landgarten / Freiluft", tr: "Kır Bahçesi" },
        venue_type_ballroom: { en: "Ballroom", de: "Ballsaal", tr: "Davet Alanı / Salon" },
        venue_type_restaurant: { en: "Restaurant", de: "Restaurant", tr: "Restoran" },
        venue_type_historical: { en: "Historical Venue", de: "Historische Location", tr: "Tarihi Mekan" },
        venue_type_boat: { en: "Boat / Yacht", de: "Schiff / Yacht", tr: "Tekne / Yat" },
        venue_type_social_facility: { en: "Social Facility", de: "Soziale Einrichtung", tr: "Sosyal Tesis" },
        venue_features_label: { en: "Amenities", de: "Ausstattung", tr: "İmkanlar" },
        venue_feature_alcohol: { en: "Alcohol Service", de: "Alkohol Ausschank", tr: "Alkol Servisi" },
        venue_feature_catering: { en: "In-house Catering", de: "Internes Catering", tr: "Yemek Servisi" },
        venue_feature_cocktail: { en: "Cocktail Area", de: "Cocktail Bereich", tr: "Kokteyl Alanı" },
        venue_feature_after_party: { en: "After Party Area", de: "After Party Bereich", tr: "After Party Alanı" },
        venue_feature_valet: { en: "Valet Service", de: "Valet Service", tr: "Vale Hizmeti" },
        venue_feature_disabled_access: { en: "Disabled Access", de: "Barrierefrei", tr: "Engelli Girişi" },
        venue_feature_accommodation: { en: "Accommodation", de: "Übernachtung", tr: "Konaklama" },
        venue_view_label: { en: "View", de: "Aussicht", tr: "Manzara" },
        venue_view_sea: { en: "Sea View", de: "Meerblick", tr: "Deniz Manzaralı" },
        venue_view_forest: { en: "Forest View", de: "Waldblick", tr: "Orman Manzaralı" },
        venue_view_city: { en: "City View", de: "Stadtblick", tr: "Şehir Manzaralı" },
        venue_view_garden: { en: "Garden View", de: "Gartenblick", tr: "Bahçe Manzaralı" },
        venue_view_lake: { en: "Lake View", de: "Seeblick", tr: "Göl Manzaralı" },
        venue_capacity_cocktail_label: { en: "Cocktail Capacity", de: "Cocktail Kapazität", tr: "Kokteyl Kapasitesi" },
        venue_capacity_dinner_label: { en: "Dinner Capacity", de: "Dinner Kapazität", tr: "Yemekli Kapasite" },

        // Planner Schema
        planner_services_label: { en: "Planning Services", de: "Planungsleistungen", tr: "Planlama Hizmetleri" },
        planner_service_decoration: { en: "Decoration", de: "Dekoration", tr: "Dekorasyon" },
        planner_service_catering_coord: { en: "Catering Coordination", de: "Catering Koordination", tr: "Catering Yönetimi" },
        planner_service_music_coord: { en: "Music Coordination", de: "Musik Koordination", tr: "Müzik Yönetimi" },
        planner_service_photo_coord: { en: "Photo/Video Coordination", de: "Foto/Video Koordination", tr: "Foto/Video Yönetimi" },
        planner_service_guest_welcoming: { en: "Guest Welcoming", de: "Gästeempfang", tr: "Misafir Karşılama" },
        planner_service_concept_design: { en: "Concept Design", de: "Konzept Design", tr: "Konsept Tasarımı" },
        planner_service_fireworks: { en: "Fireworks", de: "Feuerwerk", tr: "Havai Fişek" },
        planner_service_henna: { en: "Henna Night", de: "Henna Nacht", tr: "Kına Gecesi" },
        planner_extras_label: { en: "Extras", de: "Extras", tr: "Ekstralar" },
        planner_extra_candy_bar: { en: "Candy Bar", de: "Candy Bar", tr: "Şeker Büfesi" },
        planner_extra_limousine: { en: "Limousine Service", de: "Limousinen Service", tr: "Limuzin Kiralama" },
        planner_extra_city_tour: { en: "City Tour", de: "Stadtrundfahrt", tr: "Şehir Turu" },

        // Catering Schema
        catering_cuisines_label: { en: "Cuisines", de: "Küche", tr: "Mutfaklar" },
        cuisine_turkish: { en: "Turkish", de: "Türkisch", tr: "Türk Mutfağı" },
        cuisine_international: { en: "International", de: "International", tr: "Dünya Mutfağı" },
        cuisine_mediterranean: { en: "Mediterranean", de: "Mediterran", tr: "Akdeniz Mutfağı" },
        cuisine_asian: { en: "Asian", de: "Asiatisch", tr: "Asya Mutfağı" },
        cuisine_vegetarian: { en: "Vegetarian", de: "Vegetarisch", tr: "Vejetaryen" },
        cuisine_vegan: { en: "Vegan", de: "Vegan", tr: "Vegan" },
        catering_features_label: { en: "Services", de: "Service", tr: "Hizmetler" },
        catering_menu_tasting: { en: "Menu Tasting", de: "Probeessen", tr: "Menü Tadımı" },
        catering_menu_customization: { en: "Custom Menus", de: "Individuelle Menüs", tr: "Menü Değişikliği" },
        catering_service_staff: { en: "Service Staff", de: "Servicepersonal", tr: "Servis Personeli" },
        catering_equipment_rental: { en: "Equipment Rental", de: "Ausrüstungsverleih", tr: "Ekipman Kiralama" },

        instr_cumbus: {
            en: "Cumbus",
            de: "Cümbüş",
            tr: "Cümbüş"
        },
        instr_tanbur: {
            en: "Tanbur",
            de: "Tanbur",
            tr: "Tanbur"
        },
        instr_ney: {
            en: "Ney",
            de: "Ney (Rohrflöte)",
            tr: "Ney"
        },
        instr_mey: {
            en: "Mey",
            de: "Mey",
            tr: "Mey"
        },
        instr_kaval: {
            en: "Kaval",
            de: "Kaval",
            tr: "Kaval"
        },
        instr_sipsi: {
            en: "Sipsi",
            de: "Sipsi",
            tr: "Sipsi"
        },
        instr_keyboard: {
            en: "Keyboard",
            de: "Keyboard",
            tr: "Klavye / Keyboard"
        },
        instr_orkestra: {
            en: "Orchestra (Band)",
            de: "Orchester (Band)",
            tr: "Orkestra (Grup)"
        },
    }
};

// Merge duplicate sections to fix lost keys
try {
    if (dictionary.schemas_2) { Object.assign(dictionary.schemas, dictionary.schemas_2); delete dictionary.schemas_2; }
    if (dictionary.schemas_3) { Object.assign(dictionary.schemas, dictionary.schemas_3); delete dictionary.schemas_3; }
    if (dictionary.schemas_4) { Object.assign(dictionary.schemas, dictionary.schemas_4); delete dictionary.schemas_4; }

    // Merge nav
    if (dictionary.nav_2) {
        Object.assign(dictionary.nav, dictionary.nav_2);
        delete dictionary.nav_2;
    }
} catch (e) {
    console.error('Dictionary merge error', e);
}

dictionary.community = community;



dictionary.onlineCounter = {
    text: { en: "couples planning their wedding right now", de: "Paare planen gerade ihre Hochzeit", tr: "çift şu an düğününü planlıyor" }
};

// Shop Module Translations
dictionary.shop = {
    title: { en: "Shop", de: "Shop", tr: "Mağaza" },
    subtitle: { en: "Product Recommendations", de: "Produktempfehlungen", tr: "Ürün Önerileri" },
    categories: { en: "Categories", de: "Kategorien", tr: "Kategoriler" },
    allProducts: { en: "All Products", de: "Alle Produkte", tr: "Tüm Ürünler" },
    products: { en: "Products", de: "Produkte", tr: "Ürünler" },
    productCount: { en: "products", de: "Produkte", tr: "ürün" },

    // Product Types
    productType: {
        boutique: { en: "Boutique Collection", de: "Boutique Kollektion", tr: "Butik Koleksiyon" },
        vendor: { en: "Vendor Product", de: "Anbieterprodukt", tr: "Tedarikçi Ürünü" },
        amazon: { en: "Amazon Product", de: "Amazon Produkt", tr: "Amazon Ürünü" }
    },

    // Buttons
    viewOnAmazon: { en: "View on Amazon", de: "Auf Amazon ansehen", tr: "Amazon'da Gör" },
    contact: { en: "Contact", de: "Kontakt aufnehmen", tr: "İletişime Geç" },
    viewVendor: { en: "View Vendor", de: "Anbieter ansehen", tr: "Tedarikçiye Git" },
    getQuote: { en: "Get Quote", de: "Angebot anfordern", tr: "Teklif Al" },

    // Share
    share: { en: "Share", de: "Teilen", tr: "Paylaş" },
    shareOnFacebook: { en: "Share on Facebook", de: "Auf Facebook teilen", tr: "Facebook'ta Paylaş" },
    shareOnWhatsapp: { en: "Share on WhatsApp", de: "Auf WhatsApp teilen", tr: "WhatsApp'ta Paylaş" },
    copyLink: { en: "Copy Link", de: "Link kopieren", tr: "Linki Kopyala" },
    linkCopied: { en: "Link copied!", de: "Link kopiert!", tr: "Link kopyalandı!" },

    // Price
    price: { en: "Price", de: "Preis", tr: "Fiyat" },
    priceOnRequest: { en: "Price on request", de: "Preis auf Anfrage", tr: "Fiyat için iletişime geçin" },

    // Contact Modal
    contactModal: {
        title: { en: "Contact About Product", de: "Produkt anfragen", tr: "Ürün Hakkında İletişim" },
        productLabel: { en: "Product", de: "Produkt", tr: "Ürün" },
        nameLabel: { en: "Your Name", de: "Ihr Name", tr: "Adınız" },
        emailLabel: { en: "Email", de: "E-Mail", tr: "E-posta" },
        phoneLabel: { en: "Phone (optional)", de: "Telefon (optional)", tr: "Telefon (opsiyonel)" },
        messageLabel: { en: "Message", de: "Nachricht", tr: "Mesajınız" },
        messagePlaceholder: { en: "I'm interested in this product...", de: "Ich interessiere mich für dieses Produkt...", tr: "Bu ürünle ilgileniyorum..." },
        submit: { en: "Send Message", de: "Nachricht senden", tr: "Mesaj Gönder" },
        success: { en: "Message sent successfully!", de: "Nachricht erfolgreich gesendet!", tr: "Mesajınız başarıyla gönderildi!" },
        error: { en: "Error sending message", de: "Fehler beim Senden", tr: "Mesaj gönderilirken hata oluştu" }
    },

    // Status
    status: {
        pending: { en: "Pending Approval", de: "Genehmigung ausstehend", tr: "Onay Bekliyor" },
        approved: { en: "Approved", de: "Genehmigt", tr: "Onaylı" },
        rejected: { en: "Rejected", de: "Abgelehnt", tr: "Reddedildi" },
        inactive: { en: "Inactive", de: "Inaktiv", tr: "Pasif" }
    },

    // Empty states
    noProducts: { en: "No products found", de: "Keine Produkte gefunden", tr: "Ürün bulunamadı" },
    noCategories: { en: "No categories yet", de: "Noch keine Kategorien", tr: "Henüz kategori yok" },

    // Vendor Shop Panel
    vendorShop: {
        title: { en: "My Shop", de: "Mein Shop", tr: "Mağazam" },
        addProduct: { en: "Add Product", de: "Produkt hinzufügen", tr: "Ürün Ekle" },
        editProduct: { en: "Edit Product", de: "Produkt bearbeiten", tr: "Ürün Düzenle" },
        myProducts: { en: "My Products", de: "Meine Produkte", tr: "Ürünlerim" },
        pendingApproval: { en: "Pending admin approval", de: "Wartet auf Genehmigung", tr: "Admin onayı bekleniyor" },
        rejectionReason: { en: "Rejection reason", de: "Ablehnungsgrund", tr: "Red nedeni" }
    },

    // Help texts
    help: {
        imageUrl: {
            en: "Upload your image to Google Drive, Imgur, or your own website, then paste the link here.",
            de: "Laden Sie Ihr Bild auf Google Drive, Imgur oder Ihre eigene Website hoch und fügen Sie den Link hier ein.",
            tr: "Görseli Google Drive, Imgur veya kendi sitenize yükleyip linki buraya yapıştırın."
        },
        imageUrlLink: { en: "How to get image link?", de: "Wie bekomme ich den Bildlink?", tr: "Görsel linki nasıl alınır?" },
        price: {
            en: "Enter price with comma (e.g. 49,99). Currency is set to EUR by default.",
            de: "Geben Sie den Preis mit Komma ein (z.B. 49,99). Währung ist standardmäßig EUR.",
            tr: "Fiyatı virgülle yazın (örn: 49,99). Para birimi otomatik EUR olarak ayarlanır."
        },
        category: {
            en: "Select the most relevant category for your product.",
            de: "Wählen Sie die relevanteste Kategorie für Ihr Produkt.",
            tr: "Ürününüz için en uygun kategoriyi seçin."
        }
    },

    // Admin
    admin: {
        title: { en: "Shop Management", de: "Shop-Verwaltung", tr: "Mağaza Yönetimi" },
        categories: { en: "Categories", de: "Kategorien", tr: "Kategoriler" },
        products: { en: "Products", de: "Produkte", tr: "Ürünler" },
        inquiries: { en: "Inquiries", de: "Anfragen", tr: "İletişim Talepleri" },
        pendingProducts: { en: "Pending Approval", de: "Zur Genehmigung", tr: "Onay Bekleyenler" },
        approve: { en: "Approve", de: "Genehmigen", tr: "Onayla" },
        reject: { en: "Reject", de: "Ablehnen", tr: "Reddet" },
        rejectReason: { en: "Rejection Reason", de: "Ablehnungsgrund", tr: "Red Nedeni" },
        rejectReasons: {
            imageQuality: { en: "Image quality is insufficient", de: "Bildqualität ist unzureichend", tr: "Görsel kalitesi yetersiz" },
            descriptionMissing: { en: "Description is missing or unclear", de: "Beschreibung fehlt oder ist unklar", tr: "Açıklama eksik veya belirsiz" },
            priceError: { en: "Price information is incorrect", de: "Preisinformation ist falsch", tr: "Fiyat bilgisi hatalı" },
            categoryWrong: { en: "Wrong category selected", de: "Falsche Kategorie ausgewählt", tr: "Yanlış kategori seçilmiş" },
            other: { en: "Other (specify)", de: "Andere (angeben)", tr: "Diğer (belirtin)" }
        }
    }
};
