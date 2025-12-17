import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "re_7qaDXNov_KonC6T8JZ8bSaYgpPztcCrRG");

// Şifre sıfırlama email şablonu
const getPasswordSetupEmailHtml = (businessName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .highlight { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .steps { background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .step { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .step-num { width: 28px; height: 28px; background: #FF6B9D; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Mağazanız Hazır!</h1>
        </div>
        <div class="content">
            <p>Merhaba <strong>${businessName}</strong>,</p>
            
            <div class="highlight">
                Tebrikler! Shop Marketplace başvurunuz onaylandı. Mağaza panelinize erişmek için şifrenizi belirlemeniz gerekiyor.
            </div>
            
            <center>
                <a href="${resetLink}" class="btn">🔐 Şifremi Belirle</a>
            </center>
            
            <div class="steps">
                <h3 style="margin-top: 0;">📋 Sonraki Adımlar:</h3>
                <div class="step">
                    <span class="step-num">1</span>
                    <span>Yukarıdaki butona tıklayarak şifrenizi belirleyin</span>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <span>Giriş yapın ve mağaza panelinize erişin</span>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <span>Ürünlerinizi ekleyerek satışa başlayın!</span>
                </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
                Bu link 24 saat geçerlidir. Link süresini doldurmuşsa, giriş sayfasından "Şifremi Unuttum" seçeneğini kullanabilirsiniz.
            </p>
        </div>
        <div class="footer">
            <p>KolayDugun Shop Marketplace</p>
            <p>© 2024 KolayDugun. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, businessName, shopAccountId } = await req.json();

        if (!email || !businessName || !shopAccountId) {
            throw new Error('Missing required fields: email, businessName, shopAccountId');
        }

        // Admin client oluştur (service_role key ile)
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") || "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Önce bu email ile kullanıcı var mı kontrol et
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);

        let userId: string;
        let resetLink: string;

        if (existingUser) {
            // Kullanıcı zaten var, sadece şifre sıfırlama linki gönder
            userId = existingUser.id;
            console.log('User already exists:', userId);

            // Şifre sıfırlama linki oluştur
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: email,
                options: {
                    redirectTo: 'https://kolaydugun.de/update-password'
                }
            });

            if (linkError) {
                throw linkError;
            }

            resetLink = linkData.properties.action_link;
        } else {
            // Yeni kullanıcı oluştur
            const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true, // Email'i onaylı olarak işaretle
                user_metadata: {
                    business_name: businessName,
                    role: 'shop_owner'
                }
            });

            if (createError) {
                throw createError;
            }

            userId = newUser.user.id;
            console.log('User created:', userId);

            // Şifre sıfırlama linki oluştur
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: email,
                options: {
                    redirectTo: 'https://kolaydugun.de/update-password'
                }
            });

            if (linkError) {
                throw linkError;
            }

            resetLink = linkData.properties.action_link;
        }

        // shop_accounts tablosunda user_id'yi güncelle
        const { error: updateError } = await supabaseAdmin
            .from('shop_accounts')
            .update({ user_id: userId })
            .eq('id', shopAccountId);

        if (updateError) {
            console.error('Failed to update shop_accounts:', updateError);
        }

        // Email gönder
        const emailResult = await resend.emails.send({
            from: 'KolayDugun <noreply@kolaydugun.de>',
            to: email,
            subject: `🎉 Mağazanız Onaylandı - ${businessName}`,
            html: getPasswordSetupEmailHtml(businessName, resetLink),
        });

        console.log('Email sent:', emailResult);

        return new Response(JSON.stringify({
            success: true,
            userId,
            message: 'User created and password reset email sent'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
            error: error.message,
            success: false
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
