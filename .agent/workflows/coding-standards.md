---
description: Project coding standards and rules for KolayDugun
---

# KolayDugun Kodlama Kuralları

## 1. Alert/Popup KULLANMA ❌
- `alert()`, `confirm()` gibi popup fonksiyonları tarayıcı tarafından engellenebilir
- **HER ZAMAN inline mesajlar kullan:**
  - Başarı mesajları: Yeşil kutuda sayfa üstünde göster
  - Hata mesajları: Kırmızı kutuda sayfa üstünde göster
  - State kullan: `successMessage` ve `errorMessage`
  - `setTimeout` ile mesajları otomatik kaldır (3-5 saniye)

```jsx
// YANLIŞ ❌
alert('İşlem başarılı!');

// DOĞRU ✅
setSuccessMessage('✅ İşlem başarılı!');
setTimeout(() => setSuccessMessage(''), 3000);
```

## 2. 3 Dilli Uyumluluk 🌐
- Site TR, DE, EN olmak üzere 3 dili destekliyor
- Tüm yeni özellikler için:
  1. Statik metinleri `src/locales/dictionary.js` dosyasına ekle
  2. `t()` veya `useTranslation` hook'u ile çeviri yap
  3. Her 3 dil için çeviri ekle

```jsx
// dictionary.js örnek yapı
export const dictionary = {
  tr: {
    myFeature: {
      title: 'Başlık',
      success: 'Başarılı!'
    }
  },
  de: {
    myFeature: {
      title: 'Titel',
      success: 'Erfolgreich!'
    }
  },
  en: {
    myFeature: {
      title: 'Title',
      success: 'Success!'
    }
  }
};
```

## 3. Bot Silme Cascade
- Bot silindiğinde tüm içerikleri de silinmeli:
  - forum_likes
  - forum_comments
  - forum_posts
  - profiles (en son)
