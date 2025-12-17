// supabase/functions/paypal-payout/index.ts
// PayPal Payout API ile komisyon ödemesi yapar

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
const paypalMode = Deno.env.get("PAYPAL_MODE") || "sandbox";

const PAYPAL_API_BASE = paypalMode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Get PayPal Access Token
async function getPayPalAccessToken(): Promise<string> {
    const credentials = btoa(`${paypalClientId}:${paypalClientSecret}`);

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
    }

    return data.access_token;
}

// Create PayPal Payout
async function createPayout(accessToken: string, payoutData: {
    email: string;
    amount: number;
    currency: string;
    note: string;
    sender_batch_id: string;
}): Promise<any> {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            sender_batch_header: {
                sender_batch_id: payoutData.sender_batch_id,
                email_subject: "KolayDugun Komisyon Ödemesi",
                email_message: payoutData.note
            },
            items: [{
                recipient_type: "EMAIL",
                amount: {
                    value: payoutData.amount.toFixed(2),
                    currency: payoutData.currency
                },
                receiver: payoutData.email,
                note: payoutData.note,
                sender_item_id: payoutData.sender_batch_id
            }]
        })
    });

    const data = await response.json();
    return { ok: response.ok, data };
}

Deno.serve(async (req) => {
    // Logging for debug
    console.log(`[${req.method}] ${req.url}`);

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Validate PayPal credentials
        if (!paypalClientId || !paypalClientSecret) {
            return new Response(JSON.stringify({
                success: false,
                message: "PayPal credentials not configured"
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const { earning_id } = await req.json();

        if (!earning_id) {
            return new Response(JSON.stringify({
                success: false,
                message: "earning_id required"
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Get earning details
        const { data: earning, error: earningError } = await supabase
            .from('shop_affiliate_earnings')
            .select('*')
            .eq('id', earning_id)
            .single();

        if (earningError || !earning) {
            console.error("Earning Error:", earningError);
            return new Response(JSON.stringify({
                success: false,
                message: "Earning not found"
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Use RPC to bypass RLS and get data securely
        const { data: shopResult, error: rpcError } = await supabase.rpc('get_shop_paypal_email', {
            lookup_shop_id: earning.earning_shop_id
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
        }

        const shopData = shopResult && shopResult[0]; // data is array

        if (!shopData) {
            console.error(`Shop ${earning.earning_shop_id} NOT found via RPC.`);
            return new Response(JSON.stringify({
                success: false,
                message: `Shop not found: ${earning.earning_shop_id}`
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Map RPC result to expected format
        const finalShopData = {
            business_name: shopData.business_name,
            paypal_email: shopData.paypal_email
        };

        // Pass owner_email for fallback logic (which used profiles table before)
        const ownerEmail = shopData.owner_email;

        // Get PayPal email (from shop_accounts or profiles)
        let paypalEmail = finalShopData.paypal_email;

        // Logic check: if no explicit paypal email, check owner email fallback
        if (!paypalEmail) {
            console.log("No PayPal email for shop, using owner email as fallback option...");
            paypalEmail = ownerEmail;
        }

        if (!paypalEmail) {
            return new Response(JSON.stringify({
                success: false,
                message: "PayPal email not found for shop (and no owner email found)"
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        console.log(`Processing payout for: ${finalShopData.business_name} (${paypalEmail})`);

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Create unique batch ID
        const batchId = `KD-${earning_id.substring(0, 8)}-${Date.now()}`;

        // Create payout
        const payoutResult = await createPayout(accessToken, {
            email: paypalEmail,
            amount: parseFloat(earning.commission_amount),
            currency: earning.currency || "EUR",
            note: `KolayDugun affiliate komisyonu - ${finalShopData.business_name}`,
            sender_batch_id: batchId
        });

        if (payoutResult.ok) {
            // Update earning status to paid
            await supabase
                .from('shop_affiliate_earnings')
                .update({
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    payout_batch_id: batchId,
                    payout_response: payoutResult.data
                })
                .eq('id', earning_id);

            return new Response(JSON.stringify({
                success: true,
                message: "Payout successful",
                payout_batch_id: batchId,
                recipient: paypalEmail,
                amount: earning.commission_amount,
                currency: earning.currency || "EUR"
            }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: "PayPal payout failed",
                error: payoutResult.data
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

    } catch (e: any) {
        console.error("PayPal Payout Error:", e);
        return new Response(JSON.stringify({
            success: false,
            error: e.message
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
