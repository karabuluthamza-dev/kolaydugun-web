import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SimpleEditor from '../components/SimpleEditor'; // Reusing for description if needed, or just text area
import './AdminConfig.css'; // Reuse admin styles

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editingSchema, setEditingSchema] = useState(null); // Schema editor state
    const [schemaFields, setSchemaFields] = useState([]); // Parsed schema fields
    const [currentLang, setCurrentLang] = useState('tr'); // Current language for translation editing

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory({ ...category });
    };

    const handleCancel = () => {
        setEditingCategory(null);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('categories')
                .update({
                    name: editingCategory.name,
                    description: editingCategory.description,
                    image_url: editingCategory.image_url,
                    icon: editingCategory.icon,
                    is_featured: editingCategory.is_featured,
                    sort_order: editingCategory.sort_order,
                    slug: editingCategory.slug
                })
                .eq('id', editingCategory.id);

            if (error) throw error;

            await fetchCategories();
            setEditingCategory(null);
            alert('Kategori başarıyla güncellendi!');
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Güncelleme sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSchema = (category) => {
        // Parse existing form_schema or start with empty array
        const parsedSchema = category.form_schema || [];
        setSchemaFields(Array.isArray(parsedSchema) ? parsedSchema : []);
        setEditingSchema(category);
    };

    const handleCancelSchema = () => {
        setEditingSchema(null);
        setSchemaFields([]);
    };

    const handleAddField = () => {
        setSchemaFields([...schemaFields, {
            key: '',
            type: 'multiselect',
            translations: {
                label: { tr: '', de: '', en: '' }
            },
            options: []
        }]);
    };

    const handleUpdateField = (index, field, value) => {
        const updated = [...schemaFields];
        updated[index][field] = value;
        setSchemaFields(updated);
    };

    const handleDeleteField = (index) => {
        if (confirm('Bu alanı silmek istediğinizden emin misiniz?')) {
            const updated = schemaFields.filter((_, i) => i !== index);
            setSchemaFields(updated);
        }
    };

    const handleAddOption = (fieldIndex) => {
        const updated = [...schemaFields];
        if (!updated[fieldIndex].options) updated[fieldIndex].options = [];
        updated[fieldIndex].options.push({
            key: '',
            translations: { tr: '', de: '', en: '' }
        });
        setSchemaFields(updated);
    };

    const handleUpdateOption = (fieldIndex, optionIndex, field, value) => {
        const updated = [...schemaFields];
        if (typeof updated[fieldIndex].options[optionIndex] === 'string') {
            // Convert old format to new format
            updated[fieldIndex].options[optionIndex] = {
                key: updated[fieldIndex].options[optionIndex],
                translations: { tr: '', de: '', en: '' }
            };
        }
        if (field === 'key') {
            updated[fieldIndex].options[optionIndex].key = value;
        } else {
            updated[fieldIndex].options[optionIndex].translations[field] = value;
        }
        setSchemaFields(updated);
    };

    const handleDeleteOption = (fieldIndex, optionIndex) => {
        const updated = [...schemaFields];
        updated[fieldIndex].options = updated[fieldIndex].options.filter((_, i) => i !== optionIndex);
        setSchemaFields(updated);
    };

    const handleSaveSchema = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('categories')
                .update({ form_schema: schemaFields })
                .eq('id', editingSchema.id);

            if (error) throw error;

            await fetchCategories();
            setEditingSchema(null);
            setSchemaFields([]);
            alert('Form şeması başarıyla güncellendi!');
        } catch (error) {
            console.error('Error updating schema:', error);
            alert('Şema güncellenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'category-images' bucket
            // Ensure this bucket exists in Supabase Storage and is set to Public
            const { data, error: uploadError } = await supabase.storage
                .from('category-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('category-images')
                .getPublicUrl(filePath);

            setEditingCategory(prev => ({ ...prev, image_url: urlData.publicUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            let msg = 'Resim yüklenirken bir hata oluştu.';
            if (error.message && error.message.includes('Bucket not found')) {
                msg = "Hata: 'category-images' isimli Storage Bucket bulunamadı. Lütfen Supabase panelinden bu bucket'ı oluşturun ve Public yapın.";
            } else if (error.statusCode === '403' || error.error === 'Unauthorized') {
                msg = "Yetki hatası: Lütfen Storage Bucket politikalarını (Policies) kontrol edin.";
            } else {
                msg += ` (${error.message})`;
            }
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    if (loading && !categories.length) return <div className="p-4">Yükleniyor...</div>;

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <h1>Kategori Yönetimi</h1>
                <p>Sitedeki kategorileri ve resimlerini buradan yönetebilirsiniz.</p>
            </div>

            {editingCategory ? (
                <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3>Kategori Düzenle: {editingCategory.name}</h3>

                    <div className="form-group">
                        <label>Kategori Adı (İngilizce - DB Key)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingCategory.name}
                            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            disabled
                        />
                        <small className="text-muted">Sistem bütünlüğü için isim değiştirilemez.</small>
                    </div>

                    <div className="form-group">
                        <label>URL Slug</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingCategory.slug || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                        />
                        <small className="text-muted">URL'de görünecek isim (örn: dugun-mekanlari)</small>
                    </div>

                    <div className="form-group">
                        <label>Açıklama</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={editingCategory.description || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>İkon (Emoji)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingCategory.icon || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <label>Sıralama (Sort Order)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editingCategory.sort_order || 0}
                                onChange={e => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '25px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={editingCategory.is_featured !== false} // Default true
                                    onChange={e => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                                    style={{ width: '20px', height: '20px', marginRight: '10px' }}
                                />
                                Anasayfada Göster (Featured)
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Kategori Resmi</label>
                        <div className="image-preview-container" style={{ marginBottom: '15px' }}>
                            {editingCategory.image_url ? (
                                <img
                                    src={editingCategory.image_url}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            ) : (
                                <div className="no-image-placeholder">Resim Yok</div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        {uploading && <span>Yükleniyor...</span>}
                    </div>

                    <div className="button-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleCancel}>İptal</button>
                    </div>
                </div>
            ) : (
                <div className="admin-grid">
                    {categories.map(cat => (
                        <div key={cat.id} className="admin-card category-card-item" style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: cat.is_featured === false ? 0.6 : 1 }}>
                            <div style={{ height: '150px', overflow: 'hidden', borderRadius: '4px', background: '#f0f0f0', position: 'relative' }}>
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Resim Yok</div>
                                )}
                                {cat.is_featured !== false && (
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'gold', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Featured</div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{cat.icon} {cat.name}</h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditSchema(cat)}>📝 Form Şemaları</button>
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(cat)}>Düzenle</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                                <span>Sıra: {cat.sort_order || 0}</span>
                                <span>Slug: {cat.slug}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{cat.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Schema Editor Modal */}
            {editingSchema && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div className="admin-card" style={{
                        maxWidth: '900px', width: '100%', maxHeight: '90vh',
                        overflow: 'auto', position: 'relative'
                    }}>
                        <h3>Form Şemaları Düzenle: {editingSchema.name}</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Bu kategoriye ait özel alanları buradan yönetebilirsiniz.</p>

                        <div style={{ marginTop: '20px' }}>
                            {schemaFields.map((field, fieldIdx) => (
                                <div key={fieldIdx} style={{
                                    border: '1px solid #ddd', borderRadius: '8px',
                                    padding: '15px', marginBottom: '15px', background: '#f9f9f9'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h4 style={{ margin: 0 }}>Alan #{fieldIdx + 1}</h4>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteField(fieldIdx)}
                                        >Sil</button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Alan Anahtarı (key)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={field.key}
                                                onChange={(e) => handleUpdateField(fieldIdx, 'key', e.target.value)}
                                                placeholder="örn: music_instruments"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Alan Tipi</label>
                                            <select
                                                className="form-control"
                                                value={field.type}
                                                onChange={(e) => handleUpdateField(fieldIdx, 'type', e.target.value)}
                                            >
                                                <option value="multiselect">Çoklu Seçim</option>
                                                <option value="select">Tekli Seçim</option>
                                                <option value="text">Metin</option>
                                                <option value="number">Sayı</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Language Tabs */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '15px' }}>
                                            {['tr', 'de', 'en'].map(lang => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setCurrentLang(lang)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        border: 'none',
                                                        background: currentLang === lang ? '#3b82f6' : 'transparent',
                                                        color: currentLang === lang ? 'white' : '#64748b',
                                                        fontWeight: currentLang === lang ? '600' : '400',
                                                        borderRadius: '6px 6px 0 0',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {lang === 'tr' && '🇹🇷 Türkçe'}
                                                    {lang === 'de' && '🇩🇪 Deutsch'}
                                                    {lang === 'en' && '🇬🇧 English'}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Label Translation */}
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                                                Alan Etiketi ({currentLang.toUpperCase()})
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={field.translations?.label?.[currentLang] || ''}
                                                onChange={(e) => {
                                                    const updated = [...schemaFields];
                                                    if (!updated[fieldIdx].translations) updated[fieldIdx].translations = { label: {} };
                                                    if (!updated[fieldIdx].translations.label) updated[fieldIdx].translations.label = {};
                                                    updated[fieldIdx].translations.label[currentLang] = e.target.value;
                                                    setSchemaFields(updated);
                                                }}
                                                placeholder={currentLang === 'tr' ? 'örn: Enstrümanlar / Ekip Tipi' : currentLang === 'de' ? 'z.B. Instrumente / Team-Typ' : 'e.g. Instruments / Team Type'}
                                            />
                                        </div>

                                        {/* Options Section */}
                                        {(field.type === 'multiselect' || field.type === 'select') && (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>Seçenekler ({currentLang.toUpperCase()})</label>
                                                    <button
                                                        className="btn btn-xs btn-success"
                                                        onClick={() => handleAddOption(fieldIdx)}
                                                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                    >+ Seçenek Ekle</button>
                                                </div>
                                                {field.options && field.options.map((option, optIdx) => {
                                                    const isNewFormat = typeof option === 'object' && option.translations;
                                                    return (
                                                        <div key={optIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginBottom: '8px' }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={isNewFormat ? option.key : option}
                                                                onChange={(e) => handleUpdateOption(fieldIdx, optIdx, 'key', e.target.value)}
                                                                placeholder="Key: instr_solist"
                                                                style={{ fontSize: '0.85rem' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={isNewFormat ? (option.translations[currentLang] || '') : ''}
                                                                onChange={(e) => handleUpdateOption(fieldIdx, optIdx, currentLang, e.target.value)}
                                                                placeholder={currentLang === 'tr' ? 'Türkçe: Solist' : currentLang === 'de' ? 'Deutsch: Solist' : 'English: Soloist'}
                                                            />
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteOption(fieldIdx, optIdx)}
                                                            >×</button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                className="btn btn-outline-primary"
                                onClick={handleAddField}
                                style={{ width: '100%', marginTop: '10px' }}
                            >+ Yeni Alan Ekle</button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={handleCancelSchema}>İptal</button>
                            <button className="btn btn-primary" onClick={handleSaveSchema} disabled={loading}>
                                {loading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
