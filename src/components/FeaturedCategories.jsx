import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './FeaturedCategories.css';

const FeaturedCategories = () => {
    const { t } = useLanguage();
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_featured', true)
                    .order('sort_order', { ascending: true });

                if (data) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Helper to find translation key based on English name
    const getTranslationKey = (dbName) => {
        const mapping = {
            'Wedding Venues': 'venue',
            'Wedding Photography': 'photo',
            'Bridal Fashion': 'dress',
            'Catering': 'catering',
            'Music': 'music',
            'Flowers & Decor': 'flowers',
            'Wedding Cake': 'cake',
            'Hair & Makeup': 'beauty',
            'Wedding Transport': 'transport',
            'Invitations': 'invitation',
            'Photobox': 'photobox',
            'Dance': 'dance',
            'Decoration': 'decoration',
            'Jewelry': 'jewelry',
            'Entertainment': 'entertainment',
            // New mappings matching DB names exactly
            'Wedding Planners': 'planners',
            'Wedding Cars': 'cars',
            'Wedding Rings': 'rings',
            'DJs': 'dj',
            'Musicians': 'musicians',
            'Catering & Party Service': 'catering_party',
            'Hair & Make-Up': 'hair_makeup',
            'Invitations & Stationery': 'invitations',
            'Flowers & Decoration': 'flowers_decor',
            'Wedding Cakes': 'cake',
            'Wedding Speakers (Trauredner)': 'speakers',
            'Groom Suits': 'groom',
            'Wedding Videography': 'video'
        };
        return mapping[dbName] || dbName.toLowerCase().replace(/\s+/g, '_');
    };

    if (loading) {
        return <div className="section container text-center">Loading categories...</div>;
    }

    return (
        <section className="section container featured-categories">
            <h2 className="section-title" data-aos="fade-up">{t('featured.title') || 'Beliebte Kategorien'}</h2>
            <div className="categories-grid">
                {categories.map((cat, index) => {
                    const translationKey = getTranslationKey(cat.name);
                    // Try to translate, fallback to DB name
                    const translatedName = t(`featured.${translationKey}`) !== `featured.${translationKey}`
                        ? t(`featured.${translationKey}`)
                        : cat.name;

                    return (
                        <Link
                            to={`/vendors?category=${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                            key={cat.id}
                            className="category-card"
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                        >
                            <div className="category-image-wrapper">
                                {cat.image_url ? (
                                    <img
                                        src={cat.image_url}
                                        alt={translatedName}
                                    />
                                ) : (
                                    <span className="category-icon">{cat.icon}</span>
                                )}
                            </div>
                            <h3 className="category-name">
                                {cat.icon && cat.image_url && <span style={{ marginRight: '8px' }}>{cat.icon}</span>}
                                {translatedName}
                            </h3>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default FeaturedCategories;
