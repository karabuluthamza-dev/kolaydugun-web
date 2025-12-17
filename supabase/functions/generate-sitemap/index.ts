import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_URL = 'https://kolaydugun.de'

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Fetch all active products
        const { data: products } = await supabase
            .from('shop_products')
            .select('id, name_de, name_tr, name_en, tags_de, tags_tr, tags_en, product_type, updated_at')
            .eq('status', 'active')
            .order('updated_at', { ascending: false })

        // Fetch all published blog posts
        const { data: blogPosts } = await supabase
            .from('blog_posts')
            .select('id, slug, updated_at')
            .eq('is_published', true)
            .order('updated_at', { ascending: false })

        // Fetch all shop categories
        const { data: categories } = await supabase
            .from('shop_categories')
            .select('id, slug, updated_at')
            .order('updated_at', { ascending: false })

        // Helper function to create SEO slug
        const slugify = (text: string): string => {
            if (!text) return ''
            return text
                .toLowerCase()
                .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a')
                .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 60)
        }

        // Get slug from tags or generate from name
        const getSlug = (product: any, lang: string): string => {
            const tags = product[`tags_${lang}`] || ''
            const slugMatch = tags.match(/slug:([^,]+)/)
            if (slugMatch) return slugMatch[1].trim()
            return slugify(product[`name_${lang}`] || product.name_de || product.id)
        }

        // Build XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`

        // Static pages with hreflang
        const staticPages = ['', 'shop', 'blog', 'forum', 'hizmetler']
        for (const page of staticPages) {
            const path = page ? `/${page}` : ''
            xml += `  <url>
    <loc>${BASE_URL}${path}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/de${path}"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${BASE_URL}/tr${path}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en${path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}"/>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
        }

        // Product pages with 3-language hreflang
        if (products && products.length > 0) {
            for (const product of products) {
                const slugDe = getSlug(product, 'de')
                const slugTr = getSlug(product, 'tr')
                const slugEn = getSlug(product, 'en')

                const pathDe = `/de/shop/produkt/${slugDe}`
                const pathTr = `/tr/shop/urun/${slugTr}`
                const pathEn = `/en/shop/product/${slugEn}`

                const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

                // German version (primary)
                xml += `  <url>
    <loc>${BASE_URL}${pathDe}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}${pathDe}"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${BASE_URL}${pathTr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${pathEn}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${pathDe}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`
                // Turkish version
                xml += `  <url>
    <loc>${BASE_URL}${pathTr}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}${pathDe}"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${BASE_URL}${pathTr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${pathEn}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
                // English version
                xml += `  <url>
    <loc>${BASE_URL}${pathEn}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}${pathDe}"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${BASE_URL}${pathTr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${pathEn}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
            }
        }

        // Blog posts
        if (blogPosts && blogPosts.length > 0) {
            for (const post of blogPosts) {
                const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                xml += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
            }
        }

        // Shop categories
        if (categories && categories.length > 0) {
            for (const cat of categories) {
                const slug = cat.slug || cat.id
                xml += `  <url>
    <loc>${BASE_URL}/shop/kategori/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
            }
        }

        xml += `</urlset>`

        return new Response(xml, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        })

    } catch (error) {
        console.error('Sitemap error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
