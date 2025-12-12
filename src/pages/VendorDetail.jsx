import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { categoryImages, defaultImage } from '../constants/categoryImages';
import { getCategoryTranslationKey } from '../constants/vendorData';
import VendorReviews from '../components/Reviews/VendorReviews';
import './VendorDetail.css';

const VendorDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // const { getVendor } = useVendors(); // No longer needed for fetching
    const { t } = useLanguage();
    const [vendor, setVendor] = useState(null);
    const [id, setId] = useState(null); // Keep track of the actual ID for downstream components

    const [activeTab, setActiveTab] = useState('about');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [isBetaMode, setIsBetaMode] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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

                    // Fetch category image
                    const { data: catData } = await supabase
                        .from('categories')
                        .select('image_url')
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
    const categoryDefault = categoryImage || categoryImages[vendor.category] || defaultImage;
    const mainImage = vendor.image || categoryDefault;

    // Fallback for images if not array (for newly added vendors)
    const images = Array.isArray(vendor.images) ? vendor.images : [mainImage, mainImage, mainImage, mainImage, mainImage];
    // Ensure we have at least 5 images for the grid
    const galleryImages = [...(vendor.gallery || []), ...images].slice(0, 5);
    while (galleryImages.length < 5) {
        galleryImages.push(mainImage);
    }



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

            // 1. Prepare Lead Data - Always fetch IDs by name to ensure UUID type
            let categoryId = null;
            let cityId = null;

            // Fetch category ID by name (returns UUID)
            if (vendor.category) {
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('name', vendor.category)
                    .single();
                if (catData && !catError) {
                    categoryId = catData.id;
                    console.log('📂 Category ID (UUID):', categoryId);
                }
            }

            // Fetch city ID by name (returns UUID)
            if (vendor.city) {
                const { data: cityData, error: cityError } = await supabase
                    .from('cities')
                    .select('id')
                    .ilike('name', vendor.city)
                    .single();
                if (cityData && !cityError) {
                    cityId = cityData.id;
                    console.log('🏙️ City ID (UUID):', cityId);
                }
            }

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

            console.log('📝 Lead Data to Insert:', leadData); // Debug log

            // 2. Insert into leads table
            const { data: newLead, error: leadError } = await supabase
                .from('leads')
                .insert([leadData])
                .select()
                .single();

            if (leadError) {
                console.error('❌ Lead insertion error:', leadError);
                throw leadError;
            }

            console.log('✅ Lead created successfully:', newLead); // Debug log


            // 3. Insert into vendor_leads
            if (newLead && vendor.id) {
                console.log('📌 Attempting to create vendor_lead with:', {
                    vendor_id: vendor.id,
                    lead_id: newLead.id,
                    is_unlocked: false
                });

                const { data: vlData, error: vlError } = await supabase
                    .from('vendor_leads')
                    .insert([{
                        vendor_id: vendor.id,
                        lead_id: newLead.id,
                        is_unlocked: false
                    }])
                    .select();

                if (vlError) {
                    console.error('❌ CRITICAL: vendor_lead insert FAILED:', vlError);
                    alert(`HATA: Teklif tedarikçiye bağlanamadı!\nDetay: ${vlError.message}\nKod: ${vlError.code}`);
                } else {
                    console.log('✅ Vendor-lead relationship created:', vlData);
                }
            } else {
                console.error('❌ Missing data for vendor_lead:', { newLead, vendorId: vendor.id });
            }


            setFormSuccess(true);
            form.reset();
            setTimeout(() => setFormSuccess(false), 5000); // Hide after 5 seconds
        } catch (err) {
            console.error('💥 Error sending quote:', err);
            alert(t('vendorDetail.error') || 'Bir hata oluştu: ' + err.message);
            setFormSuccess(false); // Hide success message on error
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

    const structuredData = vendor ? {
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
    } : null;

    return (
        <div className="vendor-detail-page">
            <div className="section container" style={{ marginTop: '80px' }}>
                <SEO
                    title={vendor ? vendor.name : 'Vendor Details'}
                    description={vendor ? (vendor.description?.substring(0, 160) + '...') : 'Vendor details page'}
                    keywords={`${vendor?.category}, ${vendor?.city}, Wedding, Düğün, Hochzeit`}
                    image={vendor?.image}
                    url={`/vendors/${vendor?.slug || id}`}
                    structuredData={structuredData}
                />

                <div className="vendor-detail-header">
                    <button onClick={() => navigate(-1)} className="btn btn-text mb-md" style={{ marginBottom: '1rem', paddingLeft: 0 }}>
                        &larr; {t('vendorDetail.back') || 'Back to Vendors'}
                    </button>

                    {/* Modern Hero Gallery Grid */}
                    <div className="vendor-hero-gallery">
                        <div className="gallery-main">
                            <img src={galleryImages[0]} alt={vendor.name} className="gallery-image" />
                        </div>
                        <div className="gallery-sub">
                            <img src={galleryImages[1]} alt="Gallery 2" className="gallery-image" />
                        </div>
                        <div className="gallery-sub">
                            <img src={galleryImages[2]} alt="Gallery 3" className="gallery-image" />
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
                                    <span>📍</span> {vendor.location}
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
                                <SocialMediaLinks socialMedia={{ ...vendor.social_media, website: vendor.website_url }} />
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

                                            let displayValue = value;
                                            if (Array.isArray(value)) {
                                                displayValue = value.map(v => {
                                                    // Handle dirty data: strip schemas. prefix if it exists
                                                    const cleanKey = v.replace(/^schemas\./, '');
                                                    return t(`schemas.${cleanKey}`) || cleanKey;
                                                }).join(', ');
                                            } else if (typeof value === 'boolean') {
                                                displayValue = value ? t('common.yes') : t('common.no');
                                            }

                                            const labelKey = `schemas.${key}_label`;
                                            const label = t(labelKey) !== labelKey ? t(labelKey) : (t(`schemas.${key}`) || key);

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
                        <div className="vendor-booking-card">
                            {(vendor.priceRange || vendor.price) && (
                                <div className="booking-price">
                                    {vendor.priceRange || vendor.price}
                                    <span>{t('vendorDetail.startingPrice') || 'başlangıç fiyatı'}</span>
                                </div>
                            )}

                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{t('vendorDetail.requestQuote') || 'Ücretsiz Teklif Al'}</h3>

                            <form onSubmit={handleQuoteRequest} className="booking-form">
                                <label>{t('contact.name')}</label>
                                <input type="text" name="name" placeholder={t('contact.namePlaceholder') || "Adınız Soyadınız"} required />

                                <label>{t('contact.email')}</label>
                                <input type="email" name="email" placeholder={t('contact.emailPlaceholder') || "ornek@email.com"} required />

                                <label>{t('contact.phone') || 'Telefon'}</label>
                                <input type="tel" name="phone" placeholder="+49 151 12345678" required />

                                <label>{t('vendorDetail.date') || 'Düğün Tarihi'}</label>
                                <input type="date" name="date" required />

                                <label>{t('contact.message')}</label>
                                <textarea name="message" rows="4" placeholder={t('contact.messagePlaceholder') || "Merhaba, fiyat teklifi almak istiyorum..."} required></textarea>

                                <button
                                    type="submit"
                                    className="booking-submit-btn"
                                    disabled={submitting}
                                    style={{
                                        background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
                                        color: '#ffffff',
                                        width: '100%',
                                        padding: '1rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)',
                                        opacity: submitting ? 0.7 : 1
                                    }}
                                >
                                    {submitting ? (t('vendorLeads.processing') || 'Gönderiliyor...') : (t('vendorDetail.send') || 'Fiyat Teklifi İste')}
                                </button>

                                {formSuccess && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '10px',
                                        backgroundColor: '#dcfce7',
                                        color: '#166534',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontSize: '0.9rem',
                                        border: '1px solid #bbf7d0'
                                    }}>
                                        ✅ {t('vendorDetail.success') || 'Talebiniz başarıyla gönderildi!'}
                                    </div>
                                )}

                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
                                    {t('vendorDetail.noObligation') || 'Teklif isteği ücretsizdir ve bağlayıcılığı yoktur.'}
                                </p>
                            </form>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
};

export default VendorDetail;
