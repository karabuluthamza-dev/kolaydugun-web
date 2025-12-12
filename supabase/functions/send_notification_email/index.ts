// supabase/functions/send_notification_email.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    const { notification_id, user_ids } = await req.json();

    if (!notification_id || !user_ids) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    // Get notification details
    const { data: notification, error: notifError } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("id", notification_id)
      .single();

    if (notifError) throw notifError;

    // Check if Resend API key is configured
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping email send");
      return new Response(JSON.stringify({
        success: false,
        message: "Email service not configured"
      }), { status: 200 });
    }

    // Get user notification settings to filter out users who disabled email
    const { data: userSettings, error: settingsError } = await supabase
      .from("user_notification_settings")
      .select("user_id, email_enabled")
      .in("user_id", user_ids);

    if (settingsError) {
      console.warn("Could not fetch user settings:", settingsError);
    }

    // Create a map of user settings (default to enabled if no settings exist)
    const settingsMap = new Map();
    (userSettings || []).forEach((s: any) => {
      settingsMap.set(s.user_id, s.email_enabled);
    });

    // Filter user_ids to only include those with email_enabled (or no setting = default enabled)
    const enabledUserIds = user_ids.filter((id: string) => {
      const emailEnabled = settingsMap.get(id);
      // If no setting exists, default to enabled (true)
      // If setting exists, use its value
      return emailEnabled !== false;
    });

    if (enabledUserIds.length === 0) {
      console.log("No users with email enabled, skipping send");
      return new Response(JSON.stringify({
        success: true,
        sent: 0,
        skipped: user_ids.length,
        message: "All users have disabled email notifications"
      }), { status: 200 });
    }

    // Get user emails for enabled users only
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", enabledUserIds);

    if (usersError) throw usersError;

    // Send emails using Resend
    const emailPromises = (users || []).map(async (user: any) => {
      if (!user.email) return { skipped: true, reason: "no email" };

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 ${notification.title}</h1>
            </div>
            <div class="content">
              <p>${notification.message.replace(/\n/g, '<br>')}</p>
              <a href="https://kolaydugun.de/notifications" class="button">
                Bildirimleri Görüntüle
              </a>
            </div>
            <div class="footer">
              <p>KolayDugun.de Ekibi</p>
              <p><small>Bu e-postayı almak istemiyorsanız, <a href="https://kolaydugun.de/notifications">hesap ayarlarınızdan</a> bildirim tercihlerinizi güncelleyebilirsiniz.</small></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "KolayDugun.de <noreply@kolaydugun.de>",
          to: user.email,
          subject: `🔔 ${notification.title}`,
          html: emailHtml
        })
      });

      return response.json();
    });

    const results = await Promise.allSettled(emailPromises);

    // Update email_sent_at timestamp
    await supabase
      .from("admin_notifications")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", notification_id);

    const sent = results.filter(r => r.status === "fulfilled").length;
    const skipped = user_ids.length - enabledUserIds.length;

    return new Response(JSON.stringify({
      success: true,
      sent: sent,
      skipped: skipped,
      failed: results.filter(r => r.status === "rejected").length,
      message: skipped > 0 ? `${skipped} kullanıcı e-posta bildirimlerini kapatmış` : undefined
    }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500 });
  }
});
