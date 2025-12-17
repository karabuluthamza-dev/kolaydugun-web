// supabase/functions/create_shop_subscription/index.ts
// Shop subscription oluşturma - PayPal API ile

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal API URLs
const PAYPAL_BASE_URL = Deno.env.get("PAYPAL_MODE") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

interface SubscriptionRequest {
    shop_id: string;
    plan_name: string; // starter, business, premium
    billing_cycle: string; // monthly, yearly
    return_url: string;
    cancel_url: string;
}

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials not configured");
    }

    const auth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

// Create or get PayPal product
async function getOrCreateProduct(accessToken: string): Promise<string> {
    // Check if product exists in env
    const existingProductId = Deno.env.get("PAYPAL_PRODUCT_ID");
    if (existingProductId) return existingProductId;

    // Create new product
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: "KolayDugun Shop Subscription",
            description: "Subscription plans for KolayDugun marketplace shops",
            type: "SERVICE",
            category: "SOFTWARE",
        }),
    });

    const data = await response.json();
    return data.id;
}

// Create PayPal subscription plan
async function createPayPalPlan(
    accessToken: string,
    productId: string,
    planName: string,
    price: number,
    billingCycle: string
): Promise<string> {
    const intervalUnit = billingCycle === "yearly" ? "YEAR" : "MONTH";

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        body: JSON.stringify({
            product_id: productId,
            name: `KolayDugun ${planName} - ${billingCycle}`,
            description: `${planName} plan subscription billed ${billingCycle}`,
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: intervalUnit,
                        interval_count: 1,
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0, // Unlimited
                    pricing_scheme: {
                        fixed_price: {
                            value: price.toFixed(2),
                            currency_code: "EUR",
                        },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3,
            },
        }),
    });

    const data = await response.json();
    return data.id;
}

// Create PayPal subscription
async function createPayPalSubscription(
    accessToken: string,
    planId: string,
    shopData: any,
    returnUrl: string,
    cancelUrl: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        body: JSON.stringify({
            plan_id: planId,
            subscriber: {
                name: {
                    given_name: shopData.business_name,
                },
                email_address: shopData.email,
            },
            application_context: {
                brand_name: "KolayDugun",
                locale: "de-DE",
                shipping_preference: "NO_SHIPPING",
                user_action: "SUBSCRIBE_NOW",
                return_url: returnUrl,
                cancel_url: cancelUrl,
            },
        }),
    });

    const data = await response.json();

    const approvalLink = data.links?.find((link: any) => link.rel === "approve");

    return {
        subscriptionId: data.id,
        approvalUrl: approvalLink?.href || "",
    };
}

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { shop_id, plan_name, billing_cycle, return_url, cancel_url }: SubscriptionRequest = await req.json();

        // Validate inputs
        if (!shop_id || !plan_name || !billing_cycle) {
            throw new Error("Missing required fields: shop_id, plan_name, billing_cycle");
        }

        // Get shop account
        const { data: shopData, error: shopError } = await supabaseClient
            .from("shop_accounts")
            .select("*")
            .eq("id", shop_id)
            .single();

        if (shopError || !shopData) {
            throw new Error("Shop account not found");
        }

        // Get plan details
        const { data: planData, error: planError } = await supabaseClient
            .from("shop_plans")
            .select("*")
            .eq("name", plan_name)
            .eq("is_active", true)
            .single();

        if (planError || !planData) {
            throw new Error("Plan not found or inactive");
        }

        // Calculate price based on billing cycle
        const price = billing_cycle === "yearly" ? planData.price_yearly : planData.price_monthly;

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Get or create product
        const productId = await getOrCreateProduct(accessToken);

        // Create PayPal plan
        const paypalPlanId = await createPayPalPlan(
            accessToken,
            productId,
            planData.display_name_de,
            price,
            billing_cycle
        );

        // Create subscription
        const { subscriptionId, approvalUrl } = await createPayPalSubscription(
            accessToken,
            paypalPlanId,
            shopData,
            return_url || `${Deno.env.get("SITE_URL")}/shop-panel?subscription=success`,
            cancel_url || `${Deno.env.get("SITE_URL")}/shop-panel?subscription=cancelled`
        );

        // Save pending subscription to database
        await supabaseClient
            .from("shop_accounts")
            .update({
                paypal_subscription_id: subscriptionId,
                subscription_status: "pending",
                plan_id: planData.id,
                billing_cycle: billing_cycle,
            })
            .eq("id", shop_id);

        // Log to subscription history
        await supabaseClient
            .from("shop_subscription_history")
            .insert({
                shop_id: shop_id,
                plan_id: planData.id,
                action: "subscription_created",
                amount: price,
                billing_cycle: billing_cycle,
                notes: `PayPal subscription ${subscriptionId} created, awaiting approval`,
            });

        return new Response(
            JSON.stringify({
                success: true,
                subscription_id: subscriptionId,
                approval_url: approvalUrl,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error creating subscription:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
