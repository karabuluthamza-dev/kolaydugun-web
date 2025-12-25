import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { CATEGORIES, CITIES, COUNTRIES, STATES, CITIES_BY_STATE, getCategoryTranslationKey } from '../constants/vendorData';
import { dictionary } from '../locales/dictionary';
import './Register.css';

const Register = () => {
    const { t, language } = useLanguage();
    useSEO({
        title: t('register.title'),
        description: 'Create a new account on KolayDugun.de.'
    });

    // Initial state is null to show selection screen first
    const [userType, setUserType] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Vendor specific
        category: 'Wedding Venues',
        country: 'DE',
        state: '',
        location: '',
        promoCode: ''
    });
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const { register, loginWithGoogle, user: currentUser, loading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!authLoading && currentUser) {
            let role = currentUser?.role || currentUser?.user_metadata?.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'vendor') navigate('/vendor/dashboard');
            else navigate('/user-dashboard');
        }
    }, [currentUser, authLoading, navigate]);

    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'vendor') {
            setUserType('vendor');
        } else if (type === 'couple') {
            setUserType('couple');
        }
    }, [searchParams]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t('register.errors.name');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = t('register.errors.email');

        if (formData.password.length < 6) newErrors.password = t('register.errors.password');
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('register.errors.confirmPassword');

        if (userType === 'vendor') {
            if (!formData.country) newErrors.country = t('register.errors.location');
            if (!formData.state) newErrors.state = t('register.errors.location');
            if (!formData.location) newErrors.location = t('register.errors.location');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSubmitError('');

        try {
            // Register user
            const { data, error } = await register(formData, userType);

            if (error) throw error;

            // If registration successful, do NOT navigate. Show success message.
            setSubmitted(true);

        } catch (error) {
            console.error('Registration error:', error);
            setSubmitError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // SUCCESS STATE UI
    if (submitted) {
        return (
            <div className="section container register-container">
                <div className="register-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📩</div>
                    <h2 style={{ marginBottom: '15px' }}>{t('register.successTitle', 'Lütfen E-postanızı Kontrol Edin')}</h2>
                    <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                        {t('register.successMessage', 'E-posta adresinizi doğrulamanız için bir bağlantı gönderdik. Hesabınızı onaylamak için lütfen bağlantıya tıklayın.')}
                    </p>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
                        <strong>Not:</strong> E-postayı göremiyorsanız Spam/Gereksiz klasörünü kontrol etmeyi unutmayın.
                    </div>
                    <Link to="/login" className="btn btn-primary" style={{ marginTop: '30px', display: 'inline-block' }}>
                        {t('login.title')} Sayfasına Git
                    </Link>
                </div>
            </div>
        );
    }

    // SELECTION SCREEN UI (if userType is not selected)
    if (!userType) {
        return (
            <div className="section container register-container">
                <div className="register-card" style={{ maxWidth: '800px' }}>
                    <h2 className="register-title" style={{ marginBottom: '40px' }}>{t('register.title')}</h2>
                    <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>
                        {t('register.selectTypeParams')}
                    </p>

                    <div className="selection-grid">
                        {/* Couple Selection Card */}
                        <div
                            onClick={() => setUserType('couple')}
                            className="selection-card couple group"
                        >
                            <div className="card-icon group-hover:bg-pink-100">
                                👰‍♀️
                            </div>
                            <h3 className="card-title">{t('register.forCouples')}</h3>
                            <p className="card-desc">
                                {t('register.coupleDesc')}
                            </p>
                            <div className="card-action">
                                {t('common.select')} <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </div>

                        {/* Vendor Selection Card */}
                        <div
                            onClick={() => setUserType('vendor')}
                            className="selection-card vendor group"
                        >
                            <div className="card-icon group-hover:bg-purple-100">
                                🏢
                            </div>
                            <h3 className="card-title">{t('register.forVendors')}</h3>
                            <p className="card-desc">
                                {t('register.vendorDesc')}
                            </p>
                            <div className="card-action">
                                {t('common.select')} <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </div>
                    </div>

                    <p className="login-link" style={{ marginTop: '40px' }}>
                        {t('register.loginLink')} <Link to="/login">{t('login.title')}</Link>
                    </p>
                </div>
            </div>
        );
    }

    // FORM UI (if userType is selected)
    return (
        <div className="section container register-container">
            <div className="register-card">
                {/* Back Button */}
                <button
                    onClick={() => setUserType(null)}
                    className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    title={t('common.back', 'Geri Dön')}
                >
                    ← {t('common.back', 'Geri')}
                </button>

                <h2 className="register-title">{t('register.title')}</h2>
                <div className="user-type-toggle">
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${userType === 'couple' ? 'bg-pink-50 text-pink-600' : 'bg-purple-50 text-purple-600'}`}>
                        {userType === 'couple' ? `👰‍♀️ ${t('register.forCouples')}` : `🏢 ${t('register.forVendors')}`}
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Common fields */}
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">{userType === 'couple' ? t('register.fullName') : t('register.businessName')}</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">{t('register.email')}</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    {userType === 'vendor' && (
                        <>
                            {/* Category */}
                            <div className="form-group">
                                <label htmlFor="category" className="form-label">{t('register.category')}</label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{t(`categories.${getCategoryTranslationKey(cat)}`)}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Hierarchical Location Selection */}
                            <div className="form-group">
                                <label className="form-label">{t('filters.country') || 'Land'}</label>
                                <select
                                    name="country"
                                    className="form-select"
                                    value={formData.country}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value, state: '', location: '' }))}
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c[language] || c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('filters.state') || 'Bundesland'}</label>
                                <select
                                    name="state"
                                    className={`form-select ${errors.state ? 'error' : ''}`}
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, location: '' }))}
                                >
                                    <option value="">{t('common.select') || 'Seçiniz'}</option>
                                    {(STATES[formData.country] || []).map(s => (
                                        <option key={s.id} value={s.id}>
                                            {dictionary.locations.states[s.id]?.[language] || s[language] || s.en}
                                        </option>
                                    ))}
                                </select>
                                {errors.state && <span className="error-text">{errors.state}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="location" className="form-label">{t('filters.city') || 'Şehir'}</label>
                                <select
                                    id="location"
                                    name="location"
                                    className={`form-select ${errors.location ? 'error' : ''}`}
                                    value={formData.location}
                                    onChange={handleChange}
                                >
                                    <option value="">{t('register.selectCity')}</option>
                                    {(CITIES_BY_STATE[formData.state] || []).map(city => (
                                        <option key={city.id} value={city.id}>{city[language] || city.en || city.id}</option>
                                    ))}
                                </select>
                                {errors.location && <span className="error-text">{errors.location}</span>}
                            </div>
                            {/* Promo Code */}
                            <div className="form-group">
                                <label htmlFor="promoCode" className="form-label">{t('register.promoCode') || 'Promo Code (Optional)'}</label>
                                <input
                                    id="promoCode"
                                    type="text"
                                    name="promoCode"
                                    className="form-input"
                                    value={formData.promoCode}
                                    onChange={handleChange}
                                    placeholder="EARLY100"
                                />
                            </div>
                        </>
                    )}
                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">{t('register.password')}</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                    <div className="form-group last">
                        <label htmlFor="confirmPassword" className="form-label">{t('register.confirmPassword')}</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
                        {loading ? t('register.creating') : (userType === 'couple' ? t('register.submitCouple') : t('register.submitVendor'))}
                    </button>
                    {submitError && <div className="error-message" style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{submitError}</div>}
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                    <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.9rem' }}>{t('common.or') || 'veya'}</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                </div>

                <button
                    type="button"
                    className="btn"
                    style={{
                        width: '100%',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onClick={async () => {
                        try {
                            await loginWithGoogle(userType);
                        } catch (err) {
                            setSubmitError(err.message);
                        }
                    }}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                    Google ile Kayıt Ol
                </button>
                <p className="login-link">
                    {t('register.loginLink')} <Link to="/login">{t('login.title')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
