import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { dictionary } from '../locales/dictionary';
import { getCategoryTranslationKey } from '../constants/vendorData';
import { categoryImages, defaultImage } from '../constants/categoryImages';
import { supabase } from '../supabaseClient';
import { formatDistance } from '../utils/geoUtils';
import './VendorCard.css';

const VendorCard = ({ id, name, slug, category, location, price, image, rating, reviews, isFeatured, gallery, categoryImage, distance }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Use main image, or fallback to first gallery image, or DB category image, or category default constant, or generic default
    const categoryDefault = categoryImage || categoryImages[category] || defaultImage;
    const validImage = image || (gallery && gallery.length > 0 ? gallery[0] : categoryDefault);
    const [currentImage, setCurrentImage] = useState(validImage);
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
            className="vendor-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="vendor-card-image-wrapper">
                <img src={currentImage} alt={name} className="vendor-card-image" />
                {isFeatured && (
                    <span className="vendor-card-badge featured">
                        {t('vendorDetail.featured') || 'Öne Çıkan'}
                    </span>
                )}
                {rating >= 4.8 && (
                    <span className="vendor-card-badge top-rated">
                        {t('vendorDetail.topRated') || 'En İyiler'}
                    </span>
                )}
                <button
                    className={`vendor-card-favorite ${isFavorite ? 'active' : ''}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Save vendor"}
                    onClick={toggleFavorite}
                    disabled={favLoading}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>

                {/* Admin Shortcut */}
                {user?.role === 'admin' && (
                    <Link to="/admin/vendors" className="admin-manage-btn" style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: 'auto' }}>
                        ⚙️ Yönet
                    </Link>
                )}
            </div>

            <div className="vendor-card-content">
                <div className="vendor-card-header">
                    <span className="vendor-card-category">{displayCategory}</span>
                    <div className="vendor-card-rating">
                        <span className="star">⭐</span>
                        <span className="score">{rating}</span>
                        {reviews > 0 && <span className="reviews">({reviews})</span>}
                    </div>
                </div>

                <h3 className="vendor-card-title">
                    <Link to={`/vendors/${slug || id}`}>{name}</Link>
                </h3>

                <div className="vendor-card-location">
                    <span className="icon">📍</span>
                    {location}
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
        </div>
    );
};

export default VendorCard;
