import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, COUNTRIES, STATES, CITIES_BY_STATE, getCategoryTranslationKey } from '../constants/vendorData';
import { dictionary } from '../locales/dictionary';
import './AdminNotifications.css';

const AdminNotifications = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'announcement',
        target_type: 'all',
        target_category: '',
        target_country: 'DE',
        target_state: '',
        target_city: '',
        send_email: false
    });

    const [preview, setPreview] = useState({
        recipientCount: 0,
        recipients: []
    });

    useEffect(() => {
        calculateRecipients();
    }, [formData.target_type, formData.target_category, formData.target_country, formData.target_state, formData.target_city]);

    const calculateRecipients = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Use Edge Function to get counts (bypasses RLS)
            const { data, error } = await supabase.functions.invoke('get_audience_count', {
                body: {
                    target_type: formData.target_type,
                    target_category: formData.target_category,
                    target_country: formData.target_country,
                    target_state: formData.target_state,
                    target_city: formData.target_city
                }
            });

            if (error) throw error;

            setPreview({ recipientCount: data.count || 0, recipients: [] });
        } catch (error) {
            console.error('Error calculating recipients:', error);
            setPreview({ recipientCount: 0, recipients: [] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create_notification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('✅ Bildirim başarıyla gönderildi!');
                setFormData({
                    title: '',
                    message: '',
                    type: 'announcement',
                    target_type: 'all',
                    target_category: '',
                    target_country: 'DE',
                    target_state: '',
                    target_city: '',
                    send_email: false
                });
            } else {
                alert('❌ Hata: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('❌ Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-notifications-container">
            <div className="admin-notifications-header">
                <h1>📢 Bildirim Gönder</h1>
                <p>Kullanıcılara duyuru, kampanya veya sistem bildirimi gönderin</p>
            </div>

            <form onSubmit={handleSubmit} className="notification-form">
                <div className="form-section">
                    <h3>📝 Bildirim İçeriği</h3>

                    <div className="form-group">
                        <label>Başlık *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Yeni Kampanya!"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mesaj *</label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Bildirim mesajınızı yazın..."
                            rows="5"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Bildirim Türü</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="announcement">📢 Duyuru</option>
                            <option value="campaign">🎉 Kampanya</option>
                            <option value="system">🔔 Sistem Bildirimi</option>
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h3>🎯 Hedef Kitle</h3>

                    <div className="form-group">
                        <label>Kime Gönderilsin?</label>
                        <select
                            value={formData.target_type}
                            onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                        >
                            <option value="all">👥 Tüm Kullanıcılar</option>
                            <option value="couples">💑 Sadece Çiftler</option>
                            <option value="vendors">🏢 Sadece Tedarikçiler</option>
                            <option value="category">📂 Kategoriye Göre</option>
                            <option value="city">📍 Lokasyona Göre (Ülke/Eyalet/Şehir)</option>
                        </select>
                    </div>

                    {formData.target_type === 'category' && (
                        <div className="form-group">
                            <label>Kategori Seçin</label>
                            <select
                                value={formData.target_category}
                                onChange={(e) => setFormData({ ...formData, target_category: e.target.value })}
                            >
                                <option value="">Kategori seçin...</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {t('categories.' + getCategoryTranslationKey(cat))}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.target_type === 'city' && (
                        <>
                            <div className="form-group">
                                <label>Ülke Seçin</label>
                                <select
                                    value={formData.target_country}
                                    onChange={(e) => setFormData({ ...formData, target_country: e.target.value, target_state: '', target_city: '' })}
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c[language] || c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Eyalet Seçin</label>
                                <select
                                    value={formData.target_state}
                                    onChange={(e) => setFormData({ ...formData, target_state: e.target.value, target_city: '' })}
                                >
                                    <option value="">Tüm Eyaletler</option>
                                    {(STATES[formData.target_country] || []).map(s => (
                                        <option key={s.id} value={s.id}>
                                            {dictionary.locations.states[s.id]?.[language] || s[language] || s.en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Şehir Seçin</label>
                                <select
                                    value={formData.target_city}
                                    onChange={(e) => setFormData({ ...formData, target_city: e.target.value })}
                                >
                                    <option value="">Tüm Şehirler</option>
                                    {(CITIES_BY_STATE[formData.target_state] || []).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="recipient-preview">
                        <strong>📊 Gönderilecek Kişi Sayısı:</strong>
                        <span className="count-badge">{preview.recipientCount}</span>
                    </div>
                </div>

                <div className="form-section">
                    <h3>📧 Email Ayarları</h3>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.send_email}
                                onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                            />
                            <span>Email olarak da gönder</span>
                        </label>
                        <small>⚠️ Email servisi limitli olduğu için dikkatli kullanın</small>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '⏳ Gönderiliyor...' : '📤 Bildirimi Gönder'}
                    </button>
                </div>
            </form>


        </div>
    );
};

export default AdminNotifications;
