import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://kolaydugun.de';
const VENDORS_PER_SITEMAP = 1000;

const STATIC_PAGES = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/vendors', changefreq: 'daily', priority: 0.9 },
    { url: '/inspiration', changefreq: 'weekly', priority: 0.8 },
    { url: '/blog', changefreq: 'weekly', priority: 0.7 },
    { url: '/p/impressum', changefreq: 'monthly', priority: 0.5 },
    { url: '/p/privacy', changefreq: 'monthly', priority: 0.5 },
    { url: '/p/terms', changefreq: 'monthly', priority: 0.5 },
];

async function generateSitemap() {
    console.log('🚀 Starting Advanced Sitemap Generation...');

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // 1. Fetch Vendors (Including recently imported ones)
    // We include verified vendors OR newly imported ones that are not deleted
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, slug, created_at, is_verified')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching vendors:', error);
        return;
    }

    console.log(`📊 Found ${vendors.length} vendors in database.`);

    const sitemaps = [];

    // 2. Generate Static Page Sitemap
    const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap-static.xml'), staticSitemap);
    sitemaps.push('sitemap-static.xml');

    // 2.5 Generate SEO Location Landing Pages Sitemap
    const majorCities = [
        'berlin', 'hamburg', 'muenchen', 'koeln', 'frankfurt', 'stuttgart', 
        'duesseldorf', 'dortmund', 'essen', 'bremen', 'hannover', 'leipzig', 
        'dresden', 'nuerneberg', 'duisburg', 'bochum', 'wuppertal', 'bielefeld', 
        'bonn', 'muenster', 'karlsruhe', 'mannheim', 'wiesbaden', 'augsburg', 
        'aachen', 'kiel', 'mainz', 'ulm', 'wien', 'zuerich'
    ];

    const categorySlugs = [
        'dugun-salonlari', 'dugun-fotografcilari', 'djs', 'bridal-fashion', 
        'hair-makeup', 'groom-suits', 'wedding-cakes', 'wedding-planners', 
        'wedding-cars', 'catering-party', 'flowers-decoration', 'wedding-rings', 
        'wedding-videography', 'photobox', 'musicians', 'entertainment'
    ];

    const locationUrls = [];
    
    // Country-wide category URLs
    categorySlugs.forEach(cat => {
        locationUrls.push(`/locations/deutschland/${cat}`);
    });

    // City URLs and City x Category URLs
    majorCities.forEach(city => {
        locationUrls.push(`/locations/${city}`);
        categorySlugs.forEach(cat => {
            locationUrls.push(`/locations/${city}/${cat}`);
        });
    });

    const locationsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locationUrls.map(path => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap-locations.xml'), locationsSitemap);
    sitemaps.push('sitemap-locations.xml');
    console.log(`✅ Generated sitemap-locations.xml (${locationUrls.length} SEO landing URLs)`);

    // 3. Generate Vendor Sitemaps (Partitioned)
    const totalVendorSitemaps = Math.ceil(vendors.length / VENDORS_PER_SITEMAP);

    for (let i = 0; i < totalVendorSitemaps; i++) {
        const start = i * VENDORS_PER_SITEMAP;
        const end = start + VENDORS_PER_SITEMAP;
        const vendorChunk = vendors.slice(start, end);
        const fileName = `sitemap-vendors-${i + 1}.xml`;

        const vendorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${vendorChunk.map(v => {
            const lastMod = v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const path = v.slug ? `/vendors/${v.slug}` : `/vendors/${v.id}`;
            return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${v.is_verified ? '0.8' : '0.6'}</priority>
  </url>`;
        }).join('\n')}
</urlset>`;

        fs.writeFileSync(path.join(publicDir, fileName), vendorSitemap);
        sitemaps.push(fileName);
        console.log(`✅ Generated ${fileName} (${vendorChunk.length} vendors)`);
    }

    // 4. Generate Blog Sitemap
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('status', 'published');

    if (posts && posts.length > 0) {
        const blogSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts.map(post => {
            const lastMod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }).join('\n')}
</urlset>`;
        fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), blogSitemap);
        sitemaps.push('sitemap-blog.xml');
    }

    // 5. Generate Sitemap Index (The main file for Google)
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sm => `  <sitemap>
    <loc>${SITE_URL}/${sm}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
    console.log(`✨ DONE! Root sitemap index generated at ${path.join(publicDir, 'sitemap.xml')}`);
}

generateSitemap();
