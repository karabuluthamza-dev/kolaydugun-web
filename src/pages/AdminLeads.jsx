import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import './AdminLeads.css';

const AdminLeads = () => {
    const { t, language } = useLanguage();
    usePageTitle(t('adminPanel.leads.title', 'Talep Yönetimi (CRM)'));
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedNotes, setSavedNotes] = useState({}); // Track saved status per lead

    useEffect(() => {
        if (user) {
            fetchLeads();
        }
    }, [user]);

    const fetchLeads = async () => {
        setLoading(true);
        console.log('🔍 Fetching leads from admin panel...');

        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                category:categories(name),
                city:cities(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching leads:', error);
        }

        if (data) {
            console.log('✅ Leads fetched:', data.length, 'leads');
            setLeads(data);
        } else {
            console.warn('⚠️ No lead data returned');
        }

        setLoading(false);
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', leadId);

            if (error) throw error;

            console.log('Status updated successfully');

            // Update local state
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

        } catch (error) {
            console.error('Error updating status:', error);
            alert(t('common.error', 'Hata: ') + error.message);
        }
    };

    const updateAdminNotes = async (leadId, notes) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ admin_notes: notes })
                .eq('id', leadId);

            if (error) throw error;

            // Show saved indicator
            setSavedNotes(prev => ({ ...prev, [leadId]: true }));
            setTimeout(() => {
                setSavedNotes(prev => ({ ...prev, [leadId]: false }));
            }, 2000);

        } catch (error) {
            console.error('Error updating notes:', error);
            alert(t('common.error', 'Hata: ') + error.message);
        }
    };

    const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of lead being confirmed

    const handleDeleteClick = (leadId) => {
        setDeleteConfirm(leadId);
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const confirmDelete = async (leadId) => {
        try {
            const { data, error } = await supabase.rpc('delete_lead_admin', { lead_id: leadId });

            if (error) {
                console.error('RPC Error:', error);
                alert(t('common.error', 'Hata: ') + error.message);
                return;
            }

            if (data && data.success === false) {
                // Determine if it is a constraint error or just generic
                alert(t('common.error', 'Hata: ') + (data.error || t('common.unknownError', 'Bilinmeyen hata')));
                return;
            }

            // Success
            setLeads(leads.filter(l => l.id !== leadId));
            setDeleteConfirm(null);

        } catch (error) {
            console.error('Error deleting lead:', error);
            alert(t('common.error', 'Hata: ') + error.message);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container admin-leads-container">
            <div className="admin-leads-header">
                <h1>{t('adminPanel.leads.title', 'Talep Yönetimi (CRM)')}</h1>
                <p>{t('adminPanel.leads.subtitle', 'Talepleri takip edin, durumlarını güncelleyin ve notlar alın.')}</p>
            </div>

            {leads.length === 0 ? (
                <div className="empty-state">
                    <h3>{t('adminPanel.leads.feedback.noLeads', 'Talep yok')}</h3>
                    <p>{t('adminPanel.leads.feedback.noLeadsDesc', 'Henüz hiç talep oluşturulmamış.')}</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th style={{ width: '140px' }}>{t('adminPanel.leads.table.status', 'Durum')}</th>
                                <th>{t('adminPanel.leads.table.date', 'Tarih')}</th>
                                <th>{t('adminPanel.leads.table.details', 'İsim & Detaylar')}</th>
                                <th>{t('adminPanel.leads.table.contact', 'İletişim')}</th>
                                <th style={{ width: '300px' }}>{t('adminPanel.leads.table.adminNote', 'Admin Notu')}</th>
                                <th style={{ width: '50px' }}>{t('adminPanel.leads.table.delete', 'Sil')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id}>
                                    <td>
                                        <select
                                            className={`status-select ${lead.status || 'new'}`}
                                            value={lead.status || 'new'}
                                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                        >
                                            <option value="new">🆕 {t('adminPanel.leads.status.new', 'Yeni')}</option>
                                            <option value="contacted">📞 {t('adminPanel.leads.status.contacted', 'Arandı')}</option>
                                            <option value="quoted">📄 {t('adminPanel.leads.status.quoted', 'Teklif')}</option>
                                            <option value="won">✅ {t('adminPanel.leads.status.won', 'Anlaşıldı')}</option>
                                            <option value="lost">❌ {t('adminPanel.leads.status.lost', 'Olumsuz')}</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                            {new Date(lead.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'de-DE')}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                            {new Date(lead.created_at).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'de-DE', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{lead.contact_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            <span className="badge-outline">{lead.category?.name || '-'}</span> • {lead.city?.name || '-'}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                            <strong>{t('adminPanel.leads.budget', 'Bütçe')}:</strong> {lead.budget_min} - {lead.budget_max}
                                        </div>
                                        {lead.additional_notes && (
                                            <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#666', fontSize: '0.85rem', background: '#f5f5f5', padding: '4px', borderRadius: '4px' }}>
                                                "{lead.additional_notes}"
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <a href={`mailto:${lead.contact_email}`} className="contact-link">
                                            📧 {lead.contact_email}
                                        </a>
                                        <a href={`tel:${lead.contact_phone}`} className="contact-link">
                                            📱 {lead.contact_phone}
                                        </a>
                                    </td>
                                    <td>
                                        <div className="admin-notes-wrapper">
                                            <textarea
                                                className="admin-notes-input"
                                                value={lead.admin_notes || ''}
                                                placeholder={t('adminPanel.leads.placeholders.addNote', 'Not ekle...')}
                                                rows="3"
                                                onChange={(e) => {
                                                    // Update local state immediately for typing
                                                    setLeads(leads.map(l =>
                                                        l.id === lead.id ? { ...l, admin_notes: e.target.value } : l
                                                    ));
                                                }}
                                            />
                                            <button
                                                className="btn btn-sm btn-primary"
                                                style={{ marginTop: '8px', width: '100%' }}
                                                onClick={() => updateAdminNotes(lead.id, lead.admin_notes || '')}
                                            >
                                                💾 {t('common.save', 'Kaydet')}
                                            </button>
                                            {savedNotes[lead.id] && (
                                                <span className="note-saved-indicator">✓ {t('adminPanel.leads.feedback.saved', 'Kaydedildi')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {deleteConfirm === lead.id ? (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => confirmDelete(lead.id)}
                                                    className="btn-icon confirm-delete"
                                                    title={t('common.confirm', 'Onayla')}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                                >
                                                    {t('common.delete', 'Sil')}
                                                </button>
                                                <button
                                                    onClick={cancelDelete}
                                                    className="btn-icon cancel-delete"
                                                    title={t('common.cancel', 'İptal')}
                                                    style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                                >
                                                    {t('common.cancel', 'İptal')}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteClick(lead.id)}
                                                className="btn-icon delete"
                                                title={t('common.delete', 'Sil')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLeads;
