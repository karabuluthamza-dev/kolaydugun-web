import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import SocialMediaLinks from './SocialMediaLinks';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { adminNotifications } from '../utils/adminNotifications';
import './Contact.css';

const Contact = () => {
    const { t } = useLanguage();
    const { settings } = useSiteSettings();
    const [status, setStatus] = React.useState('idle'); // idle, submitting, success, error
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            // 1. Save to Database
            const { error } = await supabase.from('contact_messages').insert([data]);

            if (error) throw error;

            // 2. Email Notification (Optional - EmailJS)
            /*
            await import('@emailjs/browser').then(emailjs => 
                emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', data, 'YOUR_PUBLIC_KEY')
            );
            */

            // 3. Send admin panel notification
            try {
                await adminNotifications.newContactMessage(data);
            } catch (notifError) {
                console.error('Admin notification failed:', notifError);
            }

            setStatus('success');
            e.target.reset();
        } catch (err) {
            console.error('Error sending message:', err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send message.');
        }
    };

    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                <div className="contact-grid">
                    <div>
                        <h2 className="contact-title">{t('contact.title')}</h2>
                        <p className="contact-desc">
                            {t('contact.desc')}
                        </p>
                        <div className="contact-info">
                            <div>📍 {t('contact.address')}</div>
                            <div>✉️ kontakt@kolaydugun.de</div>
                            {settings?.social_media && (
                                <div style={{ marginTop: '20px' }}>
                                    <SocialMediaLinks socialMedia={settings.social_media} />
                                </div>
                            )}
                        </div>
                    </div>

                    <form className="contact-form-card" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="contact-name" className="form-label">{t('contact.name')}</label>
                            <input id="contact-name" name="name" type="text" className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-email" className="form-label">{t('contact.email')}</label>
                            <input id="contact-email" name="email" type="email" className="form-input" required />
                        </div>
                        <div className="form-group-last">
                            <label htmlFor="contact-message" className="form-label">{t('contact.message')}</label>
                            <textarea id="contact-message" name="message" rows="4" className="form-textarea" required></textarea>
                        </div>

                        {status === 'success' && (
                            <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>
                                {t('contact.success')}
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                                {errorMessage || t('contact.error')}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === 'submitting'}>
                            {status === 'submitting' ? t('contact.sending', 'Sending...') : t('contact.send')}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
