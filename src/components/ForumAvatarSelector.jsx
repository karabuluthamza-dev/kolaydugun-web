import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Upload, Check, X, Loader2, Camera, Sparkles } from 'lucide-react';

const ForumAvatarSelector = ({ currentForumAvatar, onAvatarChange }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [defaultAvatars, setDefaultAvatars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(currentForumAvatar || null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchDefaultAvatars();
    }, []);

    useEffect(() => {
        setSelectedAvatar(currentForumAvatar || null);
    }, [currentForumAvatar]);

    const fetchDefaultAvatars = async () => {
        try {
            const { data, error } = await supabase
                .from('default_avatars')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setDefaultAvatars(data || []);
        } catch (error) {
            console.error('Error fetching avatars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Lütfen bir resim dosyası seçin' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Dosya boyutu 5MB\'dan küçük olmalıdır' });
            return;
        }

        try {
            setUploading(true);
            setMessage({ type: '', text: '' });

            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `forum-avatar-${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `forum-avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setSelectedAvatar(data.publicUrl);
            setMessage({ type: 'success', text: 'Resim yüklendi!' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Yükleme hatası: ' + error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update({ forum_avatar_url: selectedAvatar })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Forum avatarı kaydedildi!' });
            if (onAvatarChange) onAvatarChange(selectedAvatar);
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'Kaydetme hatası: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleClear = async () => {
        setSelectedAvatar(null);
        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update({ forum_avatar_url: null })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Forum avatarı kaldırıldı' });
            if (onAvatarChange) onAvatarChange(null);
        } catch (error) {
            console.error('Clear error:', error);
            setMessage({ type: 'error', text: 'Hata: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-purple-600" size={24} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Sparkles className="text-purple-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Forum Avatarı</h3>
                    <p className="text-sm text-gray-500">Forum paylaşımlarınızda görünecek avatar</p>
                </div>
            </div>

            {/* Current Selection Preview */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-purple-100 overflow-hidden border-2 border-purple-200">
                    {selectedAvatar ? (
                        <img src={selectedAvatar} alt="Seçili avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                            <Camera size={24} />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-600">
                        {selectedAvatar ? 'Seçili avatar' : 'Avatar seçilmedi - profil resminiz kullanılacak'}
                    </p>
                </div>
                {selectedAvatar && (
                    <button
                        onClick={handleClear}
                        disabled={saving}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Avatarı kaldır"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Upload Custom Photo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kendi Fotoğrafını Yükle
                </label>
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                    {uploading ? (
                        <Loader2 className="animate-spin text-purple-600" size={20} />
                    ) : (
                        <Upload className="text-gray-400" size={20} />
                    )}
                    <span className="text-sm text-gray-600">
                        {uploading ? 'Yükleniyor...' : 'Resim seç veya sürükle'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </div>

            {/* Predefined Avatars */}
            {defaultAvatars.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Hazır Avatarlardan Seç
                    </label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                        {defaultAvatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.url)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedAvatar === avatar.url
                                        ? 'border-purple-600 ring-2 ring-purple-200'
                                        : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <img
                                    src={avatar.url}
                                    alt={avatar.name}
                                    className="w-full h-full object-cover"
                                />
                                {selectedAvatar === avatar.url && (
                                    <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                        <Check className="text-purple-600 bg-white rounded-full p-0.5" size={16} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving || selectedAvatar === currentForumAvatar}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {saving ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Kaydediliyor...
                    </>
                ) : (
                    <>
                        <Check size={18} />
                        Kaydet
                    </>
                )}
            </button>
        </div>
    );
};

export default ForumAvatarSelector;
