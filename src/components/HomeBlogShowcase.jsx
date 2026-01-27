import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const HomeBlogShowcase = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        mode: 'latest', // latest, featured, popular
        title: { tr: 'Popüler Blog Yazıları', en: 'Popular Blog Posts', de: 'Beliebte Blogbeiträge' }
    });

    useEffect(() => {
        fetchShowcaseData();
    }, []);

    const fetchShowcaseData = async () => {
        try {
            // 1. Fetch Settings
            const { data: settingsData } = await supabase
                .from('site_settings')
                .select('blog_showcase_mode, blog_showcase_title')
                .single();

            const currentMode = settingsData?.blog_showcase_mode || 'latest';
            const currentTitle = settingsData?.blog_showcase_title || settings.title;

            setSettings({
                mode: currentMode,
                title: currentTitle
            });

            // 2. Fetch Posts based on mode
            let query = supabase
                .from('posts')
                .select('id, title, excerpt, featured_image_url, slug, created_at, view_count')
                .eq('status', 'published')
                .limit(3);

            if (currentMode === 'featured') {
                // If featured mode, prioritize is_featured
                // We order by featured_sort_order (if exists) or created_at
                query = query.eq('is_featured', true).order('created_at', { ascending: false });
            } else if (currentMode === 'popular') {
                // Popular mode (most views)
                // Note: Ensure view_count exists, otherwise this might fail silently or order by created_at
                query = query.order('view_count', { ascending: false });
            } else {
                // Latest mode
                query = query.order('created_at', { ascending: false });
            }

            const { data: postsData, error } = await query;

            if (error) {
                console.error('Error fetching showcase posts:', error);
                // Fallback to latest if featured fails (empty) is handled by UI state
            }

            // If featured mode returns 0 posts, maybe fallback to latest?
            if (currentMode === 'featured' && (!postsData || postsData.length === 0)) {
                // Optional: fallback
                console.log("No featured posts found, falling back to latest...");
                const { data: fallbackData } = await supabase
                    .from('posts')
                    .select('id, title, excerpt, featured_image_url, slug')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(3);
                setPosts(fallbackData || []);
            } else {
                setPosts(postsData || []);
            }

        } catch (err) {
            console.error('Showcase fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null; // Or skeleton
    if (posts.length === 0) return null;

    return (
        <section className="blog-showcase-section" style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1f2937' }}>
                            {settings.title[language] || settings.title['en']}
                        </h2>
                        <div style={{ width: '60px', height: '4px', background: '#ec4899', borderRadius: '2px' }}></div>
                    </div>
                    <button
                        onClick={() => navigate('/blog')}
                        style={{
                            padding: '10px 24px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '50px',
                            fontWeight: '600',
                            color: '#4b5563',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#ec4899';
                            e.target.style.color = 'white';
                            e.target.style.borderColor = '#ec4899';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.color = '#4b5563';
                            e.target.style.borderColor = '#e5e7eb';
                        }}
                    >
                        {t('common.viewAll') || 'View All'} →
                    </button>
                </div>

                <div className="posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {posts.map(post => {
                        const title = post.title?.[language] || post.title?.en || 'Untitled';
                        const excerpt = post.excerpt?.[language] || post.excerpt?.en || '';

                        return (
                            <div key={post.id} className="post-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', cursor: 'pointer' }}
                                onClick={() => navigate(`/blog/${post.slug}`)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={post.featured_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'}
                                        alt={title}
                                        width="400"
                                        height="200"
                                        loading="lazy"
                                        decoding="async"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', lineHeight: '1.4', color: '#111827' }}>{title}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                                        {excerpt.substring(0, 120)}...
                                    </p>
                                    <span style={{ color: '#ec4899', fontWeight: '600', fontSize: '0.9rem' }}>
                                        {t('blog.readMore') || 'Read More'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HomeBlogShowcase;
