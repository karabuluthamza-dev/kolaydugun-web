import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const BlogCard = ({ post, lang, categories = [] }) => {
    const title = post.title?.[lang] || post.title?.['tr'] || post.title?.['en'] || 'Untitled';
    const excerpt = post.excerpt?.[lang] || post.excerpt?.['tr'] || post.excerpt?.['en'] || '';
    const date = new Date(post.created_at).toLocaleString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <article className="blog-card" style={{
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div className="blog-image-wrapper" style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
                <img
                    src={getOptimizedImageUrl(post.featured_image_url || post.image_url, 'card') || 'https://via.placeholder.com/400x250?text=No+Image'}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                    }}
                />
            </div>

            <div className="blog-content" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Categories */}
                {categories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {categories.map(cat => (
                            <span key={cat.id} style={{
                                padding: '4px 10px',
                                background: '#f3f4f6',
                                color: '#374151',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {cat.name?.[lang] || cat.name?.tr || 'Category'}
                            </span>
                        ))}
                    </div>
                )}

                <div className="blog-meta" style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span>{date}</span>
                    {post.reading_time && (
                        <span>⏱️ {post.reading_time} {lang === 'tr' ? 'dk' : 'min'}</span>
                    )}
                    {post.view_count > 0 && (
                        <span>👁️ {post.view_count.toLocaleString()}</span>
                    )}
                </div>

                <h3 className="blog-title" style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                    color: '#1a1a1a'
                }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {title}
                    </Link>
                </h3>

                <p className="blog-excerpt" style={{
                    fontSize: '0.95rem',
                    color: '#555',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    flex: 1
                }}>
                    {excerpt}
                </p>

                <Link to={`/blog/${post.slug}`} className="read-more-link" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: '#d63638', // Brand color
                    fontWeight: '600',
                    textDecoration: 'none',
                    fontSize: '0.95rem'
                }}>
                    {lang === 'tr' ? 'Devamını Oku' : lang === 'de' ? 'Weiterlesen' : 'Read More'}
                    <span style={{ marginLeft: '5px' }}>→</span>
                </Link>
            </div>
        </article>
    );
};

export default BlogCard;
