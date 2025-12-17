import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminShopCommissions.css';

const AdminShopCommissions = () => {
    usePageTitle('Mağaza Komisyonları | Admin');
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [earnings, setEarnings] = useState([]);
    const [filteredEarnings, setFilteredEarnings] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayouts: 0,
        paidPayouts: 0,
        activeReferrers: 0
    });
    const [commissionRate, setCommissionRate] = useState(10);
    const [actionMessage, setActionMessage] = useState('');

    // Date filter states
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'thisMonth', 'lastMonth', 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        fetchData();
        fetchCommissionRate();
    }, []);

    // Apply date filter when earnings or filter changes
    useEffect(() => {
        applyDateFilter();
    }, [earnings, dateFilter, customStartDate, customEndDate]);

    const applyDateFilter = () => {
        if (dateFilter === 'all') {
            setFilteredEarnings(earnings);
            return;
        }

        const now = new Date();
        let startDate, endDate;

        if (dateFilter === 'thisMonth') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (dateFilter === 'lastMonth') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate + 'T23:59:59');
        } else {
            setFilteredEarnings(earnings);
            return;
        }

        const filtered = earnings.filter(e => {
            const createdAt = new Date(e.created_at);
            return createdAt >= startDate && createdAt <= endDate;
        });
        setFilteredEarnings(filtered);
    };

    const exportToCSV = () => {
        if (filteredEarnings.length === 0) {
            alert('Dışa aktarılacak veri yok!');
            return;
        }

        const headers = ['Tarih', 'Kazanan Mağaza', 'Getirilen Mağaza', 'Satış', 'Komisyon Oranı', 'Komisyon', 'Durum'];
        const rows = filteredEarnings.map(e => [
            new Date(e.created_at).toLocaleDateString('tr-TR'),
            e.earning_shop?.business_name || 'N/A',
            e.referred_shop?.business_name || 'N/A',
            `${e.sale_amount || 0} ${e.currency || 'EUR'}`,
            `%${e.commission_rate || 10}`,
            `${e.commission_amount || 0} ${e.currency || 'EUR'}`,
            e.status === 'pending' ? 'Beklemede' : e.status === 'approved' ? 'Onaylandı' : e.status === 'paid' ? 'Ödendi' : 'İptal'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `komisyonlar_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const fetchCommissionRate = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'shop_commission_rate')
            .single();
        if (data) setCommissionRate(parseFloat(data.value) || 10);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all earnings WITHOUT join (foreign key not set up)
            const { data: earningsData, error: earningsError } = await supabase
                .from('shop_affiliate_earnings')
                .select('*')
                .order('created_at', { ascending: false });

            console.log('📊 Earnings Query Result:', { earningsData, earningsError });

            if (earningsError) {
                console.error('❌ Earnings Error:', earningsError);
            }

            if (!earningsError && earningsData) {
                // Fetch shop data separately for each earning
                const shopIds = [...new Set([
                    ...earningsData.map(e => e.earning_shop_id).filter(Boolean),
                    ...earningsData.map(e => e.referred_shop_id).filter(Boolean)
                ])];

                let shopsMap = {};
                if (shopIds.length > 0) {
                    const { data: shopsData } = await supabase
                        .from('shop_accounts')
                        .select('id, business_name, slug, affiliate_code')
                        .in('id', shopIds);

                    if (shopsData) {
                        shopsData.forEach(shop => {
                            shopsMap[shop.id] = shop;
                        });
                    }
                }

                // Attach shop info to earnings
                const enrichedEarnings = earningsData.map(e => ({
                    ...e,
                    earning_shop: shopsMap[e.earning_shop_id] || null,
                    referred_shop: shopsMap[e.referred_shop_id] || null
                }));

                setEarnings(enrichedEarnings);

                // Calculate stats
                const total = earningsData.reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0);
                const pending = earningsData.filter(e => e.status === 'pending')
                    .reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0);
                const paid = earningsData.filter(e => e.status === 'paid')
                    .reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0);
                const referrers = new Set(earningsData.map(e => e.earning_shop_id)).size;

                setStats({
                    totalEarnings: total,
                    pendingPayouts: pending,
                    paidPayouts: paid,
                    activeReferrers: referrers
                });
            }

            // Fetch subscriptions (without join for now)
            const { data: subsData } = await supabase
                .from('shop_subscriptions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            setSubscriptions(subsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveEarning = async (earningId) => {
        // Find the earning to get shop_id and amount
        const earning = earnings.find(e => e.id === earningId);

        const { error } = await supabase
            .from('shop_affiliate_earnings')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString()
            })
            .eq('id', earningId);

        if (!error) {
            showMessage('Komisyon onaylandı!', 'success');

            // Send email notification
            if (earning) {
                try {
                    await supabase.functions.invoke('send-commission-notification', {
                        body: {
                            earning_id: earningId,
                            new_status: 'approved',
                            shop_id: earning.earning_shop_id,
                            amount: earning.commission_amount,
                            currency: earning.currency || 'EUR'
                        }
                    });
                } catch (emailError) {
                    console.warn('Email notification failed:', emailError);
                }
            }

            fetchData();
        } else {
            showMessage('Hata: ' + error.message, 'error');
        }
    };

    const handleMarkAsPaid = async (earningId) => {
        // Find the earning to get shop_id and amount
        const earning = earnings.find(e => e.id === earningId);

        const { error } = await supabase
            .from('shop_affiliate_earnings')
            .update({
                status: 'paid',
                paid_at: new Date().toISOString()
            })
            .eq('id', earningId);

        if (!error) {
            showMessage('Ödeme yapıldı olarak işaretlendi!', 'success');

            // Send email notification
            if (earning) {
                try {
                    await supabase.functions.invoke('send-commission-notification', {
                        body: {
                            earning_id: earningId,
                            new_status: 'paid',
                            shop_id: earning.earning_shop_id,
                            amount: earning.commission_amount,
                            currency: earning.currency || 'EUR'
                        }
                    });
                } catch (emailError) {
                    console.warn('Email notification failed:', emailError);
                }
            }

            fetchData();
        } else {
            showMessage('Hata: ' + error.message, 'error');
        }
    };

    const handleCancelEarning = async (earningId) => {
        const { error } = await supabase
            .from('shop_affiliate_earnings')
            .update({ status: 'cancelled' })
            .eq('id', earningId);

        if (!error) {
            showMessage('Komisyon iptal edildi.', 'success');
            fetchData();
        }
    };

    const handlePayPalPayout = async (earningId) => {
        const earning = earnings.find(e => e.id === earningId);
        if (!earning) return;

        if (!window.confirm(`${earning.commission_amount} ${earning.currency || 'EUR'} tutarındaki komisyonu PayPal ile ödemek istediğinize emin misiniz?`)) {
            return;
        }

        showMessage('PayPal ödemesi işleniyor...', 'info');

        try {
            const { data, error } = await supabase.functions.invoke('paypal-payout', {
                body: { earning_id: earningId }
            });

            if (error) {
                console.group('PayPal Payout Error Details');
                console.error('Full Error Object:', error);
                console.error('Error Message:', error.message);
                if (error.context) console.error('Error Context:', error.context);
                console.groupEnd();

                // Show more specific error messages if possible
                let userMessage = error.message || 'Bilinmeyen hata';
                try {
                    // Check if error body is JSON string
                    const body = JSON.parse(error.message);
                    if (body.message) userMessage = body.message;
                } catch (e) { }

                showMessage('PayPal hatası: ' + userMessage, 'error');
                return;
            }

            if (data?.success) {
                showMessage(`✅ PayPal ödemesi başarılı! Batch ID: ${data.payout_batch_id}`, 'success');

                // Send email notification
                try {
                    await supabase.functions.invoke('send-commission-notification', {
                        body: {
                            earning_id: earningId,
                            new_status: 'paid',
                            shop_id: earning.earning_shop_id,
                            amount: earning.commission_amount,
                            currency: earning.currency || 'EUR'
                        }
                    });
                } catch (emailError) {
                    console.warn('Email notification failed:', emailError);
                }

                fetchData();
            } else {
                showMessage('PayPal ödemesi başarısız: ' + (data?.message || 'Bilinmeyen hata'), 'error');
                console.error('PayPal Error:', data);
            }
        } catch (e) {
            showMessage('PayPal bağlantı hatası: ' + e.message, 'error');
            console.error('PayPal Connection Error:', e);
        }
    };

    const showMessage = (msg, type = 'info') => {
        setActionMessage({ text: msg, type });
        setTimeout(() => setActionMessage(''), 3000);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#92400e', label: 'Beklemede' },
            approved: { bg: '#dbeafe', color: '#1e40af', label: 'Onaylandı' },
            paid: { bg: '#d1fae5', color: '#065f46', label: 'Ödendi' },
            cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'İptal' }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: s.bg,
                color: s.color
            }}>
                {s.label}
            </span>
        );
    };

    const formatCurrency = (amount, currency = 'EUR') => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-commissions">
            <div className="admin-header">
                <h1>💰 Mağaza Komisyonları</h1>
                <p>Affiliate kazançlarını ve ödemelerini yönetin</p>
            </div>

            {/* Action Message */}
            {actionMessage && (
                <div className={`action-message ${actionMessage.type}`}>
                    {actionMessage.text}
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <span className="stat-label">Toplam Komisyon</span>
                        <span className="stat-value">{formatCurrency(stats.totalEarnings)}</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <span className="stat-label">Bekleyen Ödeme</span>
                        <span className="stat-value">{formatCurrency(stats.pendingPayouts)}</span>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <span className="stat-label">Ödenen</span>
                        <span className="stat-value">{formatCurrency(stats.paidPayouts)}</span>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <span className="stat-label">Aktif Referrer</span>
                        <span className="stat-value">{stats.activeReferrers}</span>
                    </div>
                </div>
            </div>

            {/* Commission Rate Info */}
            <div className="commission-rate-box">
                <span>Güncel Komisyon Oranı: <strong>%{commissionRate}</strong></span>
                <small>(AdminConfig'den değiştirilebilir)</small>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📋 Tüm Kazançlar
                </button>
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    ⏳ Bekleyenler ({earnings.filter(e => e.status === 'pending').length})
                </button>
                <button
                    className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscriptions')}
                >
                    📦 Abonelikler
                </button>
            </div>

            {/* Date Filter & Export */}
            {(activeTab === 'overview' || activeTab === 'pending') && (
                <div className="filter-bar" style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    marginBottom: '16px',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>📅 Tarih:</label>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="all">Tümü</option>
                            <option value="thisMonth">Bu Ay</option>
                            <option value="lastMonth">Geçen Ay</option>
                            <option value="custom">Özel Tarih</option>
                        </select>
                    </div>

                    {dateFilter === 'custom' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb'
                                }}
                            />
                            <span>-</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <span style={{
                            padding: '6px 12px',
                            background: '#e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                        }}>
                            {filteredEarnings.length} kayıt
                        </span>
                        <button
                            onClick={exportToCSV}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            📥 CSV İndir
                        </button>
                    </div>
                </div>
            )}

            {/* Earnings Table */}
            {(activeTab === 'overview' || activeTab === 'pending') && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Kazanan Mağaza</th>
                                <th>Getirilen Mağaza</th>
                                <th>Satış</th>
                                <th>Komisyon</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'pending'
                                ? filteredEarnings.filter(e => e.status === 'pending')
                                : filteredEarnings
                            ).map(earning => (
                                <tr key={earning.id}>
                                    <td>{formatDate(earning.created_at)}</td>
                                    <td>
                                        <strong>{earning.earning_shop?.business_name || 'N/A'}</strong>
                                        <br />
                                        <small style={{ color: '#6b7280' }}>{earning.earning_shop?.affiliate_code}</small>
                                    </td>
                                    <td>
                                        {earning.referred_shop?.business_name || 'N/A'}
                                    </td>
                                    <td>{formatCurrency(earning.sale_amount, earning.currency)}</td>
                                    <td>
                                        <strong style={{ color: '#059669' }}>
                                            {formatCurrency(earning.commission_amount, earning.currency)}
                                        </strong>
                                        <br />
                                        <small>(%{earning.commission_rate})</small>
                                    </td>
                                    <td>{getStatusBadge(earning.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {earning.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleApproveEarning(earning.id)}
                                                    >
                                                        ✓ Onayla
                                                    </button>
                                                    <button
                                                        className="action-btn cancel"
                                                        onClick={() => handleCancelEarning(earning.id)}
                                                    >
                                                        ✕ İptal
                                                    </button>
                                                </>
                                            )}
                                            {earning.status === 'approved' && (
                                                <>
                                                    <button
                                                        className="action-btn paid"
                                                        onClick={() => handlePayPalPayout(earning.id)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
                                                            color: 'white'
                                                        }}
                                                        title="PayPal ile otomatik ödeme"
                                                    >
                                                        🅿️ PayPal
                                                    </button>
                                                    <button
                                                        className="action-btn paid"
                                                        onClick={() => handleMarkAsPaid(earning.id)}
                                                        title="Manuel olarak ödendi işaretle"
                                                    >
                                                        💰 Manuel
                                                    </button>
                                                </>
                                            )}
                                            {earning.status === 'paid' && (
                                                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                                    {formatDate(earning.paid_at)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {earnings.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                        Henüz komisyon kaydı yok
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Subscriptions Table */}
            {activeTab === 'subscriptions' && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Mağaza</th>
                                <th>Plan</th>
                                <th>Tutar</th>
                                <th>Referrer</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map(sub => (
                                <tr key={sub.id}>
                                    <td>{formatDate(sub.created_at)}</td>
                                    <td>
                                        <strong>{sub.shop?.business_name || 'N/A'}</strong>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: sub.plan === 'enterprise' ? '#8b5cf6' :
                                                sub.plan === 'pro' ? '#3b82f6' : '#10b981',
                                            color: 'white'
                                        }}>
                                            {sub.plan?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(sub.price, sub.currency)}</td>
                                    <td>
                                        {sub.referrer ? (
                                            <>
                                                {sub.referrer.business_name}
                                                <br />
                                                <small style={{ color: '#6b7280' }}>{sub.referrer.affiliate_code}</small>
                                            </>
                                        ) : (
                                            <span style={{ color: '#9ca3af' }}>Doğrudan</span>
                                        )}
                                    </td>
                                    <td>{getStatusBadge(sub.status)}</td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                        Henüz abonelik yok
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* FAQ Section */}
            <div className="faq-section">
                <h2>❓ Sıkça Sorulan Sorular</h2>

                <details className="faq-item">
                    <summary>Komisyon sistemi nasıl çalışıyor?</summary>
                    <div className="faq-content">
                        <p>1. Bir tedarikçi (A) kendi affiliate linkini paylaşır</p>
                        <p>2. Yeni bir tedarikçi (B) bu linkten başvuru yapar</p>
                        <p>3. B'nin başvurusu onaylanır ve abonelik satın alır</p>
                        <p>4. A'ya satış tutarının %{commissionRate}'u komisyon olarak yazılır</p>
                        <p>5. Admin komisyonu onaylar ve ödeme yapar</p>
                    </div>
                </details>

                <details className="faq-item">
                    <summary>Durum seçenekleri ne anlama geliyor?</summary>
                    <div className="faq-content">
                        <p><strong>Beklemede:</strong> Komisyon hesaplandı, admin onayı bekliyor</p>
                        <p><strong>Onaylandı:</strong> Admin onayladı, ödeme sırası bekliyor</p>
                        <p><strong>Ödendi:</strong> Tedarikçiye ödeme yapıldı</p>
                        <p><strong>İptal:</strong> Komisyon iptal edildi (geri ödeme, fraud vb.)</p>
                    </div>
                </details>

                <details className="faq-item">
                    <summary>Komisyon oranını nasıl değiştiririm?</summary>
                    <div className="faq-content">
                        <p>Admin Panel → Genel Ayarlar → Shop Komisyon Oranı bölümünden değiştirebilirsiniz.</p>
                        <p>Değişiklik sadece yeni komisyonları etkiler, mevcut kayıtlar değişmez.</p>
                    </div>
                </details>

                <details className="faq-item">
                    <summary>Ödemeyi nasıl yapmalıyım?</summary>
                    <div className="faq-content">
                        <p>1. "Onayla" ile komisyonu onaylayın</p>
                        <p>2. Tedarikçiye PayPal, banka havalesi veya tercih ettiğiniz yöntemle ödeme yapın</p>
                        <p>3. "Ödendi" butonuna tıklayarak durumu güncelleyin</p>
                        <p><em>Not: Ödeme sistemi manuel olarak yapılır, otomatik değildir.</em></p>
                    </div>
                </details>

                <details className="faq-item">
                    <summary>Abonelik iptal edilirse ne olur?</summary>
                    <div className="faq-content">
                        <p>Eğer tedarikçi ilk 14 gün içinde iptal ederse, ilgili komisyonu "İptal" olarak işaretleyebilirsiniz.</p>
                        <p>Zaten ödeme yapıldıysa, geri talep edebilir veya bir sonraki ödemeden düşebilirsiniz.</p>
                    </div>
                </details>

                <details className="faq-item">
                    <summary>Tablolardaki veriler nereden geliyor?</summary>
                    <div className="faq-content">
                        <p><strong>shop_affiliate_earnings:</strong> Komisyon kayıtları</p>
                        <p><strong>shop_subscriptions:</strong> Abonelik bilgileri</p>
                        <p><strong>shop_accounts:</strong> Mağaza ve referrer bilgileri</p>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default AdminShopCommissions;
