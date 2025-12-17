-- FIX DUPLICATES AND REORDER
-- 1. Mükerrer (Benzer) Soruları Temizle
-- İki farklı script çalıştırıldığı için benzer sorular oluştu, bunları temizliyoruz.

-- Remove "Ürün görsellerini nasıl yüklerim?" (Keep "Resim linki..." as it is more specific)
DELETE FROM public.shop_faqs WHERE question_tr = 'Ürün görsellerini nasıl yüklerim?';

-- Remove "Ana Shop Başvurusu nedir?" (Keep "ne işe yarar?")
DELETE FROM public.shop_faqs WHERE question_tr = '"Ana Shop Başvurusu" nedir?';

-- Remove "Toplu ürün nasıl silerim?" (Keep "Aynı anda birden fazla..." as it is friendlier)
DELETE FROM public.shop_faqs WHERE question_tr = 'Toplu ürün nasıl silerim?';

-- 2. SIRALAMAYI DÜZELT (Re-sequence)
-- Tüm soruları oluşturulma tarihine veya kategoriye göre yeniden 1'den başlayarak numaralandır
WITH ranked_faqs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY category, created_at) as new_rank
  FROM public.shop_faqs
)
UPDATE public.shop_faqs
SET display_order = ranked_faqs.new_rank
FROM ranked_faqs
WHERE public.shop_faqs.id = ranked_faqs.id;
