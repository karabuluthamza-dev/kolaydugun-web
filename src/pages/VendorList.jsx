import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VendorCard from '../components/VendorCard';
import VendorFilters from '../components/VendorFilters';
import VendorHero from '../components/VendorHero';
import VendorCardSkeleton from '../components/VendorCardSkeleton';
import { useVendors } from '../context/VendorContext';
import useSEO from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';
import useGeolocation from '../hooks/useGeolocation';
import { calculateDistance, formatDistance, isWithinRadius } from '../utils/geoUtils';
import './VendorList.css';

const VendorList = () => {
    const { t } = useLanguage();
    useSEO({
        title: t('vendors.title') || 'Find Vendors',
        description: 'Find the best wedding vendors in Germany. Venues, catering, photographers and more.'
    });
    const { vendors, loading } = useVendors();
    const [searchParams, setSearchParams] = useSearchParams();
    const { location: userLocation, loading: locationLoading, error: locationError, getLocation } = useGeolocation();
    const [topVendors, setTopVendors] = useState([]);
    const [topLoading, setTopLoading] = useState(false);

    const filters = useMemo(() => ({
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'recommended',
        category: searchParams.get('category') || '',
        city: searchParams.get('city') || '',
        price: searchParams.get('price') || '',
        capacity: searchParams.get('capacity') || '',
        radius: searchParams.get('radius') || ''
    }), [searchParams]);

    const handleFilterChange = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key]) {
                params.set(key, newFilters[key]);
            }
        });
        setSearchParams(params);
    };

    // Fetch Top 5 "Stars of Category"
    useEffect(() => {
        const fetchTopStars = async () => {
            if (!filters.category) {
                setTopVendors([]);
                return;
            }
            setTopLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_top_vendors', {
                    p_category: filters.category,
                    p_city: filters.city || null,
                    p_limit: 5
                });
                if (!error) setTopVendors(data || []);
            } catch (err) {
                console.error('Error fetching top stars:', err);
            } finally {
                setTopLoading(false);
            }
        };
        fetchTopStars();
    }, [filters.category, filters.city]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredVendors = useMemo(() => {
        let result = vendors.map(vendor => {
            // Calculate distance if user location is available
            let distance = null;
            if (userLocation && vendor.latitude && vendor.longitude) {
                distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    vendor.latitude,
                    vendor.longitude
                );
            }
            return { ...vendor, distance };
        }).filter(vendor => {
            const searchTerm = (filters.search || '').toLowerCase();
            const matchSearch = !searchTerm ||
                (vendor.business_name && vendor.business_name.toLowerCase().includes(searchTerm)) ||
                (vendor.businessName && vendor.businessName.toLowerCase().includes(searchTerm)) ||
                (vendor.name && vendor.name.toLowerCase().includes(searchTerm)) ||
                (vendor.tags && vendor.tags.some(t => t.toLowerCase().includes(searchTerm)));

            const normalize = (str) => str ? str.toLowerCase().replace(/\s+/g, '-').replace(/s$/, '') : '';
            const catFilter = normalize(filters.category);
            const vendorCat = normalize(vendor.category);

            const matchCategory = !filters.category ||
                vendor.category === filters.category ||
                vendorCat === catFilter ||
                (vendorCat && catFilter && vendorCat.includes(catFilter)) ||
                (vendor.additional_categories && vendor.additional_categories.some(ac =>
                    ac.toLowerCase().replace(/\s+/g, '-').includes(catFilter)
                ));

            const matchCity = !filters.city || vendor.city === filters.city || vendor.location === filters.city;
            const matchPrice = !filters.price || vendor.priceRange === filters.price || vendor.price === filters.price;
            const matchCapacity = !filters.capacity || (vendor.capacity && vendor.capacity >= parseInt(filters.capacity));

            // Dynamic Schema Filtering (e.g. "music_instruments")
            let matchDynamic = true;
            if (filters.category) {
                // We iterate over filter keys that are NOT standard filters
                const standardKeys = ['search', 'sort', 'category', 'city', 'price', 'capacity', 'radius'];
                Object.keys(filters).forEach(key => {
                    if (!standardKeys.includes(key) && filters[key]) {
                        // Check logic:
                        // vendor.details is where schema answers are stored.
                        // If vendor.details[key] is an array (multiselect), check if it includes value
                        // If vendor.details[key] is a string, check equality
                        const vendorVal = vendor.details ? vendor.details[key] : null;

                        if (Array.isArray(vendorVal)) {
                            // Vendor has multiple items (e.g. ["davul", "zurna"])
                            // Filter value is usually single selection from dropdown (e.g. "davul")
                            // Check if vendor has that specific item
                            if (!vendorVal.includes(filters[key])) {
                                matchDynamic = false;
                            }
                        } else {
                            // Vendor has single value, check equality
                            if (vendorVal !== filters[key]) {
                                matchDynamic = false;
                            }
                        }
                    }
                });
            }

            // Radius filter
            const matchRadius = !userLocation || !filters.radius ||
                (vendor.distance !== null && isWithinRadius(vendor.distance, parseInt(filters.radius)));

            return matchSearch && matchCategory && matchCity && matchPrice && matchCapacity && matchRadius && matchDynamic;
        });

        // Sort logic
        if (filters.sort === 'distance' && userLocation) {
            // Sort by distance (closest first)
            result.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        } else if (filters.sort === 'price_asc') {
            const priceMap = { '€': 1, '€€': 2, '€€€': 3, '€€€€': 4 };
            result.sort((a, b) => (priceMap[a.priceRange] || 0) - (priceMap[b.priceRange] || 0));
        } else if (filters.sort === 'price_desc') {
            const priceMap = { '€': 1, '€€': 2, '€€€': 3, '€€€€': 4 };
            result.sort((a, b) => (priceMap[b.priceRange] || 0) - (priceMap[a.priceRange] || 0));
        } else if (filters.sort === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else {
            // Default 'recommended' / Smart Sort
            result.sort((a, b) => {
                // 1. Tier Priority: Premium > Basic > Free
                // Map tiers to weights
                const getTierWeight = (v) => {
                    if (v.subscription_tier === 'premium' || v.featured_active) return 3;
                    if (v.subscription_tier === 'basic') return 2;
                    return 1;
                };

                const weightA = getTierWeight(a);
                const weightB = getTierWeight(b);

                if (weightA !== weightB) {
                    return weightB - weightA; // Higher tier first
                }

                // 2. Score Priority: Rating * log(Reviews + 1)
                // This balances high rating with number of reviews.
                // A 5.0 with 1 review = 5 * 0.3 = 1.5
                // A 4.8 with 10 reviews = 4.8 * 1.04 = 4.99
                // A 4.5 with 100 reviews = 4.5 * 2 = 9
                const getScore = (v) => {
                    const rating = v.rating || 0;
                    const reviews = v.reviews || 0;
                    // Use log10 to dampen the effect of massive review counts
                    return rating * Math.log10(reviews + 2); // +2 to ensure log is always positive (>0.3)
                };

                const scoreA = getScore(a);
                const scoreB = getScore(b);

                if (Math.abs(scoreA - scoreB) > 0.1) { // Significant difference
                    return scoreB - scoreA;
                }

                // 3. Random Shuffle for similar scores (Deterministic per session/page load ideally, but simple random here)
                // To avoid jitter on re-renders, we should use a stable sort if possible, 
                // but for "discovery" random is okay. 
                // However, React re-renders might cause jumping. 
                // Let's stick to ID for stability if scores are equal, 
                // OR use a seeded random if we want rotation.
                // For now, stable sort by ID to prevent jumping.
                return (a.id || '').toString().localeCompare(b.id || '');
            });
        }

        return result;
    }, [vendors, filters, userLocation]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const currentVendors = filteredVendors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll to top of list, not page
    };

    return (
        <div className="vendor-page">
            <VendorHero totalVendors={vendors.length} />

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
                                        <VendorCard key={`top-${vendor.id}`} {...vendor} />
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
                            ) : currentVendors.length > 0 ? (
                                currentVendors.map(vendor => {
                                    // DEBUG: Log claim fields for Test Claimable Vendor
                                    if (vendor.business_name?.includes('Claimable') || vendor.name?.includes('Claimable')) {
                                        console.log('[VendorList] Claimable vendor props:', {
                                            name: vendor.business_name || vendor.name,
                                            user_id: vendor.user_id,
                                            is_claimed: vendor.is_claimed,
                                            is_verified: vendor.is_verified,
                                            id: vendor.id
                                        });
                                    }
                                    return <VendorCard key={vendor.id} {...vendor} />;
                                })
                            ) : (
                                <div className="no-vendors-message">
                                    <p className="no-vendors-text">{t('vendors.noResults') || 'Seçilen filtrelere uygun tedarikçi bulunamadı.'}</p>
                                </div>
                            )}
                        </div>

                        {!loading && totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    &larr;
                                </button>
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    className="pagination-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorList;
