import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { dictionary } from '../locales/dictionary';
import { categoryImages, defaultImage } from '../constants/categoryImages';
import './CategoryGrid.css';

const CategoryGrid = () => {
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const categoryKeys = {
        'Wedding Venues': 'categories.wedding_venues',
        'Bridal Fashion': 'categories.bridal_fashion',
        'Hair & Make-Up': 'categories.hair_makeup',
        'Groom Suits': 'categories.groom_suits',
        'Wedding Cakes': 'categories.wedding_cakes',
        'Wedding Planners': 'categories.wedding_planners',
        'Wedding Cars': 'categories.wedding_cars',
        'Catering & Party Service': 'categories.catering_party',
        'Wedding Speakers (Trauredner)': 'categories.wedding_speakers',
        'Flowers & Decoration': 'categories.flowers_decoration',
        'Invitations & Stationery': 'categories.invitations_stationery',
        'Wedding Rings': 'categories.wedding_rings',
        'Wedding Photography': 'categories.wedding_photography',
        'Wedding Videography': 'categories.wedding_videography',
        'Photobox': 'categories.photobox',
        'DJs': 'categories.djs',
        'Musicians': 'categories.musicians',
        'Entertainment': 'categories.entertainment'
    };

    useEffect(() => {
        fetchCategoriesAndCounts();
    }, [i18n.language]); // Re-fetch/re-render when language changes

    const fetchCategoriesAndCounts = async () => {
        try {
            // 1. Fetch all categories
            const { data: cats, error: catError } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (catError) throw catError;

            // 2. Fetch vendor counts per category
            const { data: vendors, error: vendorError } = await supabase
                .from('vendors')
                .select('category')
                .is('deleted_at', null);

            if (vendorError) throw vendorError;

            // Count vendors per category
            const counts = {};
            if (vendors) {
                vendors.forEach(v => {
                    counts[v.category] = (counts[v.category] || 0) + 1;
                });
            }

            // Merge data
            const mappedCategories = cats.map(cat => {
                const cleanName = cat.name.trim();

                // Logic: 
                // 1. DB Image (Admin override)
                // 2. Local Map (Hardcoded defaults)
                // 3. Fallback logic (Partial matches)
                // 4. Default Image

                let image = cat.image_url; // 1. Try DB image first

                if (!image) {
                    image = categoryImages[cleanName]; // 2. Try local map
                }

                if (!image) {
                    // 3. Robust fallback for known issues
                    if (cleanName.includes('Flowers')) image = categoryImages['Flowers & Decoration'];
                    else if (cleanName.includes('Hair')) image = categoryImages['Hair & Make-Up'];
                    else if (cleanName.includes('Invitations')) image = categoryImages['Invitations & Stationery'];
                    else if (cleanName.includes('Cars') || cleanName.includes('Vehicle')) image = categoryImages['Wedding Cars'];
                    else if (cleanName.includes('Photo') && !cleanName.includes('Box')) image = categoryImages['Wedding Photography'];
                }

                if (!image) {
                    image = defaultImage; // 4. Final fallback
                }

                // Translation lookup
                const translationKey = categoryKeys[cleanName];
                const finalTitle = translationKey ? t(translationKey) : cleanName;

                return {
                    id: cat.id,
                    title: cat.name,
                    displayTitle: finalTitle,
                    count: `${counts[cat.name] || 0} Firma`,
                    image: image,
                    link: `/vendors?category=${encodeURIComponent(cat.name)}`
                };
            });

            setCategories(mappedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container section text-center">Yükleniyor...</div>;
    }

    return (
        <div className="category-grid-section">
            {/* Decorative left element */}
            <div style={{
                position: 'absolute',
                top: '120px',
                left: '3%',
                fontSize: '3rem',
                opacity: 0.12,
                animation: 'floatSlow 8s ease-in-out infinite reverse'
            }}>💍</div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="category-grid-header">
                    <h2>{t('vendorLanding.gridTitle')}</h2>
                    <p>{t('vendorLanding.gridDesc')}</p>
                </div>

                <div className="category-grid">
                    {categories.map(cat => (
                        <a href={cat.link} key={cat.id} className="category-card">
                            <div className="category-image">
                                <img
                                    src={cat.image}
                                    alt={cat.displayTitle}
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                                />
                            </div>
                            <div className="category-info">
                                <h3>{cat.displayTitle}</h3>
                                <span>{cat.count}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryGrid;
