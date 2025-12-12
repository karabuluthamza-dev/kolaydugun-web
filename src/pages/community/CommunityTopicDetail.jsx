import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { adminNotifications } from '../../utils/adminNotifications';
import * as LucideIcons from 'lucide-react';

const CommunityTopicDetail = () => {
    const { slug } = useParams();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Report State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportSuccessMessage, setReportSuccessMessage] = useState('');

    // Edit/Delete Comment State
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    // Edit/Delete Topic State (for topic owners)
    const [isEditingTopic, setIsEditingTopic] = useState(false);
    const [editTopicTitle, setEditTopicTitle] = useState('');
    const [editTopicContent, setEditTopicContent] = useState('');
    const [savingTopicEdit, setSavingTopicEdit] = useState(false);
    const [showDeleteTopicConfirm, setShowDeleteTopicConfirm] = useState(false);
    const [deletingTopic, setDeletingTopic] = useState(false);

    useEffect(() => {
        fetchPostAndComments();
        // Increment view count (simple implementation)
        incrementViewCount();
    }, [slug]);

    const incrementViewCount = async () => {
        // Find ID first to update safely
        const { data } = await supabase.from('forum_posts').select('id, view_count').eq('slug', slug).single();
        if (data) {
            await supabase.from('forum_posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
        }
    };

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            // 1. Fetch Post
            const { data: postData, error: postError } = await supabase
                .from('forum_posts')
                .select(`
                    *,
                    profile:profiles!forum_posts_user_id_profiles_fk(first_name, last_name, avatar_url, forum_avatar_url, role),
                    category:category_id(name_tr, icon, slug)
                `)
                .eq('slug', slug)
                .single();

            if (postError) throw postError;

            if (!postData) {
                const err = { message: "No data returned (Not Found or RLS)", slug, status: 'Not Found' };
                setErrorState(err);
                throw err;
            }

            // Vendor ise image_url'i ve business_name'i çek
            let vendorLogo = null;
            let vendorBusinessName = null;

            if (postData.profile?.role === 'vendor') {
                const { data: vendorData, error: vendorError } = await supabase
                    .from('vendors')
                    .select('image_url, business_name')
                    .eq('user_id', postData.user_id)
                    .single();
                if (vendorData) {
                    vendorLogo = vendorData.image_url || null;
                    vendorBusinessName = vendorData.business_name || null;
                }
            }

            // Check if user liked this post
            let liked = false;
            if (user) {
                const { data: likeData } = await supabase
                    .from('forum_post_likes')
                    .select('*')
                    .eq('post_id', postData.id)
                    .eq('user_id', user.id)
                    .single();
                if (likeData) liked = true;
            }

            // Avatar önceliği: forum_avatar_url > vendor image_url > profiles avatar_url > null
            const avatarUrl = postData.profile?.forum_avatar_url || vendorLogo || postData.profile?.avatar_url || null;
            // İsim önceliği: vendor business_name > profile first_name
            const displayName = vendorBusinessName || `${postData.profile?.first_name || ''} ${postData.profile?.last_name || ''}`.trim();
            const isVendor = postData.profile?.role === 'vendor';

            setPost({
                ...postData,
                isLiked: liked,
                effectiveAvatarUrl: avatarUrl,
                effectiveDisplayName: displayName,
                isVendor: isVendor
            });

            // 2. Fetch Comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('forum_comments')
                .select(`
                    *,
                    profile:profiles!forum_comments_user_id_profiles_fk(first_name, last_name, avatar_url, forum_avatar_url, is_bot)
                `)
                .eq('post_id', postData.id)
                .eq('status', 'published') // Only show published comments
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData || []);

            // Scroll to comment if hash exists
            setTimeout(() => {
                const hash = window.location.hash;
                if (hash && hash.startsWith('#comment-')) {
                    const element = document.getElementById(hash.slice(1));
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('ring-2', 'ring-purple-400');
                        setTimeout(() => element.classList.remove('ring-2', 'ring-purple-400'), 3000);
                    }
                }
            }, 500);

        } catch (error) {
            console.error('Error fetching topic:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) return alert(t('community.topic.loginToReply')); // Or generic "Login to like"

        const previousState = { ...post };
        // Optimistic Update
        const newIsLiked = !post.isLiked;
        const newCount = (post.like_count || 0) + (newIsLiked ? 1 : -1);

        setPost({ ...post, isLiked: newIsLiked, like_count: newCount });

        try {
            if (newIsLiked) {
                // Insert Like
                await supabase.from('forum_post_likes').insert([{ post_id: post.id, user_id: user.id }]);
                // Increment Count in Posts table (optional trigger but good for redundant)
                await supabase.rpc('increment_post_likes', { post_id: post.id });

                // Konu sahibine beğeni bildirimi gönder (kendi beğenisine bildirim gönderme)
                if (post.user_id && post.user_id !== user.id) {
                    const likerName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Biri';
                    await supabase.from('user_notifications').insert({
                        user_id: post.user_id,
                        type: 'forum_like',
                        title: JSON.stringify({ key: 'notifications.forum.newLike', args: {} }),
                        message: JSON.stringify({ key: 'notifications.forum.likeMessage', args: { name: likerName, topic: post.title?.slice(0, 30) } }),
                        deep_link: `/community/topic/${post.slug}`,
                        is_read: false
                    });
                }
            } else {
                // Remove Like
                await supabase.from('forum_post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
                // Decrement Count
                await supabase.rpc('decrement_post_likes', { post_id: post.id });
            }
        } catch (error) {
            console.error("Like error:", error);
            setPost(previousState); // Revert
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert(t('community.topic.loginToReply'));
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('forum_comments')
                .insert([{
                    post_id: post.id,
                    user_id: user.id,
                    content: newComment,
                    status: 'published' // Auto-publish for now
                }])
                .select()
                .single();

            if (error) throw error;

            // Konu sahibine bildirim gönder (kendi yorumuna bildirim gönderme)
            if (post.user_id && post.user_id !== user.id) {
                const commenterName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Biri';
                await supabase.from('user_notifications').insert({
                    user_id: post.user_id,
                    type: 'forum_comment',
                    title: JSON.stringify({ key: 'notifications.forum.newComment', args: {} }),
                    message: JSON.stringify({ key: 'notifications.forum.commentMessage', args: { name: commenterName, topic: post.title?.slice(0, 30) } }),
                    deep_link: `/community/topic/${post.slug}`,
                    is_read: false
                });
            }

            // Optimistic update
            setComments([...comments, {
                ...data,
                profile: {
                    first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || t('community.member'),
                    last_name: user.user_metadata?.last_name || '',
                    avatar_url: user.avatar_url || user.user_metadata?.avatar_url
                }
            }]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert(t('common.error') || 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReportSubmit = async () => {
        if (!user) {
            alert(t('community.topic.loginToReply'));
            return;
        }

        setSubmittingReport(true);
        try {
            const { error } = await supabase
                .from('forum_reports')
                .insert([{
                    post_id: post.id,
                    reporter_id: user.id,
                    reason: reportReason,
                    status: 'pending'
                }]);

            if (error) throw error;

            // Send admin notification about the report
            try {
                await adminNotifications.forumReport({
                    reason: reportReason,
                    post_title: post.title
                });
            } catch (notifError) {
                console.error('Admin notification failed:', notifError);
            }

            setShowReportModal(false);
            setReportReason('');
            // Show inline success message
            setReportSuccessMessage(t('community.topic.reportSuccess'));
            // Auto-hide after 4 seconds
            setTimeout(() => setReportSuccessMessage(''), 4000);
        } catch (error) {
            console.error('Report error:', error);
            alert(t('community.topic.reportError') + error.message);
        } finally {
            setSubmittingReport(false);
        }
    };

    const renderIcon = (name) => {
        const Icon = LucideIcons[name] || LucideIcons.MessageCircle;
        return <Icon size={16} />;
    };

    // Check if user can edit comment (within 15 minutes)
    const canEditComment = (comment) => {
        if (!user || comment.user_id !== user.id) return false;
        const createdAt = new Date(comment.created_at);
        const now = new Date();
        const diffMinutes = (now - createdAt) / (1000 * 60);
        return diffMinutes <= 15;
    };

    // Check if user can delete comment (within 24 hours)
    const canDeleteComment = (comment) => {
        if (!user || comment.user_id !== user.id) return false;
        const createdAt = new Date(comment.created_at);
        const now = new Date();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours <= 24;
    };

    const handleEditComment = async (commentId) => {
        if (editingCommentId === commentId) {
            // Save edit
            if (!editContent.trim()) return;
            setSavingEdit(true);
            try {
                const { error } = await supabase
                    .from('forum_comments')
                    .update({
                        content: editContent,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', commentId);

                if (error) throw error;

                setComments(comments.map(c =>
                    c.id === commentId
                        ? { ...c, content: editContent, updated_at: new Date().toISOString() }
                        : c
                ));
                setEditingCommentId(null);
                setEditContent('');
            } catch (error) {
                console.error('Edit error:', error);
                alert('Düzenleme hatası: ' + error.message);
            } finally {
                setSavingEdit(false);
            }
        } else {
            // Start editing
            const comment = comments.find(c => c.id === commentId);
            if (comment) {
                setEditingCommentId(commentId);
                setEditContent(comment.content);
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (deletingCommentId === commentId) {
            // Confirm delete
            try {
                const { error } = await supabase
                    .from('forum_comments')
                    .delete()
                    .eq('id', commentId);

                if (error) throw error;

                setComments(comments.filter(c => c.id !== commentId));
                setDeletingCommentId(null);
            } catch (error) {
                console.error('Delete error:', error);
                alert('Silme hatası: ' + error.message);
            }
        } else {
            // Ask for confirmation
            setDeletingCommentId(commentId);
        }
    };

    // Topic Edit/Delete - can edit within 1 hour, can delete only if no comments
    const canEditTopic = () => {
        if (!user || !post || post.user_id !== user.id) return false;
        const createdAt = new Date(post.created_at);
        const now = new Date();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        return diffHours <= 1; // 1 saat
    };

    const canDeleteTopic = () => {
        if (!user || !post || post.user_id !== user.id) return false;
        return comments.length === 0; // Yorum yoksa silebilir
    };

    const handleEditTopic = async () => {
        if (!isEditingTopic) {
            setIsEditingTopic(true);
            setEditTopicTitle(post.title);
            setEditTopicContent(post.content);
            return;
        }

        if (!editTopicTitle.trim() || !editTopicContent.trim()) return;
        setSavingTopicEdit(true);

        try {
            const { error } = await supabase
                .from('forum_posts')
                .update({
                    title: editTopicTitle,
                    content: editTopicContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', post.id);

            if (error) throw error;

            setPost({
                ...post,
                title: editTopicTitle,
                content: editTopicContent,
                updated_at: new Date().toISOString()
            });
            setIsEditingTopic(false);
        } catch (error) {
            console.error('Topic edit error:', error);
            alert('Düzenleme hatası: ' + error.message);
        } finally {
            setSavingTopicEdit(false);
        }
    };

    const handleDeleteTopic = async () => {
        if (!showDeleteTopicConfirm) {
            setShowDeleteTopicConfirm(true);
            return;
        }

        setDeletingTopic(true);
        try {
            const { error } = await supabase
                .from('forum_posts')
                .delete()
                .eq('id', post.id);

            if (error) throw error;

            // Redirect to forum main page
            window.location.href = '/community';
        } catch (error) {
            console.error('Topic delete error:', error);
            alert('Silme hatası: ' + error.message);
            setDeletingTopic(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl animate-pulse">{t('community.loading')}</div>;

    // Removed Debug Box, standard 404
    if (!post) {
        return (
            <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100 font-medium">
                <div className="text-red-500 mb-2">{t('community.topic.notFound')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Main Topic Post */}
            <article className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-75"></div>

                <div className="relative z-10">
                    {/* Breadcrumb / Category */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 border-b border-gray-50 pb-4">
                        <Link to="/community" className="hover:text-purple-600 transition-colors flex items-center gap-1 font-medium">
                            <LucideIcons.ArrowLeft size={16} />
                            {t('community.topic.breadcrumbHome')}
                        </Link>
                        <LucideIcons.ChevronRight size={14} className="text-gray-300" />
                        {post.category && (
                            <Link to={`/community/category/${post.category.slug}`} className="flex items-center gap-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full font-bold text-xs tracking-wide transition-colors">
                                {renderIcon(post.category.icon)}
                                {post.category[`name_${language}`] || post.category.name_tr}
                            </Link>
                        )}
                    </div>

                    {/* Title & Body - with Edit Mode support */}
                    {isEditingTopic ? (
                        <div className="space-y-4 mb-6">
                            <input
                                type="text"
                                value={editTopicTitle}
                                onChange={(e) => setEditTopicTitle(e.target.value)}
                                className="w-full text-2xl font-bold p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                placeholder={t('community.topic.topicTitle')}
                            />
                            <textarea
                                value={editTopicContent}
                                onChange={(e) => setEditTopicContent(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 min-h-[200px]"
                                placeholder={t('community.topic.topicContent')}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEditTopic}
                                    disabled={savingTopicEdit}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingTopicEdit ? <LucideIcons.Loader2 size={16} className="animate-spin" /> : <LucideIcons.Check size={16} />}
                                    {t('community.topic.save')}
                                </button>
                                <button
                                    onClick={() => setIsEditingTopic(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    {t('community.topic.cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                                {post.title}
                                {post.updated_at && post.updated_at !== post.created_at && (
                                    <span className="ml-2 text-sm font-normal text-gray-400 italic">{t('community.topic.edited')}</span>
                                )}
                            </h1>
                            <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed mb-8">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>
                        </>
                    )}

                    {/* Author Meta & ACTIONS */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-0.5 shadow-sm overflow-hidden">
                                {post.effectiveAvatarUrl ? (
                                    <img src={post.effectiveAvatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-purple-600 font-bold text-lg cursor-default">
                                        {(post.effectiveDisplayName || 'U')[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    {post.effectiveDisplayName || `${post.profile?.first_name || ''} ${post.profile?.last_name || ''}`.trim() || 'Anonim'}
                                    {post.isVendor && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                            🏢 Tedarikçi
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                    {new Date(post.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : (language === 'de' ? 'de-DE' : 'en-US'), { year: 'numeric', month: 'long', day: 'numeric' })}
                                    <span>•</span>
                                    <span>{t('community.topic.postedBy')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Edit/Delete for Topic Owner */}
                            {canEditTopic() && !isEditingTopic && (
                                <button
                                    onClick={handleEditTopic}
                                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors border bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                >
                                    <LucideIcons.Pencil size={14} />
                                    <span>{t('community.topic.edit')}</span>
                                </button>
                            )}
                            {canDeleteTopic() && (
                                showDeleteTopicConfirm ? (
                                    <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                                        <span className="text-xs text-red-700 font-bold">{t('community.topic.confirmDelete')}</span>
                                        <button
                                            onClick={handleDeleteTopic}
                                            disabled={deletingTopic}
                                            className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 font-bold disabled:opacity-50"
                                        >
                                            {deletingTopic ? '...' : t('community.topic.yes')}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteTopicConfirm(false)}
                                            className="px-2 py-0.5 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 font-bold"
                                        >
                                            {t('community.topic.no')}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleDeleteTopic}
                                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors border bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                    >
                                        <LucideIcons.Trash2 size={14} />
                                        <span>{t('community.topic.delete')}</span>
                                    </button>
                                )
                            )}

                            {/* Like Button */}
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors border ${post.isLiked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:text-red-500'}`}
                                title="Beğen"
                            >
                                <LucideIcons.Heart size={16} className={`${post.isLiked ? 'fill-current' : ''}`} />
                                <span>{post.like_count || 0}</span>
                            </button>

                            {/* Report Button */}
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                                title={t('community.topic.report')}
                            >
                                <LucideIcons.Flag size={14} />
                                <span>{t('community.topic.report')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <LucideIcons.AlertTriangle className="text-red-500" />
                            {t('community.topic.report')}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {t('community.topic.reportDescription')}
                        </p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 mb-4 resize-none"
                            placeholder={t('community.topic.reportPlaceholder')}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                            >
                                {t('community.newTopic.cancel')}
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                disabled={submittingReport || !reportReason.trim()}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {submittingReport && <LucideIcons.Loader2 size={16} className="animate-spin" />}
                                {t('community.topic.send')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Success Toast */}
            {reportSuccessMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
                        <LucideIcons.CheckCircle size={20} />
                        {reportSuccessMessage}
                    </div>
                </div>
            )}

            {/* Comments Section */}
            <div id="comments" className="space-y-6">
                <div className="flex items-center gap-4 px-2 py-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1"></div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 bg-white px-4 border border-gray-100 rounded-full shadow-sm">
                        <LucideIcons.MessageSquare size={18} className="text-purple-500" />
                        <span>{comments.length} {t('community.topic.answers')}</span>
                    </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1"></div>
                </div>

                {comments.map(comment => (
                    <div
                        key={comment.id}
                        id={`comment-${comment.id}`}
                        className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-md ${comment.is_bot ? 'bg-gradient-to-r from-purple-50/40 to-white border-purple-100/50' : 'bg-white border-gray-100 shadow-sm'}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                                {(() => {
                                    // Avatar önceliği: forum_avatar_url > avatar_url > fallback
                                    const avatarUrl = comment.profile?.forum_avatar_url || comment.profile?.avatar_url;
                                    if (avatarUrl) return <img src={avatarUrl} alt="" className="w-full h-full object-cover" />;
                                    if (comment.user_id === post.user_id && post.effectiveAvatarUrl) return <img src={post.effectiveAvatarUrl} alt="" className="w-full h-full object-cover" />;
                                    if (user && comment.user_id === user.id && (user.avatar_url || user.user_metadata?.avatar_url)) {
                                        return <img src={user.avatar_url || user.user_metadata?.avatar_url} alt="" className="w-full h-full object-cover" />;
                                    }
                                    return (
                                        <div className="w-full h-full bg-[#E8C27A] flex items-center justify-center text-white font-bold text-sm">
                                            {(comment.profile?.first_name?.[0] || 'U').toUpperCase()}
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-sm ${comment.is_bot ? 'text-purple-700' : 'text-gray-900'}`}>
                                            {comment.profile?.first_name || t('community.member')} {comment.profile?.last_name}
                                        </span>
                                        {comment.is_bot && (
                                            <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded tracking-wide">
                                                Bot
                                            </span>
                                        )}
                                        {comment.updated_at && comment.updated_at !== comment.created_at && (
                                            <span className="text-[10px] text-gray-400 italic">{t('community.topic.edited')}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-medium" title={new Date(comment.created_at).toLocaleString('tr-TR')}>
                                            {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {/* Edit/Delete Buttons */}
                                        {canEditComment(comment) && editingCommentId !== comment.id && (
                                            <button
                                                onClick={() => handleEditComment(comment.id)}
                                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <LucideIcons.Pencil size={12} /> {t('community.topic.edit')}
                                            </button>
                                        )}
                                        {canDeleteComment(comment) && (
                                            deletingCommentId === comment.id ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-red-600 font-medium">{t('community.topic.confirmDelete')}</span>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
                                                    >
                                                        {t('community.topic.yes')}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingCommentId(null)}
                                                        className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-400"
                                                    >
                                                        {t('community.topic.no')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                                                >
                                                    <LucideIcons.Trash2 size={12} /> {t('community.topic.delete')}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                                {/* Edit Mode or Display */}
                                {editingCommentId === comment.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditComment(comment.id)}
                                                disabled={savingEdit}
                                                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {savingEdit ? <LucideIcons.Loader2 size={12} className="animate-spin" /> : <LucideIcons.Check size={12} />}
                                                {t('community.topic.save')}
                                            </button>
                                            <button
                                                onClick={() => { setEditingCommentId(null); setEditContent(''); }}
                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                                            >
                                                {t('community.topic.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: comment.content }}></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Reply Box */}
                <div className="bg-white rounded-3xl p-1.5 shadow-lg shadow-purple-900/5 border border-purple-100 mt-8">
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="relative group">
                            <textarea
                                className="w-full rounded-[20px] p-5 pr-32 focus:outline-none resize-none text-gray-700 min-h-[120px] bg-gray-50/50 focus:bg-white transition-colors placeholder-gray-400 text-sm"
                                rows="3"
                                placeholder={t('community.topic.replyPlaceholder')}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            ></textarea>
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <LucideIcons.Loader2 size={16} className="animate-spin" />
                                            {t('community.newTopic.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <LucideIcons.Send size={16} />
                                            {t('community.topic.replyButton')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-10 text-gray-500 text-sm bg-gray-50/30 rounded-[20px] border border-dashed border-gray-200">
                            <span className="block mb-4 text-base font-medium">🤔 {t('community.topic.loginToReply')}</span>
                            <Link to="/login" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm transform hover:-translate-y-1">
                                <LucideIcons.LogIn size={18} />
                                {t('community.newTopic.loginButton')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityTopicDetail;
