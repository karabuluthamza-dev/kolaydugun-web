import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import './Login.css';

const Login = () => {
    const { t } = useLanguage();
    useSEO({
        title: t('login.title'),
        description: 'Login to your KolayDugun.de account.'
    });
    const [userType, setUserType] = useState('couple'); // 'couple' or 'vendor'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, user: currentUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (!authLoading && currentUser) {
            let role = currentUser?.role || currentUser?.user_metadata?.role;
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'vendor') {
                navigate('/vendor/dashboard');
            } else {
                navigate('/user-dashboard');
            }
        }
    }, [currentUser, authLoading, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user } = await login(email, password);

            // Intelligent Redirection based on User Role
            let role = user?.user_metadata?.role;

            // Fallback: Check profiles table if role is missing in metadata
            if (!role) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile) {
                    role = profile.role;
                }
            }

            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'vendor') {
                navigate('/vendor/dashboard');
            } else {
                // Default to couple dashboard
                navigate('/user-dashboard');
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.message && (err.message.includes("Email not confirmed") || err.message.includes("confirm your email"))) {
                setError(t('login.verifyEmail') || "Giriş yapmadan önce lütfen e-posta adresinizi doğrulayın.");
            } else if (err.message === "Invalid login credentials") {
                setError(t('login.invalidCredentials') || "E-posta veya şifre hatalı.");
            } else {
                setError(err.message || t('login.failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section container login-container">
            <div className="login-card">
                <h2 className="text-center mb-lg">{t('login.welcomeBack')}</h2>

                <div className="login-tabs">
                    <button
                        className={`login-tab ${userType === 'couple' ? 'active' : ''}`}
                        onClick={() => setUserType('couple')}
                    >
                        {t('login.coupleLogin')}
                    </button>
                    <button
                        className={`login-tab ${userType === 'vendor' ? 'active' : ''}`}
                        onClick={() => setUserType('vendor')}
                    >
                        {t('login.vendorLogin')}
                    </button>
                </div>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email" className="login-label">{t('login.email')}</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="login-form-group-last">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label htmlFor="password" className="login-label" style={{ marginBottom: 0 }}>{t('login.password')}</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2271b1', textDecoration: 'none' }}>
                                Şifremi Unuttum?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? t('login.loading') : (userType === 'couple' ? t('login.submitCouple') : t('login.submitVendor'))}
                    </button>
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
                            setError(err.message);
                        }
                    }}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                    Google ile Giriş Yap
                </button>

                <p className="login-footer">
                    {t('login.noAccount')} <Link to="/register" className="login-link">{t('login.signUp')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
