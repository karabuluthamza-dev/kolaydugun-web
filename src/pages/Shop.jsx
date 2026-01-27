import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import './Shop.css';

const Shop = () => {
    const { language, t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // FAQ section removed - using main /faq page

    const lang = language || 'tr';

    const slugify = (text) => {
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    // Generate product URL with language prefix and correct slug
    const getProductUrl = (product) => {
        const tags = product[`tags_${lang}`] || '';
        const slugTag = tags.split(',').find(t => t.trim().startsWith('slug:'));
        let slug = '';

        if (slugTag) {
            slug = slugTag.split(':')[1].trim();
        } else {
            const productName = product[`name_${lang}`] || product.name_tr;
            slug = slugify(productName);
        }

        // Localized path segments
        const pathSegment = lang === 'de' ? 'produkt' : lang === 'en' ? 'product' : 'urun';
        return `/${lang}/shop/${pathSegment}/${slug}-${product.id}`;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchCategories();
        fetchAllProducts();
        // fetchFAQs(); - removed, using main FAQ page
    }, []);

    // Search Logic
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim().length > 2) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchQuery, language]);

    const performSearch = async () => {
        setIsSearching(true);
        try {
            // Search across name, description, AND tags in current language
            const searchTerm = `%${searchQuery}%`;
            const { data, error } = await supabase
                .from('shop_products')
                .select('id, name_tr, name_de, name_en, images, price, currency, show_price, tags_tr, tags_de, tags_en, product_type, status')
                .eq('status', 'approved')
                .or(`name_${lang}.ilike.${searchTerm},description_${lang}.ilike.${searchTerm},tags_${lang}.ilike.${searchTerm}`)
                .limit(20);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const { data: products, error } = await supabase
                .from('shop_products')
                .select(`
                    id, 
                    name_tr, name_de, name_en,
                    description_tr, description_de, description_en,
                    images, 
                    price, 
                    currency,
                    show_price,
                    category_id,
                    created_at,
                    product_type,
                    status
                `)
                .eq('status', 'approved')
                .not('category_id', 'is', null)
                .or('product_type.eq.amazon,product_type.eq.boutique')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('❌ Products fetch error:', error);
                // Handle 401/PGRST301 gracefully
                if (error.code === 'PGRST301' || error.status === 401) {
                    console.warn('[SHOP] Auth failure, products may be restricted. Showing only public products if available.');
                }
                setAllProducts([]);
                return;
            }

            setAllProducts(products || []);
            setFeaturedProducts(products?.slice(0, 6) || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setAllProducts([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('shop_categories')
                .select('*')
                .eq('is_active', true)
                .eq('show_on_homepage', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
                return;
            }
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // fetchFAQs removed - using main /faq page instead

    const getCategoryName = (cat) => cat[`name_${lang}`] || cat.name_tr || 'Kategori';
    const getCategoryTagline = (cat) => cat[`tagline_${lang}`] || cat.tagline_tr || '';

    if (loading) {
        return (
            <div className="shop-page">
                <div className="shop-loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-page">
            <SEO
                title={t('shop.title')}
                description={t('shop.subtitle')}
                image="/images/shop/hero-bride.png"
                url="/shop"
                hreflangUrls={{ de: '/shop', tr: '/shop', en: '/shop' }}
            />

            {/* ========== HERO - Split Layout ========== */}
            <section className="shop-hero split">
                <div className="hero-content">
                    <div className="hero-badge">✨ Boutique Collection</div>

                    <h1 className="hero-title">{t('shop.title')}</h1>
                    <p className="hero-subtitle">{t('shop.subtitle')}</p>

                    {/* Compact Search */}
                    <div className="compact-search-wrapper">
                        <div className="compact-search">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('shop.searchPlaceholder')}
                                className="compact-search-input"
                            />
                            {isSearching && <div className="search-spinner"></div>}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.length > 2 && (
                            <div className="search-results-dropdown">
                                {searchResults.length > 0 ? (
                                    <>
                                        {searchResults.slice(0, 5).map(product => (
                                            <Link key={product.id} to={getProductUrl(product)} className="search-result-item">
                                                <img src={product.images?.[0] || '/images/shop/placeholder.png'} alt="" className="result-thumb" />
                                                <div className="result-info">
                                                    <div className="result-name">{product[`name_${lang}`] || product.name_tr}</div>
                                                    {product.show_price && <div className="result-price">{product.price} {product.currency}</div>}
                                                </div>
                                            </Link>
                                        ))}
                                        {searchResults.length > 5 && (
                                            <div className="more-results">
                                                +{searchResults.length - 5} {t('shop.more')}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-results">
                                        {t('shop.noResults')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hero-buttons">
                        <a href="#products" className="hero-btn gold">
                            {t('shop.exploreBtn')}
                        </a>
                        <a href="#about" className="hero-btn navy">
                            {t('common.about')} <span>›</span>
                        </a>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/images/shop/hero-bride.png" alt="Wedding Boutique" />
                    <div className="hero-image-decoration"></div>
                </div>
            </section>

            {/* ========== HIDDEN SECTIONS - Can be enabled via admin later ==========
            
            {/* STATS BAR - Sosyal Kanıt */}
            {/*
            <section className="stats-bar">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-icon">👰</div>
                        <span className="stat-number">500+</span>
                        <span className="stat-label">{t.happyBrides}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-icon">🎁</div>
                        <span className="stat-number">1,200+</span>
                        <span className="stat-label">{t.curatedProducts}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-icon">🏪</div>
                        <span className="stat-number">50+</span>
                        <span className="stat-label">{t.trustedShops}</span>
                    </div>
                </div>
            </section>
            */}

            {/* USP - Değer Önerisi */}
            {/*
            <section className="usp-section">
                <div className="container">
                    <h2 className="usp-title">{t.uspTitle}</h2>
                    <div className="usp-grid">
                        <div className="usp-card">
                            <div className="usp-icon">♡</div>
                            <h3>{t.usp1Title}</h3>
                            <p>{t.usp1Desc}</p>
                        </div>
                        <div className="usp-card">
                            <div className="usp-icon">📦</div>
                            <h3>{t.usp2Title}</h3>
                            <p>{t.usp2Desc}</p>
                        </div>
                        <div className="usp-card">
                            <div className="usp-icon">💬</div>
                            <h3>{t.usp3Title}</h3>
                            <p>{t.usp3Desc}</p>
                        </div>
                        <div className="usp-card">
                            <div className="usp-icon">🔒</div>
                            <h3>{t.usp4Title}</h3>
                            <p>{t.usp4Desc}</p>
                        </div>
                    </div>
                </div>
            </section>
            */}

            {/* BIG CATEGORY CARDS */}
            {/*
            <section id="categories" className="shop-categories">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Koleksiyon</span>
                        <h2>{t.categories}</h2>
                        <p>{t.categoriesSubtitle}</p>
                    </div>

                    <div className="category-grid">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/shop/kategori/${cat.slug}`}
                                className="category-card"
                            >
                                <img
                                    src={cat.image_url || '/images/shop/placeholder.png'}
                                    alt={getCategoryName(cat)}
                                    className="category-img"
                                    loading="lazy"
                                />
                                <div className="category-overlay"></div>
                                <div className="category-text">
                                    <span className="boutique-badge">Boutique</span>
                                    <h3>{getCategoryName(cat)}</h3>
                                    <p className="tagline">{getCategoryTagline(cat)}</p>
                                    <span className="explore-cta">
                                        {t.explore} <span className="arrow">→</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            */}

            {/* ========== END HIDDEN SECTIONS ========== */}

            {/* ========== INFO BANNER - Vendor Clarification ========== */}
            <section className="info-banner">
                <div className="info-banner-content">
                    <span className="info-icon">ℹ️</span>
                    <p>
                        {language === 'de' ? (
                            <>
                                <strong>Amazon Produkte:</strong> Kuratierte Affiliate-Produkte.
                                <span className="separator">•</span>
                                <strong>Anbieter?</strong>
                                <Link to="/shop/basvuru" className="info-link">Shop eröffnen →</Link>
                            </>
                        ) : language === 'en' ? (
                            <>
                                <strong>Amazon Products:</strong> Curated affiliate items.
                                <span className="separator">•</span>
                                <strong>Vendor?</strong>
                                <Link to="/shop/basvuru" className="info-link">Open shop →</Link>
                            </>
                        ) : (
                            <>
                                <strong>Amazon Ürünleri:</strong> Seçilmiş affiliate ürünler.
                                <span className="separator">•</span>
                                <strong>Tedarikçi misiniz?</strong>
                                <Link to="/shop/basvuru" className="info-link">Mağaza açın →</Link>
                            </>
                        )}
                    </p>
                </div>
            </section>

            {/* ========== ALL PRODUCTS - Elegant Filter Bar ========== */}
            <section id="products" className="all-products-section">
                <div className="container">
                    {/* Elegant Inline Filter Bar */}
                    <div className="elegant-filter-bar">
                        <button
                            className={`elegant-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            ✨ {language === 'de' ? 'Alle' : language === 'en' ? 'All' : 'Tümü'}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`elegant-filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(cat.id)}
                            >
                                {cat.icon || '📦'} {getCategoryName(cat)}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div className="all-products-grid">
                        {allProducts
                            .filter(p => activeFilter === 'all' || p.category_id === activeFilter)
                            .map((product) => {
                                const productName = product[`name_${lang}`] || product.name_tr || 'Ürün';
                                const productImage = product.images?.[0] || '/images/shop/placeholder.png';
                                const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                                return (
                                    <Link
                                        key={product.id}
                                        to={getProductUrl(product)}
                                        className="product-card-mini"
                                    >
                                        <div className="product-image-mini">
                                            <img src={productImage} alt={productName} loading="lazy" />
                                            {isNew && <span className="new-badge">{language === 'de' ? 'Neu' : language === 'en' ? 'New' : 'Yeni'}</span>}
                                            {product.product_type === 'amazon' && <span className="amazon-badge">🛒</span>}
                                        </div>
                                        <div className="product-info-mini">
                                            <h4>{productName}</h4>
                                            {product.show_price && product.price && (
                                                <span className="product-price-mini">
                                                    {product.price} {product.currency || 'EUR'}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>

                    {allProducts.filter(p => activeFilter === 'all' || p.category_id === activeFilter).length === 0 && (
                        <div className="no-products">
                            {t('shop.noResults')}
                        </div>
                    )}
                </div>
            </section>

            {/* ========== CTA BANNER ========== */}
            <section className="cta-banner">
                <div className="cta-content">
                    <h2>{t('shop.cta.title')}</h2>
                    <p>{t('shop.cta.subtitle')}</p>
                    <Link to="/shop/basvuru" className="cta-btn">
                        {t('shop.cta.btn')} <span>→</span>
                    </Link>
                </div>
            </section>

            {/* ========== NEWSLETTER ========== */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content">
                        <h2>{t('shop.newsletter.title')}</h2>
                        <p>{t('shop.newsletter.subtitle')}</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder={t('shop.newsletter.placeholder')}
                                className="newsletter-input"
                            />
                            <button type="submit" className="newsletter-btn">
                                {t('shop.newsletter.subscribe')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shop;
