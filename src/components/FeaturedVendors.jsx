import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { categoryImages, defaultImage } from '../constants/categoryImages';
import { dictionary } from '../locales/dictionary';
import './FeaturedVendors.css';

const FeaturedVendors = () => {
    const { t, language } = useLanguage();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [categoryMap, setCategoryMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const now = new Date().toISOString();

                // 1. Fetch Featured Vendors
                const { data: vendorsData, error: vendorError } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('is_featured', true)
                    .or(`featured_expires_at.gt.${now},featured_expires_at.is.null`)
                    .order('featured_sort_order', { ascending: true })
                    .limit(12);

                if (vendorError) throw vendorError;

                // 2. Fetch Categories for Images
                const { data: categoriesData, error: catError } = await supabase
                    .from('categories')
                    .select('name, image_url');

                if (catError) {
                    console.warn('Error fetching categories:', catError);
                } else if (categoriesData) {
                    const map = {};
                    categoriesData.forEach(cat => {
                        map[cat.name] = cat.image_url;
                    });
                    setCategoryMap(map);
                }

                if (vendorsData) {
                    setVendors(vendorsData);
                }
            } catch (error) {
                console.error('Error fetching featured vendors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || vendors.length === 0) return null;

    return (
        <section className="section container featured-vendors">
            <h2 className="section-title">{t('featured.vendorsTitle') || 'Öne Çıkan Tedarikçiler'}</h2>
            <div className="vendors-grid">
                {vendors.map((vendor) => {
                    // Normalize category name to English for lookup
                    // This handles cases where vendor.category is in TR or DE
                    const normalizeCategory = (cat) => {
                        if (!cat) return '';
                        const lower = cat.toLowerCase();
                        if (lower === 'düğün mekanları' || lower === 'hochzeitslocations') return 'Wedding Venues';
                        if (lower === 'gelinlik ve moda' || lower === 'brautmode') return 'Bridal Fashion';
                        if (lower === 'saç ve makyaj' || lower === 'brautstyling & make-up') return 'Hair & Make-Up';
                        if (lower === 'damatlık' || lower === 'herrenmode') return 'Groom Suits';
                        if (lower === 'düğün pastası' || lower === 'hochzeitstorten') return 'Wedding Cakes';
                        if (lower === 'düğün organizasyonu' || lower === 'hochzeitsplaner') return 'Wedding Planners';
                        if (lower === 'gelin arabası' || lower === 'hochzeitsautos') return 'Wedding Cars';
                        if (lower === 'catering' || lower === 'catering & partyservice') return 'Catering & Party Service';
                        if (lower === 'nikah memuru / konuşmacı' || lower === 'trauredner') return 'Wedding Speakers (Trauredner)';
                        if (lower === 'çiçek ve dekorasyon' || lower === 'floristik & dekoration') return 'Flowers & Decoration';
                        if (lower === 'davetiye ve kırtasiye' || lower === 'einladungen & papeterie') return 'Invitations & Stationery';
                        if (lower === 'alyans ve takı' || lower === 'trauringe & schmuck') return 'Wedding Rings';
                        if (lower === 'düğün fotoğrafçısı' || lower === 'hochzeitsfotografie') return 'Wedding Photography';
                        if (lower === 'düğün videografisi' || lower === 'hochzeitsvideografie') return 'Wedding Videography';
                        return cat;
                    };

                    const normalizedCat = normalizeCategory(vendor.category);
                    const categoryName = vendor.category || 'Other';

                    // Determine image source with fallback logic
                    const categoryImageFromDb = categoryMap[normalizedCat] || categoryMap[categoryName];
                    const categoryDefault = categoryImageFromDb || categoryImages[normalizedCat] || categoryImages[categoryName] || defaultImage;
                    const initialImage = (vendor.gallery && vendor.gallery.length > 0 ? vendor.gallery[0] : vendor.image) || categoryDefault;

                    return (
                        <Link to={`/vendors/${vendor.slug || vendor.id}`} key={vendor.id} className="vendor-card">
                            <div className="vendor-image-wrapper">
                                <img
                                    src={initialImage}
                                    alt={vendor.business_name}
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = categoryDefault;
                                    }}
                                />
                                {(vendor.is_claimed || vendor.is_verified) ? (
                                    <span className="claimed-badge-small">
                                        ✓ {t('common.claimed')}
                                    </span>
                                ) : !vendor.user_id ? (
                                    <span className="claimed-badge-small" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#e91e63', border: '1px solid #e91e63' }}>
                                        🛡️ {t('common.vendorClaim.badge')}
                                    </span>
                                ) : null}
                            </div>
                            <div className="vendor-info">
                                <h3 className="vendor-name">{vendor.business_name}</h3>
                                <div className="vendor-meta">
                                    <span className="vendor-category">
                                        {categoryName && t(`categories.${categoryName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`) || categoryName}
                                    </span>
                                    <span className="vendor-city">📍 {vendor.city || '---'}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default FeaturedVendors;
