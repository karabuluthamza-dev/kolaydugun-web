-- Upgrade AI Insight Generation with Platform Metrics (V2)
CREATE OR REPLACE FUNCTION public.generate_vendor_performance_report(target_vendor_id UUID)
RETURNS JSONB AS $$
DECLARE
    perf_data RECORD;
    lead_count INTEGER;
    review_count INTEGER;
    avg_rating DECIMAL;
    favorite_count INTEGER;
    conversion_rate DECIMAL;
    summary TEXT;
    recommendations JSONB := '[]'::jsonb;
    score INTEGER;
    v_business_name TEXT;
    rec_list TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. Fetch Performance Snapshots
    SELECT * INTO perf_data 
    FROM public.vendor_performance_snapshots 
    WHERE vendor_id = target_vendor_id 
    ORDER BY snapshot_date DESC LIMIT 1;
    
    SELECT business_name INTO v_business_name FROM public.vendors WHERE id = target_vendor_id;

    -- 2. Fetch Performance Metrics
    SELECT COUNT(*) INTO lead_count 
    FROM public.vendor_leads 
    WHERE vendor_id = target_vendor_id AND created_at > (now() - interval '30 days');

    SELECT COUNT(*), COALESCE(AVG(rating), 0) INTO review_count, avg_rating 
    FROM public.reviews 
    WHERE vendor_id = target_vendor_id AND is_approved = true;

    SELECT COUNT(*) INTO favorite_count 
    FROM public.favorites 
    WHERE vendor_id = target_vendor_id;

    -- 3. Scoring Engine (V2)
    -- Base score from visibility
    IF perf_data IS NOT NULL THEN
        score := LEAST(70, (perf_data.views / 2) + (perf_data.impressions / 10));
        conversion_rate := CASE WHEN perf_data.views > 0 THEN (lead_count::decimal / perf_data.views) * 100 ELSE 0 END;
    ELSE
        score := 10;
        conversion_rate := 0;
    END IF;

    -- Bonus for Ratings & Reviews
    IF review_count > 0 THEN
        score := score + (review_count * 2); -- 2 points per review
        IF avg_rating >= 4.5 THEN score := score + 10; END IF;
        IF avg_rating < 3.5 THEN score := score - 15; END IF;
    END IF;

    -- Bonus for Favorites
    score := score + (favorite_count * 3); -- 3 points per favorite (high signal)
    
    score := LEAST(100, score);
    score := GREATEST(5, score);

    -- 4. Logic & Recommendations Engine
    IF perf_data IS NULL THEN
        summary := v_business_name || ' için henüz Google verisi bulunamadı. Yeni bir dükkan olabilir veya henüz Google tarafından indekslenmemiş olabilir.';
        rec_list := ARRAY['Google Search Console üzerinden URL denetimi yapın.', 'Site haritasına (sitemap) eklendiğinden emin olun.', 'Profil doluluk oranını %100''e çıkarın.'];
    ELSE
        -- Default positive summary start
        summary := v_business_name || ' analizi tamamlandı. Skorunuz: ' || score || '/100. ';

        IF conversion_rate < 1 AND perf_data.views > 20 THEN
            summary := summary || 'Ziyaretçiler sayfanıza geliyor ancak teklif istemeden ayrılıyorlar.';
            rec_list := array_append(rec_list, 'Fotoğraf galerisindeki ilk 3 görseli daha çekici hale getirin.');
            rec_list := array_append(rec_list, 'Açıklama kısmına ''Neden Sizi Seçmeliler?'' bölümü ekleyin.');
        END IF;

        IF favorite_count > 0 AND lead_count = 0 THEN
            summary := summary || ' ' || favorite_count || ' çift sizi favorilerine eklemiş! Sizi takip ediyorlar ancak henüz karar vermemişler.';
            rec_list := array_append(rec_list, 'Favorilerine ekleyenlere özel bir indirim veya kampanya duyurusu yapın.');
        END IF;

        IF avg_rating > 0 AND avg_rating < 4 THEN
            summary := summary || ' Ortalama puanınız (' || ROUND(avg_rating,1) || ') sektör ortalamasının biraz altında.';
            rec_list := array_append(rec_list, 'Müşteri yorumlarını yanıtlayın ve hizmet kalitesi hakkında geri bildirimleri dikkate alın.');
        END IF;

        IF review_count < 3 THEN
            summary := summary || ' Çok az yorumunuz var. Güven tazelemek için yorum sayısını artırmalısınız.';
            rec_list := array_append(rec_list, 'Son müşterilerinizden platform üzerinden yorum yapmalarını rica edin.');
        END IF;
    END IF;

    -- Fallback recommendations if list is empty
    IF cardinality(rec_list) = 0 THEN
        rec_list := ARRAY['Rezervasyon takviminizi güncel tutun.', 'Yeni referans fotoğrafları ekleyerek ivmeyi koruyun.', 'Tedarikçi başarı öykünüzü bizimle paylaşın!'];
    END IF;

    -- Convert array to JSONB
    recommendations := to_jsonb(rec_list);

    -- 5. Upsert into insights table
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
        jsonb_build_object(
            'conversion_rate', ROUND(COALESCE(conversion_rate, 0),1),
            'review_count', review_count,
            'favorite_count', favorite_count,
            'avg_rating', ROUND(COALESCE(avg_rating, 0),1)
        ),
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
