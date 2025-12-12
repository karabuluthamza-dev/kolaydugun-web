import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import SimpleEditor from '../components/SimpleEditor';
import ImageUpload from '../components/ImageUpload';
import './AdminConfig.css';

import AIBlogGenerator from '../components/Admin/AIBlogGenerator';
import AffiliateSlotManager from '../components/Admin/AffiliateSlotManager';
import ContentRepurposer from '../components/Admin/ContentRepurposer';
import BulkImageOptimizer from '../components/Admin/BulkImageOptimizer';
import { generateInternalLinks } from '../utils/seoHelpers';

const AdminBlog = () => {
    usePageTitle('Blog Yönetimi');
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeLang, setActiveLang] = useState('tr');

    // AI & Affiliate State
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [showRepurposer, setShowRepurposer] = useState(false);
    const [showImageOptimizer, setShowImageOptimizer] = useState(false);
    const [affiliateSlots, setAffiliateSlots] = useState([]);
    const [imageKeywords, setImageKeywords] = useState([]);
    const [aiImagePrompt, setAiImagePrompt] = useState('');

    // Categories and Tags
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagInput, setNewTagInput] = useState('');

    // New Category State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Bulk Selection
    const [selectedPosts, setSelectedPosts] = useState([]);

    // Save Status Logic
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
    const [saveMessage, setSaveMessage] = useState('');

    // Search, Filter, Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 10;

    // Auto-Save
    const autoSaveTimerRef = useRef(null);

    const languages = [
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
        { code: 'en', label: 'İngilizce', flag: '🇬🇧' },
        { code: 'de', label: 'Almanca', flag: '🇩🇪' }
    ];

    // Form state
    const [formData, setFormData] = useState({
        slug: '',
        featured_image_url: '',
        status: 'draft',
        scheduled_for: '',
        title: { tr: '', en: '', de: '' },
        excerpt: { tr: '', en: '', de: '' },
        content: { tr: '', en: '', de: '' },
        meta_title: { tr: '', en: '', de: '' },
        meta_description: { tr: '', en: '', de: '' },
        is_featured: false
    });

    // Showcase Settings State
    const [showShowcaseSettings, setShowShowcaseSettings] = useState(false);
    const [showcaseConfig, setShowcaseConfig] = useState({
        mode: 'latest',
        title: { tr: 'Popüler Blog Yazıları', en: 'Popular Blog Posts', de: 'Beliebte Blogbeiträge' }
    });

    useEffect(() => {
        fetchPosts();
        fetchCategories();
        fetchTags();
    }, [page, filterStatus, searchTerm]); // Refetch when these change

    // Auto-Save Effect
    useEffect(() => {
        if (isCreating || !editingPost || formData.status === 'published') return;

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        autoSaveTimerRef.current = setTimeout(async () => {
            console.log('Auto-saving draft...');
            // Only auto-save if it's a draft and has a title
            if (formData.status === 'draft' && (formData.title.tr || formData.title.en)) {
                try {
                    const postData = {
                        ...formData,
                        author_id: user.id,
                        updated_at: new Date()
                    };

                    const { error } = await supabase
                        .from('posts')
                        .update(postData)
                        .eq('id', editingPost.id);

                    if (!error) console.log('Auto-save successful');
                } catch (err) {
                    console.error('Auto-save error:', err);
                }
            }
        }, 30000); // 30 seconds

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [formData, isCreating, editingPost]);

    // Data Persistence: Warn on unload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isCreating || editingPost) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isCreating, editingPost]);
    // Data Persistence: Local Storage Backup
    useEffect(() => {
        if (isCreating && formData.title.tr) { // Only backup if creating and has at least a title (or content)
            localStorage.setItem('admin_blog_draft_backup', JSON.stringify({
                formData,
                affiliateSlots,
                imageKeywords,
                aiImagePrompt
            }));
        } else if (!isCreating && !editingPost) {
            // Clear backup if we're not editing/creating anything
            // But be careful not to clear if we just reloaded.
            // Actually, we usually clear explicitly on save.
        }
    }, [formData, isCreating, affiliateSlots, imageKeywords, aiImagePrompt]);
    // Data Persistence: Restore Check
    useEffect(() => {
        const backup = localStorage.getItem('admin_blog_draft_backup');
        if (backup && !isCreating && !editingPost) {
            if (window.confirm('⚠️ Önceki oturumdan kaydedilmemiş bir taslak bulundu. Geri yüklemek ister misiniz?')) {
                const parsed = JSON.parse(backup);
                setFormData(parsed.formData);
                setAffiliateSlots(parsed.affiliateSlots || []);
                setImageKeywords(parsed.imageKeywords || []);
                setAiImagePrompt(parsed.aiImagePrompt || '');
                setIsCreating(true);
            } else {
                localStorage.removeItem('admin_blog_draft_backup');
            }
        }
    }, []);

    const handleAIGenerated = async (aiResponse) => {
        // Populate form with AI content
        setFormData(prev => ({
            ...prev,
            title: {
                de: aiResponse.de.match(/<h1>(.*?)<\/h1>/)?.[1] || '',
                en: aiResponse.en.match(/<h1>(.*?)<\/h1>/)?.[1] || '',
                tr: aiResponse.tr.match(/<h1>(.*?)<\/h1>/)?.[1] || ''
            },
            content: {
                de: aiResponse.de,
                en: aiResponse.en,
                tr: aiResponse.tr
            },
            // Auto-generate slug from DE title if empty
            slug: prev.slug || aiResponse.de.match(/<h1>(.*?)<\/h1>/)?.[1]?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '',
            meta_title: aiResponse.meta_title || { tr: '', en: '', de: '' },
            meta_description: aiResponse.meta_description || { tr: '', en: '', de: '' },
            excerpt: aiResponse.excerpt || { tr: '', en: '', de: '' }
        }));

        setAffiliateSlots(aiResponse.slots || []);
        setImageKeywords(aiResponse.image_search_keywords || []);
        setAiImagePrompt(aiResponse.image_generation_prompt || '');

        // Handle Tags (Auto-select or Create)
        if (aiResponse.tags && Array.isArray(aiResponse.tags)) {
            const newSelectedTags = [];
            for (const tagName of aiResponse.tags) {
                // Check if exists (case-insensitive)
                const existingTag = tags.find(t => t.name.tr.toLowerCase() === tagName.toLowerCase() || t.name.en.toLowerCase() === tagName.toLowerCase());

                if (existingTag) {
                    newSelectedTags.push(existingTag.id);
                } else {
                    // Create new tag if strictly requested
                    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const newTagObj = {
                        name: { tr: tagName, en: tagName, de: tagName },
                        slug: slug,
                        usage_count: 0
                    };
                    const { data, error } = await supabase.from('blog_tags').insert([newTagObj]).select().single();
                    if (!error && data) {
                        setTags(prev => [...prev, data]);
                        newSelectedTags.push(data.id);
                    }
                }
            }
            // Merge with existing selected tags
            setSelectedTags(prev => [...new Set([...prev, ...newSelectedTags])]);
        }

        setIsCreating(true); // Switch to create mode
    };

    const handleSlotUpdate = (slotId, productData) => {
        // Update slots state
        const updatedSlots = affiliateSlots.map(slot =>
            slot.id === slotId ? { ...slot, assignedProduct: productData } : slot
        );
        setAffiliateSlots(updatedSlots);

        // Inject link into content for all languages
        const linkHtml = `<a href="${productData.url}" target="_blank" rel="nofollow sponsored" class="affiliate-link">${productData.title}</a>`;

        setFormData(prev => {
            const newContent = { ...prev.content };
            ['de', 'en', 'tr'].forEach(lang => {
                newContent[lang] = newContent[lang].replace(`{{${slotId}}}`, linkHtml);
            });
            return { ...prev, content: newContent };
        });
    };

    const handleInternalLinking = () => {
        const currentContent = formData.content[activeLang];
        if (!currentContent) return alert("Önce içerik yazmalısınız.");

        // Filter out current post from candidates to avoid self-linking
        const candidatePosts = posts.filter(p => !editingPost || p.id !== editingPost.id);

        const newContent = generateInternalLinks(currentContent, candidatePosts, activeLang);

        if (newContent === currentContent) {
            alert("Eklenecek yeni iç link bulunamadı.");
        } else {
            updateField('content', newContent);
            alert("✅ İç linkler eklendi! Lütfen içeriği kontrol edin.");
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // Trigger auto-publish check so admin sees up-to-date status
            await supabase.rpc('auto_publish_scheduled_posts');

            let query = supabase
                .from('posts')
                .select('*', { count: 'exact' });

            // Apply Filters
            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            if (searchTerm) {
                // Simple search on title (TR) for now, or use textSearch if enabled
                // Using ILIKE for broader compatibility
                query = query.ilike('title->>tr', `%${searchTerm}%`);
            }

            // Apply Pagination
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setPosts(data || []);
            setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (!error) setCategories(data || []);
    };

    const fetchTags = async () => {
        const { data, error } = await supabase
            .from('blog_tags')
            .select('*')
            .order('usage_count', { ascending: false });

        if (!error) setTags(data || []);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        const slug = newCategoryName.toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const newCategory = {
            name: { tr: newCategoryName, en: newCategoryName, de: newCategoryName }, // Default to same name for all langs initially
            slug: slug,
            is_active: true,
            sort_order: categories.length + 1
        };

        const { data, error } = await supabase
            .from('blog_categories')
            .insert([newCategory])
            .select()
            .single();

        if (error) {
            alert('Kategori eklenirken hata oluştu: ' + error.message);
        } else {
            setCategories([...categories, data]);
            setSelectedCategories([...selectedCategories, data.id]);
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    const handleAddTag = async () => {
        if (!newTagInput.trim()) return;

        // Check if tag already exists (Turkish locale aware)
        const existingTag = tags.find(t =>
            t.name.tr.toLocaleLowerCase('tr') === newTagInput.toLocaleLowerCase('tr') ||
            (t.name.en && t.name.en.toLocaleLowerCase('tr') === newTagInput.toLocaleLowerCase('tr'))
        );

        if (existingTag) {
            if (!selectedTags.includes(existingTag.id)) {
                setSelectedTags(prev => [...prev, existingTag.id]);
            }
            setNewTagInput('');
            return;
        }

        // Create new tag
        const slug = newTagInput.toLocaleLowerCase('tr')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const newTag = {
            name: { tr: newTagInput, en: newTagInput, de: newTagInput },
            slug: slug,
            usage_count: 0
        };

        const { data, error } = await supabase
            .from('blog_tags')
            .insert([newTag])
            .select()
            .single();

        if (error) {
            console.error('Tag add error:', error);
            alert('Etiket eklenirken hata oluştu: ' + error.message);
        } else {
            setTags(prevTags => [...prevTags, data]);
            setSelectedTags(prevSelected => [...prevSelected, data.id]);
            setNewTagInput('');
        }
    };

    const handleDeleteCategory = async (id, name) => {
        console.log('🗑️ handleDeleteCategory called:', { id, name });
        // Removed confirmation to fix deletion issue
        // if (!window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;

        console.log('✅ Proceeding with deletion...');

        const { error } = await supabase
            .from('blog_categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Delete error:', error);
            alert('Hata: ' + error.message);
        } else {
            console.log('✅ Category deleted successfully');
            setCategories(categories.filter(c => c.id !== id));
            setSelectedCategories(selectedCategories.filter(cId => cId !== id));
        }
    };

    const handleDeleteTag = async (id, name) => {
        console.log('🗑️ handleDeleteTag called:', { id, name });
        // Removed confirmation to fix deletion issue
        // if (!window.confirm(`"${name}" etiketini silmek istediğinize emin misiniz?`)) return;

        console.log('✅ Proceeding with deletion...');

        const { error } = await supabase
            .from('blog_tags')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Delete error:', error);
            alert('Hata: ' + error.message);
        } else {
            console.log('✅ Tag deleted successfully');
            setTags(tags.filter(t => t.id !== id));
            setSelectedTags(selectedTags.filter(tId => tId !== id));
        }
    };

    const handleEdit = async (post) => {
        setEditingPost(post);
        setFormData({
            slug: post.slug,
            featured_image_url: post.featured_image_url || post.image_url || '',
            status: post.status,
            title: post.title || { tr: '', en: '', de: '' },
            excerpt: post.excerpt || { tr: '', en: '', de: '' },
            content: post.content || { tr: '', en: '', de: '' },
            meta_title: post.meta_title || { tr: '', en: '', de: '' },

            meta_description: post.meta_description || { tr: '', en: '', de: '' },
            is_featured: post.is_featured || false
        });

        // Fetch post categories
        const { data: postCats } = await supabase
            .from('post_categories')
            .select('category_id')
            .eq('post_id', post.id);
        setSelectedCategories(postCats?.map(pc => pc.category_id) || []);

        // Fetch post tags
        const { data: postTags } = await supabase
            .from('post_tags')
            .select('tag_id')
            .eq('post_id', post.id);
        setSelectedTags(postTags?.map(pt => pt.tag_id) || []);

        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingPost(null);
        setFormData({
            slug: '',
            image_url: '',
            status: 'draft',
            is_featured: false,
            title: { tr: '', en: '', de: '' },
            excerpt: { tr: '', en: '', de: '' },
            content: { tr: '', en: '', de: '' },
            meta_title: { tr: '', en: '', de: '' },
            meta_description: { tr: '', en: '', de: '' }
        });
        setSelectedCategories([]);
        setSelectedTags([]);
        setIsCreating(true);
    };

    const handleSave = async (retrySlug = null) => {
        // Prepare slug: Use retrySlug if provided (string), otherwise use state
        const activeSlug = typeof retrySlug === 'string' ? retrySlug : formData.slug;
        console.log("💾 Save initiated...", { activeSlug });

        if (!user) {
            alert("Hata: Oturum açmış kullanıcı bulunamadı.");
            return;
        }

        // Validation
        if (!formData.title.tr && !formData.title.en && !formData.title.de) {
            alert("Hata: En az bir dilde başlık girmelisiniz.");
            return;
        }

        if (!activeSlug) {
            alert("Hata: URL (Slug) alanı boş olamaz.");
            return;
        }

        setLoading(true);

        try {
            const postData = {
                ...formData,
                slug: activeSlug,
                author_id: user.id,
                updated_at: new Date(),
                // Fix timezone issue: Convert local input time to UTC ISO string
                scheduled_for: formData.scheduled_for ? new Date(formData.scheduled_for).toISOString() : null
            };

            console.log("📝 Preparing to save post data:", postData);

            let postId;
            let error;

            if (isCreating) {
                console.log("➡️ Inserting new post...");
                const { data, error: createError } = await supabase
                    .from('posts')
                    .insert([postData])
                    .select();

                if (createError) console.error("❌ Insert Error:", createError);
                error = createError;
                postId = data?.[0]?.id;
            } else {
                console.log("🔄 Updating existing post:", editingPost.id);
                const { error: updateError } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', editingPost.id);

                if (updateError) console.error("❌ Update Error:", updateError);
                error = updateError;
                postId = editingPost.id;
            }

            if (error) {
                // Handle Duplicate Slug (Unique Violation) automatically
                if (error.code === '23505') {
                    const newSlug = `${activeSlug}-${Math.floor(Math.random() * 1000)}`;
                    console.warn(`⚠️ Slug collision detected for "${activeSlug}". Auto-retrying with "${newSlug}"...`);

                    // Update state so UI reflects the change
                    setFormData(prev => ({ ...prev, slug: newSlug }));
                    setSaveMessage(`URL çakışması çözülüyor (${newSlug})...`);

                    // Recursive retry with new slug
                    return handleSave(newSlug);
                }
                throw error;
            }

            console.log("✅ Post saved successfully, ID:", postId);

            // Save categories
            if (postId) {
                console.log("🏷️ Saving categories...");
                // Delete existing categories
                const { error: catDelError } = await supabase
                    .from('post_categories')
                    .delete()
                    .eq('post_id', postId);
                if (catDelError) console.error("Error deleting categories:", catDelError);

                // Insert new categories
                if (selectedCategories.length > 0) {
                    const categoryInserts = selectedCategories.map(catId => ({
                        post_id: postId,
                        category_id: catId
                    }));
                    const { error: catInsError } = await supabase
                        .from('post_categories')
                        .insert(categoryInserts);
                    if (catInsError) console.error("Error inserting categories:", catInsError);
                }

                // Save tags
                console.log("🏷️ Saving tags...");
                // Delete existing tags
                const { error: tagDelError } = await supabase
                    .from('post_tags')
                    .delete()
                    .eq('post_id', postId);
                if (tagDelError) console.error("Error deleting tags:", tagDelError);

                // Insert new tags
                if (selectedTags.length > 0) {
                    const tagInserts = selectedTags.map(tagId => ({
                        post_id: postId,
                        tag_id: tagId
                    }));
                    const { error: tagInsError } = await supabase
                        .from('post_tags')
                        .insert(tagInserts);
                    if (tagInsError) console.error("Error inserting tags:", tagInsError);
                }
            }

            setSaveStatus('success');
            setSaveMessage('✅ Yazı başarıyla kaydedildi!');

            // Clear local storage backup on successful save
            localStorage.removeItem('admin_blog_draft_backup');

            // Clear success message after 1 second and close
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage('');
                if (isCreating) {
                    setEditingPost(null);
                    setIsCreating(false);
                    setSelectedCategories([]);
                    setSelectedTags([]);
                    setFormData({
                        slug: '',
                        featured_image_url: '',
                        status: 'draft',
                        scheduled_for: '',
                        title: { tr: '', en: '', de: '' },
                        excerpt: { tr: '', en: '', de: '' },
                        content: { tr: '', en: '', de: '' },
                        meta_title: { tr: '', en: '', de: '' },
                        meta_description: { tr: '', en: '', de: '' }
                    });
                    fetchPosts();
                } else {
                    setEditingPost(null);
                    setIsCreating(false);
                    fetchPosts();
                }
            }, 1000);

        } catch (err) {
            console.error('Save Loop Error:', err);
            setSaveStatus('error');
            setSaveMessage('Kaydetme hatası: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        console.log('--- DELETE PROCESS STARTED ---');
        console.log('Target Post ID:', id);
        console.log('Current User:', user);

        // TEMPORARILY DISABLED CONFIRMATION TO DEBUG
        // if (!window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;

        try {
            console.log('Initiating RPC call: delete_post_admin...');
            const { data, error } = await supabase.rpc('delete_post_admin', { post_id: id });

            console.log('RPC Response Data:', data);
            console.log('RPC Response Error:', error);

            if (error) {
                console.error('CRITICAL RPC ERROR:', error);
                alert('❌ SİLME HATASI (RPC): ' + error.message);
                return;
            }

            if (data && data.success === false) {
                console.error('LOGICAL ERROR:', data);
                alert('❌ SİLME BAŞARISIZ: ' + (data.error || 'Bilinmeyen hata') + '\nDebug: ' + JSON.stringify(data));
                return;
            }

            console.log('Deletion successful. Updating local state...');
            setPosts(posts.filter(p => p.id !== id));
            alert('✅ İŞLEM BAŞARILI: Yazı silindi.\n(Sayfa yenileniyor...)');

            // Force reload to be absolutely sure
            window.location.reload();

        } catch (error) {
            console.error('EXCEPTION CAUGHT:', error);
            alert('❌ BEKLENMEYEN HATA: ' + error.message);
        }
    };

    // Bulk Delete Handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPosts(posts.map(p => p.id));
        } else {
            setSelectedPosts([]);
        }
    };

    const handleSelectPost = (id) => {
        if (selectedPosts.includes(id)) {
            setSelectedPosts(selectedPosts.filter(pId => pId !== id));
        } else {
            setSelectedPosts([...selectedPosts, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`${selectedPosts.length} adet yazıyı silmek istediğinize emin misiniz?`)) return;

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .in('id', selectedPosts);

            if (error) throw error;

            alert('✅ Seçilen yazılar silindi.');
            setPosts(posts.filter(p => !selectedPosts.includes(p.id)));
            setSelectedPosts([]);
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('Hata: ' + error.message);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [activeLang]: value
            }
        }));
    };

    const handleTitleChange = (value) => {
        updateField('title', value);
        if (activeLang === 'tr' && isCreating && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            }));
        }
    };

    return (
        <div className="admin-blog-page" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Blog Yönetimi</h1>
                    <p>Blog yazılarını buradan yönetebilirsiniz.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowAIGenerator(true)}
                        style={{ background: 'linear-gradient(45deg, #4f46e5, #9333ea)', color: 'white', border: 'none' }}
                    >
                        🤖 AI ile Yaz
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowShowcaseSettings(true)}
                        style={{ background: 'white', color: '#4b5563', border: '1px solid #d1d5db' }}
                    >
                        ⚙️ Vitrin Ayarları
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowImageOptimizer(true)}
                        style={{ background: '#10b981', color: 'white', border: 'none' }}
                    >
                        📸 Resimleri Optimize Et
                    </button>
                    {selectedPosts.length > 0 && (
                        <button
                            className="btn btn-danger"
                            onClick={handleBulkDelete}
                            style={{ background: '#dc2626', color: 'white' }}
                        >
                            Seçilenleri Sil ({selectedPosts.length})
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleCreate}>+ Yeni Yazı</button>
                </div>
            </div>

            {showAIGenerator && (
                <AIBlogGenerator
                    onClose={() => setShowAIGenerator(false)}
                    onGenerate={handleAIGenerated}
                />
            )}

            {showImageOptimizer && (
                <BulkImageOptimizer onClose={() => setShowImageOptimizer(false)} />
            )}

            {showShowcaseSettings && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h3>🏠 Anasayfa Blog Vitrini Ayarları</h3>

                        <div className="form-group">
                            <label>Vitrin Modu</label>
                            <select
                                className="form-control"
                                value={showcaseConfig.mode}
                                onChange={(e) => setShowcaseConfig({ ...showcaseConfig, mode: e.target.value })}
                            >
                                <option value="latest">🚀 En Yeniler (Otomatik)</option>
                                <option value="featured">⭐ Editörün Seçtikleri (Manuel)</option>
                                <option value="popular">🔥 En Çok Okunanlar (Popüler)</option>
                            </select>
                            <small style={{ display: 'block', marginTop: '5px', color: '#6b7280' }}>
                                {showcaseConfig.mode === 'latest' && "Son eklenen 3 yazı otomatik gösterilir."}
                                {showcaseConfig.mode === 'featured' && "Sadece 'Öne Çıkarılan' olarak işaretlediğiniz yazılar gösterilir."}
                                {showcaseConfig.mode === 'popular' && "Okunma sayısına göre en yüksek 3 yazı gösterilir."}
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Bölüm Başlığı (TR)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={showcaseConfig.title?.tr || ''}
                                onChange={(e) => setShowcaseConfig({
                                    ...showcaseConfig,
                                    title: { ...showcaseConfig.title, tr: e.target.value }
                                })}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowShowcaseSettings(false)}>İptal</button>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    const { error } = await supabase
                                        .from('site_settings')
                                        .update({
                                            blog_showcase_mode: showcaseConfig.mode,
                                            blog_showcase_title: showcaseConfig.title
                                        })
                                        .eq('id', 1); // Assuming single row settings

                                    // Fallback upsert if no row exists (common in fresh installs)
                                    if (error) {
                                        await supabase.from('site_settings').upsert({
                                            id: 1, // Enforce ID 1
                                            blog_showcase_mode: showcaseConfig.mode,
                                            blog_showcase_title: showcaseConfig.title,
                                            updated_at: new Date()
                                        });
                                    }

                                    alert('✅ Ayarlar kaydedildi!');
                                    setShowShowcaseSettings(false);
                                }}
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRepurposer && (
                <ContentRepurposer
                    isOpen={showRepurposer}
                    onClose={() => setShowRepurposer(false)}
                    postData={formData}
                />
            )}

            {(isCreating || editingPost) ? (
                <div className="admin-card">
                    {/* ... (existing edit UI) ... */}

                    {/* Affiliate Slot Manager (Show only if slots exist) */}
                    {affiliateSlots.length > 0 && (
                        <AffiliateSlotManager
                            slots={affiliateSlots}
                            onUpdateSlot={handleSlotUpdate}
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>{isCreating ? 'Yeni Yazı Oluştur' : 'Yazıyı Düzenle'}</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!isCreating && editingPost && (
                                <a
                                    href={`/blog/${formData.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                    👁️ Önizle
                                </a>
                            )}
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowRepurposer(true)}
                                style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                🪄 Sihirli Değnek
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleInternalLinking}
                                title="İçerikte geçen diğer yazıların başlıklarını bulur ve linkler."
                            >
                                🔗 Linkle
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => { setIsCreating(false); setEditingPost(null); }}>İptal</button>
                        </div>
                    </div>

                    <div className="language-tabs" style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
                        {languages.map(lang => (
                            <button
                                type="button"
                                key={lang.code}
                                onClick={() => setActiveLang(lang.code)}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    background: activeLang === lang.code ? '#fff' : 'transparent',
                                    borderBottom: activeLang === lang.code ? '2px solid #3b82f6' : 'none',
                                    cursor: 'pointer',
                                    fontWeight: activeLang === lang.code ? 'bold' : 'normal',
                                    color: activeLang === lang.code ? '#3b82f6' : '#666'
                                }}
                            >
                                {lang.flag} {lang.label}
                            </button>
                        ))}
                    </div>

                    <div className="form-group">
                        <label>Başlık ({activeLang.toUpperCase()})</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.title[activeLang] || ''}
                            onChange={(e) => handleTitleChange(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Slug (URL)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', fontWeight: 'bold' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            ⭐ Bu Yazıyı Vitrinde Öne Çıkar (Featured)
                        </label>
                        <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                            "Seçtiklerim" modunda anasayfada gösterilir.
                        </small>
                    </div>

                    {/* Categories */}
                    <div className="form-group">
                        <label>Kategoriler</label>

                        {/* Category Add Button/Input */}
                        <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                            {!isAddingCategory ? (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsAddingCategory(true);
                                    }}
                                    style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                                >
                                    + YENİ KATEGORİ EKLE
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Kategori adı..."
                                        style={{ padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCategory();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }}
                                        style={{ fontSize: '12px', padding: '2px 12px' }}
                                    >
                                        OK
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsAddingCategory(false);
                                        }}
                                        style={{ fontSize: '12px', padding: '2px 12px' }}
                                    >
                                        İPTAL
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Categories List */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                            {categories.map(cat => (
                                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', background: selectedCategories.includes(cat.id) ? '#3b82f6' : '#fff', border: '1px solid #ddd', borderRadius: '6px', paddingRight: '5px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        color: selectedCategories.includes(cat.id) ? '#fff' : '#333',
                                        margin: 0
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, cat.id]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                                }
                                            }}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {cat.name[activeLang] || cat.name.tr}
                                    </label>
                                    <button
                                        type="button"
                                        className="btn-delete-category"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteCategory(cat.id, cat.name[activeLang] || cat.name.tr);
                                        }}
                                        style={{
                                            background: '#fee2e2',
                                            border: '1px solid #fca5a5',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            padding: '2px 6px',
                                            fontSize: '12px',
                                            marginLeft: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Kategoriyi Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Quick Add Missing Categories (Temporary Helper) */}
                        <div style={{ marginBottom: '15px' }}>
                            <button
                                type="button"
                                onClick={async () => {
                                    const missingCats = [
                                        { name: { tr: "Balayı Rehberi", en: "Honeymoon Guide", de: "Flitterwochen-Guide" }, slug: "honeymoon-guide" },
                                        { name: { tr: "Güzellik ve Bakım", en: "Beauty & Care", de: "Schönheit & Pflege" }, slug: "beauty-care" },
                                        { name: { tr: "Düğün Fotoğrafları", en: "Wedding Photography", de: "Hochzeitsfotografie" }, slug: "wedding-photography" },
                                        { name: { tr: "Müzik ve Eğlence", en: "Music & Entertainment", de: "Musik & Unterhaltung" }, slug: "music-entertainment" }
                                    ];

                                    let addedCount = 0;
                                    for (const cat of missingCats) {
                                        const exists = categories.some(c => c.slug === cat.slug);
                                        if (!exists) {
                                            const { error } = await supabase.from('blog_categories').insert([cat]);
                                            if (!error) addedCount++;
                                            else console.error('Error adding cat:', error);
                                        }
                                    }

                                    if (addedCount > 0) {
                                        alert(`${addedCount} yeni kategori başarıyla eklendi!`);
                                        fetchCategories();
                                    } else {
                                        alert('Tüm kategoriler zaten mevcut.');
                                    }
                                }}
                                style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                ✨ Eksik Kategorileri (Balayı, Güzellik, vb.) Otomatik Ekle
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                        <label>Etiketler</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                            {selectedTags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                    <span key={tagId} style={{
                                        background: '#e5e7eb',
                                        borderRadius: '16px',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {tag.name[activeLang] || tag.name.tr}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTags(selectedTags.filter(id => id !== tagId))}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0',
                                                fontSize: '16px',
                                                color: '#666'
                                            }}
                                        >×</button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                        <select
                            className="form-control"
                            value=""
                            onChange={(e) => {
                                if (e.target.value && !selectedTags.includes(e.target.value)) {
                                    setSelectedTags([...selectedTags, e.target.value]);
                                }
                            }}
                        >
                            <option value="">Etiket Seçin...</option>
                            {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name[activeLang] || tag.name.tr}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Yeni etiket ekle..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleAddTag();
                                }}
                                disabled={!newTagInput.trim()}
                            >
                                Ekle
                            </button>
                        </div>

                        {/* Tags List with Delete Option */}
                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <small style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>Tüm Etiketler (Silmek için X'e tıklayın):</small>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '5px', border: '1px solid #f3f4f6', borderRadius: '4px' }}>
                                {tags.map(tag => (
                                    <span key={tag.id} style={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: '#374151'
                                    }}>
                                        {tag.name[activeLang] || tag.name.tr}
                                        <button
                                            type="button"
                                            data-testid={`delete-tag-${tag.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteTag(tag.id, tag.name[activeLang] || tag.name.tr);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: '#fee2e2',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                                padding: '0',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                lineHeight: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: '6px'
                                            }}
                                            title="Etiketi Sil"
                                        >×</button>
                                    </span>
                                ))}
                                {tags.length === 0 && <small style={{ color: '#999' }}>Henüz etiket yok.</small>}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Kısa Açıklama (Excerpt) ({activeLang.toUpperCase()})</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={formData.excerpt[activeLang] || ''}
                            onChange={(e) => updateField('excerpt', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>İçerik ({activeLang.toUpperCase()})</label>
                        <SimpleEditor
                            value={formData.content[activeLang] || ''}
                            onChange={(val) => updateField('content', val)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Öne Çıkan Görsel</label>

                        {/* AI Image Generation Prompt */}
                        {aiImagePrompt && (
                            <div style={{ marginBottom: '15px', padding: '15px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <strong style={{ fontSize: '13px', color: '#0369a1' }}>🤖 AI Görsel Oluşturma Prompt'u (Midjourney/DALL-E)</strong>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(aiImagePrompt);
                                            alert('Prompt kopyalandı!');
                                        }}
                                        style={{ fontSize: '11px', background: '#0ea5e9', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Kopyala
                                    </button>
                                </div>
                                <p style={{ fontSize: '12px', color: '#333', fontStyle: 'italic', margin: 0, lineHeight: '1.4' }}>
                                    "{aiImagePrompt}"
                                </p>
                            </div>
                        )}

                        {imageKeywords.length > 0 && (
                            <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>📸 Unsplash'te Ara:</span>
                                {imageKeywords.map((kw, idx) => (
                                    <a
                                        key={idx}
                                        href={`https://unsplash.com/s/photos/${encodeURIComponent(kw)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline"
                                        style={{ textDecoration: 'none', fontSize: '12px', padding: '4px 10px', borderRadius: '15px' }}
                                    >
                                        🔍 {kw}
                                    </a>
                                ))}
                            </div>
                        )}
                        <ImageUpload
                            onUploadComplete={(url) => setFormData({ ...formData, featured_image_url: url })}
                            currentImage={formData.featured_image_url}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Durum</label>
                            <select
                                className="form-control"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="draft">Taslak</option>
                                <option value="published">Yayında</option>
                                <option value="scheduled">🕐 Zamanlanmış</option>
                            </select>
                        </div>

                        {/* Scheduled Date/Time Picker */}
                        {formData.status === 'scheduled' && (
                            <div className="form-group">
                                <label>Yayın Tarihi ve Saati</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={formData.scheduled_for}
                                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                />
                                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                                    Yazı bu tarih ve saatte otomatik olarak yayınlanacak
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="form-section" style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h3>SEO Ayarları</h3>
                        <div className="form-group">
                            <label>Meta Başlık ({activeLang.toUpperCase()})</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.meta_title[activeLang] || ''}
                                onChange={(e) => updateField('meta_title', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Meta Açıklama ({activeLang.toUpperCase()})</label>
                            <textarea
                                className="form-control"
                                rows="2"
                                value={formData.meta_description[activeLang] || ''}
                                onChange={(e) => updateField('meta_description', e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                        {saveStatus === 'success' && <span style={{ color: 'green', fontWeight: 'bold' }}>{saveMessage}</span>}
                        {saveStatus === 'error' && <span style={{ color: 'red', fontWeight: 'bold' }}>{saveMessage}</span>}

                        <button className="btn btn-secondary" onClick={() => { setIsCreating(false); setEditingPost(null); }}>İptal</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div >
            ) : (
                <div className="admin-card">
                    {/* Search and Filters */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Başlık ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ width: '200px' }}>
                            <select
                                className="form-control"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tüm Durumlar</option>
                                <option value="published">Yayında</option>
                                <option value="draft">Taslak</option>
                                <option value="scheduled">Zamanlanmış</option>
                            </select>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={posts.length > 0 && selectedPosts.length === posts.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={{ padding: '10px' }}>Başlık</th>
                                <th style={{ padding: '10px' }}>Durum</th>
                                <th style={{ padding: '10px' }}>Tarih</th>
                                <th style={{ padding: '10px' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedPosts.includes(post.id)}
                                            onChange={() => handleSelectPost(post.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <strong>{post.title?.tr || post.title?.en || 'Başlıksız'}</strong>
                                        <br />
                                        <small style={{ color: '#666' }}>/{post.slug}</small>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span className={`status-badge ${post.status}`} style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: post.status === 'published' ? '#d1fae5' : (post.status === 'scheduled' ? '#e0f2fe' : '#f3f4f6'),
                                            color: post.status === 'published' ? '#065f46' : (post.status === 'scheduled' ? '#0369a1' : '#374151'),
                                            fontSize: '12px'
                                        }}>
                                            {post.status === 'published' ? 'Yayında' : (post.status === 'scheduled' ? 'Zamanlanmış' : 'Taslak')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {post.status === 'scheduled' && post.scheduled_for ? (
                                            <div>
                                                <small style={{ display: 'block', color: '#0369a1' }}>Planlandı:</small>
                                                {new Date(post.scheduled_for).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        ) : (
                                            new Date(post.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(post)} style={{ marginRight: '5px' }}>Düzenle</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id)} style={{ color: 'red' }}>Sil</button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                        Henüz hiç yazı yok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                            <button
                                className="btn btn-secondary"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                &lt; Önceki
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                Sayfa {page} / {totalPages}
                            </span>
                            <button
                                className="btn btn-secondary"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Sonraki &gt;
                            </button>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default AdminBlog;
