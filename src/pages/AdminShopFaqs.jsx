import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopProducts.css';

const AdminShopFaqs = () => {
    const { language } = useLanguage();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);

    const [formData, setFormData] = useState({
        question_tr: '',
        question_de: '',
        question_en: '',
        answer_tr: '',
        answer_de: '',
        answer_en: '',
        category: 'general',
        display_order: 0,
        is_active: true
    });

    const categories = {
        general: { name: 'Genel', icon: '📋' },
        products: { name: 'Ürünler', icon: '📦' },
        profile: { name: 'Mağaza Profili', icon: '🏪' },
        categories: { name: 'Kategoriler', icon: '🏷️' },
        analytics: { name: 'İstatistikler', icon: '📊' },
        billing: { name: 'Ödeme', icon: '💳' },
        affiliate: { name: 'Affiliate', icon: '🔗' },
        account: { name: 'Hesap', icon: '👤' },
        support: { name: 'Destek', icon: '🆘' }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const { data, error } = await supabase
                .from('shop_faqs')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setFaqs(data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
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

            if (editingFaq) {
                const { error } = await supabase
                    .from('shop_faqs')
                    .update(payload)
                    .eq('id', editingFaq.id);
                if (error) throw error;
                alert('✅ SSS güncellendi!');
            } else {
                const { error } = await supabase
                    .from('shop_faqs')
                    .insert([payload]);
                if (error) throw error;
                alert('✅ SSS eklendi!');
            }

            setShowModal(false);
            resetForm();
            fetchFaqs();
        } catch (error) {
            console.error('Error saving FAQ:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setFormData({
            question_tr: faq.question_tr || '',
            question_de: faq.question_de || '',
            question_en: faq.question_en || '',
            answer_tr: faq.answer_tr || '',
            answer_de: faq.answer_de || '',
            answer_en: faq.answer_en || '',
            category: faq.category || 'general',
            display_order: faq.display_order || 0,
            is_active: faq.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu SSS\'yi silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('shop_faqs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            alert('✅ SSS silindi!');
            fetchFaqs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            alert('Hata: ' + error.message);
        }
    };

    const toggleActive = async (faq) => {
        try {
            const { error } = await supabase
                .from('shop_faqs')
                .update({ is_active: !faq.is_active })
                .eq('id', faq.id);
            if (error) throw error;
            fetchFaqs();
        } catch (error) {
            console.error('Error toggling FAQ:', error);
        }
    };

    const resetForm = () => {
        setEditingFaq(null);
        setFormData({
            question_tr: '',
            question_de: '',
            question_en: '',
            answer_tr: '',
            answer_de: '',
            answer_en: '',
            category: 'general',
            display_order: 0,
            is_active: true
        });
    };

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-products">
            <div className="admin-page-header">
                <div>
                    <h1>❓ SSS Yönetimi</h1>
                    <p>Tedarikçilerin göreceği sık sorulan soruları yönetin</p>
                </div>
                <div className="header-actions">
                    <span style={{
                        background: '#dbeafe',
                        color: '#2563eb',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }}>
                        📊 {faqs.length} SSS
                    </span>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        + Yeni SSS Ekle
                    </button>
                </div>
            </div>

            {/* Category Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(categories).map(([key, cat]) => {
                    const count = faqs.filter(f => f.category === key).length;
                    return (
                        <div key={key} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>{cat.icon}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{cat.name}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{count}</div>
                        </div>
                    );
                })}
            </div>

            {/* FAQs Table */}
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Sıra</th>
                            <th>Kategori</th>
                            <th>Soru</th>
                            <th>Diller</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-row">Henüz SSS eklenmemiş</td>
                            </tr>
                        ) : (
                            /* Group FAQs by category */
                            (() => {
                                const categoryOrder = ['general', 'products', 'profile', 'categories', 'analytics', 'billing', 'affiliate', 'account', 'support'];
                                const grouped = faqs.reduce((acc, faq) => {
                                    const cat = faq.category || 'general';
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(faq);
                                    return acc;
                                }, {});

                                const sortedCategories = Object.keys(grouped).sort((a, b) => {
                                    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
                                });

                                return sortedCategories.flatMap(category => {
                                    const cat = categories[category] || { name: category, icon: '❓' };
                                    return [
                                        <tr key={`header-${category}`} style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)' }}>
                                            <td colSpan="6" style={{
                                                color: 'white',
                                                fontWeight: '600',
                                                padding: '12px 16px',
                                                fontSize: '0.95rem'
                                            }}>
                                                {cat.icon} {cat.name}
                                                <span style={{
                                                    background: 'rgba(255,255,255,0.3)',
                                                    padding: '2px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    marginLeft: '10px'
                                                }}>
                                                    {grouped[category].length} soru
                                                </span>
                                            </td>
                                        </tr>,
                                        ...grouped[category].map(faq => (
                                            <tr key={faq.id}>
                                                <td>
                                                    <span style={{
                                                        background: '#f3f4f6',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {faq.display_order}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        background: '#e0f2fe',
                                                        color: '#0369a1',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {cat.icon} {cat.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="product-info">
                                                        <strong style={{ fontSize: '0.9rem' }}>{faq.question_tr}</strong>
                                                        <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                                            {faq.answer_tr?.substring(0, 80)}...
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <span style={{
                                                            background: faq.question_tr ? '#dcfce7' : '#fee2e2',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem'
                                                        }}>TR</span>
                                                        <span style={{
                                                            background: faq.question_de ? '#dcfce7' : '#fee2e2',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem'
                                                        }}>DE</span>
                                                        <span style={{
                                                            background: faq.question_en ? '#dcfce7' : '#fee2e2',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem'
                                                        }}>EN</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        background: faq.is_active ? '#dcfce7' : '#fee2e2',
                                                        color: faq.is_active ? '#16a34a' : '#dc2626',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {faq.is_active ? '✅ Aktif' : '⏸️ Pasif'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className={faq.is_active ? 'btn-warning' : 'btn-approve'}
                                                            onClick={() => toggleActive(faq)}
                                                            title={faq.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        >
                                                            {faq.is_active ? '⏸️' : '▶️'}
                                                        </button>
                                                        <button className="btn-edit" onClick={() => handleEdit(faq)} title="Düzenle">
                                                            ✏️
                                                        </button>
                                                        <button className="btn-delete" onClick={() => handleDelete(faq.id)} title="Sil">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ];
                                });
                            })()
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>{editingFaq ? '✏️ SSS Düzenle' : '➕ Yeni SSS Ekle'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Category & Order */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {Object.entries(categories).map(([key, cat]) => (
                                            <option key={key} value={key}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Questions */}
                            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#374151' }}>❓ Soru</h4>
                            <div className="form-group">
                                <label>🇹🇷 Türkçe *</label>
                                <input
                                    type="text"
                                    value={formData.question_tr}
                                    onChange={(e) => setFormData({ ...formData, question_tr: e.target.value })}
                                    required
                                    placeholder="Nasıl ürün eklerim?"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>🇩🇪 Almanca</label>
                                    <input
                                        type="text"
                                        value={formData.question_de}
                                        onChange={(e) => setFormData({ ...formData, question_de: e.target.value })}
                                        placeholder="Wie füge ich ein Produkt hinzu?"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🇬🇧 İngilizce</label>
                                    <input
                                        type="text"
                                        value={formData.question_en}
                                        onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                                        placeholder="How do I add a product?"
                                    />
                                </div>
                            </div>

                            {/* Answers */}
                            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#374151' }}>💬 Cevap (Markdown destekli)</h4>
                            <div className="form-group">
                                <label>🇹🇷 Türkçe *</label>
                                <textarea
                                    value={formData.answer_tr}
                                    onChange={(e) => setFormData({ ...formData, answer_tr: e.target.value })}
                                    rows={4}
                                    required
                                    placeholder="**Ürünlerim** menüsüne gidin..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>🇩🇪 Almanca</label>
                                    <textarea
                                        value={formData.answer_de}
                                        onChange={(e) => setFormData({ ...formData, answer_de: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🇬🇧 İngilizce</label>
                                    <textarea
                                        value={formData.answer_en}
                                        onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Aktif (Tedarikçiler görebilir)
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn-primary">{editingFaq ? 'Güncelle' : 'Ekle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopFaqs;
