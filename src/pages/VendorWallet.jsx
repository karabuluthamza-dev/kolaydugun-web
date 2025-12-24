import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import CreditPackages from '../components/VendorDashboard/CreditPackages';
import './VendorWallet.css';

const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'EUR',
    intent: 'capture'
};

const VendorWallet = () => {
    const { t } = useLanguage();
    usePageTitle(t('vendorWallet.title'));
    const { user } = useAuth();
    const [vendorProfile, setVendorProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        setLoading(true);

        // Fetch vendor data from vendors table (not vendor_profiles)
        const { data: profile } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', user.id)
            .single();

        // Transactions
        const { data: txns } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50); // Increased limit to show more history

        setVendorProfile(profile);
        setTransactions(txns || []);
        setLoading(false);
    };

    const filteredTransactions = transactions.filter(txn => {
        if (filter === 'all') return true;
        return txn.status === filter;
    });

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={paypalOptions}>
            <div className="section container vendor-wallet-container">
                <div className="wallet-header">
                    <h1>{t('vendorWallet.title')}</h1>
                    <p>{t('vendorWallet.desc')}</p>
                </div>

                <div className="balance-card">
                    <div className="balance-icon">💰</div>
                    <div className="balance-content">
                        <h2>{t('vendorWallet.currentBalance')}</h2>
                        <p className="balance-amount">{vendorProfile?.credit_balance || 0} {t('vendorWallet.credits')}</p>
                    </div>
                </div>

                {/* Subscription Status Section */}
                <div className="subscription-status-card" style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    marginTop: '30px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0' }}>{t('vendorWallet.membershipStatus')}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`badge badge-${vendorProfile?.subscription_tier || 'free'}`} style={{ fontSize: '1rem', padding: '8px 15px' }}>
                                {vendorProfile?.subscription_tier === 'premium' ? t('vendorWallet.premiumMember') : t('vendorWallet.freeMember')}
                            </span>
                            {vendorProfile?.subscription_tier === 'premium' && vendorProfile?.subscription_end_date && (
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                    ({t('vendorWallet.expiresOn')}: {new Date(vendorProfile.subscription_end_date).toLocaleDateString('tr-TR')})
                                </span>
                            )}
                        </div>
                    </div>

                    {vendorProfile?.subscription_tier !== 'premium' && (
                        <Link to="/pricing" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            {t('vendorWallet.upgradeToPremium')}
                        </Link>
                    )}
                </div>

                <div className="credit-packages-section" style={{ marginTop: '30px' }}>
                    <CreditPackages onPurchaseSuccess={fetchWalletData} />
                </div>

                <div className="transaction-history" style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>{t('vendorWallet.history')}</h2>

                        {/* Filter Tabs */}
                        <div className="wallet-tabs">
                            <button
                                className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                {t('vendorWallet.filterAll') || 'Tümü'}
                            </button>
                            <button
                                className={`tab-btn ${filter === 'approved' ? 'active' : ''}`}
                                onClick={() => setFilter('approved')}
                            >
                                ✅ {t('vendorWallet.filterSuccess') || 'Başarılı'}
                            </button>
                            <button
                                className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                ⏳ {t('vendorWallet.filterPending') || 'Bekleyen'}
                            </button>
                            <button
                                className={`tab-btn ${filter === 'rejected' ? 'active' : ''}`}
                                onClick={() => setFilter('rejected')}
                            >
                                ❌ {t('vendorWallet.filterRejected') || 'Reddedilen'}
                            </button>
                        </div>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div className="empty-state">
                            <p>{t('vendorWallet.noTxn')}</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>{t('vendorWallet.date')}</th>
                                        <th>{t('vendorWallet.transaction')}</th>
                                        <th>{t('vendorWallet.status')}</th>
                                        <th style={{ textAlign: 'right' }}>{t('vendorWallet.amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(txn => (
                                        <tr key={txn.id} className={txn.status === 'rejected' ? 'row-rejected' : ''}>
                                            <td>
                                                {new Date(txn.created_at).toLocaleDateString('tr-TR')}
                                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>
                                                    {new Date(txn.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>
                                                    {txn.type === 'credit_purchase' ? t('vendorWallet.purchase') : t('vendorWallet.usage')}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {(() => {
                                                        // Translate package names and phrases in descriptions
                                                        let desc = txn.description;
                                                        const packageMap = {
                                                            'Başlangıç Paketi': t('vendorWallet.packageNames.starter'),
                                                            'Standart Paket': t('vendorWallet.packageNames.standard'),
                                                            'Pro Paket': t('vendorWallet.packageNames.pro'),
                                                            'Kurumsal Paket': t('vendorWallet.packageNames.business')
                                                        };
                                                        Object.entries(packageMap).forEach(([tr, localized]) => {
                                                            desc = desc.replace(tr, localized);
                                                        });
                                                        // Also translate common phrases
                                                        desc = desc.replace('satın alma talebi', t('vendorWallet.purchaseRequest'));
                                                        return desc;
                                                    })()}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${txn.status}`}>
                                                    {txn.status === 'pending' ? `⏳ ${t('vendorWallet.statusPending')}` :
                                                        txn.status === 'approved' ? `✅ ${t('vendorWallet.statusApproved')}` :
                                                            txn.status === 'rejected' ? `❌ ${t('vendorWallet.statusRejected')}` : txn.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: txn.credits_added > 0 ? '#2e7d32' : '#c62828' }}>
                                                {txn.credits_added > 0 ? '+' : ''}{txn.credits_added} {t('vendorWallet.credits')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </PayPalScriptProvider>
    );
};

export default VendorWallet;
