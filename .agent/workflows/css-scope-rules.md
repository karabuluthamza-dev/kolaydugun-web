---
description: Bağımsız modüller için CSS scope kuralları - Ana siteyi koruma
---

# 🛡️ CSS SCOPE KURALLARI - ZORUNLU!

Bu workflow, **Shop modülü veya herhangi bir bağımsız modül** için CSS yazarken MUTLAKA uyulması gereken kuralları tanımlar.

## ⚠️ ASLA YAPMA

1. **Global class tanımı YAPMA:**
   ```css
   /* ❌ YANLIŞ - Global scope, ana siteyi bozar! */
   .btn-primary { ... }
   .form-group { ... }
   .modal { ... }
   ```

2. **Scope'suz element stilleri YAPMA:**
   ```css
   /* ❌ YANLIŞ */
   button { ... }
   input { ... }
   ```

## ✅ MUTLAKA YAP

1. **Her CSS kuralını parent class içine scope et:**
   ```css
   /* ✅ DOĞRU - Sadece shop sayfasını etkiler */
   .shop-category-page .btn-primary { ... }
   .admin-shop-plans .form-group { ... }
   .shop-application-page .modal { ... }
   ```

2. **Yeni sayfa oluştururken:**
   - Sayfaya benzersiz class ver: `.my-new-page`
   - Tüm CSS'i bu class içine scope et
   - CSS dosyasının başında bu kuralı belirt

## 📋 Scope Edilmesi Gereken Yaygın Class'lar

| Class | Neden? |
|-------|--------|
| `.btn-primary` | Ana site butonları |
| `.btn-secondary` | Ana site butonları |
| `.form-group` | Form elemanları |
| `.form-row` | Form layout |
| `.modal` | Modal dialoglar |
| `.loading-spinner` | Loading states |
| `.card` | Kart yapıları |

## 🔍 Kontrol Listesi

Yeni CSS yazarken:
- [ ] Tüm class'lar parent scope içinde mi?
- [ ] Global selector (element seçici) yok mu?
- [ ] Ana site sayfalarını kontrol ettim mi?
- [ ] Diğer modülleri etkilemiyor mu?

## 🚨 Hata Olursa

Ana sitede stil bozulursa:
1. Son eklenen CSS dosyalarını kontrol et
2. Global scope olan class'ları bul
3. Parent class içine al
4. Test et: /, /vendors, /pricing sayfaları
