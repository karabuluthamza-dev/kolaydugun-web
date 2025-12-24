import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Mail, ShieldCheck, UserPlus, Info, Rocket } from 'lucide-react';
import './AdminVendors.css';

const AdminPoachedInquiries = () => {
    const { t, language } = useLanguage();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('poached_inquiries')
                .select(`
                    *,
                    vendor:vendor_id(id, business_name, slug, raw_city_name, contact_email, contact_phone, website_url, scraper_source_url, is_claimed, is_verified, vendor_insights(performance_score, metrics))
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (inquiry) => {
        setProcessing(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            // Special "Accelerator Invite" Link logic
            const inviteLink = `${window.location.origin}/register?type=vendor&promo=accelerator&ref_inquiry=${inquiry.id}`;
            console.log('Generated Invite Link:', inviteLink);

            setSuccessMessage(t('poaching.admin.inviteSuccess', { link: inviteLink }));

            await supabase
                .from('poached_inquiries')
                .update({ status: 'forwarded', admin_notes: 'Accelerator daveti gönderildi.' })
                .eq('id', inquiry.id);

            fetchInquiries();

            // Do not auto-hide this success message as it contains the link
        } catch (error) {
            setErrorMessage(t('poaching.admin.error') + error.message);
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setProcessing(false);
        }
    };


    if (loading) return <div className="admin-loading">{t('poaching.admin.loading')}</div>;


    return (
        <div className="admin-vendors">
            <div className="admin-page-header">
                <div>
                    <h1>{t('poaching.admin.inquiriesTitle')}</h1>
                    <p>{t('poaching.admin.inquiriesDesc')}</p>
                </div>
            </div>

            {successMessage && (
                <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #16a34a', whiteSpace: 'pre-line' }}>
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ef4444' }}>
                    {errorMessage}
                </div>
            )}

            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
                <table className="vendors-table">
                    <thead>
                        <tr>
                            <th>{t('poaching.admin.tableHeader.firmCity')}</th>
                            <th>{t('poaching.admin.tableHeader.customerInfo')}</th>
                            <th>{t('poaching.admin.tableHeader.message')}</th>
                            <th>{t('poaching.admin.tableHeader.date')}</th>
                            <th>{t('poaching.admin.tableHeader.status')}</th>
                            <th>{t('poaching.admin.tableHeader.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>{t('poaching.admin.noData')}</td></tr>
                        ) : (
                            inquiries.map((iq) => (
                                <tr key={iq.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Link
                                                    to={`/vendors/${iq.vendor.slug || iq.vendor.id}`}
                                                    style={{ fontWeight: '700', color: '#4f46e5', textDecoration: 'none', fontSize: '1rem' }}
                                                    className="vendor-link-hover"
                                                >
                                                    🏢 {iq.vendor.business_name}
                                                </Link>
                                                {iq.vendor.is_claimed ? (
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        backgroundColor: '#e0e7ff',
                                                        color: '#4338ca',
                                                        padding: '1px 5px',
                                                        borderRadius: '3px',
                                                        fontWeight: '600'
                                                    }}>
                                                        👤 Sahipli
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        backgroundColor: '#f1f5f9',
                                                        color: '#64748b',
                                                        padding: '1px 5px',
                                                        borderRadius: '3px',
                                                        fontWeight: '600'
                                                    }}>
                                                        👤 Sahipsiz
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>📍 {iq.vendor?.raw_city_name || t('adminPanel.sidebar.notSpecified')}</div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {iq.vendor?.contact_phone && (
                                                <a href={`tel:${iq.vendor?.contact_phone}`}
                                                    style={{ fontSize: '0.7rem', color: '#059669', textDecoration: 'none', fontWeight: '700', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1fae5' }}>
                                                    📞 Ara
                                                </a>
                                            )}
                                            {iq.vendor?.contact_email && (
                                                <a href={`mailto:${iq.vendor?.contact_email}`}
                                                    style={{ fontSize: '0.7rem', color: '#2563eb', textDecoration: 'none', fontWeight: '700', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #dbeafe' }}>
                                                    📧 Mail
                                                </a>
                                            )}
                                            {(iq.vendor?.scraper_source_url || iq.vendor?.website_url) && (
                                                <a href={iq.vendor?.scraper_source_url || iq.vendor?.website_url} target="_blank" rel="noopener noreferrer"
                                                    style={{ fontSize: '0.7rem', color: '#7c3aed', textDecoration: 'none', fontWeight: '700', backgroundColor: '#f5f3ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ede9fe' }}
                                                    title={iq.vendor?.scraper_source_url ? "Orijinal Kaynak (Scraper)" : "İşletme Web Sitesi"}
                                                >
                                                    🔗 Kaynak
                                                </a>
                                            )}
                                            {(iq.vendor?.is_verified || iq.vendor?.is_claimed) && (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }} title="Toplam Görüntülenme">
                                                        👁️ {iq.vendor?.vendor_insights?.[0]?.metrics?.view_count || 0}
                                                        {language === 'tr' ? ' kez incelendi' : ' views'}
                                                    </span>
                                                    {iq.vendor?.vendor_insights?.[0]?.performance_score && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            color: iq.vendor.vendor_insights[0].performance_score > 70 ? '#10b981' : '#f59e0b',
                                                            fontWeight: '700'
                                                        }} title="AI Performans Puanı">
                                                            🌟 {iq.vendor.vendor_insights[0].performance_score}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{iq.sender_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{iq.sender_email}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{iq.sender_phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '250px', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                                            "{iq.message}"
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {new Date(iq.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${iq.status}`}>
                                            {t(`poaching.admin.statuses.${iq.status}`) || iq.status.toUpperCase()}

                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-primary"
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                                                onClick={() => handleInvite(iq)}
                                                disabled={processing}
                                            >
                                                <Rocket size={14} /> {t('poaching.admin.inviteAction')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default AdminPoachedInquiries;
