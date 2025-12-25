export const locales = {
    tr: {
        common: {
            loading: "Yükleniyor...",
            error: "Bir hata oluştu",
            save: "Kaydet",
            cancel: "İptal",
            delete: "Sil",
            copy: "Kopyala",
            download: "İndir",
            back: "Geri",
            tryAgain: "Tekrar Dene"
        },
        login: {
            title: "Müzisyen Girişi",
            subtitle: "KolayDüğün hesabınızla giriş yapın",
            email: "E-POSTA",
            emailPlaceholder: "E-posta adresiniz",
            password: "ŞİFRE",
            loginButton: "GİRİŞ YAP",
            forgotPassword: "Şifremi Unuttum?",
            vendorOnly: "Yalnızca tedarikçi hesapları DJ paneline erişebilir."
        },
        dashboard: {
            title: "DJ Paneli",
            subtitle: "Canlı etkinliklerinizi buradan yönetin",
            createEvent: "Yeni Etkinlik Oluştur",
            noEvents: "Henüz bir etkinlik oluşturmadınız.",
            eventCard: {
                requests: "İSTEK",
                active: "AKTİF",
                closed: "KAPALI",
                deleteConfirm: "Bu etkinliği silmek istediğinize emin misiniz? Tüm istekler de silinecektir.",
                copyLink: "Linki Kopyala",
                linkCopied: "Link başarıyla kopyalandı!",
                stats: "İstatistikler",
                liveFeed: "Canlı Yayın"
            },
            modal: {
                title: "Yeni Etkinlik",
                eventName: "ETKİNLİK ADI",
                namePlaceholder: "Örn: Merve & Can Düğün",
                customSlug: "ÖZEL URL (OPSİYONEL)",
                slugPlaceholder: "merve-can-dugun",
                creating: "OLUŞTURULUYOR...",
                create: "ETKİNLİĞİ OLUŞTUR"
            },
            settings: {
                title: 'Etkinlik Ayarları',
                requestLimit: 'İstek Limiti',
                cooldown: 'Soğuma Süresi (Saniye)',
                theme: 'Görünüm Teması',
                language: 'Varsayılan Dil',
                save: 'AYARLARI KAYDET',
                success: 'Ayarlar başarıyla güncellendi'
            },
            faq: {
                title: 'Yardım ve Sıkça Sorulan Sorular',
                q1: 'Etkinlik nasıl oluşturulur?',
                a1: 'Yeni Etkinlik Oluştur butonuna tıklayarak etkinlik adı ve isteğe bağlı özel bir URL (slug) belirleyebilirsiniz.',
                q2: 'Misafirler nasıl istek gönderir?',
                a2: 'QR kodunu misafirlerinize okutarak veya doğrudan URL\'yi paylaşarak istek paneline erişmelerini sağlayabilirsiniz.',
                q3: 'Soğuma süresi nedir?',
                a3: 'Bir misafirin iki istek arasında beklemesi gereken süredir. Bu ayarı her etkinlik için Ayarlar butonundan değiştirebilirsiniz.',
                q4: 'Tema seçimi nasıl yapılır?',
                a4: 'Etkinlik kartındaki Ayarlar (çark simgesi) butonuna tıklayarak Misafir Sayfası için Dark, Light, Pride veya Neon temalarından birini seçebilirsiniz.',
                q5: 'İstekleri nasıl yönetirim?',
                a5: 'Canlı Yayını Başlat butonuna tıklayarak gelen istekleri gerçek zamanlı olarak görebilir, Çal veya Reddet butonlarıyla yönetebilirsiniz.',
                q6: 'TV veya Salon ekranına nasıl yansıtırım?',
                a6: 'Etkinlik kartındaki Monitör simgesine tıklayarak Crowd View ekranını açabilirsiniz. Bu sayfayı salonun dev ekranına yansıtarak misafirlere canlı akışı gösterebilirsiniz.',
                q7: 'Beğeni (Upvote) sistemi nasıl çalışır?',
                a7: 'Misafirler, diğer misafirlerin gönderdiği aktif istekleri görebilir ve beğenebilirler. En çok beğenilen istekler DJ panelinde "TRENDING" rozetiyle en üstte görünür.',
                q8: 'Şarkıları nasıl hızlıca bulabilirim?',
                a8: 'Hem DJ panelinde hem de misafir sayfasında YouTube ve Spotify ikonları bulunur. Bu butonlara tıklayarak şarkıyı ilgili platformda anında aratabilir ve doğruluğunu kontrol edebilirsiniz.',
                q9: 'Canlı İstek Paneli nedir?',
                a9: 'Canlı İstek Paneli, düğün sırasında misafirlerin anlık olarak müzik isteği gönderebildiği ve DJ ile etkileşime girebildiği interaktif bir sistemdir. Bu panel sayesinde misafir memnuniyetini artırabilirsiniz.',
                q10: 'Ücretsiz deneme süresi bittikten sonra ne olur?',
                a10: '24 saatlik ücretsiz deneme süreniz dolduğunda sistem otomatik olarak kilitlenir. Panel erişimine devam etmek için 20 kredi karşılığında günlük geçiş alabilir veya Premium pakete yükseltebilirsiniz.',
                q11: 'Kredi ile 24 saatlik erişim nasıl çalışır?',
                a11: 'Premium paketiniz yoksa, sadece ihtiyacınız olan günlerde 20 kredi harcayarak Canlı İstek Paneli\'ni 24 saatliğine aktif edebilirsiniz. Kredileriniz bakiyenizden düşülür.',
                q12: 'Premium paketin avantajları nelerdir?',
                a12: 'Premium paket üyeleri Canlı İstek Paneli\'ne herhangi bir kredi harcamadan sınırsız erişim sağlarlar. Ayrıca listede üst sıralarda görünme ve onaylı rozeti gibi avantajlara sahip olurlar.'
            }
        },
        liveFeed: {
            qrLink: "QR LİNK",
            noRequests: "Henüz istek gelmedi. Misafirlerinizden QR kodu taratmasını isteyin!",
            tabs: {
                all: "TÜMÜ",
                pending: "BEKLEYENLER",
                played: "ÇALINANLAR"
            },
            actions: {
                play: "ÇAL",
                reject: "REDDET",
                played: "ÇALINDI",
                rejected: "REDDEDİLDİ",
                youtubeSearch: "YouTube'da Ara",
                spotifySearch: "Spotify'da Ara",
                soundOn: "Sesi Aç",
                soundOff: "Sesi Kapat"
            },
            newRequestsAlert: "YENİ İSTEKLER VAR"
        },
        stats: {
            title: "Analizi",
            subtitle: "Etkinlik Raporu ve İstatistikler",
            totalRequests: "Toplam İstek",
            totalRequestsDesc: "Tüm misafir talepleri",
            playedSongs: "Çalınan Şarkılar",
            successRate: "Başarı Oranı",
            interaction: "Katılımcı Etkileşimi",
            interactionDesc: "Tahmini etkileşim sayısı",
            distribution: "Etkileşim Dağılımı",
            hourlyIntensity: "Saatlik Yoğunluk",
            popularSongs: "Popüler Şarkılar",
            activeGuests: "En Aktif Misafirler",
            noData: "Veri toplanıyor..."
        },
        guest: {
            welcome: "Canlı İstek Paneline Hoş Geldiniz!",
            subtitle: "DJ'e şarkı isteğinizi gönderin",
            songTitle: "ŞARKISI ADI / SANATÇI",
            songPlaceholder: "Hangi şarkıyı çalalım?",
            name: "ADINIZ (OPSİYONEL)",
            namePlaceholder: "Adınız",
            note: "DJ'E NOTUNUZ (OPSİYONEL)",
            notePlaceholder: "Örn: Gelin hanım için...",
            send: "İSTEĞİ GÖNDER",
            sending: "GÖNDERİLİYOR...",
            searchYouTube: "YouTube'da Ara",
            searchSpotify: "Spotify'da Ara",
            cooldown: "Bir sonraki istek için {{sec}} saniye bekleyin.",
            success: "İsteğiniz DJ'e iletildi!",
            profanity: "Lütfen daha uygun bir dil kullanın.",
            otherRequests: "DİĞER İSTEKLER & OYLAMA",
            selectMood: "Modunu Seç",
            sendNewRequest: "YENİ BİR İSTEK GÖNDER",
            searchPlaceholder: "Şarkı veya sanatçı arayın...",
            searching: "Aranıyor...",
            noResults: "Sonuç bulunamadı."
        },
        qrModal: {
            title: "Misafir Girişi",
            subtitle: "Misafirlerinizin şarkı isteyebilmesi için bu kodu okutması yeterli.",
            copySuccess: "Link başarıyla kopyalandı!"
        },
        publicDisplay: {
            title: "CANLI İSTEK AKIŞI",
            scanToRequest: "TARAYIP ŞARKI İSTEYİN",
            waitingForRequests: "İSTEKLER BEKLENİYOR...",
            nextUp: "SIRADAKİ",
            actions: {
                fullScreen: "Tam Ekran",
                exitFullScreen: "Tam Ekrandan Çık"
            }
        }
    },
    de: {
        common: {
            loading: "Laden...",
            error: "Ein Fehler ist aufgetreten",
            save: "Speichern",
            cancel: "Abbrechen",
            delete: "Löschen",
            copy: "Kopieren",
            download: "Herunterladen",
            back: "Zurück",
            tryAgain: "Nochmal versuchen"
        },
        login: {
            title: "Musiker Login",
            subtitle: "Melden Sie sich mit Ihrem KolayDüğün-Konto an",
            email: "E-MAIL",
            emailPlaceholder: "Ihre E-Mail-Adresse",
            password: "PASSWORT",
            loginButton: "ANMELDEN",
            forgotPassword: "Passwort vergessen?",
            vendorOnly: "Nur Anbieterkonten können auf das DJ-Panel zugreifen."
        },
        dashboard: {
            title: "DJ-Panel",
            subtitle: "Verwalten Sie Ihre Live-Events hier",
            createEvent: "Neues Event erstellen",
            noEvents: "Sie haben noch keine Events erstellt.",
            eventCard: {
                requests: "ANFRAGEN",
                active: "AKTIV",
                closed: "GESCHLOSSEN",
                deleteConfirm: "Sind Sie sicher, dass Sie dieses Event löschen möchten? Alle Anfragen werden ebenfalls gelöscht.",
                copyLink: "Link kopieren",
                linkCopied: "Link erfolgreich kopiert!",
                stats: "Statistiken",
                liveFeed: "Live-Feed"
            },
            modal: {
                title: "Neues Event",
                eventName: "EVENT-NAME",
                namePlaceholder: "Z.B.: Merve & Can Hochzeit",
                customSlug: "BENUTZERDEFINIERTE URL (OPTIONAL)",
                slugPlaceholder: "merve-can-hochzeit",
                creating: "WIRD ERSTELLT...",
                create: "EVENT ERSTELLEN"
            },
            settings: {
                title: 'Event-Einstellungen',
                requestLimit: 'Anfragelimit',
                cooldown: 'Abklingzeit (Sekunden)',
                theme: 'Design-Thema',
                language: 'Standardsprache',
                save: 'EINSTELLUNGEN SPEICHERN',
                success: 'Einstellungen erfolgreich aktualisiert'
            },
            faq: {
                title: 'Hilfe und FAQ',
                q1: 'Wie erstelle ich ein Event?',
                a1: 'Klicken Sie auf "Neues Event erstellen" und geben Sie einen Event-Namen sowie optional eine benutzerdefinierte URL (Slug) ein.',
                q2: 'Wie können Gäste Anfragen senden?',
                a2: 'Gäste können den QR-Code scannen oder über den geteilten Link auf das Anfrage-Panel zugreifen.',
                q3: 'Was ist die Abklingzeit?',
                a3: 'Die Zeit, die ein Gast zwischen zwei Anfragen warten muss. Dies kann in den "Einstellungen" jedes Events angepasst werden.',
                q4: 'Wie wähle ich ein Design aus?',
                a4: 'Klicken Sie auf das Zahnrad-Symbol ("Einstellungen") auf der Event-Karte, um zwischen den Designs Dark, Light, Pride oder Neon zu wählen.',
                q5: 'Wie verwalte ich Anfragen?',
                a5: 'Klicken Sie auf "Live-Feed starten", um Anfragen in Echtzeit zu sehen und mit "Spielen" oder "Ablehnen" zu verwalten.',
                q6: 'Wie übertrage ich auf einen TV oder eine Leinwand?',
                a6: 'Klicken Sie auf das Monitor-Symbol auf der Event-Karte, um die Crowd View zu öffnen. Diese Seite kann auf die Leinwände im Saal übertragen werden, um den Gästen den Live-Feed anzuzeigen.',
                q7: 'Wie funktioniert das Upvote-System?',
                a7: 'Gäste können die aktiven Anfragen anderer Gäste sehen und dafür stimmen. Die am meisten bewerteten Anfragen erscheinen im DJ-Panel mit einem "TRENDING"-Abzeichen ganz oben.',
                q8: 'Wie finde ich Songs schnell?',
                a8: 'Sowohl im DJ-Panel als auch auf der Gastseite gibt es YouTube- und Spotify-Icons. Durch Klicken auf diese Buttons können Sie den Song sofort auf der jeweiligen Plattform suchen und abspielen.',
                q9: 'Was ist das Live-Wunsch-Panel?',
                a9: 'Das Live-Wunsch-Panel ist ein interaktives System, mit dem Gäste während der Hochzeit Musikwünsche senden und mit dem DJ interagieren können. Es erhöht die Gästezufriedenheit.',
                q10: 'Was passiert nach Ablauf der Testversion?',
                a10: 'Nach Ablauf der 24-stündigen Testphase wird das System automatisch gesperrt. Um fortzufahren, können Sie einen Tagespass für 20 Credits erwerben oder auf Premium upgraden.',
                q11: 'Wie funktioniert der 24-Stunden-Zugang mit Credits?',
                a11: 'Wenn Sie kein Premium-Paket haben, können Sie das Panel für 24 Stunden aktivieren, indem Sie 20 Credits ausgeben. Ideal für einzelne Hochzeiten.',
                q12: 'Was sind die Vorteile des Premium-Pakets?',
                a12: 'Premium-Mitglieder haben unbegrenzten Zugriff auf das Live-Wunsch-Panel ohne Credit-Einsatz. Zudem erhalten sie Top-Platzierungen und ein verifiziertes Badge.'
            }
        },
        liveFeed: {
            qrLink: "QR-LINK",
            noRequests: "Noch keine Anfragen. Bitten Sie Ihre Gäste, den QR-Code zu scannen!",
            tabs: {
                all: "ALLE",
                pending: "AUSSTEHEND",
                played: "GESPIELT"
            },
            actions: {
                play: "SPIELEN",
                reject: "ABLEHNEN",
                played: "GESPIELT",
                rejected: "ABGELEHNT",
                youtubeSearch: "Auf YouTube suchen",
                spotifySearch: "Auf Spotify suchen",
                soundOn: "Ton an",
                soundOff: "Ton aus"
            },
            newRequestsAlert: "NEUE ANFRAGEN VORHANDEN"
        },
        stats: {
            title: "Analyse",
            subtitle: "Event-Bericht und Statistiken",
            totalRequests: "Gesamt Anfragen",
            totalRequestsDesc: "Alle Gästeanfragen",
            playedSongs: "Gespielte Lieder",
            successRate: "Erfolgsquote",
            interaction: "Gäste-Interaktion",
            interactionDesc: "Geschätzte Anzahl der Interaktionen",
            distribution: "Verteilung der Interaktionen",
            hourlyIntensity: "Stündliche Intensität",
            popularSongs: "Beliebte Lieder",
            activeGuests: "Aktivste Gäste",
            noData: "Daten werden gesammelt..."
        },
        guest: {
            welcome: "Willkommen beim Live-Request-Panel!",
            subtitle: "Senden Sie Ihren Musikwunsch an den DJ",
            songTitle: "SONGTITEL / KÜNSTLER",
            songPlaceholder: "Welches Lied sollen wir spielen?",
            name: "IHR NAME (OPTIONAL)",
            namePlaceholder: "Ihr Name",
            note: "IHRE NACHRICHT AN DEN DJ (OPTIONAL)",
            notePlaceholder: "Z.B.: Für die Braut...",
            send: "ANFRAGE SENDEN",
            sending: "WIRD GESENDET...",
            searchYouTube: "Auf YouTube suchen",
            searchSpotify: "Auf Spotify suchen",
            cooldown: "Warten Sie {{sec}} Sekunden bis zur nächsten Anfrage.",
            success: "Ihre Anfrage wurde an den DJ gesendet!",
            profanity: "Bitte verwenden Sie eine angemessenere Sprache.",
            otherRequests: "ANDERE ANFRAGEN & VOTING",
            selectMood: "Wählen Sie Ihre Stimmung",
            sendNewRequest: "EINE NEUE ANFRAGE SENDEN",
            searchPlaceholder: "Nach Song oder Künstler suchen...",
            searching: "Suche...",
            noResults: "Keine Ergebnisse gefunden."
        },
        qrModal: {
            title: "Gäste-Login",
            subtitle: "Ihre Gäste müssen nur diesen Code scannen, um Lieder anzufragen.",
            copySuccess: "Link erfolgreich kopiert!"
        },
        publicDisplay: {
            title: "LIVE-REQUEST-FEED",
            scanToRequest: "SCANNER FÜR MUSIKWÜNSCHE",
            waitingForRequests: "WARTE AUF ANFRAGEN...",
            nextUp: "ALS NÄCHSTES",
            actions: {
                fullScreen: "Vollbild",
                exitFullScreen: "Vollbild beenden"
            }
        }
    },
    en: {
        common: {
            loading: "Loading...",
            error: "An error occurred",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            copy: "Copy",
            download: "Download",
            back: "Back",
            tryAgain: "Try Again"
        },
        login: {
            title: "Musician Login",
            subtitle: "Login with your KolayDüğün account",
            email: "EMAIL",
            emailPlaceholder: "Your email address",
            password: "PASSWORD",
            loginButton: "LOGIN",
            forgotPassword: "Forgot Password?",
            vendorOnly: "Only vendor accounts can access the DJ panel."
        },
        dashboard: {
            title: "DJ Dashboard",
            subtitle: "Manage your live events here",
            createEvent: "Create New Event",
            noEvents: "You haven't created any events yet.",
            eventCard: {
                requests: "REQUESTS",
                active: "ACTIVE",
                closed: "CLOSED",
                deleteConfirm: "Are you sure you want to delete this event? All requests will also be deleted.",
                copyLink: "Copy Link",
                linkCopied: "Link copied successfully!",
                stats: "Statistics",
                liveFeed: "Live Feed"
            },
            modal: {
                title: "New Event",
                eventName: "EVENT NAME",
                namePlaceholder: "E.g.: Merve & Can Wedding",
                customSlug: "CUSTOM URL (OPTIONAL)",
                slugPlaceholder: "merve-can-wedding",
                creating: "CREATING...",
                create: "CREATE EVENT"
            },
            settings: {
                title: 'Event Settings',
                requestLimit: 'Request Limit',
                cooldown: 'Cooldown (Seconds)',
                theme: 'UI Theme',
                language: 'Default Language',
                save: 'SAVE SETTINGS',
                success: 'Settings updated successfully'
            },
            faq: {
                title: 'Help & FAQ',
                q1: 'How to create an event?',
                a1: 'Click "Create New Event" and provide an event name and an optional custom URL (slug).',
                q2: 'How do guests send requests?',
                a2: 'Guests can scan the QR code or use the shared link to access the request panel.',
                q3: 'What is cooldown?',
                a3: 'The duration a guest must wait between two requests. This can be customized via the "Settings" button on each event card.',
                q4: 'How to change themes?',
                a4: 'Click the gear icon ("Settings") on the event card to choose from Dark, Light, Pride, or Neon themes for the Guest Page.',
                q5: 'How to manage requests?',
                a5: 'Click "Start Live Feed" to see requests in real-time and manage them using the "Play" or "Reject" buttons.',
                q6: 'How to display on a TV or Hall screen?',
                a6: 'Click the Monitor icon on the event card to open the Crowd View. This page can be cast to the hall\'s big screens to show guests the live feed.',
                q7: 'How does the upvote system work?',
                a7: 'Guests can see active requests from other guests and upvote them. The most upvoted requests will appear at the top of the DJ panel with a "TRENDING" badge.',
                q8: 'How to find songs quickly?',
                a8: 'Both the DJ panel and the guest page feature YouTube and Spotify icons. Clicking these buttons allows you to instantly search and play the song on the respective platform.',
                q9: 'What is the Live Request Panel?',
                a9: 'The Live Request Panel is an interactive system where guests can send music requests and interact with the DJ during the wedding. It increases guest satisfaction.',
                q10: 'What happens after the free trial ends?',
                a10: 'After the 24-hour trial ends, the system will lock automatically. To continue, you can purchase a daily pass for 20 credits or upgrade to the Premium plan.',
                q11: 'How does 24-hour access with credits work?',
                a11: 'If you don\'t have a Premium plan, you can activate the panel for 24 hours by spending 20 credits. Ideal for specific wedding days.',
                q12: 'What are the advantages of the Premium plan?',
                a12: 'Premium members have unlimited access to the Live Request Panel without spending credits. They also get top placement and a verified badge.'
            }
        },
        liveFeed: {
            qrLink: "QR LINK",
            noRequests: "No requests yet. Ask your guests to scan the QR code!",
            tabs: {
                all: "ALL",
                pending: "PENDING",
                played: "PLAYED"
            },
            actions: {
                play: "PLAY",
                reject: "REJECT",
                played: "PLAYED",
                rejected: "REJECTED",
                youtubeSearch: "Search on YouTube",
                spotifySearch: "Search on Spotify",
                soundOn: "Sound On",
                soundOff: "Sound Off"
            },
            newRequestsAlert: "NEW REQUESTS AVAILABLE"
        },
        stats: {
            title: "Analysis",
            subtitle: "Event Report and Statistics",
            totalRequests: "Total Requests",
            totalRequestsDesc: "All guest requests",
            playedSongs: "Played Songs",
            successRate: "Success Rate",
            interaction: "Guest Interaction",
            interactionDesc: "Estimated number of interactions",
            distribution: "Interaction Distribution",
            hourlyIntensity: "Hourly Intensity",
            popularSongs: "Popular Songs",
            activeGuests: "Most Active Guests",
            noData: "Collecting data..."
        },
        guest: {
            welcome: "Welcome to the Live Request Panel!",
            subtitle: "Send your song request to the DJ",
            songTitle: "SONG TITLE / ARTIST",
            songPlaceholder: "What song should we play?",
            name: "YOUR NAME (OPTIONAL)",
            namePlaceholder: "Your name",
            note: "YOUR NOTE TO DJ (OPTIONAL)",
            notePlaceholder: "E.g.: For the bride...",
            send: "SEND REQUEST",
            sending: "SENDING...",
            searchYouTube: "Search on YouTube",
            searchSpotify: "Search on Spotify",
            cooldown: "Wait {{sec}} seconds before the next request.",
            success: "Your request has been sent to the DJ!",
            profanity: "Please use more appropriate language.",
            otherRequests: "OTHER REQUESTS & VOTING",
            selectMood: "Select Your Mood",
            sendNewRequest: "SEND A NEW REQUEST",
            searchPlaceholder: "Search for song or artist...",
            searching: "Searching...",
            noResults: "No results found."
        },
        qrModal: {
            title: "Guest Login",
            subtitle: "Your guests just need to scan this code to request songs.",
            copySuccess: "Link copied successfully!"
        },
        publicDisplay: {
            title: "LIVE REQUEST FEED",
            scanToRequest: "SCAN TO REQUEST SONGS",
            waitingForRequests: "WAITING FOR REQUESTS...",
            nextUp: "NEXT UP",
            actions: {
                fullScreen: "Full Screen",
                exitFullScreen: "Exit Full Screen"
            }
        }
    }
};
