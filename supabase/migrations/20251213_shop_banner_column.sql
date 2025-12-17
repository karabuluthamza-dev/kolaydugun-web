-- shop_accounts tablosuna banner_url sütunu ekle
ALTER TABLE shop_accounts
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Yorum: Bu sütun mağaza sayfasındaki arka plan banner resmini tutar
COMMENT ON COLUMN shop_accounts.banner_url IS 'Mağaza banner/cover görseli URL';
