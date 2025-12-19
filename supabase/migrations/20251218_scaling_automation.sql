-- Centralized Logic for AI Insight Generation (Postgres Layer)
-- This function can be called per-vendor or in bulk.

CREATE OR REPLACE FUNCTION public.generate_vendor_performance_report(target_vendor_id UUID)
RETURNS JSONB AS $$
DECLARE
    perf_data RECORD;
    lead_count INTEGER;
    conversion_rate DECIMAL;
    summary TEXT;
    recommendations JSONB;
    score INTEGER;
    v_business_name TEXT;
BEGIN
    -- 1. Fetch Latest Performance
    SELECT * INTO perf_data 
    FROM public.vendor_performance_snapshots 
    WHERE vendor_id = target_vendor_id 
    ORDER BY snapshot_date DESC LIMIT 1;
    
    SELECT business_name INTO v_business_name FROM public.vendors WHERE id = target_vendor_id;

    -- 2. Fetch Lead Count (Last 30 days)
    SELECT COUNT(*) INTO lead_count 
    FROM public.vendor_leads 
    WHERE vendor_id = target_vendor_id 
    AND created_at > (now() - interval '30 days');

    -- 3. Logic Engine
    IF perf_data IS NULL THEN
        summary := v_business_name || ' için henüz Google verisi bulunamadı. Yeni bir dükkan olabilir veya henüz Google tarafından indekslenmemiş olabilir.';
        recommendations := '["Google Search Console üzerinden URL denetimi yapın.", "Site haritasına (sitemap) eklendiğinden emin olun.", "Profil doluluk oranını %100''e çıkarın."]'::jsonb;
        score := 10;
    ELSE
        conversion_rate := CASE WHEN perf_data.views > 0 THEN (lead_count::decimal / perf_data.views) * 100 ELSE 0 END;
        score := LEAST(100, (perf_data.views / 2) + (perf_data.impressions / 10));

        IF conversion_rate < 1 AND perf_data.views > 20 THEN
            summary := 'Sayfanız ' || perf_data.views || ' kez görüntülendi ancak satış dönüşümü (%' || ROUND(conversion_rate,1) || ') düşük. Ziyaretçiler teklif istemeden ayrılıyorlar.';
            recommendations := '["Fotoğraf galerisindeki ilk 3 görseli daha çekici hale getirin.", "Açıklama kısmına ''Neden Sizi Seçmeliler?'' bölümü ekleyin.", "Hizmet fiyatlarınızı veya başlangıç fiyatınızı belirtin."]'::jsonb;
        ELSIF perf_data.views < 10 THEN
            summary := 'Dönüşüm oranınız potansiyel barındırıyor ancak toplam görünürlük (' || perf_data.views || ' izlenme) çok düşük. Google sıralamalarında geride kalıyor olabilirsiniz.';
            recommendations := '["İşletme açıklamasında daha fazla anahtar kelime kullanın.", "Vitrin (Featured) özelliğini aktif ederek trafiği artırın.", "Diğer sosyal mecralardan bu sayfaya link verin."]'::jsonb;
        ELSE
            summary := 'Harika! ' || v_business_name || ' dengeli bir performans sergiliyor. %' || ROUND(conversion_rate,1) || ' dönüşüm oranı ve ' || perf_data.views || ' izlenme ile sektör ortalamasının üzerindesiniz.';
            recommendations := '["Rezervasyon takviminizi güncel tutun.", "Yeni referans fotoğrafları ekleyerek ivmeyi koruyun.", "Tedarikçi başarı öykünüzü bizimle paylaşın!"]'::jsonb;
        END IF;
    END IF;

    -- 4. Upsert into insights table
    INSERT INTO public.vendor_insights (
        vendor_id, 
        summary, 
        recommendations, 
        performance_score, 
        metrics, 
        is_published, 
        updated_at
    )
    VALUES (
        target_vendor_id, 
        summary, 
        recommendations, 
        score, 
        jsonb_build_object('conversion_rate', ROUND(COALESCE(conversion_rate, 0),1)),
        true, 
        now()
    )
    ON CONFLICT (vendor_id) DO UPDATE SET
        summary = EXCLUDED.summary,
        recommendations = EXCLUDED.recommendations,
        performance_score = EXCLUDED.performance_score,
        metrics = EXCLUDED.metrics,
        updated_at = EXCLUDED.updated_at;

    RETURN jsonb_build_object('status', 'success', 'summary', summary);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bulk Generation Function
CREATE OR REPLACE FUNCTION public.generate_all_active_vendor_reports()
RETURNS void AS $$
DECLARE
    v_id UUID;
BEGIN
    FOR v_id IN SELECT id FROM public.vendors WHERE deleted_at IS NULL LOOP
        PERFORM public.generate_vendor_performance_report(v_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CRON JOB INSTRUCTIONS (Reference for User)
-- Run this in SQL Editor to schedule daily:
-- select
--   cron.schedule(
--     'daily-analytics-sync',
--     '0 3 * * *',
--     $$ select net.http_post(
--          url:='https://rnkyghovurnaizkhwgtv.supabase.co/functions/v1/google-analytics-sync',
--          headers:=jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer YOUR_ANON_KEY')
--        ) $$
--   );
