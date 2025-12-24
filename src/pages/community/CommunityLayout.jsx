import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import * as LucideIcons from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import Maintenance from '../Maintenance'; // Assuming this exists based on MaintenanceCheck usage

const CommunityLayout = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth(); // Get user for admin bypass
    const location = useLocation();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [forumSettings, setForumSettings] = useState(null);
    const [loading, setLoading] = useState(true);



    // Widget States
    const [newPosts, setNewPosts] = useState([]); // NEW: For "Yeni Konular"
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [popularTags, setPopularTags] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Categories
                const { data: cats } = await supabase.from('forum_categories').select('*').eq('is_visible', true).order('order_index');
                if (cats) setCategories(cats);

                // 2. Fetch Settings
                const { data: settings } = await supabase.from('forum_settings').select('*').maybeSingle();
                if (settings) setForumSettings(settings);

                // 3. Fetch NEW Posts (Top 5 by created_at)
                const { data: newData } = await supabase
                    .from('forum_posts')
                    .select('id, title, slug, created_at')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setNewPosts(newData || []);

                // 4. Fetch Trending (Top 5 by view_count) - Reverted to view_count
                const { data: trendData } = await supabase
                    .from('forum_posts')
                    .select('id, title, slug, view_count')
                    .eq('status', 'published')
                    .order('view_count', { ascending: false })
                    .limit(5);
                setTrendingPosts(trendData || []);

                // 5. Fetch Active Users (Top 5 by message count)
                const { data: usersData, error: usersError } = await supabase.rpc('get_top_active_users');

                if (usersData && usersData.length > 0) {
                    setActiveUsers(usersData.map(u => ({
                        ...u,
                        msgCount: u.message_count // Remap for UI consistency if needed
                    })));
                } else {
                    // Fallback or keep empty if no data
                    setActiveUsers([]);
                }

                // 5. Popular Tags
                const { data: tagsData, error: tagsError } = await supabase.rpc('get_popular_tags');

                if (tagsData && tagsData.length > 0) {
                    const colors = ["bg-[#CB4F4F]", "bg-[#E8C27A]", "bg-[#1F5F5B]", "bg-[#D4A373]", "bg-[#9A3412]"];
                    const formattedTags = tagsData.map((t, index) => ({
                        label: t.tag,
                        count: t.count,
                        color: colors[index % colors.length]
                    }));
                    setPopularTags(formattedTags);
                } else {
                    // Fallback/Empty state if no tags found (or before SQL is run)
                    setPopularTags([]);
                }

            } catch (error) {
                console.error("Forum data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... (rest of component render)

    // Helper for rendering icons
    const renderIcon = (name) => {
        try {
            const IconComponent = LucideIcons[name] || LucideIcons.MessageCircle;
            if (typeof IconComponent !== 'function' && typeof IconComponent !== 'object') {
                return <LucideIcons.MessageCircle size={20} />;
            }
            return <IconComponent size={20} />;
        } catch (e) {
            console.error("Icon render error:", e);
            return <LucideIcons.MessageCircle size={20} />;
        }
    };

    return (
        <div className="community-wrapper min-h-screen font-sans bg-[#FFF3ED]">
            {/* ... (Left Sidebar Unchanged) ... */}

            {/* ... (Main Feed Unchanged) ... */}
            <div className="container mx-auto px-4 lg:px-6 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[175px_1fr_320px] gap-8 items-start">

                    <aside className="order-1 space-y-6 sticky top-8">
                        {/* Categories Section (Keep existing code) */}
                        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3] h-full">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-serif text-xl font-bold text-[#CB4F4F]">
                                    {t('community.categories')}
                                </h3>
                                <LucideIcons.ChevronRight className="lg:hidden text-gray-400" size={20} />
                            </div>

                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <NavLink
                                        key={cat.id}
                                        to={`/community/category/${cat.slug}`}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group
                                            ${isActive
                                                ? 'bg-[#FFF5F0] text-[#CB4F4F] font-bold shadow-sm ring-1 ring-[#CB4F4F]/20'
                                                : 'text-gray-600 hover:bg-[#FFF5F0] hover:text-[#CB4F4F] border border-transparent hover:border-[#CB4F4F]/10'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-5 h-5 flex items-center justify-center transition-colors
                                            ${location.pathname.includes(cat.slug) ? 'text-[#CB4F4F]' : 'text-[#E8C27A] group-hover:text-[#CB4F4F]'}
                                        `}>
                                            {renderIcon(cat.icon)}
                                        </div>
                                        <span className="font-medium text-sm truncate">
                                            {cat[`name_${language}`] || cat.name_tr}
                                        </span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="lg:hidden">
                            <button
                                onClick={() => navigate('/community/ask')}
                                className="block w-full text-center bg-[#CB4F4F] text-white p-4 rounded-[20px] shadow-lg shadow-orange-100 font-bold hover:bg-[#B04343] transition-colors flex items-center justify-center gap-2"
                            >
                                <LucideIcons.MessageCircleHeart size={20} />
                                <span>{t('community.askButton')}</span>
                            </button>
                        </div>
                    </aside>

                    <main className="order-2 w-full min-w-0">
                        <div className="text-center mb-10 relative">
                            <div className="inline-block relative px-4 pb-3">
                                <h2 className="font-serif text-4xl font-bold text-[#1F5F5B]">{t('community.today')}</h2>
                                <div className="h-px w-12 mx-auto bg-[#E8C27A] absolute bottom-0 left-0 right-0"></div>
                            </div>
                        </div>
                        <Outlet />
                    </main>

                    <aside className="order-3 space-y-10 sticky top-8">
                        {/* Trending Block - MOVED TOP */}
                        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3]">
                            <h3 className="font-serif text-lg font-bold text-[#CB4F4F] mb-5 flex items-center gap-2">
                                {t('community.trending')} <span className="text-xl">🔥</span>
                            </h3>
                            <div className="space-y-3">
                                {trendingPosts.length > 0 ? (
                                    trendingPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/community/topic/${post.slug}`)}
                                            className="flex items-center gap-3 text-gray-700 hover:text-[#CB4F4F] cursor-pointer transition-colors font-bold text-sm group py-1"
                                        >
                                            <span className="text-[#E8C27A] text-lg group-hover:scale-110 transition-transform">🔥</span>
                                            {post.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 text-sm italic">Henüz popüler konu yok.</div>
                                )}
                            </div>
                        </div>

                        {/* NEW TOPICS WIDGET - MOVED BELOW */}
                        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3]">
                            <h3 className="font-serif text-lg font-bold text-[#1F5F5B] mb-5 flex items-center gap-2">
                                {t('community.newTopics') || 'Yeni Konular'} <span className="text-xl">✨</span>
                            </h3>
                            <div className="space-y-3">
                                {newPosts.length > 0 ? (
                                    newPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/community/topic/${post.slug}`)}
                                            className="flex items-start gap-3 text-gray-700 hover:text-[#1F5F5B] cursor-pointer transition-colors font-bold text-sm group py-1"
                                        >
                                            <div className="mt-1 w-2 h-2 rounded-full bg-[#E8C27A] flex-shrink-0 group-hover:bg-[#1F5F5B] transition-colors"></div>
                                            <span className="line-clamp-2">{post.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 text-sm italic">Henüz yeni konu yok.</div>
                                )}
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3]">
                            <h3 className="font-serif text-lg font-bold text-[#CB4F4F] mb-5">
                                {t('community.popularTags')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map((tag, i) => (
                                    <span key={i} className={`${tag.color} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 cursor-pointer transition-transform hover:scale-105`}>
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3]">
                            <h3 className="font-serif text-lg font-bold text-[#CB4F4F] mb-5">
                                {t('community.activeMembers')}
                            </h3>
                            <div className="space-y-4">
                                {activeUsers.map((user, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`/community/user/${user.user_id}`)}
                                        className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                                    >
                                        <img src={user.forum_avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}`} alt={user.first_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md group-hover:scale-105 transition-transform" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-bold text-gray-800 group-hover:text-[#CB4F4F] transition-colors truncate">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-[10px] font-bold text-[#0F8A65] bg-[#0F8A65]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {user.msgCount} {t('community.stats.messages')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CommunityLayout;
