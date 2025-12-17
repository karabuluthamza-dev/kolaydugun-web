-- Clean up duplicate FAQs - keep only one of each question
-- This will delete older duplicates based on created_at

WITH ranked_faqs AS (
    SELECT 
        id,
        question_tr,
        ROW_NUMBER() OVER (PARTITION BY question_tr ORDER BY created_at DESC) as rn
    FROM shop_page_faqs
)
DELETE FROM shop_page_faqs
WHERE id IN (
    SELECT id FROM ranked_faqs WHERE rn > 1
);

-- Verify remaining FAQs
SELECT id, question_tr, display_order, created_at 
FROM shop_page_faqs 
ORDER BY display_order;
