import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopCategories.css';

const AdminShopCategories = () => {
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        slug: '',
        icon: '',
        name_tr: '',
        name_de: '',
        name_en: '',
        tagline_tr: '',
        tagline_de: '',
        tagline_en: '',
        image_url: '',
        parent_id: null,
        display_order: 0,
        is_active: true,
        show_on_homepage: false
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('shop_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                slug: formData.slug || generateSlug(formData.name_tr || formData.name_en),
                icon: formData.icon,
                name_tr: formData.name_tr,
                name_de: formData.name_de,
                name_en: formData.name_en,
                tagline_tr: formData.tagline_tr,
                tagline_de: formData.tagline_de,
                tagline_en: formData.tagline_en,
                image_url: formData.image_url || null,
                parent_id: formData.parent_id || null,
                display_order: formData.display_order,
                is_active: formData.is_active,
                show_on_homepage: formData.show_on_homepage
            };

            if (editingCategory) {
                const { error } = await supabase
                    .from('shop_categories')
                    .update(payload)
                    .eq('id', editingCategory.id);
                if (error) throw error;
                alert('✅ Kategori güncellendi!');
            } else {
                const { error } = await supabase
                    .from('shop_categories')
                    .insert([payload]);
                if (error) throw error;
                alert('✅ Kategori eklendi!');
            }

            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            slug: category.slug,
            icon: category.icon || '',
            name_tr: category.name_tr || '',
            name_de: category.name_de || '',
            name_en: category.name_en || '',
            tagline_tr: category.tagline_tr || '',
            tagline_de: category.tagline_de || '',
            tagline_en: category.tagline_en || '',
            image_url: category.image_url || '',
            parent_id: category.parent_id || null,
            display_order: category.display_order || 0,
            is_active: category.is_active,
            show_on_homepage: category.show_on_homepage || false
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('shop_categories')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Hata: ' + error.message);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('shop_categories')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({
            slug: '',
            icon: '',
            name_tr: '',
            name_de: '',
            name_en: '',
            tagline_tr: '',
            tagline_de: '',
            tagline_en: '',
            image_url: '',
            parent_id: null,
            display_order: 0,
            is_active: true,
            show_on_homepage: false
        });
    };

    const openNewModal = () => {
        resetForm();
        setShowModal(true);
    };

    // Get parent categories (those without parent_id)
    const parentCategories = categories.filter(c => !c.parent_id);
    // Get child categories grouped by parent
    const getChildCategories = (parentId) => categories.filter(c => c.parent_id === parentId);

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-categories">
            <div className="admin-page-header">
                <div>
                    <h1>🏷️ Shop Kategorileri</h1>
                    <p>Mağaza kategorilerini yönetin • {categories.length} kategori</p>
                </div>
                <button className="btn-primary" onClick={openNewModal}>
                    + Yeni Kategori
                </button>
            </div>

            <div className="categories-grid">
                {categories.length === 0 ? (
                    <div className="empty-state">
                        <p>Henüz kategori eklenmemiş.</p>
                        <button className="btn-primary" onClick={openNewModal}>
                            İlk Kategoriyi Ekle
                        </button>
                    </div>
                ) : (
                    // Show parent categories first, then children
                    parentCategories.map((category) => (
                        <React.Fragment key={category.id}>
                            <div className={`category-card parent ${!category.is_active ? 'inactive' : ''}`}>
                                <div className="category-info">
                                    <h3>
                                        {category.icon && <span className="category-icon">{category.icon}</span>}
                                        {category[`name_${language}`] || category.name_tr || 'İsimsiz'}
                                    </h3>
                                    <p className="category-slug">/{category.slug}</p>
                                    <div className="category-meta">
                                        <span className="order-badge">Sıra: {category.display_order}</span>
                                        <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                                            {category.is_active ? '✅ Aktif' : '❌ Pasif'}
                                        </span>
                                        {category.show_on_homepage && (
                                            <span className="status-badge homepage">🏠 Anasayfa</span>
                                        )}
                                    </div>
                                </div>
                                <div className="category-actions">
                                    <button className="btn-icon" onClick={() => handleEdit(category)} title="Düzenle">
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => toggleActive(category.id, category.is_active)}
                                        title={category.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                    >
                                        {category.is_active ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                    <button className="btn-icon danger" onClick={() => handleDelete(category.id)} title="Sil">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            {/* Child categories */}
                            {getChildCategories(category.id).map((child) => (
                                <div key={child.id} className={`category-card child ${!child.is_active ? 'inactive' : ''}`}>
                                    <div className="category-info">
                                        <h3>
                                            <span className="child-indicator">↳</span>
                                            {child.icon && <span className="category-icon">{child.icon}</span>}
                                            {child[`name_${language}`] || child.name_tr || 'İsimsiz'}
                                        </h3>
                                        <p className="category-slug">/{child.slug}</p>
                                        <div className="category-meta">
                                            <span className="order-badge">Sıra: {child.display_order}</span>
                                            <span className={`status-badge ${child.is_active ? 'active' : 'inactive'}`}>
                                                {child.is_active ? '✅' : '❌'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="category-actions">
                                        <button className="btn-icon" onClick={() => handleEdit(child)} title="Düzenle">
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => toggleActive(child.id, child.is_active)}
                                            title={child.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                        >
                                            {child.is_active ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(child.id)} title="Sil">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? '✏️ Kategori Düzenle' : '➕ Yeni Kategori'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>İkon (Emoji)</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="👗"
                                        style={{ fontSize: '1.5rem', width: '80px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Slug (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="gelinlik-aksesuarlari"
                                    />
                                    <small>Boş bırakırsanız otomatik oluşturulur</small>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Üst Kategori (Alt kategori için seçin)</label>
                                <select
                                    value={formData.parent_id || ''}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                                >
                                    <option value="">-- Ana Kategori --</option>
                                    {parentCategories.filter(c => c.id !== editingCategory?.id).map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name_tr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>İsim (Türkçe) *</label>
                                <input
                                    type="text"
                                    value={formData.name_tr}
                                    onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                                    required
                                    placeholder="Gelinlikler"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>İsim (Almanca)</label>
                                    <input
                                        type="text"
                                        value={formData.name_de}
                                        onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                                        placeholder="Brautkleider"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>İsim (İngilizce)</label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        placeholder="Wedding Dresses"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tagline (Türkçe) - Kısa duygusal metin</label>
                                <input
                                    type="text"
                                    value={formData.tagline_tr}
                                    onChange={(e) => setFormData({ ...formData, tagline_tr: e.target.value })}
                                    placeholder="Zarif dokunuşlar"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tagline (Almanca)</label>
                                    <input
                                        type="text"
                                        value={formData.tagline_de}
                                        onChange={(e) => setFormData({ ...formData, tagline_de: e.target.value })}
                                        placeholder="Elegante Akzente"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tagline (İngilizce)</label>
                                    <input
                                        type="text"
                                        value={formData.tagline_en}
                                        onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                                        placeholder="Elegant touches"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Görsel URL</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        Aktif
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.show_on_homepage}
                                            onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                                        />
                                        🏠 Anasayfada Göster
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingCategory ? 'Güncelle' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopCategories;
