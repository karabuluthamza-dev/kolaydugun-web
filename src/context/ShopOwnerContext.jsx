import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const ShopOwnerContext = createContext({});

export const useShopOwner = () => useContext(ShopOwnerContext);

export const ShopOwnerProvider = ({ children }) => {
    const { user } = useAuth();
    const [shopAccount, setShopAccount] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        rejectedProducts: 0,
        totalViews: 0,
        totalClicks: 0
    });

    // Fetch shop account when user changes
    useEffect(() => {
        if (user?.email) {
            fetchShopAccount();
        } else {
            setShopAccount(null);
            setLoading(false);
        }
    }, [user]);

    const fetchShopAccount = async () => {
        try {
            setLoading(true);

            // DEBUG LOG
            console.log('🔍 ShopOwnerContext: Fetching shop account...');
            console.log('👤 Current user:', user?.id, user?.email);

            // Get shop account by user_id or email WITH plan info
            // NOTE: Using planDetails as alias to avoid overwriting the 'plan' string column
            const { data, error } = await supabase
                .from('shop_accounts')
                .select(`
                    *,
                    planDetails:shop_plans(
                        id, name, display_name_tr, display_name_de, display_name_en,
                        product_limit, has_priority_listing, has_analytics,
                        has_featured_homepage, has_vip_badge, has_affiliate_access
                    )
                `)
                .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
                .single();

            // DEBUG LOG
            console.log('🏪 Shop account query result:', { data, error });

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error fetching shop account:', error);
            }

            if (data) {
                console.log('✅ Shop account found:', data.id, data.business_name, data.email);
                setShopAccount(data);

                // Link user_id if not already linked
                if (!data.user_id && user?.id) {
                    console.log('🔗 Linking user_id to shop account...');
                    await supabase
                        .from('shop_accounts')
                        .update({ user_id: user.id })
                        .eq('id', data.id);
                }

                await fetchProducts(data.id);
            } else {
                console.warn('⚠️ No shop account found for user:', user?.email);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (shopId) => {
        console.log('📦 Fetching products for shop_id:', shopId);
        try {
            // Basit sorgu - join olmadan
            const { data, error } = await supabase
                .from('shop_products')
                .select('*')
                .eq('shop_account_id', shopId)
                .order('created_at', { ascending: false });

            console.log('📦 Products query result:', { count: data?.length, error });

            if (error) throw error;

            const productList = data || [];
            setProducts(productList);

            console.log('📦 Products loaded:', productList.length, productList.map(p => p.name_tr));

            // Calculate stats
            setStats({
                totalProducts: productList.length,
                approvedProducts: productList.filter(p => p.status === 'approved').length,
                pendingProducts: productList.filter(p => p.status === 'pending').length,
                rejectedProducts: productList.filter(p => p.status === 'rejected').length,
                totalViews: productList.reduce((sum, p) => sum + (p.view_count || 0), 0),
                totalClicks: productList.reduce((sum, p) => sum + (p.click_count || 0), 0)
            });
        } catch (error) {
            console.error('❌ Error fetching products:', error);
        }
    };

    const refreshData = async () => {
        if (shopAccount) {
            await fetchProducts(shopAccount.id);
        }
    };

    // Check if can add more products (uses plan.product_limit or infers from plan string)
    const canAddProduct = () => {
        if (!shopAccount) return false;

        // Get limit from plan object or from plan string defaults
        let limit;
        // First check planDetails (FK join), then fall back to plan string
        if (shopAccount.planDetails && shopAccount.planDetails.id) {
            limit = shopAccount.planDetails.product_limit;
        } else {
            // Use plan string field
            const planName = shopAccount.plan || 'starter';
            const limits = { starter: 5, business: 20, premium: -1 };
            limit = limits[planName] ?? shopAccount.product_limit ?? 5;
        }

        if (limit === -1) return true; // Unlimited
        const activeProducts = products.filter(p => p.status !== 'rejected').length;
        return activeProducts < limit;
    };

    const getRemainingProducts = () => {
        if (!shopAccount) return 0;

        // Get limit from plan object or from plan string defaults
        let limit;
        // First check planDetails (FK join), then fall back to plan string
        if (shopAccount.planDetails && shopAccount.planDetails.id) {
            limit = shopAccount.planDetails.product_limit;
        } else {
            // Use plan string field
            const planName = shopAccount.plan || 'starter';
            const limits = { starter: 5, business: 20, premium: -1 };
            limit = limits[planName] ?? shopAccount.product_limit ?? 5;
        }

        if (limit === -1) return '∞';
        const activeProducts = products.filter(p => p.status !== 'rejected').length;
        return Math.max(0, limit - activeProducts);
    };

    // Check if has specific feature from plan
    // Supports both: planDetails FK join AND plan string field
    const hasFeature = (featureName) => {
        // First try: planDetails FK join (from shop_plans table)
        if (shopAccount?.planDetails && shopAccount.planDetails.id) {
            return shopAccount.planDetails[featureName] === true;
        }

        // Fallback: use plan string field (starter, business, premium)
        const planName = shopAccount?.plan || 'starter';

        // Define features for each plan (same as DB shop_plans)
        const planFeatures = {
            starter: {
                has_priority_listing: false,
                has_analytics: false,
                has_featured_homepage: false,
                has_vip_badge: false,
                has_affiliate_access: false
            },
            business: {
                has_priority_listing: true,
                has_analytics: true,
                has_featured_homepage: false,
                has_vip_badge: false,
                has_affiliate_access: false
            },
            premium: {
                has_priority_listing: true,
                has_analytics: true,
                has_featured_homepage: true,
                has_vip_badge: true,
                has_affiliate_access: true
            }
        };

        const features = planFeatures[planName] || planFeatures.starter;
        return features[featureName] === true;
    };

    // Get current plan info (name, limits, etc.)
    const getPlanInfo = () => {
        // If we have FK join with valid id
        if (shopAccount?.planDetails && shopAccount.planDetails.id) {
            return shopAccount.planDetails;
        }

        // Fallback to string-based plan
        const planName = shopAccount?.plan || 'starter';
        const planDefaults = {
            starter: { name: 'starter', display_name_tr: 'Starter', display_name_de: 'Starter', display_name_en: 'Starter', product_limit: 5 },
            business: { name: 'business', display_name_tr: 'Business', display_name_de: 'Business', display_name_en: 'Business', product_limit: 20 },
            premium: { name: 'premium', display_name_tr: 'Premium', display_name_de: 'Premium', display_name_en: 'Premium', product_limit: -1 }
        };

        return planDefaults[planName] || planDefaults.starter;
    };

    // Check if plan is expired
    const isPlanExpired = () => {
        if (!shopAccount?.plan_expires_at) return false;
        return new Date(shopAccount.plan_expires_at) < new Date();
    };

    // Get days until expiry
    const getDaysUntilExpiry = () => {
        if (!shopAccount?.plan_expires_at) return null;
        const now = new Date();
        const expiry = new Date(shopAccount.plan_expires_at);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const value = {
        shopAccount,
        products,
        stats,
        loading,
        canAddProduct,
        getRemainingProducts,
        hasFeature,
        getPlanInfo,
        isPlanExpired,
        getDaysUntilExpiry,
        refreshData,
        fetchShopAccount
    };

    return (
        <ShopOwnerContext.Provider value={value}>
            {children}
        </ShopOwnerContext.Provider>
    );
};

export default ShopOwnerContext;
