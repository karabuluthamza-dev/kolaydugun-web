import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import ClaimRequestModal from './ClaimRequestModal';
import { dictionary } from '../locales/dictionary';
import './ClaimBusinessButton.css';

const ClaimBusinessButton = ({ vendor }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    // Don't show if already claimed or assigned to a user
    if (vendor.is_claimed || vendor.user_id) return null;

    const handleClick = () => {
        if (!user) {
            // Force login if not authenticated
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        setShowModal(true);
    };

    return (
        <div className="claim-container">
            <button
                className="claim-business-btn"
                onClick={handleClick}
                title={dictionary.common.vendorClaim.buttonTitle[language]}
            >
                <span className="icon">🛡️</span>
                {dictionary.common.vendorClaim.buttonTitle[language]}
            </button>
            <p className="claim-hint">
                {dictionary.common.vendorClaim.hint[language]}
            </p>

            {showModal && (
                <ClaimRequestModal
                    vendor={vendor}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default ClaimBusinessButton;
