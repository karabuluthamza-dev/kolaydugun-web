import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Wand2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { enrichVendorContent } from '../../services/aiService';
import { CATEGORIES, getCategoryTranslationKey, COUNTRIES, STATES, CITIES_BY_STATE } from '../../constants/vendorData';
import { formatExternalUrl } from '../../utils/urlUtils';
import i18n from '../../i18n';

const VendorEditModal = ({ isOpen, onClose, importItem, vendor, onSaveSuccess }) => {
    const { t } = useTranslation();
    // Helper to get category name from ID if text is missing
    const getInitialCategory = (item) => {
        if (item?.category) return item.category;
        if (item?.category_id) {
            return CATEGORIES.find(c => c.id === item.category_id)?.tr || item.category_id;
        }
        return '';
    };

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // Shared item data
    const initialItem = importItem || vendor || {};

    // Normalize data so UI always sees 'email', 'phone', 'website'
    const normalizeData = (item) => {
        if (!item) return {};

        // Handle potential stringified JSON from older data or imports
        let social = item.social_media || {};
        if (typeof social === 'string') {
            try {
                social = JSON.parse(social);
            } catch (e) {
                social = {};
            }
        }

        return {
            ...item,
            email: item.email || item.contact_email || '',
            phone: item.phone || item.contact_phone || '',
            website: item.website || item.website_url || '',
            video_url: item.video_url || '',
            category: getInitialCategory(item),
            additional_categories: item.additional_categories || [],
            country: item.country || 'DE',
            state: item.state || '',
            city: item.city || item.city_raw || '',
            zip_code: item.zip_code || '',
            latitude: item.latitude || '',
            longitude: item.longitude || '',
            price_range: item.price_range || '',
            capacity: item.capacity || '',
            years_experience: item.years_experience || 0,
            instagram: social.instagram || '',
            facebook: social.facebook || '',
            twitter: social.twitter || '',
            is_claimed: item.is_claimed === true,
            description: item.description || '',
            faq: item.faq || [],
            payment_methods: item.payment_methods || [],
            languages: item.languages || [],
            details: item.details || {}
        };
    };

    const [formData, setFormData] = useState(() => normalizeData(importItem || vendor));

    const isImport = !!importItem;
    const tableToUpdate = isImport ? 'vendor_imports' : 'vendors';

    // Update form when item changes
    React.useEffect(() => {
        const item = importItem || vendor;
        if (item) {
            setFormData(normalizeData(item));
        }
    }, [importItem, vendor]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAiGenerate = async () => {
        const categoryToUse = formData.category || formData.category_raw || 'Hochzeitsdienstleister';

        if (!formData.business_name) {
            alert("İşletme adı gereklidir.");
            return;
        }

        setAiLoading(true);
        // Clear previous description to show it's working
        setFormData(prev => ({ ...prev, description: 'AI içerik hazırlıyor... ✍️' }));

        try {
            const description = await enrichVendorContent(
                formData.business_name,
                categoryToUse,
                { city: formData.city_raw || formData.city, website: formData.website }
            );
            console.log("AI Generated Content:", description);
            setFormData(prev => ({ ...prev, description }));
        } catch (err) {
            console.error("AI Generation failed:", err);
            setFormData(prev => ({ ...prev, description: initialItem.description || '' }));
            alert("AI içerik üretirken bir hata oluştu: " + err.message);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSaveAndApprove = async () => {
        setLoading(true);
        setError(null);
        try {
            const updatePayload = {
                business_name: formData.business_name,
                category: formData.category,
                additional_categories: formData.additional_categories,
                description: formData.description,
                address: formData.address,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                zip_code: formData.zip_code,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                price_range: formData.price_range,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                years_experience: formData.years_experience ? parseInt(formData.years_experience) : 0,
                video_url: formData.video_url,
                is_claimed: formData.is_claimed,
                faq: formData.faq,
                payment_methods: formData.payment_methods,
                languages: formData.languages,
                social_media: {
                    instagram: formData.instagram,
                    facebook: formData.facebook,
                    twitter: formData.twitter
                },
                details: formData.details
            };

            // Table specific schema differences
            if (isImport) {
                updatePayload.email = formData.email;
                updatePayload.phone = formData.phone;
                updatePayload.website = formData.website;
                updatePayload.city_raw = formData.city;
            } else {
                updatePayload.contact_email = formData.email;
                updatePayload.contact_phone = formData.phone;
                updatePayload.website_url = formData.website;
                updatePayload.city = formData.city;
                updatePayload.zip_code = formData.zip_code;
                updatePayload.image = formData.image;
            }

            // 1. Update the record
            const { error: updateError } = await supabase
                .from(tableToUpdate)
                .update(updatePayload)
                .eq('id', initialItem.id);

            if (updateError) throw updateError;

            // 2. Callback with latest data
            onSaveSuccess({ ...initialItem, ...updatePayload });
            onClose();

        } catch (err) {
            console.error('Save error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Tedarikçi Profilini Düzenle</h2>
                        <p className="text-sm text-gray-500">{formData.business_name || 'İsimsiz İşletme'} - Tüm alanları yönetin.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Section: Basic Info & Image */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-xs font-bold">1</div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Temel Bilgiler</h3>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-3">
                                <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner group relative">
                                    <img
                                        src={formData.image || formData.image_url || 'https://via.placeholder.com/300?text=No+Photo'}
                                        alt="Önizleme"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Önizleme</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-9 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">İşletme Adı</label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        value={formData.business_name || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Ana Kategori</label>
                                        <select
                                            name="category"
                                            value={formData.category || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all font-medium"
                                        >
                                            <option value="">Kategori Seçin</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.tr}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Fotoğraf URL</label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image || formData.image_url || ''}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Location (Hierarchical) */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">2</div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Konum Bilgileri</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Ülke</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value, state: '', city: '' }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all bg-white"
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c[i18n.language] || c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">{t('filters.state')}</label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, city: '' }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all bg-white"
                                >
                                    <option value="">Seçiniz</option>
                                    {(STATES[formData.country] || []).map(s => (
                                        <option key={s.id} value={s.id}>{s[i18n.language] || s.en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">{t('filters.city')}</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all bg-white"
                                >
                                    <option value="">Seçiniz</option>
                                    {(CITIES_BY_STATE[formData.state] || []).map(c => (
                                        <option key={c.id} value={c.id}>{c[i18n.language] || c.en}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">{t('filters.zipCode')}</label>
                                <input
                                    type="text"
                                    name="zip_code"
                                    value={formData.zip_code || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Enlem (Lat)</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.latitude || ''}
                                    onChange={handleChange}
                                    placeholder="41.0082"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Boylam (Lng)</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.longitude || ''}
                                    onChange={handleChange}
                                    placeholder="28.9784"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Business Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-xs font-bold">3</div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">İşletme Detayları</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Fiyat Aralığı</label>
                                <select
                                    name="price_range"
                                    value={formData.price_range || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                >
                                    <option value="">Belirtilmemiş</option>
                                    <option value="€">€ (Ekonomik)</option>
                                    <option value="€€">€€ (Orta Segmen)</option>
                                    <option value="€€€">€€€ (Lüks)</option>
                                    <option value="€€€€">€€€€ (Ultra Lüks)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Kapasite</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity || ''}
                                    onChange={handleChange}
                                    placeholder="Örn: 500"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Deneyim Yılı</label>
                                <input
                                    type="number"
                                    name="years_experience"
                                    value={formData.years_experience || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Ek Hizmet Alanları (Çoklu Seçim)</label>
                            <select
                                multiple
                                name="additional_categories"
                                value={formData.additional_categories || []}
                                onChange={(e) => {
                                    const options = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormData({ ...formData, additional_categories: options });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none h-24"
                            >
                                {CATEGORIES.map(cat => (
                                    cat.name !== formData.category &&
                                    <option key={cat.id} value={cat.name}>{cat.tr}</option>
                                ))}
                            </select>
                            <span className="text-[10px] text-gray-400 mt-1 block">Windows: Ctrl + Tık | Mac: Cmd + Tık</span>
                        </div>
                    </div>

                    {/* Section: Contact & Social */}
                    <div className="bg-pink-50/30 p-6 rounded-2xl border border-pink-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-xs font-bold">4</div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">İletişim & Sosyal Medya</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">E-posta</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Telefon</label>
                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Web Sitesi</label>
                                <input type="text" name="website" value={formData.website || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white font-mono text-xs" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Video URL (YouTube/Vimeo)</label>
                                <input type="text" name="video_url" value={formData.video_url || ''} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white font-mono text-xs" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Instagram</label>
                                <input type="text" name="instagram" value={formData.instagram || ''} onChange={handleChange} placeholder="@username" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white text-xs" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Facebook</label>
                                <input type="text" name="facebook" value={formData.facebook || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white text-xs" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-tight">Twitter / X</label>
                                <input type="text" name="twitter" value={formData.twitter || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white text-xs" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Content */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">5</div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">İçerik Yönetimi</h3>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-tight">İşletme Açıklaması</label>
                                <button
                                    onClick={handleAiGenerate}
                                    disabled={aiLoading}
                                    className="text-[10px] bg-purple-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-purple-700 transition-all shadow-sm"
                                >
                                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    AI İLE YAZ
                                </button>
                            </div>
                            <textarea
                                name="description"
                                rows={6}
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Section: Status */}
                    <div className="bg-gray-900 p-6 rounded-2xl text-white space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Üyelik & Sahiplik</h3>
                                <p className="text-xs text-gray-500 mt-1">İşletme kaydedilmeden önceki son ayar.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.is_claimed || false}
                                    onChange={(e) => setFormData({ ...formData, is_claimed: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[19px] after:w-[19px] after:transition-all peer-checked:bg-pink-600"></div>
                                <span className="ml-4 text-xs font-bold uppercase tracking-widest text-pink-500">
                                    {formData.is_claimed ? 'Gerçek Üye' : 'Lead (Aday)'}
                                </span>
                            </label>
                        </div>
                    </div>



                    {/* SEO Preview - Same as before but styled a bit nicer */}
                    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Google SEO Önizleme</h3>
                        </div>
                        <div className="font-sans">
                            <div className="text-[14px] text-gray-600 mb-1 truncate flex items-center gap-1">
                                <span>https://kolaydugun.de</span>
                                <span className="opacity-40">›</span>
                                <span className="text-gray-400">vendors</span>
                                <span className="opacity-40">›</span>
                                <span className="text-pink-500/60 font-medium">{formData.business_name?.toLowerCase().replace(/\s+/g, '-') || 'isletme'}</span>
                            </div>
                            <h3 className="text-[18px] text-[#1a0dab] font-medium hover:underline cursor-pointer mb-1 leading-tight">
                                {formData.business_name || 'İşletme Adı'} - {formData.category || 'Kategori'} {formData.city || ''}
                            </h3>
                            <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                                {formData.description || 'Google arama sonuçlarında kullanıcıların dikkatini çekmek için anahtar kelime odaklı bir açıklama yazın.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">v2.1 Admin Editor</span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 rounded-xl transition-all"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSaveAndApprove}
                            disabled={loading || aiLoading}
                            className="px-8 py-2 bg-green-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            KAYDET VE ONAYLA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorEditModal;
