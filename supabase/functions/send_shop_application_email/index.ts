import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "re_7qaDXNov_KonC6T8JZ8bSaYgpPztcCrRG");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email şablonları
const getApprovalEmailHtml = (businessName: string, email: string, plan: string, loginUrl: string) => `
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
        .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .btn { display: inline-block; background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 600; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Tebrikler! Mağazanız Onaylandı</h1>
        </div>
        <div class="content">
            <p>Merhaba <strong>${businessName}</strong>,</p>
            
            <div class="highlight">
                <strong>Harika haber!</strong> Shop Marketplace başvurunuz onaylandı ve mağazanız artık aktif!
            </div>
            
            <div class="info-box">
                <div class="info-row">
                    <span>📧 E-posta:</span>
                    <strong>${email}</strong>
                </div>
                <div class="info-row">
                    <span>📦 Plan:</span>
                    <strong>${plan}</strong>
                </div>
            </div>
            
            <p>Hemen mağaza panelinize giriş yaparak ürünlerinizi eklemeye başlayabilirsiniz:</p>
            
            <center>
                <a href="${loginUrl}" class="btn">Mağaza Panelime Git →</a>
            </center>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Giriş yapmak için başvuru sırasında kullandığınız e-posta adresini kullanın. 
                Henüz şifreniz yoksa "Şifremi Unuttum" ile yeni şifre oluşturabilirsiniz.
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

const getRejectionEmailHtml = (businessName: string, reason: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #6b7280; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Başvuru Durumu</h1>
        </div>
        <div class="content">
            <p>Merhaba <strong>${businessName}</strong>,</p>
            
            <p>Shop Marketplace başvurunuzu inceledik. Maalesef başvurunuz şu anda onaylanamadı.</p>
            
            <div class="reason-box">
                <strong>Sebep:</strong><br>
                ${reason || 'Başvurunuz değerlendirme kriterlerimizi karşılamamaktadır.'}
            </div>
            
            <p>Eksiklikleri giderdikten sonra tekrar başvurabilirsiniz. Sorularınız için bizimle iletişime geçebilirsiniz.</p>
            
            <p style="margin-top: 20px;">Saygılarımızla,<br>KolayDugun Ekibi</p>
        </div>
        <div class="footer">
            <p>KolayDugun Shop Marketplace</p>
            <p>© 2024 KolayDugun. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`;

// Başvuru alındı email şablonu
const getReceivedEmailHtml = (businessName: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .steps { background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .step { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
        .step-num { width: 28px; height: 28px; background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Başvurunuz Alındı!</h1>
        </div>
        <div class="content">
            <p>Merhaba <strong>${businessName}</strong>,</p>
            
            <div class="info-box">
                Shop Marketplace başvurunuz başarıyla alındı! Ekibimiz en kısa sürede başvurunuzu inceleyecek.
            </div>
            
            <div class="steps">
                <h3 style="margin-top: 0;">📋 Sonraki Adımlar:</h3>
                <div class="step">
                    <span class="step-num">1</span>
                    <span>Başvurunuz 24 saat içinde incelenecek</span>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <span>Onay durumunuz email ile bildirilecek</span>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <span>Onay sonrası mağaza panelinize giriş yapabileceksiniz</span>
                </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
                Sorularınız için <a href="mailto:kontakt@kolaydugun.de" style="color: #FF6B9D;">kontakt@kolaydugun.de</a> adresinden bize ulaşabilirsiniz.
            </p>
            
            <p style="margin-top: 20px;">Teşekkürler,<br>KolayDugun Ekibi</p>
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
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const {
            type,           // 'approved', 'rejected' veya 'received'
            email,
            businessName,
            plan,           // Sadece onay için
            reason          // Sadece red için
        } = await req.json();

        if (!type || !email || !businessName) {
            throw new Error('Missing required fields: type, email, businessName');
        }

        let subject: string;
        let html: string;

        if (type === 'approved') {
            subject = `🎉 Mağazanız Onaylandı - ${businessName}`;
            const loginUrl = 'https://kolaydugun.de/login';
            html = getApprovalEmailHtml(businessName, email, plan || 'Starter', loginUrl);
        } else if (type === 'rejected') {
            subject = `📋 Başvuru Durumu - ${businessName}`;
            html = getRejectionEmailHtml(businessName, reason || '');
        } else if (type === 'received') {
            subject = `📬 Başvurunuz Alındı - ${businessName}`;
            html = getReceivedEmailHtml(businessName);
        } else {
            throw new Error('Invalid type. Must be "approved", "rejected" or "received"');
        }

        const data = await resend.emails.send({
            from: 'KolayDugun <noreply@kolaydugun.de>',
            to: email,
            subject: subject,
            html: html,
        });

        console.log('Email sent successfully:', data);

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
