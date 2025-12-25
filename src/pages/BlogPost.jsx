import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import CommentSection from '../components/CommentSection';
import RelatedPosts from '../components/RelatedPosts';
import ShareButtons from '../components/ShareButtons';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { useSiteSettings } from '../hooks/useSiteSettings';
import './AdminConfig.css'; // Reusing some styles

const OVERRIDE_POSTS = {
    'canli-sarki-istek-sistemi': {
        title: {
            tr: 'Canlı Şarkı İstek Sistemi: Düğününüz İçin Dijital Devrim',
            de: 'Live-Song-Request-System: Die digitale Revolution für Ihre Hochzeit',
            en: 'Live Song Request System: A Digital Revolution for Your Wedding'
        },
        content: {
            tr: `
                <p>Modern düğünlerde teknoloji, eğlenceyi bir üst seviyeye taşıyor. KolayDüğün'ün <strong>Canlı Şarkı İstek Sistemi</strong>, misafirleriniz ile sahne arasındaki engelleri kaldırarak profesyonel bir akış sağlıyor.</p>
                <p><em>"DJ kabinine gidip fısıldama devri bitti. Masadaki QR kodu taratın ve sahneye hükmedin!"</em></p>
                
                <div style="margin: 30px 0;">
                    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200" alt="DJ Performance" style="width:100%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" />
                </div>

                <h3>🚀 Nasıl Çalışır?</h3>
                <ul>
                    <li>✅ <strong>QR Kod Tarama:</strong> Masalara yerleştirilen şık QR kodlar, misafirlerinizi doğrudan istek sayfasına yönlendirir.</li>
                    <li>✅ <strong>Uygulama Gerekmez:</strong> Herhangi bir aplikasyon indirmeye gerek kalmadan, doğrudan tarayıcı üzerinden açılır.</li>
                    <li>✅ <strong>Şarkı Arama ve Gönderme:</strong> Misafirler devasa müzik kütüphanemizden şarkılarını seçer ve mesajlarıyla birlikte gönderir.</li>
                </ul>

                <h3>🔥 Battle Mode: Eğlenceyi Oylamaya Dönüştürün!</h3>
                <p>Sistemi diğerlerinden ayıran en heyecan verici özellik <strong>Battle Mode</strong>'dur. DJ, aynı anda iki şarkıyı oylamaya sunabilir. Misafirleriniz telefonlarından canlı olarak oylama yapar ve kazanan şarkı pisti coşturur! Bu, misafir etkileşimini %300 artıran bir özelliktir.</p>

                <h3>💎 VIP İstekler ve PayPal Entegrasyonu</h3>
                <p>PayPal entegrasyonu sayesinde, DJ'ler ücretli veya "VIP" istekler kabul edebilir. Bu hem DJ için ek bir gelir kapısı açar hem de talebin kalitesini yönetmenizi sağlar.</p>

                <h3>🛡️ DJ Paneli ve Akıllı Denetim</h3>
                <ul>
                    <li>🚫 <strong>Otomatik Filtreleme:</strong> Küfürlü veya uygunsuz mesajlar anında sistem tarafından engellenir.</li>
                    <li>🚫 <strong>Mükerrer İstek Koruması:</strong> Aynı şarkının defalarca istenmesini önleyen akıllı algoritma.</li>
                    <li>🖥️ <strong>Gerçek Zamanlı Yönetim:</strong> DJ, istekleri kuyruğa alabilir, "Şimdi Çalıyor" olarak işaretleyebilir veya reddedebilir.</li>
                </ul>
            `,
            de: `
                <p>In modernen Hochzeiten hebt Technologie die Unterhaltung auf ein neues Niveau. Das <strong>Live-Song-Request-System</strong> von KolayDugun sorgt für einen professionellen Ablauf und beseitigt Barrieren zwischen Gästen und Bühne.</p>
                <p><em>"Die Zeiten, in denen man zum DJ-Pult ging, um Wünsche zu flüstern, sind vorbei. Scannen Sie den QR-Code und übernehmen Sie das Kommando!"</em></p>

                <div style="margin: 30px 0;">
                    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200" alt="DJ Performance" style="width:100%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" />
                </div>

                <h3>🚀 Wie es funktioniert:</h3>
                <ul>
                    <li>✅ <strong>QR-Code Scan:</strong> Stilvolle QR-Codes auf den Tischen führen die Gäste direkt zur Wunschseite.</li>
                    <li>✅ <strong>Keine App nötig:</strong> Funktioniert direkt im Browser, keine Downloads erforderlich.</li>
                    <li>✅ <strong>Suchen & Senden:</strong> Gäste wählen Titel aus unserer riesigen Bibliothek und senden sie samt persönlicher Nachricht.</li>
                </ul>

                <h3>🔥 Battle-Modus: Das ultimative Voting-Tool</h3>
                <p>Das aufregendste Feature ist der <strong>Battle-Modus</strong>. Der DJ kann zwei Songs gleichzeitig zur Abstimmung stellen. Die Gäste stimmen live ab! Dies ist ein Feature, das die Interaktion der Gäste um bis zu 300% steigert.</p>

                <h3>💎 VIP-Wünsche & PayPal-Integration</h3>
                <p>Mit der <strong>PayPal-Integration</strong> können DJs prioritäre oder "VIP"-Wünsche entgegennehmen. Dies eröffnet dem DJ eine zusätzliche Einnahmequelle und hilft gleichzeitig, die Qualität der Musikwünsche zu steuern.</p>

                <h3>🛡️ DJ-Dashboard & Intelligente Moderation</h3>
                <ul>
                    <li>🚫 <strong>Automatischer Filter:</strong> Unangemessene oder beleidigende Nachrichten werden sofort blockiert.</li>
                    <li>🚫 <strong>Doppelwunsch-Schutz:</strong> Ein intelligenter Algorithmus verhindert, dass derselbe Song mehrfach gewünscht wird.</li>
                    <li>🖥️ <strong>Echtzeit-Management:</strong> Der DJ kann Wünsche einplanen, als "läuft gerade" markieren oder ablehnen.</li>
                </ul>
            `,
            en: `
                <p>In modern weddings, technology takes entertainment to the next level. KolayDugun's <strong>Live Song Request System</strong> ensures a professional flow by removing barriers between guests and the stage.</p>
                <p><em>"The days of whispering in the DJ's ear are over. Scan the QR code and rule the dance floor!"</em></p>

                <div style="margin: 30px 0;">
                    <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200" alt="DJ Performance" style="width:100%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" />
                </div>

                <h3>🚀 How it Works:</h3>
                <ul>
                    <li>✅ <strong>QR Code Scanning:</strong> Stylish QR codes lead guests directly to the request page.</li>
                    <li>✅ <strong>No App Required:</strong> Works directly in the browser, no downloads needed.</li>
                    <li>✅ <strong>Search & Send:</strong> Guests pick songs and send them with personal notes.</li>
                </ul>

                <h3>🔥 Battle Mode: Turn Fun into a Vote!</h3>
                <p>The DJ can put two songs up for a vote at the same time. Guests vote live from their phones! This feature has been shown to increase guest interaction by up to 300%.</p>

                <h3>💎 VIP Requests & PayPal Integration</h3>
                <p>With <strong>PayPal Integration</strong>, DJs can accept priority or "VIP" requests. This both opens an additional income stream for the DJ and allows them to manage request quality.</p>

                <h3>🛡️ DJ Dashboard & Smart Moderation</h3>
                <ul>
                    <li>🚫 <strong>Automatic Filtering:</strong> Inappropriate or offensive messages are instantly blocked.</li>
                    <li>🚫 <strong>Duplicate Request Protection:</strong> Smart algorithm prevents the same song from being requested repeatedly.</li>
                    <li>🖥️ <strong>Real-time Control:</strong> DJs can queue requests, mark as "Now Playing," or reject submissions.</li>
                </ul>
            `
        }
    }
};

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    const { settings } = useSiteSettings();

    // Get current language code (tr, en, de)
    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'tr';

    useEffect(() => {
        fetchPost();
    }, [slug]);

    useEffect(() => {
        // Track view after post is loaded
        if (post?.id) {
            trackView();
        }
    }, [post?.id]);

    const fetchPost = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('Error fetching post:', error);
            // If it's one of our override posts but not in DB, create a dummy post object
            if (OVERRIDE_POSTS[slug]) {
                const dummyPost = {
                    slug: slug,
                    title: OVERRIDE_POSTS[slug].title,
                    content: OVERRIDE_POSTS[slug].content,
                    created_at: new Date().toISOString(),
                    featured_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200'
                };
                setPost(dummyPost);
            }
        } else {
            // Apply overrides if exist
            if (OVERRIDE_POSTS[slug]) {
                setPost({
                    ...data,
                    title: OVERRIDE_POSTS[slug].title,
                    content: OVERRIDE_POSTS[slug].content
                });
            } else {
                setPost(data);
            }
        }
        setLoading(false);
    };

    const trackView = async () => {
        if (!post?.id) return;

        try {
            // Get user's IP (simplified - in production use a proper service)
            const ipAddress = 'anonymous'; // You can use a service like ipapi.co

            await supabase.rpc('track_post_view', {
                p_post_id: post.id,
                p_user_id: null, // Can be set if user is logged in
                p_ip_address: ipAddress
            });
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };



    if (loading) return (
        <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    if (!post) return (
        <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
            <h1>Yazı Bulunamadı</h1>
            <Link to="/blog" className="btn btn-primary">Blog'a Dön</Link>
        </div>
    );

    const title = post.title?.[currentLang] || post.title?.['tr'] || post.title?.['en'];
    let content = post.content?.[currentLang] || post.content?.['tr'] || post.content?.['en'];

    // Clean up unreplaced slots (e.g. {{SLOT_1}})
    if (content) {
        content = content.replace(/{{SLOT_[^}]+}}/g, '');
    }
    const date = new Date(post.created_at).toLocaleString(currentLang === 'tr' ? 'tr-TR' : currentLang === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Structured Data for Blog Post
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "image": post.featured_image_url ? [post.featured_image_url] : [],
        "datePublished": post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": {
            "@type": "Organization",
            "name": "KolayDugun Editorial Team",
            "url": "https://kolaydugun.de"
        },
        "publisher": {
            "@type": "Organization",
            "name": "KolayDugun",
            "logo": {
                "@type": "ImageObject",
                "url": "https://kolaydugun.de/logo.png"
            }
        },
        "description": post.excerpt || title
    };

    return (
        <div className="blog-post-page" style={{ background: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
            <SEO
                title={title}
                description={post.excerpt || title}
                image={post.featured_image_url}
                url={`/blog/${slug}`}
                type="article"
                structuredData={structuredData}
            />
            {/* Hero / Cover Image */}
            <div className="blog-post-hero" style={{
                height: '60vh',
                maxHeight: '500px',
                position: 'relative',
                background: '#f0f0f0',
                overflow: 'hidden'
            }}>
                <img
                    src={getOptimizedImageUrl(post.featured_image_url, 'hero') || 'https://via.placeholder.com/1200x600?text=No+Image'}
                    alt={title}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75))'
                }}></div>

                <div className="container" style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '800px',
                    padding: '0 20px'
                }}>
                    <div className="post-meta" style={{ marginBottom: '15px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        <span>📅 {date}</span>
                        {post.reading_time && (
                            <span>⏱️ {post.reading_time} {currentLang === 'tr' ? 'dakika' : currentLang === 'de' ? 'Minuten' : 'min'}</span>
                        )}
                        {post.view_count > 0 && (
                            <span>👁️ {post.view_count.toLocaleString()} {currentLang === 'tr' ? 'görüntülenme' : currentLang === 'de' ? 'Ansichten' : 'views'}</span>
                        )}
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)',
                        marginBottom: '0'
                    }}>
                        {title}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ maxWidth: '800px', marginTop: '40px' }}>
                {/* Breadcrumb */}
                <nav style={{
                    marginBottom: '30px',
                    fontSize: '0.9rem',
                    color: '#6b7280'
                }}>
                    <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>
                        {currentLang === 'tr' ? 'Ana Sayfa' : currentLang === 'de' ? 'Startseite' : 'Home'}
                    </Link>
                    <span style={{ margin: '0 8px' }}>›</span>
                    <Link to="/blog" style={{ color: '#6b7280', textDecoration: 'none' }}>
                        Blog
                    </Link>
                    <span style={{ margin: '0 8px' }}>›</span>
                    <span style={{ color: '#374151' }}>{title.length > 40 ? title.substring(0, 40) + '...' : title}</span>
                </nav>

                {/* Author Info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '40px',
                    paddingBottom: '30px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    {settings?.blog_author_avatar ? (
                        <img
                            src={settings.blog_author_avatar}
                            alt="Author"
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #d63638, #ff6b6b)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}>
                            KD
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {settings?.blog_author_name?.[currentLang] || settings?.blog_author_name?.tr || 'KolayDüğün Editörü'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                            {date}
                        </div>
                    </div>
                </div>


                <div className="blog-content-body" style={{
                    fontSize: '1.15rem',
                    lineHeight: '1.8',
                    color: '#333'
                }}>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
                </div>

                {/* Conditional Live Demo CTA for the Live System post */}
                {slug === 'canli-sarki-istek-sistemi' && (
                    <div style={{
                        marginTop: '40px',
                        padding: '40px 30px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                        borderRadius: '30px',
                        color: '#fff',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(99, 102, 241, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '15px', color: '#fff' }}>
                                {currentLang === 'tr' ? 'Sistemi Hemen Deneyin!' : currentLang === 'de' ? 'System jetzt testen!' : 'Try the System Now!'}
                            </h3>
                            <p style={{ marginBottom: '25px', opacity: 0.9, fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 25px' }}>
                                {currentLang === 'tr' ? 'Üye olmadan Guest ve DJ görünümlerini canlı demoda keşfedin.' : currentLang === 'de' ? 'Entdecken Sie Gast- und DJ-Ansichten in der Live-Demo, ohne sich zu registrieren.' : 'Discover Guest and DJ views in the live demo without registration.'}
                            </p>
                            <Link
                                to="/live-demo"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: '#fff',
                                    color: '#6366f1',
                                    textDecoration: 'none',
                                    padding: '16px 35px',
                                    borderRadius: '50px',
                                    fontWeight: '800',
                                    fontSize: '1rem',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                ⚡ {currentLang === 'tr' ? 'CANLI DEMOYA GİT' : currentLang === 'de' ? 'ZUR LIVE-DEMO' : 'GO TO LIVE DEMO'}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Share Buttons */}
                <ShareButtons
                    url={`${window.location.origin}/blog/${post.slug}`}
                    title={title}
                    lang={currentLang}
                />

                {/* Related Posts */}
                <RelatedPosts postId={post.id} lang={currentLang} />

                {/* Comments Section */}
                {post.comments_enabled !== false && (
                    <CommentSection postId={post.id} lang={currentLang} />
                )}

                {/* Back Button */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px', textAlign: 'center' }}>
                    <Link to="/blog" className="btn btn-outline" style={{ color: '#333', borderColor: '#ddd' }}>
                        ← {currentLang === 'tr' ? 'Tüm Yazılar' : currentLang === 'de' ? 'Alle Artikel' : 'All Posts'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
