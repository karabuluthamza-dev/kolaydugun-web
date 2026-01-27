import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import BlogCard from '../components/BlogCard';
import './AdminConfig.css'; // Basic styles

const Blog = () => {
    const { language, t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Categories
    const [selectedCategory, setSelectedCategory] = useState('');
    const [postCategories, setPostCategories] = useState({});

    // Get current language code (tr, en, de)
    const currentLang = language ? language.split('-')[0] : 'tr';

    // SEO labels
    const blogTitle = currentLang === 'tr' ? 'Blog & İlham' : currentLang === 'de' ? 'Blog & Inspiration' : 'Blog & Inspiration';
    const blogDesc = currentLang === 'tr'
        ? 'Düğün planlamanız için en güncel ipuçları, trendler ve rehberler.'
        : currentLang === 'de'
            ? 'Die neuesten Tipps, Trends und Ratgeber für Ihre Hochzeitsplanung.'
            : 'Latest tips, trends and guides for your wedding planning.';

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (!error) setCategories(data || []);
    };

    const fetchPosts = async () => {
        setLoading(true);

        // Auto-publish scheduled posts that are due
        try {
            await supabase.rpc('auto_publish_scheduled_posts');
        } catch (error) {
            console.log('Auto-publish check:', error);
        }

        let postsData;

        if (selectedCategory) {
            // Fetch posts by category using RPC function
            const { data, error } = await supabase
                .rpc('get_posts_by_category', {
                    p_category_slug: selectedCategory,
                    p_limit: 100,
                    p_offset: 0
                });

            if (error) {
                console.error('Error fetching posts by category:', error);
                postsData = [];
            } else {
                postsData = data || [];
            }
        } else {
            // Fetch all published posts
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error);
                postsData = [];
            } else {
                postsData = data || [];
            }
        }

        setPosts(postsData);

        // Fetch categories for each post
        if (postsData && postsData.length > 0) {
            const postIds = postsData.map(p => p.id);
            const { data: catData } = await supabase
                .from('post_categories')
                .select('post_id, category_id, blog_categories(id, name, slug)')
                .in('post_id', postIds);

            // Group by post_id
            const catMap = {};
            catData?.forEach(pc => {
                if (pc.blog_categories) {
                    if (!catMap[pc.post_id]) catMap[pc.post_id] = [];
                    catMap[pc.post_id].push(pc.blog_categories);
                }
            });
            setPostCategories(catMap);
        }

        setLoading(false);
    };

    if (loading) return (
        <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div className="blog-page-wrapper" style={{ background: '#f9f9f9', minHeight: '100vh', paddingBottom: '80px' }}>
            <SEO
                title={blogTitle}
                description={blogDesc}
                url="/blog"
                hreflangUrls={{ de: '/blog', tr: '/blog', en: '/blog' }}
            />
            {/* Hero Section for Blog */}
            <div className="blog-hero" style={{
                background: '#fff',
                padding: '80px 0 60px',
                textAlign: 'center',
                borderBottom: '1px solid #eee',
                marginBottom: '60px'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px', color: '#1a1a1a' }}>
                        {currentLang === 'tr' ? 'Blog & İlham' : currentLang === 'de' ? 'Blog & Inspiration' : 'Blog & Inspiration'}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto 30px' }}>
                        {currentLang === 'tr'
                            ? 'Düğün planlamanız için en güncel ipuçları, trendler ve rehberler.'
                            : currentLang === 'de'
                                ? 'Die neuesten Tipps, Trends und Ratgeber für Ihre Hochzeitsplanung.'
                                : 'Latest tips, trends and guides for your wedding planning.'}
                    </p>

                    {/* Category Filter - Pill Buttons */}
                    {categories.length > 0 && (
                        <div
                            className="category-filter-container"
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                justifyContent: 'center',
                                padding: '10px 20px 20px',
                                maxWidth: '900px',
                                margin: '0 auto'
                            }}
                        >
                            {/* All Categories Button */}
                            <button
                                onClick={() => setSelectedCategory('')}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '0.9rem',
                                    fontWeight: selectedCategory === '' ? '600' : '500',
                                    border: 'none',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: selectedCategory === ''
                                        ? 'linear-gradient(135deg, #d63638, #ff6b6b)'
                                        : '#fff',
                                    color: selectedCategory === '' ? '#fff' : '#4b5563',
                                    boxShadow: selectedCategory === ''
                                        ? '0 4px 15px rgba(214, 54, 56, 0.3)'
                                        : '0 2px 8px rgba(0,0,0,0.08)',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >
                                {currentLang === 'tr' ? 'Tümü' : currentLang === 'de' ? 'Alle' : 'All'}
                            </button>

                            {/* Category Buttons */}
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '0.9rem',
                                        fontWeight: selectedCategory === cat.slug ? '600' : '500',
                                        border: 'none',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: selectedCategory === cat.slug
                                            ? 'linear-gradient(135deg, #d63638, #ff6b6b)'
                                            : '#fff',
                                        color: selectedCategory === cat.slug ? '#fff' : '#4b5563',
                                        boxShadow: selectedCategory === cat.slug
                                            ? '0 4px 15px rgba(214, 54, 56, 0.3)'
                                            : '0 2px 8px rgba(0,0,0,0.08)',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                    }}
                                >
                                    {cat.name?.[currentLang] || cat.name?.tr || 'Category'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container">
                <div className="blog-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '40px'
                }}>
                    {posts.map(post => (
                        <BlogCard
                            key={post.id}
                            post={post}
                            lang={currentLang}
                            categories={postCategories[post.id] || []}
                        />
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <h3>
                            {currentLang === 'tr' ? 'Henüz yazı yok' : currentLang === 'de' ? 'Keine Beiträge' : 'No posts yet'}
                        </h3>
                        <p style={{ color: '#666' }}>
                            {currentLang === 'tr' ? 'Çok yakında harika içeriklerle buradayız!' : 'Content coming soon!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
