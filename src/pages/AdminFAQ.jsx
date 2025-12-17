import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminFAQ.css';

const AdminFAQ = () => {
    usePageTitle('FAQ Yönetimi');

    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [editingFaq, setEditingFaq] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        category: 'general',
        question_tr: '',
        question_en: '',
        question_de: '',
        answer_tr: '',
        answer_en: '',
        answer_de: '',
        display_order: 0,
        is_active: true
    });

    const categories = [
        { value: 'all', label: 'Tümü', icon: '📋' },
        { value: 'general', label: 'Genel', icon: '❓' },
        { value: 'couples', label: 'Çiftler', icon: '👰' },
        { value: 'vendors', label: 'Tedarikçiler', icon: '🏢' },
        { value: 'payment', label: 'Ödeme', icon: '💳' },
        { value: 'technical', label: 'Teknik', icon: '🔧' }
    ];

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_faqs')
                .select('*')
                .order('category', { ascending: true })
                .order('display_order', { ascending: true });

            if (error) throw error;
            setFaqs(data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            alert('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFaq) {
                const { error } = await supabase
                    .from('site_faqs')
                    .update(formData)
                    .eq('id', editingFaq.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('site_faqs')
                    .insert([formData]);
                if (error) throw error;
            }
            closeModal();
            fetchFAQs();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setFormData({
            category: faq.category,
            question_tr: faq.question_tr || '',
            question_en: faq.question_en || '',
            question_de: faq.question_de || '',
            answer_tr: faq.answer_tr || '',
            answer_en: faq.answer_en || '',
            answer_de: faq.answer_de || '',
            display_order: faq.display_order || 0,
            is_active: faq.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu FAQ\'yi silmek istediğinizden emin misiniz?')) return;
        try {
            const { error } = await supabase.from('site_faqs').delete().eq('id', id);
            if (error) throw error;
            fetchFAQs();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const toggleActive = async (faq) => {
        try {
            await supabase.from('site_faqs').update({ is_active: !faq.is_active }).eq('id', faq.id);
            fetchFAQs();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingFaq(null);
        setFormData({
            category: 'general',
            question_tr: '', question_en: '', question_de: '',
            answer_tr: '', answer_en: '', answer_de: '',
            display_order: 0, is_active: true
        });
    };

    // Filter FAQs
    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            faq.question_tr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.question_en?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryStats = (catValue) => {
        if (catValue === 'all') return faqs.length;
        return faqs.filter(f => f.category === catValue).length;
    };

    if (loading) {
        return <div className="admin-faq-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-faq-simple">
            {/* Header */}
            <div className="afaq-header">
                <div>
                    <h1>📋 FAQ Yönetimi</h1>
                    <p>{faqs.length} soru</p>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    ➕ Yeni Ekle
                </button>
            </div>

            {/* Search & Filters */}
            <div className="afaq-toolbar">
                <input
                    type="text"
                    placeholder="🔍 Soru ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="afaq-search"
                />
                <div className="afaq-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`afaq-tab ${selectedCategory === cat.value ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            {cat.icon} {cat.label}
                            <span className="tab-count">{getCategoryStats(cat.value)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ List - Accordion Style */}
            <div className="afaq-list">
                {filteredFaqs.length === 0 ? (
                    <div className="afaq-empty">Sonuç bulunamadı</div>
                ) : (
                    filteredFaqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className={`afaq-item ${!faq.is_active ? 'inactive' : ''} ${expandedId === faq.id ? 'expanded' : ''}`}
                        >
                            {/* Question Row - Click to expand */}
                            <div
                                className="afaq-question-row"
                                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                            >
                                <span className="afaq-order">{index + 1}</span>
                                <span className="afaq-cat-icon">{categories.find(c => c.value === faq.category)?.icon}</span>
                                <span className="afaq-question">{faq.question_tr}</span>
                                <div className="afaq-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className={`afaq-btn-toggle ${faq.is_active ? 'on' : 'off'}`}
                                        onClick={() => toggleActive(faq)}
                                        title={faq.is_active ? 'Aktif' : 'Pasif'}
                                    >
                                        {faq.is_active ? '✅' : '⬜'}
                                    </button>
                                    <button className="afaq-btn-edit" onClick={() => handleEdit(faq)}>✏️</button>
                                    <button className="afaq-btn-delete" onClick={() => handleDelete(faq.id)}>🗑️</button>
                                </div>
                                <span className="afaq-expand-icon">{expandedId === faq.id ? '▲' : '▼'}</span>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === faq.id && (
                                <div className="afaq-expanded">
                                    <div className="afaq-langs">
                                        <div className="afaq-lang-block">
                                            <strong>🇹🇷 TR</strong>
                                            <p className="afaq-q">{faq.question_tr}</p>
                                            <p className="afaq-a">{faq.answer_tr}</p>
                                        </div>
                                        <div className="afaq-lang-block">
                                            <strong>🇩🇪 DE</strong>
                                            <p className="afaq-q">{faq.question_de}</p>
                                            <p className="afaq-a">{faq.answer_de}</p>
                                        </div>
                                        <div className="afaq-lang-block">
                                            <strong>🇬🇧 EN</strong>
                                            <p className="afaq-q">{faq.question_en}</p>
                                            <p className="afaq-a">{faq.answer_en}</p>
                                        </div>
                                    </div>
                                    <div className="afaq-meta">
                                        <span>Sıra: {faq.display_order}</span>
                                        <span>Kategori: {categories.find(c => c.value === faq.category)?.label}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="afaq-modal-overlay" onClick={closeModal}>
                    <div className="afaq-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="afaq-modal-header">
                            <h2>{editingFaq ? '✏️ FAQ Düzenle' : '➕ Yeni FAQ'}</h2>
                            <button onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="afaq-form">
                            <div className="afaq-form-top">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.filter(c => c.value !== 'all').map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    placeholder="Sıra"
                                    style={{ width: '80px' }}
                                />
                                <label className="afaq-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    Aktif
                                </label>
                            </div>

                            {/* Language Tabs in Modal */}
                            <div className="afaq-lang-forms">
                                <div className="afaq-lang-form">
                                    <h4>🇹🇷 Türkçe</h4>
                                    <input
                                        type="text"
                                        value={formData.question_tr}
                                        onChange={(e) => setFormData({ ...formData, question_tr: e.target.value })}
                                        placeholder="Soru"
                                        required
                                    />
                                    <textarea
                                        value={formData.answer_tr}
                                        onChange={(e) => setFormData({ ...formData, answer_tr: e.target.value })}
                                        placeholder="Cevap"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="afaq-lang-form">
                                    <h4>🇩🇪 Deutsch</h4>
                                    <input
                                        type="text"
                                        value={formData.question_de}
                                        onChange={(e) => setFormData({ ...formData, question_de: e.target.value })}
                                        placeholder="Frage"
                                        required
                                    />
                                    <textarea
                                        value={formData.answer_de}
                                        onChange={(e) => setFormData({ ...formData, answer_de: e.target.value })}
                                        placeholder="Antwort"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="afaq-lang-form">
                                    <h4>🇬🇧 English</h4>
                                    <input
                                        type="text"
                                        value={formData.question_en}
                                        onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                                        placeholder="Question"
                                        required
                                    />
                                    <textarea
                                        value={formData.answer_en}
                                        onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                                        placeholder="Answer"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="afaq-modal-footer">
                                <button type="button" onClick={closeModal}>İptal</button>
                                <button type="submit" className="btn-primary">
                                    {editingFaq ? '💾 Kaydet' : '➕ Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFAQ;
