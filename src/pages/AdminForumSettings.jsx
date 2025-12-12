import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminForumSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('forum_settings')
                .select('*')
                .maybeSingle();

            if (error) {
                // If table doesn't exist yet, this might error. 
                // But Phase 1 verified it exists.
                throw error;
            }

            if (data) {
                setSettings(data);
            } else {
                // Create default if missing (Fallback)
                const { data: newData, error: createError } = await supabase
                    .from('forum_settings')
                    .insert([{ is_enabled: false, maintenance_mode: true }])
                    .select()
                    .single();

                if (createError) throw createError;
                setSettings(newData);
            }
        } catch (err) {
            console.error('Error fetching forum settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key) => {
        if (!settings) return;

        const newVal = !settings[key];
        const { error } = await supabase
            .from('forum_settings')
            .update({ [key]: newVal })
            .eq('id', settings.id);

        if (error) {
            alert('Hata: ' + error.message);
        } else {
            setSettings({ ...settings, [key]: newVal });
        }
    };

    if (loading) return <div className="p-4">Yükleniyor...</div>;
    if (error) return <div className="p-4 text-red-500">Hata: {error}</div>;

    return (
        <div className="admin-container">
            <h1 className="admin-title">Topluluk (Forum) Yönetimi</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Master Control Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🎮 Ana Kumanda
                    </h2>

                    <div className="space-y-6">
                        {/* Master Switch */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div>
                                <h3 className="font-bold text-gray-800">Forum Sistemi</h3>
                                <p className="text-sm text-gray-500">
                                    {settings.is_enabled ? 'Şu an aktif. Kullanıcılar görebilir.' : 'Kapalı. Sitede görünmez.'}
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.is_enabled}
                                    onChange={() => handleToggle('is_enabled')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div>
                                <h3 className="font-bold text-yellow-800">🚧 Bakım Modu</h3>
                                <p className="text-sm text-yellow-600">
                                    Aktifse, kullanıcılar "Çok Yakında" görür.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenance_mode}
                                    onChange={() => handleToggle('maintenance_mode')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. Visibility Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        👁️ Görünürlük
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.sidebar_widget_enabled}
                                onChange={() => handleToggle('sidebar_widget_enabled')}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span>Blog detayında "Forum Widget" göster</span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
                        <p><strong>💡 İpucu:</strong> Kategorileri düzenlemek ve Yapay Zeka (Hayalet) modunu kullanmak için sol menüdeki alt başlıklara gidiniz.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><a href="/admin/forum-categories" className="underline">Kategori Yönetimi</a></li>
                            <li><a href="/admin/forum-ghosts" className="underline">Hayalet Simülasyonu</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminForumSettings;
