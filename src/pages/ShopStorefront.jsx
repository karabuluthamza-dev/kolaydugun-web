import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import './Shop.css';

const ShopStorefront = () => {
    const { slug } = useParams();
    const { language } = useLanguage();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [galleryAlbums, setGalleryAlbums] = useState([]);
    const [activeGalleryFilter, setActiveGalleryFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef(null);

    // Lightbox state
    const [lightbox, setLightbox] = useState({
        isOpen: false,
        currentIndex: 0,
        images: []
    });

    // Video lightbox state
    const [videoLightbox, setVideoLightbox] = useState({
        isOpen: false,
        videoUrl: '',
        title: '',
        platform: '', // 'youtube', 'vimeo', 'tiktok', 'instagram', 'drive'
        aspectRatio: '16:9' // '16:9' or '9:16'
    });

    // Share modal state
    const [shareModal, setShareModal] = useState({
        isOpen: false,
        url: '',
        text: '',
        type: '' // 'image' or 'album'
    });

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const texts = {
        tr: {
            products: 'Ürünler',
            all: 'Tümü',
            contact: 'İletişim',
            whatsapp: 'WhatsApp',
            whatsappCta: 'Tarihinizi Sorun - 2 Dk Yanıt',
            phone: 'Telefon',
            email: 'E-posta',
            website: 'Website',
            noProducts: 'Henüz ürün eklenmemiş',
            backToShop: '← Mağazaya Dön',
            notFound: 'Mağaza bulunamadı',
            loading: 'Yükleniyor...',
            share: 'Paylaş',
            vipShop: 'VIP Mağaza',
            priceOnRequest: 'Fiyat için iletişime geçin',
            verified: 'Doğrulanmış Tedarikçi',
            experience: 'yıl tecrübe',
            productCount: 'Ürün',
            messageUs: 'Bize Ulaşın',
            quickContact: 'Hızlı İletişim',
            followUs: 'Takip Et',
            trustedSeller: 'Güvenilir Satıcı',
            viewDetail: 'Detay',
            aboutUs: 'Hakkımızda',
            howWeWork: 'Nasıl Çalışıyoruz',
            gallery: 'Galeri'
        },
        de: {
            products: 'Produkte',
            all: 'Alle',
            contact: 'Kontakt',
            whatsapp: 'WhatsApp',
            whatsappCta: 'Termin anfragen - Antwort in 2 Min',
            phone: 'Telefon',
            email: 'E-Mail',
            website: 'Website',
            noProducts: 'Noch keine Produkte hinzugefügt',
            backToShop: '← Zurück zum Shop',
            notFound: 'Shop nicht gefunden',
            loading: 'Laden...',
            share: 'Teilen',
            vipShop: 'VIP Shop',
            priceOnRequest: 'Preis auf Anfrage',
            verified: 'Verifizierter Anbieter',
            experience: 'Jahre Erfahrung',
            productCount: 'Produkte',
            messageUs: 'Kontaktieren Sie uns',
            quickContact: 'Schnellkontakt',
            followUs: 'Folgen',
            trustedSeller: 'Vertrauenswürdiger Verkäufer',
            viewDetail: 'Details',
            aboutUs: 'Über uns',
            howWeWork: 'So arbeiten wir',
            gallery: 'Galerie'
        },
        en: {
            products: 'Products',
            all: 'All',
            contact: 'Contact',
            whatsapp: 'WhatsApp',
            whatsappCta: 'Ask for Availability - 2 Min Reply',
            phone: 'Phone',
            email: 'Email',
            website: 'Website',
            noProducts: 'No products added yet',
            backToShop: '← Back to Shop',
            notFound: 'Shop not found',
            loading: 'Loading...',
            share: 'Share',
            vipShop: 'VIP Shop',
            priceOnRequest: 'Price on request',
            verified: 'Verified Supplier',
            experience: 'years experience',
            productCount: 'Products',
            messageUs: 'Message Us',
            quickContact: 'Quick Contact',
            followUs: 'Follow',
            trustedSeller: 'Trusted Seller',
            viewDetail: 'Details',
            aboutUs: 'About Us',
            howWeWork: 'How We Work',
            gallery: 'Gallery'
        }
    };

    const txt = texts[language] || texts.tr;

    useEffect(() => {
        if (slug) {
            fetchShopData();
        }
    }, [slug]);

    const fetchShopData = async () => {
        setLoading(true);
        try {
            // Fetch shop account
            const { data: shopData, error: shopError } = await supabase
                .from('shop_accounts')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (shopError || !shopData) {
                setShop(null);
                setLoading(false);
                return;
            }

            setShop(shopData);

            // Fetch products
            const { data: productsData, error: prodError } = await supabase
                .from('shop_products')
                .select('*')
                .eq('shop_account_id', shopData.id)
                .eq('status', 'approved')
                .order('display_order', { ascending: true });

            if (prodError) {
                console.error('Products fetch error:', prodError);
            }

            // Fetch custom categories for this shop
            const { data: customCatsData, error: catError } = await supabase
                .from('shop_custom_categories')
                .select('id, name_tr, name_de, name_en, icon')
                .eq('shop_id', shopData.id)
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            console.log('Custom categories:', customCatsData, 'Error:', catError);

            // Create category lookup map
            const categoryMap = {};
            if (customCatsData) {
                customCatsData.forEach(cat => {
                    categoryMap[cat.id] = cat;
                });
            }

            console.log('Category map:', categoryMap);
            console.log('Products with custom_category_id:', productsData?.map(p => ({ name: p.name_tr, cat_id: p.custom_category_id })));

            // Enrich products with category objects
            const enrichedProducts = (productsData || []).map(p => ({
                ...p,
                custom_category: p.custom_category_id ? categoryMap[p.custom_category_id] : null
            }));

            console.log('Enriched products:', enrichedProducts.map(p => ({ name: p.name_tr, cat: p.custom_category?.name_tr })));

            setProducts(enrichedProducts);

            // Fetch gallery
            const { data: galleryData } = await supabase
                .from('shop_gallery')
                .select('*')
                .eq('shop_id', shopData.id)
                .order('sort_order', { ascending: true });

            setGallery(galleryData || []);

            // Fetch gallery albums
            const { data: albumsData } = await supabase
                .from('shop_gallery_albums')
                .select('*')
                .eq('shop_id', shopData.id)
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            setGalleryAlbums(albumsData || []);
        } catch (error) {
            console.error('Error fetching shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedField = (item, field) => {
        const langField = `${field}_${language}`;
        return item?.[langField] || item?.[`${field}_tr`] || item?.[field] || '';
    };

    const shareOnWhatsApp = () => {
        const url = window.location.href;
        const text = shop?.business_name || '';
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`, '_blank');
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert(language === 'de' ? 'Link kopiert!' : language === 'en' ? 'Link copied!' : 'Link kopyalandı!');
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Lightbox functions
    const openLightbox = (index) => {
        const images = gallery.filter(item =>
            (activeGalleryFilter === 'all' || item.album_id === activeGalleryFilter) &&
            item.type === 'image'
        );
        setLightbox({
            isOpen: true,
            currentIndex: index,
            images: images
        });
    };

    const closeLightbox = () => {
        setLightbox({ isOpen: false, currentIndex: 0, images: [] });
    };

    const nextImage = () => {
        setLightbox(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.images.length
        }));
    };

    const prevImage = () => {
        setLightbox(prev => ({
            ...prev,
            currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
        }));
    };

    // Share functions
    const shareImage = (item, e) => {
        e?.stopPropagation();
        const url = `${window.location.origin}/shop/magaza/${shop.slug}/galeri/${item.id}`;
        const title = item[`title_${language}`] || item.title_tr || 'Galeri';
        setShareModal({
            isOpen: true,
            url: url,
            text: `${shop.business_name} - ${title}`,
            type: 'image'
        });
    };

    const shareAlbum = (album) => {
        const url = `${window.location.origin}/shop/magaza/${shop.slug}/galeri?album=${album.id}`;
        const albumName = album[`name_${language}`] || album.name_tr;
        setShareModal({
            isOpen: true,
            url: url,
            text: `${shop.business_name} - ${albumName} Albümü`,
            type: 'album'
        });
    };

    const closeShareModal = () => {
        setShareModal({ isOpen: false, url: '', text: '', type: '' });
    };

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareModal.url);
            alert(language === 'de' ? 'Link kopiert!' : language === 'en' ? 'Link copied!' : 'Link kopyalandı!');
            closeShareModal();
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Keyboard controls for lightbox
    useEffect(() => {
        if (!lightbox.isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox.isOpen, lightbox.currentIndex]);

    // Video lightbox functions
    const detectVideoPlatform = (url) => {
        if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('vimeo')) return 'vimeo';
        if (url.includes('tiktok')) return 'tiktok';
        if (url.includes('instagram')) return 'instagram';
        if (url.includes('drive.google')) return 'drive';
        return 'unknown';
    };

    const getVideoEmbedUrl = (url) => {
        // YouTube
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

        // TikTok
        const tiktokMatch = url.match(/video\/(\d+)/);
        if (tiktokMatch) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;

        // Instagram
        const instagramMatch = url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/);
        if (instagramMatch) return `https://www.instagram.com/${instagramMatch[1]}/${instagramMatch[2]}/embed/captioned`;

        // Google Drive
        if (url.includes('drive.google')) return url.replace('/view', '/preview');

        return url;
    };

    const openVideoLightbox = (item) => {
        const platform = detectVideoPlatform(item.url);

        let aspectRatio = '16:9';
        if (platform === 'tiktok' || platform === 'instagram') {
            aspectRatio = '9:16';
        } else if (platform === 'youtube' && item.url.includes('/shorts/')) {
            aspectRatio = '9:16';
        }

        setVideoLightbox({
            isOpen: true,
            videoUrl: getVideoEmbedUrl(item.url),
            title: item[`title_${language}`] || item.title_tr || '',
            platform: platform,
            aspectRatio: aspectRatio
        });
    };

    const closeVideoLightbox = () => {
        setVideoLightbox({
            isOpen: false,
            videoUrl: '',
            title: '',
            platform: '',
            aspectRatio: '16:9'
        });
    };

    // Keyboard controls for video lightbox
    useEffect(() => {
        if (!videoLightbox.isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeVideoLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [videoLightbox.isOpen]);

    // Get unique categories from products (both main and custom)
    // Prefer custom_category if available
    const getProductCategory = (p) => p.custom_category || p.category;

    const categoryList = products
        .map(p => getProductCategory(p))
        .filter((cat, idx, arr) => cat && arr.findIndex(c => c?.id === cat.id) === idx);

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => {
            const cat = getProductCategory(p);
            return cat?.id === filter;
        });

    // Check if shop has VIP badge
    const planDefaults = { starter: false, business: false, premium: true };
    const hasVip = planDefaults[shop?.plan] || false;

    if (loading) {
        return (
            <div className="shop-storefront-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>{txt.loading}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="shop-storefront-page">
                <div className="container">
                    <div className="not-found-state">
                        <span className="icon">🏪</span>
                        <h2>{txt.notFound}</h2>
                        <Link to="/shop" className="back-link">{txt.backToShop}</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-storefront-page-premium">
            <SEO
                title={`${shop.business_name} | KolayDugun Shop`}
                description={getLocalizedField(shop, 'description') || shop.business_name}
                image={shop.logo_url}
            />

            {/* Premium Hero Section with Parallax */}
            <div className="storefront-hero-premium" ref={heroRef}>
                <div
                    className="hero-bg-premium"
                    style={{
                        backgroundImage: (shop.banner_url || shop.cover_image_url) ? `url(${shop.banner_url || shop.cover_image_url})` : 'none',
                        transform: `translateY(${scrollY * 0.3}px)`
                    }}
                />
                <div className="hero-overlay-premium" />

                <div className="container">
                    <div className="shop-card-floating">
                        {/* Logo */}
                        <div className="shop-logo-premium">
                            {shop.logo_url ? (
                                <img src={shop.logo_url} alt={shop.business_name} />
                            ) : (
                                <span className="logo-placeholder-premium">🏪</span>
                            )}
                        </div>

                        {/* Shop Info */}
                        <div className="shop-info-premium">
                            {/* Badges */}
                            <div className="shop-badges-premium">
                                {hasVip && (
                                    <span className="badge-vip">
                                        <span className="badge-icon">⭐</span> {txt.vipShop}
                                    </span>
                                )}
                                {shop.plan === 'premium' && (
                                    <span className="badge-verified">
                                        <span className="badge-icon">✓</span> {txt.verified}
                                    </span>
                                )}
                                <span className="badge-trusted">
                                    <span className="badge-icon">🛡️</span> {txt.trustedSeller}
                                </span>
                            </div>

                            <h1 className="shop-title-premium">{shop.business_name}</h1>

                            {/* Slogan */}
                            {getLocalizedField(shop, 'slogan') && (
                                <p className="shop-slogan-premium">
                                    "{getLocalizedField(shop, 'slogan')}"
                                </p>
                            )}

                            {getLocalizedField(shop, 'description') && (
                                <p className="shop-desc-premium">{getLocalizedField(shop, 'description')}</p>
                            )}

                            {/* Stats */}
                            <div className="shop-stats-premium">
                                <div className="stat-item">
                                    <span className="stat-value">📦 {products.length}</span>
                                    <span className="stat-label">{txt.productCount}</span>
                                </div>
                                <div className="stat-divider" />
                                <div className="stat-item">
                                    <span className="stat-value">🏆 {shop.experience_years || 10}+</span>
                                    <span className="stat-label">{txt.experience}</span>
                                </div>
                                <div className="stat-divider" />
                                <div className="stat-item">
                                    <span className="stat-value">⭐⭐⭐⭐⭐</span>
                                    <span className="stat-label">{shop.rating || 4.9} Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Buttons Premium */}
                        <div className="contact-section-premium">
                            <h3 className="contact-title">{txt.quickContact}</h3>
                            <div className="contact-buttons-premium">
                                {shop.contact_whatsapp && (
                                    <a
                                        href={`https://wa.me/${shop.contact_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(language === 'de' ? 'Hallo, ich interessiere mich für Ihre Dienstleistungen.' : language === 'en' ? 'Hello, I am interested in your services.' : 'Merhaba, hizmetleriniz hakkında bilgi almak istiyorum.')}`}
                                        className="contact-btn-premium whatsapp"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        {txt.whatsappCta}
                                    </a>
                                )}
                                {shop.contact_phone && (
                                    <a href={`tel:${shop.contact_phone}`} className="contact-btn-premium phone">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                        {txt.phone}
                                    </a>
                                )}
                                {shop.contact_email && (
                                    <a href={`mailto:${shop.contact_email}`} className="contact-btn-premium email">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                        {txt.email}
                                    </a>
                                )}
                                {shop.website_url && (
                                    <a href={shop.website_url} className="contact-btn-premium website" target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                        {txt.website}
                                    </a>
                                )}
                            </div>

                            {/* Share */}
                            <div className="share-section-premium">
                                <span className="share-label-premium">{txt.share}:</span>
                                <button onClick={shareOnWhatsApp} className="share-btn-premium" title="WhatsApp">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                </button>
                                <button onClick={shareOnFacebook} className="share-btn-premium" title="Facebook">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </button>
                                <button onClick={copyLink} className="share-btn-premium" title="Copy Link">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section Premium */}
            <div className="storefront-products-premium">
                <div className="container">
                    <div className="products-header-premium">
                        <h2>
                            <span className="header-icon">✨</span>
                            {txt.products}
                            <span className="product-count">({products.length})</span>
                        </h2>

                        {/* Category Filter Premium */}
                        {categoryList.length > 0 && (
                            <div className="category-filter-premium">
                                <button
                                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    {txt.all}
                                </button>
                                {categoryList.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`filter-tab ${filter === cat.id ? 'active' : ''}`}
                                        onClick={() => setFilter(cat.id)}
                                    >
                                        {cat.icon && <span className="cat-icon">{cat.icon}</span>}
                                        {getLocalizedField(cat, 'name')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="no-products-premium">
                            <span className="empty-icon">📭</span>
                            <p>{txt.noProducts}</p>
                        </div>
                    ) : (
                        <div className="products-grid-premium">
                            {filteredProducts.map((product, index) => (
                                <Link
                                    key={product.id}
                                    to={`/shop/urun/${product.id}`}
                                    className="product-card-premium"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="product-image-premium">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={getLocalizedField(product, 'name')} />
                                        ) : (
                                            <div className="image-placeholder-premium">📦</div>
                                        )}
                                        <div className="product-overlay">
                                            <span className="view-btn">👁️ {txt.viewDetail}</span>
                                        </div>
                                        {(product.custom_category || product.category) && (
                                            <span className="category-badge-premium">
                                                {product.custom_category?.icon && `${product.custom_category.icon} `}
                                                {getLocalizedField(product.custom_category || product.category, 'name')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="product-info-premium">
                                        <h3>{getLocalizedField(product, 'name')}</h3>
                                        {product.show_price && product.price ? (
                                            <div className="product-price-premium">
                                                <span className="price-value">{product.price}</span>
                                                <span className="price-currency">{product.currency || 'EUR'}</span>
                                            </div>
                                        ) : product.price_on_request ? (
                                            <div className="product-price-premium on-request">
                                                {txt.priceOnRequest}
                                            </div>
                                        ) : null}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* About Us & How We Work Section */}
            {(getLocalizedField(shop, 'about') || getLocalizedField(shop, 'how_we_work')) && (
                <div className="storefront-about-section">
                    <div className="container">
                        <div className="about-grid">
                            {/* About Us */}
                            {getLocalizedField(shop, 'about') && (
                                <div className="about-card">
                                    <h2>
                                        <span className="section-icon">📖</span>
                                        {txt.aboutUs}
                                    </h2>
                                    <div className="about-content">
                                        {getLocalizedField(shop, 'about').split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* How We Work */}
                            {getLocalizedField(shop, 'how_we_work') && (
                                <div className="about-card how-we-work">
                                    <h2>
                                        <span className="section-icon">⚙️</span>
                                        {txt.howWeWork}
                                    </h2>
                                    <div className="how-we-work-content">
                                        {getLocalizedField(shop, 'how_we_work').split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Section */}
            {gallery.length > 0 && (
                <div className="storefront-gallery-section">
                    <div className="container">
                        <h2 className="gallery-title">
                            <span className="section-icon">🖼️</span>
                            {txt.gallery}
                        </h2>

                        {/* Album Filter Tabs */}
                        {galleryAlbums.length > 0 && (
                            <div className="gallery-filter-tabs">
                                <button
                                    className={`filter-tab ${activeGalleryFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveGalleryFilter('all')}
                                >
                                    📁 {txt.all}
                                </button>
                                {galleryAlbums.map(album => (
                                    <div key={album.id} className="filter-tab-wrapper">
                                        <button
                                            className={`filter-tab ${activeGalleryFilter === album.id ? 'active' : ''}`}
                                            onClick={() => setActiveGalleryFilter(album.id)}
                                        >
                                            {album.icon || '📂'} {album[`name_${language}`] || album.name_tr}
                                        </button>
                                        <button
                                            className="album-share-btn-small"
                                            onClick={() => shareAlbum(album)}
                                            title={language === 'de' ? 'Album teilen' : language === 'en' ? 'Share album' : 'Albümü paylaş'}
                                        >
                                            📤
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="gallery-grid">
                            {gallery
                                .filter(item => activeGalleryFilter === 'all' || item.album_id === activeGalleryFilter)
                                .map((item, index) => {
                                    const filteredImages = gallery.filter(g =>
                                        (activeGalleryFilter === 'all' || g.album_id === activeGalleryFilter) &&
                                        g.type === 'image'
                                    );
                                    const imageIndex = filteredImages.findIndex(img => img.id === item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className="gallery-item clickable"
                                            onClick={() => item.type === 'image' ? openLightbox(imageIndex) : openVideoLightbox(item)}
                                        >
                                            {item.type === 'image' ? (
                                                <>
                                                    <img
                                                        src={item.url}
                                                        alt={item[`title_${language}`] || item.title_tr || ''}
                                                        loading="lazy"
                                                    />
                                                    <div className="gallery-overlay">
                                                        <span className="view-icon">🔍 {language === 'de' ? 'Vergrößern' : language === 'en' ? 'Enlarge' : 'Büyüt'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="video-thumbnail-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                    <iframe
                                                        src={
                                                            item.url.includes('youtube')
                                                                ? `https://www.youtube.com/embed/${item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1] || ''}?controls=0&showinfo=0&rel=0`
                                                                : item.url.includes('vimeo')
                                                                    ? `https://player.vimeo.com/video/${item.url.match(/vimeo\.com\/(\d+)/)?.[1] || ''}?background=1`
                                                                    : item.url.includes('tiktok')
                                                                        ? `https://www.tiktok.com/embed/v2/${item.url.match(/video\/(\d+)/)?.[1] || ''}`
                                                                        : item.url.includes('instagram')
                                                                            ? `https://www.instagram.com/${item.url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/)?.[1]}/${item.url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/)?.[2]}/embed`
                                                                            : item.url.includes('drive.google')
                                                                                ? item.url.replace('/view', '/preview')
                                                                                : item.url
                                                        }
                                                        title={item[`title_${language}`] || item.title_tr || ''}
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <div className="gallery-overlay">
                                                        <span className="view-icon">▶️ {language === 'de' ? 'Abspielen' : language === 'en' ? 'Play' : 'Oynat'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {(item[`title_${language}`] || item.title_tr) && (
                                                <div className="gallery-caption">
                                                    {item[`title_${language}`] || item.title_tr}
                                                </div>
                                            )}
                                            <span className="gallery-type-badge">
                                                {item.type === 'image' ? '📷' : '🎥'}
                                            </span>
                                            <button
                                                className="gallery-share-btn"
                                                onClick={(e) => shareImage(item, e)}
                                                title={language === 'de' ? 'Teilen' : language === 'en' ? 'Share' : 'Paylaş'}
                                            >
                                                📤
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {/* Back Link Premium */}
            <div className="container" style={{ paddingBottom: '3rem' }}>
                <Link to="/shop" className="back-to-shop-premium">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                    {txt.backToShop}
                </Link>
            </div>

            {/* Video Lightbox Modal */}
            {videoLightbox.isOpen && (
                <div className="lightbox-overlay" onClick={closeVideoLightbox}>
                    <div
                        className={`lightbox-container video-mode ${videoLightbox.aspectRatio === '9:16' ? 'vertical-video' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="lightbox-close" onClick={closeVideoLightbox}>✕</button>

                        <div className="video-lightbox-content">
                            <iframe
                                src={videoLightbox.videoUrl}
                                title={videoLightbox.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                // Prevent top-level navigation (redirects) but allow scripts and same-origin access
                                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                                allowFullScreen
                                className="lightbox-video-frame"
                            />
                        </div>

                        {videoLightbox.title && (
                            <div className="lightbox-info">
                                <span className="lightbox-title">{videoLightbox.title}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightbox.isOpen && lightbox.images.length > 0 && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>✕</button>

                        {lightbox.images.length > 1 && (
                            <>
                                <button className="lightbox-prev" onClick={prevImage}>‹</button>
                                <button className="lightbox-next" onClick={nextImage}>›</button>
                            </>
                        )}

                        <img
                            src={lightbox.images[lightbox.currentIndex]?.url}
                            alt={lightbox.images[lightbox.currentIndex]?.[`title_${language}`] || lightbox.images[lightbox.currentIndex]?.title_tr || ''}
                            className="lightbox-image"
                        />

                        <div className="lightbox-info">
                            <span className="lightbox-counter">
                                {lightbox.currentIndex + 1} / {lightbox.images.length}
                            </span>
                            {(lightbox.images[lightbox.currentIndex]?.[`title_${language}`] || lightbox.images[lightbox.currentIndex]?.title_tr) && (
                                <span className="lightbox-title">
                                    {lightbox.images[lightbox.currentIndex]?.[`title_${language}`] || lightbox.images[lightbox.currentIndex]?.title_tr}
                                </span>
                            )}
                            <button
                                className="lightbox-share"
                                onClick={(e) => shareImage(lightbox.images[lightbox.currentIndex], e)}
                            >
                                📤 {language === 'de' ? 'Teilen' : language === 'en' ? 'Share' : 'Paylaş'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {shareModal.isOpen && (
                <div className="share-modal-overlay" onClick={closeShareModal}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h3>📤 {language === 'de' ? 'Teilen' : language === 'en' ? 'Share' : 'Paylaş'}</h3>
                            <button className="share-modal-close" onClick={closeShareModal}>✕</button>
                        </div>
                        <div className="share-modal-body">
                            <p className="share-text">{shareModal.text}</p>
                            <div className="share-url-box">
                                <input
                                    type="text"
                                    value={shareModal.url}
                                    readOnly
                                    onClick={(e) => e.target.select()}
                                />
                            </div>
                            <div className="share-buttons">
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(shareModal.text + '\n' + shareModal.url)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn whatsapp"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    WhatsApp
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModal.url)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn facebook"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Facebook
                                </a>
                                <button
                                    onClick={copyShareLink}
                                    className="share-btn copy"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
                                    {language === 'de' ? 'Link kopieren' : language === 'en' ? 'Copy Link' : 'Linki Kopyala'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating WhatsApp Button */}
            {shop.contact_whatsapp && (
                <a
                    href={`https://wa.me/${shop.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                    className="floating-whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={txt.messageUs}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
            )}

            <style>{`
                /* ===== PREMIUM SHOP STOREFRONT STYLES ===== */
                
                .lightbox-container.video-mode {
                    background: black;
                    width: 90vw;
                    max-width: 1000px;
                    aspect-ratio: 16/9;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    overflow: hidden;
                }

                .lightbox-container.video-mode.vertical-video {
                    max-width: 400px; /* Mobile phone width */
                    aspect-ratio: 9/16;
                    height: 85vh;
                    width: auto;
                }

                .video-lightbox-content {
                    flex: 1;
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .lightbox-video-frame {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                .video-thumbnail-wrapper {
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .shop-storefront-page-premium {
                    min-height: 100vh;
                    background: #f8fafc;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .shop-storefront-page-premium .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                /* ===== PREMIUM HERO ===== */
                .storefront-hero-premium {
                    position: relative;
                    min-height: 500px;
                    overflow: hidden;
                    display: flex;
                    align-items: flex-end;
                    padding-bottom: 3rem;
                }

                .hero-bg-premium {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 450px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }

                .hero-overlay-premium {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 450px;
                    background: linear-gradient(
                        to bottom,
                        rgba(0,0,0,0.3) 0%,
                        rgba(0,0,0,0.4) 60%,
                        #f8fafc 100%
                    );
                }

                .shop-card-floating {
                    position: relative;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 28px;
                    padding: 2.5rem;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    gap: 2.5rem;
                    align-items: start;
                    animation: fadeInUp 0.6s ease-out;
                    border: 1px solid rgba(255,255,255,0.8);
                }

                /* Logo */
                .shop-logo-premium {
                    width: 140px;
                    height: 140px;
                    border-radius: 24px;
                    overflow: hidden;
                    background: white;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid white;
                }

                .shop-logo-premium img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .logo-placeholder-premium {
                    font-size: 4rem;
                }

                /* Shop Info */
                .shop-info-premium {
                    flex: 1;
                }

                .shop-badges-premium {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .badge-vip {
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    animation: pulse 2s infinite;
                }

                .badge-verified {
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .badge-trusted {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .shop-title-premium {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.02em;
                }

                .shop-slogan-premium {
                    font-style: italic;
                    color: #7c3aed;
                    font-size: 1.1rem;
                    font-weight: 500;
                    margin: 0 0 1rem 0;
                    padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
                    border-left: 3px solid #7c3aed;
                    border-radius: 0 8px 8px 0;
                }

                .shop-desc-premium {
                    color: #475569;
                    line-height: 1.7;
                    margin: 0 0 1.5rem 0;
                    font-size: 1rem;
                    max-width: 500px;
                }

                /* Stats */
                .shop-stats-premium {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1rem 1.5rem;
                    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                    border-radius: 16px;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .stat-divider {
                    width: 1px;
                    height: 40px;
                    background: #cbd5e1;
                }

                /* Contact Section */
                .contact-section-premium {
                    min-width: 280px;
                }

                .contact-title {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin: 0 0 1rem 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .contact-buttons-premium {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .contact-btn-premium {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 20px;
                    border-radius: 14px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: white;
                }

                .contact-btn-premium svg {
                    width: 20px;
                    height: 20px;
                }

                .contact-btn-premium.whatsapp {
                    background: linear-gradient(135deg, #25d366, #128c7e);
                    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
                }

                .contact-btn-premium.phone {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                }

                .contact-btn-premium.email {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                    box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
                }

                .contact-btn-premium.website {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
                }

                .contact-btn-premium:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                /* Share Section */
                .share-section-premium {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                }

                .share-label-premium {
                    color: #64748b;
                    font-size: 0.85rem;
                }

                .share-btn-premium {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: #f1f5f9;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .share-btn-premium svg {
                    width: 18px;
                    height: 18px;
                    fill: #64748b;
                }

                .share-btn-premium:hover {
                    background: #e2e8f0;
                    transform: scale(1.1);
                }

                .share-btn-premium:hover svg {
                    fill: #0f172a;
                }

                /* ===== PRODUCTS SECTION ===== */
                .storefront-products-premium {
                    padding: 3rem 0 4rem;
                }

                .products-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .products-header-premium h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .header-icon {
                    font-size: 1.5rem;
                }

                .product-count {
                    color: #94a3b8;
                    font-weight: 400;
                }

                /* Category Filter */
                .category-filter-premium {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    background: white;
                    padding: 0.5rem;
                    border-radius: 16px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }

                .filter-tab {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #64748b;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .filter-tab .cat-icon {
                    font-size: 1rem;
                }

                .filter-tab:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .filter-tab.active {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
                }

                /* Products Grid */
                .products-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }

                .product-card-premium {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    text-decoration: none;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.5s ease-out backwards;
                }

                .product-card-premium:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
                }

                .product-image-premium {
                    position: relative;
                    height: 220px;
                    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                    overflow: hidden;
                }

                .product-image-premium img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .product-card-premium:hover .product-image-premium img {
                    transform: scale(1.1);
                }

                .product-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .product-card-premium:hover .product-overlay {
                    opacity: 1;
                }

                .view-btn {
                    background: white;
                    color: #0f172a;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .image-placeholder-premium {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    color: #cbd5e1;
                }

                .category-badge-premium {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #374151;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .product-info-premium {
                    padding: 1.25rem 1.5rem;
                }

                .product-info-premium h3 {
                    margin: 0 0 0.75rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #0f172a;
                    line-height: 1.4;
                }

                .product-price-premium {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                }

                .price-value {
                    font-size: 1.4rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #FF6B9D, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .price-currency {
                    font-size: 0.9rem;
                    color: #94a3b8;
                    font-weight: 500;
                }

                .product-price-premium.on-request {
                    font-size: 0.9rem;
                    color: #64748b;
                    font-style: italic;
                }

                /* No Products */
                .no-products-premium {
                    text-align: center;
                    padding: 5rem 2rem;
                    background: white;
                    border-radius: 20px;
                }

                .empty-icon {
                    font-size: 5rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .no-products-premium p {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                /* Back Link */
                .back-to-shop-premium {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    padding: 12px 0;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .back-to-shop-premium svg {
                    transition: transform 0.2s;
                }

                .back-to-shop-premium:hover {
                    color: #FF6B9D;
                }

                .back-to-shop-premium:hover svg {
                    transform: translateX(-4px);
                    fill: #FF6B9D;
                }

                /* Floating WhatsApp */
                .floating-whatsapp {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #25d366, #128c7e);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 30px rgba(37, 211, 102, 0.4);
                    z-index: 1000;
                    transition: all 0.3s;
                    animation: pulse 2s infinite;
                }

                .floating-whatsapp svg {
                    width: 30px;
                    height: 30px;
                    fill: white;
                }

                .floating-whatsapp:hover {
                    transform: scale(1.1);
                    box-shadow: 0 10px 40px rgba(37, 211, 102, 0.5);
                }

                /* Loading & Not Found */
                .loading-state, .not-found-state {
                    text-align: center;
                    padding: 6rem 2rem;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #FF6B9D;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .not-found-state .icon {
                    font-size: 5rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .not-found-state h2 {
                    color: #374151;
                    margin-bottom: 1.5rem;
                }

                .back-link {
                    color: #FF6B9D;
                    text-decoration: none;
                    font-weight: 600;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 1024px) {
                    .shop-card-floating {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }

                    .shop-logo-premium {
                        margin: 0 auto;
                    }

                    .shop-badges-premium {
                        justify-content: center;
                    }

                    .shop-desc-premium {
                        max-width: 100%;
                    }

                    .shop-stats-premium {
                        justify-content: center;
                    }

                    .contact-section-premium {
                        min-width: 100%;
                    }

                    .contact-buttons-premium {
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .share-section-premium {
                        justify-content: center;
                    }
                }

                @media (max-width: 768px) {
                    .storefront-hero-premium {
                        min-height: 400px;
                    }

                    .shop-card-floating {
                        padding: 1.5rem;
                        border-radius: 20px;
                    }

                    .shop-logo-premium {
                        width: 100px;
                        height: 100px;
                    }

                    .shop-title-premium {
                        font-size: 1.5rem;
                    }

                    .shop-stats-premium {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .stat-divider {
                        width: 60px;
                        height: 1px;
                    }

                    .products-header-premium {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .category-filter-premium {
                        justify-content: center;
                    }

                    .products-grid-premium {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    }

                    .product-image-premium {
                        height: 160px;
                    }

                    .product-info-premium {
                        padding: 1rem;
                    }

                    .product-info-premium h3 {
                        font-size: 0.95rem;
                    }

                    .price-value {
                        font-size: 1.1rem;
                    }
                }

                @media (max-width: 480px) {
                    .products-grid-premium {
                        grid-template-columns: 1fr;
                    }
                }

                /* ===== ABOUT SECTION STYLES ===== */
                .storefront-about-section {
                    padding: 3rem 0;
                    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
                }

                .about-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2rem;
                }

                .about-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .about-card h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .about-card .section-icon {
                    font-size: 1.5rem;
                }

                .about-content p,
                .how-we-work-content p {
                    color: #475569;
                    line-height: 1.8;
                    margin: 0 0 1rem 0;
                }

                .how-we-work-content p:last-child,
                .about-content p:last-child {
                    margin-bottom: 0;
                }

                @media (max-width: 768px) {
                    .about-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Gallery Section Styles */
                .storefront-gallery-section {
                    padding: 4rem 0;
                    background: linear-gradient(180deg, #fdf4ff 0%, #fff 100%);
                }

                .gallery-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 2rem 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }

                .gallery-filter-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 2rem;
                }

                .filter-tab {
                    padding: 10px 20px;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .filter-tab:hover {
                    border-color: #a855f7;
                    color: #a855f7;
                }

                .filter-tab.active {
                    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
                }

                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .gallery-item {
                    position: relative;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
                    background: white;
                    transition: all 0.3s ease;
                    aspect-ratio: 4/3;
                }

                .gallery-item:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                }

                .gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .gallery-item iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                .gallery-caption {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1rem;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
                    color: white;
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .gallery-type-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 6px 10px;
                    border-radius: 8px;
                    font-size: 1rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }

                /* Gallery Clickable */
                .gallery-item.clickable {
                    cursor: pointer;
                }

                .gallery-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .gallery-item.clickable:hover .gallery-overlay {
                    opacity: 1;
                }

                .view-icon {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }

                .gallery-share-btn {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    background: rgba(255, 255, 255, 0.95);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 1.2rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.2s;
                    z-index: 10;
                }

                .gallery-share-btn:hover {
                    transform: scale(1.1);
                    background: white;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }

                /* Album Share Button */
                .filter-tab-wrapper {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .album-share-btn-small {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid #e2e8f0;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .album-share-btn-small:hover {
                    background: white;
                    transform: scale(1.05);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                /* Lightbox Styles */
                .lightbox-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .lightbox-container {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                }

                .lightbox-image {
                    max-width: 90vw;
                    max-height: 80vh;
                    object-fit: contain;
                    animation: zoomIn 0.3s;
                }

                @keyframes zoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .lightbox-close {
                    position: absolute;
                    top: -50px;
                    right: 0;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .lightbox-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .lightbox-prev,
                .lightbox-next {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    font-size: 2rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .lightbox-prev {
                    left: -80px;
                }

                .lightbox-next {
                    right: -80px;
                }

                .lightbox-prev:hover,
                .lightbox-next:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-50%) scale(1.1);
                }

                .lightbox-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                }

                .lightbox-counter {
                    color: white;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .lightbox-title {
                    color: white;
                    flex: 1;
                    font-size: 0.95rem;
                }

                .lightbox-share {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .lightbox-share:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                /* Share Modal Styles */
                .share-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s;
                }

                .share-modal {
                    background: white;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .share-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .share-modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #0f172a;
                }

                .share-modal-close {
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .share-modal-close:hover {
                    background: #e2e8f0;
                    transform: scale(1.1);
                }

                .share-modal-body {
                    padding: 1.5rem;
                }

                .share-text {
                    color: #475569;
                    margin: 0 0 1rem 0;
                    font-weight: 500;
                }

                .share-url-box {
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .share-url-box input {
                    width: 100%;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.9rem;
                    outline: none;
                }

                .share-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.75rem;
                }

                .share-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    border: none;
                }

                .share-btn svg {
                    width: 20px;
                    height: 20px;
                }

                .share-btn.whatsapp {
                    background: linear-gradient(135deg, #25d366, #128c7e);
                    color: white;
                }

                .share-btn.whatsapp:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
                }

                .share-btn.facebook {
                    background: linear-gradient(135deg, #1877f2, #0c63d4);
                    color: white;
                }

                .share-btn.facebook:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(24, 119, 242, 0.4);
                }

                .share-btn.copy {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                    color: white;
                }

                .share-btn.copy:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .lightbox-prev {
                        left: 10px;
                    }

                    .lightbox-next {
                        right: 10px;
                    }

                    .lightbox-prev,
                    .lightbox-next {
                        width: 44px;
                        height: 44px;
                        font-size: 1.5rem;
                    }

                    .lightbox-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.75rem;
                    }

                    .share-buttons {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .gallery-grid {
                        grid-template-columns: 1fr;
                    }

                    .gallery-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShopStorefront;
