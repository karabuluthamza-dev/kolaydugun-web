import React, { useState, useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

const CreditPackages = ({ onPurchaseSuccess }) => {
    const { t } = useLanguage();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const { data, error } = await supabase
                .from('credit_packages')
                .select('*')
                .order('price', { ascending: true });

            if (error) throw error;
            setPackages(data || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (data, pkg) => {
        console.log('✅ Payment approved:', data);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not found');

            // 1. Insert transaction
            const { error: txnError } = await supabase
                .from('transactions')
                .insert([{
                    user_id: user.id,
                    package_id: pkg.id,
                    amount: pkg.price,
                    credits_added: pkg.credits,
                    type: 'credit_purchase',
                    description: `${pkg.name} - PayPal Order ${data.orderID}`,
                    status: 'approved',
                    payment_id: data.orderID
                }]);

            if (txnError) throw txnError;

            // 2. Update credit balance
            const { data: vendor } = await supabase
                .from('vendors')
                .select('credit_balance')
                .eq('id', user.id)
                .single();

            const newBalance = (vendor?.credit_balance || 0) + pkg.credits;

            const { error: updateError } = await supabase
                .from('vendors')
                .update({ credit_balance: newBalance })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccessMessage(`✅ ${pkg.credits} kredi başarıyla yüklendi!`);
            setSelectedPackage(null);

            setTimeout(() => setSuccessMessage(''), 5000);

            if (onPurchaseSuccess) onPurchaseSuccess();

        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Ödeme işlenirken hata oluştu: ' + error.message);
        }
    };

    if (loading) return <div>{t('vendorWallet.loadingPackages')}</div>;

    return (
        <div className="credit-packages-container">
            <h3>{t('vendorWallet.packagesTitle')}</h3>

            {successMessage && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#d1e7dd',
                    color: '#0f5132',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #badbcc',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    {successMessage}
                </div>
            )}

            <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
                {packages.map(pkg => (
                    <div key={pkg.id} className="package-card" style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💎</div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                            {(() => {
                                // Map database names to translation keys
                                const nameMap = {
                                    'Başlangıç Paketi': 'starter',
                                    'Standart Paket': 'standard',
                                    'Pro Paket': 'pro',
                                    'Kurumsal Paket': 'business'
                                };
                                const key = nameMap[pkg.name] || pkg.name.toLowerCase();
                                const translated = t(`vendorWallet.packageNames.${key}`);
                                return translated.includes('vendorWallet') ? pkg.name : translated;
                            })()}
                        </h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>
                            {pkg.credits} {t('vendorWallet.credits')}
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
                            €{pkg.price}
                        </div>

                        {selectedPackage === pkg.id ? (
                            <div style={{ marginTop: '10px' }}>
                                <PayPalButtons
                                    style={{ layout: 'vertical' }}
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            purchase_units: [{
                                                amount: {
                                                    value: pkg.price.toString(),
                                                    currency_code: 'EUR'
                                                },
                                                description: `${pkg.name} - ${pkg.credits} Credits`
                                            }]
                                        });
                                    }}
                                    onApprove={(data, actions) => {
                                        return actions.order.capture().then(() => {
                                            handleApprove(data, pkg);
                                        });
                                    }}
                                    onCancel={() => setSelectedPackage(null)}
                                    onError={(err) => {
                                        console.error('PayPal Error:', err);
                                        alert('PayPal hatası: ' + err);
                                        setSelectedPackage(null);
                                    }}
                                />
                                <button
                                    onClick={() => setSelectedPackage(null)}
                                    style={{ marginTop: '10px', width: '100%', padding: '8px', cursor: 'pointer' }}
                                >
                                    İptal
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    background: 'linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                                onClick={() => setSelectedPackage(pkg.id)}
                            >
                                {t('vendorWallet.buyBtn')}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreditPackages;
