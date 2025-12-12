import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugVendorState() {
    try {
        console.log('🔍 Checking vendor state...\n');

        // Get all vendors
        const { data: vendors, error: vendorsError } = await supabase
            .from('vendors')
            .select('id, business_name, credit_balance, subscription_tier')
            .limit(5);

        if (vendorsError) {
            console.error('❌ Error fetching vendors:', vendorsError);
            return;
        }

        console.log('📊 Vendors:');
        vendors.forEach(v => {
            console.log(`  - ${v.business_name || v.id}: ${v.credit_balance} credits (${v.subscription_tier})`);
        });

        // Get leads
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, contact_name, created_at')
            .limit(5);

        if (leadsError) {
            console.error('❌ Error fetching leads:', leadsError);
            return;
        }

        console.log('\n📋 Leads:');
        leads.forEach(l => {
            console.log(`  - ${l.contact_name} (${l.id})`);
        });

        // Get lead_unlocks
        const { data: unlocks, error: unlocksError } = await supabase
            .from('lead_unlocks')
            .select('vendor_id, lead_id, credits_spent, created_at')
            .limit(5);

        if (unlocksError) {
            console.error('❌ Error fetching unlocks:', unlocksError);
            return;
        }

        console.log('\n🔓 Recent Unlocks:');
        if (unlocks.length === 0) {
            console.log('  (none)');
        } else {
            unlocks.forEach(u => {
                console.log(`  - Vendor ${u.vendor_id} unlocked lead ${u.lead_id} for ${u.credits_spent} credits`);
            });
        }

        // Check system settings
        const { data: settings, error: settingsError } = await supabase
            .from('system_settings')
            .select('key, value')
            .eq('key', 'lead_unlock_cost')
            .single();

        if (settingsError) {
            console.error('❌ Error fetching settings:', settingsError);
        } else {
            console.log('\n⚙️ System Settings:');
            console.log(`  - lead_unlock_cost: ${JSON.stringify(settings.value)}`);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

debugVendorState();
