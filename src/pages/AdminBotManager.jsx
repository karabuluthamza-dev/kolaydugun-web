import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminBotManager = () => {
    const [activeTab, setActiveTab] = useState('bots'); // 'bots' | 'inbox'
    const [bots, setBots] = useState([]);
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBot, setEditingBot] = useState(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', city: '' });
    const [saving, setSaving] = useState(false);
    const [defaultAvatars, setDefaultAvatars] = useState([]);

    // New bot modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBotForm, setNewBotForm] = useState({ first_name: '', last_name: '', city: '', avatar_url: '' });
    const [addingBot, setAddingBot] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); // Inline success message
    const [errorMessage, setErrorMessage] = useState(''); // Inline error message

    // Reply modal state
    const [replyModal, setReplyModal] = useState(null);
    const [selectedBotId, setSelectedBotId] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // TOPLU SİLME STATE
    const [selectedBots, setSelectedBots] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // BOT DÜZENLEME MODAL STATE
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBotData, setEditingBotData] = useState(null);

    // ARAMA STATE
    const [botSearchQuery, setBotSearchQuery] = useState('');

    useEffect(() => {
        fetchBots();
        fetchAvatars();
        fetchInbox();
    }, []);

    const fetchBots = async () => {
        setLoading(true);
        // Get bots with their post and comment counts
        const { data: botsData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_bot', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bots:', error);
            setLoading(false);
            return;
        }

        // Get stats for each bot
        const botsWithStats = await Promise.all((botsData || []).map(async (bot) => {
            const { count: postCount } = await supabase
                .from('forum_posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', bot.id);

            const { count: commentCount } = await supabase
                .from('forum_comments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', bot.id);

            return {
                ...bot,
                post_count: postCount || 0,
                comment_count: commentCount || 0
            };
        }));

        setBots(botsWithStats);
        setLoading(false);
    };

    const fetchAvatars = async () => {
        const { data, error } = await supabase
            .from('default_avatars')
            .select('*')
            .order('sort_order');
        console.log('Avatars loaded:', data, error);
        if (data) setDefaultAvatars(data);
    };

    // Handle avatar photo upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `bot_${Date.now()}.${fileExt}`;
            const filePath = `bot-avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setNewBotForm({ ...newBotForm, avatar_url: publicUrl });
            alert('✅ Fotoğraf yülendi!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Yükleme hatası: ' + error.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Fetch comments from real users on bot topics
    const fetchInbox = async () => {
        // Get all bot IDs
        const { data: botProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('is_bot', true);

        if (!botProfiles || botProfiles.length === 0) {
            setInbox([]);
            return;
        }

        const botIds = botProfiles.map(b => b.id);

        // Get all posts by bots
        const { data: botPosts } = await supabase
            .from('forum_posts')
            .select('id')
            .in('user_id', botIds);

        if (!botPosts || botPosts.length === 0) {
            setInbox([]);
            return;
        }

        const botPostIds = botPosts.map(p => p.id);

        // Get comments on those posts that are NOT from bots
        const { data: realComments, error } = await supabase
            .from('forum_comments')
            .select(`
                *,
                profile:profiles!forum_comments_user_id_profiles_fk(first_name, last_name, forum_avatar_url, is_bot),
                post:post_id(id, title, slug, user_id)
            `)
            .in('post_id', botPostIds)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Inbox fetch error:', error);
            return;
        }

        // Filter out comments from bots
        const filteredComments = (realComments || []).filter(c => !c.profile?.is_bot);
        setInbox(filteredComments);
    };

    const handleBotReply = async () => {
        if (!selectedBotId || !replyContent.trim() || !replyModal) return;
        setSubmittingReply(true);

        console.log('Bot Reply Data:', {
            post_id: replyModal.postId,
            user_id: selectedBotId,
            content: replyContent.trim(),
            parent_id: replyModal.parentId || null
        });

        try {
            const { data, error } = await supabase.from('forum_comments').insert({
                post_id: replyModal.postId,
                user_id: selectedBotId,
                content: replyContent.trim(),
                parent_id: replyModal.parentId || null,
                status: 'published'
            }).select();

            console.log('Insert result:', { data, error });

            if (error) throw error;

            // Success - inline message
            setSuccessMessage('✅ Bot yanıtı gönderildi!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setReplyModal(null);
            setSelectedBotId('');
            setReplyContent('');
            fetchInbox();
        } catch (error) {
            console.error('Bot reply error:', error);
            setErrorMessage('Hata: ' + (error.message || JSON.stringify(error)));
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleEdit = (bot) => {
        setEditingBot(bot.id);
        setEditForm({
            first_name: bot.first_name || '',
            last_name: bot.last_name || '',
            city: bot.city || ''
        });
    };

    const handleSave = async () => {
        if (!editingBot) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: editForm.first_name,
                    last_name: editForm.last_name,
                    full_name: `${editForm.first_name} ${editForm.last_name}`,
                    city: editForm.city
                })
                .eq('id', editingBot);

            if (error) throw error;
            setEditingBot(null);
            fetchBots();
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangeAvatar = async (botId, newAvatarUrl) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ forum_avatar_url: newAvatarUrl })
                .eq('id', botId);

            if (error) throw error;
            fetchBots();
        } catch (error) {
            alert('Avatar değiştirilemedi: ' + error.message);
        }
    };

    const handleDelete = async (botId) => {
        if (!confirm('Bu botu ve tüm içeriklerini (konuları, yorumları) silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!')) return;

        try {
            // 1. Delete all likes by bot
            await supabase.from('forum_likes').delete().eq('user_id', botId);

            // 2. Delete all comments by bot
            await supabase.from('forum_comments').delete().eq('user_id', botId);

            // 3. Delete all posts by bot (comments on those posts will be orphaned but ok)
            await supabase.from('forum_posts').delete().eq('user_id', botId);

            // 4. Finally delete the bot profile
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', botId);

            if (error) throw error;

            setSuccessMessage('✅ Bot ve tüm içerikleri silindi!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchBots();
        } catch (error) {
            setErrorMessage('Silme hatası: ' + error.message);
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    // TOPLU SİLME
    const handleBulkDelete = async () => {
        if (selectedBots.length === 0) return;
        if (!confirm(`${selectedBots.length} botu ve tüm içeriklerini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) return;

        setBulkDeleting(true);
        try {
            for (const botId of selectedBots) {
                await supabase.from('forum_likes').delete().eq('user_id', botId);
                await supabase.from('forum_comments').delete().eq('user_id', botId);
                await supabase.from('forum_posts').delete().eq('user_id', botId);
                await supabase.from('profiles').delete().eq('id', botId);
            }

            setSuccessMessage(`✅ ${selectedBots.length} bot silindi!`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setSelectedBots([]);
            fetchBots();
        } catch (error) {
            setErrorMessage('Toplu silme hatası: ' + error.message);
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setBulkDeleting(false);
        }
    };

    // TÜMÜNÜ SEÇ/KALDIR
    const toggleSelectAll = () => {
        if (selectedBots.length === bots.length) {
            setSelectedBots([]);
        } else {
            setSelectedBots(bots.map(b => b.id));
        }
    };

    // BOT DÜZENLEME MODAL AÇ
    const openEditModal = (bot) => {
        setEditingBotData({
            id: bot.id,
            first_name: bot.first_name || '',
            last_name: bot.last_name || '',
            city: bot.city || '',
            avatar_url: bot.forum_avatar_url || ''
        });
        setShowEditModal(true);
    };

    // BOT DÜZENLEME KAYDET
    const handleSaveEdit = async () => {
        if (!editingBotData) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: editingBotData.first_name,
                    last_name: editingBotData.last_name,
                    full_name: `${editingBotData.first_name} ${editingBotData.last_name}`,
                    city: editingBotData.city,
                    forum_avatar_url: editingBotData.avatar_url || null
                })
                .eq('id', editingBotData.id);

            if (error) throw error;

            setSuccessMessage('✅ Bot güncellendi!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setShowEditModal(false);
            setEditingBotData(null);
            fetchBots();
        } catch (error) {
            setErrorMessage('Güncelleme hatası: ' + error.message);
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setSaving(false);
        }
    };

    // Yeni bot ekleme
    const handleAddBot = async () => {
        if (!newBotForm.first_name.trim() || !newBotForm.last_name.trim()) {
            setErrorMessage('İsim ve soyisim zorunludur!');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }
        setAddingBot(true);
        setErrorMessage('');
        try {
            // Generate a unique UUID for the bot
            const botId = crypto.randomUUID();

            const { error } = await supabase.from('profiles').insert({
                id: botId,
                email: `bot_${botId.substring(0, 8)}@kolaydugun.bot`, // Fake email for NOT NULL constraint
                first_name: newBotForm.first_name.trim(),
                last_name: newBotForm.last_name.trim(),
                full_name: `${newBotForm.first_name.trim()} ${newBotForm.last_name.trim()}`,
                city: newBotForm.city.trim() || null,
                forum_avatar_url: newBotForm.avatar_url || null,
                is_bot: true,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            // Success - close modal and show message
            setShowAddModal(false);
            setNewBotForm({ first_name: '', last_name: '', city: '', avatar_url: '' });
            setSuccessMessage(`✅ "${newBotForm.first_name} ${newBotForm.last_name}" botu oluşturuldu!`);
            setTimeout(() => setSuccessMessage(''), 4000);
            fetchBots();
        } catch (error) {
            setErrorMessage('Bot oluşturulamadı: ' + error.message);
        } finally {
            setAddingBot(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <LucideIcons.Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    return (
        <div className="admin-container p-6">
            {/* Inline Success/Error Messages */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                    <LucideIcons.CheckCircle size={20} />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                    <LucideIcons.AlertCircle size={20} />
                    <span className="font-medium">{errorMessage}</span>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    🤖 Bot Yönetimi
                </h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Toplam: <strong className="text-purple-600">{bots.length}</strong> bot
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                    >
                        <LucideIcons.Plus size={18} />
                        Yeni Bot Ekle
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('bots')}
                    className={`pb-3 px-1 font-medium border-b-2 transition-colors ${activeTab === 'bots' ? 'text-purple-600 border-purple-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    👥 Bot Listesi ({bots.length})
                </button>
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`pb-3 px-1 font-medium border-b-2 transition-colors ${activeTab === 'inbox' ? 'text-purple-600 border-purple-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    📬 Gelen Kutusu ({inbox.length})
                </button>
            </div>

            {activeTab === 'bots' && (
                <div>
                    {/* Arama Çubuğu */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={botSearchQuery}
                                onChange={(e) => setBotSearchQuery(e.target.value)}
                                placeholder="🔍 Bot ismi veya şehir ile ara..."
                                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <LucideIcons.Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            {botSearchQuery && (
                                <button
                                    onClick={() => setBotSearchQuery('')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Toplu Silme Bar */}
                    {selectedBots.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                            <span className="text-red-700 font-medium">
                                {selectedBots.length} bot seçildi
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {bulkDeleting ? (
                                    <><LucideIcons.Loader2 size={16} className="animate-spin" /> Siliniyor...</>
                                ) : (
                                    <>🗑️ Seçilenleri Sil</>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-lg border overflow-hidden">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 w-8">
                                        <input
                                            type="checkbox"
                                            checked={bots.length > 0 && selectedBots.length === bots.length}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 accent-purple-600"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left">Avatar</th>
                                    <th className="px-4 py-3 text-left">İsim</th>
                                    <th className="px-4 py-3 text-left">Şehir</th>
                                    <th className="px-4 py-3 text-center">📝 Konu</th>
                                    <th className="px-4 py-3 text-center">💬 Yorum</th>
                                    <th className="px-4 py-3 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bots
                                    .filter(bot => {
                                        if (!botSearchQuery) return true;
                                        const query = botSearchQuery.toLowerCase();
                                        const name = `${bot.first_name || ''} ${bot.last_name || ''}`.toLowerCase();
                                        const city = (bot.city || '').toLowerCase();
                                        return name.includes(query) || city.includes(query);
                                    })
                                    .map(bot => (
                                        <tr key={bot.id} className={`border-t hover:bg-gray-50 ${selectedBots.includes(bot.id) ? 'bg-purple-50' : ''}`}>
                                            <td className="px-4 py-3">
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
                                                    className="w-4 h-4 accent-purple-600"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                                    {bot.forum_avatar_url ? (
                                                        <img src={bot.forum_avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold">
                                                            {(bot.first_name || 'B')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{bot.first_name} {bot.last_name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-500">{bot.city || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${bot.post_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {bot.post_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${bot.comment_count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {bot.comment_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex gap-1 justify-center">
                                                    <button
                                                        onClick={() => openEditModal(bot)}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                                                    >
                                                        Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bot.id)}
                                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {bots.length === 0 && (
                            <p className="p-8 text-center text-gray-500">
                                Henüz bot oluşturulmamış. Hayalet Modu'ndan bot oluşturabilirsiniz.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Inbox Tab */}
            {activeTab === 'inbox' && (
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <p className="text-sm text-gray-600">
                            📬 Bot konularına gelen <strong>gerçek kullanıcı</strong> yorumları burada görünür.
                        </p>
                    </div>
                    {inbox.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">
                            Henüz bot konularına gerçek yorum gelmedi.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {inbox.map(comment => (
                                <div key={comment.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {comment.profile?.forum_avatar_url ? (
                                                <img src={comment.profile.forum_avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                                    {(comment.profile?.first_name || '?')[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-800">
                                                    {comment.profile?.first_name} {comment.profile?.last_name}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{comment.content}</p>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Link
                                                    to={`/community/topic/${comment.post?.slug}`}
                                                    target="_blank"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    📄 {comment.post?.title?.slice(0, 40)}...
                                                </Link>
                                                <button
                                                    onClick={() => setReplyModal({ postId: comment.post_id, parentId: comment.id })}
                                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-bold"
                                                >
                                                    🤖 Cevapla
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Reply Modal */}
            {replyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4">🤖 Bot Olarak Cevapla</h3>

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
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {submittingReply ? 'Gönderiliyor...' : '🤖 Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Bot Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            ➕ Yeni Bot Ekle
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">İsim *</label>
                                <input
                                    type="text"
                                    value={newBotForm.first_name}
                                    onChange={(e) => setNewBotForm({ ...newBotForm, first_name: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                    placeholder="Zeynep"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Soyisim *</label>
                                <input
                                    type="text"
                                    value={newBotForm.last_name}
                                    onChange={(e) => setNewBotForm({ ...newBotForm, last_name: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                    placeholder="Yılmaz"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Şehir</label>
                            <input
                                type="text"
                                value={newBotForm.city}
                                onChange={(e) => setNewBotForm({ ...newBotForm, city: e.target.value })}
                                className="w-full border rounded-lg p-2"
                                placeholder="Berlin, Frankfurt, München..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Avatar</label>

                            {/* Fotoğraf Yükleme */}
                            <div className="mb-3 p-3 border-2 border-dashed rounded-lg bg-blue-50 border-blue-200">
                                <label className="flex items-center justify-center gap-2 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                        disabled={uploadingAvatar}
                                    />
                                    <LucideIcons.Upload size={20} className="text-blue-600" />
                                    <span className="text-sm text-blue-700 font-medium">
                                        {uploadingAvatar ? 'Yükleniyor...' : 'Kendi Fotoğrafını Yükle'}
                                    </span>
                                </label>
                            </div>

                            {/* Seçilen Avatar Önizleme */}
                            {newBotForm.avatar_url && (
                                <div className="mb-3 flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                    <img src={newBotForm.avatar_url} alt="Seçilen" className="w-12 h-12 rounded-full object-cover" />
                                    <span className="text-sm text-green-700">✓ Avatar seçildi</span>
                                    <button
                                        onClick={() => setNewBotForm({ ...newBotForm, avatar_url: '' })}
                                        className="ml-auto text-red-500 hover:text-red-700 text-xs"
                                    >
                                        ✕ Kaldır
                                    </button>
                                </div>
                            )}

                            {/* Hazır Avatarlar */}
                            <p className="text-xs text-gray-500 mb-2">veya hazır avatarlardan seç:</p>
                            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                                {defaultAvatars.length === 0 ? (
                                    <p className="col-span-8 text-center text-gray-400 text-xs py-2">Hazır avatar bulunamadı</p>
                                ) : (
                                    defaultAvatars.map(avatar => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => setNewBotForm({ ...newBotForm, avatar_url: avatar.url })}
                                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${newBotForm.avatar_url === avatar.url ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200 hover:border-gray-400'}`}
                                        >
                                            <img src={avatar.url} alt={avatar.name || ''} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setShowAddModal(false); setNewBotForm({ first_name: '', last_name: '', city: '', avatar_url: '' }); }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAddBot}
                                disabled={!newBotForm.first_name.trim() || !newBotForm.last_name.trim() || addingBot}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {addingBot ? 'Oluşturuluyor...' : '✓ Bot Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Bot Modal */}
            {showEditModal && editingBotData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            ✏️ Bot Düzenle
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">İsim *</label>
                                <input
                                    type="text"
                                    value={editingBotData.first_name}
                                    onChange={(e) => setEditingBotData({ ...editingBotData, first_name: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Soyisim *</label>
                                <input
                                    type="text"
                                    value={editingBotData.last_name}
                                    onChange={(e) => setEditingBotData({ ...editingBotData, last_name: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Şehir</label>
                            <input
                                type="text"
                                value={editingBotData.city}
                                onChange={(e) => setEditingBotData({ ...editingBotData, city: e.target.value })}
                                className="w-full border rounded-lg p-2"
                                placeholder="Berlin, Frankfurt, München..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Avatar</label>
                            {/* Mevcut avatar */}
                            {editingBotData.avatar_url && (
                                <div className="mb-3 flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                    <img src={editingBotData.avatar_url} alt="Mevcut" className="w-12 h-12 rounded-full object-cover" />
                                    <span className="text-sm text-green-700">Mevcut Avatar</span>
                                    <button
                                        onClick={() => setEditingBotData({ ...editingBotData, avatar_url: '' })}
                                        className="ml-auto text-red-500 hover:text-red-700 text-xs"
                                    >
                                        ✕ Kaldır
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mb-2">Hazır avatarlardan seç:</p>
                            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                                {defaultAvatars.map(avatar => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setEditingBotData({ ...editingBotData, avatar_url: avatar.url || avatar.image_url })}
                                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${editingBotData.avatar_url === (avatar.url || avatar.image_url) ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200 hover:border-gray-400'}`}
                                    >
                                        <img src={avatar.url || avatar.image_url} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setShowEditModal(false); setEditingBotData(null); }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={!editingBotData.first_name.trim() || !editingBotData.last_name.trim() || saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : '✓ Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBotManager;
