import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES, CITIES, getCategoryTranslationKey } from '../../constants/vendorData';

// We need a separate client to sign up a new user without logging out the admin
// Note: This requires the ANON key, which is public.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    }
});

const VendorCreateModal = ({ onClose, onSuccess }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        businessName: '',
        category: 'Wedding Venues',
        city: 'Berlin',
        price: '',
        capacity: 0,
        isClaimable: false // New: if true, no auth user is created
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let userId = null;

            if (!formData.isClaimable) {
                // 1. Create Auth User
                const { data: authData, error: authError } = await tempClient.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.businessName,
                            role: 'vendor'
                        }
                    }
                });

                if (authError) throw authError;
                if (!authData.user) throw new Error(t('admin.vendors.modal.errorUser'));

                userId = authData.user.id;

                // Wait for triggers
                await new Promise(r => setTimeout(r, 1000));
            } else {
                // For claimable vendors, generate a random ID
                userId = crypto.randomUUID();
            }

            // Check if vendor entry exists
            const { data: existingVendor } = await supabase
                .from('vendors')
                .select('id')
                .eq('id', userId)
                .single();

            if (!existingVendor) {
                // Insert new vendor
                const { error: vendorError } = await supabase
                    .from('vendors')
                    .insert([{
                        id: userId, // CRITICAL: Explicitly set the ID
                        business_name: formData.businessName,
                        user_id: formData.isClaimable ? null : userId,
                        category: formData.category,
                        city: formData.city,
                        price_range: formData.price,
                        capacity: parseInt(formData.capacity) || 0,
                        subscription_tier: 'free',
                        is_claimed: !formData.isClaimable
                    }]);

                if (vendorError) throw vendorError;
            } else {
                // Update existing vendor (if trigger created it empty)
                const { error: updateError } = await supabase
                    .from('vendors')
                    .update({
                        business_name: formData.businessName,
                        category: formData.category,
                        city: formData.city,
                        is_claimed: true,
                        price_range: formData.price,
                        capacity: parseInt(formData.capacity) || 0
                    })
                    .eq('id', userId);

                if (updateError) throw updateError;
            }

            if (userId) {
                // 3. Update Profile Role (just in case)
                await supabase
                    .from('profiles')
                    .update({ role: 'vendor' })
                    .eq('id', userId);
            }

            alert(t('admin.vendors.modal.success'));
            onSuccess();
            onClose();

        } catch (error) {
            console.error('Create error:', error);
            alert(t('admin.vendors.modal.error') + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{t('admin.vendors.modal.title')}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isClaimable"
                                checked={formData.isClaimable}
                                onChange={handleChange}
                            />
                            <strong>{t('admin.vendors.modal.isClaimable')}</strong>
                        </label>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                            {t('admin.vendors.modal.isClaimableDesc')}
                        </p>
                    </div>

                    {!formData.isClaimable && (
                        <>
                            <div className="form-group">
                                <label>{t('admin.vendors.modal.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('admin.vendors.modal.password')}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>{t('admin.vendors.modal.businessName')}</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('admin.vendors.modal.category')}</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {t('categories.' + getCategoryTranslationKey(cat))}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('admin.vendors.modal.city')}</label>
                        <select name="city" value={formData.city} onChange={handleChange}>
                            {CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('admin.vendors.modal.priceRange')}</label>
                        <select name="price" value={formData.price} onChange={handleChange} className="form-control">
                            <option value="">{t('admin.vendors.modal.select')}</option>
                            <option value="€">{t('filters.price_1')}</option>
                            <option value="€€">{t('filters.price_2')}</option>
                            <option value="€€€">{t('filters.price_3')}</option>
                            <option value="€€€€">{t('filters.price_4')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('admin.vendors.modal.capacity')}</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">{t('admin.vendors.modal.cancel')}</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? t('admin.vendors.modal.creating') : t('admin.vendors.modal.create')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default VendorCreateModal;
