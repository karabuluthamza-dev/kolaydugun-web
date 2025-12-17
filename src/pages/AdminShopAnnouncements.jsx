import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopProducts.css';

const AdminShopAnnouncements = () => {
    const { language } = useLanguage();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const [formData, setFormData] = useState({
        title_tr: '',
        title_de: '',
        title_en: '',
        content_tr: '',
        content_de: '',
        content_en: '',
        type: 'info',
        target_plans: ['starter', 'business', 'premium'],
        is_active: true,
        is_pinned: false
    });

    const types = {
        info: { name: 'Bilgi', icon: 'ℹ️', color: '#3b82f6' },
        warning: { name: 'Uyarı', icon: '⚠️', color: '#f59e0b' },
        new_feature: { name: 'Yeni Özellik', icon: '🎉', color: '#10b981' },
        update: { name: 'Güncelleme', icon: '🔄', color: '#8b5cf6' },
        important: { name: 'Önemli', icon: '🚨', color: '#ef4444' }
    };

    const plans = ['starter', 'business', 'premium'];

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from('shop_announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                updated_at: new Date().toISOString()
            };

            if (editingAnnouncement) {
                const { error } = await supabase
                    .from('shop_announcements')
                    .update(payload)
                    .eq('id', editingAnnouncement.id);
                if (error) throw error;
                alert('✅ Duyuru güncellendi!');
            } else {
                const { error } = await supabase
                    .from('shop_announcements')
                    .insert([payload]);
                if (error) throw error;
                alert('✅ Duyuru gönderildi!');
            }

            setShowModal(false);
            resetForm();
            fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title_tr: announcement.title_tr || '',
            title_de: announcement.title_de || '',
            title_en: announcement.title_en || '',
            content_tr: announcement.content_tr || '',
            content_de: announcement.content_de || '',
            content_en: announcement.content_en || '',
            type: announcement.type || 'info',
            target_plans: announcement.target_plans || ['starter', 'business', 'premium'],
            is_active: announcement.is_active,
            is_pinned: announcement.is_pinned || false
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('shop_announcements')
                .delete()
                .eq('id', id);
            if (error) throw error;
            alert('✅ Duyuru silindi!');
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Hata: ' + error.message);
        }
    };

    const toggleActive = async (announcement) => {
        try {
            const { error } = await supabase
                .from('shop_announcements')
                .update({ is_active: !announcement.is_active })
                .eq('id', announcement.id);
            if (error) throw error;
            fetchAnnouncements();
        } catch (error) {
            console.error('Error toggling announcement:', error);
        }
    };

    const togglePlan = (plan) => {
        const current = formData.target_plans || [];
        if (current.includes(plan)) {
            setFormData({ ...formData, target_plans: current.filter(p => p !== plan) });
        } else {
            setFormData({ ...formData, target_plans: [...current, plan] });
        }
    };

    const resetForm = () => {
        setEditingAnnouncement(null);
        setFormData({
            title_tr: '',
            title_de: '',
            title_en: '',
            content_tr: '',
            content_de: '',
            content_en: '',
            type: 'info',
            target_plans: ['starter', 'business', 'premium'],
            is_active: true,
            is_pinned: false
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-products">
            <div className="admin-page-header">
                <div>
                    <h1>📢 Tedarikçi Duyuruları</h1>
                    <p>Tüm mağaza sahiplerine bildirim gönderin</p>
                </div>
                <div className="header-actions">
                    <span style={{
                        background: '#dbeafe',
                        color: '#2563eb',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }}>
                        📊 {announcements.length} Duyuru
                    </span>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        + Yeni Duyuru
                    </button>
                </div>
            </div>

            {/* Type Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(types).map(([key, type]) => {
                    const count = announcements.filter(a => a.type === key).length;
                    return (
                        <div key={key} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${type.color}`
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>{type.icon}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{type.name}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: type.color }}>{count}</div>
                        </div>
                    );
                })}
            </div>

            {/* Announcements Table */}
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Tip</th>
                            <th>Başlık</th>
                            <th>Hedef Planlar</th>
                            <th>Tarih</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-row">Henüz duyuru eklenmemiş</td>
                            </tr>
                        ) : (
                            announcements.map(ann => (
                                <tr key={ann.id}>
                                    <td>
                                        <span style={{
                                            background: `${types[ann.type]?.color}20`,
                                            color: types[ann.type]?.color,
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {types[ann.type]?.icon} {types[ann.type]?.name}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="product-info">
                                            <strong style={{ fontSize: '0.9rem' }}>
                                                {ann.is_pinned && '📌 '}{ann.title_tr}
                                            </strong>
                                            <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                                {ann.content_tr?.substring(0, 60)}...
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {ann.target_plans?.map(plan => (
                                                <span key={plan} style={{
                                                    background: plan === 'starter' ? '#dcfce7' : plan === 'business' ? '#dbeafe' : '#f3e8ff',
                                                    color: plan === 'starter' ? '#16a34a' : plan === 'business' ? '#2563eb' : '#7c3aed',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {plan}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        {formatDate(ann.created_at)}
                                    </td>
                                    <td>
                                        <span style={{
                                            background: ann.is_active ? '#dcfce7' : '#fee2e2',
                                            color: ann.is_active ? '#16a34a' : '#dc2626',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {ann.is_active ? '✅ Aktif' : '⏸️ Pasif'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className={ann.is_active ? 'btn-warning' : 'btn-approve'}
                                                onClick={() => toggleActive(ann)}
                                                title={ann.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                            >
                                                {ann.is_active ? '⏸️' : '▶️'}
                                            </button>
                                            <button className="btn-edit" onClick={() => handleEdit(ann)} title="Düzenle">
                                                ✏️
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(ann.id)} title="Sil">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>{editingAnnouncement ? '✏️ Duyuru Düzenle' : '📢 Yeni Duyuru Gönder'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Type & Plans */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duyuru Tipi</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {Object.entries(types).map(([key, type]) => (
                                            <option key={key} value={key}>{type.icon} {type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hedef Planlar</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {plans.map(plan => (
                                            <label key={plan} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: formData.target_plans?.includes(plan) ? '#dbeafe' : '#f9fafb',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: formData.target_plans?.includes(plan) ? '2px solid #3b82f6' : '2px solid transparent'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.target_plans?.includes(plan)}
                                                    onChange={() => togglePlan(plan)}
                                                    style={{ display: 'none' }}
                                                />
                                                <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{plan}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Titles */}
                            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#374151' }}>📝 Başlık</h4>
                            <div className="form-group">
                                <label>🇹🇷 Türkçe *</label>
                                <input
                                    type="text"
                                    value={formData.title_tr}
                                    onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
                                    required
                                    placeholder="🎉 Yeni özellik: İstatistikler artık aktif!"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>🇩🇪 Almanca</label>
                                    <input
                                        type="text"
                                        value={formData.title_de}
                                        onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                                        placeholder="🎉 Neue Funktion: Statistiken sind jetzt aktiv!"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🇬🇧 İngilizce</label>
                                    <input
                                        type="text"
                                        value={formData.title_en}
                                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                        placeholder="🎉 New feature: Analytics are now active!"
                                    />
                                </div>
                            </div>

                            {/* Contents */}
                            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#374151' }}>💬 İçerik</h4>
                            <div className="form-group">
                                <label>🇹🇷 Türkçe *</label>
                                <textarea
                                    value={formData.content_tr}
                                    onChange={(e) => setFormData({ ...formData, content_tr: e.target.value })}
                                    rows={4}
                                    required
                                    placeholder="Artık mağazanızın istatistiklerini takip edebilirsiniz..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>🇩🇪 Almanca</label>
                                    <textarea
                                        value={formData.content_de}
                                        onChange={(e) => setFormData({ ...formData, content_de: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🇬🇧 İngilizce</label>
                                    <textarea
                                        value={formData.content_en}
                                        onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="form-row" style={{ marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            style={{ marginRight: '8px' }}
                                        />
                                        Aktif (Hemen yayınla)
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_pinned}
                                            onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                            style={{ marginRight: '8px' }}
                                        />
                                        📌 Sabitle (Üstte göster)
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn-primary">{editingAnnouncement ? 'Güncelle' : 'Gönder'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopAnnouncements;
