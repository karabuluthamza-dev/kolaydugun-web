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

const VendorCreateModal = ({ onClose, onCreated }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        businessName: '',
        category: 'Wedding Venues',
        city: 'Berlin',
        price: '',
        capacity: 0
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
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
            if (!authData.user) throw new Error('Kullanıcı oluşturulamadı.');

            const userId = authData.user.id;

            // 2. Create Vendor Profile (in 'vendors' table)
            // First, let's wait a bit for any triggers to fire (if any).
            await new Promise(r => setTimeout(r, 1000));

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
                        id: userId,
                        user_id: userId,
                        business_name: formData.businessName,
                        category: formData.category,
                        city: formData.city,
                        price_range: formData.price,
                        capacity: parseInt(formData.capacity) || 0,
                        subscription_tier: 'free', // Default to free
                        is_claimed: true // Admin created, so it's claimed/verified
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

            // 3. Update Profile Role (just in case)
            await supabase
                .from('profiles')
                .update({ role: 'vendor' })
                .eq('id', userId);

            alert('✅ Tedarikçi başarıyla oluşturuldu!');
            onCreated();
            onClose();

        } catch (error) {
            console.error('Create error:', error);
            alert('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Yeni Tedarikçi Ekle</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>E-posta</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>İşletme Adı</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Kategori</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {t('categories.' + getCategoryTranslationKey(cat))}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Şehir</label>
                        <select name="city" value={formData.city} onChange={handleChange}>
                            {CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fiyat Aralığı</label>
                        <select name="price" value={formData.price} onChange={handleChange} className="form-control">
                            <option value="">Seçiniz</option>
                            <option value="€">{t('filters.price_1')}</option>
                            <option value="€€">{t('filters.price_2')}</option>
                            <option value="€€€">{t('filters.price_3')}</option>
                            <option value="€€€€">{t('filters.price_4')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Kapasite</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">İptal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default VendorCreateModal;
