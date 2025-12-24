import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminConfig.css';

const AdminPopularCities = () => {
    const { t } = useLanguage();
    usePageTitle('Popular Cities Management');

    const [popularCities, setPopularCities] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch popular cities
            const { data: popular, error: popularError } = await supabase
                .from('admin_popular_cities')
                .select('*')
                .order('display_order', { ascending: true });

            if (popularError) throw popularError;

            // Fetch all cities for dropdown
            const { data: cities, error: citiesError } = await supabase
                .from('admin_cities')
                .select('name, country_code, state_id')
                .eq('is_active', true)
                .order('name');

            if (citiesError) throw citiesError;

            setPopularCities(popular || []);
            setAllCities(cities || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Veri yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCity = async () => {
        if (!newCityName.trim()) {
            alert('Lütfen bir şehir seçin!');
            return;
        }

        try {
            setSaving(true);

            // Check if already exists
            const exists = popularCities.some(c => c.city_name === newCityName);
            if (exists) {
                alert('Bu şehir zaten popüler listede!');
                return;
            }

            // Get max display_order
            const maxOrder = popularCities.length > 0
                ? Math.max(...popularCities.map(c => c.display_order || 0))
                : 0;

            const { error } = await supabase
                .from('admin_popular_cities')
                .insert({
                    city_name: newCityName,
                    display_order: maxOrder + 1,
                    is_active: true
                });

            if (error) throw error;

            setNewCityName('');
            await fetchData();
            alert('Şehir başarıyla eklendi!');
        } catch (error) {
            console.error('Error adding city:', error);
            alert('Şehir eklenirken hata oluştu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveCity = async (id, cityName) => {
        if (!confirm(`"${cityName}" şehrini popüler listeden çıkarmak istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            setSaving(true);
            const { error } = await supabase
                .from('admin_popular_cities')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await fetchData();
            alert('Şehir başarıyla kaldırıldı!');
        } catch (error) {
            console.error('Error removing city:', error);
            alert('Şehir kaldırılırken hata oluştu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('admin_popular_cities')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            await fetchData();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Durum değiştirilirken hata oluştu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleMoveUp = async (index) => {
        if (index === 0) return;

        try {
            setSaving(true);
            const current = popularCities[index];
            const previous = popularCities[index - 1];

            // Use RPC function to swap atomically
            const { error } = await supabase.rpc('swap_popular_cities_order', {
                city_id_1: current.id,
                city_id_2: previous.id
            });

            if (error) throw error;

            await fetchData();

            // Success feedback
            const toast = document.createElement('div');
            toast.textContent = `✅ ${current.city_name} yukarı taşındı!`;
            toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:9999;animation:slideIn 0.3s ease';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        } catch (error) {
            console.error('Error moving city:', error);
            alert('Sıralama değiştirilirken hata oluştu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleMoveDown = async (index) => {
        if (index === popularCities.length - 1) return;

        try {
            setSaving(true);
            const current = popularCities[index];
            const next = popularCities[index + 1];

            // Use RPC function to swap atomically
            const { error } = await supabase.rpc('swap_popular_cities_order', {
                city_id_1: current.id,
                city_id_2: next.id
            });

            if (error) throw error;

            await fetchData();

            // Success feedback
            const toast = document.createElement('div');
            toast.textContent = `✅ ${current.city_name} aşağı taşındı!`;
            toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:9999;animation:slideIn 0.3s ease';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        } catch (error) {
            console.error('Error moving city:', error);
            alert('Sıralama değiştirilirken hata oluştu: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredCities = allCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <h1>⭐ Popüler Şehirler Yönetimi</h1>
                <p>Ana sayfadaki şehir dropdown'ında görünecek popüler şehirleri buradan yönetebilirsiniz.</p>
            </div>

            {/* Add New City */}
            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <h3>Yeni Popüler Şehir Ekle</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Şehir Seç</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Şehir ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginBottom: '5px' }}
                        />
                        <select
                            className="form-control"
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                            disabled={saving}
                        >
                            <option value="">-- Şehir Seçin --</option>
                            {filteredCities.map((city, idx) => (
                                <option key={idx} value={city.name}>
                                    {city.name} ({city.country_code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleAddCity}
                        disabled={saving || !newCityName}
                        style={{ height: 'fit-content' }}
                    >
                        {saving ? 'Ekleniyor...' : '+ Ekle'}
                    </button>
                </div>
            </div>

            {/* Popular Cities List */}
            <div className="admin-card">
                <h3>Popüler Şehirler Listesi ({popularCities.length})</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Bu sıralama ana sayfadaki dropdown'da aynen görünecektir.
                </p>

                {popularCities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                        Henüz popüler şehir eklenmemiş.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {popularCities.map((city, index) => (
                            <div
                                key={city.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    padding: '15px',
                                    background: city.is_active ? '#f9f9f9' : '#f0f0f0',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    opacity: city.is_active ? 1 : 0.6
                                }}
                            >
                                {/* Order Number */}
                                <div style={{
                                    minWidth: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: city.is_active ? '#3b82f6' : '#9ca3af',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem'
                                }}>
                                    {index + 1}
                                </div>

                                {/* City Name */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                        {city.city_name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        Sıra: {city.display_order} • {city.is_active ? '✅ Aktif' : '❌ Pasif'}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Move Up */}
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0 || saving}
                                        title="Yukarı Taşı"
                                    >
                                        ↑
                                    </button>

                                    {/* Move Down */}
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === popularCities.length - 1 || saving}
                                        title="Aşağı Taşı"
                                    >
                                        ↓
                                    </button>

                                    {/* Toggle Active */}
                                    <button
                                        className={`btn btn-sm ${city.is_active ? 'btn-warning' : 'btn-success'}`}
                                        onClick={() => handleToggleActive(city.id, city.is_active)}
                                        disabled={saving}
                                        title={city.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                    >
                                        {city.is_active ? '👁️' : '🚫'}
                                    </button>

                                    {/* Remove */}
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRemoveCity(city.id, city.city_name)}
                                        disabled={saving}
                                        title="Kaldır"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview */}
            <div className="admin-card" style={{ marginTop: '2rem' }}>
                <h3>📱 Önizleme</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Ana sayfadaki dropdown'da şu şekilde görünecek:
                </p>
                <div style={{
                    background: '#1a1a2e',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '400px'
                }}>
                    <select
                        className="form-control"
                        style={{
                            background: 'white',
                            border: '2px solid #e0e0e0',
                            padding: '10px',
                            fontSize: '1rem'
                        }}
                        disabled
                    >
                        <option>Şehir Seçin</option>
                        {popularCities
                            .filter(c => c.is_active)
                            .map((city, idx) => (
                                <option key={idx}>{city.city_name}</option>
                            ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AdminPopularCities;
