import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * fetch-amazon-product Edge Function
 * Kendi Amazon.de scraper'ımız - Doğrudan HTML'den veri çeker
 */

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { asin } = await req.json();

        if (!asin) {
            throw new Error("ASIN gerekli");
        }

        // Affiliate tag al
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const { data: tagData } = await supabase
            .from("shop_amazon_settings")
            .select("value")
            .eq("key", "affiliate_tag")
            .single();

        const affiliateTag = tagData?.value || "kolaydg1-21";
        const productUrl = `https://www.amazon.de/dp/${asin}`;
        const affiliateUrl = `https://www.amazon.de/dp/${asin}?tag=${affiliateTag}`;

        console.log(`Fetching: ${productUrl}`);

        // Amazon sayfasını çek
        const response = await fetch(productUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'de-DE,de;q=0.9',
                'Accept': 'text/html,application/xhtml+xml'
            }
        });

        if (!response.ok) {
            throw new Error(`Amazon fetch failed: ${response.status}`);
        }

        const html = await response.text();
        console.log(`HTML length: ${html.length}`);

        // Debug - check if we hit a captcha or robot page
        if (html.includes('robot') || html.includes('captcha') || html.includes('CAPTCHA')) {
            console.log("CAPTCHA detected!");
            throw new Error("Amazon robot/captcha sayfası döndü. Biraz bekleyip tekrar deneyin.");
        }

        // Parse product data
        let title = "";
        let price: number | null = null;
        let priceRaw = "";
        let description = "";
        let images: string[] = [];

        // 1. TITLE - Try multiple patterns
        const titlePatterns = [
            /id="productTitle"[^>]*>\s*([^<]+)/i,
            /id="title"[^>]*>\s*<span[^>]*>\s*([^<]+)/i,
            /"title"\s*:\s*"([^"]{10,})"/,
            /<title>([^<]+?)\s*:\s*Amazon/i,
            /<title>([^<]+)</i
        ];

        for (const pattern of titlePatterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].trim().length > 5) {
                title = match[1].trim()
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&nbsp;/g, ' ');
                console.log("Title found:", title.substring(0, 50));
                break;
            }
        }

        // 2. PRICE - Multiple patterns
        const pricePatterns = [
            /<span class="a-price-whole">(\d+)<.*?<span class="a-price-fraction">(\d+)</s,
            /<span class="a-offscreen">(\d+),(\d+)\s*€/,
            /class="a-price"[^>]*>.*?(\d+)[,.](\d+)\s*€/s,
            /"price":"?(\d+)[,.](\d+)"?/,
            /(\d+)[,.](\d+)\s*€/
        ];

        for (const pattern of pricePatterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                const whole = match[1];
                const fraction = match[2] || "00";
                price = parseFloat(`${whole}.${fraction}`);
                priceRaw = `€${whole},${fraction}`;
                console.log("Price found:", price);
                break;
            }
        }

        // 3. IMAGES - Extract high-res images
        const imageSet = new Set<string>();

        // Pattern 1: hiRes in data
        const hiResPattern = /"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g;
        let imgMatch;
        while ((imgMatch = hiResPattern.exec(html)) !== null && imageSet.size < 8) {
            imageSet.add(imgMatch[1]);
        }

        // Pattern 2: large images
        if (imageSet.size === 0) {
            const largePattern = /"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g;
            while ((imgMatch = largePattern.exec(html)) !== null && imageSet.size < 8) {
                imageSet.add(imgMatch[1]);
            }
        }

        // Pattern 3: main image
        if (imageSet.size === 0) {
            const mainImgMatch = html.match(/id="landingImage"[^>]*src="([^"]+)"/i);
            if (mainImgMatch) {
                imageSet.add(mainImgMatch[1]);
            }
        }

        images = Array.from(imageSet);
        console.log("Images found:", images.length);

        // 4. DESCRIPTION - Feature bullets
        const features: string[] = [];
        const featurePattern = /<span class="a-list-item">\s*([^<]{15,200})\s*<\/span>/gi;
        let featMatch;
        while ((featMatch = featurePattern.exec(html)) !== null && features.length < 5) {
            const feat = featMatch[1].trim().replace(/&[^;]+;/g, ' ');
            if (!feat.includes('{') && !feat.includes('function')) {
                features.push("✓ " + feat);
            }
        }
        description = features.join("\n");

        // Validate we got something
        if (!title) {
            console.log("No title found. HTML first 1000 chars:", html.substring(0, 1000));
            throw new Error("Ürün bilgisi çıkarılamadı. ASIN'i kontrol edin.");
        }

        return new Response(
            JSON.stringify({
                success: true,
                status: "completed",
                asin: asin,
                name_de: title,
                name_tr: title,
                name_en: title,
                description_de: description,
                description_tr: description,
                description_en: description,
                price: price,
                price_raw: priceRaw,
                images: images,
                affiliate_url: affiliateUrl,
                is_available: true
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err: unknown) {
        const error = err as Error;
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
