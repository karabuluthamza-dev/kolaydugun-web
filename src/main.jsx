import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PWAInstallProvider } from './context/PWAInstallContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { VendorProvider } from './context/VendorContext';
import { PlanningProvider } from './context/PlanningContext';
import App from './App';
import './index.css';
import i18n from './i18n'; // Import i18n configuration
import LoadingSpinner from './components/LoadingSpinner';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Production'da console.log zaten kaldırılacak, ama burada da kontrol edelim
    if (import.meta.env.DEV) {
      console.error("Uncaught error:", error, errorInfo);
    }
    this.setState({ errorInfo });
  }

  // Tarayıcı dilini algıla
  getLanguage() {
    const browserLang = navigator.language?.split('-')[0] || 'de';
    return ['tr', 'de', 'en'].includes(browserLang) ? browserLang : 'de';
  }

  render() {
    if (this.state.hasError) {
      // Use i18next directly for ErrorBoundary since it's outside LanguageProvider
      const t = {
        title: i18n.t('error.title', 'Bir şeyler ters gitti'),
        message: i18n.t('error.message', 'Sayfa yüklenirken beklenmedik bir hata oluştu.'),
        refresh: i18n.t('error.refresh', 'Sayfayı Yenile'),
        home: i18n.t('error.home', 'Ana Sayfaya Dön')
      };

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fdf2f8',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '24px',
              animation: 'bounce 2s infinite'
            }}>
              ⚠️
            </div>
            <h1 style={{
              color: '#831843',
              fontSize: '28px',
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              {t.title}
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              {t.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {t.refresh}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'white',
                  color: '#831843',
                  border: '2px solid #f9a8d4',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {t.home}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const paypalOptions = {
  "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "EUR",
  intent: "capture",
  vault: true
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <PayPalScriptProvider options={paypalOptions}>
          <LanguageProvider>
            <PWAInstallProvider>
              <SiteSettingsProvider>
                <VendorProvider>
                  <PlanningProvider>
                    <Router>
                      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><LoadingSpinner /></div>}>
                        <App />
                      </Suspense>
                    </Router>
                  </PlanningProvider>
                </VendorProvider>
              </SiteSettingsProvider>
            </PWAInstallProvider>
          </LanguageProvider>
        </PayPalScriptProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Register Service Worker for PWA support (only in non-DEV)
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('📱 PWA: Service Worker registered successfully');
      })
      .catch((error) => {
        console.log('PWA: Service Worker registration failed:', error);
      });
  });
}
