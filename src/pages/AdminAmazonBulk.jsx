import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import './AdminAmazonBulk.css';

const AdminAmazonBulk = () => {
    usePageTitle('Toplu ASIN Import | Admin');
    const { user } = useAuth();

    const [asinInput, setAsinInput] = useState('');
    const [parsedAsins, setParsedAsins] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
    const [results, setResults] = useState([]);
    const [settings, setSettings] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('shop_amazon_settings')
            .select('*')
            .single();
        if (data) setSettings(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('shop_categories')
            .select('id, name')
            .order('name');
        if (data) setCategories(data);
    };

    // Parse ASINs from input
    const parseAsins = () => {
        const lines = asinInput.split('\n').map(line => line.trim()).filter(Boolean);
        const validAsins = [];
        const asinRegex = /^[A-Z0-9]{10}$/;

        lines.forEach(line => {
            // Extract ASIN from line (could be URL or just ASIN)
            let asin = line;

            // If it's a URL, extract ASIN
            const dpMatch = line.match(/\/dp\/([A-Z0-9]{10})/i);
            const productMatch = line.match(/\/product\/([A-Z0-9]{10})/i);

            if (dpMatch) asin = dpMatch[1].toUpperCase();
            else if (productMatch) asin = productMatch[1].toUpperCase();
            else asin = line.toUpperCase();

            if (asinRegex.test(asin) && !validAsins.includes(asin)) {
                validAsins.push(asin);
            }
        });

        setParsedAsins(validAsins);
        return validAsins;
    };

    // AI Translation for single product
    const translateWithAI = async (genAI, germanText, asin) => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Sen bir e-ticaret ürün içerik uzmanısın. Aşağıdaki Almanca Amazon ürün bilgisini Türkçe ve İngilizce'ye çevir, ayrıca SEO-friendly slug'lar oluştur.

Ürün (Almanca): ${germanText}
ASIN: ${asin}

SADECE JSON formatında yanıt ver, başka hiçbir şey yazma:
{
    "name_de": "Almanca ürün adı (kısa, net)",
    "name_tr": "Türkçe ürün adı",
    "name_en": "İngilizce ürün adı",
    "description_de": "Almanca açıklama (2-3 cümle)",
    "description_tr": "Türkçe açıklama (2-3 cümle)",
    "description_en": "İngilizce açıklama (2-3 cümle)",
    "tags_de": "almanca,etiketler,virgülle,ayrılmış,slug:seo-url-slug-de",
    "tags_tr": "turkce,etiketler,virgülle,ayrılmış,slug:seo-url-slug-tr",
    "tags_en": "english,tags,comma,separated,slug:seo-url-slug-en"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid AI response');
    };

    // Process all ASINs
    const processAsins = async () => {
        if (parsedAsins.length === 0) {
            setError('Geçerli ASIN bulunamadı!');
            return;
        }

        if (!settings?.gemini_api_key) {
            setError('Gemini API key ayarlanmamış! Ayarlar sayfasından ekleyin.');
            return;
        }

        setProcessing(true);
        setError('');
        setResults([]);
        setProgress({ current: 0, total: parsedAsins.length, status: 'Başlatılıyor...' });

        const genAI = new GoogleGenerativeAI(settings.gemini_api_key);
        const newResults = [];

        for (let i = 0; i < parsedAsins.length; i++) {
            const asin = parsedAsins[i];
            setProgress({
                current: i + 1,
                total: parsedAsins.length,
                status: `${asin} işleniyor...`
            });

            try {
                // Check if ASIN already exists
                const { data: existing } = await supabase
                    .from('shop_products')
                    .select('id')
                    .eq('amazon_asin', asin)
                    .single();

                if (existing) {
                    newResults.push({ asin, status: 'skip', message: 'Zaten mevcut' });
                    continue;
                }

                // Generate placeholder content for AI (ASIN only mode)
                const placeholderText = `Amazon.de ürünü ASIN: ${asin}. Düğün aksesuarı veya gelin ürünü.`;

                // AI Translation
                const translated = await translateWithAI(genAI, placeholderText, asin);

                // Prepare product data
                const productData = {
                    product_type: 'amazon',
                    amazon_asin: asin,
                    amazon_url: `https://www.amazon.de/dp/${asin}?tag=${settings?.amazon_partner_tag || 'kolaydugun-21'}`,
                    name_de: translated.name_de || `Amazon Ürün ${asin}`,
                    name_tr: translated.name_tr || `Amazon Ürün ${asin}`,
                    name_en: translated.name_en || `Amazon Product ${asin}`,
                    description_de: translated.description_de || '',
                    description_tr: translated.description_tr || '',
                    description_en: translated.description_en || '',
                    tags_de: translated.tags_de || '',
                    tags_tr: translated.tags_tr || '',
                    tags_en: translated.tags_en || '',
                    category_id: selectedCategory || null,
                    show_price: true,
                    price_on_request: false,
                    status: 'active',
                    check_status: 'pending',
                    main_shop_request_status: 'approved',
                    images: []
                };

                // Save to database
                const { error: insertError } = await supabase
                    .from('shop_products')
                    .insert(productData);

                if (insertError) {
                    newResults.push({ asin, status: 'error', message: insertError.message });
                } else {
                    newResults.push({ asin, status: 'success', message: 'Başarıyla eklendi' });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (err) {
                console.error(`Error processing ${asin}:`, err);
                newResults.push({ asin, status: 'error', message: err.message });
            }
        }

        setResults(newResults);
        setProgress({ current: parsedAsins.length, total: parsedAsins.length, status: 'Tamamlandı!' });
        setProcessing(false);
    };

    const successCount = results.filter(r => r.status === 'success').length;
    const skipCount = results.filter(r => r.status === 'skip').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return (
        <div className="admin-amazon-bulk">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <Link to="/admin/amazon" className="back-link">← Dashboard</Link>
                    <h1>📦 Toplu ASIN Import</h1>
                    <p>Birden fazla Amazon ürününü aynı anda ekleyin</p>
                </div>
            </div>

            {/* Help Guide */}
            <div className="help-guide">
                <div className="help-header">
                    <span>📖</span>
                    <strong>Nasıl Kullanılır?</strong>
                </div>
                <div className="help-steps-horizontal">
                    <div className="step-h">
                        <span className="step-num">1</span>
                        <span>Amazon.de'de arama yapın</span>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-h">
                        <span className="step-num">2</span>
                        <span>ASIN kodlarını kopyalayın</span>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-h">
                        <span className="step-num">3</span>
                        <span>Aşağıya yapıştırın</span>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-h">
                        <span className="step-num">4</span>
                        <span>Toplu Ekle'ye basın!</span>
                    </div>
                </div>
                <div className="help-tip">
                    💡 <strong>İpucu:</strong> Her satıra bir ASIN yazın veya Amazon URL'lerini yapıştırın. Otomatik çıkarılır!
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Main Form */}
            <div className="bulk-form">
                <div className="form-row">
                    <div className="input-section">
                        <label>ASIN Listesi (Her satıra bir tane)</label>
                        <textarea
                            value={asinInput}
                            onChange={(e) => setAsinInput(e.target.value)}
                            placeholder={`B07XYZ1234
B08ABC5678
https://www.amazon.de/dp/B09DEF9012
B0AGHI3456`}
                            rows={10}
                            disabled={processing}
                        />
                        <div className="input-footer">
                            <button
                                type="button"
                                onClick={parseAsins}
                                className="btn btn-secondary"
                                disabled={processing || !asinInput.trim()}
                            >
                                🔍 ASIN'leri Ayıkla
                            </button>
                            <span className="count">{parsedAsins.length} geçerli ASIN</span>
                        </div>
                    </div>

                    <div className="preview-section">
                        <label>Ayıklanan ASIN'ler</label>
                        <div className="asin-preview">
                            {parsedAsins.length === 0 ? (
                                <div className="empty">ASIN'leri ayıklamak için butona basın</div>
                            ) : (
                                parsedAsins.map((asin, idx) => (
                                    <div key={asin} className="asin-chip">
                                        <span className="num">{idx + 1}</span>
                                        <a href={`https://www.amazon.de/dp/${asin}`} target="_blank" rel="noopener noreferrer">
                                            {asin}
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Selection */}
                <div className="category-row">
                    <label>Kategori (Opsiyonel)</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={processing}
                    >
                        <option value="">Kategori Seçin...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {typeof cat.name === 'object' ? cat.name.tr || cat.name.de : cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Button */}
                <div className="action-row">
                    <button
                        onClick={processAsins}
                        className="btn btn-primary btn-large"
                        disabled={processing || parsedAsins.length === 0}
                    >
                        {processing ? (
                            <>⏳ İşleniyor...</>
                        ) : (
                            <>🚀 {parsedAsins.length} Ürünü Toplu Ekle</>
                        )}
                    </button>
                </div>

                {/* Progress */}
                {processing && (
                    <div className="progress-section">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                        <div className="progress-text">
                            {progress.current} / {progress.total} - {progress.status}
                        </div>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="results-section">
                        <h3>📊 Sonuçlar</h3>
                        <div className="results-summary">
                            <div className="result-stat success">
                                <span className="num">{successCount}</span>
                                <span>Başarılı</span>
                            </div>
                            <div className="result-stat skip">
                                <span className="num">{skipCount}</span>
                                <span>Atlandı</span>
                            </div>
                            <div className="result-stat error">
                                <span className="num">{errorCount}</span>
                                <span>Hata</span>
                            </div>
                        </div>
                        <div className="results-list">
                            {results.map((result, idx) => (
                                <div key={idx} className={`result-item ${result.status}`}>
                                    <span className="result-asin">{result.asin}</span>
                                    <span className="result-status">
                                        {result.status === 'success' && '✅'}
                                        {result.status === 'skip' && '⏭️'}
                                        {result.status === 'error' && '❌'}
                                    </span>
                                    <span className="result-message">{result.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAmazonBulk;
