import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopProducts.css'; // Reuse existing styles

const AdminShopApplications = () => {
    const { language } = useLanguage();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState([]);

    // Rejection modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingApp, setRejectingApp] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Plan selection for approval
    const [approvalPlan, setApprovalPlan] = useState('starter');

    const plans = {
        starter: { name: 'Starter', price: 19, limit: 5, color: '#10b981' },
        business: { name: 'Business', price: 39, limit: 20, color: '#3b82f6' },
        premium: { name: 'Premium', price: 69, limit: -1, color: '#8b5cf6' }
    };

    // Email gönderme fonksiyonu
    const sendApplicationEmail = async (type, email, businessName, plan = null, reason = null) => {
        try {
            const response = await supabase.functions.invoke('send_shop_application_email', {
                body: { type, email, businessName, plan, reason }
            });
            if (response.error) {
                console.error('Email error:', response.error);
            } else {
                console.log('Email sent:', response.data);
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            // Email hatası işlemi durdurmaz
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const fetchApplications = async () => {
        try {
            let query = supabase
                .from('shop_applications')
                .select(`
                    *,
                    referred_shop:referred_by_shop_id(business_name),
                    created_shop:created_shop_id(business_name, slug)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const generateAffiliateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // Inline quick approve - no confirmation dialog
    const handleQuickApprove = async (app) => {
        setProcessing(true);
        try {
            const slug = generateSlug(app.business_name) + '-' + Date.now().toString(36);
            const affiliateCode = generateAffiliateCode();
            const now = new Date().toISOString();
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            console.log('Creating shop account:', { email: app.email, business_name: app.business_name, slug, plan: approvalPlan });

            // Create shop account
            const { data: newShop, error: shopError } = await supabase
                .from('shop_accounts')
                .insert({
                    email: app.email,
                    business_name: app.business_name,
                    slug: slug,
                    contact_phone: app.phone || null,
                    contact_email: app.email,
                    plan: approvalPlan,
                    product_limit: plans[approvalPlan].limit,
                    is_active: true,
                    affiliate_code: affiliateCode,
                    plan_started_at: now,
                    plan_expires_at: expiresAt,
                    referred_by: app.referred_by_shop_id || null
                })
                .select()
                .single();

            if (shopError) {
                console.error('Shop creation error:', shopError);
                alert('Mağaza oluşturma hatası: ' + (shopError.message || JSON.stringify(shopError)));
                setProcessing(false);
                return;
            }

            console.log('Shop created:', newShop);

            // Update application status
            const { error: updateError } = await supabase
                .from('shop_applications')
                .update({
                    status: 'approved',
                    created_shop_id: newShop.id,
                    processed_at: now
                })
                .eq('id', app.id);

            if (updateError) {
                console.error('Application update error:', updateError);
            }

            // Record affiliate commission if referred
            if (app.referred_by_shop_id) {
                const commissionRate = 10; // %10
                const monthlyPrice = plans[approvalPlan].price;
                const commissionAmount = (monthlyPrice * commissionRate) / 100;

                await supabase.from('shop_affiliate_earnings').insert({
                    earning_shop_id: app.referred_by_shop_id,
                    earning_type: 'platform_referral',
                    referred_shop_id: newShop.id,
                    sale_amount: monthlyPrice,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    currency: 'EUR',
                    status: 'pending'
                });

                console.log(`✅ Affiliate commission recorded: ${commissionAmount}€ for shop ${app.referred_by_shop_id}`);
            }

            alert(`✅ ${app.business_name} onaylandı!\nPlan: ${plans[approvalPlan].name}\nAffiliate: ${affiliateCode}${app.referred_by_shop_id ? '\n💰 Komisyon kaydedildi!' : ''}`);

            // Kullanıcı hesabı oluştur ve şifre belirleme linki gönder
            try {
                const userResponse = await supabase.functions.invoke('create_shop_user', {
                    body: {
                        email: app.email,
                        businessName: app.business_name,
                        shopAccountId: newShop.id
                    }
                });
                if (userResponse.error) {
                    console.error('User creation error:', userResponse.error);
                } else {
                    console.log('User created and email sent:', userResponse.data);
                }
            } catch (userError) {
                console.error('Failed to create user:', userError);
                // Kullanıcı oluşturma hatası işlemi durdurmaz
            }

            fetchApplications();
        } catch (error) {
            console.error('Error:', error);
            alert('Hata: ' + (error.message || JSON.stringify(error)));
        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async (app) => {
        if (!confirm(`"${app.business_name}" başvurusunu onaylamak istediğinize emin misiniz?\n\nBu işlem yeni bir mağaza hesabı oluşturacaktır.`)) return;

        setProcessing(true);
        try {
            const slug = generateSlug(app.business_name);
            const affiliateCode = generateAffiliateCode();
            const now = new Date().toISOString();
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            // Create shop account
            const { data: newShop, error: shopError } = await supabase
                .from('shop_accounts')
                .insert({
                    email: app.email,
                    business_name: app.business_name,
                    slug: slug,
                    contact_phone: app.phone || null,
                    contact_email: app.email,
                    plan: approvalPlan,
                    product_limit: plans[approvalPlan].limit,
                    is_active: true,
                    affiliate_code: affiliateCode,
                    plan_started_at: now,
                    plan_expires_at: expiresAt
                })
                .select()
                .single();

            if (shopError) {
                console.error('Shop creation error:', shopError);
                throw shopError;
            }

            // Update application status
            const { error: updateError } = await supabase
                .from('shop_applications')
                .update({
                    status: 'approved',
                    created_shop_id: newShop.id,
                    processed_at: now
                })
                .eq('id', app.id);

            if (updateError) {
                console.error('Application update error:', updateError);
                throw updateError;
            }

            // If referred by someone, record affiliate earning (new schema)
            if (app.referred_by_shop_id) {
                const commissionRate = 10; // %10
                const monthlyPrice = plans[approvalPlan].price;
                const commissionAmount = (monthlyPrice * commissionRate) / 100;

                // Insert affiliate earning record with new schema
                await supabase.from('shop_affiliate_earnings').insert({
                    earning_shop_id: app.referred_by_shop_id,
                    earning_type: 'platform_referral',
                    referred_shop_id: newShop.id,
                    sale_amount: monthlyPrice,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    currency: 'EUR',
                    status: 'pending'
                });

                console.log(`✅ Affiliate commission recorded: ${commissionAmount}€ for shop ${app.referred_by_shop_id}`);
            }

            alert(`✅ Başvuru onaylandı!\n\nMağaza: ${app.business_name}\nPlan: ${plans[approvalPlan].name}\nSlug: ${slug}\nAffiliate Kodu: ${affiliateCode}`);
            fetchApplications();
            setShowModal(false);
        } catch (error) {
            console.error('Error approving application:', error);
            alert('Hata: ' + (error.message || JSON.stringify(error)));
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Lütfen ret sebebini girin.');
            return;
        }

        setProcessing(true);
        try {
            const { error } = await supabase
                .from('shop_applications')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                    processed_at: new Date().toISOString()
                })
                .eq('id', rejectingApp.id);

            if (error) throw error;

            alert('❌ Başvuru reddedildi.');

            // Red email'i gönder
            sendApplicationEmail('rejected', rejectingApp.email, rejectingApp.business_name, null, rejectionReason);

            setShowRejectModal(false);
            setRejectingApp(null);
            setRejectionReason('');
            fetchApplications();
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting application:', error);
            alert('Hata: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveNotes = async (app, notes) => {
        try {
            const { error } = await supabase
                .from('shop_applications')
                .update({ admin_notes: notes })
                .eq('id', app.id);
            if (error) throw error;
            fetchApplications();
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    };

    // Reddedilen başvuruyu tekrar pending yap
    const handleReactivate = async (appId) => {
        console.log('🔄 handleReactivate çağrıldı, appId:', appId);

        const confirmed = window.confirm('Bu başvuruyu tekrar değerlendirmeye almak istediğinize emin misiniz?');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('shop_applications')
                .update({
                    status: 'pending',
                    rejection_reason: null,
                    processed_at: null
                })
                .eq('id', appId);

            if (error) throw error;
            window.alert('✅ Başvuru tekrar değerlendirmeye alındı!');
            fetchApplications();
        } catch (error) {
            console.error('Error reactivating:', error);
            window.alert('❌ Hata: ' + error.message);
        }
    };

    // Toplu silme
    const handleBulkDelete = async () => {
        console.log('🗑️ handleBulkDelete çağrıldı, selectedApplications:', selectedApplications);

        if (selectedApplications.length === 0) {
            window.alert('Lütfen silmek istediğiniz başvuruları seçin.');
            return;
        }

        const confirmed = window.confirm(`${selectedApplications.length} başvuruyu silmek istediğinize emin misiniz?\n\n⚠️ Bu işlem geri alınamaz!`);
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('shop_applications')
                .delete()
                .in('id', selectedApplications);

            if (error) throw error;
            window.alert(`✅ ${selectedApplications.length} başvuru silindi!`);
            setSelectedApplications([]);
            fetchApplications();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            window.alert('❌ Toplu silme hatası: ' + error.message);
        }
    };

    // Tek başvuru silme
    const handleDeleteSingle = async (appId) => {
        console.log('🗑️ handleDeleteSingle çağrıldı, appId:', appId);

        const confirmed = window.confirm('Bu başvuruyu silmek istediğinize emin misiniz?\n\n⚠️ Bu işlem geri alınamaz!');
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('shop_applications')
                .delete()
                .eq('id', appId);

            if (error) throw error;
            window.alert('✅ Başvuru silindi!');
            fetchApplications();
        } catch (error) {
            console.error('Error deleting:', error);
            window.alert('❌ Silme hatası: ' + error.message);
        }
    };

    // Seçim toggle
    const toggleSelectApplication = (appId) => {
        setSelectedApplications(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    // Tümünü seç/kaldır
    const toggleSelectAll = () => {
        if (selectedApplications.length === filteredApplications.length) {
            setSelectedApplications([]);
        } else {
            setSelectedApplications(filteredApplications.map(a => a.id));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#d97706', text: '⏳ Bekliyor' },
            approved: { bg: '#dcfce7', color: '#16a34a', text: '✅ Onaylandı' },
            rejected: { bg: '#fee2e2', color: '#dc2626', text: '❌ Reddedildi' }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                background: s.bg,
                color: s.color,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
            }}>
                {s.text}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredApplications = applications.filter(app =>
        !searchTerm ||
        app.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = applications.filter(a => a.status === 'pending').length;
    const approvedCount = applications.filter(a => a.status === 'approved').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-products">
            <div className="admin-page-header">
                <div>
                    <h1>📋 Mağaza Başvuruları</h1>
                    <p>Yeni mağaza başvurularını inceleyin ve onaylayın</p>
                </div>
                {pendingCount > 0 && (
                    <span style={{
                        background: '#fef3c7',
                        color: '#d97706',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }}>
                        ⏳ {pendingCount} bekleyen başvuru
                    </span>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #d97706' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Bekleyen</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d97706' }}>{pendingCount}</div>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #16a34a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Onaylanan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>{approvedCount}</div>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #dc2626' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Reddedilen</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>{rejectedCount}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    placeholder="🔍 İşletme adı veya email ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, maxWidth: '300px' }}
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">Tüm Başvurular</option>
                    <option value="pending">⏳ Bekleyenler</option>
                    <option value="approved">✅ Onaylananlar</option>
                    <option value="rejected">❌ Reddedilenler</option>
                </select>
            </div>

            {/* Selection Bar */}
            {filteredApplications.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    padding: '10px 16px',
                    background: selectedApplications.length > 0 ? '#fef3c7' : '#f9fafb',
                    borderRadius: '10px',
                    border: selectedApplications.length > 0 ? '1px solid #f59e0b' : '1px solid #e5e7eb'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                            onChange={toggleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500' }}>
                            {selectedApplications.length > 0
                                ? `${selectedApplications.length} başvuru seçildi`
                                : 'Tümünü seç'}
                        </span>
                    </label>
                    {selectedApplications.length > 0 && (
                        <button
                            type="button"
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await handleBulkDelete();
                            }}
                            style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            🗑️ Seçilenleri Sil ({selectedApplications.length})
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>İşletme</th>
                            <th>Email</th>
                            <th>Telefon</th>
                            <th>İstenen Plan</th>
                            <th>Referans</th>
                            <th>Tarih</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="empty-row">Başvuru bulunamadı</td>
                            </tr>
                        ) : (
                            filteredApplications.map(app => (
                                <tr key={app.id} style={{
                                    background: selectedApplications.includes(app.id) ? '#fef3c7' : 'transparent'
                                }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedApplications.includes(app.id)}
                                            onChange={() => toggleSelectApplication(app.id)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td>
                                        <div className="product-info">
                                            <strong>{app.business_name}</strong>
                                            {app.country && <small>📍 {app.country}</small>}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>{app.email}</td>
                                    <td style={{ fontSize: '0.875rem' }}>{app.phone || '-'}</td>
                                    <td>
                                        {app.selected_plan ? (
                                            <span style={{
                                                background: app.selected_plan === 'premium' ? '#f3e8ff' : app.selected_plan === 'business' ? '#dbeafe' : '#dcfce7',
                                                color: app.selected_plan === 'premium' ? '#7c3aed' : app.selected_plan === 'business' ? '#2563eb' : '#16a34a',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {app.selected_plan === 'premium' ? '🟣' : app.selected_plan === 'business' ? '🔵' : '🟢'} {app.selected_plan}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {app.referred_by_code ? (
                                            <span style={{
                                                background: '#fef3c7',
                                                color: '#d97706',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                🔗 {app.referred_by_code}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        {formatDate(app.created_at)}
                                    </td>
                                    <td>{getStatusBadge(app.status)}</td>
                                    <td>
                                        <div className="action-buttons" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {app.status === 'pending' && (
                                                <>
                                                    <select
                                                        value={approvalPlan}
                                                        onChange={(e) => setApprovalPlan(e.target.value)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '0.75rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb'
                                                        }}
                                                    >
                                                        <option value="starter">🟢 S</option>
                                                        <option value="business">🔵 B</option>
                                                        <option value="premium">🟣 P</option>
                                                    </select>
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleQuickApprove(app)}
                                                        disabled={processing}
                                                        title="Hızlı Onayla"
                                                        style={{
                                                            background: '#16a34a',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        {processing ? '...' : '✅ Onayla'}
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => { setRejectingApp(app); setShowRejectModal(true); }}
                                                        title="Reddet"
                                                        style={{
                                                            background: '#fee2e2',
                                                            border: 'none',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        ❌
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="btn-edit"
                                                onClick={() => { setSelectedApp(app); setShowModal(true); }}
                                                title="Detay"
                                                style={{
                                                    background: '#f3f4f6',
                                                    border: 'none',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                👁️
                                            </button>

                                            {/* Yeniden Değerlendir - sadece rejected için */}
                                            {app.status === 'rejected' && (
                                                <button
                                                    type="button"
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        await handleReactivate(app.id);
                                                    }}
                                                    title="Yeniden Değerlendir"
                                                    style={{
                                                        background: '#dbeafe',
                                                        border: 'none',
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🔄
                                                </button>
                                            )}

                                            {/* Sil butonu */}
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    await handleDeleteSingle(app.id);
                                                }}
                                                title="Sil"
                                                style={{
                                                    background: '#fef2f2',
                                                    border: 'none',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail/Approval Modal */}
            {showModal && selectedApp && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Başvuru Detayı</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            {/* Status Badge */}
                            <div style={{ marginBottom: '1rem' }}>
                                {getStatusBadge(selectedApp.status)}
                                {selectedApp.processed_at && (
                                    <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                        İşlem: {formatDate(selectedApp.processed_at)}
                                    </span>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>İşletme Adı</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedApp.business_name}</div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>Ülke</label>
                                    <div>{selectedApp.country || 'DE'}</div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>Email</label>
                                    <div>{selectedApp.email}</div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>Telefon</label>
                                    <div>{selectedApp.phone || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>İstenen Plan</label>
                                    <div>
                                        {selectedApp.selected_plan ? (
                                            <span style={{
                                                background: selectedApp.selected_plan === 'premium' ? '#f3e8ff' : selectedApp.selected_plan === 'business' ? '#dbeafe' : '#dcfce7',
                                                color: selectedApp.selected_plan === 'premium' ? '#7c3aed' : selectedApp.selected_plan === 'business' ? '#2563eb' : '#16a34a',
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {selectedApp.selected_plan === 'premium' ? '🟣' : selectedApp.selected_plan === 'business' ? '🔵' : '🟢'} {selectedApp.selected_plan}
                                            </span>
                                        ) : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Product Description */}
                            {selectedApp.product_description && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>Ürün/Hizmet Açıklaması</label>
                                    <div style={{
                                        background: '#f9fafb',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        marginTop: '0.25rem'
                                    }}>
                                        {selectedApp.product_description}
                                    </div>
                                </div>
                            )}

                            {/* Affiliate Info */}
                            {selectedApp.referred_by_code && (
                                <div style={{
                                    background: '#dbeafe',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <strong>🔗 Affiliate Referans:</strong> {selectedApp.referred_by_code}
                                    {selectedApp.referred_shop && (
                                        <span> → {selectedApp.referred_shop.business_name}</span>
                                    )}
                                </div>
                            )}

                            {/* If approved - show created shop */}
                            {selectedApp.status === 'approved' && selectedApp.created_shop && (
                                <div style={{
                                    background: '#dcfce7',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <strong>✅ Oluşturulan Mağaza:</strong> {selectedApp.created_shop.business_name}
                                    <br />
                                    <small>Slug: /{selectedApp.created_shop.slug}</small>
                                </div>
                            )}

                            {/* If rejected - show reason */}
                            {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                                <div style={{
                                    background: '#fee2e2',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <strong>❌ Ret Sebebi:</strong> {selectedApp.rejection_reason}
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>Admin Notları</label>
                                <textarea
                                    defaultValue={selectedApp.admin_notes || ''}
                                    onBlur={(e) => handleSaveNotes(selectedApp, e.target.value)}
                                    placeholder="Notlarınızı buraya yazın..."
                                    rows={3}
                                    style={{ width: '100%', marginTop: '0.25rem' }}
                                />
                            </div>

                            {/* Approval Actions */}
                            {selectedApp.status === 'pending' && (
                                <div style={{
                                    background: '#f0f9ff',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #0ea5e9'
                                }}>
                                    <h4 style={{ margin: '0 0 0.75rem 0' }}>🎯 Onay İşlemi</h4>
                                    <div className="form-group">
                                        <label>Plan Seçin:</label>
                                        <select
                                            value={approvalPlan}
                                            onChange={(e) => setApprovalPlan(e.target.value)}
                                            style={{ marginTop: '0.25rem' }}
                                        >
                                            <option value="starter">🟢 Starter (19€/ay - 5 ürün)</option>
                                            <option value="business">🔵 Business (39€/ay - 20 ürün)</option>
                                            <option value="premium">🟣 Premium (69€/ay - Sınırsız)</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleApprove(selectedApp)}
                                            disabled={processing}
                                            style={{ flex: 1 }}
                                        >
                                            {processing ? '⏳ İşleniyor...' : '✅ Onayla ve Mağaza Oluştur'}
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => { setRejectingApp(selectedApp); setShowRejectModal(true); }}
                                            disabled={processing}
                                        >
                                            ❌ Reddet
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && rejectingApp && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>❌ Başvuruyu Reddet</h2>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <p>
                                <strong>{rejectingApp.business_name}</strong> başvurusunu reddetmek üzeresiniz.
                            </p>
                            <div className="form-group">
                                <label>Ret Sebebi *</label>
                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="Eksik veya yetersiz bilgi">Eksik veya yetersiz bilgi</option>
                                    <option value="Ürün/hizmet açıklaması uygun değil">Ürün/hizmet açıklaması uygun değil</option>
                                    <option value="Düğün sektörü dışı ürün/hizmet">Düğün sektörü dışı ürün/hizmet</option>
                                    <option value="Daha önce reddedilen başvuru">Daha önce reddedilen başvuru</option>
                                    <option value="İletişim bilgileri geçersiz">İletişim bilgileri geçersiz</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ek Açıklama (Opsiyonel)</label>
                                <textarea
                                    value={rejectionReason.includes('Seçiniz') ? '' : ''}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Kendi açıklamanızı yazabilirsiniz..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>İptal</button>
                            <button
                                className="btn-delete"
                                onClick={handleReject}
                                disabled={processing || !rejectionReason.trim()}
                            >
                                {processing ? '⏳ İşleniyor...' : '❌ Reddet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopApplications;
