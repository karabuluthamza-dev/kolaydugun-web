// supabase/functions/paypal_shop_webhook/index.ts
// PayPal webhook handler for shop subscriptions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal Webhook Event Types
const SUBSCRIPTION_ACTIVATED = "BILLING.SUBSCRIPTION.ACTIVATED";
const SUBSCRIPTION_CANCELLED = "BILLING.SUBSCRIPTION.CANCELLED";
const SUBSCRIPTION_SUSPENDED = "BILLING.SUBSCRIPTION.SUSPENDED";
const SUBSCRIPTION_EXPIRED = "BILLING.SUBSCRIPTION.EXPIRED";
const PAYMENT_COMPLETED = "PAYMENT.SALE.COMPLETED";
const PAYMENT_FAILED = "BILLING.SUBSCRIPTION.PAYMENT.FAILED";

interface WebhookEvent {
    id: string;
    event_type: string;
    resource: any;
    create_time: string;
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

        const event: WebhookEvent = await req.json();
        console.log("PayPal Webhook received:", event.event_type, event.id);

        const subscriptionId = event.resource?.id || event.resource?.billing_agreement_id;

        if (!subscriptionId) {
            console.log("No subscription ID found in webhook");
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // Find shop by PayPal subscription ID
        const { data: shopData, error: shopError } = await supabaseClient
            .from("shop_accounts")
            .select("*, plan:shop_plans(*)")
            .eq("paypal_subscription_id", subscriptionId)
            .single();

        if (shopError || !shopData) {
            console.log("Shop not found for subscription:", subscriptionId);
            return new Response(JSON.stringify({ received: true, shop_not_found: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // Handle different event types
        switch (event.event_type) {
            case SUBSCRIPTION_ACTIVATED: {
                // Subscription activated - enable the plan
                const now = new Date();
                const subscriptionEnd = new Date();

                if (shopData.billing_cycle === "yearly") {
                    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
                } else {
                    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
                }

                await supabaseClient
                    .from("shop_accounts")
                    .update({
                        subscription_status: "active",
                        subscription_start: now.toISOString(),
                        subscription_end: subscriptionEnd.toISOString(),
                        // Apply plan features
                        product_limit: shopData.plan?.product_limit ?? 5,
                        is_featured: shopData.plan?.has_featured_homepage ?? false,
                        priority_order: shopData.plan?.has_priority_listing ? 100 : 0,
                    })
                    .eq("id", shopData.id);

                // Log history
                await supabaseClient
                    .from("shop_subscription_history")
                    .insert({
                        shop_id: shopData.id,
                        plan_id: shopData.plan_id,
                        action: "subscription_activated",
                        billing_cycle: shopData.billing_cycle,
                        paypal_transaction_id: event.id,
                        notes: `Subscription activated until ${subscriptionEnd.toISOString()}`,
                    });

                console.log("Subscription activated for shop:", shopData.id);
                break;
            }

            case PAYMENT_COMPLETED: {
                // Payment received - renew subscription
                const amount = parseFloat(event.resource?.amount?.total || "0");
                const transactionId = event.resource?.id;

                const subscriptionEnd = new Date(shopData.subscription_end || new Date());

                if (shopData.billing_cycle === "yearly") {
                    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
                } else {
                    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
                }

                await supabaseClient
                    .from("shop_accounts")
                    .update({
                        subscription_status: "active",
                        subscription_end: subscriptionEnd.toISOString(),
                    })
                    .eq("id", shopData.id);

                // Log history
                await supabaseClient
                    .from("shop_subscription_history")
                    .insert({
                        shop_id: shopData.id,
                        plan_id: shopData.plan_id,
                        action: "payment_received",
                        amount: amount,
                        billing_cycle: shopData.billing_cycle,
                        paypal_transaction_id: transactionId,
                        notes: `Payment received, extended until ${subscriptionEnd.toISOString()}`,
                    });

                // Create invoice
                const invoiceNumber = `KD-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
                const netAmount = amount / 1.19; // Remove 19% VAT
                const taxAmount = amount - netAmount;

                await supabaseClient
                    .from("shop_invoices")
                    .insert({
                        invoice_number: invoiceNumber,
                        shop_id: shopData.id,
                        plan_id: shopData.plan_id,
                        customer_business_name: shopData.business_name,
                        customer_email: shopData.email,
                        customer_address: shopData.address || "",
                        billing_cycle: shopData.billing_cycle,
                        period_start: new Date().toISOString().split("T")[0],
                        period_end: subscriptionEnd.toISOString().split("T")[0],
                        net_amount: netAmount.toFixed(2),
                        tax_rate: 19.00,
                        tax_amount: taxAmount.toFixed(2),
                        gross_amount: amount.toFixed(2),
                        payment_method: "paypal",
                        paypal_transaction_id: transactionId,
                        payment_status: "paid",
                        paid_at: new Date().toISOString(),
                    });

                console.log("Payment completed for shop:", shopData.id, "Amount:", amount);
                break;
            }

            case SUBSCRIPTION_CANCELLED: {
                await supabaseClient
                    .from("shop_accounts")
                    .update({
                        subscription_status: "cancelled",
                    })
                    .eq("id", shopData.id);

                await supabaseClient
                    .from("shop_subscription_history")
                    .insert({
                        shop_id: shopData.id,
                        plan_id: shopData.plan_id,
                        action: "subscription_cancelled",
                        paypal_transaction_id: event.id,
                        notes: "Subscription cancelled by user or PayPal",
                    });

                console.log("Subscription cancelled for shop:", shopData.id);
                break;
            }

            case SUBSCRIPTION_SUSPENDED:
            case PAYMENT_FAILED: {
                await supabaseClient
                    .from("shop_accounts")
                    .update({
                        subscription_status: "suspended",
                    })
                    .eq("id", shopData.id);

                await supabaseClient
                    .from("shop_subscription_history")
                    .insert({
                        shop_id: shopData.id,
                        plan_id: shopData.plan_id,
                        action: "payment_failed",
                        paypal_transaction_id: event.id,
                        notes: "Payment failed or subscription suspended",
                    });

                console.log("Subscription suspended for shop:", shopData.id);
                break;
            }

            case SUBSCRIPTION_EXPIRED: {
                // Reset to starter plan features
                const { data: starterPlan } = await supabaseClient
                    .from("shop_plans")
                    .select("id, product_limit")
                    .eq("name", "starter")
                    .single();

                await supabaseClient
                    .from("shop_accounts")
                    .update({
                        subscription_status: "expired",
                        plan_id: starterPlan?.id || null,
                        product_limit: starterPlan?.product_limit ?? 5,
                        is_featured: false,
                        priority_order: 0,
                    })
                    .eq("id", shopData.id);

                await supabaseClient
                    .from("shop_subscription_history")
                    .insert({
                        shop_id: shopData.id,
                        plan_id: shopData.plan_id,
                        action: "subscription_expired",
                        paypal_transaction_id: event.id,
                        notes: "Subscription expired, downgraded to starter",
                    });

                console.log("Subscription expired for shop:", shopData.id);
                break;
            }

            default:
                console.log("Unhandled event type:", event.event_type);
        }

        return new Response(
            JSON.stringify({ received: true, event_type: event.event_type }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
