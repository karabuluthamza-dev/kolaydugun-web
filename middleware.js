// middleware.js
import { next } from '@vercel/edge';

export const config = {
    matcher: ['/vendors/:slug*', '/blog/:slug*'],
};

export default async function middleware(req) {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent') || '';

    // Detection logic for social media bots
    const isBot = /twitterbot|facebookexternalhit|whatsapp|baiduspider|bingbot|googlebot|adbot|slurp|teoma|yandex|bot|crawler|spider|discordapp|telegrambot/i.test(userAgent);

    if (isBot) {
        console.log(`🤖 Bot detected: ${userAgent} for ${url.pathname}`);

        // Extract slug and type
        const parts = url.pathname.split('/');
        const type = parts[1]; // vendors or blog
        const slug = parts[parts.length - 1];

        if (!slug || slug === 'vendors' || slug === 'blog') return next();

        try {
            // Light fetch to Supabase to get the data
            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.warn('⚠️ Middleware: Supabase credentials missing');
                return next();
            }

            let title = "KolayDugun.de";
            let description = "Find the best wedding vendors in Germany. Turkish & International weddings made easy.";
            let image = "https://kolaydugun.de/og-image.jpg";

            if (type === 'vendors') {
                const response = await fetch(`${supabaseUrl}/rest/v1/vendors?slug=eq.${slug}&select=business_name,description,image_url`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                });
                const data = await response.json();
                if (data && data[0]) {
                    title = `${data[0].business_name} | KolayDugun.de`;
                    description = data[0].description?.substring(0, 160) || description;
                    image = data[0].image_url || image;
                }
            } else if (type === 'blog') {
                // Blog posts have multilingual titles and excerpts
                const response = await fetch(`${supabaseUrl}/rest/v1/posts?slug=eq.${slug}&select=title,excerpt,featured_image_url`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                });
                const data = await response.json();
                if (data && data[0]) {
                    const post = data[0];
                    const postTitle = post.title?.tr || post.title?.de || post.title?.en || "Blog Post";
                    const postExcerpt = post.excerpt?.tr || post.excerpt?.de || post.excerpt?.en || "";

                    title = `${postTitle} | KolayDugun.de`;
                    description = postExcerpt.substring(0, 160) || description;
                    image = post.featured_image_url || image;
                }
            }

            // Prepend Supabase Storage URL if image is relative
            if (image && !image.startsWith('http')) {
                if (image.startsWith('vendors/') || image.startsWith('posts/') || image.startsWith('shop/')) {
                    image = `${supabaseUrl}/storage/v1/object/public/${image}`;
                } else {
                    image = `https://kolaydugun.de${image.startsWith('/') ? '' : '/'}${image}`;
                }
            }

            // Return minimal HTML with OG tags for the bot
            return new Response(
                `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <meta name="description" content="${description}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">
            <meta property="og:type" content="article">
            <meta property="og:url" content="${url.href}">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${image}">
          </head>
          <body>
            <h1>${title}</h1>
            <p>${description}</p>
            <img src="${image}" />
          </body>
        </html>`,
                {
                    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
                }
            );
        } catch (err) {
            console.error('Middleware SEO error:', err);
            return next();
        }
    }

    return next();
}
