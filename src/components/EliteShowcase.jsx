import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './EliteShowcase.css';

const EliteShowcase = () => {
    const { t, language } = useLanguage();
    const [eliteVendors, setEliteVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEliteVendors = async () => {
            try {
                // Fetch vendors that are explicitly marked as elite in their vip_demo_config
                // OR prioritized by performance scores
                // Query all Elite vendors - no category filter to show all elite partners
                const { data, error } = await supabase
                    .from('vendors')
                    .select('*')
                    .or('details.cs.{"vip_demo_config": {"is_elite": true}},is_featured.eq.true')
                    .order('ai_performance_score', { ascending: false })
                    .limit(8);

                if (error) throw error;

                // Filter to ensure they have at least some basic vip_demo_config or are featured
                // AND strictly enforce category is Wedding Venues (safeguard against query issues)
                // AND only show publicly visible venues
                const filteredData = data ? data.filter(v =>
                    (v.details?.vip_demo_config || v.is_featured) &&
                    v.category === 'Wedding Venues' &&
                    v.details?.vip_demo_config?.is_public_visible !== false
                ) : [];
                setEliteVendors(filteredData.slice(0, 4));
            } catch (err) {
                console.error('Error fetching elite vendors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEliteVendors();
    }, []);

    if (loading || eliteVendors.length === 0) return null;

    return (
        <section className="elite-showcase-section">
            <div className="container">
                <div className="elite-header" data-aos="fade-up">
                    <div className="elite-badge">KOLAYDUGUN ELITE PARTNER SEÇKİSİ</div>
                    <h2 className="elite-title">Hayalinizdeki Düğün İçin En Seçkin Mekanlar</h2>
                    <p className="elite-subtitle">Editörlerimiz tarafından onaylanmış, yüksek hizmet kalitesi ve eşsiz atmosfer sunan özel partnerlerimiz.</p>
                </div>

                <div className="elite-grid">
                    {eliteVendors.map((vendor, index) => (
                        <Link
                            to={`/vip-demo?venue=${encodeURIComponent(vendor.business_name)}&city=${encodeURIComponent(vendor.city || '')}`}
                            key={vendor.id}
                            className="elite-item"
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                        >
                            <div className="elite-image-wrapper">
                                <img
                                    src={vendor.details?.vip_demo_config?.hero_image || vendor.image_url || '/kemer_country_club_demo_hero.png'}
                                    alt={vendor.business_name}
                                    width="500"
                                    height="350"
                                    className="elite-image"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="elite-overlay">
                                    <div className="elite-info">
                                        <span className="elite-location"><span role="img" aria-hidden="true">📍</span> {vendor.city}</span>
                                        <h3 className="elite-name">{vendor.business_name}</h3>
                                        <div className="elite-stats">
                                            <span className="elite-rating"><span role="img" aria-hidden="true">⭐</span> {vendor.rating || '4.9'}</span>
                                            <span className="elite-type">VIP PARTNER</span>
                                        </div>
                                    </div>
                                    <button className="btn-elite-view">İncele</button>
                                </div>
                                <div className="elite-tag">ELITE</div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="elite-cta" data-aos="fade-up">
                    <Link to="/vendors" className="btn-all-elite">Tüm Seçkin Mekanları Gör</Link>
                </div>
            </div>
        </section>
    );
};

export default EliteShowcase;
