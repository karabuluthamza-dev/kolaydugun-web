import React, { useState, useEffect } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerCategories = () => {
    const { shopAccount, refreshData } = useShopOwner();
    const { language } = useLanguage();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name_tr: '',
        name_de: '',
        name_en: '',
        description_tr: '',
        description_de: '',
        description_en: '',
        icon: '📦',
        parent_id: '',
        sort_order: 0
    });

    const texts = {
        tr: {
            title: 'Kategorilerim',
            subtitle: 'Mağazanız için özel kategoriler oluşturun',
            addCategory: '+ Yeni Kategori',
            editCategory: 'Kategori Düzenle',
            noCategories: 'Henüz kategori eklenmemiş',
            name: 'Kategori Adı',
            description: 'Açıklama',
            icon: 'İkon',
            parent: 'Üst Kategori',
            noParent: 'Ana Kategori',
            save: 'Kaydet',
            saving: 'Kaydediliyor...',
            cancel: 'İptal',
            delete: 'Sil',
            confirmDelete: 'Bu kategoriyi silmek istediğinize emin misiniz?',
            turkish: 'Türkçe',
            german: 'Almanca',
            english: 'İngilizce',
            products: 'ürün',
            iconHint: 'Daha fazla emoji için',
            emojiSite: 'emojipedia.org',
            orCopy: 'veya kopyalayıp yapıştırın'
        },
        de: {
            title: 'Meine Kategorien',
            subtitle: 'Erstellen Sie eigene Kategorien für Ihren Shop',
            addCategory: '+ Neue Kategorie',
            editCategory: 'Kategorie bearbeiten',
            noCategories: 'Noch keine Kategorien',
            name: 'Kategoriename',
            description: 'Beschreibung',
            icon: 'Symbol',
            parent: 'Übergeordnete Kategorie',
            noParent: 'Hauptkategorie',
            save: 'Speichern',
            saving: 'Speichern...',
            cancel: 'Abbrechen',
            delete: 'Löschen',
            confirmDelete: 'Möchten Sie diese Kategorie wirklich löschen?',
            turkish: 'Türkisch',
            german: 'Deutsch',
            english: 'Englisch',
            products: 'Produkte',
            iconHint: 'Mehr Emojis auf',
            emojiSite: 'emojipedia.org',
            orCopy: 'oder kopieren und einfügen'
        },
        en: {
            title: 'My Categories',
            subtitle: 'Create custom categories for your shop',
            addCategory: '+ New Category',
            editCategory: 'Edit Category',
            noCategories: 'No categories yet',
            name: 'Category Name',
            description: 'Description',
            icon: 'Icon',
            parent: 'Parent Category',
            noParent: 'Main Category',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            delete: 'Delete',
            confirmDelete: 'Are you sure you want to delete this category?',
            turkish: 'Turkish',
            german: 'German',
            english: 'English',
            products: 'products',
            iconHint: 'More emojis at',
            emojiSite: 'emojipedia.org',
            orCopy: 'or copy and paste'
        }
    };

    const txt = texts[language] || texts.tr;

    const iconOptions = [
        '📦', '🎧', '💡', '🔊', '🎤', '🎵', '🎹', '🎸', '🎬', '📸',
        '💐', '🎂', '👗', '💍', '🎁', '🍾', '✨', '🌟', '🎀', '💒',
        '🎪', '🎭', '🪩', '🎨', '🖼️', '🛋️', '🕯️', '🌸', '🌺', '🌹',
        '🍰', '🥂', '🎊', '🎉', '👰', '🤵', '💝', '💖', '🏆', '⭐'
    ];

    useEffect(() => {
        if (shopAccount?.id) {
            fetchCategories();
        }
    }, [shopAccount]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('shop_custom_categories')
                .select('*, products:shop_products(count)')
                .eq('shop_id', shopAccount.id)
                .order('sort_order');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name_tr: '',
            name_de: '',
            name_en: '',
            description_tr: '',
            description_de: '',
            description_en: '',
            icon: '📦',
            parent_id: '',
            sort_order: categories.length
        });
        setEditingCategory(null);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name_tr: category.name_tr || '',
            name_de: category.name_de || '',
            name_en: category.name_en || '',
            description_tr: category.description_tr || '',
            description_de: category.description_de || '',
            description_en: category.description_en || '',
            icon: category.icon || '📦',
            parent_id: category.parent_id || '',
            sort_order: category.sort_order || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name_tr.trim()) {
            alert('Kategori adı gerekli');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                shop_id: shopAccount.id,
                name_tr: formData.name_tr,
                name_de: formData.name_de || null,
                name_en: formData.name_en || null,
                description_tr: formData.description_tr || null,
                description_de: formData.description_de || null,
                description_en: formData.description_en || null,
                icon: formData.icon,
                parent_id: formData.parent_id || null,
                sort_order: formData.sort_order
            };

            if (editingCategory) {
                const { error } = await supabase
                    .from('shop_custom_categories')
                    .update(payload)
                    .eq('id', editingCategory.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('shop_custom_categories')
                    .insert([payload]);
                if (error) throw error;
            }

            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!confirm(txt.confirmDelete)) return;

        try {
            const { error } = await supabase
                .from('shop_custom_categories')
                .delete()
                .eq('id', categoryId);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Hata: Bu kategoride ürün olabilir. Önce ürünleri taşıyın.');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    return (
        <div className="shop-owner-categories">
            <div className="shop-page-header">
                <div className="header-content">
                    <h1>🏷️ {txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-primary"
                        onClick={() => { resetForm(); setShowModal(true); }}
                    >
                        {txt.addCategory}
                    </button>
                </div>
            </div>

            {/* Categories List */}
            {categories.length === 0 ? (
                <div className="empty-state">
                    <span className="icon">🏷️</span>
                    <p>{txt.noCategories}</p>
                    <button
                        className="btn-primary"
                        onClick={() => { resetForm(); setShowModal(true); }}
                    >
                        {txt.addCategory}
                    </button>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map(category => (
                        <div key={category.id} className="category-card">
                            <div className="category-icon">{category.icon || '📦'}</div>
                            <div className="category-content">
                                <h4>{category[`name_${language}`] || category.name_tr}</h4>
                                <p className="description">
                                    {category[`description_${language}`] || category.description_tr || '-'}
                                </p>
                                <span className="product-count">
                                    {category.products?.[0]?.count || 0} {txt.products}
                                </span>
                            </div>
                            <div className="category-actions">
                                <button onClick={() => handleEdit(category)} className="btn-edit">
                                    ✏️
                                </button>
                                <button onClick={() => handleDelete(category.id)} className="btn-delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? txt.editCategory : txt.addCategory}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Icon Selection */}
                            <div className="form-section">
                                <label>{txt.icon}</label>
                                <div className="icon-grid">
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className={`icon-btn ${formData.icon === icon ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon })}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                                <div className="icon-hint">
                                    <span>💡 {txt.iconHint} </span>
                                    <a
                                        href="https://emojipedia.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="emoji-link"
                                    >
                                        {txt.emojiSite} ↗
                                    </a>
                                    <span> {txt.orCopy}</span>
                                </div>
                                <div className="custom-icon-input">
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value.slice(-2) })}
                                        placeholder="✨"
                                        maxLength={2}
                                        className="icon-input"
                                    />
                                </div>
                            </div>

                            {/* Names */}
                            <div className="form-section">
                                <h4>📝 {txt.name}</h4>
                                <div className="form-group">
                                    <label>🇹🇷 {txt.turkish} *</label>
                                    <input
                                        type="text"
                                        value={formData.name_tr}
                                        onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>🇩🇪 {txt.german}</label>
                                        <input
                                            type="text"
                                            value={formData.name_de}
                                            onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>🇬🇧 {txt.english}</label>
                                        <input
                                            type="text"
                                            value={formData.name_en}
                                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-section">
                                <h4>📄 {txt.description}</h4>
                                <div className="form-group">
                                    <label>🇹🇷 {txt.turkish}</label>
                                    <textarea
                                        value={formData.description_tr}
                                        onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Parent Category */}
                            <div className="form-section">
                                <div className="form-group">
                                    <label>{txt.parent}</label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">{txt.noParent}</option>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id && !c.parent_id)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat[`name_${language}`] || cat.name_tr}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    {txt.cancel}
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? txt.saving : txt.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .shop-owner-categories .shop-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .header-content h1 {
                    margin: 0;
                    font-size: 1.75rem;
                }

                .header-content p {
                    margin: 0.5rem 0 0;
                    color: #6b7280;
                }

                .btn-primary {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .empty-state .icon {
                    font-size: 4rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .category-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: white;
                    border-radius: 16px;
                    padding: 1.25rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f0f0f0;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .category-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }

                .category-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .category-content {
                    flex: 1;
                    min-width: 0;
                }

                .category-content h4 {
                    margin: 0 0 0.25rem;
                    font-size: 1rem;
                }

                .category-content .description {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #6b7280;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .category-content .product-count {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }

                .category-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-edit, .btn-delete {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-edit { background: #f3f4f6; }
                .btn-edit:hover { background: #e5e7eb; }
                .btn-delete { background: #fee2e2; }
                .btn-delete:hover { background: #fecaca; }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    background: #f3f4f6;
                    font-size: 1.25rem;
                    cursor: pointer;
                }

                form {
                    padding: 1.5rem;
                }

                .form-section {
                    margin-bottom: 1.5rem;
                }

                .form-section h4 {
                    margin: 0 0 1rem;
                    color: #374151;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: #4b5563;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #FF6B9D;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .icon-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .icon-btn {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .icon-btn:hover {
                    border-color: #FF6B9D;
                }

                .icon-btn.active {
                    border-color: #FF6B9D;
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                }

                .icon-hint {
                    margin-top: 0.75rem;
                    font-size: 0.8rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    flex-wrap: wrap;
                }

                .emoji-link {
                    color: #FF6B9D;
                    text-decoration: none;
                    font-weight: 600;
                }

                .emoji-link:hover {
                    text-decoration: underline;
                }

                .custom-icon-input {
                    margin-top: 0.75rem;
                }

                .icon-input {
                    width: 60px !important;
                    height: 50px;
                    font-size: 1.5rem !important;
                    text-align: center;
                    padding: 8px !important;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding-top: 1rem;
                    border-top: 1px solid #f0f0f0;
                }

                .btn-secondary {
                    padding: 12px 24px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 640px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShopOwnerCategories;
