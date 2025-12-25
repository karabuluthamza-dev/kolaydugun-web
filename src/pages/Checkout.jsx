import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get billing cycle from navigation state (default to monthly if missing)
    const billingCycle = location.state?.billingCycle || 'monthly';
    const isAnnual = billingCycle === 'annual';

    // Pricing Logic
    const price = isAnnual ? "290.00" : "29.00";
    const durationDays = isAnnual ? 365 : 30;
    const planName = isAnnual ? "Premium (Yıllık)" : "Premium (Aylık)";

    // PayPal Client ID
    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR",
        intent: "capture",
    };

    const handleApprove = async (data, actions) => {
        setLoading(true);
        try {
            const order = await actions.order.capture();
            console.log("Order captured:", order);

            // 1. Get Premium Plan ID
            const { data: planData } = await supabase
                .from('subscription_plans')
                .select('id')
                .eq('name', 'premium')
                .single();

            const planId = planData?.id;

            // 2. Update Vendor Subscription in vendors table
            const { error: updateError } = await supabase
                .from('vendors')
                .update({
                    subscription_tier: 'premium',
                    subscription_end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
                    credit_balance: (user.credit_balance || 0) + (isAnnual ? 150 : 12)
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 3. Upsert into vendor_subscriptions table
            const { error: subError } = await supabase
                .from('vendor_subscriptions')
                .upsert({
                    vendor_id: user.id,
                    plan_id: planId,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
                }, { onConflict: 'vendor_id' });

            if (subError) throw subError;

            // 4. Record Transaction
            await supabase.from('transactions').insert({
                user_id: user.id,
                type: 'subscription_purchase',
                status: 'approved',
                amount: parseFloat(price),
                credits_added: isAnnual ? 150 : 12,
                description: `${planName} abonelik satın alındı. Order: ${order.id}`,
                payment_id: order.id
            });

            navigate('/vendor/dashboard', { state: { message: t('checkout.success') } });
        } catch (err) {
            console.error("Payment Error:", err);
            setError(t('checkout.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section container" style={{ maxWidth: '600px', margin: '100px auto' }}>
            <div className="checkout-card" style={{
                background: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{t('checkout.title')}</h2>

                <div className="order-summary" style={{
                    background: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{t('checkout.summary')}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{planName}</span>
                        <span style={{ fontWeight: 'bold' }}>€{price}</span>
                    </div>
                    {isAnnual && (
                        <div style={{ fontSize: '0.9rem', color: '#10b981', marginBottom: '10px' }}>
                            🎉 2 Ay Hediye (58€ Tasarruf)
                        </div>
                    )}
                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '15px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>{t('checkout.total')}</span>
                        <span>€{price}</span>
                    </div>
                </div>

                {error && (
                    <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                        style={{ layout: "vertical" }}
                        createOrder={(data, actions) => {
                            return actions.order.create({
                                purchase_units: [
                                    {
                                        amount: {
                                            value: price,
                                        },
                                        description: planName
                                    },
                                ],
                            });
                        }}
                        onApprove={handleApprove}
                        onError={(err) => {
                            console.error("PayPal Error:", err);
                            setError(t('checkout.error'));
                        }}
                    />
                </PayPalScriptProvider>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {t('checkout.skip')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
