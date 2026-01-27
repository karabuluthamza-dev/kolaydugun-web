import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useVendors } from '../context/VendorContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';
import MapView from '../components/MapView';
import ClaimedBadge from '../components/ClaimedBadge';
import ShareButton from '../components/ShareButton';
import FavoriteButton from '../components/FavoriteButton';
import VideoEmbed from '../components/VideoEmbed';
import SocialMediaLinks from '../components/SocialMediaLinks';
import ClaimBusinessButton from '../components/ClaimBusinessButton';
import { categoryImages, defaultImage } from '../constants/categoryImages';
import { getCategoryTranslationKey, getStateName } from '../constants/vendorData';
import VendorReviews from '../components/Reviews/VendorReviews';
import { trackLeadContact, trackFunnelStep } from '../utils/analytics';
import './VendorDetail.css';

const VendorDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // const { getVendor } = useVendors(); // No longer needed for fetching
    const { t, language } = useLanguage();
    const [vendor, setVendor] = useState(null);
    const [id, setId] = useState(null); // Keep track of the actual ID for downstream components

    const [activeTab, setActiveTab] = useState('about');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [isBetaMode, setIsBetaMode] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [vendorShop, setVendorShop] = useState(null);
    const [categorySchema, setCategorySchema] = useState(null);
    const [formError, setFormError] = useState('');
    const [isVip, setIsVip] = useState(false);


    // Check if vendor has a shop account
    useEffect(() => {
        const checkVendorShop = async () => {
            if (vendor?.business_name) {
                try {
                    // Take first 4 chars for matching (e.g. "DJ34" from "DJ34Istanbul")
                    const cleanName = vendor.business_name
                        .replace(/[–—\-&,\.]/g, '')  // Remove special chars
                        .substring(0, 4);             // Take first 4 chars only

                    console.log('Looking for shop with name containing:', cleanName);

                    const { data, error } = await supabase
                        .from('shop_accounts')
                        .select('id, slug, business_name, logo_url, plan, is_active')
                        .ilike('business_name', `%${cleanName}%`)
                        .maybeSingle();

                    console.log('Shop query result:', { data, error });

                    if (data && data.is_active) {
                        console.log('Found vendor shop:', data.business_name);
                        setVendorShop(data);
                    }
                } catch (err) {
                    // Vendor has no shop - normal
                    console.log('Shop query error:', err);
                }
            }
        };
        checkVendorShop();
    }, [vendor]);

    useEffect(() => {
        const checkBetaMode = async () => {
            const { data } = await supabase
                .from('marketplace_config')
                .select('value')
                .eq('key', 'show_pricing_plans')
                .single();

            if (data) {
                const showPlans = data.value === 'true' || data.value === true;
                setIsBetaMode(!showPlans);
            }
        };
        checkBetaMode();
    }, []);

    const [categoryImage, setCategoryImage] = useState(null);

    useEffect(() => {
        const fetchVendorDetail = async () => {
            try {
                setLoading(true);
                let query = supabase.from('vendors').select('*');

                // Check if the param is a valid UUID
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

                if (isUuid) {
                    query = query.eq('id', slug);
                } else {
                    query = query.eq('slug', slug);
                }

                const { data, error } = await query.single();

                if (error) throw error;

                if (data) {
                    setId(data.id);

                    // Fetch category image AND schema
                    const { data: catData } = await supabase
                        .from('categories')
                        .select('image_url, form_schema')
                        .ilike('name', data.category) // Case-insensitive match
                        .maybeSingle();

                    // If not found by name, try normalization map
                    let fetchedCatImage = catData?.image_url;

                    if (!fetchedCatImage) {
                        const normalizeCategory = (cat) => {
                            if (!cat) return '';
                            const lower = cat.toLowerCase();
                            // Simple mapping for common categories
                            if (lower.includes('mekan') || lower.includes('venue')) return 'Wedding Venues';
                            if (lower.includes('foto')) return 'Wedding Photography';
                            return cat;
                        };
                        const normalized = normalizeCategory(data.category);
                        if (normalized !== data.category) {
                            const { data: normCatData } = await supabase
                                .from('categories')
                                .select('image_url')
                                .eq('name', normalized)
                                .maybeSingle();
                            fetchedCatImage = normCatData?.image_url;
                        }
                    }

                    setCategoryImage(fetchedCatImage);
                    setCategorySchema(catData?.form_schema || null);

                    // Detect VIP status (Elite/Premium branding)
                    // Decoupled from source - only explicit Elite status triggers VIP theme
                    const isElite = data.details?.vip_demo_config?.is_elite;
                    const vipStatus = isElite === true || isElite === 'true';
                    setIsVip(vipStatus);

                    const mappedVendor = {
                        ...data,
                        name: data.business_name,
                        location: data.city,
                        price: data.price_range,
                        isFeatured: data.featured_active,
                        image: data.image_url,
                        features: Array.isArray(data.features) ? data.features : [],
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        gallery: Array.isArray(data.gallery) ? data.gallery : [],
                        images: Array.isArray(data.images) ? data.images : [],
                        social_media: data.social_media || {},
                        faq: Array.isArray(data.faq) ? data.faq : [],
                        details: data.details || {}
                    };
                    setVendor(mappedVendor);
                }
            } catch (error) {
                console.error('Error fetching vendor details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendorDetail();
    }, [slug]);

    // Tracking: Vendor View
    useEffect(() => {
        if (vendor) {
            trackFunnelStep('vendor_view', 1, {
                vendor_id: vendor.id,
                vendor_name: vendor.name,
                category: vendor.category,
                city: vendor.city
            });

            // Increment view count in vendor_insights (for Admin metrics)
            const incrementViewCount = async () => {
                try {
                    // First, check if vendor_insights exists for this vendor
                    const { data: existingInsight } = await supabase
                        .from('vendor_insights')
                        .select('id, metrics')
                        .eq('vendor_id', vendor.id)
                        .maybeSingle();

                    if (existingInsight) {
                        // Update existing record - increment view_count in metrics JSONB
                        const currentMetrics = existingInsight.metrics || {};
                        const newViewCount = (currentMetrics.view_count || 0) + 1;

                        await supabase
                            .from('vendor_insights')
                            .update({
                                metrics: { ...currentMetrics, view_count: newViewCount },
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', existingInsight.id);
                    } else {
                        // Create new record with initial view count
                        await supabase
                            .from('vendor_insights')
                            .insert({
                                vendor_id: vendor.id,
                                metrics: { view_count: 1 },
                                performance_score: 0,
                                updated_at: new Date().toISOString()
                            });
                    }
                } catch (error) {
                    console.error('Error incrementing view count:', error);
                    // Non-blocking - don't affect user experience
                }
            };

            incrementViewCount();
        }
    }, [vendor?.id]);

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <h2>{t('vendorDetail.notFound') || 'Vendor Not Found'}</h2>
                <button onClick={() => navigate('/vendors')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    {t('vendorDetail.backToVendors') || 'Back to Vendors'}
                </button>
            </div>
        );
    }

    // Determine default image based on category
    // Improved Category Normalization for Image Lookup
    const getNormalizedCategoryKey = (cat) => {
        const key = getCategoryTranslationKey(cat);
        const keyMap = {
            'wedding_venues': 'Wedding Venues',
            'bridal_fashion': 'Bridal Fashion',
            'hair_makeup': 'Hair & Make-Up',
            'groom_suits': 'Groom Suits',
            'wedding_cakes': 'Wedding Cakes',
            'wedding_planners': 'Wedding Planners',
            'wedding_cars': 'Wedding Cars',
            'catering_party': 'Catering & Party Service',
            'wedding_speakers': 'Wedding Speakers (Trauredner)',
            'flowers_decoration': 'Flowers & Decoration',
            'invitations_stationery': 'Invitations & Stationery',
            'wedding_rings': 'Wedding Rings',
            'wedding_photography': 'Wedding Photography',
            'wedding_videography': 'Wedding Videography',
            'photobox': 'Photobox',
            'djs': 'DJs',
            'musicians': 'Musicians',
            'entertainment': 'Entertainment'
        };
        return keyMap[key] || cat;
    };

    const normalizedCat = getNormalizedCategoryKey(vendor.category);
    const categoryDefault = categoryImage || categoryImages[normalizedCat] || categoryImages[vendor.category] || defaultImage;

    // Robust Image Validation Helper
    const isValidImage = (url) => {
        return url && typeof url === 'string' && url.length > 5 && url !== 'null' && url !== 'undefined' && !url.includes('undefined') && !url.includes('null');
    };

    const mainImage = isValidImage(vendor.image) ? vendor.image : categoryDefault;

    // Safe Gallery Construction
    let galleryImages = [];

    // 1. Add valid gallery items
    if (Array.isArray(vendor.gallery)) {
        galleryImages = [...galleryImages, ...vendor.gallery.filter(isValidImage)];
    }

    // 2. Add valid images from images array
    if (Array.isArray(vendor.images)) {
        galleryImages = [...galleryImages, ...vendor.images.filter(isValidImage)];
    }

    // 3. Fallback: Fill with mainImage (which is guaranteed to be valid or default)
    while (galleryImages.length < 5) {
        galleryImages.push(mainImage);
    }

    // ensure we have exactly 5 or slice
    galleryImages = galleryImages.slice(0, 5);



    // Feature Visibility Logic
    const currentTier = vendor?.subscription_tier || 'free';
    const isPremium = currentTier === 'premium' || currentTier === 'basic'; // Basic also has some features

    // Helper to check if a feature should be shown
    const showFeature = (featureName) => {
        if (isPremium) return true; // Premium/Basic always shows features
        if (isBetaMode) return true; // Beta mode unlocks features for Free tier
        return false; // Free tier outside Beta mode -> Hidden
    };



    const features = Array.isArray(vendor.features) ? vendor.features : [];

    const handleQuoteRequest = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        try {
            setSubmitting(true);

            // 1. Prepare Data
            let categoryId = null;
            let cityId = null;

            if (vendor.category) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('name', vendor.category)
                    .single();
                if (catData) categoryId = catData.id;
            }

            if (vendor.city) {
                const { data: cityData } = await supabase
                    .from('cities')
                    .select('id')
                    .ilike('name', vendor.city)
                    .single();
                if (cityData) cityId = cityData.id;
            }

            // ==========================================
            // POACHING INTERCEPTION LOGIC
            // If vendor is NOT claimed AND NOT verified, intercept message
            // ==========================================
            if (!(vendor.is_claimed || vendor.is_verified)) {
                console.log('🛡️ Intercepting message for unclaimed/poached vendor...');

                const inquiryData = {
                    vendor_id: vendor.id,
                    sender_name: formData.get('name'),
                    sender_email: formData.get('email'),
                    sender_phone: formData.get('phone'),
                    message: formData.get('message'),
                    status: 'pending'
                };

                const { error: poachError } = await supabase
                    .from('poached_inquiries')
                    .insert([inquiryData]);

                if (poachError) throw poachError;

                setFormSuccess(true);
                form.reset();
                setTimeout(() => setFormSuccess(false), 5000);
                return; // STOP HERE, don't create a real lead
            }

            // Normal Lead Process (Original)
            const leadData = {
                contact_name: formData.get('name'),
                contact_email: formData.get('email'),
                contact_phone: formData.get('phone'),
                event_date: formData.get('date'),
                additional_notes: formData.get('message'),
                budget_min: 0,
                budget_max: 0,
                category_id: categoryId,
                city_id: cityId,
                status: 'new',
                user_id: (await supabase.auth.getUser()).data.user?.id || null
            };

            const { data: newLead, error: leadError } = await supabase
                .from('leads')
                .insert([leadData])
                .select()
                .single();

            if (leadError) throw leadError;

            if (newLead && vendor.id) {
                await supabase
                    .from('vendor_leads')
                    .insert([{
                        vendor_id: vendor.id,
                        lead_id: newLead.id,
                        is_unlocked: false
                    }]);
            }

            setFormSuccess(true);
            trackLeadContact('form_submission', vendor.name, vendor.id);
            form.reset();
            setTimeout(() => setFormSuccess(false), 5000);
        } catch (err) {
            console.error('💥 Error sending quote:', err);
            setFormError(t('poaching.concierge.errorMsg'));
            setTimeout(() => setFormError(''), 5000);
        } finally {
            setSubmitting(false);
        }
    };


    // Structured Data (JSON-LD)
    // Structured Data (JSON-LD)
    const getSchemaType = (category) => {
        const lower = category?.toLowerCase() || '';
        if (lower.includes('mekan') || lower.includes('venue') || lower.includes('location') || lower.includes('salon')) return 'WeddingVenue';
        if (lower.includes('foto') || lower.includes('photo')) return 'Photographer';
        if (lower.includes('organizasyon') || lower.includes('planner')) return 'EventPlanner';
        if (lower.includes('çiçek') || lower.includes('florist')) return 'Florist';
        if (lower.includes('kuaför') || lower.includes('hair') || lower.includes('makeup')) return 'BeautySalon';
        if (lower.includes('pasta') || lower.includes('cake')) return 'Bakery';
        return 'LocalBusiness'; // Fallback
    };

    const structuredData = vendor ? [
        {
            "@context": "https://schema.org",
            "@type": getSchemaType(vendor.category),
            "name": vendor.name,
            "image": Array.isArray(vendor.images) && vendor.images.length > 0 ? vendor.images : [vendor.image],
            "description": vendor.description,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": vendor.city,
                "addressCountry": "DE"
            },
            "geo": (vendor.latitude && vendor.longitude) ? {
                "@type": "GeoCoordinates",
                "latitude": vendor.latitude,
                "longitude": vendor.longitude
            } : undefined,
            "priceRange": vendor.price_range || "€€",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": vendor.rating || 5,
                "reviewCount": vendor.reviews || 1
            },
            "url": `https://kolaydugun.de/vendors/${vendor.slug || id}`
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": t('nav.home') || 'Home',
                    "item": "https://kolaydugun.de"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": t('categories.' + getCategoryTranslationKey(vendor.category)) || vendor.category,
                    "item": `https://kolaydugun.de/vendors?category=${encodeURIComponent(vendor.category)}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": vendor.name,
                    "item": `https://kolaydugun.de/vendors/${vendor.slug || id}`
                }
            ]
        }
    ] : null;

    return (
        <div className={`vendor-detail-page ${isVip ? 'vendor-vip-theme' : ''}`}>
            <div className="section container" style={{ marginTop: '80px' }}>
                {isVip && (
                    <div className="elite-partner-banner" style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
                        color: '#fff',
                        textAlign: 'center',
                        padding: '20px 30px',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3), 0 0 60px rgba(212, 175, 55, 0.1)',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(90deg, transparent, #d4af37, transparent) 1',
                        overflow: 'hidden'
                    }}>
                        {/* Animated shimmer effect */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '200%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)',
                            animation: 'shimmer 3s infinite',
                            pointerEvents: 'none'
                        }} />

                        {/* Crown icon */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}>
                            <span style={{
                                fontSize: '1.8rem',
                                filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))'
                            }}>👑</span>

                            <div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: '#d4af37',
                                    letterSpacing: '4px',
                                    marginBottom: '4px',
                                    textTransform: 'uppercase'
                                }}>
                                    KOLAYDUGUN SEÇKİSİ
                                </div>
                                <div style={{
                                    fontSize: '1.4rem',
                                    background: 'linear-gradient(90deg, #d4af37, #f4e4bc, #d4af37)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontWeight: '800',
                                    textShadow: 'none'
                                }}>
                                    ✨ ELITE PARTNER VENUE ✨
                                </div>
                            </div>

                            <span style={{
                                fontSize: '1.8rem',
                                filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))'
                            }}>👑</span>
                        </div>

                        {/* Bottom accent line */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '20%',
                            right: '20%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
                        }} />

                        <style>{`
                            @keyframes shimmer {
                                0% { transform: translateX(-50%); }
                                100% { transform: translateX(50%); }
                            }
                        `}</style>
                    </div>
                )}
                <SEO
                    title={vendor ? `${vendor.name} - ${t('categories.' + getCategoryTranslationKey(vendor.category))} ${vendor.city || ''}` : 'Vendor Details'}
                    description={vendor ? `${vendor.name}: ${vendor.description?.substring(0, 150)}... ${vendor.city} düğün hazırlıkları için en iyi seçenekler.` : 'Vendor details page'}
                    keywords={`${vendor?.category}, ${vendor?.city}, Wedding, Düğün, Hochzeit, ${vendor?.name}`}
                    image={mainImage}
                    url={`/vendors/${vendor?.slug || id}`}
                    structuredData={structuredData}
                    hreflangUrls={vendor ? { de: `/vendors/${vendor.slug || id}`, tr: `/vendors/${vendor.slug || id}`, en: `/vendors/${vendor.slug || id}` } : null}
                />

                <div className="vendor-detail-header">
                    <button onClick={() => navigate(-1)} className="btn btn-text mb-md" style={{ marginBottom: '1rem', paddingLeft: 0 }}>
                        &larr; {t('vendorDetail.back') || 'Back to Vendors'}
                    </button>

                    {/* Modern Hero Gallery Grid */}
                    <div className="vendor-hero-gallery">
                        <div className="gallery-main">
                            <img
                                src={galleryImages[0]}
                                alt={vendor.name}
                                className="gallery-image"
                                onError={(e) => { e.target.onerror = null; e.target.src = categoryDefault; }}
                            />
                        </div>
                        <div className="gallery-sub">
                            <img
                                src={galleryImages[1]}
                                alt="Gallery 2"
                                className="gallery-image"
                                onError={(e) => { e.target.onerror = null; e.target.src = categoryDefault; }}
                            />
                        </div>
                        <div className="gallery-sub">
                            <img
                                src={galleryImages[2]}
                                alt="Gallery 3"
                                className="gallery-image"
                                onError={(e) => { e.target.onerror = null; e.target.src = categoryDefault; }}
                            />
                            <div className="view-all-photos">
                                📷 {t('vendorDetail.viewAllPhotos') || 'Tüm Fotoğraflar'}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="vendor-content-grid">
                    {/* Main Content */}
                    <div>
                        <div className="vendor-main-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span className="vendor-category">
                                    {t('categories.' + getCategoryTranslationKey(vendor.category))}
                                </span>
                                {(vendor.is_claimed || vendor.is_verified) && (
                                    <ClaimedBadge claimedDate={vendor.claim_approved_at || vendor.created_at} />
                                )}
                            </div>
                            <h1 className="vendor-title">{vendor.name}</h1>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <ShareButton vendor={vendor} />
                                <FavoriteButton vendorId={vendor.id} />
                            </div>

                            <div className="vendor-meta-row">
                                <div className="meta-item">
                                    <span>📍</span> {vendor.zip_code && <strong style={{ marginRight: '4px' }}>{vendor.zip_code}</strong>} {vendor.location || vendor.city} {vendor.state && <span className="state-tag" style={{ marginLeft: '4px', opacity: 0.8, fontSize: '0.9em' }}>• {getStateName(vendor.state, vendor.country, language)}</span>}
                                </div>
                                <div className="meta-item">
                                    <span>⭐</span> <strong>{vendor.rating}</strong> ({vendor.reviews} {t('vendorDetail.reviews') || 'reviews'})
                                </div>
                                {vendor.capacity > 0 && (
                                    <div className="meta-item">
                                        <span>👥</span> {vendor.capacity} {t('filters.capacity')}
                                    </div>
                                )}
                            </div>

                            {/* Social Media Links - Protected */}
                            {/* Social Media Links - Protected */}
                            {showFeature('social') && (
                                <SocialMediaLinks
                                    socialMedia={{ ...vendor.social_media, website: vendor.website_url }}
                                    targetName={vendor.name}
                                    targetId={vendor.id}
                                />
                            )}

                            <div className="vendor-tags">
                                {vendor.isFeatured && (
                                    <span className="tag-badge featured">
                                        {t('vendorDetail.featured') || 'Featured'}
                                    </span>
                                )}
                                {vendor.tags && vendor.tags.map((tag, idx) => (
                                    <span key={idx} className="tag-badge">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="vendor-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                {t('vendorDetail.about') || 'About'}
                            </button>
                            {showFeature('faq') && (
                                <button
                                    className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('faq')}
                                >
                                    {t('vendorDetail.faq') || 'FAQ'}
                                </button>
                            )}
                            <button
                                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                {t('vendorDetail.reviews') || 'Reviews'}
                            </button>
                        </div>

                        {activeTab === 'about' && (
                            <div className="tab-content">
                                <h3 style={{ marginBottom: '1rem' }}>{t('vendorDetail.about') || 'Hakkında'}</h3>
                                <p style={{ lineHeight: '1.8', marginBottom: '2rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                                    {vendor.description}
                                </p>

                                <h3 style={{ marginBottom: '1rem' }}>{t('vendorDetail.features') || 'Özellikler'}</h3>
                                <div className="vendor-features-grid">
                                    {vendor.details && Object.entries(vendor.details).length > 0 ? (
                                        Object.entries(vendor.details).map(([key, value], idx) => {
                                            if (!value || (Array.isArray(value) && value.length === 0)) return null;

                                            // CRITICAL: Strip "schemas." prefix from KEY itself (dirty data)
                                            const cleanKey = key.replace(/^schemas\./, '');

                                            // EXCLUDE INTERNAL FLAGS
                                            const internalFlags = ['war_room_status', 'ai_imported', 'scraper_source_url', 'vip_demo_config', 'usps', 'prices', 'contact', 'hero_image', 'hero_title', 'hero_description', 'gallery', 'multilingual_description'];
                                            if (internalFlags.includes(cleanKey)) return null;

                                            // MANUAL KEY MAPPING: Database keys vs Dictionary label keys
                                            const labelKeyMap = {
                                                'music_instruments': 'enstrumanlar_label',
                                                'music_genres': 'music_genres_label',
                                                'photo_services': 'photo_services_label',
                                                'video_services': 'video_services_label',
                                                'beauty_services': 'beauty_services_label',
                                                'venue_type': 'venue_type_label',
                                                'venue_features': 'venue_features_label'
                                            };
                                            const mappedLabelKey = labelKeyMap[cleanKey] || `${cleanKey}_label`;

                                            // Find schema field for this key
                                            const schemaField = categorySchema?.find(f => f.key === cleanKey);

                                            let displayValue = value;
                                            if (Array.isArray(value)) {
                                                displayValue = value.map(v => {
                                                    // Handle dirty data in VALUES: strip schemas. prefix if it exists
                                                    const cleanValue = v.replace(/^schemas\./, '');

                                                    // PRIORITY 1: Try schema translations
                                                    if (schemaField?.options) {
                                                        const optionObj = schemaField.options.find(opt =>
                                                            (typeof opt === 'object' ? opt.key : opt) === cleanValue
                                                        );
                                                        if (optionObj && typeof optionObj === 'object' && optionObj.translations) {
                                                            const trans = optionObj.translations[language];
                                                            if (trans) return trans;
                                                        }
                                                    }

                                                    // PRIORITY 2: Try ALL possible dictionary paths
                                                    let translated = t(`schemas_4.${cleanValue}`);
                                                    if (translated === `schemas_4.${cleanValue}`) {
                                                        translated = t(`schemas.${cleanValue}`);
                                                    }
                                                    if (translated === `schemas.${cleanValue}`) {
                                                        translated = t(cleanValue);
                                                    }
                                                    if (translated === cleanValue) {
                                                        // Last resort: return the raw key
                                                        return cleanValue;
                                                    }
                                                    return translated;
                                                }).join(', ');
                                            } else if (typeof value === 'boolean') {
                                                displayValue = value ? t('common.yes') : t('common.no');
                                            }

                                            // LABEL TRANSLATION - Schema first, then dictionary
                                            let label = cleanKey;

                                            // PRIORITY 1: Try schema translation
                                            if (schemaField?.translations?.label) {
                                                const schemaLabel = schemaField.translations.label[language];
                                                if (schemaLabel) {
                                                    label = schemaLabel;
                                                } else {
                                                    // PRIORITY 2: Try dictionary with mapped key
                                                    label = t(`schemas_4.${mappedLabelKey}`);
                                                    if (label === `schemas_4.${mappedLabelKey}`) {
                                                        label = t(`schemas.${mappedLabelKey}`);
                                                    }
                                                    if (label === `schemas.${mappedLabelKey}`) {
                                                        label = t(mappedLabelKey);
                                                    }
                                                    if (label === mappedLabelKey) {
                                                        label = t(`schemas_4.${cleanKey}`);
                                                    }
                                                    if (label === `schemas_4.${cleanKey}`) {
                                                        label = t(`schemas.${cleanKey}`);
                                                    }
                                                    if (label === `schemas.${cleanKey}`) {
                                                        label = cleanKey;
                                                    }
                                                }
                                            } else {
                                                // No schema translation, try dictionary
                                                label = t(`schemas_4.${mappedLabelKey}`);
                                                if (label === `schemas_4.${mappedLabelKey}`) {
                                                    label = t(`schemas.${mappedLabelKey}`);
                                                }
                                                if (label === `schemas.${mappedLabelKey}`) {
                                                    label = t(mappedLabelKey);
                                                }
                                                if (label === mappedLabelKey) {
                                                    label = t(`schemas_4.${cleanKey}`);
                                                }
                                                if (label === `schemas_4.${cleanKey}`) {
                                                    label = t(`schemas.${cleanKey}`);
                                                }
                                                if (label === `schemas.${cleanKey}`) {
                                                    label = cleanKey;
                                                }
                                            }

                                            return (
                                                <div key={idx} className="feature-item">
                                                    <span className="feature-icon">✨</span>
                                                    <div className="feature-content">
                                                        <span className="feature-label">{label}</span>
                                                        <span className="feature-value">{displayValue}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-muted">{t('vendorDetail.noFeatures') || 'Henüz özellik eklenmemiş.'}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Video Section - Protected */}
                        {vendor.video_url && showFeature('video') && (
                            <VideoEmbed videoUrl={vendor.video_url} />
                        )}

                        {/* Map Section - Protected */}
                        {vendor.latitude && vendor.longitude && showFeature('map') && (
                            <div style={{ marginTop: '2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <MapView
                                    latitude={vendor.latitude}
                                    longitude={vendor.longitude}
                                    businessName={vendor.name}
                                    address={vendor.city}
                                />
                            </div>
                        )}

                        {activeTab === 'faq' && (
                            <div className="tab-content">
                                {vendor.faq && vendor.faq.length > 0 ? (
                                    <div className="faq-accordion">
                                        {vendor.faq.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`faq-item ${expandedFaq === idx ? 'active' : ''}`}
                                                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                            >
                                                <div className="faq-question">
                                                    <h4>{item.question}</h4>
                                                    <span className="faq-icon">{expandedFaq === idx ? '−' : '+'}</span>
                                                </div>
                                                <div className="faq-answer">
                                                    <p>{item.answer}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{t('vendorDetail.faqPlaceholder') || 'Sıkça sorulan sorular burada yer alacak.'}</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="tab-content">
                                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)' }}>{vendor.rating}</div>
                                    <div style={{ color: 'gold', fontSize: '1.5rem', marginBottom: '0.5rem' }}>⭐⭐⭐⭐⭐</div>
                                    <p>{vendor.reviews} {t('vendorDetail.reviews') || 'değerlendirme'}</p>
                                </div>

                                <VendorReviews vendorId={vendor.id} />
                            </div>
                        )}
                    </div>

                    {/* Sticky Sidebar Contact */}
                    <aside>
                        {/* Claim Business Button - TOP of Sidebar if unclaimed */}
                        <ClaimBusinessButton vendor={vendor} />

                        {/* Vendor Shop Card */}
                        {vendorShop && (
                            <div className={`vendor-shop-card ${isVip ? 'vip-shop-card' : ''}`}>
                                <div className="shop-header-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="shop-icon">🏪</div>
                                    <div>
                                        <h4>
                                            {language === 'de' ? 'Dieser Anbieter hat einen Shop!'
                                                : language === 'en' ? 'This vendor has a shop!'
                                                    : 'Bu tedarikçinin mağazası var!'}
                                        </h4>
                                        <p>
                                            {language === 'de' ? 'Produkte entdecken'
                                                : language === 'en' ? 'Browse products'
                                                    : 'Ürünlerini keşfet'}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={`/shop/magaza/${vendorShop.slug}`}
                                    className="visit-shop-btn"
                                >
                                    🛍️ {language === 'de' ? 'Shop besuchen'
                                        : language === 'en' ? 'Visit Shop'
                                            : 'Mağazayı Ziyaret Et'}
                                </a>
                            </div>
                        )}

                        <div className="vendor-booking-card">
                            {(vendor.priceRange || vendor.price) && (
                                <div className="booking-price">
                                    {vendor.priceRange || vendor.price}
                                    <span>{t('vendorDetail.startingPrice') || 'başlangıç fiyatı'}</span>
                                </div>
                            )}

                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                                {!vendor.is_claimed ? t('poaching.concierge.title') : (t('vendorDetail.requestQuote') || 'Ücretsiz Teklif Al')}
                            </h3>

                            {!vendor.is_claimed && (
                                <>
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: 'rgba(79, 70, 229, 0.05)',
                                        borderRadius: '10px',
                                        fontSize: '0.85rem',
                                        color: '#4f46e5',
                                        marginBottom: '1rem',
                                        border: '1px dashed #4f46e5'
                                    }}>
                                        ✨ {t('poaching.concierge.unclaimedNote')}
                                    </div>

                                    {/* Social Proof / Live Activity */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '1.5rem',
                                        padding: '8px 12px',
                                        backgroundColor: '#fff7ed',
                                        borderRadius: '8px',
                                        border: '1px solid #ffedd5',
                                        animation: 'pulse 2s infinite'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9a3412' }}>
                                            {language === 'tr' ? `Şu an ${Math.floor(Math.random() * 5) + 2} çift bu işletmeyi inceliyor` : `Currently ${Math.floor(Math.random() * 5) + 2} couples are viewing this vendor`}
                                        </span>
                                    </div>
                                </>
                            )}

                            <form onSubmit={handleQuoteRequest} className="booking-form">
                                <label>{t('contact.name')}</label>
                                <input type="text" name="name" placeholder={t('contact.namePlaceholder') || "Adınız Soyadınız"} required />

                                <label>{t('contact.email')}</label>
                                <input type="email" name="email" placeholder={t('contact.emailPlaceholder') || "ornek@email.com"} required />

                                <label>{t('contact.phone') || 'Telefon'}</label>
                                <input type="tel" name="phone" placeholder="+49 151 12345678" required />

                                <label>{t('vendorDetail.date') || 'Düğün Tarihi'}</label>
                                <input type="date" name="date" required />

                                {/* Real-time Assistant Status */}
                                {!vendor.is_claimed && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 15px',
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: '12px',
                                        border: '1px solid #bae6fd',
                                        marginBottom: '1.5rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👩‍💼</div>
                                            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }}></div>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#0369a1' }}>
                                                {language === 'tr' ? 'Düğün Asistanı (Ayşe)' : 'Wedding Assistant (Ayşe)'}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#0284c7' }}>
                                                {language === 'tr' ? 'Şu an çevrimiçi, size yardımcı olacak' : 'Online now, ready to help you'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <label>{t('contact.message')}</label>
                                <textarea name="message" rows="4" placeholder={t('contact.messagePlaceholder') || "Merhaba, fiyat teklifi almak istiyorum..."} required></textarea>

                                <button
                                    type="submit"
                                    className="booking-submit-btn"
                                    disabled={submitting}
                                    style={!isVip ? {
                                        background: !vendor.is_claimed ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
                                        boxShadow: !vendor.is_claimed ? '0 4px 15px rgba(79, 70, 233, 0.3)' : '0 4px 15px rgba(255, 107, 157, 0.3)',
                                    } : {}}
                                >
                                    {submitting
                                        ? (t('vendorLeads.processing') || 'Gönderiliyor...')
                                        : (!vendor.is_claimed ? t('poaching.concierge.submitButton') : (t('vendorDetail.send') || 'Fiyat Teklifi İste'))
                                    }
                                </button>

                                {!vendor.is_claimed && (
                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {language === 'tr' ? 'Bu işletmenin sahibi misiniz?' : 'Are you the owner?'}
                                            <button
                                                type="button"
                                                onClick={() => document.querySelector('.claim-business-btn')?.click()}
                                                style={{ marginLeft: '4px', background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                {language === 'tr' ? 'Hemen Sahiplenin' : 'Claim Now'}
                                            </button>
                                        </p>
                                    </div>
                                )}

                                {formSuccess && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '12px',
                                        backgroundColor: '#dcfce7',
                                        color: '#166534',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        border: '1px solid #16a34a'
                                    }}>
                                        {!(vendor.is_claimed || vendor.is_verified) ? t('poaching.concierge.successMsg') : (t('vendorDetail.success') || 'Talebiniz başarıyla iletildi!')}
                                    </div>
                                )}

                                {formError && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '12px',
                                        backgroundColor: '#fee2e2',
                                        color: '#991b1b',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        border: '1px solid #ef4444'
                                    }}>
                                        {formError}
                                    </div>
                                )}


                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
                                    {t('vendorDetail.noObligation') || 'Teklif isteği ücretsizdir ve bağlayıcılığı yoktur.'}
                                </p>
                            </form>
                        </div>

                        {/* Internal Linking - Related Vendors */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.25rem',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h4 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🔗 {language === 'tr' ? 'İlgili Aramalar' : language === 'de' ? 'Ähnliche Suchen' : 'Related Searches'}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Link
                                    to={`/vendors?category=${encodeURIComponent(vendor.category)}`}
                                    style={{
                                        color: '#4f46e5',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        padding: '6px 10px',
                                        background: '#eef2ff',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    📂 {t('categories.' + getCategoryTranslationKey(vendor.category))} {language === 'tr' ? 'Kategorisi' : language === 'de' ? 'Kategorie' : 'Category'}
                                </Link>
                                {vendor.city && (
                                    <Link
                                        to={`/vendors?city=${encodeURIComponent(vendor.city)}`}
                                        style={{
                                            color: '#4f46e5',
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            padding: '6px 10px',
                                            background: '#eef2ff',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        📍 {vendor.city} {language === 'tr' ? 'Tedarikçileri' : language === 'de' ? 'Anbieter' : 'Vendors'}
                                    </Link>
                                )}
                                {vendor.city && (
                                    <Link
                                        to={`/vendors?category=${encodeURIComponent(vendor.category)}&city=${encodeURIComponent(vendor.city)}`}
                                        style={{
                                            color: '#4f46e5',
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            padding: '6px 10px',
                                            background: '#eef2ff',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        🎯 {t('categories.' + getCategoryTranslationKey(vendor.category))} - {vendor.city}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {isVip && !vendor.is_claimed && (
                <div className="vip-sticky-cta fade-in-up">
                    <div className="sticky-cta-content">
                        <div className="cta-text">
                            <strong>✨ Bu sizin salonunuz mu?</strong>
                            <span>Gölge profilinizi sahiplenerek hemen müşteri teklifleri almaya başlayın.</span>
                        </div>
                        <button
                            className="btn-cta"
                            style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                            onClick={() => navigate(`/vendor-dashboard-demo?venue=${encodeURIComponent(vendor.name)}&city=${encodeURIComponent(vendor.city)}`)}
                        >
                            DASHBOARD DEMO GÖR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDetail;
