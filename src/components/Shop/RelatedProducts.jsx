import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProductId, categoryId, limit = 4 }) => {
    const { language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentProductId) {
            fetchRelatedProducts();
        }
    }, [currentProductId, categoryId]);

    const fetchRelatedProducts = async () => {
        setLoading(true);

        let query = supabase
            .from('shop_products')
            .select('id, name_tr, name_de, name_en, price, images, affiliate_url, amazon_asin')
            .eq('is_active', true)
            .eq('product_type', 'amazon')
            .neq('id', currentProductId)
            .limit(limit);

        // If category exists, prefer same category products
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query.order('click_count', { ascending: false });

        if (!error && data) {
            setProducts(data);
        }

        setLoading(false);
    };

    const getProductName = (product) => {
        return product[`name_${language}`] || product.name_tr || product.name_de || product.name_en || 'Amazon Ürünü';
    };

    const getImageUrl = (product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return '/placeholder-product.png';
    };

    const trackClick = async (productId) => {
        try {
            await supabase.rpc('track_product_click', {
                p_product_id: productId,
                p_source: 'related'
            });
        } catch (err) {
            console.error('Click tracking error:', err);
        }
    };

    if (loading) {
        return null;
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="related-products">
            <h3 className="related-title">
                {language === 'tr' ? '🛍️ Bunlar da ilgini çekebilir' :
                    language === 'de' ? '🛍️ Das könnte Sie auch interessieren' :
                        '🛍️ You might also like'}
            </h3>
            <div className="related-grid">
                {products.map(product => (
                    <a
                        key={product.id}
                        href={product.affiliate_url || `https://www.amazon.de/dp/${product.amazon_asin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="related-card"
                        onClick={() => trackClick(product.id)}
                    >
                        <div className="related-image">
                            <img src={getImageUrl(product)} alt={getProductName(product)} />
                        </div>
                        <div className="related-info">
                            <span className="related-name">{getProductName(product)}</span>
                            {product.price && (
                                <span className="related-price">€{product.price.toFixed(2)}</span>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
