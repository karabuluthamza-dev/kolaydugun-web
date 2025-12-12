import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, User, ArrowLeft, Check } from 'lucide-react';
import ForumAvatarSelector from '../components/ForumAvatarSelector';

// Fallback avatarlar (veritabanı boşsa veya hata varsa kullanılır)
const FALLBACK_AVATARS = [
    { id: 1, url: 'https://api.dicebear.com/7.x/micah/svg?seed=bride1&backgroundColor=ffd5dc', name: 'Gelin 1' },
    { id: 2, url: 'https://api.dicebear.com/7.x/micah/svg?seed=bride2&backgroundColor=fff0f5', name: 'Gelin 2' },
    { id: 3, url: 'https://api.dicebear.com/7.x/micah/svg?seed=groom1&backgroundColor=e6e6fa', name: 'Damat 1' },
    { id: 4, url: 'https://api.dicebear.com/7.x/micah/svg?seed=groom2&backgroundColor=d1d4f9', name: 'Damat 2' },
    { id: 5, url: 'https://api.dicebear.com/7.x/shapes/svg?seed=heart&backgroundColor=ff6b6b', name: 'Kalp' },
    { id: 6, url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ring&backgroundColor=ffd700', name: 'Yüzük' },
];

const ProfileSettings = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [defaultAvatars, setDefaultAvatars] = useState([]);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        avatar_url: '',
        forum_avatar_url: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchDefaultAvatars();
        }
    }, [user]);

    const fetchDefaultAvatars = async () => {
        try {
            const { data, error } = await supabase
                .from('default_avatars')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setDefaultAvatars(data?.length > 0 ? data : FALLBACK_AVATARS);
        } catch (error) {
            console.error('Error fetching avatars:', error);
            // Fallback avatarları kullan
            setDefaultAvatars(FALLBACK_AVATARS);
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setProfile({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    avatar_url: data.avatar_url || '',
                    forum_avatar_url: data.forum_avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Lütfen bir resim dosyası seçin' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Dosya boyutu 2MB\'dan küçük olmalı' });
            return;
        }

        try {
            setUploading(true);
            setMessage({ type: '', text: '' });

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // Try to upload to different buckets (avatars first, then images, then public)
            let uploadSuccess = false;
            let publicUrl = '';
            const bucketsToTry = ['avatars', 'images', 'public'];

            for (const bucketName of bucketsToTry) {
                try {
                    const { error: uploadError } = await supabase.storage
                        .from(bucketName)
                        .upload(filePath, file, { upsert: true });

                    if (!uploadError) {
                        const { data } = supabase.storage
                            .from(bucketName)
                            .getPublicUrl(filePath);
                        publicUrl = data.publicUrl;
                        uploadSuccess = true;
                        break;
                    }
                } catch (e) {
                    // Bu bucket çalışmadı, diğerini dene
                    continue;
                }
            }

            if (!uploadSuccess) {
                throw new Error('Dosya yüklenemedi. Lütfen admin ile iletişime geçin veya varsayılan bir avatar seçin.');
            }

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

            // Sync with Auth Session Metadata
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });
            if (authUpdateError) console.error('Auth update error:', authUpdateError);

            setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi!' });
        } catch (error) {
            console.error('Upload error:', error);
            let errorMessage = 'Dosya yüklenemedi.';

            if (error.message && error.message.includes('permission')) {
                errorMessage = 'Yükleme izniniz yok. Lütfen admin ile iletişime geçin.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessage({
                type: 'error',
                text: `${errorMessage} Varsayılan bir avatar seçebilirsiniz.`
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSelectDefaultAvatar = async (avatarUrl) => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: avatarUrl })
                .eq('id', user.id);

            if (error) throw error;

            setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));

            // Sync with Auth Session Metadata
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { avatar_url: avatarUrl }
            });
            if (authUpdateError) console.error('Auth update error:', authUpdateError);

            setShowAvatarPicker(false);
            setMessage({ type: 'success', text: 'Avatar seçildi!' });
        } catch (error) {
            console.error('Avatar select error:', error);
            setMessage({ type: 'error', text: 'Avatar seçilemedi: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: profile.first_name,
                    last_name: profile.last_name
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profil güncellendi!' });
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'Kaydetme hatası: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Lütfen giriş yapın</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Geri</span>
                </button>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <User className="text-purple-500" />
                        Profil Ayarları
                    </h1>

                    {/* Message */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Profil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-purple-600 text-4xl font-bold">
                                        {profile.first_name?.[0] || user.email?.[0] || '?'}
                                    </div>
                                )}
                            </div>

                            {/* Upload Overlay */}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <div className="text-white flex flex-col items-center">
                                    <Camera size={24} />
                                    <span className="text-xs mt-1">
                                        {uploading ? 'Yükleniyor...' : 'Yükle'}
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Avatar Options */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                            >
                                {showAvatarPicker ? '✕ Kapat' : '🎨 Avatar Seç'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Fotoğraf yükleyin veya hazır avatarlardan seçin</p>
                    </div>

                    {/* Avatar Picker */}
                    {showAvatarPicker && (
                        <div className="mb-8 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <h3 className="text-sm font-bold text-purple-700 mb-4">Hazır Avatarlar</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {defaultAvatars.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => handleSelectDefaultAvatar(avatar.url)}
                                        disabled={saving}
                                        className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${profile.avatar_url === avatar.url
                                            ? 'border-purple-500 ring-2 ring-purple-300'
                                            : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        title={avatar.name || avatar.label}
                                    >
                                        <img
                                            src={avatar.url}
                                            alt={avatar.name || avatar.label}
                                            className="w-full h-full object-cover"
                                        />
                                        {profile.avatar_url === avatar.url && (
                                            <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                                                <Check size={16} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ad
                            </label>
                            <input
                                type="text"
                                value={profile.first_name}
                                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Adınız"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Soyad
                            </label>
                            <input
                                type="text"
                                value={profile.last_name}
                                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Soyadınız"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-posta
                            </label>
                            <input
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez</p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>

                {/* Forum Avatar Section */}
                <div className="mt-8">
                    <ForumAvatarSelector
                        currentForumAvatar={profile.forum_avatar_url}
                        onAvatarChange={(newAvatar) => setProfile(prev => ({ ...prev, forum_avatar_url: newAvatar }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
