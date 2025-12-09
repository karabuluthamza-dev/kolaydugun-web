import { supabase } from '../supabaseClient';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, CITIES, getCategoryTranslationKey } from '../constants/vendorData';
import { dictionary } from '../locales/dictionary';
import '../pages/VendorList.css';

const VendorFilters = ({ filters, onFilterChange, userLocation, onLocationRequest, locationLoading, locationError }) => {
    const { t, language } = useLanguage();
    const [dynamicSchema, setDynamicSchema] = useState([]);
    const [schemaLoading, setSchemaLoading] = useState(false);

    // Fetch schema when category changes
    useEffect(() => {
        const fetchSchema = async () => {
            if (!filters.category) {
                setDynamicSchema([]);
                return;
            }

            setSchemaLoading(true);
            try {
                // Find category by name (Note: category names are stored in English or Turkish in DB? usually Turkish based on CATEGORIES constant)
                // Use the exact value from filters.category which comes from CATEGORIES
                const { data, error } = await supabase
                    .from('categories')
                    .select('form_schema')
                    .eq('name', filters.category)
                    .single();

                if (data && data.form_schema) {
                    // Check if it's string or object
                    const parsed = typeof data.form_schema === 'string'
                        ? JSON.parse(data.form_schema)
                        : data.form_schema;
                    setDynamicSchema(parsed);
                } else {
                    setDynamicSchema([]);
                }
            } catch (err) {
                console.error("Error fetching category schema:", err);
                setDynamicSchema([]);
            } finally {
                setSchemaLoading(false);
            }
        };

        fetchSchema();
    }, [filters.category]);

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    // Helper to translate dynamic labels/options
    const tr = (key) => {
        // Try dictionary first
        if (dictionary.schemas && dictionary.schemas[key] && dictionary.schemas[key][language]) {
            return dictionary.schemas[key][language];
        }
        // Fallback to t()
        const tVal = t(`schemas.${key}`);
        return tVal !== `schemas.${key}` ? tVal : key; // Return key if translation missing
    };

    return (
        <aside className="vendor-filters-sidebar">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('filters.title') || 'Filtrele'}</h3>

            <div className="filter-group">
                <label className="filter-label">{t('filters.search') || 'Arama'}</label>
                <input
                    type="text"
                    placeholder={t('filters.searchPlaceholder') || 'İsim veya etiket ara...'}
                    className="filter-input"
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                />
            </div>

            {/* Dynamic Filters from Schema */}
            {filters.category && dynamicSchema.length > 0 && (
                <div className="dynamic-filters-section" style={{ borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '15px' }}>
                    <h4 style={{ fontSize: '1rem', color: '#666', marginBottom: '10px' }}>{filters.category} {t('common.options') || 'Seçenekleri'}</h4>
                    {dynamicSchema.map(field => {
                        if (field.type === 'select' || field.type === 'multiselect') {
                            return (
                                <div key={field.key} className="filter-group">
                                    <label className="filter-label">{tr(field.label)}</label>
                                    <select
                                        className="filter-select"
                                        value={filters[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                    >
                                        <option value="">{t('filters.all') || 'Tümü'}</option>
                                        {field.options?.map(opt => (
                                            <option key={opt} value={opt}>{tr(opt)}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            )}

            {/* Location Filter */}
            {/* ... rest of the filters ... */}
            <div className="filter-group">
                <label className="filter-label">📍 Konum</label>
                <button
                    className={`filter-button ${userLocation ? 'active' : ''}`}
                    onClick={onLocationRequest}
                    disabled={locationLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: userLocation ? '#28a745' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: locationLoading ? 'wait' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    {locationLoading ? '⏳ Konum alınıyor...' :
                        userLocation ? '✓ Konumum Kullanılıyor' :
                            '📍 Konumumu Kullan'}
                </button>
                {locationError && (
                    <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                        {locationError}
                    </p>
                )}
                {userLocation && (
                    <div style={{ marginTop: '10px' }}>
                        <label className="filter-label" style={{ fontSize: '13px' }}>Mesafe (km)</label>
                        <select
                            className="filter-select"
                            value={filters.radius || ''}
                            onChange={(e) => handleChange('radius', e.target.value)}
                        >
                            <option value="">Tümü</option>
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="25">25 km</option>
                            <option value="50">50 km</option>
                            <option value="100">100 km</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.sort') || 'Sıralama'}</label>
                <select
                    className="filter-select"
                    value={filters.sort || 'recommended'}
                    onChange={(e) => handleChange('sort', e.target.value)}
                    aria-label="Sort vendors"
                >
                    <option value="recommended">{t('filters.sortRecommended') || 'Önerilen'}</option>
                    <option value="price_asc">{t('filters.sortPriceAsc') || 'Fiyat: Düşükten Yükseğe'}</option>
                    <option value="price_desc">{t('filters.sortPriceDesc') || 'Fiyat: Yüksekten Düşüğe'}</option>
                    <option value="rating">{t('filters.sortRating') || 'Puan: Yüksekten Düşüğe'}</option>
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.category') || 'Kategori'}</label>
                <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    aria-label="Filter by category"
                >
                    <option value="">{t('filters.all') || 'Tümü'}</option>
                    {CATEGORIES.map(cat => {
                        const manualTranslation = dictionary[getCategoryTranslationKey(cat)]?.[language];
                        const label = manualTranslation || t(`categories.${getCategoryTranslationKey(cat)}`);
                        return <option key={cat} value={cat}>{label}</option>;
                    })}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.city') || 'Şehir'}</label>
                <select
                    className="filter-select"
                    value={filters.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    aria-label="Filter by city"
                >
                    <option value="">{t('filters.all') || 'Tümü'}</option>
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.price') || 'Fiyat'}</label>
                <select
                    className="filter-select"
                    value={filters.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    aria-label="Filter by price range"
                >
                    <option value="">{t('filters.all') || 'Tümü'}</option>
                    <option value="€">{t('filters.price_1') || '€ (Ekonomik)'}</option>
                    <option value="€€">{t('filters.price_2') || '€€ (Orta)'}</option>
                    <option value="€€€">{t('filters.price_3') || '€€€ (Yüksek)'}</option>
                    <option value="€€€€">{t('filters.price_4') || '€€€€ (Lüks)'}</option>
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.capacity') || 'Min. Kapasite'}</label>
                <input
                    type="number"
                    placeholder="100"
                    className="filter-input"
                    value={filters.capacity}
                    onChange={(e) => handleChange('capacity', e.target.value)}
                    aria-label="Filter by minimum capacity"
                />
            </div>
        </aside>
    );
};

export default VendorFilters;
