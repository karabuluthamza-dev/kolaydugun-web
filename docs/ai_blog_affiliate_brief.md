# AI Blog & Affiliate Slot Sistemi Entegrasyon Brifi

Aşağıdaki belge, mevcut Supabase tabanlı düğün planlama projesine entegre edilmesi planlanan **AI Blog Üretici Modülü** ve **Affiliate Slot Yapısı** için hazırlanmış yüksek seviyeli teknik açıklamadır.  
Bu belge, mevcut projeye eklenebilirliğin değerlendirilmesi, mimari uyumluluk analizi ve geliştirme süreci için referans niteliği taşır.

## 1. Amaç

Mevcut blog sistemine ek olarak:

- Yapay zekâ ile **çok dilli blog yazısı** üretmek  
- Blog içerisine **affiliate link alanları (slot)** eklemek  
- Her slot için **ürün türü önerisi + Amazon’da arama anahtar kelimeleri** oluşturmak  
- Admin panel üzerinden kolayca düzenlenebilir bir yapı sağlamak  

amaçlanmaktadır.

## 2. Mevcut Yapı (Kısaca)

Sistem zaten:

- Supabase veritabanı,
- Blog veri modeli,
- Admin panel,
- Çok dilli içerik yapısı (DE/EN/TR),
- Frontend blog görüntüleme

özelliklerine sahiptir.

Yeni modül bunların üzerine eklenmelidir.

## 3. Yeni Modül: AI Blog Generator

Admin panelde yeni bir bölümde çalışacak olan bu modül, kullanıcıya aşağıdaki gibi bir form sunacaktır:

- Blog konusu (topic)  
- Hedef kitle (opsiyonel)  
- Ton seçimi (formal / informal / expert / friendly)  
- Uzunluk seçimi (short / medium / long)  
- Ek talimat (opsiyonel)  
- Dil seçimi (DE zorunlu, EN ve TR seçenekli)

Bu form gönderildiğinde:

1. **Önce Almanca (DE)** ana blog metni üretilir.  
2. Bu metin temel alınarak **EN ve TR versiyonları** oluşturulur.  
3. Metinlerin içine uygun noktalara **affiliate slot işaretleri** eklenir.

Slot formatı:

```
{{AFFILIATE_SLOT_1}}
{{AFFILIATE_SLOT_2}}
...
```

Bu slotlar sadece admin panelde görünür.

## 4. Affiliate Slot Analiz Sistemi

Her slot için yapay zekâ aşağıdaki bilgileri üretir:

- Slot ID  
- Slotun bulunduğu paragrafın bağlamı (context summary)  
- Önerilen ürün türü  
- Amazon.de arama anahtar kelimeleri (DE / EN / TR)

Örnek veri:

```json
{
  "slot_id": "AFFILIATE_SLOT_1",
  "context_summary": "Rustik masa dekorasyonu, ışık atmosferi",
  "suggested_product_type": "Warmweiße LED Lichterkette",
  "search_keywords": {
    "de": [
      "LED Lichterkette warmweiß Hochzeit Tisch",
      "rustikale Lichterkette Hochzeit"
    ],
    "en": [
      "warm white LED string lights wedding table"
    ],
    "tr": [
      "rustik düğün masa led ışık"
    ]
  }
}
```

## 5. Üst Model – Gelişmiş Amazon Entegrasyonuna Hazır Mimari

Sistem gelecekte:

- Amazon Product Advertising API üzerinden ürün popülerlik analizi  
- Fiyat / yorum verisi  
- En uygun ürün listesi  

gibi yeteneklere yükseltilebilir.

Bu nedenle slot yapısına opsiyonel olarak:

```json
{
  "candidate_products": [
    {
      "asin": "XXXXXX",
      "title": "Ürün adı",
      "rating": 4.7,
      "review_count": 3800,
      "price": 12.90,
      "product_url": "https://www.amazon.de/...",
      "reason": "Yüksek satış, düğün dekorasyonu için uygun"
    }
  ]
}
```

alanı eklenebilir.

## 6. Yeni Tablo Önerisi

`ai_blog_meta` tablosu:

- blog_id  
- raw_ai_output_de  
- raw_ai_output_en  
- raw_ai_output_tr  
- affiliate_slots (JSON)  
- generation_settings (JSON)

## 7. Admin Panel Kullanım Akışı

1. Admin formu doldurur  
2. DE → EN → TR içerikleri üretilir  
3. Slotlar eklenir  
4. Slot analiz paneli görünür  
5. Admin ürün bulur  
6. Slot yerine affiliate link cümlesini ekler  
7. Yayınlanır  

## 8. Güvenlik

- Tüm modül yalnızca admin erişiminde olur  
- Slotlar frontend'de görünmez  
- Yayında temiz içerik kalır  

## 9. Entegrasyon Durumu

Bu modül:

- Yeni endpoint’ler  
- Yeni servisler  
- Yeni admin ekranları  
- Yeni bir metadata tablosu  

ile mevcut projeye **bağımsız eklenti** şeklinde entegre edilebilir.

