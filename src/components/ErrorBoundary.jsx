import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Log to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleGoBack = () => {
        window.history.back();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-pink-500" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            Ups! Bir Şeyler Ters Gitti
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-6">
                            Beklenmedik bir hata oluştu. Endişelenmeyin, verileriniz güvende.
                            Sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
                        </p>

                        {/* Error details (development only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Teknik Detaylar (Geliştirici)
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40 text-red-600">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRefresh}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Sayfayı Yenile
                            </button>
                            <button
                                onClick={this.handleGoBack}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Geri Dön
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                Ana Sayfa
                            </button>
                        </div>

                        {/* Support Link */}
                        <p className="mt-6 text-sm text-gray-500">
                            Sorun devam ederse{' '}
                            <a href="/contact" className="text-pink-600 hover:underline">
                                destek ekibimizle iletişime geçin
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
