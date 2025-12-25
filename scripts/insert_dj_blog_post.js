// Blog Yazısı Ekleme Scripti - ENHANCED VERSION WITH NEW FEATURES
// Bu scripti tarayıcı konsolunda çalıştırın veya node ile çalıştırın

const blogPost = {
    slug: 'live-dj-wow-features-guide',
    status: 'published',
    is_featured: true,
    featured_image_url: 'https://images.unsplash.com/photo-1514525253361-bee8d4a9ec2b?auto=format&fit=crop&q=80&w=1200',
    title: {
        tr: 'Live DJ Sisteminde Devrim: Misafirlerinizi Büyüleyecek 5 Yeni Özellik',
        de: 'Revolution im Live-DJ-System: 5 neue Funktionen, die Ihre Gäste begeistern werden',
        en: 'Revolution in Live DJ System: 5 New Features to Wow Your Guests'
    },
    excerpt: {
        tr: 'Düğünlerin ve partilerin havasını değiştirecek Battle Mode, VIP İstekler ve Fotoğraf Desteği yayında! DJ performansınızı bir üst seviyeye taşıyın.',
        de: 'Battle Mode, VIP-Wünsche und Foto-Support sind live! Heben Sie Ihre DJ-Performance auf das nächste Level.',
        en: 'Battle Mode, VIP Requests, and Photo Support are live! Take your DJ performance to the next level.'
    },
    content: {
        tr: `<h1>Modern DJ Performansında Yeni Bir Dönem Başlıyor</h1>

<p>Düğün ve etkinliklerde DJ performansını sadece müzik çalmaktan çıkarıp interaktif bir show'a dönüştürmeye hazır mısınız? KolayDugun Live DJ sistemine eklediğimiz <strong>"Wow"</strong> özellikleri ile hem misafirlerinizi eğlencenin merkezine koyuyoruz hem de DJ'ler için yeni kazanç kapıları açıyoruz.</p>

<p>İşte A'dan Z'ye tüm yenilikler:</p>

<hr />

<h2>1. Medya Dedikasyonları: Şarkı İsteğine Fotoğraf Ekleyin!</h2>
<p>Artık misafirler sadece şarkı istemiyor, o şarkıyla olan anılarını da paylaşıyor! Misafir sayfasındaki yeni "Medya Dedikasyonu" alanı sayesinde misafirleriniz:</p>
<ul>
    <li>Galerilerinden bir fotoğraf yükleyebilir</li>
    <li>Anlık olarak o anın fotoğrafını çekip gönderebilir</li>
    <li>Veya Pinterest/Instagram gibi platformlardan bir görsel linki paylaşabilir.</li>
</ul>
<p><strong>Optimize Sistem:</strong> Merak etmeyin, yüklenen fotoğraflar cihaz içinde otomatik sıkıştırılır. Böylece sistemimiz binlerce fotoğrafı saniyeler içinde DJ paneline iletir.</p>

<hr />

<h2>2. Battle Mode (Canlı Kapışma): Pistin Hakimi Kim?</h2>
<p>Gecenin nabzına göre bir oylama başlatmaya ne dersiniz? DJ panelinden tek tıkla başlatabileceğiniz "Battle Mode" ile:</p>
<ul>
    <li><strong>90'lar Pop vs 2000'ler Rock</strong> gibi kategorileri yarıştırın.</li>
    <li>Misafirler telefonlarından anlık oy versin.</li>
    <li><strong>TV Ekranı (Public Display)</strong> anlık olarak ikiye bölünür ve devasa grafiklerle oylama sonuçlarını canlı yayınlar!</li>
</ul>
<p>Bu özellik, pistteki enerjiyi anında iki katına çıkarmanın en garanti yoludur.</p>

<hr />

<h2>3. VIP İstekler: "Sıranın Başına Geç" Fonksiyonu</h2>
<p>DJ'ler için profesyonel bir ek gelir modeli! Eğer misafiriniz çok meraklıysa veya acelesi varsa, "VIP İSTEK" seçeneğini aktif edebilir. Bu sistem sayesinde:</p>
<ul>
    <li>Misafir, isteğini VIP olarak işaretler.</li>
    <li>Sistem misafiri DJ'in PayPal.me linkine yönlendirir.</li>
    <li>Ödeme tamamlandığında DJ paneline "ALTIN SARISI" çerçeveli bir bildirim düşer.</li>
    <li>TV ekranında bu istek **"VIP İSTEK"** etiketiyle en tepede parlar!</li>
</ul>

<hr />

<h2>4. Wedding Wrapped: Gecenin Unutulmaz Raporu</h2>
<p>Etkinlik bittiğinde çiftinize verebileceğiniz en güzel hediye! Spotify Wrapped tarzında hazırlanan bu rapor şunları içerir:</p>
<ul>
    <li>Gecenin en çok istenen Top 3 şarkısı.</li>
    <li>Misafirlerin genel modu (En çok hangi emoji kullanıldı?).</li>
    <li>Toplam kaç beğeni toplandı?</li>
</ol>
<p>DJ Dashboard'daki "Yıldız" ikonuna tıklayarak bu animasyonlu hikayeyi çiftinizle paylaşabilirsiniz.</p>

<hr />

<h2>5. Yeni Nesil TV Yayını (Public Display)</h2>
<p>Tüm bu akış, sahnedeki dev ekranlarda (veya projeksiyonda) tamamen yenilenmiş bir tasarım ile görünüyor. Şık animasyonlar, neon ışıklandırmalar ve dinamik geçişler ile DJ kabini düğünün en stil sahibi noktası haline geliyor.</p>

<hr />

<h3>Hemen Deneyin!</h3>
<p>Bu özellikleri denemek için bir DJ hesabınızın olması yeterli. İlk 3 etkinlik tamamen ücretsizdir!</p>

<p><a href="/live/dashboard" class="btn btn-primary" style="background:#e11d48; color:white; padding:15px 30px; border-radius:50px; text-decoration:none; font-weight:bold; display:inline-block; margin-top:20px;">🎶 Demo Etkinlik Oluştur →</a></p>`,

        de: `<h1>Ein neues Zeitalter der modernen DJ-Performance beginnt</h1>

<p>Sind Sie bereit, Ihre DJ-Performance bei Hochzeiten und Events in eine interaktive Show zu verwandeln? Mit den neuen <strong>"Wow"</strong>-Funktionen des KolayDugun Live-DJ-Systems stellen wir Ihre Gäste in den Mittelpunkt und eröffnen DJs neue Einnahmequellen.</p>

<hr />

<h2>1. Medien-Widmungen: Fotos zu Musikwünschen hinzufügen!</h2>
<p>Gäste können jetzt nicht nur Songs wünschen, sondern auch Fotos hochladen oder Links teilen.</p>

<h2>2. Battle Mode: Wer beherrscht die Tanzfläche?</h2>
<p>Starten Sie Live-Votings wie **90er Pop vs. 2000er Rock**. Die Ergebnisse werden in Echtzeit auf dem großen Bildschirm angezeigt!</p>

<h2>3. VIP-Wünsche: Die "Skip-the-Line"-Funktion</h2>
<p>Gäste können per PayPal bezahlen, um ihre Wünsche ganz nach oben zu setzen. VIP-Wünsche glänzen in Gold auf allen Bildschirmen!</p>

<h2>4. Wedding Wrapped: Der ultimative Event-Bericht</h2>
<p>Ein animierter Rückblick im Spotify-Wrapped-Stil mit den Top-Songs und Statistiken der Nacht.</p>

<p><a href="/live/dashboard" class="btn btn-primary">🎶 Jetzt kostenlos testen →</a></p>`,

        en: `<h1>A New Era of Modern DJ Performance Begins</h1>

<p>Ready to transform your DJ performance into an interactive show? With the new <strong>"Wow"</strong> features of the KolayDugun Live DJ system, we put your guests at the center of the fun and open new revenue streams for DJs.</p>

<hr />

<h2>1. Media Dedications: Add Photos to Song Requests!</h2>
<p>Guests can now upload photos or share links alongside their song requests.</p>

<h2>2. Battle Mode: Who Rules the Dance Floor?</h2>
<p>Start live votings like **90s Pop vs. 2000s Rock**. Results are shown in real-time on the big screen!</p>

<h2>3. VIP Requests: The "Skip-the-Line" Function</h2>
<p>Guests can pay via PayPal to boost their requests. VIP requests shine in gold on all screens!</p>

<h2>4. Wedding Wrapped: The Ultimate Event Report</h2>
<p>An animated review in Spotify Wrapped style, featuring the night's top songs and stats.</p>

<p><a href="/live/dashboard" class="btn btn-primary">🎶 Try for Free Now →</a></p>`
    },
    meta_title: {
        tr: 'DJ Performansını Uçuran 5 Yeni Özellik | KolayDugun Live',
        de: '5 neue DJ-Features, die begeistern | KolayDugun Live',
        en: '5 New DJ Features to Wow Your Crowd | KolayDugun Live'
    },
    meta_description: {
        tr: 'Battle Mode, VIP İstekler ve Fotoğraf Desteği ile tanışın. DJ performansınızı modernize edin ve misafir katılımını artırın.',
        de: 'Entdecken Sie Battle Mode, VIP-Wünsche und Foto-Support. Modernisieren Sie Ihre DJ-Performance.',
        en: 'Discover Battle Mode, VIP Requests, and Photo Support. Modernize your DJ performance today.'
    }
};

console.log('Premium Blog post data ready:', blogPost);
// const { data, error } = await supabase.from('posts').insert([blogPost]).select();
