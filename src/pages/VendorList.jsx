import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VendorCard from '../components/VendorCard';
import VendorFilters from '../components/VendorFilters';
import VendorHero from '../components/VendorHero';
import VendorCardSkeleton from '../components/VendorCardSkeleton';
import { useVendors } from '../context/VendorContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import useGeolocation from '../hooks/useGeolocation';
import { calculateDistance, formatDistance, isWithinRadius } from '../utils/geoUtils';
import { STATES, CITIES_BY_STATE, getCategoryTranslationKey } from '../constants/vendorData';
import { supabase } from '../supabaseClient';
import { generateVendorListBreadcrumb } from '../utils/breadcrumbSchema';
import './VendorList.css';

const VendorList = () => {
    const { t, language } = useLanguage();
    const { getFilteredVendors } = useVendors();
    const [searchParams, setSearchParams] = useSearchParams();
    const { location: userLocation, loading: locationLoading, error: locationError, getLocation } = useGeolocation();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [topVendors, setTopVendors] = useState([]);
    const [topLoading, setTopLoading] = useState(false);
    const [categoryMap, setCategoryMap] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filters = useMemo(() => ({
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'recommended',
        category: searchParams.get('category') || '',
        country: searchParams.get('country') || '',
        state: searchParams.get('state') || '',
        city: searchParams.get('city') || '',
        zip_code: searchParams.get('zip_code') || '',
        price: searchParams.get('price') || '',
        capacity: searchParams.get('capacity') || '',
        radius: searchParams.get('radius') || '',
        is_elite: searchParams.get('is_elite') === 'true'
    }), [searchParams]);

    // Dynamic SEO Titles based on Category and City
    const seoTitle = useMemo(() => {
        const catKey = filters.category ? getCategoryTranslationKey(filters.category) : '';
        const catName = catKey ? t(`categories.${catKey}`) : (t('vendors.title') || 'Find Vendors');
        const cityName = filters.city ? `${filters.city}` : '';

        if (catKey && cityName) return `${catName} ${cityName}`;
        if (catKey) return `${catName}`;
        if (cityName) return `${t('vendors.title')} ${cityName}`;
        return t('vendors.title') || 'Find Vendors';
    }, [filters.category, filters.city, language, t]);

    const seoDescription = useMemo(() => {
        const catKey = filters.category ? getCategoryTranslationKey(filters.category) : '';
        const catName = catKey ? t(`categories.${catKey}`) : 'Hochzeitsdienstleister';
        const cityName = filters.city ? filters.city : 'Deutschland';
        return `${cityName} bölgesindeki en iyi ${catName} seçeneklerini keşfedin. ${totalCount} tedarikçi arasından seçim yapın, fiyat teklifi alın ve hayalinizdeki düğünü planlayın.`;
    }, [filters.category, filters.city, totalCount, language, t]);

    // Generate structural data for SEO (ItemList + Breadcrumb)
    const structuredData = useMemo(() => {
        const catKey = filters.category ? getCategoryTranslationKey(filters.category) : '';
        const catName = catKey ? t(`categories.${catKey}`) : null;

        // Breadcrumb schema
        const breadcrumb = generateVendorListBreadcrumb(catName, filters.category, filters.city);

        // ItemList schema
        const itemList = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "numberOfItems": vendors.length,
            "itemListElement": vendors.slice(0, 10).map((v, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://kolaydugun.de/vendors/${v.slug || v.id}`,
                "name": v.name
            }))
        };

        // Return as array for multiple schemas
        return [breadcrumb, itemList].filter(Boolean);
    }, [vendors, filters.category, filters.city, t]);

    // Main Fetch Effect
    useEffect(() => {
        const fetchFilteredData = async () => {
            setLoading(true);
            const { vendors: data, total } = await getFilteredVendors({
                filters,
                page: currentPage,
                pageSize: itemsPerPage
            });

            // Sort data to put Elite vendors on top if not already handled by backend
            // Also filter out hidden vendors (is_public_visible === false)
            const sortedData = data ? [...data]
                .filter(v => v.details?.vip_demo_config?.is_public_visible !== false)
                .sort((a, b) => {
                    const aElite = a.details?.vip_demo_config?.is_elite ? 1 : 0;
                    const bElite = b.details?.vip_demo_config?.is_elite ? 1 : 0;
                    return bElite - aElite;
                }) : [];

            setVendors(sortedData);
            setTotalCount(total || 0);
            setLoading(false);
        };
        fetchFilteredData();
    }, [filters, currentPage]);

    const handleFilterChange = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key]) {
                params.set(key, newFilters[key]);
            }
        });
        setSearchParams(params);
        setCurrentPage(1); // Reset page on filter change
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Fetch Top 5 "Stars of Category"
    useEffect(() => {
        const fetchTopStars = async () => {
            if (!filters.category) {
                setTopVendors([]);
                return;
            }
            setTopLoading(true);
            try {
                // Fetch Top 5 + Any Elite vendors for this category/city
                const { data, error } = await supabase.rpc('get_top_vendors', {
                    p_category: filters.category,
                    p_city: filters.city || null,
                    p_limit: 5
                });

                // Also fetch Elite vendors for this specific search to include them in stars
                const { data: eliteData } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('category', filters.category)
                    .or('details.cs.{"vip_demo_config": {"is_elite": true}}')
                    .limit(3);

                const combined = [...(data || [])];
                if (eliteData) {
                    eliteData.forEach(ev => {
                        if (!combined.find(v => v.id === ev.id)) {
                            combined.push(ev);
                        }
                    });
                }

                if (!error) setTopVendors(combined.slice(0, 6));
            } catch (err) {
                console.error('Error fetching top stars:', err);
            } finally {
                setTopLoading(false);
            }
        };
        fetchTopStars();
    }, [filters.category, filters.city]);

    useEffect(() => {
        const fetchCategoryMap = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('name, image_url');
                if (!error && data) {
                    const map = {};
                    data.forEach(cat => {
                        map[cat.name] = cat.image_url;
                        map[getCategoryTranslationKey(cat.name)] = cat.image_url;
                    });
                    setCategoryMap(map);
                }
            } catch (err) {
                console.error('Error fetching category map:', err);
            }
        };
        fetchCategoryMap();
    }, []);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div className="vendor-page">
            <SEO
                title={seoTitle}
                description={seoDescription}
                url={`/vendors${filters.category ? `?category=${filters.category}` : ''}${filters.city ? `&city=${filters.city}` : ''}`}
                structuredData={structuredData}
                hreflangUrls={{ de: '/vendors', tr: '/vendors', en: '/vendors' }}
            />
            <VendorHero totalVendors={totalCount} />

            <div className="section container">
                <div className="vendor-list-header">
                    <h2>{t('vendors.title') || 'Tedarikçi Pazarı'}</h2>
                    <Link to="/register" className="btn btn-primary">
                        {t('vendors.join') || 'İşletmenizi Kaydedin'}
                    </Link>
                </div>

                <div className="vendor-list-layout">
                    <VendorFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        userLocation={userLocation}
                        onLocationRequest={getLocation}
                        locationLoading={locationLoading}
                        locationError={locationError}
                    />

                    <div className="vendor-grid-container">
                        {/* TOP 5 STARS SECTION */}
                        {filters.category && topVendors.length > 0 && (
                            <div className="top-stars-section" style={{
                                marginBottom: '40px',
                                background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid #fde68a'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>✨</span>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#92400e' }}>
                                        {language === 'tr' ? 'Kategorinin Yıldızları (Top 5)' : 'Stars of Category (Top 5)'}
                                    </h3>
                                    <span style={{ background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>PREMIUM</span>
                                </div>
                                <div className="vendor-grid">
                                    {topVendors.map(vendor => (
                                        <div key={`top-${vendor.id}`} data-aos="fade-up" data-aos-delay="100">
                                            <VendorCard
                                                {...vendor}
                                                categoryImage={categoryMap[vendor.category] || categoryMap[getCategoryTranslationKey(vendor.category)]}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <hr style={{ marginTop: '30px', border: 'none', borderTop: '1px solid #fde68a' }} />
                            </div>
                        )}


                        <div className="vendor-grid">
                            {loading ? (
                                // Show skeletons while loading
                                [...Array(6)].map((_, index) => (
                                    <VendorCardSkeleton key={index} />
                                ))
                            ) : vendors.length > 0 ? (
                                vendors.map((vendor, index) => (
                                    <div key={vendor.id}>
                                        <VendorCard
                                            {...vendor}
                                            categoryImage={categoryMap[vendor.category] || categoryMap[getCategoryTranslationKey(vendor.category)]}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="no-vendors-message">
                                    <p className="no-vendors-text">{t('vendors.noResults') || 'Seçilen filtrelere uygun tedarikçi bulunamadı.'}</p>
                                </div>
                            )}
                        </div>

                        {!loading && totalPages > 1 && (() => {
                            // Smart pagination: show 1, ..., current-1, current, current+1, ..., last
                            const pages = [];
                            const showEllipsisBefore = currentPage > 3;
                            const showEllipsisAfter = currentPage < totalPages - 2;

                            // Always show first page
                            pages.push(1);

                            // Ellipsis before current range
                            if (showEllipsisBefore) {
                                pages.push('...');
                            }

                            // Pages around current
                            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                                if (!pages.includes(i)) pages.push(i);
                            }

                            // Ellipsis after current range
                            if (showEllipsisAfter) {
                                pages.push('...');
                            }

                            // Always show last page
                            if (totalPages > 1 && !pages.includes(totalPages)) {
                                pages.push(totalPages);
                            }

                            return (
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(1)}
                                        title="İlk Sayfa"
                                    >
                                        ««
                                    </button>
                                    <button
                                        className="pagination-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        ←
                                    </button>
                                    {pages.map((page, idx) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="pagination-ellipsis" style={{ padding: '0 8px' }}>...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                    <button
                                        className="pagination-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        →
                                    </button>
                                    <button
                                        className="pagination-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        title="Son Sayfa"
                                    >
                                        »»
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorList;
