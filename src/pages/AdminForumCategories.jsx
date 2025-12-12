import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as LucideIcons from 'lucide-react'; // For dynamic icon preview

const AdminForumCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);
    const [showConfirmSave, setShowConfirmSave] = useState(false);

    // Initial state for new category
    const initialCategoryState = {
        name_tr: '', name_en: '', name_de: '',
        description_tr: '', description_en: '', description_de: '',
        slug: '',
        icon: 'Hash',
        order_index: 0,
        is_visible: true
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('forum_categories')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error fetching forum categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const dataToSave = {
                slug: editingCategory.slug,
                name_tr: editingCategory.name_tr,
                name_en: editingCategory.name_en,
                name_de: editingCategory.name_de,
                description_tr: editingCategory.description_tr,
                description_en: editingCategory.description_en,
                description_de: editingCategory.description_de,
                icon: editingCategory.icon,
                order_index: editingCategory.order_index,
                is_visible: editingCategory.is_visible
            };

            let error;
            if (isCreating) {
                const { error: insertError } = await supabase
                    .from('forum_categories')
                    .insert([dataToSave]);
                error = insertError;
            } else {
                const { error: updateError } = await supabase
                    .from('forum_categories')
                    .update(dataToSave)
                    .eq('id', editingCategory.id);
                error = updateError;
            }

            if (error) throw error;

            await fetchCategories();
            setEditingCategory(null);
            setIsCreating(false);
            alert(isCreating ? 'Kategori oluşturuldu!' : 'Kategori güncellendi!');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? İçindeki konular silinmeyebilir ama kategori boşta kalır.')) return;

        try {
            const { error } = await supabase.from('forum_categories').delete().eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Silinemedi: ' + error.message);
        }
    };

    const moveOrder = (id, direction) => {
        const normalizedCats = [...categories].map((c, idx) => ({ ...c, order_index: idx }));

        const index = normalizedCats.findIndex(c => c.id === id);
        if (index < 0) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= normalizedCats.length) return;

        const currentCat = normalizedCats[index];
        const targetCat = normalizedCats[targetIndex];

        const tempOrder = currentCat.order_index;
        currentCat.order_index = targetCat.order_index;
        targetCat.order_index = tempOrder;

        normalizedCats.sort((a, b) => a.order_index - b.order_index);
        setCategories(normalizedCats);
        setHasOrderChanged(true);
    };

    const saveOrder = async () => {
        console.log('saveOrder called');
        setLoading(true);
        try {
            // Update each category's order_index individually
            for (let idx = 0; idx < categories.length; idx++) {
                const cat = categories[idx];
                const { error } = await supabase
                    .from('forum_categories')
                    .update({ order_index: idx })
                    .eq('id', cat.id);

                if (error) throw error;
            }

            setHasOrderChanged(false);
            setShowConfirmSave(false);
            alert('Sıralama başarıyla kaydedildi!');
            await fetchCategories(); // Refresh from DB
        } catch (error) {
            console.error('Sort error:', error);
            alert('Sıralama kaydedilemedi: ' + (error?.message || JSON.stringify(error)));
            fetchCategories();
        } finally {
            setLoading(false);
        }
    };

    if (loading && !categories.length && !isCreating) return <div className="p-4">Yükleniyor...</div>;

    const renderIcon = (name) => {
        const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
        return <Icon size={20} />;
    };

    return (
        <div className="admin-container p-6">
            {/* Confirmation Modal */}
            {showConfirmSave && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Sıralamayı Onayla</h3>
                        <p className="text-gray-600 mb-6">Kategori sıralamasını kaydetmek istediğinize emin misiniz?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmSave(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                İptal
                            </button>
                            <button
                                onClick={saveOrder}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                ✓ Onayla ve Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">📂 Forum Kategorileri</h1>
                {!editingCategory && (
                    <div className="flex gap-2">
                        {hasOrderChanged && (
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 animate-pulse flex items-center gap-2"
                                onClick={() => setShowConfirmSave(true)}
                            >
                                💾 Sıralamayı Kaydet
                            </button>
                        )}
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => {
                                setEditingCategory({ ...initialCategoryState, order_index: categories.length + 1 });
                                setIsCreating(true);
                            }}
                        >
                            + Yeni Kategori
                        </button>
                    </div>
                )}
            </div>

            {editingCategory ? (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold mb-6 border-b pb-2">
                        {isCreating ? 'Yeni Kategori Oluştur' : 'Kategoriyi Düzenle'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Common Settings */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                                <input
                                    type="text"
                                    className="form-control w-full border rounded p-2"
                                    value={editingCategory.slug}
                                    onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                    placeholder="ornek-kategori"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lucide İkon Adı</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control w-full border rounded p-2"
                                        value={editingCategory.icon}
                                        onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                                        placeholder="MessageCircle"
                                    />
                                    <div className="p-2 bg-gray-100 rounded">
                                        {renderIcon(editingCategory.icon)}
                                    </div>
                                </div>
                                <small className="text-gray-500">Örn: Heart, MessageCircle, MapPin</small>
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                                <input
                                    type="checkbox"
                                    checked={editingCategory.is_visible}
                                    onChange={e => setEditingCategory({ ...editingCategory, is_visible: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="font-medium">Sitede Göster</span>
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded border">
                            <h4 className="font-bold text-gray-600">🇹🇷 Türkçe</h4>
                            <input
                                type="text"
                                className="form-control w-full border rounded p-2 mb-2"
                                placeholder="Kategori Adı"
                                value={editingCategory.name_tr}
                                onChange={e => setEditingCategory({ ...editingCategory, name_tr: e.target.value })}
                            />

                            <h4 className="font-bold text-gray-600 mt-4">🇺🇸 English</h4>
                            <input
                                type="text"
                                className="form-control w-full border rounded p-2 mb-2"
                                placeholder="Category Name"
                                value={editingCategory.name_en || ''}
                                onChange={e => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                            />

                            <h4 className="font-bold text-gray-600 mt-4">🇩🇪 Deutsch</h4>
                            <input
                                type="text"
                                className="form-control w-full border rounded p-2 mb-2"
                                placeholder="Kategoriename"
                                value={editingCategory.name_de || ''}
                                onChange={e => setEditingCategory({ ...editingCategory, name_de: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                        <button
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            onClick={() => { setEditingCategory(null); setIsCreating(false); }}
                        >
                            İptal
                        </button>
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                            onClick={handleSave}
                        >
                            Kaydet
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İkon & İsim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çeviriler (EN/DE)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıralama</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((cat, idx) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                                                {renderIcon(cat.icon)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{cat.name_tr}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 flex flex-col gap-1">
                                            <span>🇺🇸 {cat.name_en || '-'}</span>
                                            <span>🇩🇪 {cat.name_de || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cat.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cat.is_visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {cat.is_visible ? 'Aktif' : 'Gizli'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => moveOrder(cat.id, 'up')}
                                                disabled={idx === 0}
                                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                            >
                                                ⬆️
                                            </button>
                                            <button
                                                onClick={() => moveOrder(cat.id, 'down')}
                                                disabled={idx === categories.length - 1}
                                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                                            >
                                                ⬇️
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => { setEditingCategory(cat); setIsCreating(false); }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminForumCategories;
