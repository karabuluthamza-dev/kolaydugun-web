import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import * as LucideIcons from 'lucide-react';

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
        if (!formData.title || !formData.content || !formData.category_id) return alert(t('community.newTopic.fillAllFields'));

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
            alert(t('community.newTopic.topicCreateError') + error.message);
        } finally {
            setLoading(false);
        }
    };

    const [showImageInput, setShowImageInput] = useState(false);
    const [showVideoInput, setShowVideoInput] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const handleAddImage = () => {
        if (!imageUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            content: prev.content + (prev.content ? '\n' : '') + imageUrl.trim() + '\n'
        }));
        setImageUrl('');
        // setShowImageInput(false); // Keep open for multi-add
    };

    const handleAddVideo = () => {
        if (!videoUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            content: prev.content + (prev.content ? '\n' : '') + videoUrl.trim() + '\n'
        }));
        setVideoUrl('');
        // setShowVideoInput(false); // Keep open for multi-add
    };

    if (fetching) return <div className="p-8 text-center child-bounce">{t('community.loading')}</div>;

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border text-center mt-8">
                <h2 className="text-xl font-extrabold mb-4 text-gray-800">{t('community.newTopic.loginMessage')}</h2>
                <button onClick={() => navigate('/login?redirect=/community/ask')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition">
                    {t('community.newTopic.loginButton')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-[32px] shadow-xl shadow-purple-900/5 border border-purple-50 mt-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-60"></div>

            <h1 className="text-3xl font-black mb-8 text-gray-900 tracking-tight flex items-center gap-3">
                <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">✨</span>
                {t('community.newTopic.title')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('community.newTopic.inputTitle')}</label>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl p-4 transition-all outline-none text-lg font-medium text-gray-800"
                        placeholder={t('community.newTopic.inputTitlePlaceholder')}
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        maxLength={150}
                    />
                    <div className="text-right text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">{formData.title.length}/150</div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('community.newTopic.inputCategory')}</label>
                    <div className="relative">
                        <select
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-2xl p-4 transition-all outline-none appearance-none cursor-pointer font-medium text-gray-700"
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                        >
                            <option value="">{t('community.newTopic.inputCategoryPlaceholder')}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat[`name_${language}`] || cat.name_tr}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <LucideIcons.ChevronDown size={20} />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 px-1">
                        <label className="text-sm font-bold text-gray-700">{t('community.newTopic.inputDetails')}</label>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => { setShowImageInput(!showImageInput); setShowVideoInput(false); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                                <LucideIcons.Image size={16} />
                                {t('community.media.addImage')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowVideoInput(!showVideoInput); setShowImageInput(false); }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-bold hover:bg-red-200 transition-all shadow-sm"
                            >
                                <LucideIcons.PlayCircle size={16} />
                                {t('community.media.addVideo')}
                            </button>
                        </div>
                    </div>

                    {showImageInput && (
                        <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[24px] border border-purple-100 animate-fade-in shadow-inner relative overflow-hidden group">
                            <a
                                href="https://imgur.com/upload"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-all hover:scale-110 cursor-pointer"
                                title="Imgur'da Resim Yükle"
                            >
                                <LucideIcons.Image size={64} />
                            </a>
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-purple-800 mb-1 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-200 rounded-lg flex items-center justify-center text-[10px]">1</span>
                                    {t('community.media.imageTitle') || "Resim Ekle"}
                                </div>
                                <a
                                    href="https://imgur.com/upload"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] text-purple-600 hover:text-purple-800 mb-4 font-bold bg-purple-100/50 px-3 py-1 rounded-full border border-purple-200/50 transition-colors"
                                >
                                    <span>✨ {t('community.media.imageHelp')}</span>
                                    <LucideIcons.ExternalLink size={10} />
                                </a>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 group/input">
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-purple-100 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                            placeholder={t('community.media.imagePlaceholder')}
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300">
                                            <LucideIcons.Link size={16} />
                                        </div>

                                        {/* Canlı Ön İzleme */}
                                        {imageUrl.trim() && (
                                            <div className="absolute -top-32 left-0 w-32 h-32 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-1 animate-bounce-subtle overflow-hidden z-20 pointer-events-none">
                                                <img
                                                    src={/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)$/i.test(imageUrl) && !/\.(jpeg|jpg|gif|png|webp)$/i.test(imageUrl)
                                                        ? `https://i.imgur.com/${imageUrl.match(/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)$/i)[1]}.jpg`
                                                        : imageUrl
                                                    }
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-xl"
                                                    onError={(e) => e.target.parentElement.style.display = 'none'}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddImage}
                                        className="bg-purple-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-purple-700 transition shadow-lg shadow-purple-200 active:scale-95"
                                    >
                                        {t('community.media.add')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showVideoInput && (
                        <div className="mb-6 p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-[24px] border border-red-100 animate-fade-in shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <LucideIcons.PlayCircle size={64} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-red-800 mb-1 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-red-200 rounded-lg flex items-center justify-center text-[10px]">2</span>
                                    {t('community.media.videoTitle') || "Video Ekle"}
                                </div>
                                <div className="text-[11px] text-red-600/80 mb-4 font-medium leading-relaxed">
                                    🎬 {t('community.media.videoHelp') || "YouTube veya TikTok linkini yapıştırın."}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 group/input">
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-red-100 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-4 focus:ring-red-200 focus:border-red-400 transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                            placeholder={t('community.media.videoPlaceholder')}
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300">
                                            <LucideIcons.Youtube size={16} />
                                        </div>

                                        {/* Video Ön İzleme */}
                                        {videoUrl.trim() && (
                                            <div className="absolute -top-40 left-0 w-64 aspect-video bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-1 animate-bounce-subtle overflow-hidden z-20 pointer-events-none">
                                                {(() => {
                                                    const ytMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|shorts\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
                                                    if (ytMatch) {
                                                        return <img src={`https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`} alt="Preview" className="w-full h-full object-cover rounded-xl" />;
                                                    }
                                                    const ttMatch = videoUrl.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)?(\d+)/i);
                                                    if (ttMatch) {
                                                        return <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-bold text-xs gap-2">
                                                            <LucideIcons.Music size={16} /> TikTok Video
                                                        </div>;
                                                    }
                                                    return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[10px]">{videoUrl ? 'Desteklenmeyen Medya' : ''}</div>;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddVideo}
                                        className="bg-red-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-red-700 transition shadow-lg shadow-red-200 active:scale-95"
                                    >
                                        {t('community.media.add')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative group">
                        <textarea
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 focus:bg-white rounded-[24px] p-6 transition-all outline-none h-64 resize-y text-gray-700 leading-relaxed font-medium"
                            placeholder={t('community.newTopic.inputDetailsPlaceholder') || "Sorunuzu veya düşüncelerinizi detaylandırın..."}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        ></textarea>
                        <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[10px] text-gray-400 font-bold uppercase pointer-events-none">
                            {t('community.media.autoMediaActive')}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/community')}
                        className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
                    >
                        {t('community.newTopic.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-3 rounded-2xl font-black hover:shadow-xl disabled:opacity-50 transition transform hover:-translate-y-0.5"
                    >
                        {loading ? t('community.newTopic.submitting') : t('community.newTopic.submit')}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default CommunityAsk;
