import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.split(/\r?\n/).find(l => l.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim();
const key = env.split(/\r?\n/).find(l => l.startsWith('VITE_SUPABASE_ANON_KEY')).split('=')[1].trim();

const supabase = createClient(url, key);

const postId = '2035d497-f4b0-4805-9dee-8133c6969e9c';

const trContent = `
<div class="blog-post-content">
    <p>Düğün ve özel etkinliklerin en önemli unsuru şüphesiz müziktir. Ancak misafirlerin isteklerini iletmesi her zaman kolay olmayabilir. <strong>KolayDüğün Live</strong> sistemi ile artık bu süreç tamamen dijital, eğlenceli ve interaktif bir hale geliyor.</p>

    <div class="blog-feature-image">
        <img src="/images/live/dj-dashboard-real.png" alt="Live DJ Dashboard" style="width: 100%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin: 30px 0;" />
    </div>

    <h2>Daha Fazla Etkileşim, Daha Çok Eğlence</h2>
    <p>KolayDüğün Live, DJ ve müzisyenlerin saniyeler içinde şarkı isteklerini almasını sağlayan modern bir platformdur. İşte öne çıkan bazı özelliklerimiz:</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h4 style="margin-top: 0;">🔥 Battle Mode (Canlı Oylama)</h4>
            <p>Sıradaki şarkının tarzını misafirlerinize oylatın! Kararı kitleye bırakın.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h4 style="margin-top: 0;">💎 VIP İstekler</h4>
            <p>Özel anlar için öncelikli istekler. PayPal ile DJ'inizi destekleyebilir ve öne geçebilirsiniz.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h4 style="margin-top: 0;">📸 Medya Mesajları</h4>
            <p>Şarkı ile birlikte o anki modunuzu veya özel bir fotoğrafınızı iletebilirsiniz.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h4 style="margin-top: 0;">📊 Akıllı Analiz</h4>
            <p>Gecenin en çok istenen şarkılarını gerçek zamanlı takip edin.</p>
        </div>
    </div>

    <div class="blog-feature-image">
        <img src="/images/live/dj-landing-real.png" alt="Canlı İstek Sistemi" style="width: 100%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin: 30px 0;" />
    </div>

    <h2>Sistemi Nasıl Kullanmaya Başlarsınız?</h2>
    <p>DJ veya müzisyen olarak KolayDüğün'e kayıt olduktan sonra panelinizden saniyeler içinde bir etkinlik oluşturabilirsiniz. Oluşturulan benzersiz QR kodu masalara yerleştirmeniz yeterli.</p>

    <div style="text-align: center; margin-top: 40px;">
        <a href="/canli-istek-sistemi" style="background: #6366f1; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">Hemen Keşfedin →</a>
    </div>
</div>
`;

async function updatePost() {
    console.log('Fetching original post...');
    const { data: original, error: fetchError } = await supabase.from('posts').select('*').eq('id', postId).single();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    console.log('Title before:', original.title);

    const updatedContent = { ...(original.content || {}), tr: trContent };
    const updatedExcerpt = { ...(original.excerpt || {}), tr: 'Düğün ve etkinliklerde misafirlerin saniyeler içinde şarkı isteği göndermesini sağlayan yeni nesil interaktif sistemimiz yayında.' };
    const updatedTitle = { ...(original.title || {}), tr: 'Canlı Şarkı İstek Sistemi ile Sahnede Etkileşimi Artırın' };

    console.log('Updating post...');
    const { data, error } = await supabase
        .from('posts')
        .update({
            content: updatedContent,
            excerpt: updatedExcerpt,
            title: updatedTitle,
            image_url: '/images/live/dj-dashboard-real.png',
            featured_image_url: '/images/live/dj-dashboard-real.png'
        })
        .eq('id', postId)
        .select();

    if (error) {
        console.error('Error updating post:', error);
    } else {
        console.log('Post updated successfully!');
        console.log('Title after:', data[0].title);
    }
}

updatePost();
