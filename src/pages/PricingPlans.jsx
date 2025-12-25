import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './PricingPlans.css';

const PricingPlans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

    const translations = {
        tr: {
            title: 'İşletmeniz İçin En Uygun Paketi Seçin',
            subtitle: 'İşinizi büyütmek ve daha fazla çifte ulaşmak için size en uygun planı seçin.',
            free: 'Ücretsiz',
            premium: 'Premium',
            month: '/ay',
            year: '/yıl',
            popular: 'EN POPÜLER',
            currentPlan: 'Mevcut Plan',
            upgrade: 'Premium\'a Yükselt',
            getStarted: 'Hemen Başla',
            monthly: 'Aylık',
            annual: 'Yıllık',
            save: '2 AY HEDİYE',
            features: {
                verified_badge: 'Onaylı Rozeti',
                top_placement: 'Üst Sıralarda Gösterim',
                social_links: 'Sosyal Medya Linkleri',
                map_view: 'Harita Görünümü',
                monthly_free_credits: 'Aylık Hediye Kredi',
                messaging: 'Müşterilerle Mesajlaşma',
                live_requests: 'Canlı İstek Paneli'
            },
            credit_info: '(Her ay 4 müşteri iletişimi)',
            faq: {
                title: 'Sıkça Sorulan Sorular',
                q1: 'İstediğim zaman paket değiştirebilir miyim?',
                a1: 'Evet! İstediğiniz zaman panelinizden paketinizi yükseltebilir veya düşürebilirsiniz.',
                q2: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
                a2: 'Güvenli ve kolay ödeme için PayPal kullanıyoruz.',
                q3: 'Ücretsiz deneme var mı?',
                a3: 'Ücretsiz paketimiz sonsuza kadar ücretsizdir, kredi kartı gerektirmez.',
                q4: 'İstediğim zaman iptal edebilir miyim?',
                a4: 'Evet, aboneliğinizi istediğiniz zaman ceza ödemeden iptal edebilirsiniz.'
            }
        },
        en: {
            title: 'Choose the Perfect Plan for Your Business',
            subtitle: 'Select the best plan to grow your business and reach more couples.',
            free: 'Free',
            premium: 'Premium',
            month: '/mo',
            year: '/yr',
            popular: 'MOST POPULAR',
            currentPlan: 'Current Plan',
            upgrade: 'Upgrade to Premium',
            getStarted: 'Get Started',
            monthly: 'Monthly',
            annual: 'Annual',
            save: 'SAVE 2 MONTHS',
            features: {
                verified_badge: 'Verified Badge',
                top_placement: 'Top Placement',
                social_links: 'Social Media Links',
                map_view: 'Map View',
                monthly_free_credits: 'Monthly Free Credits',
                messaging: 'Messaging with Customers',
                live_requests: 'Live Request Panel'
            },
            credit_info: '(4 customer contacts/mo)',
            faq: {
                title: 'Frequently Asked Questions',
                q1: 'Can I upgrade or downgrade anytime?',
                a1: 'Yes! You can change your plan at any time from your dashboard.',
                q2: 'What payment methods do you accept?',
                a2: 'We accept PayPal for secure and easy payments.',
                q3: 'Is there a free trial?',
                a3: 'The FREE plan is available forever with no credit card required.',
                q4: 'Can I cancel anytime?',
                a4: 'Yes, you can cancel your subscription at any time with no penalties.'
            }
        },
        de: {
            title: 'Wählen Sie das perfekte Paket für Ihr Unternehmen',
            subtitle: 'Wählen Sie den besten Plan, um Ihr Geschäft auszubauen und mehr Paare zu erreichen.',
            free: 'Kostenlos',
            premium: 'Premium',
            month: '/Monat',
            year: '/Jahr',
            popular: 'BELIEBTESTE',
            currentPlan: 'Aktueller Plan',
            upgrade: 'Auf Premium upgraden',
            getStarted: 'Jetzt starten',
            monthly: 'Monatlich',
            annual: 'Jährlich',
            save: '2 MONATE GESCHENKT',
            features: {
                verified_badge: 'Verifiziertes Abzeichen',
                top_placement: 'Top-Platzierung',
                social_links: 'Social Media Links',
                map_view: 'Kartenansicht',
                monthly_free_credits: 'Monatliche Gratis-Credits',
                messaging: 'Nachrichten an Kunden',
                live_requests: 'Live-Wunsch-Panel'
            },
            credit_info: '(4 Kundenkontakte/Monat)',
            faq: {
                title: 'Häufig gestellte Fragen',
                q1: 'Kann ich jederzeit upgraden oder downgraden?',
                a1: 'Ja! Sie können Ihren Plan jederzeit über Ihr Dashboard ändern.',
                q2: 'Welche Zahlungsmethoden akzeptieren Sie?',
                a2: 'Wir akzeptieren PayPal für sichere und einfache Zahlungen.',
                q3: 'Gibt es eine kostenlose Testversion?',
                a3: 'Der KOSTENLOSE Plan ist für immer kostenlos, keine Kreditkarte erforderlich.',
                q4: 'Kann ich jederzeit kündigen?',
                a4: 'Ja, Sie können Ihr Abonnement jederzeit ohne Strafen kündigen.'
            }
        }
    };

    const currentLang = translations[language] || translations.tr;

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            // Check visibility config first
            const { data: configData } = await supabase
                .from('marketplace_config')
                .select('value')
                .eq('key', 'show_pricing_plans')
                .single();

            console.log('Pricing Config:', configData);

            // Robust check: handle "true", true, "false", false
            let showPlans = true; // Default to true if missing? No, let's default to false for safety if we want beta.
            // Actually, default was true in migration.

            if (configData) {
                const val = configData.value;
                if (val === 'true' || val === true) showPlans = true;
                else if (val === 'false' || val === false) showPlans = false;
                else showPlans = Boolean(val); // Fallback
            } else {
                showPlans = true; // Default if config missing
            }

            if (!showPlans) {
                setPlans([]); // Empty plans triggers "Beta" view
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('price_monthly', { ascending: true });

            if (data) {
                setPlans(data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        const planType = plan.name.toLowerCase() === 'premium' ? 'premium' : 'free';

        if (user) {
            if (planType === 'premium') {
                navigate('/checkout', { state: { billingCycle } });
            } else {
                navigate('/vendor/dashboard');
            }
        } else {
            navigate(`/register?type=vendor&plan=${planType}&billing=${billingCycle}`);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="pricing-plans-page" style={{ padding: '60px 0', background: '#f9fafb' }}>
            <div className="section container">
                <div className="pricing-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{currentLang.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>{currentLang.subtitle}</p>

                    {plans.length === 0 ? (
                        <div style={{
                            background: '#ecfdf5',
                            border: '1px solid #10b981',
                            padding: '30px',
                            borderRadius: '16px',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            <h2 style={{ color: '#047857', marginBottom: '10px' }}>🚀 Beta Launch Special</h2>
                            <p style={{ fontSize: '1.1rem', color: '#065f46' }}>
                                {language === 'tr' ?
                                    'Şu an Beta aşamasındayız! Ücretsiz üye olun ve hediye kredilerle müşterilere ulaşın.' :
                                    language === 'de' ?
                                        'Wir sind in der Beta-Phase! Melden Sie sich kostenlos an und erhalten Sie Gratis-Credits.' :
                                        'We are in Beta! Sign up for free and get free credits to contact customers.'}
                            </p>
                            <button
                                onClick={() => navigate('/register?type=vendor&plan=free')}
                                className="btn btn-primary"
                                style={{ marginTop: '20px', fontSize: '1.1rem', padding: '12px 30px' }}
                            >
                                {currentLang.getStarted}
                            </button>
                        </div>
                    ) : (
                        /* Billing Cycle Toggle */
                        <div style={{
                            display: 'inline-flex',
                            background: '#e5e7eb',
                            padding: '4px',
                            borderRadius: '30px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: billingCycle === 'monthly' ? '#fff' : 'transparent',
                                    color: billingCycle === 'monthly' ? '#000' : '#666',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: billingCycle === 'monthly' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {currentLang.monthly}
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: billingCycle === 'annual' ? '#fff' : 'transparent',
                                    color: billingCycle === 'annual' ? '#000' : '#666',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: billingCycle === 'annual' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                {currentLang.annual}
                                <span style={{
                                    background: '#10b981',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '10px'
                                }}>
                                    -17%
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="pricing-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    maxWidth: '900px',
                    margin: '0 auto 80px auto'
                }}>
                    {plans.map((plan) => {
                        const isPremium = plan.name.toLowerCase() === 'premium';

                        // Calculate Price
                        let displayPrice = plan.price_monthly;
                        let period = currentLang.month;
                        let originalPrice = null;

                        if (billingCycle === 'annual' && isPremium) {
                            // Annual Price Calculation: 290€ / year
                            displayPrice = 290;
                            period = currentLang.year;
                            originalPrice = 348; // 29 * 12
                        } else if (billingCycle === 'annual' && !isPremium) {
                            period = currentLang.year; // Free is free
                        }

                        // Inject messaging feature and ensure correct order
                        const displayFeatures = {
                            ...plan.features,
                            messaging: isPremium, // Only available for premium
                            live_requests: isPremium, // Only available for premium
                            monthly_free_credits: isPremium ? (billingCycle === 'annual' ? 150 : 12) : 0
                        };

                        // Define feature order for consistent display
                        const featureOrder = [
                            'monthly_free_credits',
                            'messaging',
                            'live_requests',
                            'map_view',
                            'social_links',
                            'top_placement',
                            'verified_badge'
                        ];

                        return (
                            <div key={plan.id} style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '40px',
                                boxShadow: isPremium ? '0 20px 40px rgba(255, 215, 0, 0.15)' : '0 10px 30px rgba(0,0,0,0.05)',
                                border: isPremium ? '2px solid #ffd700' : '1px solid #e5e7eb',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {isPremium && (
                                    <div className="premium-badge-custom">
                                        {billingCycle === 'annual' ? `🔥 ${currentLang.save}` : `★ ${currentLang.popular}`}
                                    </div>
                                )}

                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px', textTransform: 'capitalize' }}>
                                    {plan.name.toLowerCase() === 'free' ? currentLang.free : currentLang.premium}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '3rem', fontWeight: '800', color: '#1a1a1a' }}>€{displayPrice}</span>
                                    <span style={{ color: '#666', marginLeft: '5px' }}>{period}</span>
                                </div>
                                {originalPrice && (
                                    <div style={{ color: '#999', textDecoration: 'line-through', marginBottom: '25px', fontSize: '1.1rem' }}>
                                        €{originalPrice}
                                    </div>
                                )}
                                {!originalPrice && <div style={{ marginBottom: '30px' }}></div>}

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', flex: 1 }}>
                                    {featureOrder.map((key) => {
                                        const value = displayFeatures[key];
                                        if (value === undefined && !plan.features[key]) return null;
                                        const isAvailable = value !== false && value !== 0;

                                        return (
                                            <li key={key} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '15px',
                                                color: isAvailable ? '#4b5563' : '#9ca3af',
                                                textDecoration: isAvailable ? 'none' : 'line-through'
                                            }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '24px',
                                                    height: '24px',
                                                    background: isAvailable ? (isPremium ? '#fff9c4' : '#e5e7eb') : '#f3f4f6',
                                                    color: isAvailable ? (isPremium ? '#f59e0b' : '#374151') : '#9ca3af',
                                                    borderRadius: '50%',
                                                    marginRight: '12px',
                                                    fontSize: '0.8rem',
                                                    flexShrink: 0
                                                }}>
                                                    {isAvailable ? '✓' : '✕'}
                                                </span>
                                                {key === 'monthly_free_credits' ? (
                                                    <div>
                                                        <strong>
                                                            {value} {billingCycle === 'annual' && isPremium ? (language === 'tr' ? 'Toplu Hediye Kredi' : 'Credits Upfront') : currentLang.features[key]}
                                                        </strong>
                                                        <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '2px', fontWeight: '600' }}>
                                                            {billingCycle === 'annual' && isPremium
                                                                ? (language === 'tr' ? '(Tüm yıl özgürce kullanın)' : '(Use freely all year)')
                                                                : currentLang.credit_info}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    currentLang.features[key] || key.replace(/_/g, ' ')
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>

                                <button
                                    className={`plan-button ${isPremium ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleSelectPlan(plan)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: isPremium ? '#ffd700' : '#1a1a1a',
                                        color: isPremium ? '#000' : '#fff',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    {isPremium ? currentLang.upgrade : currentLang.getStarted}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="pricing-faq" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>{currentLang.faq.title}</h2>
                    <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div className="faq-item">
                            <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{currentLang.faq.q1}</h4>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>{currentLang.faq.a1}</p>
                        </div>
                        <div className="faq-item">
                            <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{currentLang.faq.q2}</h4>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>{currentLang.faq.a2}</p>
                        </div>
                        <div className="faq-item">
                            <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{currentLang.faq.q3}</h4>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>{currentLang.faq.a3}</p>
                        </div>
                        <div className="faq-item">
                            <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{currentLang.faq.q4}</h4>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>{currentLang.faq.a4}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPlans;
