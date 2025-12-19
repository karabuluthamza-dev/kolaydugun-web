import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './WeddingWebsiteSetup.css';

const WeddingWebsiteSetup = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('settings');
    const [guests, setGuests] = useState([]);
    const [loadingGuests, setLoadingGuests] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedSlug, setSavedSlug] = useState(''); // Track saved slug for preview button

    const [formData, setFormData] = useState({
        slug: '',
        cover_image_url: '',
        welcome_message: '',
        our_story: '',
        venue_name: '',
        venue_address: '',
        venue_map_url: '',
        gallery_url: '',
        wedding_date: '',
        is_public: false
    });

    useEffect(() => {
        if (user?.id) {
            fetchDetails();
        } else {
            const timer = setTimeout(() => {
                if (loading) {
                    setLoading(false);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user?.id]); // Only re-run if user ID changes

    useEffect(() => {
        if (user?.id && activeTab === 'guests') {
            fetchGuests();
        }
    }, [user?.id, activeTab]);

    const fetchGuests = async () => {
        setLoadingGuests(true);
        try {
            const { data: guestsData, error: guestsError } = await supabase
                .from('guests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (guestsError) throw guestsError;
            setGuests(guestsData || []);
        } catch (error) {
            console.error('Error fetching guests:', error);
        } finally {
            setLoadingGuests(false);
        }
    };

    const fetchDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('wedding_details')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setSavedSlug(data.slug || ''); // Set initial saved slug
                setFormData({
                    slug: data.slug || '',
                    cover_image_url: data.cover_image_url || '',
                    welcome_message: data.welcome_message || '',
                    our_story: data.our_story || '',
                    venue_name: data.venue_name || '',
                    venue_address: data.venue_address || '',
                    venue_map_url: data.venue_map_url || '',
                    gallery_url: data.gallery_url || '',
                    wedding_date: data.wedding_date || '',
                    is_public: data.is_public || false
                });
            }
        } catch (error) {
            console.error('Error fetching wedding details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        console.log('handleSave called');
        if (!user) {
            alert('❌ ' + (t('loginRequired') || 'Lütfen önce giriş yapın.'));
            return;
        }

        setSaving(true);

        try {
            const cleanSlug = formData.slug ? formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : '';

            // Fix wedding_date to include time to prevent timezone shift
            // If date already has T, keep it. If not, append T12:00:00
            const weddingDate = formData.wedding_date ?
                (formData.wedding_date.includes('T') ? formData.wedding_date : formData.wedding_date + 'T12:00:00')
                : null;

            console.log('🔍 DEBUG - Original date:', formData.wedding_date);
            console.log('🔍 DEBUG - Fixed date:', weddingDate);

            const updates = {
                ...formData,
                slug: cleanSlug,
                wedding_date: weddingDate
            };
            console.log('Updates to save:', updates);

            // Check if record exists first
            const { data: existingData, error: fetchError } = await supabase
                .from('wedding_details')
                .select('user_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            let data, error;

            if (existingData) {
                // Update existing
                console.log('Updating existing...');
                const result = await supabase
                    .from('wedding_details')
                    .update(updates)
                    .eq('user_id', user.id)
                    .select();
                data = result.data;
                error = result.error;
            } else {
                // Insert new
                console.log('Inserting new...');
                const result = await supabase
                    .from('wedding_details')
                    .insert([{ user_id: user.id, ...updates }])
                    .select();
                data = result.data;
                error = result.error;
            }

            if (error) {
                console.error('Supabase save error:', error);
                throw error;
            }

            console.log('Save successful, data:', data);
            alert('✅ ' + t('saved'));

            // Update local state with returned data
            if (data && data.length > 0) {
                const saved = data[0];
                setSavedSlug(saved.slug); // Update saved slug on success
                setFormData(prev => ({
                    ...prev,
                    slug: saved.slug,
                    gallery_url: saved.gallery_url,
                    cover_image_url: saved.cover_image_url,
                    welcome_message: saved.welcome_message,
                    our_story: saved.our_story,
                    venue_name: saved.venue_name,
                    venue_address: saved.venue_address,
                    venue_map_url: saved.venue_map_url,
                    wedding_date: saved.wedding_date,
                    is_public: saved.is_public
                }));
            } else if (cleanSlug) {
                setSavedSlug(cleanSlug); // Fallback update
                setFormData(prev => ({ ...prev, slug: cleanSlug }));
            }

        } catch (error) {
            console.error('❌ Error saving details:', error);
            alert('❌ Kayıt hatası: ' + (error.message || error.details || 'Bilinmeyen hata'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="section container website-setup-container">
            <div className="setup-header">
                <h1>{t('weddingWebsite.setupTitle')}</h1>
                <div className="header-actions">
                    {savedSlug && (
                        <a
                            href={`/w/${savedSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary preview-btn"
                        >
                            👁️ {t('weddingWebsite.preview')}
                        </a>
                    )}
                </div>
            </div>

            <div className="setup-tabs">
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ {t('weddingWebsite.settingsTab') || 'Ayarlar'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'guests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('guests')}
                >
                    👥 {t('weddingWebsite.guestsTab') || 'Davetli Listesi'}
                </button>
            </div>

            {activeTab === 'settings' ? (
                <div className="setup-card">
                    <div className="form-group">
                        <label>{t('weddingWebsite.slugLabel')}</label>
                        <div className="slug-input-wrapper">
                            <span className="slug-prefix">kolaydugun.de/w/</span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="ahmet-ayse"
                                className="form-control"
                            />
                        </div>
                        <small>{t('weddingWebsite.slugHint')}</small>
                    </div>

                    <div className="form-group">
                        <label>{t('weddingWebsite.dateLabel') || 'Düğün Tarihi'}</label>
                        <input
                            type="date"
                            name="wedding_date"
                            value={formData.wedding_date ? formData.wedding_date.split('T')[0] : ''}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('weddingWebsite.coverImageLabel')}</label>
                        <input
                            type="text"
                            name="cover_image_url"
                            value={formData.cover_image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="form-control"
                        />
                        {formData.cover_image_url && (
                            <img src={formData.cover_image_url} alt="Cover Preview" className="cover-preview" />
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('weddingWebsite.welcomeMessageLabel')}</label>
                        <input
                            type="text"
                            name="welcome_message"
                            value={formData.welcome_message}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('weddingWebsite.storyLabel')}</label>
                        <textarea
                            name="our_story"
                            value={formData.our_story}
                            onChange={handleChange}
                            rows="4"
                            className="form-control"
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 form-group">
                            <label>{t('weddingWebsite.venueNameLabel')}</label>
                            <input
                                type="text"
                                name="venue_name"
                                value={formData.venue_name}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-6 form-group">
                            <label>{t('weddingWebsite.venueMapLabel')}</label>
                            <input
                                type="text"
                                name="venue_map_url"
                                value={formData.venue_map_url}
                                onChange={handleChange}
                                placeholder="Google Maps URL"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('weddingWebsite.venueAddressLabel')}</label>
                        <textarea
                            name="venue_address"
                            value={formData.venue_address}
                            onChange={handleChange}
                            rows="2"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('weddingWebsite.galleryLabel')}</label>
                        <input
                            type="text"
                            name="gallery_url"
                            value={formData.gallery_url}
                            onChange={handleChange}
                            placeholder={t('weddingWebsite.galleryPlaceholder')}
                            className="form-control"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary save-btn"
                        >
                            {saving ? '...' : t('weddingWebsite.save')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="setup-card guest-list-card">
                    {loadingGuests ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        <>
                            <div className="guest-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{guests.length}</span>
                                    <span className="stat-label">{t('weddingWebsite.guestList.responses')}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">
                                        {guests.filter(g => g.status === 'confirmed').reduce((acc, curr) => acc + 1 + (curr.plus_ones || 0), 0)}
                                    </span>
                                    <span className="stat-label">{t('weddingWebsite.guestList.totalGuests')}</span>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table guest-table">
                                    <thead>
                                        <tr>
                                            <th>{t('weddingWebsite.guestList.name')}</th>
                                            <th>{t('weddingWebsite.guestList.status')}</th>
                                            <th>{t('weddingWebsite.guestList.guestCount')}</th>
                                            <th>{t('weddingWebsite.guestList.message')}</th>
                                            <th>{t('weddingWebsite.guestList.date')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {guests.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">{t('weddingWebsite.guestList.noResponses')}</td>
                                            </tr>
                                        ) : (
                                            guests.map(guest => (
                                                <tr key={guest.id}>
                                                    <td>{guest.name}</td>
                                                    <td>
                                                        <span className={`status-badge ${guest.status}`}>
                                                            {guest.status === 'confirmed' ? '✅ ' + t('weddingWebsite.guestList.attending') : '❌ ' + t('weddingWebsite.guestList.notAttending')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {guest.status === 'confirmed' ? (1 + (guest.plus_ones || 0)) : '-'}
                                                    </td>
                                                    <td className="guest-message">{guest.message || '-'}</td>
                                                    <td>{new Date(guest.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeddingWebsiteSetup;
