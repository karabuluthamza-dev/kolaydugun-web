import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { categoryImages, defaultImage } from '../../constants/categoryImages';
import { getCategoryTranslationKey } from '../../constants/vendorData';
import { Eye, Trash2 } from 'lucide-react';

const FavoritesList = ({ userId }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchFavorites();
        }
    }, [userId]);

    const fetchFavorites = async () => {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select(`
                    id,
                    vendor:vendors!inner (
                        id,
                        business_name,
                        slug,
                        category,
                        city,
                        rating,
                        image_url,
                        gallery,
                        deleted_at
                    )
                `)
                .eq('user_id', userId)
                .is('vendor.deleted_at', null);

            if (error) throw error;
            setFavorites(data || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (id) => {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setFavorites(favorites.filter(fav => fav.id !== id));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (loading) return <div>{t('login.loading')}</div>;

    return (
        <div className="favorites-container">
            <h2>❤️ Favorilerim</h2>
            {favorites.length === 0 ? (
                <div className="empty-state">
                    <p>Henüz favori satıcınız yok.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/vendors')}>
                        Satıcıları Keşfet
                    </button>
                </div>
            ) : (
                <div className="favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {favorites.map(fav => {
                        const vendor = fav.vendor;
                        const categoryDefault = categoryImages[vendor.category] || defaultImage;
                        const imageUrl = vendor.image_url || (vendor.gallery && vendor.gallery[0]) || categoryDefault;

                        return (
                            <div
                                key={fav.id}
                                className="favorite-card"
                                onClick={() => navigate(`/vendors/${vendor.slug || vendor.id}`)}
                                style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}
                            >
                                <div className="fav-image" style={{ height: '150px', background: '#f0f0f0', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                <div className="fav-content" style={{ padding: '15px' }}>
                                    <h3>{vendor.business_name}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                        {t('categories.' + getCategoryTranslationKey(vendor.category))} • {vendor.city}
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <button
                                            className="btn-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/vendors/${vendor.slug || vendor.id}`);
                                            }}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                backgroundColor: '#fff',
                                                border: '1px solid #ddd',
                                                color: '#333',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontSize: '0.9rem'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                        >
                                            <Eye size={16} />
                                            {t('common.view') || 'Görüntüle'}
                                        </button>
                                        <button
                                            className="btn-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFavorite(fav.id);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#fff0f0',
                                                border: '1px solid #ffcccc',
                                                color: '#d32f2f',
                                                padding: '8px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe0e0'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff0f0'}
                                            title={t('common.delete') || 'Sil'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FavoritesList;
