import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';



import { useParams, useSearchParams } from 'react-router-dom'; // Added useSearchParams

const CommunityHome = () => {
    const { t, language, translations } = useLanguage();
    const { categorySlug } = useParams(); // Get slug if exists
    const [searchParams] = useSearchParams();
    const authorFilter = searchParams.get('author'); // NEW: Get author from query
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true); // Reset loading on slug change
        fetchPosts();
    }, [categorySlug, authorFilter]);

    const fetchPosts = async () => {
        try {
            let data = [];
            let error = null;

            // If author filter is active, first try to get their posts
            if (authorFilter) {
                const { data: authorPosts, error: postsError } = await supabase
                    .from('forum_posts')
                    .select(`
                        *,
                        profile:profiles!forum_posts_user_id_profiles_fk(first_name, last_name, avatar_url, forum_avatar_url, role),
                        category:category_id(name_tr, icon, slug)
                    `)
                    .eq('status', 'published')
                    .eq('user_id', authorFilter)
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;

                // If author has posts, use them
                if (authorPosts && authorPosts.length > 0) {
                    data = authorPosts;
                } else {
                    // Author has no posts, find posts they commented on
                    const { data: comments, error: commentsError } = await supabase
                        .from('forum_comments')
                        .select('post_id')
                        .eq('user_id', authorFilter);

                    if (commentsError) throw commentsError;

                    if (comments && comments.length > 0) {
                        const postIds = [...new Set(comments.map(c => c.post_id))];

                        const { data: commentedPosts, error: commentedError } = await supabase
                            .from('forum_posts')
                            .select(`
                                *,
                                profile:profiles!forum_posts_user_id_profiles_fk(first_name, last_name, avatar_url, forum_avatar_url, role),
                                category:category_id(name_tr, icon, slug)
                            `)
                            .eq('status', 'published')
                            .in('id', postIds)
                            .order('created_at', { ascending: false });

                        if (commentedError) throw commentedError;
                        data = commentedPosts || [];
                    }
                }
            } else if (categorySlug) {
                // Category filter
                const { data: catPosts, error: catError } = await supabase
                    .from('forum_posts')
                    .select(`
                        *,
                        profile:profiles!forum_posts_user_id_profiles_fk(first_name, last_name, avatar_url, forum_avatar_url, role),
                        category:category_id!inner(name_tr, icon, slug)
                    `)
                    .eq('category.slug', categorySlug)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                if (catError) throw catError;
                data = catPosts || [];
            } else {
                // Default - all posts
                const { data: allPosts, error: allError } = await supabase
                    .from('forum_posts')
                    .select(`
                        *,
                        profile:profiles!forum_posts_user_id_profiles_fk(first_name, last_name, avatar_url, forum_avatar_url, role),
                        category:category_id(name_tr, icon, slug)
                    `)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (allError) throw allError;
                data = allPosts || [];
            }

            // Enrich vendor posts with business_name
            const enrichedPosts = await Promise.all((data || []).map(async (post) => {
                if (post.profile?.role === 'vendor') {
                    const { data: vendorData } = await supabase
                        .from('vendors')
                        .select('business_name, image_url')
                        .eq('user_id', post.user_id)
                        .single();

                    return {
                        ...post,
                        vendorInfo: vendorData || null
                    };
                }
                return post;
            }));

            setPosts(enrichedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Display posts directly from database (no mock data)
    const displayPosts = posts;

    // Arama filtresi
    const filteredPosts = searchQuery.trim()
        ? displayPosts.filter(post =>
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : displayPosts;

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-[#F0EBE0] h-48 animate-pulse"></div>
            ))}
        </div>
    );

    // LoadingSkeleton and loading check already exist above. 
    if (loading) return <LoadingSkeleton />;



    return (
        <div className="space-y-6 relative">
            {/* Ask Question Button - Floating on Mobile, Fixed on Desktop */}
            <Link
                to="/community/ask"
                className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 font-bold group md:absolute md:top-0 md:right-0 md:bottom-auto md:w-auto md:h-auto md:rounded-lg md:py-3 md:px-6"
            >
                <LucideIcons.PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                <span className="hidden md:inline">{t('community.newTopic.button') || 'Yeni Konu Aç'}</span>
            </Link>
            {/* Arama Kutusu */}
            <div className="relative">
                <LucideIcons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={t('community.search') || 'Konularda ara...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-[#E6DCC3] focus:outline-none focus:ring-2 focus:ring-[#1F5F5B]/20 focus:border-[#1F5F5B] shadow-sm transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <LucideIcons.X size={18} />
                    </button>
                )}
            </div>

            {/* Sonuç sayısı */}
            {searchQuery && (
                <p className="text-sm text-gray-500">
                    "{searchQuery}" için {filteredPosts.length} sonuç bulundu
                </p>
            )}

            {filteredPosts.map((post, index) => (
                <article key={post.id} className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative group">

                    {/* Header: User Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm">
                            {(post.profile?.forum_avatar_url || post.vendorInfo?.image_url || post.profile?.avatar_url) ? (
                                <img src={post.profile?.forum_avatar_url || post.vendorInfo?.image_url || post.profile?.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#E8C27A] flex items-center justify-center text-white font-bold">
                                    {(post.vendorInfo?.business_name || post.profile?.first_name || 'U')[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800 text-sm leading-none">
                                    {post.vendorInfo?.business_name || `${post.profile?.first_name || ''} ${post.profile?.last_name || ''}`.trim() || 'Anonim'}
                                </h4>
                                {post.profile?.role === 'vendor' && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">🏢 Tedarikçi</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <Link to={`/community/topic/${post.slug}`} className="block mb-4">
                        <h2 className="text-xl font-bold text-[#1F5F5B] mb-2 font-serif leading-tight group-hover:text-[#CB4F4F] transition-colors">
                            {post.title}
                        </h2>
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">
                            {post.content.replace(/<[^>]*>?/gm, '')}
                        </p>
                    </Link>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(post.tags || [t('community.tags.weddingdress'), t('community.tags.fashion'), t('community.tags.suggestion')]).map((tag, i) => (
                            <span key={i} className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer 
                                ${i === 0 ? 'bg-[#CB4F4F] text-white' :
                                    i === 1 ? 'bg-[#E8C27A] text-white' :
                                        'bg-[#E5E5E5] text-gray-600'}`}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Footer: Stats - EXACTLY AS MOCKUP */}
                    <div className="flex items-center justify-between text-gray-400 text-xs font-bold border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-6">
                            <Link
                                to={`/community/topic/${post.slug}#comments`}
                                className="flex items-center gap-1.5 hover:text-[#CB4F4F] transition-colors cursor-pointer"
                            >
                                <LucideIcons.MessageCircle size={16} />
                                <span>{post.stats?.comments || 23}</span>
                            </Link>
                            <div className="flex items-center gap-1.5 hover:text-[#CB4F4F] transition-colors cursor-pointer">
                                <LucideIcons.Heart size={16} />
                                <span>{post.stats?.likes || '1.2K'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 hover:text-[#CB4F4F] transition-colors cursor-pointer">
                                <LucideIcons.Eye size={16} />
                                <span>{post.view_count || '150K'}</span>
                            </div>
                            <button
                                onClick={() => {
                                    const shareUrl = `${window.location.origin}/community/topic/${post.slug}`;
                                    if (navigator.share) {
                                        navigator.share({
                                            title: post.title,
                                            text: post.content?.slice(0, 100),
                                            url: shareUrl
                                        });
                                    } else {
                                        navigator.clipboard.writeText(shareUrl);
                                        alert(t('community.linkCopied') || 'Link kopyalandı!');
                                    }
                                }}
                                className="flex items-center gap-1.5 hover:text-[#1F5F5B] transition-colors cursor-pointer"
                            >
                                <LucideIcons.Share2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <span>5s</span>
                            <span>1g</span>
                            <div className="flex items-center gap-1">
                                <LucideIcons.Clock size={14} />
                                <span>{index === 0 ? `2 ${t('community.stats.hoursAgo')}` : `8 ${t('community.stats.hoursAgo')}`}</span>
                            </div>
                        </div>
                    </div>

                </article>
            ))}
        </div>
    );
};

export default CommunityHome;
