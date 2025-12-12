-- ============================================
-- Otomatik Koordinat Atama Trigger Testi
-- ============================================

-- Test 1: Yeni vendor ekle (koordinat olmadan, sadece şehir ile)
INSERT INTO vendors (
    business_name,
    category,
    city,
    description,
    price_range,
    user_id
) VALUES (
    'Test Fotoğrafçı - Otomatik Koordinat',
    'Wedding Photography',
    'München (Munich)',
    'Bu vendor trigger testi için oluşturuldu. Koordinat otomatik atanmalı.',
    '€€€',
    (SELECT id FROM auth.users LIMIT 1)
) RETURNING 
    id,
    business_name,
    city,
    latitude,
    longitude,
    address;

-- Test 2: Mevcut vendor'ın şehrini değiştir
-- (Önce bir vendor seç)
WITH test_vendor AS (
    SELECT id FROM vendors WHERE business_name LIKE '%Test%' LIMIT 1
)
UPDATE vendors
SET city = 'Hamburg'
WHERE id = (SELECT id FROM test_vendor)
RETURNING 
    id,
    business_name,
    city,
    latitude,
    longitude,
    address;

-- Test 3: Tüm vendor'ların konum durumunu kontrol et
SELECT 
    COUNT(*) as total_vendors,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_location,
    COUNT(CASE WHEN latitude IS NULL THEN 1 END) as without_location,
    ROUND(COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2) as location_percentage
FROM vendors;

-- Test 4: Koordinatı olmayan vendor'ları listele
SELECT 
    id,
    business_name,
    city,
    latitude,
    longitude,
    CASE 
        WHEN city IS NULL THEN '❌ Şehir bilgisi yok'
        WHEN latitude IS NULL THEN '⚠️ Şehir var ama koordinat yok'
        ELSE '✅ Koordinat var'
    END as status
FROM vendors
WHERE latitude IS NULL
ORDER BY city;

-- Test 5: Trigger'ın çalıştığını doğrula
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'assign_coordinates_on_insert_or_update'
  AND event_object_table = 'vendors';
