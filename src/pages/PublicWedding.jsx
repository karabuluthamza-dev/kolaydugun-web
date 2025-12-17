import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './PublicWedding.css';

const Countdown = ({ date }) => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const dateStr = date.includes('T') ? date : date + 'T12:00:00';
        const targetDate = new Date(dateStr);
        const difference = +targetDate - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
            return;
        }

        timerComponents.push(
            <div key={interval} className="countdown-item">
                <span className="countdown-value">{timeLeft[interval]}</span>
                <span className="countdown-label">{t(`weddingWebsite.countdown.${interval}`)}</span>
            </div>
        );
    });

    return (
        <div className="countdown-container">
            {timerComponents.length ? timerComponents : <span>{t('weddingWebsite.publicView.bigDayHere')}</span>}
        </div>
    );
};

const PublicWedding = () => {
    const params = useParams();
    const slug = params.slug || params.vendorSlug;
    const { t } = useLanguage();
    const [wedding, setWedding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // RSVP Form State
    const [rsvpData, setRsvpData] = useState({
        name: '',
        email: '',
        status: 'pending', // pending, confirmed, declined
        plus_ones: 0,
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchWeddingDetails();
    }, [slug]);

    const fetchWeddingDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('wedding_details')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setWedding(data);
        } catch (err) {
            console.error('Error fetching wedding:', err);
            setError('Wedding not found');
        } finally {
            setLoading(false);
        }
    };

    const handleRsvpChange = (e) => {
        const { name, value } = e.target;
        setRsvpData(prev => ({ ...prev, [name]: value }));
    };

    const handleRsvpSubmit = async (e) => {
        e.preventDefault();
        if (!rsvpData.status || rsvpData.status === 'pending') {
            alert(t('weddingWebsite.publicView.willYouAttend'));
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .rpc('submit_rsvp', {
                    p_slug: slug,
                    p_name: rsvpData.name,
                    p_email: rsvpData.email,
                    p_status: rsvpData.status,
                    p_plus_ones: parseInt(rsvpData.plus_ones) || 0,
                    p_message: rsvpData.message
                });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.error);

            setSubmitted(true);
        } catch (err) {
            console.error('RSVP Error:', err);
            alert('Error submitting RSVP: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <div className="public-error"><h1>404</h1><p>{error}</p></div>;
    if (!wedding) return null;

    return (
        <div className="wedding-card-wrapper" style={{ backgroundImage: `url(${wedding.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552'})` }}>
            <div className="wedding-overlay"></div>

            <div className="wedding-lang-switcher">
                <LanguageSwitcher />
            </div>

            <div className="wedding-card">
                {/* Header / Names */}
                <div className="card-header">
                    <h1 className="couple-names">{wedding.slug.replace('-', ' & ')}</h1>
                    <div className="wedding-date-display">
                        {wedding.wedding_date ? new Date(wedding.wedding_date.includes('T') ? wedding.wedding_date : wedding.wedding_date + 'T12:00:00').toLocaleDateString() : t('weddingWebsite.publicView.saveTheDate')}
                    </div>
                </div>

                {/* Main Image (Optional inside card, or just use header) */}
                {/* For this design, we might want a clean photo inside the card or just text. Let's keep it text-focused for the "invitation" look, or a small circle photo if available. */}

                {/* Countdown */}
                {wedding.wedding_date && (
                    <div className="card-section countdown-section-card">
                        <Countdown date={wedding.wedding_date} />
                    </div>
                )}

                <div className="card-divider">❧</div>

                {/* Welcome & Story */}
                {(wedding.welcome_message || wedding.our_story) && (
                    <div className="card-section text-center">
                        {wedding.welcome_message && <p className="welcome-text">{wedding.welcome_message}</p>}
                        {wedding.our_story && <p className="story-text">{wedding.our_story}</p>}
                    </div>
                )}

                {/* Venue */}
                {(wedding.venue_name || wedding.venue_address) && (
                    <div className="card-section venue-info">
                        <h3>{t('weddingWebsite.venueNameLabel')}</h3>
                        <p className="venue-name">{wedding.venue_name}</p>
                        <p className="venue-address">{wedding.venue_address}</p>
                        {wedding.venue_map_url && (
                            <a href={wedding.venue_map_url} target="_blank" rel="noopener noreferrer" className="map-link">
                                {t('weddingWebsite.venueMapLabel')}
                            </a>
                        )}
                    </div>
                )}

                {/* Gallery Button */}
                {wedding.gallery_url && (
                    <div className="card-section text-center">
                        <a
                            href={wedding.gallery_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gallery-btn"
                        >
                            {t('weddingWebsite.viewGalleryBtn')}
                        </a>
                    </div>
                )}

                <div className="card-divider">❧</div>

                {/* RSVP Form */}
                <div className="card-section rsvp-container">
                    <h3>{t('weddingWebsite.publicView.rsvpTitle')}</h3>

                    {submitted ? (
                        <div className="rsvp-success">
                            <div className="success-icon">✨</div>
                            <p>{t('weddingWebsite.publicView.success')}</p>
                            <p className="rsvp-status-text">{rsvpData.status === 'confirmed' ? t('weddingWebsite.publicView.yes') : t('weddingWebsite.publicView.no')}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleRsvpSubmit} className="rsvp-form-card">
                            <input
                                type="text"
                                name="name"
                                placeholder={t('contact.name')}
                                required
                                value={rsvpData.name}
                                onChange={handleRsvpChange}
                                className="card-input"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder={t('contact.email')}
                                required
                                value={rsvpData.email}
                                onChange={handleRsvpChange}
                                className="card-input"
                            />

                            <div className="rsvp-toggle">
                                <label className={`toggle-option ${rsvpData.status === 'confirmed' ? 'active' : ''}`}>
                                    <input type="radio" name="status" value="confirmed" onChange={handleRsvpChange} />
                                    {t('weddingWebsite.publicView.yes')}
                                </label>
                                <label className={`toggle-option ${rsvpData.status === 'declined' ? 'active' : ''}`}>
                                    <input type="radio" name="status" value="declined" onChange={handleRsvpChange} />
                                    {t('weddingWebsite.publicView.no')}
                                </label>
                            </div>

                            {rsvpData.status === 'confirmed' && (
                                <select
                                    name="plus_ones"
                                    value={rsvpData.plus_ones}
                                    onChange={handleRsvpChange}
                                    className="card-input"
                                >
                                    <option value="0">{t('weddingWebsite.publicView.guestCountOptions.justMe')}</option>
                                    <option value="1">{t('weddingWebsite.publicView.guestCountOptions.plusOne')}</option>
                                    <option value="2">{t('weddingWebsite.publicView.guestCountOptions.plusTwo')}</option>
                                    <option value="3">{t('weddingWebsite.publicView.guestCountOptions.plusThree')}</option>
                                    <option value="4">{t('weddingWebsite.publicView.guestCountOptions.plusFour')}</option>
                                </select>
                            )}

                            <textarea
                                name="message"
                                placeholder={t('weddingWebsite.publicView.message')}
                                value={rsvpData.message}
                                onChange={handleRsvpChange}
                                rows="2"
                                className="card-input"
                            />

                            <button type="submit" disabled={submitting} className="card-submit-btn">
                                {submitting ? '...' : t('weddingWebsite.publicView.submit')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div >
    );
};

export default PublicWedding;
