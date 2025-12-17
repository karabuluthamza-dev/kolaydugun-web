-- Video Platform Support FAQs
-- Migration: 20251216_video_platform_faqs.sql

-- Add video platform FAQs to shop_faqs table

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Hangi video platformlarını destekliyorsunuz?',
'Welche Videoplattformen werden unterstützt?',
'Which video platforms do you support?',
'Galerinize aşağıdaki platformlardan video ekleyebilirsiniz:

✅ **Tam Destek:**
- 🔴 YouTube
- 🟣 Vimeo
- ⚫ TikTok
- 🟠 Instagram (Reels, Posts, TV)
- 🔵 Google Drive

⚠️ **Sınırlı Destek:**
- Facebook (Teknik kısıtlamalar nedeniyle önerilmez)

💡 **Öneri:** En iyi sonuç için YouTube veya Vimeo kullanın.',

'Sie können Videos von folgenden Plattformen zu Ihrer Galerie hinzufügen:

✅ **Volle Unterstützung:**
- 🔴 YouTube
- 🟣 Vimeo
- ⚫ TikTok
- 🟠 Instagram (Reels, Posts, TV)
- 🔵 Google Drive

⚠️ **Eingeschränkte Unterstützung:**
- Facebook (Nicht empfohlen aufgrund technischer Einschränkungen)

💡 **Empfehlung:** Verwenden Sie YouTube oder Vimeo für beste Ergebnisse.',

'You can add videos from the following platforms to your gallery:

✅ **Full Support:**
- 🔴 YouTube
- 🟣 Vimeo
- ⚫ TikTok
- 🟠 Instagram (Reels, Posts, TV)
- 🔵 Google Drive

⚠️ **Limited Support:**
- Facebook (Not recommended due to technical restrictions)

💡 **Recommendation:** Use YouTube or Vimeo for best results.',
211, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Hangi video platformlarını destekliyorsunuz?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Instagram Reels nasıl eklerim?',
'Wie füge ich Instagram Reels hinzu?',
'How do I add Instagram Reels?',
'Instagram Reels eklemek çok kolay! 📱

**Adımlar:**
1. instagram.com''da Reels/videonuzu açın
2. Üç nokta menüsünden "Bağlantıyı kopyala" seçin
3. Galeri → Video Ekle
4. Linki yapıştırın

**Örnek Link:**
```
https://www.instagram.com/reel/ABC123
```

**Desteklenen Formatlar:**
- Reels: `/reel/...`
- Post: `/p/...`
- TV: `/tv/...`

✅ Video otomatik olarak embed edilir!',

'Instagram Reels hinzufügen ist ganz einfach! 📱

**Schritte:**
1. Öffnen Sie Ihr Reels/Video auf instagram.com
2. Klicken Sie auf die drei Punkte und wählen Sie "Link kopieren"
3. Galerie → Video hinzufügen
4. Fügen Sie den Link ein

**Beispiel-Link:**
```
https://www.instagram.com/reel/ABC123
```

**Unterstützte Formate:**
- Reels: `/reel/...`
- Post: `/p/...`
- TV: `/tv/...`

✅ Video wird automatisch eingebettet!',

'Adding Instagram Reels is super easy! 📱

**Steps:**
1. Open your Reels/video on instagram.com
2. Click three dots menu and select "Copy link"
3. Gallery → Add Video
4. Paste the link

**Example Link:**
```
https://www.instagram.com/reel/ABC123
```

**Supported Formats:**
- Reels: `/reel/...`
- Post: `/p/...`
- TV: `/tv/...`

✅ Video will be automatically embedded!',
212, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Instagram Reels nasıl eklerim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'TikTok videosu nasıl eklerim?',
'Wie füge ich TikTok-Videos hinzu?',
'How do I add TikTok videos?',
'TikTok videolarınızı kolayca ekleyebilirsiniz! 🎵

**Adımlar:**
1. tiktok.com''da videonuzu açın
2. Paylaş butonuna tıklayıp "Link kopyala" seçin
3. Galeri → Video Ekle
4. Linki yapıştırın

**Örnek Link:**
```
https://www.tiktok.com/@kullanici/video/123456
```

**Kısa Linkler de Çalışır:**
```
https://vm.tiktok.com/ABC123
```

✅ TikTok videoları otomatik embed edilir!

💡 **İpucu:** Viral TikTok videolarınızı galerinizde sergileyin!',

'Sie können Ihre TikTok-Videos ganz einfach hinzufügen! 🎵

**Schritte:**
1. Öffnen Sie Ihr Video auf tiktok.com
2. Klicken Sie auf Teilen und wählen Sie "Link kopieren"
3. Galerie → Video hinzufügen
4. Fügen Sie den Link ein

**Beispiel-Link:**
```
https://www.tiktok.com/@user/video/123456
```

**Kurze Links funktionieren auch:**
```
https://vm.tiktok.com/ABC123
```

✅ TikTok-Videos werden automatisch eingebettet!

💡 **Tipp:** Zeigen Sie Ihre viralen TikTok-Videos in Ihrer Galerie!',

'You can easily add your TikTok videos! 🎵

**Steps:**
1. Open your video on tiktok.com
2. Click Share and select "Copy link"
3. Gallery → Add Video
4. Paste the link

**Example Link:**
```
https://www.tiktok.com/@user/video/123456
```

**Short Links Work Too:**
```
https://vm.tiktok.com/ABC123
```

✅ TikTok videos are automatically embedded!

💡 **Tip:** Showcase your viral TikTok videos in your gallery!',
213, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'TikTok videosu nasıl eklerim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Facebook videoları neden çalışmıyor?',
'Warum funktionieren Facebook-Videos nicht?',
'Why don''t Facebook videos work?',
'Facebook videoları teknik kısıtlamalar nedeniyle sınırlı desteklenmektedir. ⚠️

**Sorun:**
- Facebook, CORS ve iframe politikaları nedeniyle embed''i kısıtlıyor
- Güvenilir embed için Facebook SDK entegrasyonu gerekli
- Facebook sık sık politikalarını değiştiriyor

**Çözüm:**
1. ✅ **YouTube''a Yükleyin** (Önerilen)
   - Daha güvenilir
   - Daha hızlı yüklenir
   - SEO avantajı

2. ✅ **Instagram Reels Kullanın**
   - Aynı videoyu Instagram''da paylaşın
   - Instagram embed''i sorunsuz çalışır

3. ✅ **Vimeo Kullanın**
   - Profesyonel alternatif
   - Reklamsız

💡 **Öneri:** Videolarınızı YouTube veya Vimeo''ya yükleyin, daha iyi sonuç alırsınız!',

'Facebook-Videos werden aufgrund technischer Einschränkungen nur eingeschränkt unterstützt. ⚠️

**Problem:**
- Facebook schränkt Embedding aufgrund von CORS- und iframe-Richtlinien ein
- Zuverlässiges Embedding erfordert Facebook SDK-Integration
- Facebook ändert häufig seine Richtlinien

**Lösung:**
1. ✅ **Auf YouTube hochladen** (Empfohlen)
   - Zuverlässiger
   - Lädt schneller
   - SEO-Vorteil

2. ✅ **Instagram Reels verwenden**
   - Teilen Sie dasselbe Video auf Instagram
   - Instagram-Embedding funktioniert einwandfrei

3. ✅ **Vimeo verwenden**
   - Professionelle Alternative
   - Werbefrei

💡 **Empfehlung:** Laden Sie Ihre Videos auf YouTube oder Vimeo hoch für bessere Ergebnisse!',

'Facebook videos have limited support due to technical restrictions. ⚠️

**Problem:**
- Facebook restricts embedding due to CORS and iframe policies
- Reliable embedding requires Facebook SDK integration
- Facebook frequently changes its policies

**Solution:**
1. ✅ **Upload to YouTube** (Recommended)
   - More reliable
   - Loads faster
   - SEO advantage

2. ✅ **Use Instagram Reels**
   - Share the same video on Instagram
   - Instagram embedding works flawlessly

3. ✅ **Use Vimeo**
   - Professional alternative
   - Ad-free

💡 **Recommendation:** Upload your videos to YouTube or Vimeo for better results!',
214, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Facebook videoları neden çalışmıyor?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Google Drive''dan video nasıl eklerim?',
'Wie füge ich Videos von Google Drive hinzu?',
'How do I add videos from Google Drive?',
'Google Drive''dan video eklemek için paylaşım ayarlarını yapmalısınız! 🔵

**Adımlar:**
1. drive.google.com''a videonuzu yükleyin
2. Video üzerinde sağ tıklayın
3. "Link al" / "Get link" seçin
4. **ÖNEMLİ:** "Bağlantısı olan herkes görebilir" yapın
5. Linki kopyalayın
6. Galeri → Video Ekle → Linki yapıştırın

**Link Formatı:**
```
https://drive.google.com/file/d/ABC123/view
```

**Yaygın Hatalar:**
❌ "Erişim reddedildi" → Link paylaşımı kapalı
✅ Çözüm: "Herkes görebilir" yapın

💡 **İpucu:** Büyük video dosyaları için Google Drive ideal!',

'Um Videos von Google Drive hinzuzufügen, müssen Sie die Freigabeeinstellungen konfigurieren! 🔵

**Schritte:**
1. Laden Sie Ihr Video auf drive.google.com hoch
2. Rechtsklick auf das Video
3. Wählen Sie "Link abrufen" / "Get link"
4. **WICHTIG:** Ändern Sie zu "Jeder mit dem Link"
5. Kopieren Sie den Link
6. Galerie → Video hinzufügen → Fügen Sie den Link ein

**Link-Format:**
```
https://drive.google.com/file/d/ABC123/view
```

**Häufige Fehler:**
❌ "Zugriff verweigert" → Link-Freigabe ist deaktiviert
✅ Lösung: Ändern Sie zu "Jeder kann sehen"

💡 **Tipp:** Google Drive ist ideal für große Videodateien!',

'To add videos from Google Drive, you need to configure sharing settings! 🔵

**Steps:**
1. Upload your video to drive.google.com
2. Right-click on the video
3. Select "Get link"
4. **IMPORTANT:** Change to "Anyone with the link"
5. Copy the link
6. Gallery → Add Video → Paste the link

**Link Format:**
```
https://drive.google.com/file/d/ABC123/view
```

**Common Errors:**
❌ "Access denied" → Link sharing is disabled
✅ Solution: Change to "Anyone can view"

💡 **Tip:** Google Drive is ideal for large video files!',
215, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Google Drive''dan video nasıl eklerim?');
