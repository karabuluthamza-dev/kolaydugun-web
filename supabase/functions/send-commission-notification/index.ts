// supabase/functions/send-commission-notification/index.ts
// Komisyon durumu değişikliklerinde email bildirimi gönderir

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { earning_id, new_status, shop_id, amount, currency } = await req.json();

        if (!resendApiKey) {
            return new Response(JSON.stringify({ success: false, message: "Email service not configured" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Get shop owner's email
        const { data: shopData, error: shopError } = await supabase
            .from('shop_accounts')
            .select('business_name, user_id')
            .eq('id', shop_id)
            .single();

        if (shopError || !shopData) {
            return new Response(JSON.stringify({ success: false, message: "Shop not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Get user email from profiles
        const { data: profileData } = await supabase
            .from('profiles')
            .select('email, first_name')
            .eq('id', shopData.user_id)
            .single();

        if (!profileData?.email) {
            return new Response(JSON.stringify({ success: false, message: "User email not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Email templates by status
        const templates: Record<string, { subject: string; body: string }> = {
            approved: {
                subject: `✅ Komisyonunuz Onaylandı - ${amount} ${currency}`,
                body: `
                    <h2>Merhaba ${profileData.first_name || 'Değerli Üyemiz'},</h2>
                    <p><strong>${shopData.business_name}</strong> mağazanız için kazandığınız <strong>${amount} ${currency}</strong> komisyon onaylandı!</p>
                    <p>Ödeme işlemi yakında gerçekleştirilecektir.</p>
                    <p>Affiliate panelinizden tüm komisyonlarınızı takip edebilirsiniz.</p>
                    <br/>
                    <a href="https://kolaydugun.de/shop-panel/affiliates" style="background: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Panele Git</a>
                    <br/><br/>
                    <p>Teşekkürler,<br/>KolayDugun Ekibi</p>
                `
            },
            paid: {
                subject: `💰 Komisyon Ödemeniz Yapıldı - ${amount} ${currency}`,
                body: `
                    <h2>Merhaba ${profileData.first_name || 'Değerli Üyemiz'},</h2>
                    <p>Harika haberler! <strong>${amount} ${currency}</strong> tutarındaki komisyon ödemeniz hesabınıza aktarıldı! 🎉</p>
                    <p>Referans programımıza katkınız için teşekkür ederiz.</p>
                    <p>Daha fazla kazanmak için referans linkinizi paylaşmaya devam edin!</p>
                    <br/>
                    <a href="https://kolaydugun.de/shop-panel/affiliates" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Affiliate Paneli</a>
                    <br/><br/>
                    <p>Teşekkürler,<br/>KolayDugun Ekibi</p>
                `
            }
        };

        const template = templates[new_status];
        if (!template) {
            return new Response(JSON.stringify({ success: false, message: "Unknown status" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Send email via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "KolayDugun <noreply@kolaydugun.de>",
                to: [profileData.email],
                subject: template.subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            ${template.body}
                        </div>
                        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                            Bu e-posta KolayDugun.de tarafından otomatik gönderilmiştir.
                        </p>
                    </body>
                    </html>
                `
            })
        });

        const emailResult = await emailResponse.json();

        return new Response(JSON.stringify({
            success: emailResponse.ok,
            message: emailResponse.ok ? "Email sent successfully" : "Email failed",
            email_to: profileData.email,
            result: emailResult
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
