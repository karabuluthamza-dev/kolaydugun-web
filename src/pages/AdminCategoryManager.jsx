import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminCategoryManager.css';

const AdminCategoryManager = () => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [schema, setSchema] = useState([]);
    const [imageUrl, setImageUrl] = useState(''); // New state for image URL
    const [icon, setIcon] = useState(''); // New state for icon
    const [isFeatured, setIsFeatured] = useState(true); // New state for is_featured
    const [sortOrder, setSortOrder] = useState(0); // New state for sort_order
    const [slug, setSlug] = useState(''); // New state for slug
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) console.error('Error fetching categories:', error);
        else setCategories(data || []);
        setLoading(false);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setImageUrl(category.image_url || ''); // Set image URL state
        setIcon(category.icon || '');
        setIsFeatured(category.is_featured !== false);
        setSortOrder(category.sort_order || 0);
        setSlug(category.slug || '');
        // Parse existing schema or default to empty array
        try {
            const parsedSchema = typeof category.form_schema === 'string'
                ? JSON.parse(category.form_schema)
                : category.form_schema || [];
            setSchema(parsedSchema);
        } catch (e) {
            setSchema([]);
        }
    };

    const addField = () => {
        setSchema([...schema, { key: '', label: '', type: 'text', options: [] }]);
    };

    const removeField = (index) => {
        const newSchema = [...schema];
        newSchema.splice(index, 1);
        setSchema(newSchema);
    };

    const updateField = (index, field, value) => {
        const newSchema = [...schema];
        newSchema[index][field] = value;
        setSchema(newSchema);
    };

    const handleOptionChange = (index, value) => {
        const options = value.split(',').map(opt => opt.trim());
        updateField(index, 'options', options);
    };

    const saveSchema = async () => {
        if (!selectedCategory) return;
        setSaving(true);

        const { error } = await supabase
            .from('categories')
            .update({
                form_schema: schema,
                image_url: imageUrl, // Save image URL
                icon: icon,
                is_featured: isFeatured,
                sort_order: sortOrder,
                slug: slug,
                is_live_supported: selectedCategory.is_live_supported
            })
            .eq('id', selectedCategory.id);

        if (error) {
            alert('Error saving: ' + error.message);
        } else {
            alert('Saved successfully!');
            // Update local state
            setCategories(categories.map(c =>
                c.id === selectedCategory.id ? {
                    ...c,
                    form_schema: schema,
                    image_url: imageUrl,
                    icon,
                    is_featured: isFeatured,
                    sort_order: sortOrder,
                    slug
                } : c
            ));
        }
        setSaving(false);
    };

    return (
        <div className="section container admin-category-manager">
            <div className="manager-header">
                <h1>Kategori Özellik Yönetimi</h1>
                <p>Her kategori için özel soruları ve form alanlarını buradan yönetebilirsiniz.</p>
            </div>

            <div className="manager-layout">
                <div className="category-list">
                    <h3>Kategoriler</h3>
                    {loading ? <p>Yükleniyor...</p> : (
                        <ul>
                            {categories.map(cat => (
                                <li
                                    key={cat.id}
                                    className={selectedCategory?.id === cat.id ? 'active' : ''}
                                    onClick={() => handleCategorySelect(cat)}
                                >
                                    {t(cat.name)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="schema-editor">
                    {selectedCategory ? (
                        <>
                            <div className="editor-header">
                                <h2>{t(selectedCategory.name)} - Form Yapısı</h2>
                                <button className="btn btn-success" onClick={saveSchema} disabled={saving}>
                                    {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
                                </button>
                            </div>

                            {/* General Settings */}
                            <div className="card mb-4 p-3">
                                <h4>Genel Ayarlar</h4>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label>URL Slug</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="örn: dugun-mekanlari"
                                        />
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label>İkon (Emoji)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={icon}
                                            onChange={(e) => setIcon(e.target.value)}
                                            placeholder="🏰"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Sıralama (Sort Order)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-md-6 form-group mb-3 d-flex align-items-center" style={{ marginTop: '25px' }}>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={selectedCategory.is_live_supported}
                                                onChange={(e) => setSelectedCategory({ ...selectedCategory, is_live_supported: e.target.checked })}
                                                id="liveCheck"
                                            />
                                            <label className="form-check-label" htmlFor="liveCheck">
                                                Canlı İstek Desteği (Live Supported)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image URL Editor */}
                            <div className="card mb-4 p-3">
                                <h4>Kategori Resmi</h4>
                                <div className="form-group mb-3">
                                    <label>Resim Yükle (Bilgisayardan)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            setSaving(true);
                                            try {
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${selectedCategory.id}-${Math.random()}.${fileExt}`;
                                                const filePath = `${fileName}`;

                                                // Upload to 'category-images' bucket
                                                const { error: uploadError } = await supabase.storage
                                                    .from('category-images')
                                                    .upload(filePath, file);

                                                if (uploadError) {
                                                    // Fallback to 'public' if category-images doesn't exist
                                                    if (uploadError.message.includes('bucket not found')) {
                                                        const { error: publicUploadError } = await supabase.storage
                                                            .from('public')
                                                            .upload(`categories/${filePath}`, file);
                                                        if (publicUploadError) throw publicUploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('public')
                                                            .getPublicUrl(`categories/${filePath}`);
                                                        setImageUrl(publicUrl);
                                                    } else {
                                                        throw uploadError;
                                                    }
                                                } else {
                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('category-images')
                                                        .getPublicUrl(filePath);
                                                    setImageUrl(publicUrl);
                                                }
                                            } catch (error) {
                                                alert('Upload Error: ' + error.message);
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Veya Resim URL'si Girin</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>
                                {imageUrl && (
                                    <div className="mt-2">
                                        <p>Önizleme:</p>
                                        <img src={imageUrl} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                                    </div>
                                )}
                            </div>

                            <div className="fields-container">
                                {schema.map((field, index) => (
                                    <div key={index} className="field-card">
                                        <div className="field-header">
                                            <h4>Alan #{index + 1}</h4>
                                            <button className="btn-delete" onClick={() => removeField(index)}>Sil</button>
                                        </div>
                                        <div className="field-row">
                                            <div className="form-group">
                                                <label>Soru Başlığı (Label Key)</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(index, 'label', e.target.value)}
                                                    placeholder="Örn: capacity_meal_label"
                                                />
                                                <small className="text-muted">
                                                    Çeviri: {t(`schemas.${field.label}`) !== `schemas.${field.label}` ? t(`schemas.${field.label}`) : 'Çeviri Yok'}
                                                </small>
                                            </div>
                                            <div className="form-group">
                                                <label>Veritabanı Anahtarı (Key)</label>
                                                <input
                                                    type="text"
                                                    value={field.key}
                                                    onChange={(e) => updateField(index, 'key', e.target.value)}
                                                    placeholder="Örn: capacity"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Veri Tipi</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(index, 'type', e.target.value)}
                                                >
                                                    <option value="text">Metin (Text)</option>
                                                    <option value="number">Sayı (Number)</option>
                                                    <option value="boolean">Evet/Hayır (Boolean)</option>
                                                    <option value="select">Tekli Seçim (Select)</option>
                                                    <option value="multiselect">Çoklu Seçim (Multi-Select)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(field.type === 'select' || field.type === 'multiselect') && (
                                            <div className="form-group">
                                                <label>Seçenekler (Virgül ile ayırın - Key kullanın)</label>
                                                <textarea
                                                    value={field.options?.join(', ')}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    placeholder="Örn: venue_option_hotel, venue_option_boat"
                                                />
                                                <div className="options-preview">
                                                    <small>Önizleme: </small>
                                                    {field.options?.map(opt => (
                                                        <span key={opt} className="badge bg-light text-dark me-1">
                                                            {t(`schemas.${opt}`)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="btn btn-primary btn-add" onClick={addField}>
                                + Yeni Alan Ekle
                            </button>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>Düzenlemek için soldan bir kategori seçin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCategoryManager;
