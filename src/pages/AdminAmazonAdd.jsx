import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './AdminAmazonAdd.css';

const AdminAmazonAdd = () => {
    usePageTitle('Amazon Ürün Ekle');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [amazonUrl, setAmazonUrl] = useState(searchParams.get('url') || '');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [translating, setTranslating] = useState(false);
    const [generatedSlugs, setGeneratedSlugs] = useState({ tr: '', de: '', en: '' });

    const [productData, setProductData] = useState({
        name_tr: '',
        name_de: '',
        name_en: '',
        description_tr: '',
        description_de: '',
        description_en: '',
        price: '',
        images: [],
        amazon_asin: '',
        tags_tr: '',
        tags_de: '',
        tags_en: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [settings, setSettings] = useState({
        affiliate_tag: 'kolaydg1-21',
        gemini_api_key: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchSettings();
    }, []);

    // Auto-extract ASIN from URL when URL changes
    useEffect(() => {
        if (amazonUrl) {
            const asin = extractAsin(amazonUrl);
            if (asin && asin !== productData.amazon_asin) {
                setProductData(prev => ({ ...prev, amazon_asin: asin }));
            }
        }
    }, [amazonUrl]);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('shop_categories')
            .select('id, name_tr, name_de, name_en, is_active')
            .order('display_order');

        if (error) {
            console.error('Categories fetch error:', error);
        }

        // Show all categories for now, filter active ones
        const activeCategories = data?.filter(c => c.is_active !== false) || [];
        setCategories(activeCategories);
    };

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('shop_amazon_settings')
            .select('key, value');

        if (data) {
            const settingsObj = {};
            data.forEach(s => settingsObj[s.key] = s.value);
            setSettings(prev => ({ ...prev, ...settingsObj }));
        }
    };

    // Get Gemini API key
    const getApiKey = () => {
        return settings.gemini_api_key?.trim() ||
            localStorage.getItem('admin_gemini_api_key')?.trim() ||
            import.meta.env.VITE_GEMINI_API_KEY?.trim();
    };

    // AI Translation function
    const handleTranslate = async () => {
        console.log('AI Özgünleştir clicked');
        const geminiKey = getApiKey();

        if (!geminiKey) {
            setError('Gemini API anahtarı bulunamadı. Ayarlar → Amazon → Gemini API Anahtarı ekleyin.');
            return;
        }

        const hasInput = productData.name_tr || productData.name_de || productData.name_en;

        if (!hasInput) {
            setError('Lütfen en az bir dilde ürün adı girin.');
            return;
        }

        setTranslating(true);
        setError('');

        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            // Collect all available product info
            const inputName = productData.name_tr || productData.name_de || productData.name_en || '';
            const inputDesc = productData.description_tr || productData.description_de || productData.description_en || '';

            const prompt = `Sen bir profesyonel ürün editörü ve SEO uzmanısın. Aşağıdaki ürün bilgilerini 3 dile (Türkçe, Almanca, İngilizce) çevir ve düğün sitesine uygun şekilde yeniden yaz ve SEO etiketleri oluştur.

KAYNAK METİN (dili otomatik algıla):
Ürün Adı: ${inputName}
${inputDesc ? `Açıklama: ${inputDesc.substring(0, 800)}` : ''}

ÖNEMLİ: Kaynak dilin hangisi olduğunu tespit et ve diğer 2 dile çevir. Kaynak dildeki metni de düğün sitesine uygun şekilde optimize et.

KRİTİK KURALLAR - MUTLAKA UYULMALI:
1. Orijinal ürün özellikleri, malzemeler, boyutlar, teknik bilgiler KESİNLİKLE DEĞİŞMEMELİ
2. ASLA yeni özellik ekleme veya mevcut özellikleri çıkarma
3. ASLA yanlış veya uydurma bilgi yazma
4. Sadece cümle yapısını, kelime seçimini ve anlatım tarzını değiştir
5. Düğün/gelin sitesine uygun profesyonel ve şık bir dil kullan
6. Kısa, net ve SEO dostu cümleler tercih et

SEO ETİKETLERİ VE LİNKLER:
- Her dilde 5-8 anahtar kelime oluştur (tags)
- Her dilde 1 tane kısa SEO linki (slug) oluştur (örn: "gelin-taci-kristal" gibi)

SADECE JSON formatında cevap ver:

{
  "name_tr": "Türkçe ürün adı",
  "name_de": "Deutscher Produktname",
  "name_en": "English product name",
  "tags_tr": "etiket1, etiket2",
  "tags_de": "tag1, tag2",
  "tags_en": "tag1, tag2",
  "slug_tr": "turkce-seo-link",
  "slug_de": "deutscher-seo-link",
  "slug_en": "english-seo-link"${inputDesc ? `,
  "description_tr": "Türkçe açıklama",
  "description_de": "Deutsche Beschreibung",
  "description_en": "English description"` : ''}
}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const translations = JSON.parse(cleanJson);

            setProductData(prev => ({
                ...prev,
                name_tr: translations.name_tr || prev.name_tr,
                name_de: translations.name_de || prev.name_de,
                name_en: translations.name_en || prev.name_en,
                description_tr: translations.description_tr || prev.description_tr,
                description_de: translations.description_de || prev.description_de,
                description_en: translations.description_en || prev.description_en,
                tags_tr: translations.tags_tr || '',
                tags_de: translations.tags_de || '',
                tags_en: translations.tags_en || ''
            }));

            setGeneratedSlugs({
                tr: translations.slug_tr || '',
                de: translations.slug_de || '',
                en: translations.slug_en || ''
            });

            setSuccess('✅ 3 dilde çeviri, etiketler ve SEO linkleri oluşturuldu!');

        } catch (err) {
            console.error('Translation error:', err);
            setError('Çeviri hatası: ' + err.message);
        }

        setTranslating(false);
    };

    // Extract ASIN from Amazon URL
    const extractAsin = (url) => {
        const patterns = [
            /\/dp\/([A-Z0-9]{10})/i,
            /\/gp\/product\/([A-Z0-9]{10})/i,
            /\/ASIN\/([A-Z0-9]{10})/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1].toUpperCase();
        }
        return null;
    };

    // Validate ASIN format
    const isValidAsin = (asin) => {
        return asin && /^[A-Z0-9]{10}$/i.test(asin);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const asin = productData.amazon_asin?.toUpperCase().trim();

        if (!asin || !isValidAsin(asin)) {
            setError('Geçerli bir ASIN girin (10 karakter, harf ve rakam)');
            return;
        }

        if (!productData.name_tr && !productData.name_de && !productData.name_en) {
            setError('En az bir dilde ürün adı girin.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const affiliateUrl = `https://www.amazon.de/dp/${asin}?tag=${settings.affiliate_tag}`;

            // Use first available name for name_tr (required field)
            const primaryName = productData.name_tr || productData.name_de || productData.name_en;

            const { error: insertError } = await supabase
                .from('shop_products')
                .insert({
                    product_type: 'amazon',
                    amazon_url: amazonUrl || `https://www.amazon.de/dp/${asin}`,
                    amazon_asin: asin,
                    affiliate_url: affiliateUrl,
                    name_tr: primaryName, // Required field
                    name_de: productData.name_de || null,
                    name_en: productData.name_en || null,
                    description_tr: productData.description_tr || null,
                    description_de: productData.description_de || null,
                    description_en: productData.description_en || null,
                    tags_tr: (productData.tags_tr || '') + (generatedSlugs.tr ? `,slug:${generatedSlugs.tr}` : ''),
                    tags_de: (productData.tags_de || '') + (generatedSlugs.de ? `,slug:${generatedSlugs.de}` : ''),
                    tags_en: (productData.tags_en || '') + (generatedSlugs.en ? `,slug:${generatedSlugs.en}` : ''),
                    price: parseFloat(productData.price) || null,
                    original_price: parseFloat(productData.price) || null,
                    images: productData.images,
                    category_id: selectedCategory || null,
                    external_url: affiliateUrl,
                    status: 'approved',
                    check_status: 'active',
                    main_shop_request_status: 'approved'
                });

            if (insertError) {
                throw insertError;
            }

            // Log the action
            await supabase.from('shop_amazon_logs').insert({
                action: 'added',
                new_value: { asin: asin, url: amazonUrl, mode: 'manual' }
            });

            setSuccess('✅ Ürün başarıyla eklendi!');

            // Reset form
            setTimeout(() => {
                navigate('/admin/amazon/products');
            }, 1500);

        } catch (err) {
            console.error('Save error:', err);
            setError('Kaydetme hatası: ' + err.message);
        }

        setLoading(false);
    };

    const handleInputChange = (field, value) => {
        setProductData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddImage = (e) => {
        if (e) e.preventDefault();
        if (newImageUrl && newImageUrl.trim()) {
            setProductData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (index) => {
        setProductData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="admin-amazon-add">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <Link to="/admin/amazon" className="back-link">← Dashboard</Link>
                    <h1>➕ Amazon Ürün Ekle</h1>
                    <p>Manuel giriş modu - Ürün bilgilerini doğrudan girebilirsiniz</p>
                </div>
            </div>

            {/* Info Banner - Detailed Usage Instructions */}
            <div className="info-banner help-guide">
                <div className="help-header">
                    <span className="info-icon">📖</span>
                    <strong>Nasıl Kullanılır?</strong>
                </div>
                <div className="help-steps">
                    <div className="step">
                        <span className="step-num">1</span>
                        <span>Amazon.de'den ürün ASIN kodunu kopyalayın (URL'deki /dp/ sonrası 10 karakter)</span>
                    </div>
                    <div className="step">
                        <span className="step-num">2</span>
                        <span>ASIN'i yukarıdaki kutuya yapıştırın</span>
                    </div>
                    <div className="step">
                        <span className="step-num">3</span>
                        <span>"Amazon'u Aç" ile ürün sayfasını açın, başlık ve açıklamayı kopyalayın</span>
                    </div>
                    <div className="step">
                        <span className="step-num">4</span>
                        <span>🤖 <strong>"AI ile Çevir"</strong> butonuna basın - otomatik 3 dil çeviri + SEO slug</span>
                    </div>
                    <div className="step">
                        <span className="step-num">5</span>
                        <span>Fiyat, resim URL'leri ve kategori ekleyin</span>
                    </div>
                    <div className="step">
                        <span className="step-num">6</span>
                        <span>💾 Kaydet - Ürün otomatik olarak Shop'ta yayınlanır!</span>
                    </div>
                </div>
                <div className="help-tip">
                    💡 <strong>İpucu:</strong> AI çeviri işlemi ~10 saniye sürer. Tüm diller + SEO slugları otomatik oluşturulur.
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {/* Product Form */}
            <form onSubmit={handleSubmit} className="product-form">
                {/* ASIN Input - Primary */}
                <div className="form-section asin-section">
                    <h3>🔑 Amazon ASIN</h3>
                    <div className="asin-input-group">
                        <input
                            type="text"
                            value={productData.amazon_asin}
                            onChange={(e) => handleInputChange('amazon_asin', e.target.value.toUpperCase())}
                            placeholder="B08N5WRWNW"
                            maxLength={10}
                            pattern="[A-Za-z0-9]{10}"
                            className="asin-input"
                        />
                        {isValidAsin(productData.amazon_asin) && (
                            <a
                                href={`https://www.amazon.de/dp/${productData.amazon_asin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary amazon-link"
                            >
                                🔗 Amazon'da Aç
                            </a>
                        )}
                    </div>
                    <p className="helper-text">
                        10 karakterlik Amazon ürün kodu (örn: B08N5WRWNW)
                    </p>
                    {settings.affiliate_tag && (
                        <p className="affiliate-info">
                            Affiliate Tag: <code>{settings.affiliate_tag}</code>
                        </p>
                    )}
                </div>

                {/* Optional URL Input */}
                <div className="form-section optional-section">
                    <h3>🔗 Amazon URL <span className="optional-badge">Opsiyonel</span></h3>
                    <input
                        type="url"
                        value={amazonUrl}
                        onChange={(e) => setAmazonUrl(e.target.value)}
                        placeholder="https://www.amazon.de/dp/B08N5WRWNW"
                        className="full-width"
                    />
                    <p className="helper-text">
                        URL yapıştırırsanız ASIN otomatik çıkarılır
                    </p>
                </div>

                {/* Category Selection */}
                <div className="form-section">
                    <h3>📁 Kategori</h3>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Kategori Seçin (Opsiyonel)</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name_tr || cat.name_de || cat.name_en}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Product Names */}
                <div className="form-section">
                    <div className="section-header-with-action">
                        <h3>📝 Ürün Adı (3 Dil)</h3>
                        <button
                            type="button"
                            className="btn btn-ai"
                            onClick={handleTranslate}
                            disabled={translating || (!productData.name_tr && !productData.name_de && !productData.name_en)}
                            title="Herhangi bir dildeki metni 3 dile çevir"
                        >
                            {translating ? '⏳ Oluşturuluyor...' : '🤖 AI Özgünleştir'}
                        </button>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>🇹🇷 Türkçe</label>
                            <input
                                type="text"
                                value={productData.name_tr}
                                onChange={(e) => handleInputChange('name_tr', e.target.value)}
                                placeholder="Türkçe ürün adı"
                            />
                        </div>
                        <div className="form-group">
                            <label>🇩🇪 Almanca</label>
                            <input
                                type="text"
                                value={productData.name_de}
                                onChange={(e) => handleInputChange('name_de', e.target.value)}
                                placeholder="Deutscher Produktname"
                            />
                        </div>
                        <div className="form-group">
                            <label>🇬🇧 İngilizce</label>
                            <input
                                type="text"
                                value={productData.name_en}
                                onChange={(e) => handleInputChange('name_en', e.target.value)}
                                placeholder="English product name"
                            />
                        </div>
                    </div>

                    {/* SEO Slug Input */}
                    <div className="form-grid" style={{ marginTop: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>🔗 Kısa Linkler (SEO Slugs)</label>

                            {/* TR Slug */}
                            <div className="input-group-append slug-input-container" style={{ marginBottom: '10px' }}>
                                <span className="input-prefix">TR /shop/urun/</span>
                                <input
                                    type="text"
                                    value={generatedSlugs.tr}
                                    onChange={(e) => setGeneratedSlugs(prev => ({ ...prev, tr: e.target.value }))}
                                    className="slug-input"
                                    placeholder="turkce-urun-linki"
                                />
                            </div>

                            {/* DE Slug */}
                            <div className="input-group-append slug-input-container" style={{ marginBottom: '10px' }}>
                                <span className="input-prefix">DE /shop/urun/</span>
                                <input
                                    type="text"
                                    value={generatedSlugs.de}
                                    onChange={(e) => setGeneratedSlugs(prev => ({ ...prev, de: e.target.value }))}
                                    className="slug-input"
                                    placeholder="deutscher-produkt-link"
                                />
                            </div>

                            {/* EN Slug */}
                            <div className="input-group-append slug-input-container">
                                <span className="input-prefix">EN /shop/urun/</span>
                                <input
                                    type="text"
                                    value={generatedSlugs.en}
                                    onChange={(e) => setGeneratedSlugs(prev => ({ ...prev, en: e.target.value }))}
                                    className="slug-input"
                                    placeholder="english-product-link"
                                />
                            </div>

                            <p className="helper-text">3 dil için ayrı ayrı kısa linkler. AI tarafından önerilir, düzenleyebilirsiniz.</p>
                        </div>
                    </div>
                </div>

                {/* Product Descriptions */}
                <div className="form-section">
                    <h3>📄 Açıklama (3 Dil)</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>🇹🇷 Türkçe</label>
                            <textarea
                                value={productData.description_tr}
                                onChange={(e) => handleInputChange('description_tr', e.target.value)}
                                placeholder="Türkçe ürün açıklaması"
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>🇩🇪 Almanca</label>
                            <textarea
                                value={productData.description_de}
                                onChange={(e) => handleInputChange('description_de', e.target.value)}
                                placeholder="Deutsche Produktbeschreibung"
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>🇬🇧 İngilizce</label>
                            <textarea
                                value={productData.description_en}
                                onChange={(e) => handleInputChange('description_en', e.target.value)}
                                placeholder="English product description"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO Tags */}
                <div className="form-section tags-section">
                    <h3>🏷️ SEO Etiketleri (3 Dil)</h3>
                    <p className="section-hint">AI tarafından otomatik oluşturulur. İsteğe bağlı düzenleyebilirsiniz.</p>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>🇹🇷 Türkçe Etiketler</label>
                            <input
                                type="text"
                                value={productData.tags_tr}
                                onChange={(e) => handleInputChange('tags_tr', e.target.value)}
                                placeholder="gelin tacı, düğün aksesuarı, kristal"
                            />
                        </div>
                        <div className="form-group">
                            <label>🇩🇪 Almanca Etiketler</label>
                            <input
                                type="text"
                                value={productData.tags_de}
                                onChange={(e) => handleInputChange('tags_de', e.target.value)}
                                placeholder="Brautkrone, Hochzeitsschmuck"
                            />
                        </div>
                        <div className="form-group">
                            <label>🇬🇧 İngilizce Etiketler</label>
                            <input
                                type="text"
                                value={productData.tags_en}
                                onChange={(e) => handleInputChange('tags_en', e.target.value)}
                                placeholder="bridal crown, wedding accessory"
                            />
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="form-section">
                    <h3>💰 Fiyat</h3>
                    <div className="price-input">
                        <span className="currency">€</span>
                        <input
                            type="number"
                            step="0.01"
                            value={productData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder="29.99"
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="form-section">
                    <h3>🖼️ Resimler</h3>

                    {/* Image URL Input */}
                    <div className="image-input-group">
                        <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://m.media-amazon.com/images/I/..."
                            className="image-url-input"
                        />
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleAddImage}
                            disabled={!newImageUrl}
                        >
                            + Ekle
                        </button>
                    </div>
                    <p className="helper-text">
                        Amazon ürün resminin URL'sini yapıştırın (sağ tıklayıp "Resim adresini kopyala")
                    </p>

                    {/* Images Grid */}
                    <div className="images-grid">
                        {productData.images.map((img, index) => (
                            <div key={index} className="image-item">
                                <img src={img} alt={`Ürün ${index + 1}`} />
                                <button
                                    type="button"
                                    className="remove-image"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <Link to="/admin/amazon" className="btn btn-secondary">
                        İptal
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !isValidAsin(productData.amazon_asin)}
                    >
                        {loading ? '⏳ Kaydediliyor...' : '✅ Ürünü Kaydet'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default AdminAmazonAdd;
