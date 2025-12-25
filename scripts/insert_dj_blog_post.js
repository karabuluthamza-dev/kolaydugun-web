// Blog Yazısı Ekleme Scripti
// Bu scripti tarayıcı konsolunda çalıştırın veya node ile çalıştırın

const blogPost = {
    slug: 'canli-sarki-istek-sistemi',
    status: 'published',
    is_featured: true,
    featured_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    title: {
        tr: 'Düğününüzde DJ ile İletişimi Modernleştirin: Canlı Şarkı İstek Sistemi',
        de: 'Musikwünsche auf Ihrer Hochzeit modernisieren: Live Song Request System',
        en: 'Modernize DJ Communication at Your Wedding: Live Song Request System'
    },
    excerpt: {
        tr: 'Kağıt kalem devri sona erdi! Misafirleriniz artık QR kod ile şarkı isteği gönderebilir.',
        de: 'Die Zeit von Papier und Stift ist vorbei! Gäste können jetzt per QR-Code Musikwünsche senden.',
        en: 'The paper and pen era is over! Guests can now send song requests via QR code.'
    },
    content: {
        tr: `<h1>Düğününüzde DJ ile İletişimi Modernleştirin</h1>

<p>Düğünlerde en sık yaşanan sorunlardan biri, misafirlerin DJ'e şarkı isteği iletmesidir. Kağıt parçaları, sahneye gidip DJ'in kulağına fısıldama veya garsonlar aracılığıyla mesaj gönderme... Bu yöntemler hem profesyonellikten uzak hem de çoğu zaman mesajlar kaybolur.</p>

<p><strong>Peki ya misafirleriniz telefonlarından, saniyeler içinde şarkı isteği gönderebilseydi?</strong></p>

<h2>Canlı Şarkı İstek Sistemi Nedir?</h2>

<p>KolayDugun'un yeni <strong>Canlı Şarkı İstek Sistemi</strong>, DJ'ler için geliştirilen dijital bir çözümdür. Sistem şu şekilde çalışır:</p>

<ol>
<li><strong>QR Kod Tarama</strong>: Her masaya yerleştirilen QR kod, misafirleri özel istek sayfasına yönlendirir</li>
<li><strong>Şarkı Seçimi</strong>: Misafirler şarkı adı veya sanatçı yazarak istek gönderir</li>
<li><strong>Anlık Görüntüleme</strong>: DJ, sahnedeki ekranında tüm istekleri gerçek zamanlı görür</li>
<li><strong>İstek Yönetimi</strong>: DJ, çaldığı şarkıları işaretler, spam istekleri filtreler</li>
</ol>

<h2>DJ'ler İçin Avantajlar</h2>

<ul>
<li>✅ <strong>Profesyonel Görünüm</strong>: Sahneye gelen misafirlerle uğraşmak yerine odaklanmış performans</li>
<li>✅ <strong>Spam Koruması</strong>: Küfürlü veya uygunsuz istekler otomatik filtrelenir</li>
<li>✅ <strong>Veri Analizi</strong>: Hangi şarkılar en çok isteniyor, hangi saat diliminde pist doldu</li>
<li>✅ <strong>Müşteri Memnuniyeti</strong>: Çiftler, misafirlerinin eğlenceye dahil olduğunu görür</li>
</ul>

<h2>Düğün Çiftleri İçin Avantajlar</h2>

<ul>
<li>🎉 <strong>Misafir Katılımı</strong>: Yaşlı-genç herkes kolayca katılabilir</li>
<li>🎉 <strong>Modern Deneyim</strong>: "Bu düğünde bile QR kod var!" diyecekler</li>
<li>🎉 <strong>Kişisel Dokunuş</strong>: Özel mesajlarla şarkı isteği</li>
</ul>

<h2>Nasıl Kullanılır?</h2>

<p><strong>DJ'ler için:</strong></p>
<ol>
<li><a href="https://live.kolaydugun.de">live.kolaydugun.de</a> adresinden kayıt olun</li>
<li>Etkinlik oluşturun ve QR kodunuzu alın</li>
<li>Düğün günü QR kodları masalara dağıtın</li>
<li>Sahnede istekleri yönetin!</li>
</ol>

<h2>Ücretsiz Deneme</h2>

<p>Yeni yıl kampanyası kapsamında, <strong>ilk 3 etkinlik tamamen ücretsiz</strong>! Sistemi deneyip beğenmezseniz hiçbir ücret ödemezsiniz.</p>

<p><a href="/live-request" class="btn btn-primary">🎵 Hemen Keşfedin →</a></p>`,

        de: `<h1>Musikwünsche auf Ihrer Hochzeit modernisieren</h1>

<p>Eines der häufigsten Probleme bei Hochzeiten ist die Übermittlung von Musikwünschen an den DJ. Zettel, zum DJ auf die Bühne gehen oder Nachrichten über Kellner senden... Diese Methoden sind unprofessionell und Nachrichten gehen oft verloren.</p>

<p><strong>Was wäre, wenn Ihre Gäste in Sekundenschnelle Musikwünsche vom Handy senden könnten?</strong></p>

<h2>Was ist das Live Song Request System?</h2>

<p>Das neue <strong>Live Song Request System</strong> von KolayDugun ist eine digitale Lösung für DJs:</p>

<ol>
<li><strong>QR-Code scannen</strong>: Jeder Tisch hat einen QR-Code, der zur Wunschseite führt</li>
<li><strong>Song auswählen</strong>: Gäste geben Songtitel oder Künstler ein</li>
<li><strong>Echtzeit-Anzeige</strong>: Der DJ sieht alle Wünsche live auf seinem Bildschirm</li>
<li><strong>Verwaltung</strong>: DJ markiert gespielte Songs, filtert Spam</li>
</ol>

<h2>Jetzt kostenlos testen</h2>

<p><strong>Die ersten 3 Events sind komplett kostenlos!</strong></p>

<p><a href="/live-request" class="btn btn-primary">🎵 Jetzt entdecken →</a></p>`,

        en: `<h1>Modernize DJ Communication at Your Wedding</h1>

<p>One of the most common problems at weddings is guests trying to request songs from the DJ. Paper notes, walking up to the stage, or sending messages through waiters... These methods are unprofessional and messages often get lost.</p>

<p><strong>What if your guests could send song requests from their phones in seconds?</strong></p>

<h2>What is the Live Song Request System?</h2>

<p>KolayDugun's new <strong>Live Song Request System</strong> is a digital solution for DJs:</p>

<ol>
<li><strong>Scan QR Code</strong>: Each table has a QR code that leads to the request page</li>
<li><strong>Select Song</strong>: Guests enter song title or artist</li>
<li><strong>Real-time Display</strong>: DJ sees all requests live on their screen</li>
<li><strong>Management</strong>: DJ marks played songs, filters spam</li>
</ol>

<h2>Free Trial</h2>

<p><strong>First 3 events are completely free!</strong></p>

<p><a href="/live-request" class="btn btn-primary">🎵 Discover Now →</a></p>`
    },
    meta_title: {
        tr: 'Düğünde DJ Şarkı İsteği - Dijital Çözüm | KolayDugun',
        de: 'Hochzeits-DJ Musikwünsche - Digitale Lösung | KolayDugun',
        en: 'Wedding DJ Song Requests - Digital Solution | KolayDugun'
    },
    meta_description: {
        tr: 'Düğününüzde misafirler QR kod ile şarkı isteği göndersin! Canlı şarkı istek sistemi ile DJ performansını profesyonelleştirin.',
        de: 'Gäste senden Musikwünsche per QR-Code! Live Song Request System für professionelle DJ-Performances.',
        en: 'Let guests send song requests via QR code! Live song request system for professional DJ performances.'
    }
};

// Supabase'e eklemek için bu objeyi kullanın
console.log('Blog post data ready:', blogPost);

// Tarayıcı konsolunda çalıştırmak için:
// const { data, error } = await supabase.from('posts').insert([blogPost]).select();
// console.log('Result:', { data, error });
