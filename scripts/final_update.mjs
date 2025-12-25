import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const blogPost = {
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
        tr: `<h1>Canlı Şarkı İstek Sistemi: Düğününüzü Teknolojiyle Yeniden Tanımlayın</h1><p>Modern düğünlerde teknoloji, eğlenceyi bir üst seviyeye taşıyor. KolayDüğün'ün geliştirdiği <strong>Canlı Şarkı İstek Sistemi</strong>, bu süreci tamamen dijitalleştirerek hem misafirler hem de DJ'ler için kusursuz bir deneyim sunuyor.</p><h3>🚀 Sistem Nasıl Çalışır?</h3><ul><li>✅ <strong>QR Kod Tarama:</strong> Masalara yerleştirilen şık QR kodlar, misafirlerinizi doğrudan istek sayfasına yönlendirir.</li><li>✅ <strong>Uygulama Gerekmez:</strong> Herhangi bir aplikasyon indirmeye gerek kalmadan, doğrudan tarayıcı üzerinden açılır.</li><li>✅ <strong>Şarkı Arama ve Gönderme:</strong> Misafirler devasa müzik kütüphanemizden şarkılarını seçer ve mesajlarıyla birlikte gönderir.</li></ul><h3>🔥 Battle Mode: Eğlenceyi Oylamaya Dönüştürün!</h3><p>Sistemi diğerlerinden ayıran en heyecan verici özellik <strong>Battle Mode</strong>'dur. DJ, aynı anda iki şarkıyı oylamaya sunabilir. Misafirleriniz telefonlarından canlı olarak oylama yapar ve kazanan şarkı pisti coşturur!</p><h3>💎 VIP İstekler ve PayPal Entegrasyonu</h3><p>Bazı misafirler kendi şarkılarının çalınması için sabırsızlanabilir. <strong>PayPal Entegrasyonu</strong> sayesinde, DJ'ler ücretli veya "VIP" istekler kabul edebilir.</p><div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 35px; border-radius: 20px; color: white; text-align: center; margin: 40px 0;"><h3 style="color:white; margin-top:0;">🌟 Sistemin Gücünü Hemen Keşfedin!</h3><a href="/live-demo" style="display:inline-block; background:white; color:#6366f1; padding:12px 30px; border-radius:50px; text-decoration:none; font-weight:800; margin-top:15px;">⚡ CANLI DEMOYU BAŞLAT</a></div>`,
        de: `<h1>Live-Song-Request-System: Definitieren Sie Ihre Hochzeit neu</h1><p>Das von KolayDugun entwickelte <strong>Live-Song-Request-System</strong> digitalisiert den Musikwunsch-Prozess vollständig.</p><h3>🔥 Battle-Modus: Das ultimative Voting-Tool</h3><p>Der DJ kann zwei Songs gleichzeitig zur Abstimmung stellen. Die Gäste stimmen live ab!</p><h3>💎 VIP-Wünsche & PayPal-Integration</h3><p>Mit der <strong>PayPal-Integration</strong> können DJs prioritäre Wünsche entgegennehmen.</p><a href="/live-demo" style="display:inline-block; background:white; color:#6366f1; padding:12px 30px; border-radius:50px; text-decoration:none; font-weight:800; margin-top:15px;">⚡ LIVE-DEMO STARTEN</a>`,
        en: `<h1>Live Song Request System: Redefining Wedding Entertainment</h1><p>KolayDugun's <strong>Live Song Request System</strong> digitalizes the entire guest experience.</p><h3>🔥 Battle Mode: Turn Fun into a Vote!</h3><p>The DJ can put two songs up for a vote at the same time. Guests vote live from their phones!</p><h3>💎 VIP Requests & PayPal Integration</h3><p>With <strong>PayPal Integration</strong>, DJs can accept priority or "VIP" requests.</p><a href="/live-demo" style="display:inline-block; background:white; color:#6366f1; padding:12px 30px; border-radius:50px; text-decoration:none; font-weight:800; margin-top:15px;">⚡ START LIVE DEMO</a>`
    }
};

async function update() {
    console.log('UPDATING ID: 2035d497-f4b0-4805-9dee-8133c6969e9c');
    const response = await supabase
        .from('posts')
        .update(blogPost)
        .eq('id', '2035d497-f4b0-4805-9dee-8133c6969e9c')
        .select();

    console.log('RESPONSE:', JSON.stringify(response, null, 2));
}
update();
