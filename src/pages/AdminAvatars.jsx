import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Upload, Trash2, Plus, Save, GripVertical, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react';

const AdminAvatars = () => {
    const { t } = useLanguage();
    const [avatars, setAvatars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newAvatar, setNewAvatar] = useState({ name: '', url: '', category: 'general' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState(null); // NEW: Track which avatar is being deleted
    const [deleting, setDeleting] = useState(false);

    const categories = [
        { value: 'bride', label: 'Gelin' },
        { value: 'groom', label: 'Damat' },
        { value: 'couple', label: 'Çift' },
        { value: 'symbol', label: 'Sembol' },
        { value: 'general', label: 'Genel' },
    ];

    useEffect(() => {
        fetchAvatars();
    }, []);

    const fetchAvatars = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('default_avatars')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setAvatars(data || []);
        } catch (error) {
            console.error('Error fetching avatars:', error);
            setMessage({ type: 'error', text: 'Avatarlar yüklenemedi: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const processFileUpload = async (file) => {
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Lütfen bir resim dosyası seçin' });
            return;
        }

        try {
            setUploading(true);
            setMessage({ type: '', text: '' });

            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `avatar-${Date.now()}.${fileExt}`;
            const filePath = `default-avatars/${fileName}`;

            // Upload to avatars bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                // Try images bucket as fallback, though normally avatars bucket should work
                const { error: fallbackError } = await supabase.storage
                    .from('images')
                    .upload(filePath, file, { upsert: true });

                if (fallbackError) throw fallbackError;

                const { data } = supabase.storage.from('images').getPublicUrl(filePath);
                setNewAvatar(prev => ({ ...prev, url: data.publicUrl }));
            } else {
                const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
                setNewAvatar(prev => ({ ...prev, url: data.publicUrl }));
            }

            setMessage({ type: 'success', text: 'Resim yüklendi!' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Yükleme hatası: ' + error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) processFileUpload(file);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault(); // Prevent pasting the binary string or filename
                    processFileUpload(file);
                    return;
                }
            }
        }
    };

    const handleAddAvatar = async () => {
        if (!newAvatar.name || !newAvatar.url) {
            setMessage({ type: 'error', text: 'İsim ve URL gerekli' });
            return;
        }

        try {
            const { error } = await supabase
                .from('default_avatars')
                .insert([{
                    name: newAvatar.name,
                    url: newAvatar.url,
                    category: newAvatar.category,
                    sort_order: avatars.length + 1
                }]);

            if (error) throw error;

            setNewAvatar({ name: '', url: '', category: 'general' });
            setShowAddForm(false);
            setMessage({ type: 'success', text: 'Avatar eklendi!' });
            fetchAvatars();
        } catch (error) {
            console.error('Add error:', error);
            setMessage({ type: 'error', text: 'Ekleme hatası: ' + error.message });
        }
    };

    const handleDeleteClick = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirmationId(id);
    };

    const handleCancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirmationId(null);
    };

    const handleConfirmDelete = async (e, id, url) => {
        e.preventDefault();
        e.stopPropagation();
        if (deleting) return;

        setDeleting(true);
        try {
            // 1. Delete from Storage
            const path = url.split('/').pop(); // Extract filename
            const { error: storageError } = await supabase.storage
                .from('avatars')
                .remove([`defaults/${path}`]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
            }

            // 2. Delete from Database
            const { error: dbError } = await supabase
                .from('default_avatars')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // Success
            fetchAvatars();
            setDeleteConfirmationId(null);
        } catch (error) {
            console.error('Error deleting avatar:', error);
            alert('Silme işlemi başarısız oldu.');
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('default_avatars')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchAvatars();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <ImageIcon className="text-purple-500" />
                        Avatar Yönetimi
                    </h1>
                    <p className="text-gray-500 mt-1">Kullanıcıların seçebileceği varsayılan avatarları yönetin</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus size={20} />
                    Yeni Avatar
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Add Form */}
            {showAddForm && (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Yeni Avatar Ekle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">İsim</label>
                            <input
                                type="text"
                                value={newAvatar.name}
                                onChange={(e) => setNewAvatar(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder="Örn: Güzel Gelin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                            <select
                                value={newAvatar.category}
                                onChange={(e) => setNewAvatar(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL veya Yükle</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={newAvatar.url}
                                    onChange={(e) => setNewAvatar(prev => ({ ...prev, url: e.target.value }))}
                                    onPaste={handlePaste}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="URL yapıştırın veya resmi direkt buraya Paste (Ctrl+V) yapın"
                                />
                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                                    <Upload size={18} />
                                    <span>{uploading ? 'Yükleniyor...' : 'Yükle'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        {newAvatar.url && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500 mb-2">Önizleme:</p>
                                <img src={newAvatar.url} alt="Önizleme" className="w-20 h-20 rounded-full object-cover border-2 border-purple-200" />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleAddAvatar}
                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <Save size={18} />
                            Kaydet
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}

            {/* Avatar Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {avatars.map((avatar) => (
                    <div
                        key={avatar.id}
                        className={`relative group p-4 rounded-xl border ${avatar.is_active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                            }`}
                    >
                        <div className="w-full aspect-square rounded-full overflow-hidden bg-purple-50 mb-3">
                            <img
                                src={avatar.url}
                                alt={avatar.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-sm font-medium text-gray-900 text-center truncate">{avatar.name}</p>
                        <p className="text-xs text-gray-500 text-center">{categories.find(c => c.value === avatar.category)?.label}</p>

                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                            {deleteConfirmationId === avatar.id ? (
                                <>
                                    <button
                                        onClick={(e) => handleConfirmDelete(e, avatar.id, avatar.url)}
                                        disabled={deleting}
                                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                        title="Onayla"
                                    >
                                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    </button>
                                    <button
                                        onClick={handleCancelDelete}
                                        disabled={deleting}
                                        className="p-1.5 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors shadow-sm"
                                        title="İptal"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggleActive(avatar.id, avatar.is_active)}
                                        className={`p-1.5 rounded-full ${avatar.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}
                                        title={avatar.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                                    >
                                        {avatar.is_active ? '✓' : '○'}
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, avatar.id)}
                                        className="p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                                        title="Sil"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {avatars.length === 0 && (
                <div className="text-center py-12 text-gray-500" >
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Henüz avatar eklenmemiş.</p>
                    <p className="text-sm">Yukarıdaki "Yeni Avatar" butonuna tıklayarak ekleyin.</p>
                </div >
            )}
        </div >
    );
};

export default AdminAvatars;
