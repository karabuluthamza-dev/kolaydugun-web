import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import VendorCard from '../components/VendorCard';
import VendorHero from '../components/VendorHero';
import VendorCardSkeleton from '../components/VendorCardSkeleton';
import { useVendors } from '../context/VendorContext';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryFromSlug, getCategoryTranslationKey } from '../constants/vendorData';
import { supabase } from '../supabaseClient';
import './VendorList.css'; // Reuse existing styles

const SeoLandingPage = () => {
    const { city, categorySlug } = useParams();
    const { t, language } = useLanguage();
    const { getFilteredVendors } = useVendors();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [categoryMap, setCategoryMap] = useState({});

    const categoryName = useMemo(() => getCategoryFromSlug(categorySlug), [categorySlug]);

    // Normalize City Name from Slug
    const normalizeCity = (slug) => {
        if (!slug || slug.toLowerCase() === 'deutschland') return '';
        const mapping = {
            'muenchen': 'München',
            'koeln': 'Köln',
            'duesseldorf': 'Düsseldorf',
            'nuerneberg': 'Nürnberg',
            'stuttgart': 'Stuttgart',
            'frankfurt': 'Frankfurt am Main'
        };
        return mapping[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
    };

    const displayCity = useMemo(() => {
        const normalized = normalizeCity(city);
        if (normalized) return normalized;

        switch (language) {
            case 'en': return 'Germany';
            case 'tr': return 'Almanya';
            default: return 'Deutschland';
        }
    }, [city, language]);

    const catTranslated = useMemo(() => {
        const fallback = language === 'tr' ? 'Düğün Tedarikçileri' : (language === 'en' ? 'Wedding Vendors' : 'Hochzeitsdienstleister');
        if (!categoryName) return fallback;
        const key = getCategoryTranslationKey(categoryName);
        return key ? t(`categories.${key}`) : categoryName;
    }, [categoryName, t, language]);

    const catLower = useMemo(() => {
        return catTranslated ? catTranslated.toLowerCase() : (language === 'tr' ? 'hizmet' : (language === 'en' ? 'service' : 'dienstleistungen'));
    }, [catTranslated, language]);

    useEffect(() => {
        const fetchCategoryMap = async () => {
            try {
                const { data } = await supabase.from('categories').select('name, image_url');
                if (data) {
                    const map = {};
                    data.forEach(cat => {
                        map[cat.name] = cat.image_url;
                        map[getCategoryTranslationKey(cat.name)] = cat.image_url;
                    });
                    setCategoryMap(map);
                }
            } catch (err) {
                console.error('Category map error:', err);
            }
        };
        fetchCategoryMap();
    }, []);

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            const queryCity = normalizeCity(city);

            const { vendors: data, total } = await getFilteredVendors({
                filters: {
                    category: categoryName || '',
                    city: queryCity, // If empty, it shows all cities
                    sort: 'recommended'
                },
                page: 1,
                pageSize: 40
            });
            setVendors(data || []);
            setTotalCount(total || 0);
            setLoading(false);
        };
        fetchVendors();
    }, [categoryName, city, getFilteredVendors]);

    const seoTitle = `${displayCity} ${catTranslated} - ${t('seoLanding.resultsFound', 'En İyi {{count}} Seçenek', { count: totalCount })} | Kolay Düğün`;
    const seoDescription = language === 'tr'
        ? `${displayCity} bölgesindeki en iyi ${catTranslated} firmalarını keşfedin. Gerçek kullanıcı yorumları, fiyat teklifleri ve detaylı bilgilerle ideal düğün hazırlığınızı yapın.`
        : (language === 'en'
            ? `Discover the best ${catTranslated} in the ${displayCity} region. Plan your ideal wedding with real user reviews, quotes, and detailed information.`
            : `Entdecken Sie die besten ${catTranslated} in der Region ${displayCity}. Planen Sie Ihre ideale Hochzeit mit echten Nutzerbewertungen, Angeboten und detaillierten Informationen.`);

    // Structured Data (JSON-LD) - Breadcrumb & ItemList
    const structuredData = useMemo(() => {
        const siteUrl = 'https://kolaydugun.de';
        const breadcrumbs = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": t('nav.home') || 'Home',
                "item": siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": displayCity,
                "item": `${siteUrl}/locations/${city}`
            }
        ];

        if (categorySlug) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 3,
                "name": catTranslated,
                "item": `${siteUrl}/locations/${city}/${categorySlug}`
            });
        }

        const itemList = {
            "@type": "ItemList",
            "name": `${displayCity} ${catTranslated}`,
            "numberOfItems": vendors.length,
            "itemListElement": vendors.slice(0, 20).map((v, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `${siteUrl}/vendors/${v.slug || v.id}`,
                "name": v.name
            }))
        };

        return [
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs
            },
            {
                "@context": "https://schema.org",
                ...itemList
            }
        ];
    }, [displayCity, city, categorySlug, catTranslated, vendors, t]);

    return (
        <div className="vendor-page seo-landing-page">
            <SEO
                title={seoTitle}
                description={seoDescription}
                url={`/locations/${city}/${categorySlug}`}
                image={categoryMap[categoryName]}
                structuredData={structuredData}
            />

            <VendorHero
                title={`${displayCity} ${catTranslated}`}
                subtitle={language === 'tr'
                    ? `${displayCity} bölgesinde hayalinizdeki düğün için ${totalCount} profesyonel tedarikçi sizi bekliyor.`
                    : (language === 'en'
                        ? `${totalCount} professional vendors are waiting for you for your dream wedding in ${displayCity}.`
                        : `${totalCount} professionelle Anbieter warten in ${displayCity} auf Sie für Ihre Traumhochzeit.`
                    )}
                totalVendors={totalCount}
            />

            <div className="section container">
                <div className="seo-intro-text mb-12 p-8 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm" style={{ marginBottom: '40px' }}>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4" style={{ fontSize: '2rem', marginBottom: '15px', color: '#1a1a2e' }}>
                        {displayCity} {catTranslated} {t('seoLanding.guide')}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed" style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#4b5563' }}>
                        {language === 'en' ? `If you are ` : ''}
                        {t('seoLanding.introText1')} {displayCity} {t('seoLanding.introText2')} {catLower} {t('seoLanding.introText3')}
                    </p>
                </div>

                <div className="vendor-list-header flex justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 className="text-2xl font-bold text-gray-800">{catTranslated} {t('seoLanding.listHeader')}</h2>
                    <span className="text-gray-500 font-medium">{totalCount} {t('seoLanding.resultsFound')}</span>
                </div>

                <div className="vendor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {loading ? (
                        [...Array(6)].map((_, i) => <VendorCardSkeleton key={i} />)
                    ) : vendors.length > 0 ? (
                        vendors.map(vendor => (
                            <VendorCard
                                key={vendor.id}
                                {...vendor}
                                categoryImage={categoryMap[vendor.category] || categoryMap[getCategoryTranslationKey(vendor.category)]}
                            />
                        ))
                    ) : (
                        <div className="no-results text-center py-20 p-12 bg-gray-50 rounded-xl" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                            <p className="text-xl text-gray-500">{t('seoLanding.noResults', { city: displayCity })}</p>
                            <Link to="/vendors" className="btn btn-primary mt-6 mt-4 inline-block" style={{ marginTop: '20px', display: 'inline-block' }}>
                                {t('seoLanding.seeAll')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeoLandingPage;
