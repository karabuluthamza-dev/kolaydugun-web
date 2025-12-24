import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dictionary } from '../locales/dictionary';
import './ClaimRequestModal.css';

const ClaimRequestModal = ({ vendor, onClose }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert(dictionary.common.vendorClaim.loginRequired[language]);
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('claim_requests')
                .insert([{
                    vendor_id: vendor.id,
                    user_id: user.id,
                    contact_email: formData.email,
                    contact_phone: formData.phone,
                    message: formData.message,
                    status: 'pending'
                }]);

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => onClose(), 3000);
        } catch (error) {
            console.error('Claim error:', error);
            alert(language === 'tr'
                ? 'Talebiniz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.'
                : 'An error occurred while sending your request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const strings = dictionary.common.vendorClaim;

    return (
        <div className="modal-overlay">
            <div className="modal-content claim-modal">
                <div className="modal-header">
                    <h2>{strings.modalTitle[language]}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                {success ? (
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h3>{strings.success.title[language]}</h3>
                        <p>{strings.success.desc[language]}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="modal-intro">
                            {strings.intro[language].replace('{{name}}', vendor.business_name)}
                        </p>

                        <div className="form-group">
                            <label>{strings.form.email[language]} *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>{strings.form.phone[language]} *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="+49..."
                            />
                        </div>

                        <div className="form-group">
                            <label>{strings.form.message[language]}</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                className="form-control"
                                placeholder={strings.form.placeholder[language]}
                            ></textarea>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn btn-secondary">
                                {t('common.cancel')}
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? strings.form.submitting[language] : strings.form.submit[language]}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ClaimRequestModal;
