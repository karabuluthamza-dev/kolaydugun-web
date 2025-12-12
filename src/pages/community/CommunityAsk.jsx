import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const CommunityAsk = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false); // Creating post
    const [fetching, setFetching] = useState(true); // Fetching categories

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: ''
    });

    useEffect(() => {
        if (!user) {
            // Optional: Redirect to login or just show warning
        }
        fetchCategories();
    }, [user]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('forum_categories').select('*').eq('is_visible', true).order('order_index');
        if (data) setCategories(data);
        setFetching(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert(t('community.newTopic.loginRequired'));
        if (!formData.title || !formData.content || !formData.category_id) return alert('Lütfen tüm alanları doldurun.');

        setLoading(true);
        try {
            // Generate basic slug
            const slug = formData.title
                .toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 10000);

            const { data, error } = await supabase
                .from('forum_posts')
                .insert([{
                    user_id: user.id,
                    category_id: formData.category_id,
                    title: formData.title,
                    content: formData.content, // Keeping it simple text for now
                    slug: slug,
                    status: 'published',
                    language: 'tr' // Hardcoded for now
                }])
                .select()
                .single();

            if (error) throw error;

            navigate(`/community/topic/${data.slug}`);

        } catch (error) {
            console.error('Error creating topic:', error);
            alert('Konu açılamadı: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Yükleniyor...</div>;

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border text-center mt-8">
                <h2 className="text-xl font-bold mb-4">{t('community.newTopic.loginMessage')}</h2>
                <button onClick={() => navigate('/login?redirect=/community/ask')} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700">
                    {t('community.newTopic.loginButton')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border mt-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('community.newTopic.title')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('community.newTopic.inputTitle')}</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder={t('community.newTopic.inputTitlePlaceholder')}
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        maxLength={150}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">{formData.title.length}/150</div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('community.newTopic.inputCategory')}</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        value={formData.category_id}
                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    >
                        <option value="">{t('community.newTopic.inputCategoryPlaceholder')}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat[`name_${language}`] || cat.name_tr}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('community.newTopic.inputDetails')}</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none h-40 resize-none"
                        placeholder={t('community.newTopic.inputDetailsPlaceholder')}
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                    >
                        {t('community.newTopic.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition shadow-sm"
                    >
                        {loading ? t('community.newTopic.submitting') : t('community.newTopic.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommunityAsk;
