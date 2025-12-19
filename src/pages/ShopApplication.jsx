import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { CITIES } from '../constants/vendorData';
import SEO from '../components/SEO';
import './ShopApplication.css';

const ShopApplication = () => {
    const { t, language } = useLanguage();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [affiliateValid, setAffiliateValid] = useState(null);

    const [affiliateShop, setAffiliateShop] = useState(null);
    const [campaignSlug, setCampaignSlug] = useState(null); // Campaign tracking

    const location = useLocation();

    const [formData, setFormData] = useState({
        business_name: '',
        email: '',
        phone: '',
        city: '',
        product_description: '',
        referred_by_code: '',
        selected_plan: 'business',
        billing_cycle: 'yearly' // 'monthly' veya 'yearly'
    });

    const texts = {
        tr: {
            title: 'Mağaza Başvurusu',
            subtitle: 'Düğün ürünlerinizi KolayDugun platformunda satışa sunun',
            step1: 'İşletme Bilgileri',
            step2: 'Ürün Detayları',
            step3: 'Gönder',
            businessName: 'İşletme Adı',
            businessNamePlaceholder: 'Örn: Gelinlik World',
            email: 'E-posta Adresi',
            emailPlaceholder: 'magaza@email.com',
            phone: 'Telefon Numarası',
            phonePlaceholder: '+49 123 456 7890',
            city: 'Şehir',
            cityPlaceholder: 'Şehir seçin',
            productDescription: 'Ürün/Hizmet Açıklaması',
            productDescriptionPlaceholder: 'Hangi ürünleri satmak istiyorsunuz? (Gelinlik, aksesuar, dekorasyon vb.)',
            affiliateCode: 'Referans Kodu (Opsiyonel)',
            affiliateCodePlaceholder: 'ABC123XY',
            affiliateValid: '✅ Geçerli referans kodu',
            affiliateInvalid: '❌ Geçersiz referans kodu',
            next: 'Devam Et',
            back: 'Geri',
            submit: 'Başvuruyu Gönder',
            submitting: 'Gönderiliyor...',
            successTitle: '🎉 Başvurunuz Alındı!',
            successMessage: 'Başvurunuz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
            successCta: 'Mağazaya Dön',
            whyJoin: 'Neden KolayDugun?',
            benefit1: '🎯 Hedefli Müşteri Kitlesi',
            benefit1Desc: 'Almanya\'daki Türk çiftlere doğrudan ulaşın',
            benefit2: '💰 Düşük Komisyon',
            benefit2Desc: 'Aylık 19€\'dan başlayan planlar',
            benefit3: '📈 Büyüme Fırsatı',
            benefit3Desc: 'Affiliate sistemi ile pasif gelir kazanın',
            benefit4: '🛡️ Güvenilir Platform',
            benefit4Desc: '7/24 destek ve güvenli altyapı',
            requiredField: 'Bu alan zorunludur'
        },
        de: {
            title: 'Shop-Bewerbung',
            subtitle: 'Verkaufen Sie Ihre Hochzeitsprodukte auf KolayDugun',
            step1: 'Unternehmensdaten',
            step2: 'Produktdetails',
            step3: 'Absenden',
            businessName: 'Firmenname',
            businessNamePlaceholder: 'z.B. Brautmoden World',
            email: 'E-Mail-Adresse',
            emailPlaceholder: 'shop@email.com',
            phone: 'Telefonnummer',
            phonePlaceholder: '+49 123 456 7890',
            city: 'Stadt',
            cityPlaceholder: 'Stadt auswählen',
            productDescription: 'Produkt-/Dienstleistungsbeschreibung',
            productDescriptionPlaceholder: 'Welche Produkte möchten Sie verkaufen? (Brautkleider, Accessoires, Dekoration usw.)',
            affiliateCode: 'Empfehlungscode (Optional)',
            affiliateCodePlaceholder: 'ABC123XY',
            affiliateValid: '✅ Gültiger Empfehlungscode',
            affiliateInvalid: '❌ Ungültiger Empfehlungscode',
            next: 'Weiter',
            back: 'Zurück',
            submit: 'Bewerbung absenden',
            submitting: 'Wird gesendet...',
            successTitle: '🎉 Bewerbung eingereicht!',
            successMessage: 'Ihre Bewerbung wurde erfolgreich eingereicht. Wir werden uns in Kürze bei Ihnen melden.',
            successCta: 'Zurück zum Shop',
            whyJoin: 'Warum KolayDugun?',
            benefit1: '🎯 Zielgerichtete Kunden',
            benefit1Desc: 'Erreichen Sie türkische Paare in Deutschland direkt',
            benefit2: '💰 Niedrige Provision',
            benefit2Desc: 'Pläne ab 19€ pro Monat',
            benefit3: '📈 Wachstumschance',
            benefit3Desc: 'Verdienen Sie passives Einkommen mit dem Affiliate-System',
            benefit4: '🛡️ Zuverlässige Plattform',
            benefit4Desc: '24/7 Support und sichere Infrastruktur',
            requiredField: 'Dieses Feld ist erforderlich'
        },
        en: {
            title: 'Shop Application',
            subtitle: 'Sell your wedding products on KolayDugun',
            step1: 'Business Info',
            step2: 'Product Details',
            step3: 'Submit',
            businessName: 'Business Name',
            businessNamePlaceholder: 'e.g. Bridal World',
            email: 'Email Address',
            emailPlaceholder: 'shop@email.com',
            phone: 'Phone Number',
            phonePlaceholder: '+49 123 456 7890',
            city: 'City',
            cityPlaceholder: 'Select city',
            productDescription: 'Product/Service Description',
            productDescriptionPlaceholder: 'What products would you like to sell? (Wedding dresses, accessories, decoration, etc.)',
            affiliateCode: 'Referral Code (Optional)',
            affiliateCodePlaceholder: 'ABC123XY',
            affiliateValid: '✅ Valid referral code',
            affiliateInvalid: '❌ Invalid referral code',
            next: 'Continue',
            back: 'Back',
            submit: 'Submit Application',
            submitting: 'Submitting...',
            successTitle: '🎉 Application Submitted!',
            successMessage: 'Your application has been submitted successfully. We will get back to you shortly.',
            successCta: 'Return to Shop',
            whyJoin: 'Why KolayDugun?',
            benefit1: '🎯 Targeted Customers',
            benefit1Desc: 'Reach Turkish couples in Germany directly',
            benefit2: '💰 Low Commission',
            benefit2Desc: 'Plans starting from €19 per month',
            benefit3: '📈 Growth Opportunity',
            benefit3Desc: 'Earn passive income with the affiliate system',
            benefit4: '🛡️ Reliable Platform',
            benefit4Desc: '24/7 support and secure infrastructure',
            requiredField: 'This field is required'
        }
    };

    const txt = texts[language] || texts.tr;

    // Plan selection handler
    const selectPlan = (planId) => {
        setFormData({ ...formData, selected_plan: planId });
    };

    // Parse URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const ref = params.get('ref');
        const c = params.get('c') || params.get('campaign');

        if (ref) {
            setFormData(prev => ({
                ...prev,
                referred_by_code: ref.toUpperCase()
            }));
        }

        if (c) {
            setCampaignSlug(c);
        }
    }, [location.search]);

    // Check affiliate code
    useEffect(() => {
        const checkAffiliate = async () => {
            if (formData.referred_by_code.length >= 6) {
                const { data } = await supabase
                    .from('shop_accounts')
                    .select('id, business_name')
                    .eq('affiliate_code', formData.referred_by_code.toUpperCase())
                    .single();

                if (data) {
                    setAffiliateValid(true);
                    setAffiliateShop(data);
                } else {
                    setAffiliateValid(false);
                    setAffiliateShop(null);
                }
            } else {
                setAffiliateValid(null);
                setAffiliateShop(null);
            }
        };

        const timeout = setTimeout(checkAffiliate, 500);
        return () => clearTimeout(timeout);
    }, [formData.referred_by_code]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                business_name: formData.business_name,
                email: formData.email,
                phone: formData.phone || null,
                city: formData.city || null,
                product_description: formData.product_description || null,
                referred_by_code: formData.referred_by_code ? formData.referred_by_code.toUpperCase() : null,
                referred_by_shop_id: affiliateShop?.id || null,
                selected_plan: formData.selected_plan || 'starter',
                affiliate_campaign_slug: campaignSlug || null, // Campaign tracking
                status: 'pending'
            };

            console.log('📤 Submitting application:', payload);

            const { data, error } = await supabase
                .from('shop_applications')
                .insert([payload])
                .select();

            console.log('📥 Supabase response:', { data, error });

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            console.log('✅ Application saved:', data);

            // Başvuru alındı email'i gönder
            try {
                await supabase.functions.invoke('send_shop_application_email', {
                    body: {
                        type: 'received',
                        email: formData.email,
                        businessName: formData.business_name
                    }
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Email hatası başvuruyu engellemez
            }

            setSuccess(true);
        } catch (error) {
            console.error('❌ Error submitting application:', error);
            alert('Hata: ' + (error.message || JSON.stringify(error)));
        } finally {
            setSubmitting(false);
        }
    };

    const canProceedStep1 = formData.business_name.trim() && formData.email.trim();
    const canProceedStep2 = true; // Product description is optional

    if (success) {
        return (
            <div className="shop-application-page">
                <SEO title={txt.title} />
                <div className="application-success">
                    <div className="success-icon">🎉</div>
                    <h1>{txt.successTitle}</h1>
                    <p>{txt.successMessage}</p>
                    <Link to="/shop" className="btn-primary">
                        {txt.successCta}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-application-page">
            <SEO title={txt.title} description={txt.subtitle} />

            {/* Hero */}
            <div className="application-hero">
                <div className="container">
                    <h1>{txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
            </div>

            <div className="container">
                <div className="application-layout">
                    {/* Left: Form */}
                    <div className="application-form-container">
                        {/* Progress Steps */}
                        <div className="progress-steps">
                            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                <span className="step-number">1</span>
                                <span className="step-label">{txt.step1}</span>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                <span className="step-number">2</span>
                                <span className="step-label">{txt.step2}</span>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step ${step >= 3 ? 'active' : ''}`}>
                                <span className="step-number">3</span>
                                <span className="step-label">{txt.step3}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Business Info */}
                            {step === 1 && (
                                <div className="form-step">
                                    <div className="form-group">
                                        <label>{txt.businessName} *</label>
                                        <input
                                            type="text"
                                            value={formData.business_name}
                                            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                            placeholder={txt.businessNamePlaceholder}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>{txt.email} *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder={txt.emailPlaceholder}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{txt.phone}</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder={txt.phonePlaceholder}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>{txt.city}</label>
                                            <select
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            >
                                                <option value="">{txt.cityPlaceholder}</option>
                                                {CITIES.map(city => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => setStep(2)}
                                            disabled={!canProceedStep1}
                                        >
                                            {txt.next} →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Product Details */}
                            {step === 2 && (
                                <div className="form-step">
                                    <div className="form-group">
                                        <label>{txt.productDescription}</label>
                                        <textarea
                                            value={formData.product_description}
                                            onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                                            placeholder={txt.productDescriptionPlaceholder}
                                            rows={5}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>{txt.affiliateCode}</label>
                                        <input
                                            type="text"
                                            value={formData.referred_by_code}
                                            onChange={(e) => setFormData({ ...formData, referred_by_code: e.target.value.toUpperCase() })}
                                            placeholder={txt.affiliateCodePlaceholder}
                                            maxLength={8}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                        {affiliateValid === true && (
                                            <span className="affiliate-status valid">
                                                {txt.affiliateValid} - {affiliateShop?.business_name}
                                            </span>
                                        )}
                                        {affiliateValid === false && (
                                            <span className="affiliate-status invalid">
                                                {txt.affiliateInvalid}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => setStep(1)}
                                        >
                                            ← {txt.back}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => setStep(3)}
                                        >
                                            {txt.next} →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Review & Submit */}
                            {step === 3 && (
                                <div className="form-step">
                                    <div className="review-section">
                                        <h3>📋 {language === 'de' ? 'Zusammenfassung' : language === 'en' ? 'Summary' : 'Özet'}</h3>

                                        <div className="review-item">
                                            <span className="label">{txt.businessName}:</span>
                                            <span className="value">{formData.business_name}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="label">{txt.email}:</span>
                                            <span className="value">{formData.email}</span>
                                        </div>
                                        {formData.phone && (
                                            <div className="review-item">
                                                <span className="label">{txt.phone}:</span>
                                                <span className="value">{formData.phone}</span>
                                            </div>
                                        )}
                                        {formData.city && (
                                            <div className="review-item">
                                                <span className="label">{txt.city}:</span>
                                                <span className="value">{formData.city}</span>
                                            </div>
                                        )}
                                        <div className="review-item">
                                            <span className="label">{language === 'de' ? 'Gewählter Plan' : language === 'en' ? 'Selected Plan' : 'Seçilen Plan'}:</span>
                                            <span className="value" style={{ textTransform: 'capitalize' }}>{formData.selected_plan}</span>
                                        </div>
                                        {formData.product_description && (
                                            <div className="review-item full">
                                                <span className="label">{txt.productDescription}:</span>
                                                <span className="value">{formData.product_description}</span>
                                            </div>
                                        )}
                                        {affiliateShop && (
                                            <div className="review-item">
                                                <span className="label">{txt.affiliateCode}:</span>
                                                <span className="value affiliate">
                                                    {formData.referred_by_code} ({affiliateShop.business_name})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => setStep(2)}
                                        >
                                            ← {txt.back}
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary btn-submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? txt.submitting : txt.submit}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right: Benefits */}
                    <div className="application-benefits">
                        <h2>{txt.whyJoin}</h2>

                        <div className="benefit-card">
                            <span className="benefit-icon">{txt.benefit1.split(' ')[0]}</span>
                            <div>
                                <h4>{txt.benefit1.substring(3)}</h4>
                                <p>{txt.benefit1Desc}</p>
                            </div>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon">{txt.benefit2.split(' ')[0]}</span>
                            <div>
                                <h4>{txt.benefit2.substring(3)}</h4>
                                <p>{txt.benefit2Desc}</p>
                            </div>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon">{txt.benefit3.split(' ')[0]}</span>
                            <div>
                                <h4>{txt.benefit3.substring(3)}</h4>
                                <p>{txt.benefit3Desc}</p>
                            </div>
                        </div>

                        <div className="benefit-card">
                            <span className="benefit-icon">{txt.benefit4.split(' ')[0]}</span>
                            <div>
                                <h4>{txt.benefit4.substring(3)}</h4>
                                <p>{txt.benefit4Desc}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section - Full Width Below Form */}
                <div className="pricing-section-wrapper">
                    <div className="pricing-section">
                        <h3>{language === 'de' ? 'Plan Wählen' : language === 'en' ? 'Select Plan' : 'Plan Seçin'}</h3>

                        {/* Billing Toggle */}
                        <div className="billing-toggle">
                            <span className={formData.billing_cycle === 'monthly' ? 'active' : ''}>
                                {language === 'de' ? 'Monatlich' : language === 'en' ? 'Monthly' : 'Aylık'}
                            </span>
                            <button
                                type="button"
                                className={`toggle-switch ${formData.billing_cycle === 'yearly' ? 'yearly' : ''}`}
                                onClick={() => setFormData({ ...formData, billing_cycle: formData.billing_cycle === 'monthly' ? 'yearly' : 'monthly' })}
                            >
                                <span className="toggle-slider"></span>
                            </button>
                            <span className={formData.billing_cycle === 'yearly' ? 'active' : ''}>
                                {language === 'de' ? 'Jährlich' : language === 'en' ? 'Yearly' : 'Yıllık'}
                                <span className="discount-badge">-17%</span>
                            </span>
                        </div>

                        {/* Plan Cards */}
                        <div className="plan-cards">
                            {/* Starter Plan */}
                            <div
                                className={`plan-card ${formData.selected_plan === 'starter' ? 'selected' : ''}`}
                                onClick={() => selectPlan('starter')}
                            >
                                <div className="plan-header">
                                    <h4>Starter</h4>
                                    <p>{language === 'de' ? 'Für den Einstieg' : language === 'en' ? 'Getting Started' : 'Başlangıç İçin'}</p>
                                </div>
                                <div className="plan-price">
                                    <span className="price">
                                        {formData.billing_cycle === 'yearly' ? '16' : '19'}€
                                    </span>
                                    <span className="period">/{language === 'de' ? 'Mo' : language === 'en' ? 'mo' : 'ay'}</span>
                                    {formData.billing_cycle === 'yearly' && (
                                        <span className="yearly-total">
                                            = 190€/{language === 'de' ? 'Jahr' : language === 'en' ? 'year' : 'yıl'}
                                        </span>
                                    )}
                                </div>
                                <ul className="plan-features">
                                    <li>✓ 5 {language === 'de' ? 'Produkte' : language === 'en' ? 'products' : 'ürün'}</li>
                                    <li>✓ {language === 'de' ? 'Basis-Profil' : language === 'en' ? 'Basic profile' : 'Temel profil'}</li>
                                    <li>✓ WhatsApp {language === 'de' ? 'Support' : language === 'en' ? 'Support' : 'destek'}</li>
                                </ul>
                                <div className="plan-select-indicator">
                                    {formData.selected_plan === 'starter' ? '✓' : ''}
                                </div>
                            </div>

                            {/* Business Plan - Popular */}
                            <div
                                className={`plan-card popular ${formData.selected_plan === 'business' ? 'selected' : ''}`}
                                onClick={() => selectPlan('business')}
                            >
                                <div className="popular-badge">
                                    ⭐ {language === 'de' ? 'Beliebt' : language === 'en' ? 'Popular' : 'Popüler'}
                                </div>
                                <div className="plan-header">
                                    <h4>Business</h4>
                                    <p>{language === 'de' ? 'Für wachsende Shops' : language === 'en' ? 'For growing shops' : 'Büyüyen mağazalar için'}</p>
                                </div>
                                <div className="plan-price">
                                    <span className="price">
                                        {formData.billing_cycle === 'yearly' ? '33' : '39'}€
                                    </span>
                                    <span className="period">/{language === 'de' ? 'Mo' : language === 'en' ? 'mo' : 'ay'}</span>
                                    {formData.billing_cycle === 'yearly' && (
                                        <span className="yearly-total">
                                            = 390€/{language === 'de' ? 'Jahr' : language === 'en' ? 'year' : 'yıl'}
                                        </span>
                                    )}
                                </div>
                                <ul className="plan-features">
                                    <li>✓ 20 {language === 'de' ? 'Produkte' : language === 'en' ? 'products' : 'ürün'}</li>
                                    <li>✓ {language === 'de' ? 'Premium-Profil' : language === 'en' ? 'Premium profile' : 'Gelişmiş profil'}</li>
                                    <li>✓ {language === 'de' ? 'Prioritätsanzeige' : language === 'en' ? 'Priority listing' : 'Öncelikli listeleme'}</li>
                                    <li>✓ {language === 'de' ? 'Statistiken' : language === 'en' ? 'Analytics' : 'İstatistikler'}</li>
                                </ul>
                                <div className="plan-select-indicator">
                                    {formData.selected_plan === 'business' ? '✓' : ''}
                                </div>
                            </div>

                            {/* Premium Plan */}
                            <div
                                className={`plan-card premium ${formData.selected_plan === 'premium' ? 'selected' : ''}`}
                                onClick={() => selectPlan('premium')}
                            >
                                <div className="plan-header">
                                    <h4>Premium</h4>
                                    <p>{language === 'de' ? 'Für Profis' : language === 'en' ? 'For professionals' : 'Profesyoneller için'}</p>
                                </div>
                                <div className="plan-price">
                                    <span className="price">
                                        {formData.billing_cycle === 'yearly' ? '58' : '69'}€
                                    </span>
                                    <span className="period">/{language === 'de' ? 'Mo' : language === 'en' ? 'mo' : 'ay'}</span>
                                    {formData.billing_cycle === 'yearly' && (
                                        <span className="yearly-total">
                                            = 690€/{language === 'de' ? 'Jahr' : language === 'en' ? 'year' : 'yıl'}
                                        </span>
                                    )}
                                </div>
                                <ul className="plan-features">
                                    <li>✓ {language === 'de' ? 'Unbegrenzte Produkte' : language === 'en' ? 'Unlimited products' : 'Sınırsız ürün'}</li>
                                    <li>✓ {language === 'de' ? 'VIP-Profil' : language === 'en' ? 'VIP profile' : 'VIP profil'}</li>
                                    <li>✓ {language === 'de' ? 'Featured auf Homepage' : language === 'en' ? 'Featured on homepage' : 'Ana sayfada öne çıkarma'}</li>
                                    <li>✓ {language === 'de' ? 'Erweiterte Statistiken' : language === 'en' ? 'Advanced analytics' : 'Detaylı istatistikler'}</li>
                                    <li>✓ {language === 'de' ? 'Affiliate-System' : language === 'en' ? 'Affiliate system' : 'Affiliate sistemi'}</li>
                                </ul>
                                <div className="plan-select-indicator">
                                    {formData.selected_plan === 'premium' ? '✓' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopApplication;
