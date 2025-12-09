import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useLanguage } from '../../context/LanguageContext';
import { CITIES, getCategoryTranslationKey } from '../../constants/vendorData';
import { dictionary } from '../../locales/dictionary';
import MapView from '../MapView';
import i18n from '../../i18n';

const ProfileEditor = ({ vendor, onUpdate }) => {
    const { user } = useAuth();
    const { refreshVendors } = useVendors();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categorySchema, setCategorySchema] = useState([]);

    // Tier Logic
    const [isBetaMode, setIsBetaMode] = useState(false);

    useEffect(() => {
        const checkBetaMode = async () => {
            const { data } = await supabase
                .from('marketplace_config')
                .select('value')
                .eq('key', 'show_pricing_plans')
                .single();

            if (data) {
                // If show_pricing_plans is FALSE, then Beta Mode is TRUE
                const showPlans = data.value === 'true' || data.value === true;
                setIsBetaMode(!showPlans);
            }
        };
        checkBetaMode();
    }, []);

    // Tier Logic
    const currentTier = vendor?.subscription_tier || 'free';

    // Base Features
    let features = {
        social: false,
        faq: false,
        galleryLimit: 3,
        website: false,
        map_view: false
    };

    if (currentTier === 'premium') {
        features = { social: true, faq: true, galleryLimit: 50, website: true, map_view: true };
    } else if (currentTier === 'basic') {
        features = { social: true, faq: false, galleryLimit: 10, website: true, map_view: true };
    } else {
        // Free Tier
        if (isBetaMode) {
            // BETA OVERRIDE: Unlock everything EXCEPT gallery limit
            features = {
                social: true,
                faq: true,
                galleryLimit: 3, // Keep limit at 3 as requested
                website: true,
                map_view: true
            };
        } else {
            features = { social: false, faq: false, galleryLimit: 3, website: false, map_view: false };
        }
    }

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        location: '',
        description: '',
        price: '',
        capacity: '',
        years_experience: 0,
        website_url: '',
        payment_methods: [],
        languages: [],
        social_media: { instagram: '', facebook: '' },
        faq: [],
        details: {}, // Dynamic details
        latitude: '',
        longitude: '',
        additional_categories: [] // New field
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (vendor) {
            // Clean dirty data on load
            const rawDetails = vendor.details || {};
            const cleanDetails = {};
            if (rawDetails) {
                Object.keys(rawDetails).forEach(key => {
                    const cleanKey = key.replace(/^schemas\./, '');
                    let val = rawDetails[key];
                    if (Array.isArray(val)) {
                        val = val.map(v => v.replace(/^schemas\./, ''));
                    } else if (typeof val === 'string') {
                        val = val.replace(/^schemas\./, '');
                    }
                    cleanDetails[cleanKey] = val;
                });
            }

            setFormData({
                name: vendor.business_name || vendor.name || '',
                category: vendor.category || '',
                location: vendor.city || '', // Map city to location field
                description: vendor.description || '',
                price: vendor.price_range || '', // Map price_range to price field
                capacity: vendor.capacity || '',
                years_experience: vendor.years_experience || 0,
                website_url: vendor.website_url || '',
                video_url: vendor.video_url || '', // Add video_url support
                payment_methods: vendor.payment_methods || [],
                languages: vendor.languages || [],
                social_media: vendor.social_media || { instagram: '', facebook: '' },
                faq: vendor.faq || [],
                details: cleanDetails,
                latitude: vendor.latitude || '',
                longitude: vendor.longitude || '',
                additional_categories: vendor.additional_categories || []
            });
        }
    }, [vendor]);

    // Fetch schema when category changes
    useEffect(() => {
        if (formData.category && categories.length > 0) {
            const selectedCat = categories.find(c => c.name === formData.category);
            if (selectedCat && selectedCat.form_schema) {
                try {
                    const schema = typeof selectedCat.form_schema === 'string'
                        ? JSON.parse(selectedCat.form_schema)
                        : selectedCat.form_schema;
                    setCategorySchema(schema);
                } catch (e) {
                    console.error('Error parsing schema:', e);
                    setCategorySchema([]);
                }
            } else {
                setCategorySchema([]);
            }
        }
    }, [formData.category, categories]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                social_media: { ...prev.social_media, [socialKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiSelect = (e, field) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, [field]: options }));
    };

    // Dynamic Field Handlers
    const handleDetailChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            details: { ...prev.details, [key]: value }
        }));
    };

    const handleDetailMultiSelect = (e, key) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        handleDetailChange(key, options);
    };

    const handleFaqChange = (index, field, value) => {
        const newFaq = [...(formData.faq || [])];
        if (!newFaq[index]) newFaq[index] = {};
        newFaq[index][field] = value;
        setFormData(prev => ({ ...prev, faq: newFaq }));
    };

    const addFaq = () => {
        setFormData(prev => ({
            ...prev,
            faq: [...(prev.faq || []), { question: '', answer: '' }]
        }));
    };

    const removeFaq = (index) => {
        const newFaq = [...(formData.faq || [])];
        newFaq.splice(index, 1);
        setFormData(prev => ({ ...prev, faq: newFaq }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const safeInt = (val) => {
            if (val === '' || val === null || val === undefined) return null;
            const parsed = parseInt(val);
            return isNaN(parsed) ? null : parsed;
        };

        try {
            const updates = {
                user_id: user.id,
                business_name: formData.name,
                category: formData.category,
                city: formData.location,
                description: formData.description,
                price_range: formData.price,
                capacity: safeInt(formData.capacity),
                years_experience: safeInt(formData.years_experience),
                website_url: formData.website_url || null, // Send null if empty
                video_url: formData.video_url || null, // Send null if empty
                payment_methods: formData.payment_methods,
                languages: formData.languages,
                social_media: formData.social_media,
                faq: formData.faq,
                details: formData.details, // Save dynamic details
                latitude: formData.latitude || null,
                longitude: formData.longitude || null,
                additional_categories: formData.additional_categories // Submit new field
            };

            // Critical Fix v3: Use UPSERT to handle both new and existing records gracefully
            const validId = user?.id || vendor?.id || updates.user_id;

            if (!validId) {
                throw new Error("Kullanıcı kimliği (ID) bulunamadı. Lütfen sayfayı yenileyip tekrar giriş yapın (Code: MISSING_AUTH_ID).");
            }

            console.log('Upserting vendor with ID:', validId);

            const { error: saveError } = await supabase
                .from('vendors')
                .upsert({ ...updates, id: validId });

            if (saveError) throw saveError;

            if (refreshVendors) {
                await refreshVendors();
            }

            alert(t('vendorDashboard.alerts.saved'));
            onUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Hata: ${error.message}\nDetay: ${error.details || ''}\nİpucu: ${error.hint || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const renderLockedOverlay = () => (
        <div className="locked-overlay">
            <span>🔒 {t('vendorDashboard.alerts.locked')}</span>
        </div>
    );

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert(t('vendorDashboard.alerts.locationError') || "Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="profile-editor">
            <h2>{t('dashboard.profile.businessName')}</h2>

            <div className="tier-badge-container">
                <span className={`badge badge-${currentTier}`}>
                    {t(`vendorDashboard.tiers.${currentTier}.name`)}
                </span>
                <p className="text-muted">{t(`vendorDashboard.tiers.${currentTier}.desc`)}</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-section">
                    <h3>{t('dashboard.profile.description')}</h3>
                    <div className="form-group">
                        <label>{t('dashboard.profile.businessName')} *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('dashboard.profile.category')} *</label>
                            <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                                <option value="">-</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{t('categories.' + getCategoryTranslationKey(c.name))}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('dashboard.profile.additionalCategories') || 'Ek Hizmet Alanları (Opsiyonel)'}</label>
                            <select
                                multiple
                                name="additional_categories"
                                value={formData.additional_categories || []}
                                onChange={(e) => handleMultiSelect(e, 'additional_categories')}
                                className="form-control"
                                style={{ height: '100px' }}
                            >
                                {categories.map(c => (
                                    c.name !== formData.category && // Don't show main category
                                    <option key={c.id} value={c.name}>
                                        {t('categories.' + getCategoryTranslationKey(c.name))}
                                    </option>
                                ))}
                            </select>
                            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                {t('dashboard.profile.multiSelectHint') || 'Birden fazla seçim için CTRL (Mac için CMD) tuşuna basılı tutun.'}
                            </small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('dashboard.profile.city')} *</label>
                            <select name="location" value={formData.location} onChange={handleChange} required className="form-control">
                                <option value="">-</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('dashboard.profile.priceRange') || 'Fiyat Aralığı'}</label>
                            <select name="price" value={formData.price} onChange={handleChange} className="form-control">
                                <option value="">{t('dashboard.profile.selectPrice') || 'Seçiniz'}</option>
                                <option value="€">{t('filters.price_1')}</option>
                                <option value="€€">{t('filters.price_2')}</option>
                                <option value="€€€">{t('filters.price_3')}</option>
                                <option value="€€€€">{t('filters.price_4')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('dashboard.profile.capacity') || 'Kapasite'}</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                                placeholder="Örn: 500"
                            />
                        </div>
                    </div>

                    {/* Location Settings (Lat/Lng) - Tier Restricted */}
                    <div className={`form-section ${!features.map_view ? 'locked' : ''}`}>
                        {!features.map_view && renderLockedOverlay()}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>📍 {t('vendorDashboard.profile.locationSettings')}</h3>
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                disabled={!features.map_view}
                            >
                                📍 {t('vendorDashboard.profile.useMyLocation')}
                            </button>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('vendorDashboard.profile.latitude')}</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.latitude || ''}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="41.0082"
                                    disabled={!features.map_view}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('vendorDashboard.profile.longitude')}</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.longitude || ''}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="28.9784"
                                    disabled={!features.map_view}
                                />
                            </div>
                        </div>
                        <small className="text-muted">
                            Google Maps: Sağ tık -&gt; "Burası neresi?" -&gt; Koordinatları kopyala (Örn: 41.0082, 28.9784)
                        </small>

                        {/* Map Preview */}
                        {formData.latitude && formData.longitude && (
                            <div style={{ marginTop: '1rem', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                                <MapView
                                    latitude={parseFloat(formData.latitude)}
                                    longitude={parseFloat(formData.longitude)}
                                    businessName={formData.name}
                                    address={formData.location}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('dashboard.profile.description')} *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="10" className="form-control" />
                    </div>
                </div>

                {/* DYNAMIC CATEGORY FIELDS */}
                {categorySchema.length > 0 && (
                    <div className="form-section" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <h3>✨ {t('dashboard.profile.specialDetails')}</h3>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {categorySchema.map((field, idx) => (
                                <div key={idx} className="form-group" style={field.type === 'multiselect' ? { gridColumn: 'span 2' } : {}}>
                                    <label>
                                        {(() => {
                                            // Handle dirty data: strip schemas. prefix
                                            const cleanLabel = field.label.replace(/^schemas\./, '');
                                            const key = `schemas.${cleanLabel}`;
                                            const val = t(key);

                                            // If t() returns key, try direct dictionary lookup
                                            if (val === key) {
                                                const lang = i18n.language || 'tr';
                                                const dictVal = dictionary.schemas?.[cleanLabel]?.[lang] ||
                                                    dictionary.schemas?.[cleanLabel]?.en;
                                                if (dictVal) return dictVal;
                                            } else {
                                                return val;
                                            }

                                            // Fallbacks for specific known issues
                                            const fallbacks = {
                                                'schemas.performance_duration_label': { tr: 'Performans Süresi', en: 'Performance Duration', de: 'Auftrittsdauer' },
                                                'schemas.experience_years_label': { tr: 'Deneyim Yılı', en: 'Years of Experience', de: 'Jahre Erfahrung' }
                                            };
                                            return fallbacks[key]?.[i18n.language || 'tr'] || cleanLabel;
                                        })()}
                                    </label>

                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            value={formData.details[field.key] || ''}
                                            onChange={(e) => handleDetailChange(field.key, e.target.value)}
                                            className="form-control"
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <input
                                            type="number"
                                            value={formData.details[field.key] || ''}
                                            onChange={(e) => handleDetailChange(field.key, e.target.value)}
                                            className="form-control"
                                        />
                                    )}

                                    {field.type === 'boolean' && (
                                        <select
                                            value={formData.details[field.key] === true ? 'true' : 'false'}
                                            onChange={(e) => handleDetailChange(field.key, e.target.value === 'true')}
                                            className="form-control"
                                        >
                                            <option value="false">{t('common.no')}</option>
                                            <option value="true">{t('common.yes')}</option>
                                        </select>
                                    )}

                                    {field.type === 'select' && (
                                        <select
                                            value={formData.details[field.key] || ''}
                                            onChange={(e) => handleDetailChange(field.key, e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="">{t('common.select')}</option>
                                            {field.options?.map(opt => {
                                                const cleanOpt = opt.replace(/^schemas\./, '');
                                                const key = `schemas.${cleanOpt}`;
                                                const val = t(key);
                                                let display = val;

                                                if (val === key) {
                                                    const lang = i18n.language || 'tr';
                                                    display = dictionary.schemas?.[cleanOpt]?.[lang] ||
                                                        dictionary.schemas?.[cleanOpt]?.en ||
                                                        cleanOpt;
                                                }

                                                return <option key={opt} value={opt}>{display}</option>;
                                            })}
                                        </select>
                                    )}

                                    {field.type === 'multiselect' && (
                                        <>
                                            <select
                                                multiple
                                                value={formData.details[field.key] || []}
                                                onChange={(e) => handleDetailMultiSelect(e, field.key)}
                                                className="form-control"
                                                style={{ height: '120px' }}
                                            >
                                                {field.options?.map(opt => {
                                                    const cleanOpt = opt.replace(/^schemas\./, '');
                                                    return <option key={opt} value={opt}>{t(`schemas.${cleanOpt}`) || cleanOpt}</option>;
                                                })}
                                            </select>
                                            <small className="text-muted">{t('dashboard.profile.multiSelectHint')}</small>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Website & Social - Tier Restricted */}
                <div className={`form-section ${!features.website ? 'locked' : ''}`}>
                    {!features.website && renderLockedOverlay()}
                    <h3>{t('dashboard.profile.website')} & {t('dashboard.profile.socialMedia')}</h3>

                    <div className="form-group">
                        <label>{t('dashboard.profile.website')}</label>
                        <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} disabled={!features.website} className="form-control" placeholder="https://example.com" />
                    </div>

                    <div className="form-group">
                        <label>YouTube / Vimeo Video URL</label>
                        <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} disabled={!features.website} className="form-control" placeholder="https://youtube.com/watch?v=..." />
                        <small className="text-muted">
                            {t('dashboard.profile.videoHint') || "Tanıtım videonuzun linkini buraya yapıştırın. Profilinizde görünecektir."}
                        </small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Instagram</label>
                            <input type="url" name="social_instagram" value={formData.social_media.instagram} onChange={handleChange} disabled={!features.social} className="form-control" placeholder="https://instagram.com/..." />
                        </div>
                        <div className="form-group">
                            <label>Facebook</label>
                            <input type="url" name="social_facebook" value={formData.social_media.facebook} onChange={handleChange} disabled={!features.social} className="form-control" placeholder="https://facebook.com/..." />
                        </div>
                    </div>
                </div>

                {/* FAQ Section - Tier Restricted */}
                <div className={`form-section ${!features.faq ? 'locked' : ''}`}>
                    {!features.faq && renderLockedOverlay()}
                    <h3>{t('vendorDashboard.faq.title')}</h3>
                    {(formData.faq || []).map((item, index) => (
                        <div key={index} className="faq-item" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div className="form-group">
                                <label>{t('vendorDashboard.faq.question')} {index + 1}</label>
                                <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                    className="form-control"
                                    placeholder={t('vendorDashboard.faq.question')}
                                    disabled={!features.faq}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('vendorDashboard.faq.answer')}</label>
                                <textarea
                                    rows="6"
                                    value={item.answer}
                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                    className="form-control"
                                    placeholder={t('vendorDashboard.faq.answer')}
                                    disabled={!features.faq}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="btn btn-text text-danger"
                                style={{ fontSize: '0.9rem' }}
                                disabled={!features.faq}
                            >
                                🗑️ {t('vendorDashboard.faq.remove')}
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addFaq}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        disabled={!features.faq}
                    >
                        + {t('vendorDashboard.faq.add')}
                    </button>
                </div>

                <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                    {loading ? t('vendorDashboard.alerts.saved') : t('dashboard.profile.save')}
                </button>
            </form>
        </div>
    );
};

export default ProfileEditor;
