import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { getCategoryTranslationKey } from '../constants/vendorData';
import { adminNotifications } from '../utils/adminNotifications';
import './LeadForm.css';

const LeadForm = () => {
    const { t } = useLanguage();
    usePageTitle(t('leadForm.title'));
    const { user } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '',
        city_id: '',
        event_date: '',
        budget_min: '',
        budget_max: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        additional_notes: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchCities();
    }, []);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (!error && data) {
            setCategories(data);
        }
    };

    const fetchCities = async () => {
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .order('name');

        if (!error && data) {
            setCities(data);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create a clean copy of formData excluding internal fields like _error
            const { _error, ...cleanFormData } = formData;

            const leadData = {
                ...cleanFormData,
                user_id: user?.id || null,
                budget_min: parseFloat(formData.budget_min) || 0,
                budget_max: parseFloat(formData.budget_max) || 0,
                status: 'new' // Add status field
            };

            console.log('Submitting lead data:', leadData); // Debug log

            const { data, error } = await supabase
                .from('leads')
                .insert([leadData])
                .select();

            if (error) {
                console.error('Lead insertion error:', error);
                throw error;
            }

            console.log('Lead created successfully:', data); // Debug log

            // Send email notification
            try {
                await supabase.functions.invoke('send-email', {
                    body: {
                        to: 'karabuluthamza@gmail.com', // For testing, send to admin/developer
                        subject: `Yeni Talep: ${t('categories.' + getCategoryTranslationKey(categories.find(c => c.id === formData.category_id)?.name))}`,
                        html: `
                            <h1>Yeni Müşteri Talebi</h1>
                            <p><strong>İsim:</strong> ${formData.contact_name}</p>
                            <p><strong>Email:</strong> ${formData.contact_email}</p>
                            <p><strong>Telefon:</strong> ${formData.contact_phone}</p>
                            <p><strong>Kategori:</strong> ${t('categories.' + getCategoryTranslationKey(categories.find(c => c.id === formData.category_id)?.name))}</p>
                            <p><strong>Şehir:</strong> ${cities.find(c => c.id === formData.city_id)?.name}</p>
                            <p><strong>Tarih:</strong> ${formData.event_date}</p>
                            <p><strong>Bütçe:</strong> ${formData.budget_min} - ${formData.budget_max}</p>
                            <p><strong>Notlar:</strong> ${formData.additional_notes}</p>
                        `
                    }
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't block success flow if email fails
            }

            // Send admin panel notification
            try {
                await adminNotifications.newLead({
                    contact_name: formData.contact_name,
                    contact_email: formData.contact_email
                });
            } catch (notifError) {
                console.error('Admin notification failed:', notifError);
            }

            // Show success message
            setSuccess(true);

            // Reset form
            setFormData({
                category_id: '',
                city_id: '',
                event_date: '',
                budget_min: '',
                budget_max: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                additional_notes: ''
            });

            // Hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error('Lead oluşturma hatası:', error);
            // Show error in UI instead of alert
            setSuccess(false);
            const errorMsg = error.message || 'Bir hata oluştu';
            // Set a temporary error state to display to the user
            setFormData(prev => ({ ...prev, _error: errorMsg }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section container lead-form-container">
            <div className="lead-form-header">
                <h1>{t('leadForm.title')}</h1>
                <p>{t('leadForm.subtitle')}</p>
            </div>

            <form className="lead-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category_id">{t('leadForm.category')} *</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">{t('leadForm.selectCategory')}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {t('categories.' + getCategoryTranslationKey(cat.name))}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="city_id">{t('leadForm.city')} *</label>
                        <select
                            id="city_id"
                            name="city_id"
                            value={formData.city_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">{t('leadForm.selectCity')}</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="event_date">{t('leadForm.date')} *</label>
                        <input
                            type="date"
                            id="event_date"
                            name="event_date"
                            value={formData.event_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="budget_min">{t('leadForm.budget')} *</label>
                        <div className="budget-range">
                            <input
                                type="number"
                                id="budget_min"
                                name="budget_min"
                                placeholder="Min"
                                value={formData.budget_min}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                id="budget_max"
                                name="budget_max"
                                placeholder="Max"
                                value={formData.budget_max}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contact_name">{t('leadForm.name')} *</label>
                        <input
                            type="text"
                            id="contact_name"
                            name="contact_name"
                            value={formData.contact_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact_email">{t('leadForm.email')} *</label>
                        <input
                            type="email"
                            id="contact_email"
                            name="contact_email"
                            value={formData.contact_email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="contact_phone">{t('leadForm.phone')} *</label>
                    <input
                        type="tel"
                        id="contact_phone"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="additional_notes">{t('leadForm.notes')}</label>
                    <textarea
                        id="additional_notes"
                        name="additional_notes"
                        value={formData.additional_notes}
                        onChange={handleChange}
                        rows="4"
                        placeholder={t('leadForm.notesPlaceholder')}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={loading}
                >
                    {loading ? t('leadForm.submitting') : t('leadForm.submit')}
                </button>

                {success && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '8px',
                        color: '#155724',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        ✅ {t('leadForm.success') || 'Talebiniz başarıyla gönderildi! En kısa sürede size dönüş yapılacaktır.'}
                    </div>
                )}
            </form>
        </div>
    );
};

export default LeadForm;
