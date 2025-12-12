-- ============================================
-- Vendor Konumlarını Şehir Bilgisine Göre Güncelle
-- ============================================
-- Bu script, vendors tablosundaki satıcıların konumlarını
-- kayıt oldukları şehrin gerçek koordinatlarıyla günceller.

-- Önce cities tablosuna koordinat bilgilerini ekleyelim
ALTER TABLE cities 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Her şehir için gerçek koordinatları güncelle
UPDATE cities SET latitude = 52.5200, longitude = 13.4050 WHERE name = 'Berlin';
UPDATE cities SET latitude = 53.5511, longitude = 9.9937 WHERE name = 'Hamburg';
UPDATE cities SET latitude = 48.1351, longitude = 11.5820 WHERE name = 'München (Munich)';
UPDATE cities SET latitude = 50.9375, longitude = 6.9603 WHERE name = 'Köln (Cologne)';
UPDATE cities SET latitude = 50.1109, longitude = 8.6821 WHERE name = 'Frankfurt am Main';
UPDATE cities SET latitude = 48.7758, longitude = 9.1829 WHERE name = 'Stuttgart';
UPDATE cities SET latitude = 51.2277, longitude = 6.7735 WHERE name = 'Düsseldorf';
UPDATE cities SET latitude = 51.5136, longitude = 7.4653 WHERE name = 'Dortmund';
UPDATE cities SET latitude = 51.4556, longitude = 7.0116 WHERE name = 'Essen';
UPDATE cities SET latitude = 53.0793, longitude = 8.8017 WHERE name = 'Bremen';
UPDATE cities SET latitude = 52.3759, longitude = 9.7320 WHERE name = 'Hannover';
UPDATE cities SET latitude = 51.3397, longitude = 12.3731 WHERE name = 'Leipzig';
UPDATE cities SET latitude = 51.0504, longitude = 13.7373 WHERE name = 'Dresden';
UPDATE cities SET latitude = 49.4521, longitude = 11.0767 WHERE name = 'Nürnberg (Nuremberg)';
UPDATE cities SET latitude = 51.4344, longitude = 6.7623 WHERE name = 'Duisburg';
UPDATE cities SET latitude = 51.4818, longitude = 7.2162 WHERE name = 'Bochum';
UPDATE cities SET latitude = 51.2562, longitude = 7.1508 WHERE name = 'Wuppertal';
UPDATE cities SET latitude = 52.0302, longitude = 8.5325 WHERE name = 'Bielefeld';
UPDATE cities SET latitude = 50.7374, longitude = 7.0982 WHERE name = 'Bonn';
UPDATE cities SET latitude = 51.9607, longitude = 7.6261 WHERE name = 'Münster';
UPDATE cities SET latitude = 49.0069, longitude = 8.4037 WHERE name = 'Karlsruhe';
UPDATE cities SET latitude = 49.4875, longitude = 8.4660 WHERE name = 'Mannheim';
UPDATE cities SET latitude = 50.0826, longitude = 8.2400 WHERE name = 'Wiesbaden';
UPDATE cities SET latitude = 48.3705, longitude = 10.8978 WHERE name = 'Augsburg';
UPDATE cities SET latitude = 51.1805, longitude = 6.4428 WHERE name = 'Mönchengladbach';
UPDATE cities SET latitude = 51.5553, longitude = 7.0873 WHERE name = 'Gelsenkirchen';
UPDATE cities SET latitude = 52.2689, longitude = 10.5268 WHERE name = 'Braunschweig';
UPDATE cities SET latitude = 54.3233, longitude = 10.1394 WHERE name = 'Kiel';
UPDATE cities SET latitude = 50.7753, longitude = 6.0839 WHERE name = 'Aachen';
UPDATE cities SET latitude = 50.8278, longitude = 12.9214 WHERE name = 'Chemnitz';
UPDATE cities SET latitude = 52.1205, longitude = 11.6276 WHERE name = 'Magdeburg';
UPDATE cities SET latitude = 47.9990, longitude = 7.8421 WHERE name = 'Freiburg im Breisgau';
UPDATE cities SET latitude = 51.3388, longitude = 6.5853 WHERE name = 'Krefeld';
UPDATE cities SET latitude = 53.8655, longitude = 10.6866 WHERE name = 'Lübeck';
UPDATE cities SET latitude = 51.4697, longitude = 6.8514 WHERE name = 'Oberhausen';
UPDATE cities SET latitude = 50.9848, longitude = 11.0299 WHERE name = 'Erfurt';
UPDATE cities SET latitude = 49.9929, longitude = 8.2473 WHERE name = 'Mainz';
UPDATE cities SET latitude = 54.0887, longitude = 12.1403 WHERE name = 'Rostock';
UPDATE cities SET latitude = 51.3127, longitude = 9.4797 WHERE name = 'Kassel';
UPDATE cities SET latitude = 51.3670, longitude = 7.4632 WHERE name = 'Hagen';
UPDATE cities SET latitude = 49.2401, longitude = 6.9969 WHERE name = 'Saarbrücken';
UPDATE cities SET latitude = 51.6739, longitude = 7.8150 WHERE name = 'Hamm';
UPDATE cities SET latitude = 52.3906, longitude = 13.0645 WHERE name = 'Potsdam';
UPDATE cities SET latitude = 49.4810, longitude = 8.4353 WHERE name = 'Ludwigshafen';
UPDATE cities SET latitude = 53.1435, longitude = 8.2146 WHERE name = 'Oldenburg';
UPDATE cities SET latitude = 51.0406, longitude = 6.9956 WHERE name = 'Leverkusen';
UPDATE cities SET latitude = 52.2799, longitude = 8.0472 WHERE name = 'Osnabrück';
UPDATE cities SET latitude = 51.1652, longitude = 7.0679 WHERE name = 'Solingen';
UPDATE cities SET latitude = 49.3988, longitude = 8.6724 WHERE name = 'Heidelberg';
UPDATE cities SET latitude = 51.5386, longitude = 7.2163 WHERE name = 'Herne';
UPDATE cities SET latitude = 48.4011, longitude = 9.9876 WHERE name = 'Ulm';
UPDATE cities SET latitude = 49.0134, longitude = 12.1016 WHERE name = 'Regensburg';

-- Şimdi vendors tablosunu güncelle
-- Her vendor'ın city alanına göre cities tablosundan koordinatları çek
UPDATE vendors v
SET 
    latitude = c.latitude,
    longitude = c.longitude,
    address = c.name || ', Germany'
FROM cities c
WHERE v.city = c.name
  AND v.latitude IS NULL;

-- ============================================
-- Doğrulama Sorguları
-- ============================================

-- 1. Cities tablosundaki koordinatları kontrol et
SELECT 
    name,
    latitude,
    longitude,
    CASE 
        WHEN latitude IS NULL THEN '❌ Koordinat yok'
        ELSE '✅ Koordinat var'
    END as status
FROM cities
ORDER BY name;

-- 2. Vendor'ların konum bilgilerini kontrol et
SELECT 
    v.id,
    v.business_name,
    v.city,
    v.latitude,
    v.longitude,
    v.address,
    CASE 
        WHEN v.latitude IS NULL THEN '❌ Konum yok'
        ELSE '✅ Konum var'
    END as location_status
FROM vendors v
ORDER BY 
    CASE WHEN v.latitude IS NULL THEN 0 ELSE 1 END,
    v.business_name
LIMIT 50;

-- 3. Şehir bazında vendor dağılımı
SELECT 
    c.name as city_name,
    COUNT(v.id) as vendor_count,
    COUNT(CASE WHEN v.latitude IS NOT NULL THEN 1 END) as with_location,
    COUNT(CASE WHEN v.latitude IS NULL THEN 1 END) as without_location
FROM cities c
LEFT JOIN vendors v ON v.city = c.name
GROUP BY c.name
ORDER BY vendor_count DESC;

-- 4. Toplam istatistikler
SELECT 
    COUNT(*) as total_vendors,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_location,
    COUNT(CASE WHEN latitude IS NULL THEN 1 END) as without_location,
    ROUND(COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as location_percentage
FROM vendors;

-- ============================================
-- NOTLAR
-- ============================================
-- 1. Bu script önce cities tablosuna koordinat kolonları ekler
-- 2. Sonra her şehir için gerçek koordinatları günceller
-- 3. En son vendors tablosundaki satıcıların konumlarını şehirlerine göre günceller
-- 4. Sadece latitude NULL olan (konum bilgisi olmayan) vendor'lar güncellenir
-- 5. GPS tabanlı arama özelliği için artık gerçek koordinatlar kullanılacak
