import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import * as LucideIcons from 'lucide-react';

const UserProfile = () => {
    const { userId } = useParams();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const fetchUserData = async () => {
        try {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url, forum_avatar_url, created_at, role')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;
            setUser(profile);

            // Fetch user's posts
            const { data: userPosts, error: postsError } = await supabase
                .from('forum_posts')
                .select(`
                    id, title, slug, created_at, view_count,
                    category:category_id(name_tr, slug)
                `)
                .eq('user_id', userId)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (!postsError) setPosts(userPosts || []);

            // Fetch user's comments with post info
            const { data: userComments, error: commentsError } = await supabase
                .from('forum_comments')
                .select(`
                    id, content, created_at,
                    post:post_id(id, title, slug)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (!commentsError) setComments(userComments || []);

        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return formatDate(dateStr);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CB4F4F] border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <LucideIcons.UserX size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-600">Kullanıcı bulunamadı</h2>
                <Link to="/community" className="text-[#CB4F4F] hover:underline mt-4 inline-block">
                    ← Foruma dön
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-[#E6DCC3] mb-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#E8C27A]/30 shadow-lg flex-shrink-0">
                        {(user.forum_avatar_url || user.avatar_url) ? (
                            <img
                                src={user.forum_avatar_url || user.avatar_url}
                                alt={user.first_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#CB4F4F] to-[#E8C27A] flex items-center justify-center text-white text-3xl font-bold">
                                {user.first_name?.[0] || 'U'}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-800 font-serif">
                                {user.first_name} {user.last_name}
                            </h1>
                            {user.role === 'vendor' && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                                    🏢 Tedarikçi
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            <LucideIcons.Calendar size={14} />
                            Üyelik: {formatDate(user.created_at)}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-6 mt-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#1F5F5B]">{posts.length}</div>
                                <div className="text-xs text-gray-500 font-medium">Konu</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#CB4F4F]">{comments.length}</div>
                                <div className="text-xs text-gray-500 font-medium">Yorum</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'posts'
                            ? 'bg-[#1F5F5B] text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-[#E6DCC3]'
                        }`}
                >
                    <LucideIcons.FileText size={16} className="inline mr-2" />
                    Konuları ({posts.length})
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'comments'
                            ? 'bg-[#CB4F4F] text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-[#E6DCC3]'
                        }`}
                >
                    <LucideIcons.MessageCircle size={16} className="inline mr-2" />
                    Yorumları ({comments.length})
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'posts' && (
                    <>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <Link
                                    key={post.id}
                                    to={`/community/topic/${post.slug}`}
                                    className="block bg-white rounded-[20px] p-5 shadow-sm border border-[#E6DCC3] hover:shadow-md hover:border-[#1F5F5B]/30 transition-all group"
                                >
                                    <h3 className="font-bold text-gray-800 group-hover:text-[#1F5F5B] transition-colors mb-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="bg-[#FFF5F0] text-[#CB4F4F] px-2 py-1 rounded font-medium">
                                            {post.category?.name_tr}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <LucideIcons.Eye size={12} />
                                            {post.view_count || 0} görüntüleme
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <LucideIcons.Clock size={12} />
                                            {timeAgo(post.created_at)}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <LucideIcons.FileX size={48} className="mx-auto mb-3 opacity-50" />
                                <p>Henüz konu açılmamış</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'comments' && (
                    <>
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <Link
                                    key={comment.id}
                                    to={`/community/topic/${comment.post?.slug}#comment-${comment.id}`}
                                    className="block bg-white rounded-[20px] p-5 shadow-sm border border-[#E6DCC3] hover:shadow-md hover:border-[#CB4F4F]/30 transition-all group"
                                >
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        "{comment.content?.replace(/<[^>]*>?/gm, '').slice(0, 150)}..."
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <LucideIcons.CornerDownRight size={12} className="text-[#CB4F4F]" />
                                        <span className="font-medium text-[#1F5F5B] group-hover:underline">
                                            {comment.post?.title}
                                        </span>
                                        <span>•</span>
                                        <span>{timeAgo(comment.created_at)}</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <LucideIcons.MessageSquareX size={48} className="mx-auto mb-3 opacity-50" />
                                <p>Henüz yorum yapılmamış</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
                <Link
                    to="/community"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-[#CB4F4F] transition-colors font-medium"
                >
                    <LucideIcons.ArrowLeft size={18} />
                    Foruma Dön
                </Link>
            </div>
        </div>
    );
};

export default UserProfile;
