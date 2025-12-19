import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

const LeadsViewer = (props) => {
    const { vendor } = props;
    const { t } = useLanguage();
    const [leads, setLeads] = useState([]);
    const [unlocks, setUnlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [savedNotes, setSavedNotes] = useState({});

    const [unlockCost, setUnlockCost] = useState(5); // Default fallback

    useEffect(() => {
        if (vendor?.id) {
            fetchLeadsAndUnlocks();
            fetchSystemSettings();
        }
    }, [vendor]);

    // Scroll to highlighted lead
    const { highlightLeadId } = props;
    useEffect(() => {
        if (highlightLeadId && leads.length > 0 && !loading) {
            const element = document.getElementById(`lead-${highlightLeadId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.border = '2px solid #e91e63'; // Highlight effect
                setTimeout(() => {
                    element.style.border = '1px solid #eee'; // Remove highlight after 3s
                }, 3000);
            }
        }
    }, [highlightLeadId, leads, loading]);

    const fetchSystemSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'lead_unlock_cost')
                .single();

            if (data?.value) {
                setUnlockCost(parseInt(data.value));
            }
        } catch (error) {
            console.error('Error fetching system settings:', error);
        }
    };

    const fetchLeadsAndUnlocks = async () => {
        try {
            // Fetch leads
            const { data: vendorLeadsData, error: leadsError } = await supabase
                .from('vendor_leads')
                .select(`
                    lead_id,
                    lead:leads (*)
                `)
                .eq('vendor_id', vendor.id)
                .order('created_at', { ascending: false });

            if (leadsError) throw leadsError;

            // Flatten the structure to match expected format
            const leadsData = vendorLeadsData?.map(vl => ({
                ...vl.lead,
                vendor_lead_id: vl.id // Keep reference if needed
            })) || [];

            // Fetch unlocks
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: unlocksData, error: unlocksError } = await supabase
                    .from('lead_unlocks')
                    .select('lead_id')
                    .eq('vendor_id', user.id);

                if (unlocksError) throw unlocksError;
                setUnlocks(unlocksData?.map(u => u.lead_id) || []);
            }

            setLeads(leadsData || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ vendor_status: newStatus })
                .eq('id', leadId);

            if (error) throw error;

            setLeads(leads.map(lead =>
                lead.id === leadId ? { ...lead, vendor_status: newStatus } : lead
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert(t('vendorLeads.alerts.statusError'));
        }
    };

    const handleNotesChange = async (leadId, newNotes) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ vendor_notes: newNotes })
                .eq('id', leadId);

            if (error) throw error;

            setSavedNotes(prev => ({ ...prev, [leadId]: true }));
            setTimeout(() => setSavedNotes(prev => ({ ...prev, [leadId]: false })), 2000);
        } catch (error) {
            console.error('Error updating notes:', error);
        }
    };

    const [confirmingUnlock, setConfirmingUnlock] = useState(null);

    const handleUnlock = async (leadId) => {
        if (confirmingUnlock !== leadId) {
            setConfirmingUnlock(leadId);
            return;
        }

        setProcessing(leadId);
        console.log('🔓 Starting unlock process for lead:', leadId);

        try {
            console.log('📞 Calling unlock_lead RPC...');
            const { data, error } = await supabase.rpc('unlock_lead', {
                p_lead_id: leadId
            });

            console.log('📦 RPC Response:', { data, error });

            if (error) {
                console.error('❌ RPC Error:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                alert('RPC Error: ' + JSON.stringify(error));
                throw error;
            }

            if (data && data.success) {
                console.log('✅ Unlock successful!', data);
                alert(t('vendorLeads.alerts.unlockSuccess') + data.new_balance);
                await fetchLeadsAndUnlocks(); // Refresh data
                setUnlocks([...unlocks, leadId]);
            } else {
                console.warn('⚠️ Unlock failed:', data);
                console.warn('Failure message:', data?.message);
                alert('Unlock failed: ' + (data?.message || 'Unknown error') + '\n\nFull response: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('💥 Unlock error:', error);
            console.error('Error stack:', error.stack);
            alert(t('vendorLeads.alerts.genericError') + ': ' + error.message);
        } finally {
            setProcessing(null);
            setConfirmingUnlock(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#e3f2fd';
            case 'contacted': return '#fff3e0';
            case 'booked': return '#e8f5e9';
            case 'lost': return '#ffebee';
            default: return '#f5f5f5';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'new': return '#1976d2';
            case 'contacted': return '#f57c00';
            case 'booked': return '#2e7d32';
            case 'lost': return '#c62828';
            default: return '#666';
        }
    };

    if (loading) return <div>{t('login.loading')}</div>;

    return (
        <div className="leads-viewer">
            <h2>{t('dashboard.inquiriesLabel')}</h2>
            {leads.length === 0 ? (
                <div className="alert-info" style={{ padding: '1rem', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1' }}>
                    <p>{t('dashboard.leads.noLeads')}</p>
                </div>
            ) : (
                <div className="leads-list">
                    {leads.map(lead => {
                        const isUnlocked = unlocks.includes(lead.id);
                        return (
                            <div
                                id={`lead-${lead.id}`}
                                key={lead.id}
                                className="lead-card"
                                style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '8px', background: '#fff' }}
                            >
                                <div className="lead-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>{lead.contact_name}</h3>
                                    <span className="lead-date" style={{ color: '#888', fontSize: '0.9rem' }}>
                                        {formatDate(lead.created_at)}
                                    </span>
                                </div>

                                <div className="lead-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="info-group">
                                        <strong>{t('vendorLeads.date')}:</strong> {lead.event_date ? formatDate(lead.event_date) : '-'}
                                    </div>
                                    <div className="info-group">
                                        <strong>{t('vendorLeads.guests')}:</strong> {lead.guest_count || '-'}
                                    </div>
                                    <div className="info-group">
                                        <strong>{t('vendorLeads.phone')}:</strong>
                                        {isUnlocked ? (
                                            <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{lead.contact_phone || lead.phone}</span>
                                        ) : (
                                            <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>0532 123 45 67</span>
                                        )}
                                    </div>
                                    <div className="info-group">
                                        <strong>{t('vendorLeads.email')}:</strong>
                                        {isUnlocked ? (
                                            <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{lead.contact_email || lead.email}</span>
                                        ) : (
                                            <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>example@email.com</span>
                                        )}
                                    </div>
                                </div>

                                <div className="lead-message" style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                                    <p style={{ margin: 0 }}>{lead.additional_notes || lead.message}</p>
                                </div>

                                {!isUnlocked && (
                                    <div className="unlock-action" style={{ marginTop: '15px', textAlign: 'center' }}>
                                        {confirmingUnlock === lead.id ? (
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleUnlock(lead.id)}
                                                    disabled={processing === lead.id}
                                                    style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                                                >
                                                    {processing === lead.id ? t('vendorLeads.processing') : `✅ ${t('common.confirm')} (${unlockCost} Kredi)`}
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setConfirmingUnlock(null)}
                                                    disabled={processing === lead.id}
                                                    style={{ backgroundColor: '#f5f5f5', color: '#333', borderColor: '#ddd' }}
                                                >
                                                    ❌ {t('common.cancel')}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleUnlock(lead.id)}
                                                disabled={processing === lead.id}
                                            >
                                                {t('vendorLeads.unlockBtn')}
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="lead-actions" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', gap: '15px' }}>
                                    <div className="status-select" style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>{t('vendorLeads.status')}</label>
                                        <select
                                            value={lead.vendor_status || 'new'}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                backgroundColor: getStatusColor(lead.vendor_status || 'new'),
                                                color: getStatusTextColor(lead.vendor_status || 'new'),
                                                fontWeight: '500'
                                            }}
                                        >
                                            <option value="new">{t('vendorLeads.statuses.new')}</option>
                                            <option value="contacted">{t('vendorLeads.statuses.contacted')}</option>
                                            <option value="booked">{t('vendorLeads.statuses.booked')}</option>
                                            <option value="lost">{t('vendorLeads.statuses.lost')}</option>
                                        </select>
                                    </div>
                                    <div className="notes-area" style={{ flex: 2 }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>{t('vendorLeads.notes')}</label>
                                        <div style={{ position: 'relative' }}>
                                            <textarea
                                                defaultValue={lead.vendor_notes || ''}
                                                onBlur={(e) => handleNotesChange(lead.id, e.target.value)}
                                                placeholder={t('vendorLeads.notesPlaceholder')}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', borderColor: '#ddd', minHeight: '40px' }}
                                            />
                                            {savedNotes[lead.id] && (
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: '-20px',
                                                    right: '0',
                                                    fontSize: '0.8rem',
                                                    color: '#2e7d32'
                                                }}>
                                                    ✓ {t('vendorLeads.saved')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LeadsViewer;
