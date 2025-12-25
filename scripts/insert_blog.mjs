// Blog Yazısı Ekleme Scripti - Node.js
// Çalıştırmak için: node scripts/insert_blog.mjs

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
    author_id: '13e2508f-e520-4bb3-bd3d-e1f4eee59024', // Admin user ID
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

<p>KolayDugun'un yeni <strong>Canlı Şarkı İstek Sistemi</strong>, DJ'ler için geliştirilen dijital bir çözümdür:</p>

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
<li>🎉 <strong>Modern Deneyim</strong>: Düğününüze teknoloji dokunuşu</li>
<li>🎉 <strong>Kişisel Dokunuş</strong>: Özel mesajlarla şarkı isteği</li>
</ul>

<h2>Ücretsiz Deneme</h2>

<p>Yeni yıl kampanyası kapsamında, <strong>ilk 3 etkinlik tamamen ücretsiz</strong>!</p>

<p><a href="/live-request">🎵 Hemen Keşfedin →</a></p>`,

        de: `<h1>Musikwünsche auf Ihrer Hochzeit modernisieren</h1>

<p>Eines der häufigsten Probleme bei Hochzeiten ist die Übermittlung von Musikwünschen an den DJ.</p>

<h2>Was ist das Live Song Request System?</h2>

<p>Das neue <strong>Live Song Request System</strong> von KolayDugun ist eine digitale Lösung für DJs.</p>

<h2>Jetzt kostenlos testen</h2>

<p><strong>Die ersten 3 Events sind komplett kostenlos!</strong></p>

<p><a href="/live-request">🎵 Jetzt entdecken →</a></p>`,

        en: `<h1>Modernize DJ Communication at Your Wedding</h1>

<p>One of the most common problems at weddings is guests trying to request songs from the DJ.</p>

<h2>What is the Live Song Request System?</h2>

<p>KolayDugun's new <strong>Live Song Request System</strong> is a digital solution for DJs.</p>

<h2>Free Trial</h2>

<p><strong>First 3 events are completely free!</strong></p>

<p><a href="/live-request">🎵 Discover Now →</a></p>`
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

async function insertBlogPost() {
    console.log('📝 Blog yazısı ekleniyor...');

    const { data, error } = await supabase
        .from('posts')
        .insert([blogPost])
        .select();

    if (error) {
        console.error('❌ Hata:', error.message);
        return;
    }

    console.log('✅ Blog yazısı başarıyla eklendi!');
    console.log('📌 ID:', data[0].id);
    console.log('🔗 URL: /blog/' + blogPost.slug);
}

insertBlogPost();
