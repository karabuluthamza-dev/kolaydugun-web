import React from 'react';
import { MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { trackError } from '../utils/analytics';

export class AiChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('💥 [AiChatErrorBoundary] Caught error in AiChatDrawer:', error, errorInfo);
        trackError(error?.message || 'AiChatDrawer Render Error', 'AiChatDrawer', false);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid #fee2e2',
                        maxWidth: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        fontSize: '14px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '600' }}>
                            <AlertTriangle size={18} />
                            <span>AI Asistan Modülü Yüklenemedi</span>
                        </div>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
                            AI Sohbet modülü oluşturulurken beklenmeyen bir hata meydana geldi.
                        </p>
                        <button
                            onClick={this.handleReset}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: 'var(--color-primary, #e11d48)',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            <RefreshCw size={14} />
                            <span>Yeniden Dene</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
