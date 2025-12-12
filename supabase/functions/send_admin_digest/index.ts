// supabase/functions/send_admin_digest/index.ts
// Admin Günlük Özet E-postası
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DigestStats {
    users: { today: number; total: number; active24h: number; yesterdayNew: number };
    vendors: { today: number; pending: number; total: number; topActive: string[] };
    leads: { today: number; unanswered: number; week: number; yesterdayLeads: number };
    forum: { topics: number; comments: number; reports: number };
    blog: { posts: number; comments: number; totalPosts: number };
    reviews: { today: number; averageRating: number };
    support: { unanswered: number };
    finance: { todayRevenue: number; weekRevenue: number; pendingCredits: number };
    attention: string[];
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { test_mode, report_type } = await req.json().catch(() => ({}));

        // Get settings
        const { data: settings } = await supabase
            .from("site_settings")
            .select("admin_digest_settings")
            .single();

        const digestSettings = settings?.admin_digest_settings || {
            enabled: true,
            email: "karabulut.hamza@gmail.com"
        };

        if (!digestSettings.enabled && !test_mode) {
            return new Response(JSON.stringify({ success: false, message: "Digest disabled" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        if (!resendApiKey) {
            return new Response(JSON.stringify({ success: false, message: "Email service not configured" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Collect stats
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const stats: DigestStats = {
            users: { today: 0, total: 0, active24h: 0, yesterdayNew: 0 },
            vendors: { today: 0, pending: 0, total: 0, topActive: [] },
            leads: { today: 0, unanswered: 0, week: 0, yesterdayLeads: 0 },
            forum: { topics: 0, comments: 0, reports: 0 },
            blog: { posts: 0, comments: 0, totalPosts: 0 },
            reviews: { today: 0, averageRating: 0 },
            support: { unanswered: 0 },
            finance: { todayRevenue: 0, weekRevenue: 0, pendingCredits: 0 },
            attention: []
        };

        // --- Users ---
        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });
        stats.users.total = totalUsers || 0;

        const { count: todayUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.users.today = todayUsers || 0;

        // --- Vendors ---
        const { count: totalVendors } = await supabase
            .from("vendors")
            .select("*", { count: "exact", head: true });
        stats.vendors.total = totalVendors || 0;

        const { count: todayVendors } = await supabase
            .from("vendors")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.vendors.today = todayVendors || 0;

        const { count: pendingVendors } = await supabase
            .from("vendors")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");
        stats.vendors.pending = pendingVendors || 0;
        if (stats.vendors.pending > 0) {
            stats.attention.push(`${stats.vendors.pending} onay bekleyen tedarikçi`);
        }

        // --- Leads ---
        const { count: todayLeads } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.leads.today = todayLeads || 0;

        const { count: weekLeads } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .gte("created_at", weekAgo);
        stats.leads.week = weekLeads || 0;

        // --- Forum ---
        const { count: todayTopics } = await supabase
            .from("forum_posts")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.forum.topics = todayTopics || 0;

        const { count: todayComments } = await supabase
            .from("forum_comments")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.forum.comments = todayComments || 0;

        const { count: pendingReports } = await supabase
            .from("forum_reports")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");
        stats.forum.reports = pendingReports || 0;
        if (stats.forum.reports > 0) {
            stats.attention.push(`🚩 ${stats.forum.reports} bekleyen forum şikayeti`);
        }

        // --- Support (Messages) ---
        const { count: unansweredSupport } = await supabase
            .from("support_messages")
            .select("*", { count: "exact", head: true })
            .eq("status", "open");
        stats.support.unanswered = unansweredSupport || 0;
        if (stats.support.unanswered > 0) {
            stats.attention.push(`📩 ${stats.support.unanswered} cevaplanmamış destek mesajı`);
        }

        // --- Finance ---
        const { count: pendingCredits } = await supabase
            .from("credit_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");
        stats.finance.pendingCredits = pendingCredits || 0;
        if (stats.finance.pendingCredits > 0) {
            stats.attention.push(`💰 ${stats.finance.pendingCredits} onay bekleyen kredi talebi`);
        }

        // Get today's revenue from payments
        const { data: todayPayments } = await supabase
            .from("payments")
            .select("amount")
            .gte("created_at", todayStart)
            .eq("status", "completed");
        stats.finance.todayRevenue = todayPayments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

        // Get week's revenue
        const { data: weekPayments } = await supabase
            .from("payments")
            .select("amount")
            .gte("created_at", weekAgo)
            .eq("status", "completed");
        stats.finance.weekRevenue = weekPayments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

        // --- Blog ---
        const { count: todayBlogPosts } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart)
            .eq("status", "published");
        stats.blog.posts = todayBlogPosts || 0;

        const { count: totalBlogPosts } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("status", "published");
        stats.blog.totalPosts = totalBlogPosts || 0;

        // Blog comments
        const { count: todayBlogComments } = await supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.blog.comments = todayBlogComments || 0;

        // --- Reviews ---
        const { count: todayReviews } = await supabase
            .from("vendor_reviews")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart);
        stats.reviews.today = todayReviews || 0;

        // Average rating
        const { data: allReviews } = await supabase
            .from("vendor_reviews")
            .select("rating");
        if (allReviews && allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
            stats.reviews.averageRating = Math.round((totalRating / allReviews.length) * 10) / 10;
        }

        // --- Yesterday comparisons (for trends) ---
        const yesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);

        const { count: yesterdayUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", yesterdayStart.toISOString())
            .lt("created_at", todayStart);
        stats.users.yesterdayNew = yesterdayUsers || 0;

        const { count: yesterdayLeadsCount } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .gte("created_at", yesterdayStart.toISOString())
            .lt("created_at", todayStart);
        stats.leads.yesterdayLeads = yesterdayLeadsCount || 0;

        // --- Top Active Vendors (most leads this week) ---
        const { data: topVendorData } = await supabase
            .from("leads")
            .select("vendor_id, vendors(company_name)")
            .gte("created_at", weekAgo)
            .limit(100);

        if (topVendorData && topVendorData.length > 0) {
            const vendorCounts: Record<string, { name: string; count: number }> = {};
            topVendorData.forEach((lead: any) => {
                if (lead.vendor_id && lead.vendors?.company_name) {
                    if (!vendorCounts[lead.vendor_id]) {
                        vendorCounts[lead.vendor_id] = { name: lead.vendors.company_name, count: 0 };
                    }
                    vendorCounts[lead.vendor_id].count++;
                }
            });
            const sorted = Object.values(vendorCounts).sort((a, b) => b.count - a.count).slice(0, 3);
            stats.vendors.topActive = sorted.map(v => `${v.name} (${v.count})`);
        }

        // Generate beautiful HTML email
        const emailHtml = generateEmailHtml(stats, now, test_mode);

        // Send email
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "KolayDugun <noreply@kolaydugun.de>",
                to: digestSettings.emails || [digestSettings.email],
                subject: test_mode
                    ? `🧪 TEST - KolayDugun Günlük Rapor`
                    : `📊 KolayDugun Günlük Rapor - ${now.toLocaleDateString('tr-TR')}`,
                html: emailHtml
            })
        });

        const emailResult = await response.json();

        // Log the send
        await supabase.from("admin_digest_logs").insert({
            report_type: test_mode ? "test" : (report_type || "daily"),
            email_to: digestSettings.email,
            stats: stats,
            status: response.ok ? "sent" : "failed",
            error_message: response.ok ? null : JSON.stringify(emailResult)
        });

        return new Response(JSON.stringify({
            success: response.ok,
            message: response.ok
                ? "Digest email sent successfully"
                : `Failed to send email: ${emailResult?.message || emailResult?.error?.message || JSON.stringify(emailResult)}`,
            stats: stats,
            email_result: emailResult
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message || "Server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});

function generateEmailHtml(stats: DigestStats, date: Date, isTest: boolean): string {
    const dateStr = date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const attentionHtml = stats.attention.length > 0
        ? `
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px;">⚠️ Dikkat Gerektiren İşler</h2>
                <ul style="margin: 0; padding-left: 20px;">
                    ${stats.attention.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                </ul>
            </div>
        `
        : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📊 KolayDugun.de</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">
                ${isTest ? '🧪 TEST E-POSTASI' : 'Günlük Rapor'}
            </p>
            <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 13px;">${dateStr}</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            ${attentionHtml}

            <!-- Quick Stats Grid -->
            <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">📈 Hızlı Bakış</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 25px;">
                <div style="flex: 1; min-width: 120px; background: #e3f2fd; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #1976d2;">+${stats.users.today}</div>
                    <div style="font-size: 12px; color: #666;">Yeni Kullanıcı</div>
                </div>
                <div style="flex: 1; min-width: 120px; background: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #388e3c;">+${stats.vendors.today}</div>
                    <div style="font-size: 12px; color: #666;">Yeni Tedarikçi</div>
                </div>
                <div style="flex: 1; min-width: 120px; background: #fff3e0; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #f57c00;">+${stats.leads.today}</div>
                    <div style="font-size: 12px; color: #666;">Yeni Talep</div>
                </div>
                <div style="flex: 1; min-width: 120px; background: #fce4ec; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #c2185b;">${stats.forum.reports}</div>
                    <div style="font-size: 12px; color: #666;">Şikayet</div>
                </div>
            </div>

            <!-- Detailed Stats -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>👥 Toplam Kullanıcı</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.users.total.toLocaleString('tr-TR')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>🏢 Toplam Tedarikçi</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.vendors.total.toLocaleString('tr-TR')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>📋 Haftalık Talep</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.leads.week}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>💬 Bugün Forum Konusu</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.forum.topics}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>💬 Bugün Forum Yorumu</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.forum.comments}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>📝 Bugün Blog Yazısı</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.blog.posts} (Toplam: ${stats.blog.totalPosts})</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>💭 Bugün Blog Yorumu</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.blog.comments}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>⭐ Bugün Değerlendirme</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #666;">${stats.reviews.today} (Ort: ${stats.reviews.averageRating}/5)</td>
                </tr>
                ${stats.finance.pendingCredits > 0 ? `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 0;"><strong>💰 Bekleyen Kredi Talebi</strong></td>
                    <td style="padding: 12px 0; text-align: right; color: #f57c00; font-weight: bold;">${stats.finance.pendingCredits}</td>
                </tr>
                ` : ''}
            </table>

            <!-- Revenue Section -->
            ${stats.finance.todayRevenue > 0 || stats.finance.weekRevenue > 0 ? `
            <div style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px;">💰 Gelir Özeti</h3>
                <div style="display: flex; gap: 20px;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">€${stats.finance.todayRevenue.toFixed(2)}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Bugün</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">€${stats.finance.weekRevenue.toFixed(2)}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Bu Hafta</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Trend Comparison -->
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">📊 Dünle Karşılaştırma</h3>
                <div style="display: flex; gap: 20px; font-size: 13px;">
                    <div>
                        <span style="color: ${stats.users.today >= stats.users.yesterdayNew ? '#4caf50' : '#f44336'};">
                            ${stats.users.today >= stats.users.yesterdayNew ? '↑' : '↓'}
                        </span>
                        Kullanıcı: ${stats.users.today} (dün: ${stats.users.yesterdayNew})
                    </div>
                    <div>
                        <span style="color: ${stats.leads.today >= stats.leads.yesterdayLeads ? '#4caf50' : '#f44336'};">
                            ${stats.leads.today >= stats.leads.yesterdayLeads ? '↑' : '↓'}
                        </span>
                        Talep: ${stats.leads.today} (dün: ${stats.leads.yesterdayLeads})
                    </div>
                </div>
            </div>

            <!-- Top Active Vendors -->
            ${stats.vendors.topActive.length > 0 ? `
            <div style="background: #fff8e1; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #f57c00;">🏆 Bu Hafta En Aktif Tedarikçiler</h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px;">
                    ${stats.vendors.topActive.map(v => `<li style="margin-bottom: 5px;">${v}</li>`).join('')}
                </ol>
            </div>
            ` : ''}

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://kolaydugun.de/admin" 
                   style="display: inline-block; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px;">
                    📊 Admin Panele Git
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Bu e-posta KolayDugun.de yönetim sistemi tarafından otomatik gönderilmiştir.</p>
            <p>Rapor ayarlarını <a href="https://kolaydugun.de/admin/config" style="color: #e91e63;">Admin Panelden</a> değiştirebilirsiniz.</p>
        </div>

    </div>
</body>
</html>
    `;
}
