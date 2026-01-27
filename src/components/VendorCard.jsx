import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { dictionary } from '../locales/dictionary';
import { getCategoryTranslationKey, getStateName } from '../constants/vendorData';
import { categoryImages, defaultImage } from '../constants/categoryImages';
import { supabase } from '../supabaseClient';
import { formatDistance } from '../utils/geoUtils';
import './VendorCard.css';

const VendorCard = ({ id, name, slug, category, location, city, zip_code, state, country, price, image, rating, reviews, isFeatured, gallery, categoryImage, distance, ai_performance_score, is_claimed, is_verified, user_id, details }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Improved Category Normalization
    const getNormalizedCategoryKey = (cat) => {
        const key = getCategoryTranslationKey(cat);
        // Map snake_case keys back to Title Case keys used in categoryImages
        const keyMap = {
            'wedding_venues': 'Wedding Venues',
            'bridal_fashion': 'Bridal Fashion',
            'hair_makeup': 'Hair & Make-Up',
            'groom_suits': 'Groom Suits',
            'wedding_cakes': 'Wedding Cakes',
            'wedding_planners': 'Wedding Planners',
            'wedding_cars': 'Wedding Cars',
            'catering_party': 'Catering & Party Service',
            'wedding_speakers': 'Wedding Speakers (Trauredner)',
            'flowers_decoration': 'Flowers & Decoration',
            'invitations_stationery': 'Invitations & Stationery',
            'wedding_rings': 'Wedding Rings',
            'wedding_photography': 'Wedding Photography',
            'wedding_videography': 'Wedding Videography',
            'photobox': 'Photobox',
            'djs': 'DJs',
            'musicians': 'Musicians',
            'entertainment': 'Entertainment'
        };
        return keyMap[key] || cat; // Fallback to original if no map found
    };

    const normalizedCat = getNormalizedCategoryKey(category);
    // categoryImage prop takes precedence, then normalized default, then raw category default, then global default
    const categoryDefault = categoryImage || categoryImages[normalizedCat] || categoryImages[category] || defaultImage;

    const getValidImage = () => {
        // stricter check for valid image URL
        if (image && typeof image === 'string' && image.length > 5 && image !== 'null' && image !== 'undefined' && !image.includes('undefined') && !image.includes('null')) {
            return image;
        }
        if (Array.isArray(gallery) && gallery.length > 0 && gallery[0]) return gallery[0];
        return categoryDefault;
    };

    const validImage = getValidImage();
    const [currentImage, setCurrentImage] = useState(validImage);
    const [imageError, setImageError] = useState(false);

    // Sync state with props - CRITICAL for when data updates after mount
    useEffect(() => {
        setCurrentImage(getValidImage());
        setImageError(false);
    }, [image, category, categoryImage, gallery]);

    // If constructed URL fails, fallback to category default
    const handleImageError = (e) => {
        if (!imageError) {
            console.warn(`Image load failed for ${name}, falling back to default.`);
            e.target.onerror = null; // Prevent infinite loop
            if (e.target.src !== categoryDefault) {
                e.target.src = categoryDefault;
                setCurrentImage(categoryDefault);
                setImageError(true);
            }
        }
    };
    const [isHovered, setIsHovered] = useState(false);

    // Favorites state
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    // Manual translation fallback
    const translationKey = getCategoryTranslationKey(category);
    const manualTranslation = dictionary[translationKey]?.[language];
    const displayCategory = manualTranslation || t(`categories.${translationKey}`);

    useEffect(() => {
        if (user && user.role === 'couple') {
            checkFavoriteStatus();
        }
    }, [user, id]);

    const checkFavoriteStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user.id)
                .eq('vendor_id', id)
                .maybeSingle();

            if (data) {
                setIsFavorite(true);
            }
        } catch (error) {
            // Ignore error if not found (it just means not favorite)
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault(); // Prevent navigation if inside a Link
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'couple') {
            alert(language === 'tr' ? 'Sadece çiftler favori ekleyebilir.' : 'Only couples can save vendors.');
            return;
        }

        setFavLoading(true);

        try {
            if (isFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('vendor_id', id);

                if (error) throw error;
                setIsFavorite(false);
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from('favorites')
                    .insert([
                        { user_id: user.id, vendor_id: id }
                    ]);

                if (error) throw error;
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert(language === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.');
        } finally {
            setFavLoading(false);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCurrentImage(validImage);
    };

    // Simple gallery preview on hover (cycling)
    useEffect(() => {
        let interval;
        if (isHovered && gallery && gallery.length > 0) {
            // Filter out null/empty images
            const potentialImages = [image, ...gallery].filter(img => img);

            if (potentialImages.length > 1) {
                let index = 0;
                // Find current index
                const currentIndex = potentialImages.indexOf(currentImage);
                if (currentIndex !== -1) index = currentIndex;

                interval = setInterval(() => {
                    index = (index + 1) % potentialImages.length;
                    setCurrentImage(potentialImages[index]);
                }, 1500);
            }
        }
        return () => clearInterval(interval);
    }, [isHovered, gallery, image, currentImage]);

    return (
        <div
            className={`vendor-card ${details?.vip_demo_config?.is_elite ? 'is-elite-card' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="vendor-card-image-wrapper">
                <img
                    src={currentImage}
                    alt={name}
                    className="vendor-card-image"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="250"
                    onError={handleImageError}
                />
                {isFeatured === true && (
                    <span className="vendor-card-badge featured">
                        {t('vendorDetail.featured') || 'Öne Çıkan'}
                    </span>
                )}
                {typeof rating === 'number' && rating >= 4.8 && (
                    <span className="vendor-card-badge top-rated">
                        {t('vendorDetail.topRated') || 'En İyiler'}
                    </span>
                )}
                {typeof ai_performance_score === 'number' && ai_performance_score >= 90 && (
                    <span className="vendor-card-badge perfect-service" style={{
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span role="img" aria-hidden="true">🏆</span> {t('vendorCard.perfectService', 'Mükemmel Hizmet')}
                    </span>
                )}
                <button
                    className={`vendor-card-favorite ${isFavorite ? 'active' : ''}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Save vendor"}
                    onClick={toggleFavorite}
                    disabled={favLoading}
                >
                    {isFavorite ? <span role="img" aria-hidden="true">❤️</span> : <span role="img" aria-hidden="true">🤍</span>}
                </button>

                {/* Admin Shortcut */}
                {user?.role === 'admin' && (
                    <Link to="/admin/vendors" className="admin-manage-btn" style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: 'auto' }}>
                        <span role="img" aria-hidden="true">⚙️</span> Yönet
                    </Link>
                )}

                {/* Verified Badge for Claimed Profiles */}
                {(is_claimed === true || is_verified === true) && (
                    <span className="vendor-card-badge claimed-badge" style={{
                        position: 'absolute',
                        background: '#15803d', /* Dark green for accessibility */
                        color: 'white',
                        top: '10px',
                        left: '10px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                        zIndex: 5
                    }}>
                        <span role="img" aria-hidden="true">✓</span> {t('common.claimed') || 'Doğrulanmış'}
                    </span>
                )}

                {/* Elite Badge */}
                {details?.vip_demo_config?.is_elite === true && (
                    <span className="vendor-card-badge elite-badge-premium" style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'linear-gradient(45deg, #FFD700, #B8860B)',
                        color: 'black', /* High contrast black text on gold */
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 2px 10px rgba(184, 134, 11, 0.5)',
                        zIndex: 5,
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                        <span role="img" aria-hidden="true">💎</span> ELITE
                    </span>
                )}
            </div>

            <div className="vendor-card-content">
                <div className="vendor-card-header">
                    <span className="vendor-card-category">{displayCategory}</span>
                    <div className="vendor-card-rating">
                        <span className="star" role="img" aria-hidden="true">⭐</span>
                        <span className="score">{rating}</span>
                        {reviews > 0 && <span className="reviews">({reviews})</span>}
                    </div>
                </div>

                <h3 className="vendor-card-title">
                    <Link to={`/vendors/${slug || id}`}>{name}</Link>
                </h3>

                <div className="vendor-card-location">
                    <span className="icon" role="img" aria-hidden="true">📍</span>
                    {zip_code && <span className="zip-code" style={{ marginRight: '4px', fontWeight: 'bold' }}>{zip_code}</span>}
                    {location || city} {state && <span className="state-name" style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.85em' }}>• {getStateName(state, country, language)}</span>}
                </div>
                {distance !== null && distance !== undefined && (
                    <span className="distance-badge" style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>
                        {formatDistance(distance)} uzakta
                    </span>
                )}
            </div>

            <div className="vendor-card-footer">
                <div className="vendor-card-price">
                    {price}
                </div>
                <Link to={`/vendors/${slug || id}`} className="vendor-card-cta">
                    {t('vendorDetail.requestQuote') || 'Teklif Al'}
                </Link>
            </div>
        </div>
    );
};

export default VendorCard;
