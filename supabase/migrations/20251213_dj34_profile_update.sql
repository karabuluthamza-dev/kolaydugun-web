-- DJ34 Istanbul için Gerçek Demo İçerik
-- Logo, Banner, İletişim Bilgileri ve Açıklama

UPDATE shop_accounts
SET 
    -- Logo
    logo_url = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    
    -- Banner/Cover Image
    banner_url = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop',
    
    -- Açıklama (3 dil)
    description_tr = 'Almanya genelinde profesyonel DJ ve etkinlik hizmetleri. Düğün, nişan, kına gecesi ve özel organizasyonlarınız için unutulmaz anlar yaratıyoruz. 10+ yıllık tecrübe ile hizmetinizdeyiz.',
    description_de = 'Professionelle DJ- und Event-Services deutschlandweit. Wir schaffen unvergessliche Momente für Ihre Hochzeit, Verlobung, Henna-Nacht und private Veranstaltungen. Mit über 10 Jahren Erfahrung.',
    description_en = 'Professional DJ and event services throughout Germany. We create unforgettable moments for your wedding, engagement, henna night and private events. With 10+ years of experience.',
    
    -- İletişim bilgileri
    contact_whatsapp = '+4917643301828',
    contact_phone = '+4917643301828',
    contact_email = 'dj34istanbul@gmail.com',
    website_url = 'https://instagram.com/dj34istanbul'

WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

-- Kontrol
SELECT business_name, logo_url, banner_url, contact_whatsapp, description_tr FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';
