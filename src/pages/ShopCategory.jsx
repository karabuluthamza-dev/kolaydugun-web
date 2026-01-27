import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import { generateShopBreadcrumb } from '../utils/breadcrumbSchema';
import { slugify } from '../utils/text';
import './Shop.css';

const ShopCategory = () => {
    const { slug } = useParams();
    const { t, language } = useLanguage();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchCategoryData();
        }
    }, [slug]);

    const fetchCategoryData = async () => {
        try {
            // Fetch category
            const { data: categoryData, error: catError } = await supabase
                .from('shop_categories')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (catError) throw catError;
            setCategory(categoryData);

            // Fetch products in this category WITH shop priority info
            // Fetch products in this category WITH shop priority info
            // Covers both Vendor Products (main_shop_category_id) AND Amazon Products (category_id)
            const { data: productsData, error: prodError } = await supabase
                .from('shop_products')
                .select(`
                    *,
                    shop:shop_accounts(
                        id, business_name, is_featured, priority_order,
                        plan:shop_plans(name, has_vip_badge, has_priority_listing)
                    )
                `)
                .eq('status', 'approved')
                .or(`main_shop_category_id.eq.${categoryData.id},category_id.eq.${categoryData.id}`);

            if (prodError) throw prodError;

            // Filter relevant products
            const filteredData = (productsData || []).filter(p => {
                // Amazon products: already checked status='approved'
                if (p.product_type === 'amazon') return true;

                // Vendor products: need main_shop_request_status='approved'
                return p.main_shop_request_status === 'approved';
            });

            // Sort: Featured first, then by priority_order, then by display_order
            const sortedProducts = (filteredData || []).sort((a, b) => {
                // Featured shops first
                const aFeatured = a.shop?.is_featured ? 1 : 0;
                const bFeatured = b.shop?.is_featured ? 1 : 0;
                if (bFeatured !== aFeatured) return bFeatured - aFeatured;

                // Then by priority order (higher first)
                const aPriority = a.shop?.priority_order || 0;
                const bPriority = b.shop?.priority_order || 0;
                if (bPriority !== aPriority) return bPriority - aPriority;

                // Then by display order
                return (a.display_order || 0) - (b.display_order || 0);
            });

            setProducts(sortedProducts);
        } catch (error) {
            console.error('Error fetching category data:', error);
        } finally {
            setLoading(false);
        }
    };

    const trackClick = async (productId, clickType) => {
        try {
            await supabase.from('shop_clicks').insert({
                product_id: productId,
                click_type: clickType,
                referrer_page: window.location.pathname
            });
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    };

    const navigate = useNavigate();

    const handleProductClick = (product) => {
        trackClick(product.id, 'button');

        // Check for AI-generated short slug in current language tags
        let slug = '';
        const currentTags = product[`tags_${language}`];

        if (currentTags) {
            const slugTag = currentTags.split(',').find(t => t.trim().startsWith('slug:'));
            if (slugTag) {
                slug = slugTag.split(':')[1].trim();
            }
        }

        // Fallback to name-based slug if no AI slug
        if (!slug) {
            const productName = product[`name_${language}`] || product.name_tr;
            slug = slugify(productName);
        }

        navigate(`/shop/urun/${slug}-${product.id}`);
    };

    const handleShare = async (product, platform) => {
        trackClick(product.id, 'share');
        const url = `${window.location.origin}/shop/${slug}#${product.id}`;
        const text = product[`name_${language}`] || product.name_tr;

        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        } else if (platform === 'copy') {
            await navigator.clipboard.writeText(url);
            alert(t('shop.linkCopied', 'Link kopyalandı!'));
        }
    };

    if (loading) {
        return (
            <div className="shop-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="shop-page">
                <div className="container">
                    <div className="empty-state">
                        <h2>Kategori bulunamadı</h2>
                        <Link to="/shop" className="btn-primary">Mağazaya Dön</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-page shop-category-page">
            <SEO
                title={`${category[`name_${language}`] || category.name_tr} - ${t('shop.title', 'Mağaza')}`}
                description={category[`description_${language}`] || category.description_tr}
                structuredData={generateShopBreadcrumb(
                    category[`name_${language}`] || category.name_tr,
                    slug
                )}
            />

            {/* Hero with category info */}
            <div className="category-hero" style={{ backgroundImage: category.image_url ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${category.image_url})` : '' }}>
                <div className="container">
                    <nav className="breadcrumb">
                        <Link to="/shop">{t('shop.title', 'Mağaza')}</Link>
                        <span>/</span>
                        <span>{category[`name_${language}`] || category.name_tr}</span>
                    </nav>
                    <h1>{category.icon} {category[`name_${language}`] || category.name_tr}</h1>
                    <span className="product-count-hero">{products.length} {t('shop.productCount', 'ürün')}</span>
                </div>
            </div>

            <div className="container">
                <section className="shop-section">
                    {products.length === 0 ? (
                        <div className="empty-state">
                            <p>{t('shop.noProducts', 'Bu kategoride henüz ürün yok')}</p>
                            <Link to="/shop" className="btn-primary">Diğer Kategoriler</Link>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map(product => {
                                // Determine contact options
                                const hasWhatsApp = product.whatsapp_number;
                                const hasPhone = product.contact_phone;
                                const hasEmail = product.contact_email;
                                const hasExternalUrl = product.external_url;
                                const hasAnyContact = hasWhatsApp || hasPhone || hasEmail || hasExternalUrl;

                                const formatWhatsApp = (number) => {
                                    if (!number) return null;
                                    return number.replace(/\s/g, '').replace(/^00/, '+');
                                };

                                const handleWhatsAppClick = () => {
                                    trackClick(product.id, 'button');
                                    const phone = formatWhatsApp(product.whatsapp_number);
                                    const productTitle = product[`name_${language}`] || product.name_tr || '';
                                    const message = language === 'de'
                                        ? `Hallo, ich interessiere mich für: ${productTitle}`
                                        : language === 'en'
                                            ? `Hello, I'm interested in: ${productTitle}`
                                            : `Merhaba, ${productTitle} ürününüz hakkında bilgi almak istiyorum.`;
                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                };

                                const handleExternalClick = () => {
                                    trackClick(product.id, 'button');
                                    window.open(product.external_url, '_blank');
                                };

                                const handlePhoneClick = () => {
                                    trackClick(product.id, 'button');
                                    window.open(`tel:${product.contact_phone}`, '_self');
                                };

                                const handleEmailClick = () => {
                                    trackClick(product.id, 'button');
                                    const subject = encodeURIComponent(product[`name_${language}`] || product.name_tr || 'Product Inquiry');
                                    window.open(`mailto:${product.contact_email}?subject=${subject}`, '_blank');
                                };

                                return (
                                    <div key={product.id} className="product-card" id={product.id}>
                                        {(product.images?.[0] || product.image_url) && (
                                            <div className="product-image">
                                                <img src={product.images?.[0] || product.image_url} alt={product[`name_${language}`] || product.name_tr || ''} />
                                                {/* VIP Badge */}
                                                {product.shop?.plan?.has_vip_badge && (
                                                    <span className="vip-badge">⭐ VIP</span>
                                                )}
                                                {/* Featured Badge */}
                                                {product.shop?.is_featured && (
                                                    <span className="featured-badge">✨ {language === 'de' ? 'Empfohlen' : language === 'en' ? 'Featured' : 'Öne Çıkan'}</span>
                                                )}
                                                {product.product_type === 'boutique' && (
                                                    <span className="type-badge boutique">👔 Boutique</span>
                                                )}
                                                {product.product_type === 'amazon' && (
                                                    <span className="type-badge amazon">📦 Amazon</span>
                                                )}
                                                {product.shop && (
                                                    <span className="type-badge vendor">🏪 {product.shop.business_name}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="product-content">
                                            <h3>{product[`name_${language}`] || product.name_tr || 'Ürün'}</h3>
                                            <p className="product-description">
                                                {product[`description_${language}`] || product.description_tr || ''}
                                            </p>

                                            {/* Price Display */}
                                            {product.price && !product.price_on_request ? (
                                                <div className="product-price">
                                                    {product.price} {product.currency || '€'}
                                                </div>
                                            ) : (
                                                <div className="product-price price-request">
                                                    {language === 'de' ? 'Preis auf Anfrage' :
                                                        language === 'en' ? 'Price on request' :
                                                            'Fiyat için iletişime geçin'}
                                                </div>
                                            )}

                                            {/* Contact Buttons */}
                                            <div className="contact-buttons">
                                                {hasWhatsApp && (
                                                    <button className="product-button whatsapp" onClick={handleWhatsAppClick}>
                                                        💬 WhatsApp
                                                    </button>
                                                )}
                                                {hasExternalUrl && product.product_type !== 'amazon' && (
                                                    <button className="product-button external" onClick={handleExternalClick}>
                                                        🔗 {language === 'de' ? 'Website' : language === 'en' ? 'Website' : 'Mağazaya Git'}
                                                    </button>
                                                )}
                                                {hasPhone && !hasWhatsApp && (
                                                    <button className="product-button phone" onClick={handlePhoneClick}>
                                                        📞 {language === 'de' ? 'Anrufen' : language === 'en' ? 'Call' : 'Ara'}
                                                    </button>
                                                )}
                                                {hasEmail && !hasWhatsApp && !hasPhone && (
                                                    <button className="product-button email" onClick={handleEmailClick}>
                                                        📧 E-posta
                                                    </button>
                                                )}
                                                {product.product_type === 'amazon' && (
                                                    <button className="product-button amazon" onClick={() => handleProductClick(product)}>
                                                        📦 {t('shop.viewDetails', 'İncele')}
                                                    </button>
                                                )}
                                                {product.product_type === 'boutique' && !hasAnyContact && (
                                                    <button className="product-button boutique" onClick={() => handleProductClick(product)}>
                                                        {language === 'de' ? 'Kontakt' : language === 'en' ? 'Contact' : 'İletişime Geç'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Secondary contacts */}
                                            {hasAnyContact && (hasPhone || hasEmail) && hasWhatsApp && (
                                                <div className="secondary-contacts">
                                                    {hasPhone && (
                                                        <button onClick={handlePhoneClick} title={language === 'de' ? 'Anrufen' : language === 'en' ? 'Call' : 'Ara'}>
                                                            📞
                                                        </button>
                                                    )}
                                                    {hasEmail && (
                                                        <button onClick={handleEmailClick} title={language === 'de' ? 'E-Mail' : language === 'en' ? 'Email' : 'E-posta'}>
                                                            📧
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="share-buttons">
                                                <button onClick={() => handleShare(product, 'facebook')} title="Facebook">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleShare(product, 'whatsapp')} title="WhatsApp">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleShare(product, 'copy')} title={t('shop.copyLink', 'Linki Kopyala')}>
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Contact Modal */}
            {showContactModal && selectedProduct && (
                <ContactModal
                    product={selectedProduct}
                    language={language}
                    t={t}
                    onClose={() => {
                        setShowContactModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
};

// Contact Modal Component (same as in Shop.jsx)
const ContactModal = ({ product, language, t, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase.from('shop_inquiries').insert({
                product_id: product.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                message: formData.message || null,
                status: 'new'
            });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert(t('shop.contactModal.error', 'Mesaj gönderilirken hata oluştu'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('shop.contactModal.title', 'Ürün Hakkında İletişim')}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {success ? (
                    <div className="success-message">
                        <span>✅</span>
                        <p>{t('shop.contactModal.success', 'Mesajınız başarıyla gönderildi!')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="product-preview">
                            {(product.images?.[0] || product.image_url) && <img src={product.images?.[0] || product.image_url} alt="" />}
                            <span>{product[`name_${language}`] || product.name_tr}</span>
                        </div>

                        <div className="form-group">
                            <label>{t('shop.contactModal.nameLabel', 'Adınız')} *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('shop.contactModal.emailLabel', 'E-posta')} *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('shop.contactModal.phoneLabel', 'Telefon (opsiyonel)')}</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('shop.contactModal.messageLabel', 'Mesajınız')}</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={4}
                                placeholder={t('shop.contactModal.messagePlaceholder', 'Bu ürünle ilgileniyorum...')}
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                {t('common.cancel', 'İptal')}
                            </button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? '...' : t('shop.contactModal.submit', 'Mesaj Gönder')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ShopCategory;
