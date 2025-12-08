import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

const GalleryManager = ({ vendor, onUpdate }) => {
    const { t } = useLanguage();
    const [uploading, setUploading] = useState(false);

    // Tier limits
    const TIER_LIMITS = {
        free: 3,
        basic: 10,
        premium: 50
    };

    const currentTier = vendor?.subscription_tier || 'free';
    const currentLimit = TIER_LIMITS[currentTier];
    const currentCount = (vendor?.gallery?.length || 0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (currentCount >= currentLimit) {
            alert(t('vendorDashboard.alerts.limitReached') + ` (${currentLimit})`);
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${vendor.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('vendor-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('vendor-images')
                .getPublicUrl(filePath);

            // Update vendor gallery array
            const newGallery = [...(vendor.gallery || []), publicUrl];

            const { error: updateError } = await supabase
                .from('vendors')
                .update({ gallery: newGallery })
                .eq('id', vendor.id);

            if (updateError) throw updateError;

            alert(t('vendorDashboard.alerts.saved'));
            onUpdate();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (e, imageUrl) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(t('common.areYouSure') || 'Emin misiniz?')) return;

        console.log('🗑️ Deleting image:', imageUrl);
        console.log('🆔 Vendor ID:', vendor.id);

        if (!vendor.id) {
            alert('Hata: Satıcı kimliği bulunamadı.');
            return;
        }

        try {
            // Filter out the image strictly
            const newGallery = (vendor.gallery || []).filter(img => img !== imageUrl);
            console.log('📉 New gallery count:', newGallery.length);

            const { error, data } = await supabase
                .from('vendors')
                .update({ gallery: newGallery })
                .eq('id', vendor.id)
                .select();

            if (error) {
                console.error('❌ Update error:', error);
                throw error;
            }

            console.log('✅ Update success:', data);

            // Optimistic update or wait for refetch
            onUpdate();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Silme sırasında hata oluştu: ' + error.message);
        }
    };

    return (
        <div className="gallery-manager">
            <h2>{t('dashboard.gallery')}</h2>

            <div className="tier-badge-container" style={{ marginBottom: '20px' }}>
                <span className={`badge badge-${currentTier}`}>
                    {t(`vendorDashboard.tiers.${currentTier}.name`)}
                </span>
                <span style={{ marginLeft: '10px' }}>
                    {currentCount} / {currentLimit}
                </span>
            </div>

            <div className="upload-section" style={{ margin: '20px 0' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading || currentCount >= currentLimit}
                    id="gallery-upload"
                    style={{ display: 'none' }}
                />
                <label
                    htmlFor="gallery-upload"
                    className={`btn btn-secondary ${currentCount >= currentLimit ? 'disabled' : ''}`}
                >
                    {uploading ? t('vendorDashboard.alerts.uploading') : '➕ ' + t('services.add')}
                </label>
                {currentCount >= currentLimit && (
                    <p className="text-danger mt-2">
                        {t('vendorDashboard.alerts.limitReached')} - <a href="#">Upgrade</a>
                    </p>
                )}
            </div>

            <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {vendor?.gallery?.map((img, idx) => (
                    <div key={idx} className="gallery-item" style={{ position: 'relative' }}>
                        <img
                            src={img}
                            alt={`Gallery ${idx}`}
                            style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                            onClick={(e) => handleDelete(e, img)}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'rgba(255, 0, 0, 0.8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                {vendor?.gallery?.length === 0 && (
                    <p className="text-muted">{t('services.empty')}</p>
                )}
            </div>
        </div>
    );
};

export default GalleryManager;
