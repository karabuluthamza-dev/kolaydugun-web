// Blog Yazısı Güncelleme Scripti - TAM DETAYLI VERSİYON
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const blogPost = {
    slug: 'canli-sarki-istek-sistemi',
    status: 'published',
    is_featured: true,
    author_id: '13e2508f-e520-4bb3-bd3d-e1f4eee59024',
    featured_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    title: {
        tr: 'Canlı Şarkı İstek Sistemi: Düğününüz İçin Dijital Devrim',
        de: 'Live-Musikwunschsystem: Die digitale Revolution für Ihre Hochzeit',
        en: 'Live Song Request System: A Digital Revolution for Your Wedding'
    },
    excerpt: {
        tr: 'QR kod ile şarkı isteği, Battle Mode oylamaları ve profesyonel DJ yönetimi. Düğün eğlencesinde yeni standartla tanışın.',
        de: 'Musikwünsche per QR-Code, Battle-Mode-Voting und professionelles DJ-Management. Entdecken Sie den neuen Standard.',
        en: 'Song requests via QR code, Battle Mode voting, and professional DJ management. Meet the new standard for wedding fun.'
    },
    content: {
        tr: `<h1>Canlı Şarkı İstek Sistemi: Düğününüzü Teknolojiyle Yeniden Tanımlayın</h1>

<p>Düğün eğlencelerinde en büyük zorluklardan biri, misafirlerin müzik tercihlerini DJ'e ulaştırmasıdır. Kağıt parçaları, kulaktan kulağa fısıldamalar veya DJ kabinine yapılan baskınlar artık geride kaldı! KolayDüğün'ün geliştirdiği <strong>Canlı Şarkı İstek Sistemi</strong>, bu süreci tamamen dijitalleştirerek hem misafirler hem de DJ'ler için kusursuz bir deneyim sunuyor.</p>

<p><em>"DJ kabinine gidip fısıldama devri bitti. Masadaki QR kodu taratın ve sahneye hükmedin!"</em></p>

<div style="margin: 30px 0;">
    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200" alt="DJ Performance" style="width:100%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" />
</div>

<h3>🚀 Sistem Nasıl Çalışır?</h3>
<p>Sistemin kurulumu saniyeler sürer ve misafirleriniz için kullanımı son derece basittir:</p>
<ul>
    <li>✅ <strong>QR Kod Tarama:</strong> Masalara yerleştirilen şık QR kodlar, misafirlerinizi doğrudan istek sayfasına yönlendirir.</li>
    <li>✅ <strong>Uygulama Gerekmez:</strong> Herhangi bir aplikasyon indirmeye gerek kalmadan, doğrudan tarayıcı üzerinden açılır.</li>
    <li>✅ <strong>Şarkı Arama ve Gönderme:</strong> Misafirler devasa müzik kütüphanemizden şarkılarını seçer ve mesajlarıyla birlikte gönderir.</li>
</ul>

<h3>🔥 Battle Mode: Eğlenceyi Oylamaya Dönüştürün!</h3>
<p>Sistemi diğerlerinden ayıran en heyecan verici özellik <strong>Battle Mode</strong>'dur. DJ, aynı anda iki şarkıyı oylamaya sunabilir. Misafirleriniz telefonlarından canlı olarak oylama yapar ve kazanan şarkı pisti coşturur! Bu özellik, misafir etkileşimini ve eğlence dozunu %300 artıran benzersiz bir araçtır.</p>

<div style="background:#fff5f5; padding:20px; border-radius:12px; border:1px solid #feb2b2; margin:20px 0;">
    <p><strong>Örnek:</strong> 90'lar Pop mu? 2000'ler R&B mi? Seçimi misafirlerinize bırakın, enerjiyi siz yönetin!</p>
</div>

<h3>💎 VIP İstekler ve PayPal Entegrasyonu</h3>
<p>Bazı misafirler kendi şarkılarının çalınması için sabırsızlanabilir. <strong>PayPal Entegrasyonu</strong> sayesinde, DJ'ler ücretli veya "VIP" istekler kabul edebilir. Bu sistem:</p>
<ul>
    <li>Düğün sahipleri ve DJ'ler için ek bir gelir kapısı açar.</li>
    <li>Talep yoğunluğunu profesyonelce yönetmenizi sağlar.</li>
    <li>Misafirlere kendilerini özel hissettirir.</li>
</ul>

<h3>🛡️ DJ Paneli ve Akıllı Denetim</h3>
<p>DJ kabininde her şey kontrol altında:</p>
<ul>
    <li>🚫 <strong>Otomatik Filtreleme:</strong> Küfürlü veya uygunsuz mesajlar anında sistem tarafından engellenir.</li>
    <li>🚫 <strong>Mükerrer İstek Koruması:</strong> Aynı şarkının defalarca istenmesini önleyen akıllı algoritma.</li>
    <li>🖥️ <strong>Gerçek Zamanlı Yönetim:</strong> DJ, istekleri kuyruğa alabilir, "Şimdi Çalıyor" olarak işaretleyebilir veya reddedebilir.</li>
</ul>

<h3>📊 Gece Sonu Analizleri</h3>
<p>Düğün bittiğinde elinizde sadece anılar kalmaz; aynı zamanda misafirlerinizin hangi şarkıları en çok sevdiğine dair detaylı bir analiz raporu da olur. Hangi saatte hangi tarzın daha çok ilgi gördüğünü görerek bir sonraki organizasyonunuzu daha iyi planlayabilirsiniz.</p>

<div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 35px; border-radius: 20px; color: white; text-align: center; margin: 40px 0; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);">
    <h3 style="color:white; margin-top:0;">🌟 Sistemin Gücünü Hemen Keşfedin!</h3>
    <p>Üye olmadan hem Misafir hem de DJ görünümlerini canlı demo üzerinden test edebilirsiniz.</p>
    <a href="/live-demo" style="display:inline-block; background:white; color:#6366f1; padding:12px 30px; border-radius:50px; text-decoration:none; font-weight:800; margin-top:15px; transition: transform 0.2s;">⚡ CANLI DEMOYU BAŞLAT</a>
</div>

<p>Profesyonel DJ'ler, orkestralar ve modern düğün sahipleri için geliştirilen bu sistemle sahnede fark yaratın!</p>`,

        de: `<h1>Live-Song-Request-System: Definieren Sie Ihre Hochzeit neu</h1>

<p>Eine der größten Herausforderungen bei Hochzeitsfeiern ist es, Musikwünsche der Gäste sicher zum DJ zu bringen. Zettelwirtschaft, Flüstern ins Ohr oder das Stürmen der DJ-Kabine gehören der Vergangenheit an! Das von KolayDugun entwickelte <strong>Live-Song-Request-System</strong> digitalisiert diesen Prozess vollständig.</p>

<div style="margin: 30px 0;">
    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200" alt="DJ Performance" style="width:100%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" />
</div>

<h3>🚀 Wie es funktioniert:</h3>
<ul>
    <li>✅ <strong>QR-Code Scan:</strong> Stilvolle QR-Codes auf den Tischen führen die Gäste direkt zur Wunschseite.</li>
    <li>✅ <strong>Keine App nötig:</strong> Funktioniert direkt im Browser, ohne Downloads.</li>
    <li>✅ <strong>Suchen & Senden:</strong> Gäste wählen Titel aus der riesigen Bibliothek und senden sie samt persönlicher Nachricht.</li>
</ul>

<h3>🔥 Battle-Modus: Das ultimative Voting-Tool</h3>
<p>Das aufregendste Feature ist der <strong>Battle-Modus</strong>. Der DJ kann zwei Songs gleichzeitig zur Abstimmung stellen. Die Gäste stimmen live ab, und der Gewinner-Track bringt die Tanzfläche zum Beben! Dieses Tool steigert die Interaktion um bis zu 300%.</p>

<h3>💎 VIP-Wünsche & PayPal-Integration</h3>
<p>Mit der <strong>PayPal-Integration</strong> können DJs prioritäre oder "VIP"-Wünsche entgegennehmen. Dies ermöglicht:</p>
<ul>
    <li>Zusätzliche Einnahmequelle für Veranstalter oder DJs.</li>
    <li>Professionelle Steuerung der Wunschflut.</li>
    <li>Ein exklusives Erlebnis für die Gäste.</li>
</ul>

<h3>🛡️ DJ-Dashboard & Intelligente Moderation</h3>
<ul>
    <li>🚫 <strong>Automatischer Filter:</strong> Unangemessene Inhalte werden sofort blockiert.</li>
    <li>🚫 <strong>Spam-Schutz:</strong> Verhindert mehrfache Einsendungen desselben Titels.</li>
    <li>🖥️ <strong>Echtzeit-Management:</strong> Der DJ kann Wünsche einplanen, als "läuft gerade" markieren oder ablehnen.</li>
</ul>

<div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 35px; border-radius: 20px; color: white; text-align: center; margin: 40px 0;">
    <h3 style="color:white; margin-top:0;">🌟 Entdecken Sie die Möglichkeiten!</h3>
    <p>Testen Sie sowohl die Gast- als auch die DJ-Ansicht in unserer kostenlosen Live-Demo.</p>
    <a href="/live-demo" style="display:inline-block; background:white; color:#6366f1; padding:12px 30px; border-radius:50px; text-decoration:none; font-weight:800; margin-top:15px;">⚡ LIVE-DEMO STARTEN</a>
</div>`,

        en: `<h1>Live Song Request System: Redefining Wedding Entertainment</h1>

<p>One of the biggest challenges at wedding parties is getting guest song requests to the DJ effectively. Scraps of paper, whispering in ears, or storming the DJ booth are things of the past! KolayDugun's <strong>Live Song Request System</strong> digitalizes this entire experience.</p>

<div style="margin: 30px 0;">
    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200" alt="DJ Performance" style="width:100%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" />
</div>

<h3>🚀 How it Works:</h3>
<ul>
    <li>✅ <strong>QR Code Scanning:</strong> Stylish QR codes placed on tables lead guests directly to the request page.</li>
    <li>✅ <strong>No App Required:</strong> Works directly in the browser, no downloads needed.</li>
    <li>✅ <strong>Search & Send:</strong> Guests pick songs from our massive library and send them with personal notes.</li>
</ul>

<h3>🔥 Battle Mode: Turn Fun into a Vote!</h3>
<p>The most exciting feature is the <strong>Battle Mode</strong>. The DJ can put two songs up for a vote at the same time. Guests vote live from their phones, and the winning track rocks the floor! This feature is a unique tool that increases guest engagement by up to 300%.</p>

<h3>💎 VIP Requests & PayPal Integration</h3>
<p>With <strong>PayPal Integration</strong>, DJs can accept priority or "VIP" requests. This system offers:</p>
<ul>
    <li>Extra income opportunities for organizers or DJs.</li>
    <li>Professional management of high demand.</li>
    <li>A unique, exclusive experience for guests.</li>
</ul>

<h3>🛡️ DJ Dashboard & Smart Moderation</h3>
<ul>
    <li>🚫 <strong>Automatic Filtering:</strong> Inappropriate messages are instantly blocked.</li>
    <li>🚫 <strong>Spam Protection:</strong> Prevents multiple requests for the same song.</li>
    <li>🖥️ <strong>Real-time Control:</strong> DJs can queue requests, mark as "Now Playing," or reject submissions.</li>
</ul>

<div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 35px; border-radius: 20px; color: white; text-align: center; margin: 40px 0;">
    <h3 style="color:white; margin-top:0;">🌟 Discover the Power Today!</h3>
    <p>Test both Guest and DJ views in our dedicated live demo mode.</p>
    <a href="/live-demo" style="display:inline-block; background:white; color:#6366f1; padding:12px 30px; border-radius:50px; text-decoration:none; font-weight:800; margin-top:15px;">⚡ START LIVE DEMO</a>
</div>`
    },
    meta_title: {
        tr: 'Canlı Şarkı İstek Sistemi - Dijital Düğün Eğlencesi | KolayDugun',
        de: 'Live-Song-Request - Digitale Hochzeitsunterhaltung | KolayDugun',
        en: 'Live Song Request - Digital Wedding Entertainment | KolayDugun'
    },
    meta_description: {
        tr: 'QR kod ile şarkı isteği, Battle Mode oylamaları ve profesyonel DJ yönetimi. Düğününüzde teknolojik devrim.',
        de: 'Musikwünsche per QR-Code, Battle-Modus und professionelles DJ-Dashboard. Die Zukunft der Hochzeit.',
        en: 'Song requests via QR code, Battle Mode voting, and professional DJ dashboard. The future of weddings.'
    }
};

async function updateBlogPost() {
    console.log('🔍 Blog yazısı kontrol ediliyor (slug: ' + blogPost.slug + ')...');

    const { data: existing, error: fetchError } = await supabase
        .from('posts')
        .select('id, slug')
        .eq('slug', blogPost.slug);

    if (fetchError) {
        console.error('❌ Hata:', fetchError.message);
        return;
    }

    if (existing && existing.length > 0) {
        console.log(`♻️  Eski yazı(lar) bulundu (Adet: ${existing.length}). Güncelleniyor...`);
        for (const post of existing) {
            console.log(`📝 Post güncelleniyor (ID: ${post.id})...`);
            const { author_id, ...updateData } = blogPost;
            const { error: updateError } = await supabase
                .from('posts')
                .update(updateData)
                .eq('id', post.id);

            if (updateError) {
                console.error(`❌ Güncelleme hatası (ID: ${post.id}):`, updateError.message);
            } else {
                console.log(`✅ ID: ${post.id} başarıyla güncellendi.`);
            }
        }
    } else {
        console.log('📝 Post bulunamadı, yeni ekleniyor...');
        const { error: insertError } = await supabase
            .from('posts')
            .insert([blogPost]);

        if (insertError) {
            console.error('❌ Ekleme hatası:', insertError.message);
            console.log('💡 RLS hatası alıyorsanız, lütfen admin rolü ile veya Dashboard üzerinden çalıştırın.');
        } else {
            console.log('✅ Başarıyla eklendi.');
        }
    }

    console.log('🔗 İşlem tamamlandı. URL: /blog/' + blogPost.slug);
}

updateBlogPost();
