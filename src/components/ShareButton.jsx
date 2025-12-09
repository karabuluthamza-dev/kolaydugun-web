import React, { useState, useRef, useEffect } from 'react';
import './ShareButton.css';
import { useLanguage } from '../context/LanguageContext';

const ShareButton = ({ vendor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getShareUrl = () => window.location.href;
    const getShareText = () => `${vendor.business_name || vendor.name} - KolayDugun.de`;

    const handleNativeShare = async () => {
        const shareData = {
            title: getShareText(),
            text: `Check out ${getShareText()}`,
            url: getShareUrl()
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled:', err);
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const handleShareOption = (platform) => {
        const url = encodeURIComponent(getShareUrl());
        const text = encodeURIComponent(getShareText());

        let shareLink = '';

        switch (platform) {
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${text}%20${url}`;
                break;
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(getShareUrl());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                setTimeout(() => setIsOpen(false), 1000);
                return;
            default:
                return;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'noopener,noreferrer');
            setIsOpen(false);
        }
    };

    return (
        <div className="share-button-container" ref={menuRef} style={{ position: 'relative' }}>
            <button
                className="share-button"
                onClick={handleNativeShare}
                title={t('common.share')}
            >
                <svg
                    className="share-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 15.2491 15.0227 15.3715L8.08261 11.9013C7.54305 11.3453 6.8108 11 6 11C4.34315 11 3 12.3431 3 14C3 15.6569 4.34315 17 6 17C6.8108 17 7.54305 16.6547 8.08261 16.0987L15.0227 19.6285C15.0077 19.7509 15 19.8745 15 20C15 21.6569 16.3431 23 18 23C19.6569 23 21 21.6569 21 20C21 18.3431 19.6569 17 18 17C17.1892 17 16.457 17.3453 15.9174 17.9013L8.97733 14.3715C8.99229 14.2491 9 14.1255 9 14C9 13.8745 8.99229 13.7509 8.97733 13.6285L15.9174 10.0987C16.457 10.6547 17.1892 11 18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="share-text">{t('common.share')}</span>
            </button>

            {isOpen && (
                <div className="share-menu-dropdown">
                    <div className="share-menu-header">
                        {t('common.shareOptions.title')}
                    </div>
                    <button onClick={() => handleShareOption('whatsapp')} className="share-menu-item whatsapp">
                        <span className="share-menu-icon" style={{ color: '#25D366' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </span>
                        {t('common.shareOptions.whatsapp')}
                    </button>
                    <button onClick={() => handleShareOption('facebook')} className="share-menu-item facebook">
                        <span className="share-menu-icon" style={{ color: '#1877F2' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.428l-.538 3.667h-2.89l-.003 7.98h-4.841z" /></svg>
                        </span>
                        {t('common.shareOptions.facebook')}
                    </button>
                    <button onClick={() => handleShareOption('copy')} className="share-menu-item copy">
                        <span className="share-menu-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        {copied ? t('common.shareOptions.copied') : t('common.shareOptions.copyLink')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButton;
