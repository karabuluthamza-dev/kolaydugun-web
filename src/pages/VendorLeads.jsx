import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './VendorLeads.css';

const VendorLeads = () => {
    usePageTitle('Talepler');
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendorProfile, setVendorProfile] = useState(null);

    useEffect(() => {
        if (user) {
            fetchVendorProfile();
            fetchLeads();
        }
    }, [user]);

    const fetchVendorProfile = async () => {
        const { data, error } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!error && data) {
            setVendorProfile(data);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            // 1. Get Vendor ID first (Profile ID)
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (vendorError || !vendorData) {
                console.log('Vendor not found for user');
                setLeads([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Leads using real Vendor ID
            const { data, error } = await supabase
                .from('vendor_leads')
                .select(`
                    *,
                    lead:leads(
                        *,
                        category:categories(name),
                        city:cities(name)
                    )
                `)
                .eq('vendor_id', vendorData.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setLeads(data);
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const unlockLead = async (vendorLeadId) => {
        try {
            // Faz 2: Kredi kontrolü ile unlock
            const { data, error } = await supabase
                .rpc('unlock_lead', { vendor_lead_id: vendorLeadId });

            if (error) throw error;

            if (data.success) {
                alert(`✅ Lead başarıyla açıldı! ${data.credits_spent} kredi harcandı. Yeni bakiye: ${data.new_balance}`);
                fetchLeads();
                fetchVendorProfile();
            } else {
                // Yetersiz kredi hatası
                if (data.error === 'Yetersiz kredi') {
                    const confirmLoad = window.confirm(
                        `Yetersiz kredi! Bu lead'i açmak için ${data.required} kredi gerekiyor, mevcut bakiyeniz: ${data.current}.\n\nKredi yüklemek ister misiniz?`
                    );
                    if (confirmLoad) {
                        navigate('/vendor/dashboard?tab=wallet');
                    }
                } else {
                    alert(data.error || 'Lead açılamadı');
                }
            }
        } catch (error) {
            console.error('Unlock error:', error);
            alert('Bir hata oluştu: ' + error.message);
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
        <div className="section container vendor-leads-container">
            <div className="vendor-leads-header">
                <h1>Talepler</h1>
                <p>Size eşleştirilmiş talepleri görüntüleyin ve iletişim bilgilerine erişin.</p>
            </div>

            {leads.length === 0 ? (
                <div className="empty-state">
                    <h3>Henüz talep yok</h3>
                    <p>Size uygun talepler geldiğinde burada görünecek.</p>
                </div>
            ) : (
                <div className="leads-grid">
                    {leads.map(vendorLead => {
                        const lead = vendorLead.lead;
                        const isUnlocked = vendorLead.is_unlocked;

                        return (
                            <div key={vendorLead.id} className={`lead-card ${isUnlocked ? 'unlocked' : ''}`}>
                                <div className="lead-header">
                                    <span className="lead-category">{lead.category?.name || 'Kategori'}</span>
                                    <span className="lead-city">📍 {lead.city?.name || 'Şehir'}</span>
                                </div>

                                <div className="lead-details">
                                    <div className="lead-detail-item">
                                        <strong>Tarih:</strong> {new Date(lead.event_date).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div className="lead-detail-item">
                                        <strong>Bütçe:</strong> €{lead.budget_min} - €{lead.budget_max}
                                    </div>
                                    {lead.additional_notes && (
                                        <div className="lead-detail-item">
                                            <strong>Notlar:</strong> {lead.additional_notes}
                                        </div>
                                    )}
                                </div>

                                <div className="lead-contact">
                                    {isUnlocked ? (
                                        <>
                                            <div className="contact-info">
                                                <div><strong>İsim:</strong> {lead.contact_name}</div>
                                                <div><strong>E-posta:</strong> <a href={`mailto:${lead.contact_email}`}>{lead.contact_email}</a></div>
                                                <div><strong>Telefon:</strong> <a href={`tel:${lead.contact_phone}`}>{lead.contact_phone}</a></div>
                                            </div>
                                            <span className="unlocked-badge">✓ Açıldı</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="contact-info blurred">
                                                <div><strong>İsim:</strong> ████████</div>
                                                <div><strong>E-posta:</strong> ████████@████.com</div>
                                                <div><strong>Telefon:</strong> +49 ████████</div>
                                            </div>
                                            <button
                                                className="btn btn-primary unlock-btn"
                                                onClick={() => unlockLead(vendorLead.id)}
                                            >
                                                🔓 Lead'i Aç
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="lead-footer">
                                    <small>Eşleşme: {new Date(vendorLead.created_at).toLocaleDateString('tr-TR')}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VendorLeads;
