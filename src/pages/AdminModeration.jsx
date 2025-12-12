import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";

const AdminModeration = () => {
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'comments', 'reports', 'logs'
    const [reports, setReports] = useState([]);
    const [logs, setLogs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    // Inline onay sistemi için state
    const [pendingAction, setPendingAction] = useState(null); // { type: 'post'|'comment', id: uuid, action: 'hide'|'publish'|'delete' }

    // Toplu silme için state
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [selectedComments, setSelectedComments] = useState([]);
    const [selectedReports, setSelectedReports] = useState([]);
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(null); // 'posts' | 'comments' | 'reports' | 'logs'

    // Reply-as-bot state
    const [bots, setBots] = useState([]);
    const [replyModal, setReplyModal] = useState(null); // { postId, commentId?, parentId? }
    const [selectedBotId, setSelectedBotId] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // Bot engagement state (for posts)
    const [engagementModal, setEngagementModal] = useState(null); // { postId, postTitle }
    const [selectedBots, setSelectedBots] = useState([]); // Multi-select for bulk
    const [engagementComments, setEngagementComments] = useState(['']); // Array of comments
    const [engagementLikes, setEngagementLikes] = useState(0); // Number of likes to add
    const [timeOffset, setTimeOffset] = useState(10); // Minutes ago (fake timestamp)
    const [submittingEngagement, setSubmittingEngagement] = useState(false);

    // Arama ve Filtre state'leri
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
    const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'bot' | 'real'

    // Quick Boost state
    const [quickBoostingPost, setQuickBoostingPost] = useState(null); // Currently boosting post ID

    // İlk açılışta tüm verileri çek (tab sayıları için)
    useEffect(() => {
        fetchBots();
        fetchPosts();
        fetchComments();
        fetchReports();
        fetchLogs();
    }, []);

    // Tab değiştiğinde ilgili veriyi yeniden çek
    useEffect(() => {
        if (activeTab === 'reports') fetchReports();
        else if (activeTab === 'logs') fetchLogs();
        else if (activeTab === 'posts') fetchPosts();
        else if (activeTab === 'comments') fetchComments();
        // Sekme değiştiğinde seçimleri temizle
        setSelectedPosts([]);
        setSelectedComments([]);
        setSelectedReports([]);
        setSelectedLogs([]);
    }, [activeTab]);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('forum_posts')
            .select(`
                *,
                profile:profiles!forum_posts_user_id_profiles_fk(first_name, last_name, email, is_bot),
                category:category_id(name_tr)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) console.error(error);
        if (data) setPosts(data);
        setLoading(false);
    };

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('forum_comments')
            .select(`
                *,
                profile:profiles!forum_comments_user_id_profiles_fk(first_name, last_name, email, is_bot),
                post:post_id(title, slug)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) console.error(error);
        if (data) setComments(data);
        setLoading(false);
    };

    const fetchReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('forum_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        if (data) setReports(data);
        setLoading(false);
    };

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('moderation_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) console.error(error);
        if (data) setLogs(data);
        setLoading(false);
    };

    const fetchBots = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, forum_avatar_url')
            .eq('is_bot', true)
            .order('first_name');
        if (data) setBots(data);
    };

    const handleBotReply = async () => {
        if (!selectedBotId || !replyContent.trim() || !replyModal) return;
        setSubmittingReply(true);
        try {
            const { error } = await supabase.from('forum_comments').insert({
                post_id: replyModal.postId,
                user_id: selectedBotId,
                content: replyContent.trim(),
                parent_id: replyModal.parentId || null,
                is_simulated: true,
                status: 'published'
            });
            if (error) throw error;
            alert('✅ Bot yanıtı gönderildi!');
            setReplyModal(null);
            setSelectedBotId('');
            setReplyContent('');
            fetchComments();
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSubmittingReply(false);
        }
    };

    // Handle bot engagement (bulk comments + likes)
    const handleBotEngagement = async () => {
        if (!engagementModal || (selectedBots.length === 0 && engagementLikes === 0)) return;
        setSubmittingEngagement(true);

        try {
            const baseTime = new Date();
            let successCount = 0;

            // Add comments with fake timestamps
            const validComments = engagementComments.filter(c => c.trim());
            for (let i = 0; i < validComments.length; i++) {
                const botId = selectedBots[i % selectedBots.length]; // Cycle through bots
                if (!botId) continue;

                // Calculate fake timestamp (spread comments over time)
                const minutesAgo = timeOffset + (i * 5); // Each comment 5 min apart
                const fakeTime = new Date(baseTime.getTime() - minutesAgo * 60000);

                const { error } = await supabase.from('forum_comments').insert({
                    post_id: engagementModal.postId,
                    user_id: botId,
                    content: validComments[i].trim(),
                    is_simulated: true,
                    status: 'published',
                    created_at: fakeTime.toISOString()
                });

                if (!error) successCount++;
            }

            // Add likes
            if (engagementLikes > 0) {
                const likeBots = selectedBots.slice(0, engagementLikes);
                for (const botId of likeBots) {
                    await supabase.from('forum_likes').insert({
                        post_id: engagementModal.postId,
                        user_id: botId
                    }).catch(() => { }); // Ignore duplicate errors
                }
            }

            alert(`✅ ${successCount} yorum ve ${Math.min(engagementLikes, selectedBots.length)} beğeni eklendi!`);

            // Reset
            setEngagementModal(null);
            setSelectedBots([]);
            setEngagementComments(['']);
            setEngagementLikes(0);
            setTimeOffset(10);
            fetchPosts();

        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSubmittingEngagement(false);
        }
    };

    // AI Hızlı Boost - Tek tıkla 3 yorum + 5 beğeni
    const handleQuickBoost = async (post) => {
        if (!post || bots.length < 3) {
            alert('En az 3 bot gerekli!');
            return;
        }

        setQuickBoostingPost(post.id);

        try {
            // Get API key from site_settings
            const { data: settings } = await supabase
                .from('site_settings')
                .select('ai_api_key')
                .single();

            const apiKey = settings?.ai_api_key;
            if (!apiKey) {
                alert('AI API anahtarı bulunamadı! Genel Ayarlar\'dan ekleyin.');
                setQuickBoostingPost(null);
                return;
            }

            // Initialize Gemini AI
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Shuffled bots for random selection
            const shuffledBots = [...bots].sort(() => Math.random() - 0.5);
            const commentBots = shuffledBots.slice(0, 3);
            const likeBots = shuffledBots.slice(0, 5);

            // Generate 3 comments with AI
            const prompt = `Sen bir düğün planlama forumunda yorum yapan bir kullanıcısın. 
Konu başlığı: "${post.title}"
${post.category?.name_tr ? `Kategori: ${post.category.name_tr}` : ''}

Bu konuya 3 farklı kişiden gelen, doğal ve samimi Türkçe yorumlar yaz.
Her yorum 1-3 cümle olmalı. Emoji kullanabilirsin.
Yorumlar gerçek insanların yazacağı gibi olsun - bazıları soru sorabilir, bazıları deneyim paylaşabilir, bazıları tavsiye verebilir.

SADECE 3 yorum yaz, her birini yeni satırda, başka açıklama ekleme:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse comments (split by newlines, filter empty)
            const comments = text.split('\n')
                .map(c => c.trim())
                .filter(c => c.length > 10 && !c.startsWith('-'))
                .slice(0, 3);

            if (comments.length < 1) {
                throw new Error('AI yorum üretemedi');
            }

            // Add comments with past timestamps
            const baseTime = new Date();
            let successCount = 0;

            for (let i = 0; i < comments.length; i++) {
                const minutesAgo = 15 + (i * 20); // 15, 35, 55 dakika önce
                const fakeTime = new Date(baseTime.getTime() - minutesAgo * 60000);

                const { error } = await supabase.from('forum_comments').insert({
                    post_id: post.id,
                    user_id: commentBots[i].id,
                    content: comments[i],
                    is_simulated: true,
                    status: 'published',
                    created_at: fakeTime.toISOString()
                });

                if (!error) successCount++;
            }

            // Add likes
            for (const bot of likeBots) {
                await supabase.from('forum_likes').insert({
                    post_id: post.id,
                    user_id: bot.id
                }).catch(() => { }); // Ignore duplicates
            }

            alert(`🎲 Hızlı Boost tamamlandı!\n✅ ${successCount} AI yorum\n❤️ ${likeBots.length} beğeni`);
            fetchPosts();

        } catch (error) {
            console.error('Quick boost error:', error);
            alert('Boost hatası: ' + error.message);
        } finally {
            setQuickBoostingPost(null);
        }
    };

    // Kullanıcı Banlama/Ban Kaldırma Toggle
    const handleToggleBan = async (userId, userName, currentlyBanned = false) => {
        if (!userId) {
            alert('Kullanıcı ID bulunamadı!');
            return;
        }

        console.log('Ban işlemi başlatılıyor:', { userId, userName, currentlyBanned });

        try {
            if (currentlyBanned) {
                // UNBAN: Yorumları ve postları yayınla
                console.log('Unban işlemi yapılıyor...');

                // Postları yayınla
                const { error: postError } = await supabase
                    .from('forum_posts')
                    .update({ status: 'published' })
                    .eq('user_id', userId)
                    .eq('status', 'banned');

                if (postError) console.log('Post unban error:', postError);

                // Yorumları yayınla
                const { error: commentError } = await supabase
                    .from('forum_comments')
                    .update({ status: 'published' })
                    .eq('user_id', userId)
                    .eq('status', 'banned');

                if (commentError) console.log('Comment unban error:', commentError);

                // is_banned sütunu varsa güncelle (yoksa yoksay)
                try {
                    await supabase
                        .from('profiles')
                        .update({ is_banned: false })
                        .eq('id', userId);
                } catch (e) {
                    console.log('is_banned column might not exist:', e);
                }

                // Log the action
                await supabase.from('moderation_logs').insert([{
                    action_type: 'user_unban',
                    target_id: userId,
                    details: { user_name: userName },
                    created_at: new Date()
                }]);

                console.log(`✅ "${userName}" kullanıcısının banı kaldırıldı ve içerikleri yayınlandı!`);
            } else {
                // BAN: Yorumları ve postları gizle
                console.log('Ban işlemi yapılıyor...');

                // Postları gizle
                const { error: postError } = await supabase
                    .from('forum_posts')
                    .update({ status: 'banned' })
                    .eq('user_id', userId);

                if (postError) console.log('Post ban error:', postError);

                // Yorumları gizle
                const { error: commentError } = await supabase
                    .from('forum_comments')
                    .update({ status: 'banned' })
                    .eq('user_id', userId);

                if (commentError) console.log('Comment ban error:', commentError);

                // is_banned sütunu varsa güncelle (yoksa yoksay)
                try {
                    await supabase
                        .from('profiles')
                        .update({ is_banned: true })
                        .eq('id', userId);
                } catch (e) {
                    console.log('is_banned column might not exist:', e);
                }

                // Log the action
                await supabase.from('moderation_logs').insert([{
                    action_type: 'user_ban',
                    target_id: userId,
                    details: { user_name: userName },
                    created_at: new Date()
                }]);

                console.log(`🚫 "${userName}" banlandı ve tüm içerikleri gizlendi!`);
            }

            // Listeyi yenile
            fetchPosts();
            fetchComments();

        } catch (error) {
            console.error('Ban/Unban error:', error);
            alert('İşlem hatası: ' + error.message);
        }
    };

    // Legacy function for backward compatibility
    const handleBanUser = (userId, userName) => handleToggleBan(userId, userName, false);

    // Toplu Silme Fonksiyonları
    const handleBulkDeletePosts = async () => {
        if (selectedPosts.length === 0) return;
        if (confirmBulkDelete !== 'posts') {
            setConfirmBulkDelete('posts');
            return;
        }
        setConfirmBulkDelete(null);

        setBulkDeleting(true);
        try {
            const { error } = await supabase
                .from('forum_posts')
                .delete()
                .in('id', selectedPosts);

            if (error) throw error;

            // Log
            await supabase.from('moderation_logs').insert([{
                action_type: 'bulk_post_delete',
                details: { count: selectedPosts.length, ids: selectedPosts },
                created_at: new Date()
            }]);

            alert(`${selectedPosts.length} konu silindi!`);
            setSelectedPosts([]);
            fetchPosts();
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleBulkDeleteComments = async () => {
        if (selectedComments.length === 0) return;
        if (confirmBulkDelete !== 'comments') {
            setConfirmBulkDelete('comments');
            return;
        }
        setConfirmBulkDelete(null);

        setBulkDeleting(true);
        try {
            const { error } = await supabase
                .from('forum_comments')
                .delete()
                .in('id', selectedComments);

            if (error) throw error;

            await supabase.from('moderation_logs').insert([{
                action_type: 'bulk_comment_delete',
                details: { count: selectedComments.length, ids: selectedComments },
                created_at: new Date()
            }]);

            alert(`${selectedComments.length} yorum silindi!`);
            setSelectedComments([]);
            fetchComments();
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleBulkDeleteReports = async () => {
        if (selectedReports.length === 0) return;
        if (confirmBulkDelete !== 'reports') {
            setConfirmBulkDelete('reports');
            return;
        }
        setConfirmBulkDelete(null);

        setBulkDeleting(true);
        try {
            const { error } = await supabase
                .from('forum_reports')
                .delete()
                .in('id', selectedReports);

            if (error) throw error;

            await supabase.from('moderation_logs').insert([{
                action_type: 'bulk_report_delete',
                details: { count: selectedReports.length, ids: selectedReports },
                created_at: new Date()
            }]);

            alert(`${selectedReports.length} şikayet silindi!`);
            setSelectedReports([]);
            fetchReports();
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleBulkDeleteLogs = async () => {
        if (selectedLogs.length === 0) return;
        if (confirmBulkDelete !== 'logs') {
            setConfirmBulkDelete('logs');
            return;
        }
        setConfirmBulkDelete(null);

        setBulkDeleting(true);
        try {
            const { error } = await supabase
                .from('moderation_logs')
                .delete()
                .in('id', selectedLogs);

            if (error) throw error;

            alert(`${selectedLogs.length} log silindi!`);
            setSelectedLogs([]);
            fetchLogs();
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setBulkDeleting(false);
        }
    };

    // Tümünü Seç/Kaldır
    const toggleSelectAllPosts = () => {
        if (selectedPosts.length === posts.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(posts.map(p => p.id));
        }
    };

    const toggleSelectAllComments = () => {
        if (selectedComments.length === comments.length) {
            setSelectedComments([]);
        } else {
            setSelectedComments(comments.map(c => c.id));
        }
    };

    const toggleSelectAllReports = () => {
        if (selectedReports.length === reports.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(reports.map(r => r.id));
        }
    };

    const toggleSelectAllLogs = () => {
        if (selectedLogs.length === logs.length) {
            setSelectedLogs([]);
        } else {
            setSelectedLogs(logs.map(l => l.id));
        }
    };

    const handlePostAction = async (post, action) => {
        // Eğer pendingAction ayarlanmamışsa, onay bekle
        if (!pendingAction || pendingAction.id !== post.id || pendingAction.action !== action) {
            setPendingAction({ type: 'post', id: post.id, action });
            return;
        }

        // Onay verildi, işlemi yap
        setPendingAction(null);

        try {
            let updateError = null;

            if (action === 'hide') {
                const { error } = await supabase.from('forum_posts').update({ status: 'hidden' }).eq('id', post.id);
                updateError = error;
            } else if (action === 'publish') {
                const { error } = await supabase.from('forum_posts').update({ status: 'published' }).eq('id', post.id);
                updateError = error;
            } else if (action === 'delete') {
                const { error } = await supabase.from('forum_posts').delete().eq('id', post.id);
                updateError = error;
            }

            if (updateError) {
                console.error('Update error:', updateError);
                alert('İşlem hatası: ' + updateError.message);
                return;
            }

            // Log action
            const { error: logError } = await supabase.from('moderation_logs').insert([{
                action_type: `post_${action}`,
                target_id: post.id,
                details: { title: post.title },
                created_at: new Date()
            }]);

            if (logError) {
                console.error('Log error:', logError);
                // Log hatası işlemi engellemez
            }

            alert('İşlem başarılı!');
            fetchPosts();
        } catch (error) {
            console.error('Catch error:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleCommentAction = async (comment, action) => {
        // Eğer pendingAction ayarlanmamışsa, onay bekle
        if (!pendingAction || pendingAction.id !== comment.id || pendingAction.action !== action) {
            setPendingAction({ type: 'comment', id: comment.id, action });
            return;
        }

        // Onay verildi, işlemi yap
        setPendingAction(null);

        try {
            let updateError = null;

            if (action === 'hide') {
                const { error } = await supabase.from('forum_comments').update({ status: 'hidden' }).eq('id', comment.id);
                updateError = error;
            } else if (action === 'publish') {
                const { error } = await supabase.from('forum_comments').update({ status: 'published' }).eq('id', comment.id);
                updateError = error;
            } else if (action === 'delete') {
                const { error } = await supabase.from('forum_comments').delete().eq('id', comment.id);
                updateError = error;
            }

            if (updateError) {
                console.error('Comment update error:', updateError);
                alert('İşlem hatası: ' + updateError.message);
                return;
            }

            const { error: logError } = await supabase.from('moderation_logs').insert([{
                action_type: `comment_${action}`,
                target_id: comment.id,
                details: { content: comment.content?.slice(0, 50) },
                created_at: new Date()
            }]);

            if (logError) {
                console.error('Log error:', logError);
            }

            alert('İşlem başarılı!');
            fetchComments();
        } catch (error) {
            console.error('Catch error:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleReportAction = async (report, action) => {
        if (!confirm(`Emin misiniz? İşlem: ${action}`)) return;

        try {
            await supabase.from('moderation_logs').insert([{
                action_type: action,
                target_id: report.post_id || report.comment_id,
                details: { report_id: report.id, reason: report.reason },
                created_at: new Date()
            }]);

            if (action === 'delete_content') {
                if (report.post_id) {
                    await supabase.from('forum_posts').update({ status: 'banned' }).eq('id', report.post_id);
                } else if (report.comment_id) {
                    await supabase.from('forum_comments').update({ status: 'banned' }).eq('id', report.comment_id);
                }
            }

            await supabase.from('forum_reports').update({ status: 'resolved' }).eq('id', report.id);
            alert('İşlem başarılı.');
            fetchReports();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            published: 'bg-green-100 text-green-800',
            hidden: 'bg-yellow-100 text-yellow-800',
            banned: 'bg-red-100 text-red-800',
            pending: 'bg-orange-100 text-orange-800',
            resolved: 'bg-blue-100 text-blue-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    // Bulk Action Bar Component
    const BulkActionBar = ({ selectedCount, onDelete, label, type }) => {
        if (selectedCount === 0) return null;
        const isConfirming = confirmBulkDelete === type;
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <span className="text-red-700 font-medium">
                    {selectedCount} {label} seçildi
                </span>
                <div className="flex items-center gap-2">
                    {isConfirming ? (
                        <>
                            <span className="text-red-700 font-bold text-sm">Emin misin?</span>
                            <button
                                onClick={onDelete}
                                disabled={bulkDeleting}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
                            >
                                {bulkDeleting ? '⏳ Siliniyor...' : '✓ Evet, Sil'}
                            </button>
                            <button
                                onClick={() => setConfirmBulkDelete(null)}
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold"
                            >
                                ✕ Hayır
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onDelete}
                            disabled={bulkDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            🗑️ Seçilenleri Sil
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Filtreleme fonksiyonu
    const applyFilters = (items, isPost = true) => {
        return items.filter(item => {
            // Arama filtresi
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const content = isPost
                    ? (item.title || '').toLowerCase()
                    : (item.content || '').toLowerCase();
                if (!content.includes(query)) return false;
            }

            // Tarih filtresi
            if (dateFilter !== 'all') {
                const itemDate = new Date(item.created_at);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (dateFilter === 'today') {
                    if (itemDate < today) return false;
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (itemDate < weekAgo) return false;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (itemDate < monthAgo) return false;
                }
            }

            // Tip filtresi (bot/gerçek)
            if (typeFilter !== 'all') {
                const isBot = item.profile?.is_bot === true;
                if (typeFilter === 'bot' && !isBot) return false;
                if (typeFilter === 'real' && isBot) return false;
            }

            return true;
        });
    };

    // Filtrelenmiş veriler
    const filteredPosts = applyFilters(posts, true);
    const filteredComments = applyFilters(comments, false);

    return (
        <div className="admin-container p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">🛡️ Forum Moderasyon Merkezi</h1>

            <div className="flex gap-2 border-b mb-4 overflow-x-auto">
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'posts' ? 'border-b-2 border-purple-600 font-bold text-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('posts')}
                >
                    📝 Konular ({posts.length})
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'comments' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('comments')}
                >
                    💬 Yorumlar ({comments.length})
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'reports' ? 'border-b-2 border-red-600 font-bold text-red-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('reports')}
                >
                    🚨 Şikayetler ({reports.length})
                </button>
                <button
                    className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'logs' ? 'border-b-2 border-gray-600 font-bold text-gray-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('logs')}
                >
                    📜 Loglar
                </button>
            </div>

            {/* Arama ve Filtreler */}
            {(activeTab === 'posts' || activeTab === 'comments') && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-center">
                    {/* Arama */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="🔍 Başlık veya içerikte ara..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    {/* Tarih Filtresi */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white"
                    >
                        <option value="all">📅 Tüm Tarihler</option>
                        <option value="today">Bugün</option>
                        <option value="week">Bu Hafta</option>
                        <option value="month">Bu Ay</option>
                    </select>

                    {/* Tip Filtresi */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white"
                    >
                        <option value="all">👤 Tümü</option>
                        <option value="bot">🤖 Sadece Bot</option>
                        <option value="real">👥 Sadece Gerçek</option>
                    </select>

                    {/* Temizle */}
                    {(searchQuery || dateFilter !== 'all' || typeFilter !== 'all') && (
                        <button
                            onClick={() => { setSearchQuery(''); setDateFilter('all'); setTypeFilter('all'); }}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                            ✕ Temizle
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : (
                <>
                    {/* POSTS TAB */}
                    {activeTab === 'posts' && (
                        <div>
                            <BulkActionBar selectedCount={selectedPosts.length} onDelete={handleBulkDeletePosts} label="konu" type="posts" />
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredPosts.length > 0 && selectedPosts.length === filteredPosts.length}
                                                    onChange={toggleSelectAllPosts}
                                                    className="w-4 h-4 accent-purple-600"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left">Başlık</th>
                                            <th className="px-4 py-3 text-left">Yazar</th>
                                            <th className="px-4 py-3 text-left">Kategori</th>
                                            <th className="px-4 py-3 text-left">Durum</th>
                                            <th className="px-4 py-3 text-left">Tarih</th>
                                            <th className="px-4 py-3 text-center">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPosts.map(post => (
                                            <tr key={post.id} className={`border-t hover:bg-gray-50 ${selectedPosts.includes(post.id) ? 'bg-purple-50' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedPosts([...selectedPosts, post.id]);
                                                            } else {
                                                                setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 accent-purple-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link to={`/community/topic/${post.slug}`} target="_blank" className="text-blue-600 hover:underline font-medium">
                                                        {post.title?.slice(0, 40)}...
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span>{post.profile?.first_name} {post.profile?.last_name}</span>
                                                        {post.profile?.is_bot && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">🤖 Bot</span>}
                                                        {!post.profile?.is_bot && post.user_id && (
                                                            <button
                                                                onClick={() => handleBanUser(post.user_id, `${post.profile?.first_name || ''} ${post.profile?.last_name || ''}`)}
                                                                className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded hover:bg-red-200"
                                                                title="Kullanıcıyı Banla"
                                                            >
                                                                🚫
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{post.category?.name_tr}</td>
                                                <td className="px-4 py-3">{getStatusBadge(post.status)}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(post.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex gap-1 justify-center items-center">
                                                        {/* Onay bekliyor mu? */}
                                                        {pendingAction?.type === 'post' && pendingAction?.id === post.id ? (
                                                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
                                                                <span className="text-xs font-bold text-gray-700">Emin misin?</span>
                                                                <button
                                                                    onClick={() => handlePostAction(post, pendingAction.action)}
                                                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 font-bold"
                                                                >
                                                                    Evet
                                                                </button>
                                                                <button
                                                                    onClick={() => setPendingAction(null)}
                                                                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 font-bold"
                                                                >
                                                                    Hayır
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {post.status === 'published' ? (
                                                                    <button onClick={() => handlePostAction(post, 'hide')} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">Gizle</button>
                                                                ) : (
                                                                    <button onClick={() => handlePostAction(post, 'publish')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Yayınla</button>
                                                                )}
                                                                <button onClick={() => handlePostAction(post, 'delete')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Sil</button>
                                                                <button
                                                                    onClick={() => handleQuickBoost(post)}
                                                                    disabled={quickBoostingPost === post.id}
                                                                    className="px-2 py-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded text-xs hover:from-pink-600 hover:to-orange-500 font-bold disabled:opacity-50"
                                                                >
                                                                    {quickBoostingPost === post.id ? '⏳' : '🎲'} Hızlı Boost
                                                                </button>
                                                                <button
                                                                    onClick={() => setEngagementModal({ postId: post.id, postTitle: post.title })}
                                                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 font-bold"
                                                                >
                                                                    🤖 Bot Desteği
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredPosts.length === 0 && <p className="p-4 text-center text-gray-500">{searchQuery || dateFilter !== 'all' || typeFilter !== 'all' ? 'Filtre sonucu bulunamadı.' : 'Henüz konu yok.'}</p>}
                            </div>
                        </div>
                    )}

                    {/* COMMENTS TAB */}
                    {activeTab === 'comments' && (
                        <div>
                            <BulkActionBar selectedCount={selectedComments.length} onDelete={handleBulkDeleteComments} label="yorum" type="comments" />
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredComments.length > 0 && selectedComments.length === filteredComments.length}
                                                    onChange={toggleSelectAllComments}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left">Yorum</th>
                                            <th className="px-4 py-3 text-left">Yazar</th>
                                            <th className="px-4 py-3 text-left">Konu</th>
                                            <th className="px-4 py-3 text-left">Tarih</th>
                                            <th className="px-4 py-3 text-left">Durum</th>
                                            <th className="px-4 py-3 text-center">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredComments.map(comment => (
                                            <tr key={comment.id} className={`border-t hover:bg-gray-50 ${selectedComments.includes(comment.id) ? 'bg-blue-50' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedComments.includes(comment.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedComments([...selectedComments, comment.id]);
                                                            } else {
                                                                setSelectedComments(selectedComments.filter(id => id !== comment.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 accent-blue-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 max-w-xs truncate" title={comment.content}>
                                                    {comment.content?.slice(0, 50)}...
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span>{comment.profile?.first_name} {comment.profile?.last_name}</span>
                                                        {comment.profile?.is_bot && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">🤖 Bot</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {comment.post && (
                                                        <Link to={`/community/topic/${comment.post.slug}`} target="_blank" className="text-blue-600 hover:underline text-xs">
                                                            {comment.post.title?.slice(0, 25)}...
                                                        </Link>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3">{getStatusBadge(comment.status)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex gap-1 justify-center items-center flex-wrap">
                                                        {comment.status === 'published' ? (
                                                            <button onClick={() => handleCommentAction(comment, 'hide')} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">Gizle</button>
                                                        ) : (
                                                            <button onClick={() => handleCommentAction(comment, 'publish')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Yayınla</button>
                                                        )}
                                                        <button onClick={() => handleCommentAction(comment, 'delete')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Sil</button>
                                                        <button
                                                            onClick={() => setReplyModal({ postId: comment.post_id, parentId: comment.id })}
                                                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 font-bold"
                                                        >
                                                            🤖 Cevapla
                                                        </button>
                                                        {/* BAN/UNBAN BUTONU - Sadece gerçek kullanıcılar için */}
                                                        {!comment.profile?.is_bot && comment.user_id && (
                                                            comment.status === 'banned' ? (
                                                                <button
                                                                    onClick={() => {
                                                                        console.log('UNBAN ÇAĞIRILIYOR...');
                                                                        const userName = `${comment.profile?.first_name || ''} ${comment.profile?.last_name || ''}`.trim() || 'Kullanıcı';
                                                                        handleToggleBan(comment.user_id, userName, true);
                                                                    }}
                                                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 font-bold"
                                                                >
                                                                    ✓ Unban
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        console.log('BANLA ÇAĞIRILIYOR...');
                                                                        const userName = `${comment.profile?.first_name || ''} ${comment.profile?.last_name || ''}`.trim() || 'Kullanıcı';
                                                                        handleToggleBan(comment.user_id, userName, false);
                                                                    }}
                                                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 font-bold"
                                                                >
                                                                    🚫 Banla
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredComments.length === 0 && <p className="p-4 text-center text-gray-500">{searchQuery || dateFilter !== 'all' || typeFilter !== 'all' ? 'Filtre sonucu bulunamadı.' : 'Henüz yorum yok.'}</p>}
                            </div>
                        </div>
                    )}

                    {/* REPORTS TAB */}
                    {activeTab === 'reports' && (
                        <div>
                            <BulkActionBar selectedCount={selectedReports.length} onDelete={handleBulkDeleteReports} label="şikayet" type="reports" />
                            {reports.length === 0 && <p className="text-gray-500 p-4 bg-green-50 rounded border border-green-200">✅ Bekleyen şikayet yok. Temiz!</p>}
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <div key={report.id} className={`bg-white p-4 rounded shadow border ${selectedReports.includes(report.id) ? 'border-red-400 bg-red-50' : 'border-red-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedReports.includes(report.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedReports([...selectedReports, report.id]);
                                                        } else {
                                                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 accent-red-600 mt-1"
                                                />
                                                <div>
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold uppercase">
                                                        {report.post_id ? 'Konu' : 'Yorum'}
                                                    </span>
                                                    <span className="ml-2">{getStatusBadge(report.status)}</span>
                                                    <p className="mt-2 text-sm text-red-600">
                                                        <strong>Sebep:</strong> {report.reason}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(report.created_at).toLocaleString('tr-TR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleReportAction(report, 'dismiss')} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                                                    Yoksay
                                                </button>
                                                <button onClick={() => handleReportAction(report, 'delete_content')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                                    İçeriği Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {reports.length > 0 && (
                                <div className="mt-4 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={reports.length > 0 && selectedReports.length === reports.length}
                                        onChange={toggleSelectAllReports}
                                        className="w-4 h-4 accent-red-600"
                                    />
                                    <span className="text-sm text-gray-600">Tümünü Seç</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && (
                        <div>
                            <BulkActionBar selectedCount={selectedLogs.length} onDelete={handleBulkDeleteLogs} label="log" type="logs" />
                            <div className="bg-white rounded border overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={logs.length > 0 && selectedLogs.length === logs.length}
                                                    onChange={toggleSelectAllLogs}
                                                    className="w-4 h-4 accent-gray-600"
                                                />
                                            </th>
                                            <th className="px-4 py-2 text-left">Tarih</th>
                                            <th className="px-4 py-2 text-left">İşlem</th>
                                            <th className="px-4 py-2 text-left">Detay</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log.id} className={`border-t ${selectedLogs.includes(log.id) ? 'bg-gray-100' : ''}`}>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLogs.includes(log.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedLogs([...selectedLogs, log.id]);
                                                            } else {
                                                                setSelectedLogs(selectedLogs.filter(id => id !== log.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 accent-gray-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-xs">{new Date(log.created_at).toLocaleString('tr-TR')}</td>
                                                <td className="px-4 py-2 font-bold">{log.action_type}</td>
                                                <td className="px-4 py-2 text-xs text-gray-500">{JSON.stringify(log.details)?.slice(0, 80)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {logs.length === 0 && <p className="p-4 text-center text-gray-500">Henüz log yok.</p>}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Bot Reply Modal */}
            {replyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            🤖 Bot Olarak Cevapla
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Bot Seç:</label>
                            <select
                                value={selectedBotId}
                                onChange={(e) => setSelectedBotId(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">-- Bot Seçin --</option>
                                {bots.map(bot => (
                                    <option key={bot.id} value={bot.id}>
                                        {bot.first_name} {bot.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Yanıt:</label>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="w-full border rounded-lg p-3 min-h-[120px]"
                                placeholder="Bot'un yanıtını buraya yazın..."
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setReplyModal(null); setSelectedBotId(''); setReplyContent(''); }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBotReply}
                                disabled={!selectedBotId || !replyContent.trim() || submittingReply}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submittingReply ? 'Gönderiliyor...' : '🤖 Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bot Engagement Modal */}
            {engagementModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            🤖 Bot Desteği
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 truncate">
                            📄 {engagementModal.postTitle}
                        </p>

                        {/* Bot Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Botları Seç (çoklu):</label>
                            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50">
                                <div className="flex flex-wrap gap-2">
                                    {bots.map(bot => (
                                        <label key={bot.id} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm ${selectedBots.includes(bot.id) ? 'bg-purple-200 text-purple-800' : 'bg-white border hover:bg-gray-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedBots.includes(bot.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedBots([...selectedBots, bot.id]);
                                                    } else {
                                                        setSelectedBots(selectedBots.filter(id => id !== bot.id));
                                                    }
                                                }}
                                                className="sr-only"
                                            />
                                            {bot.first_name} {bot.last_name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{selectedBots.length} bot seçildi</p>
                        </div>

                        {/* Time Offset */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">⏰ Zaman Farkı (dk önce):</label>
                            <input
                                type="number"
                                value={timeOffset}
                                onChange={(e) => setTimeOffset(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-32 border rounded-lg p-2"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Yorumlar bu süreden başlayarak 5'er dakika arayla görünür</p>
                        </div>

                        {/* Comments */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">💬 Yorumlar:</label>
                            {engagementComments.map((comment, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => {
                                            const newComments = [...engagementComments];
                                            newComments[index] = e.target.value;
                                            setEngagementComments(newComments);
                                        }}
                                        className="flex-1 border rounded-lg p-2 min-h-[60px]"
                                        placeholder={`Yorum ${index + 1}...`}
                                    />
                                    {engagementComments.length > 1 && (
                                        <button
                                            onClick={() => setEngagementComments(engagementComments.filter((_, i) => i !== index))}
                                            className="text-red-500 hover:text-red-700 text-xl"
                                        >×</button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => setEngagementComments([...engagementComments, ''])}
                                className="text-sm text-purple-600 hover:text-purple-800"
                            >
                                + Yorum Ekle
                            </button>
                        </div>

                        {/* Likes */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2">❤️ Beğeni Sayısı:</label>
                            <input
                                type="number"
                                value={engagementLikes}
                                onChange={(e) => setEngagementLikes(Math.max(0, Math.min(selectedBots.length, parseInt(e.target.value) || 0)))}
                                className="w-32 border rounded-lg p-2"
                                min="0"
                                max={selectedBots.length}
                            />
                            <p className="text-xs text-gray-500 mt-1">Maks: {selectedBots.length} (seçili bot sayısı kadar)</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end border-t pt-4">
                            <button
                                onClick={() => {
                                    setEngagementModal(null);
                                    setSelectedBots([]);
                                    setEngagementComments(['']);
                                    setEngagementLikes(0);
                                    setTimeOffset(10);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBotEngagement}
                                disabled={selectedBots.length === 0 || submittingEngagement}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {submittingEngagement ? 'İşleniyor...' : '🚀 Uygula'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModeration;
