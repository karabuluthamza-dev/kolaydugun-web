import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * amazon-webhook Edge Function
 * 
 * Apify webhook'u çağırır ve ürün bilgilerini DB'ye yazar.
 * Apify actor bittiğinde bu endpoint'e POST yapar.
 */

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log("Webhook received:", JSON.stringify(payload));

        const { asin, runId, status, datasetId } = payload;

        if (!asin) {
            throw new Error("ASIN missing from webhook payload");
        }

        // Supabase client with proper options for Edge Functions
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            db: {
                schema: 'public'
            }
        });

        // Apify Token
        const APIFY_TOKEN = Deno.env.get("APIFY_API_TOKEN");

        if (status === "ACTOR.RUN.FAILED") {
            // Update cache to failed
            await supabase
                .from("shop_amazon_product_cache")
                .update({
                    status: "failed",
                    error_message: "Apify actor failed",
                    updated_at: new Date().toISOString()
                })
                .eq("asin", asin);

            console.log(`ASIN ${asin} failed`);
            return new Response(JSON.stringify({ ok: true, status: "failed" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Success - fetch dataset items
        if (!datasetId) {
            throw new Error("Dataset ID missing");
        }

        const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
        const datasetResponse = await fetch(datasetUrl);

        if (!datasetResponse.ok) {
            throw new Error("Failed to fetch dataset");
        }

        const items = await datasetResponse.json();
        console.log(`Dataset fetched, ${items.length} items`);

        if (!items || items.length === 0) {
            await supabase
                .from("shop_amazon_product_cache")
                .update({
                    status: "failed",
                    error_message: "No product data found",
                    updated_at: new Date().toISOString()
                })
                .eq("asin", asin);

            return new Response(JSON.stringify({ ok: true, status: "no_data" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const product = items[0];
        console.log("Product data:", JSON.stringify(product, null, 2));

        // Extract fields
        const productTitle = product.name || product.title || "";

        // Parse price
        let priceValue = null;
        if (typeof product.price === 'number') {
            priceValue = product.price;
        } else if (product.price && typeof product.price === 'object') {
            priceValue = product.price.value;
        } else if (typeof product.price === 'string') {
            const priceMatch = product.price.match(/[\d.,]+/);
            if (priceMatch) {
                priceValue = parseFloat(priceMatch[0].replace(",", "."));
            }
        }

        // Extract images
        let productImages: string[] = [];
        if (product.images && Array.isArray(product.images)) {
            productImages = product.images.map((img: any) =>
                typeof img === 'string' ? img : img.url || img.link
            ).filter(Boolean);
        } else if (product.imageUrl) {
            productImages = [product.imageUrl];
        } else if (product.thumbnailImage) {
            productImages = [product.thumbnailImage];
        }

        // Description
        const productDescription = product.description || product.features?.join("\n") || "";

        // Update cache with product data
        const { error: updateError } = await supabase
            .from("shop_amazon_product_cache")
            .update({
                status: "completed",
                name_de: productTitle,
                name_tr: productTitle,
                name_en: productTitle,
                description_de: productDescription.substring(0, 1000),
                description_tr: productDescription.substring(0, 1000),
                description_en: productDescription.substring(0, 1000),
                price: priceValue,
                price_raw: product.price,
                images: productImages.slice(0, 8),
                is_available: true,
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            })
            .eq("asin", asin);

        if (updateError) {
            console.error("Update error:", updateError);
            throw updateError;
        }

        console.log(`ASIN ${asin} completed successfully`);

        return new Response(
            JSON.stringify({
                ok: true,
                status: "completed",
                asin: asin,
                name: productTitle,
                price: priceValue
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ ok: false, error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
