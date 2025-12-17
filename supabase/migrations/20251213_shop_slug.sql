-- Shop Accounts Slug Migration
-- Her mağazanın benzersiz bir URL slug'ı olacak
-- Örnek: /shop/magaza/gelinlik-world

-- 1. slug sütunu ekle (yoksa)
ALTER TABLE shop_accounts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Mevcut mağazalara otomatik slug ata
-- business_name'den slug oluşturur: "Gelinlik World" -> "gelinlik-world"
UPDATE shop_accounts 
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(business_name),
                '[^a-zA-Z0-9\s-]', '', 'g'  -- Özel karakterleri kaldır
            ),
            '\s+', '-', 'g'  -- Boşlukları tire yap
        ),
        '-+', '-', 'g'  -- Çoklu tireleri tekle indir
    )
)
WHERE slug IS NULL AND business_name IS NOT NULL;

-- 3. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_shop_accounts_slug ON shop_accounts(slug);

-- Done!
-- Artık mağazalar şu URL'de görünecek: /shop/magaza/{slug}
