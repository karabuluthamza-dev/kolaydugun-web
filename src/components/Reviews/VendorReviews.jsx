import React, { useState } from 'react';
import { useVendorReviews } from '../../hooks/useVendorReviews';
import { useAuth } from '../../context/AuthContext';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useLanguage } from '../../context/LanguageContext';

const VendorReviews = ({ vendorId }) => {
    const { reviews, loading, error, userReview, addReview, deleteReview } = useVendorReviews(vendorId);
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showForm, setShowForm] = useState(false);

    if (loading) return <div>{t('common.loading')}</div>;
    if (error) return <div>{t('common.error')}</div>;

    return (
        <div className="vendor-reviews">
            {user && !userReview && (
                <div style={{ marginBottom: '2rem' }}>
                    {!showForm ? (
                        <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                            <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                                {t('reviews.shareExperience') || 'Bu tedarikçi hakkında ne düşünüyorsunuz?'}
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                {t('reviews.writeFirstReview') || 'Değerlendirme Yap'}
                            </button>
                        </div>
                    ) : (
                        <ReviewForm
                            onSubmit={async (rating, comment) => {
                                await addReview(rating, comment);
                                setShowForm(false);
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    )}
                </div>
            )}

            {!user && (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        {t('reviews.loginToReview') || 'Yorum yapmak için giriş yapmalısınız.'}
                    </p>
                    <a href="/login" className="btn btn-secondary">
                        {t('common.login') || 'Giriş Yap'}
                    </a>
                </div>
            )}

            <ReviewList
                reviews={reviews}
                onDelete={deleteReview}
                currentUserId={user?.id}
            />
        </div>
    );
};

export default VendorReviews;
