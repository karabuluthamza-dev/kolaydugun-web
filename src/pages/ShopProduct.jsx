import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
import AmazonTrustBadges from '../components/AmazonTrustBadges';
import SocialShareButtons from '../components/SocialShareButtons';
import { trackLeadContact, trackFunnelStep } from '../utils/analytics';
import { generateShopBreadcrumb } from '../utils/breadcrumbSchema';
import './ShopProduct.css';

const ShopProduct = () => {
    const { id, lang: urlLang } = useParams();
    const { language, setLanguage } = useLanguage();
    const location = useLocation();

    // Use URL language if present, otherwise use context
    const activeLang = urlLang || language;

    // Sync URL language with context
    useEffect(() => {
        if (urlLang && ['tr', 'de', 'en'].includes(urlLang) && urlLang !== language) {
            setLanguage(urlLang);
        }
    }, [urlLang, language, setLanguage]);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [totalViews, setTotalViews] = useState(0);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    // Çok dilli metinler
    const texts = {
        tr: {
            back: '← Mağazaya Dön',
            viewOnAmazon: 'Amazon\'da Gör',
            contact: 'İletişime Geç',
            priceOnRequest: 'Fiyat için iletişime geçin',
            amazonLabel: 'KolayDüğün Önerisi',
            boutiqueLabel: 'Boutique Collection',
            share: 'Paylaş',
            category: 'Kategori',
            notFound: 'Ürün bulunamadı',
            loading: 'Yükleniyor...',
            verified: 'Doğrulanmış Satıcı',
            fastShipping: 'Hızlı Teslimat',
            securePayment: 'Güvenli Alışveriş',
            support: '7/24 Destek',
            relatedProducts: 'Benzer Ürünler',
            viewShop: 'Mağazayı Ziyaret Et',
            inStock: 'Stokta Var',
            limitedStock: 'Son Birkaç Adet',
            peopleViewing: 'kişi şu an bakıyor',
            viewCount: 'görüntüleme',
            addToWishlist: 'Favorilere Ekle',
            shopProducts: 'Bu Mağazadan Diğer Ürünler',
            contactSeller: 'Satıcıya Sor',
            whatsappContact: 'WhatsApp ile İletişim',
            callNow: 'Hemen Ara',
            sendEmail: 'E-posta Gönder'
        },
        de: {
            back: '← Zurück zum Shop',
            viewOnAmazon: 'Auf Amazon ansehen',
            contact: 'Kontakt aufnehmen',
            priceOnRequest: 'Preis auf Anfrage',
            amazonLabel: 'KolayDüğün Empfehlung',
            boutiqueLabel: 'Boutique Collection',
            share: 'Teilen',
            category: 'Kategorie',
            notFound: 'Produkt nicht gefunden',
            loading: 'Laden...',
            verified: 'Verifizierter Verkäufer',
            fastShipping: 'Schnelle Lieferung',
            securePayment: 'Sicheres Einkaufen',
            support: '24/7 Support',
            relatedProducts: 'Ähnliche Produkte',
            viewShop: 'Shop besuchen',
            inStock: 'Auf Lager',
            limitedStock: 'Nur noch wenige',
            peopleViewing: 'Personen sehen sich das an',
            viewCount: 'Aufrufe',
            addToWishlist: 'Zur Wunschliste',
            shopProducts: 'Weitere Produkte aus diesem Shop',
            contactSeller: 'Verkäufer kontaktieren',
            whatsappContact: 'Per WhatsApp kontaktieren',
            callNow: 'Jetzt anrufen',
            sendEmail: 'E-Mail senden'
        },
        en: {
            back: '← Back to Shop',
            viewOnAmazon: 'View on Amazon',
            contact: 'Contact',
            priceOnRequest: 'Price on request',
            amazonLabel: 'KolayDüğün Recommendation',
            boutiqueLabel: 'Boutique Collection',
            share: 'Share',
            category: 'Category',
            notFound: 'Product not found',
            loading: 'Loading...',
            verified: 'Verified Seller',
            fastShipping: 'Fast Shipping',
            securePayment: 'Secure Shopping',
            support: '24/7 Support',
            relatedProducts: 'Similar Products',
            viewShop: 'Visit Shop',
            inStock: 'In Stock',
            limitedStock: 'Only Few Left',
            peopleViewing: 'people viewing this',
            viewCount: 'views',
            addToWishlist: 'Add to Wishlist',
            shopProducts: 'More from this Shop',
            contactSeller: 'Ask Seller',
            whatsappContact: 'Contact via WhatsApp',
            callNow: 'Call Now',
            sendEmail: 'Send Email'
        }
    };

    const t = texts[language] || texts.tr;

    useEffect(() => {
        // Extract UUID from slug-like ID (e.g., "product-name-uuid")
        // UUID regex: 8-4-4-4-12 hex chars
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const match = id.match(uuidPattern);
        const realId = match ? match[0] : id;

        fetchProduct(realId);
    }, [id]);

    // Affiliate Tracking
    useEffect(() => {
        const trackAffiliateClick = async () => {
            if (!product) return;

            const params = new URLSearchParams(location.search);
            const refCode = params.get('ref');
            const campaignSlug = params.get('c') || params.get('campaign');

            // If no ref code, nothing to track
            if (!refCode) return;

            // Simple session check to prevent duplicate clicks on refresh
            const sessionKey = `tracked_${refCode}_${product.id}`;
            if (sessionStorage.getItem(sessionKey)) return;

            try {
                // 1. Find referrer shop
                const { data: referrerShop } = await supabase
                    .from('shop_accounts')
                    .select('id')
                    .eq('affiliate_code', refCode.toUpperCase())
                    .single();

                if (!referrerShop) return;

                // 2. Record click
                const { error } = await supabase
                    .from('shop_affiliate_clicks')
                    .insert([{
                        shop_account_id: referrerShop.id,
                        product_id: product.id,
                        campaign_slug: campaignSlug,
                        clicked_at: new Date().toISOString()
                    }]);

                if (!error) {
                    sessionStorage.setItem(sessionKey, 'true');
                }
            } catch (err) {
                console.error('Affiliate tracking error:', err);
            }
        };

        trackAffiliateClick();
    }, [product, location.search]);

    const fetchProduct = async (productIdentifier) => {
        try {
            let productData = null;
            let productError = null;

            // First, try to find by slug
            const { data: slugResult, error: slugError } = await supabase
                .from('shop_products')
                .select('*')
                .eq('slug', productIdentifier)
                .eq('status', 'approved')
                .maybeSingle();

            if (slugResult) {
                productData = slugResult;
            } else {
                // If not found by slug, try by ID (for backwards compatibility)
                const { data: idResult, error: idError } = await supabase
                    .from('shop_products')
                    .select('*')
                    .eq('id', productIdentifier)
                    .eq('status', 'approved')
                    .maybeSingle();

                productData = idResult;
                productError = idError;
            }

            if (!productData) {
                console.error('Product not found by slug or ID:', productIdentifier);
                setLoading(false);
                return;
            }

            // Then fetch the shop
            if (productData?.shop_account_id) {
                const { data: shopData } = await supabase
                    .from('shop_accounts')
                    .select('id, slug, business_name, logo_url, plan, contact_whatsapp, contact_phone, contact_email, website_url, description_tr, description_de, description_en, display_settings')
                    .eq('id', productData.shop_account_id)
                    .single();

                productData.shop = shopData;

                // Fetch related products from same shop
                const { data: relatedData } = await supabase
                    .from('shop_products')
                    .select('id, name_tr, name_de, name_en, images, price, currency, show_price')
                    .eq('shop_account_id', productData.shop_account_id)
                    .eq('status', 'approved')
                    .neq('id', productData.id)
                    .limit(4);

                setRelatedProducts(relatedData || []);
            } else if (productData.product_type === 'amazon' && productData.category_id) {
                // Fetch related Amazon products in same category
                const { data: relatedData } = await supabase
                    .from('shop_products')
                    .select('id, name_tr, name_de, name_en, images, price, currency, show_price')
                    .eq('category_id', productData.category_id)
                    .eq('product_type', 'amazon')
                    .eq('status', 'approved')
                    .neq('id', productData.id)
                    .limit(4);

                setRelatedProducts(relatedData || []);
            }

            setProduct(productData);

            // Track page view and fetch total views
            if (productData?.shop?.id) {
                trackAnalytics(productData.shop.id, 'product_view');
                fetchTotalViews(productData.shop.id);

                // Tracking: Product View (Expert Analytics)
                trackFunnelStep('product_view', 2, {
                    shop_id: productData.shop.id,
                    product_id: productData.id,
                    product_name: productData.name_de || productData.name_tr,
                    product_type: productData.product_type
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    // Analytics tracking function
    const trackAnalytics = async (shopId, eventType) => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase.rpc('increment_shop_analytics', {
                p_shop_id: shopId,
                p_date: today,
                p_field: eventType === 'product_view' ? 'product_views' :
                    eventType === 'contact_click' ? 'contact_clicks' :
                        eventType === 'whatsapp_click' ? 'whatsapp_clicks' :
                            eventType === 'phone_click' ? 'phone_clicks' :
                                eventType === 'share_click' ? 'share_clicks' : 'page_views'
            });

            if (error) {
                console.log('Analytics tracking (non-critical):', error.message);
            }
        } catch (err) {
            console.log('Analytics error:', err);
        }
    };

    // Fetch real view count from analytics
    const fetchTotalViews = async (shopId) => {
        try {
            const { data, error } = await supabase
                .from('shop_analytics')
                .select('product_views')
                .eq('shop_id', shopId);

            if (!error && data) {
                // Sum all product_views for this shop
                const total = data.reduce((sum, row) => sum + (row.product_views || 0), 0);
                setTotalViews(total);
            }
        } catch (err) {
            console.log('View count fetch error:', err);
        }
    };

    // Dile göre alan seç
    const getLocalizedField = (item, field) => {
        const langField = `${field}_${language}`;
        return item?.[langField] || item?.[`${field}_tr`] || item?.[field] || '';
    };

    // Slugify helper
    const slugify = (text) => {
        return text?.toString()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-') || '';
    };

    // Generate hreflang URLs for all 3 languages
    const getHreflangUrls = () => {
        if (!product) return null;

        const getSlugForLang = (lang) => {
            const tags = product[`tags_${lang}`] || '';
            const slugTag = tags.split(',').find(t => t.trim().startsWith('slug:'));
            if (slugTag) return slugTag.split(':')[1].trim();
            return slugify(product[`name_${lang}`] || product.name_tr);
        };

        return {
            de: `/de/shop/produkt/${getSlugForLang('de')}-${product.id}`,
            tr: `/tr/shop/urun/${getSlugForLang('tr')}-${product.id}`,
            en: `/en/shop/product/${getSlugForLang('en')}-${product.id}`
        };
    };

    // Paylaşım fonksiyonları
    const shareOnWhatsApp = () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'share_click');
        const url = window.location.href;
        const text = getLocalizedField(product, 'name');
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`, '_blank');
    };

    const shareOnFacebook = () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'share_click');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    const copyLink = async () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'share_click');
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert(language === 'de' ? 'Link kopiert!' : language === 'en' ? 'Link copied!' : 'Link kopyalandı!');
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Contact handlers
    const handleWhatsApp = () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'whatsapp_click');
        const phone = product.shop.contact_whatsapp.replace(/[^0-9]/g, '');
        const productName = getLocalizedField(product, 'name');
        const message = language === 'de'
            ? `Hallo, ich interessiere mich für: ${productName}`
            : language === 'en'
                ? `Hello, I'm interested in: ${productName}`
                : `Merhaba, şu ürünle ilgileniyorum: ${productName}`;

        trackLeadContact('whatsapp', productName, product.id);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handlePhone = () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'phone_click');
        trackLeadContact('phone', getLocalizedField(product, 'name'), product.id);
        window.location.href = `tel:${product.shop.contact_phone}`;
    };

    const handleEmail = () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'contact_click');
        const productName = getLocalizedField(product, 'name');
        const subject = language === 'de'
            ? `Anfrage: ${productName}`
            : language === 'en'
                ? `Inquiry: ${productName}`
                : `Soru: ${productName}`;
        trackLeadContact('email', productName, product.id);
        window.location.href = `mailto:${product.shop.contact_email}?subject=${encodeURIComponent(subject)}`;
    };

    // CTA Butonuna tıklama
    const handleCta = () => {
        if (product?.shop?.id) trackAnalytics(product.shop.id, 'contact_click');

        if (product.product_type === 'amazon' && product.affiliate_url) {
            trackLeadContact('amazon_external', getLocalizedField(product, 'name'), product.id);
            trackFunnelStep('amazon_redirect', 3, { product_id: product.id });
            window.open(product.affiliate_url, '_blank');
            return;
        }

        if (product.external_url) {
            window.open(product.external_url, '_blank');
            return;
        }

        const shop = product.shop;
        if (shop?.contact_whatsapp) {
            handleWhatsApp();
        } else if (shop?.contact_phone) {
            handlePhone();
        } else if (shop?.contact_email) {
            handleEmail();
        } else if (shop?.slug) {
            window.location.href = `/shop/magaza/${shop.slug}`;
        }
    };

    // Note: View count is now fetched from real analytics (totalViews state)

    if (loading) {
        return (
            <div className="shop-product-page-premium">
                <div className="product-loading-premium">
                    <div className="loading-spinner-premium"></div>
                    <p>{t.loading}</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="shop-product-page-premium">
                <div className="container">
                    <div className="product-not-found-premium">
                        <span className="not-found-icon">😕</span>
                        <h2>{t.notFound}</h2>
                        <Link to="/shop" className="back-btn-premium">{t.back}</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isAmazon = product.product_type === 'amazon';
    const images = product.images || [];
    const shop = product.shop;
    const isPremiumShop = shop?.plan === 'premium' || shop?.plan === 'business';

    return (
        <div className="shop-product-page-premium">
            <SEO
                title={getLocalizedField(product, 'name')}
                description={getLocalizedField(product, 'description')}
                image={images[0]}
                url={window.location.pathname}
                keywords={getLocalizedField(product, 'tags')
                    ?.split(',')
                    .map(t => t.trim())
                    .filter(t => !t.startsWith('slug:'))
                    .join(', ')}
                type="product"
                hreflangUrls={getHreflangUrls()}
                structuredData={generateShopBreadcrumb(
                    product.shop?.business_name,
                    product.shop?.slug,
                    getLocalizedField(product, 'name'),
                    product.id
                )}
            />

            {/* Lightbox */}
            {lightboxOpen && images.length > 0 && (
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>×</button>
                    <img
                        src={images[selectedImage]}
                        alt={getLocalizedField(product, 'name')}
                        className="lightbox-image"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                className="lightbox-nav prev"
                                onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + images.length) % images.length); }}
                            >❮</button>
                            <button
                                className="lightbox-nav next"
                                onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % images.length); }}
                            >❯</button>
                        </>
                    )}
                </div>
            )}

            <div className="container">
                {/* Breadcrumb */}
                <div className="product-breadcrumb-premium">
                    <Link to={`/${language}/shop`}>Shop</Link>
                    <span className="separator">/</span>
                    {shop && (
                        <>
                            <Link to={`/shop/magaza/${shop.slug}`}>{shop.business_name}</Link>
                            <span className="separator">/</span>
                        </>
                    )}
                    <span className="current">{getLocalizedField(product, 'name')}</span>
                </div>

                <div className="product-layout-premium">
                    {/* Left: Gallery */}
                    <div className="product-gallery-premium">
                        <div className="main-image-container" onClick={() => images.length > 0 && setLightboxOpen(true)}>
                            {images.length > 0 ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={getLocalizedField(product, 'name')}
                                    className="main-image-premium"
                                />
                            ) : (
                                <div className="image-placeholder-premium">📦</div>
                            )}

                            {/* Labels */}
                            <div className="image-labels">
                                <span className={`product-label-premium ${isAmazon ? 'amazon' : 'boutique'}`}>
                                    {isAmazon ? '🛒 ' + t.amazonLabel : '✨ ' + t.boutiqueLabel}
                                </span>
                            </div>

                            {/* Zoom hint */}
                            {images.length > 0 && (
                                <div className="zoom-hint">
                                    <span>🔍</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="thumbnails-premium">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={`thumbnail-premium ${idx === selectedImage ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(idx)}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="product-info-premium">
                        {/* View Count Banner - shows real analytics data */}
                        {shop?.display_settings?.show_view_count !== false && totalViews > 0 && (
                            <div className="social-proof-banner">
                                <span className="views-badge">
                                    👁️ {totalViews} {t.viewCount}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="product-title-premium">{getLocalizedField(product, 'name')}</h1>

                        {/* Price */}
                        <div className="price-section-premium">
                            {product.show_price && product.price ? (
                                <div className="price-display">
                                    <span className="price-value-premium">{product.price}</span>
                                    <span className="price-currency-premium">{product.currency || 'EUR'}</span>
                                </div>
                            ) : product.price_on_request ? (
                                <div className="price-on-request-premium">
                                    💬 {t.priceOnRequest}
                                </div>
                            ) : null}

                            {/* Amazon Availability Badge */}
                            {isAmazon && (
                                <span className="stock-badge amazon-available">
                                    🟢 {language === 'de' ? 'Bei Amazon verfügbar' : language === 'en' ? 'Available on Amazon' : 'Amazon\'da Mevcut'}
                                </span>
                            )}

                            {/* Boutique Stock Badge - controlled by shop settings */}
                            {!isAmazon && shop?.display_settings?.show_stock_badge && (
                                <span className="stock-badge in-stock">
                                    ✓ {t.inStock}
                                </span>
                            )}
                        </div>

                        {/* Price Disclaimer for Amazon */}
                        {isAmazon && product.price && (
                            <div className="price-disclaimer">
                                ⓘ {language === 'de'
                                    ? 'Preis kann sich auf Amazon ändern. Stand: ' + new Date(product.updated_at || product.created_at).toLocaleDateString('de-DE')
                                    : language === 'en'
                                        ? 'Price may change on Amazon. Last updated: ' + new Date(product.updated_at || product.created_at).toLocaleDateString('en-US')
                                        : 'Fiyat Amazon\'da değişebilir. Son güncelleme: ' + new Date(product.updated_at || product.created_at).toLocaleDateString('tr-TR')
                                }
                            </div>
                        )}

                        {/* CTA Button - MOVED UP for better conversion */}
                        {isAmazon && (
                            <button
                                className="cta-button-premium amazon"
                                onClick={handleCta}
                            >
                                🛒 {t.viewOnAmazon}
                            </button>
                        )}

                        {/* Affiliate Disclosure - Required by German law for Amazon products */}
                        {isAmazon && <AffiliateDisclosure compact />}

                        {/* Description - Expandable for long text */}
                        {getLocalizedField(product, 'description') && (
                            <>
                                <div className={`product-description-premium ${!descriptionExpanded && getLocalizedField(product, 'description').length > 150 ? 'collapsed' : ''}`}>
                                    {getLocalizedField(product, 'description')}
                                </div>
                                {!descriptionExpanded && getLocalizedField(product, 'description').length > 150 && (
                                    <button
                                        className="read-more-btn"
                                        onClick={() => setDescriptionExpanded(true)}
                                    >
                                        {language === 'de' ? 'Mehr lesen...' : language === 'en' ? 'Read more...' : 'Devamını oku...'}
                                    </button>
                                )}
                            </>
                        )}

                        {/* Tags */}
                        {getLocalizedField(product, 'tags') && (
                            <div className="product-tags-premium">
                                {getLocalizedField(product, 'tags')
                                    .split(',')
                                    .map(t => t.trim())
                                    .filter(t => !t.startsWith('slug:'))
                                    .map((tag, idx) => (
                                        <span key={idx} className="product-tag">
                                            #{tag}
                                        </span>
                                    ))}
                            </div>
                        )}

                        {/* Trust Badges - Amazon products get special badges */}
                        {isAmazon ? (
                            <AmazonTrustBadges compact />
                        ) : (
                            shop?.display_settings?.show_trust_badges !== false && (
                                <div className="trust-badges-premium">
                                    <div className="trust-badge">
                                        <span className="badge-icon">✓</span>
                                        <span>{t.verified}</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="badge-icon">🚚</span>
                                        <span>{t.fastShipping}</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="badge-icon">🛡️</span>
                                        <span>{t.securePayment}</span>
                                    </div>
                                    <div className="trust-badge">
                                        <span className="badge-icon">💬</span>
                                        <span>{t.support}</span>
                                    </div>
                                </div>
                            )
                        )}

                        {/* Social Share Buttons */}
                        <SocialShareButtons
                            url={typeof window !== 'undefined' ? window.location.href : ''}
                            title={getLocalizedField(product, 'name')}
                            compact
                        />
                        {/* CTA Button - Only show for non-Amazon (Amazon button is at top) */}
                        {!isAmazon && (
                            <button
                                className="cta-button-premium boutique"
                                onClick={handleCta}
                            >
                                💬 {t.contact}
                            </button>
                        )}

                        {/* Contact Options */}
                        {!isAmazon && shop && (
                            <div className="contact-options-premium">
                                {shop.contact_whatsapp && (
                                    <button className="contact-btn whatsapp" onClick={handleWhatsApp}>
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        {t.whatsappContact}
                                    </button>
                                )}
                                {shop.contact_phone && (
                                    <button className="contact-btn phone" onClick={handlePhone}>
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                        {t.callNow}
                                    </button>
                                )}
                                {shop.contact_email && (
                                    <button className="contact-btn email" onClick={handleEmail}>
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                        {t.sendEmail}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Shop Card */}
                        {shop && (
                            <div className="shop-card-premium">
                                <div className="shop-card-header">
                                    <div className="shop-logo-container">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt={shop.business_name} className="shop-logo-premium" />
                                        ) : (
                                            <div className="shop-logo-placeholder">🏪</div>
                                        )}
                                    </div>
                                    <div className="shop-info-container">
                                        <h3 className="shop-name-premium">{shop.business_name}</h3>
                                        <div className="shop-badges">
                                            {isPremiumShop && (
                                                <span className="shop-badge premium">⭐ Premium</span>
                                            )}
                                            <span className="shop-badge verified">✓ {t.verified}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/shop/magaza/${shop.slug}`} className="visit-shop-btn">
                                    {t.viewShop} →
                                </Link>
                            </div>
                        )}

                        {/* Share Section */}
                        <div className="share-section-premium">
                            <span className="share-label-premium">{t.share}:</span>
                            <div className="share-buttons-premium">
                                <button className="share-btn-premium whatsapp" onClick={shareOnWhatsApp} title="WhatsApp">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                </button>
                                <button className="share-btn-premium facebook" onClick={shareOnFacebook} title="Facebook">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </button>
                                <button className="share-btn-premium copy" onClick={copyLink} title="Copy Link">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Back Link */}
                        <Link
                            to={shop?.slug ? `/shop/magaza/${shop.slug}` : `/${language}/shop`}
                            className="back-link-premium"
                        >
                            {t.back}
                        </Link>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2 className="section-title-premium">
                            <span className="title-icon">✨</span>
                            {t.shopProducts}
                        </h2>
                        <div className="related-products-grid">
                            {relatedProducts.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/${language}/shop/${language === 'de' ? 'produkt' : language === 'en' ? 'product' : 'urun'}/${item.id}`}
                                    className="related-product-card"
                                >
                                    <div className="related-product-image">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} alt={getLocalizedField(item, 'name')} />
                                        ) : (
                                            <div className="image-placeholder-small">📦</div>
                                        )}
                                    </div>
                                    <div className="related-product-info">
                                        <h4>{getLocalizedField(item, 'name')}</h4>
                                        {item.show_price && item.price && (
                                            <span className="related-product-price">
                                                {item.price} {item.currency || 'EUR'}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Mobile Sticky CTA Footer */}
            <div className="mobile-sticky-cta-footer lg:hidden">
                <div className="sticky-cta-container">
                    <div className="sticky-cta-price">
                        {product.price ? (
                            <>
                                <span className="sticky-price-currency">€</span>
                                <span className="sticky-price-amount">{product.price}</span>
                            </>
                        ) : (
                            <span className="sticky-price-amount" style={{ fontSize: '1rem' }}>{t.priceOnRequest}</span>
                        )}
                    </div>
                    <button className="sticky-cta-button" onClick={handleCta}>
                        {isAmazon ? t.viewOnAmazon : t.contact}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopProduct;
