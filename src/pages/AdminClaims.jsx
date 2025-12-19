import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { dictionary } from '../locales/dictionary';
import './AdminVendors.css'; // Reuse existing table styles

const AdminClaims = () => {
    const { t, language } = useLanguage();
    const strings = dictionary.common.vendorClaim.admin;
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('claim_requests')
                .select(`
                    *,
                    vendor:vendor_id(business_name, slug),
                    profile:user_id(email)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching claim requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request) => {
        const confirmed = window.confirm(
            strings.actions.confirmApprove(request.vendor?.business_name || 'Business', request.profile?.email || request.contact_email, language)
        );
        if (!confirmed) return;

        setProcessing(true);
        try {
            const { error } = await supabase.rpc('approve_vendor_claim', {
                p_request_id: request.id
            });

            if (error) throw error;
            alert(t('common.vendorClaim.admin.actions.successApprove', 'Onaylandı ve sahiplik devredildi!'));
            fetchRequests();
        } catch (error) {
            console.error('Approval error:', error);
            alert(t('common.error', 'Hata: ') + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (request) => {
        const reason = window.prompt(t('common.vendorClaim.admin.actions.rejectPrompt', 'Red sebebi girin:'));
        if (reason === null) return;

        setProcessing(true);
        try {
            const { error } = await supabase.rpc('reject_vendor_claim', {
                p_request_id: request.id,
                p_notes: reason
            });

            if (error) throw error;
            alert(t('common.vendorClaim.admin.actions.successReject', 'Talep reddedildi.'));
            fetchRequests();
        } catch (error) {
            console.error('Rejection error:', error);
            alert(t('common.error', 'Hata: ') + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && requests.length === 0) {
        return <div className="admin-loading">{t('common.loading', 'Yükleniyor...')}</div>;
    }

    return (
        <div className="admin-vendors">
            <div className="admin-page-header">
                <div>
                    <h1>🛡️ {strings.title[language]}</h1>
                    <p>{strings.subtitle[language]}</p>
                </div>
            </div>

            <div className="filters-bar">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option value="all">{strings.filters.all[language]}</option>
                    <option value="pending">⏳ {strings.filters.pending[language]}</option>
                    <option value="approved">✅ {strings.filters.approved[language]}</option>
                    <option value="rejected">❌ {strings.filters.rejected[language]}</option>
                </select>
            </div>

            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <table className="vendors-table">
                    <thead>
                        <tr>
                            <th>{strings.table.business[language]}</th>
                            <th>{strings.table.claimant[language]}</th>
                            <th>{strings.table.contact[language]}</th>
                            <th>{strings.table.message[language]}</th>
                            <th>{strings.table.date[language]}</th>
                            <th>{strings.table.status[language]}</th>
                            <th>{strings.table.actions[language]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    {strings.filters.noRequests[language]}
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.vendor?.business_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {req.vendor?.slug || req.vendor_id}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{req.profile?.email || req.contact_email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>📧 {req.contact_email}</div>
                                        <div style={{ fontSize: '0.85rem' }}>📞 {req.contact_phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '200px', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                                            "{req.message || t('reviews.noMessage', 'Mesaj yok')}"
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {formatDate(req.created_at)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${req.status}`} style={{
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            backgroundColor: req.status === 'pending' ? '#fef3c7' : req.status === 'approved' ? '#dcfce7' : '#fee2e2',
                                            color: req.status === 'pending' ? '#d97706' : req.status === 'approved' ? '#16a34a' : '#dc2626'
                                        }}>
                                            {req.status === 'pending' ? strings.filters.pending[language] : req.status === 'approved' ? strings.filters.approved[language] : strings.filters.rejected[language]}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                                            {req.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(req)}
                                                        disabled={processing}
                                                        style={{
                                                            background: '#16a34a',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {processing ? '...' : strings.actions.approve[language]}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req)}
                                                        disabled={processing}
                                                        style={{
                                                            background: '#fee2e2',
                                                            color: '#dc2626',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {strings.actions.reject[language]}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminClaims;
