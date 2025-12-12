// supabase/functions/send_instant_payment_notification/index.ts
// Ödeme yapıldığında anlık bildirim gönderir
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
    try {
        const {
            payment_amount,
            payment_type,
            vendor_name,
            vendor_email,
            package_name,
            credits_purchased
        } = await req.json();

        // Get admin email from settings
        const { data: settings } = await supabase
            .from("site_settings")
            .select("admin_digest_settings")
            .single();

        const adminEmail = settings?.admin_digest_settings?.email || "karabulut.hamza@gmail.com";
        const instantEnabled = settings?.admin_digest_settings?.instant_notifications?.payment !== false;

        if (!instantEnabled) {
            return new Response(JSON.stringify({
                success: false,
                message: "Instant payment notifications disabled"
            }), { status: 200 });
        }

        if (!resendApiKey) {
            return new Response(JSON.stringify({
                success: false,
                message: "Email service not configured"
            }), { status: 200 });
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('tr-TR');

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 25px; border-radius: 16px 16px 0 0; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 10px;">💰</div>
            <h1 style="margin: 0; font-size: 22px;">Yeni Ödeme Alındı!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">${dateStr} - ${timeStr}</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Amount -->
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; font-weight: bold; color: #4caf50;">
                    ${payment_amount ? `€${payment_amount}` : '💳'}
                </div>
                <div style="color: #666; font-size: 14px; margin-top: 5px;">
                    ${payment_type || 'Kredi Satın Alma'}
                </div>
            </div>

            <!-- Details -->
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
                <table style="width: 100%; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Tedarikçi:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${vendor_name || 'Belirtilmedi'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">E-posta:</td>
                        <td style="padding: 8px 0; text-align: right;">${vendor_email || '-'}</td>
                    </tr>
                    ${package_name ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Paket:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${package_name}</td>
                    </tr>
                    ` : ''}
                    ${credits_purchased ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Kredi:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">+${credits_purchased} kredi</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-top: 25px;">
                <a href="https://kolaydugun.de/admin/finance" 
                   style="display: inline-block; background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 13px;">
                    📊 Finans Paneline Git
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 15px; color: #999; font-size: 11px;">
            <p>Bu anlık bildirim KolayDugun.de tarafından gönderilmiştir.</p>
        </div>

    </div>
</body>
</html>
        `;

        // Send email
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "KolayDugun.de <noreply@kolaydugun.de>",
                to: adminEmail,
                subject: `💰 Yeni Ödeme: ${payment_amount ? `€${payment_amount}` : 'Kredi Satın Alma'} - ${vendor_name || 'Tedarikçi'}`,
                html: emailHtml
            })
        });

        const emailResult = await response.json();

        // Log
        await supabase.from("admin_digest_logs").insert({
            report_type: "instant_payment",
            email_to: adminEmail,
            stats: { payment_amount, vendor_name, vendor_email, package_name, credits_purchased },
            status: response.ok ? "sent" : "failed",
            error_message: response.ok ? null : JSON.stringify(emailResult)
        });

        return new Response(JSON.stringify({
            success: response.ok,
            message: response.ok ? "Payment notification sent" : "Failed to send",
            email_result: emailResult
        }), { status: 200 });

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500 });
    }
});
