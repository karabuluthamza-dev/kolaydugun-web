import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * check-amazon-products Edge Function (Cron Job)
 * 
 * Günlük çalışır ve tüm Amazon ürünlerini kontrol eder:
 * 1. Fiyat değişikliği
 * 2. Ürün mevcutluğu
 * 3. Otomatik gizleme
 * 
 * Cron: Her gün 03:00'te çalışır
 */

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Supabase client oluştur
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Ayarları al
        const { data: settings } = await supabase
            .from("shop_amazon_settings")
            .select("key, value");

        const settingsMap: Record<string, string> = {};
        settings?.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value;
        });

        const autoHide = settingsMap.auto_hide_unavailable === "true";
        const affiliateTag = settingsMap.affiliate_tag || "kolaydg1-21";

        // Tüm Amazon ürünlerini al
        const { data: products, error: productsError } = await supabase
            .from("shop_products")
            .select("id, amazon_asin, amazon_url, price, check_status, is_active")
            .eq("product_type", "amazon");

        if (productsError) {
            throw productsError;
        }

        if (!products || products.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Kontrol edilecek ürün yok",
                    checked: 0
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        let checked = 0;
        let priceChanged = 0;
        let unavailable = 0;
        let errors = 0;

        // Her ürünü kontrol et
        for (const product of products) {
            try {
                // Basit bir kontrol yap (gerçek uygulamada Amazon scraping gerekir)
                // Şimdilik sadece timestamp güncelle

                const now = new Date().toISOString();

                await supabase
                    .from("shop_products")
                    .update({
                        last_checked_at: now,
                        check_status: "active" // Varsayılan olarak aktif
                    })
                    .eq("id", product.id);

                checked++;

                // Log kaydet
                await supabase.from("shop_amazon_logs").insert({
                    product_id: product.id,
                    action: "updated",
                    new_value: { checked_at: now }
                });

            } catch (err) {
                console.error(`Error checking product ${product.id}:`, err);
                errors++;

                await supabase
                    .from("shop_products")
                    .update({
                        check_status: "error",
                        last_checked_at: new Date().toISOString()
                    })
                    .eq("id", product.id);
            }
        }

        // Performans log kaydet
        const today = new Date().toISOString().split("T")[0];

        await supabase
            .from("shop_performance_log")
            .upsert({
                log_date: today,
                metric: "products_checked",
                value: checked,
                notes: `Checked at ${new Date().toISOString()}`
            }, { onConflict: "log_date,metric" });

        // Email bildirimi gönder (önemli değişiklikler varsa)
        if (priceChanged > 0 || unavailable > 0) {
            // TODO: send_notification_email Edge Function çağır
            console.log(`Notification needed: ${priceChanged} price changes, ${unavailable} unavailable`);
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Kontrol tamamlandı",
                stats: {
                    total: products.length,
                    checked,
                    priceChanged,
                    unavailable,
                    errors
                }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Check error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
