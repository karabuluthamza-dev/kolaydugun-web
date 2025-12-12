import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendorCounts() {
    console.log('Checking vendor counts...\n');

    // Check vendor_profiles table
    const { count: profileCount, error: profileError } = await supabase
        .from('vendor_profiles')
        .select('*', { count: 'exact', head: true });

    console.log('vendor_profiles table:');
    if (profileError) {
        console.log('  ❌ Error:', profileError.message);
    } else {
        console.log('  ✅ Total count:', profileCount);
    }

    // Check vendors table
    const { count: vendorCount, error: vendorError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    console.log('\nvendors table:');
    if (vendorError) {
        console.log('  ❌ Error:', vendorError.message);
    } else {
        console.log('  ✅ Total count:', vendorCount);
    }

    // Get sample data from vendor_profiles
    const { data: profiles } = await supabase
        .from('vendor_profiles')
        .select('id, vendor_id, plan_type')
        .limit(5);

    console.log('\nSample vendor_profiles:');
    if (profiles && profiles.length > 0) {
        profiles.forEach(p => {
            console.log(`  - ID: ${p.id}, Plan: ${p.plan_type || 'N/A'}`);
        });
    } else {
        console.log('  No data found');
    }

    // Get sample data from vendors
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, business_name, subscription_tier')
        .limit(5);

    console.log('\nSample vendors:');
    if (vendors && vendors.length > 0) {
        vendors.forEach(v => {
            console.log(`  - ${v.business_name}, Tier: ${v.subscription_tier || 'free'}`);
        });
    } else {
        console.log('  No data found');
    }
}

checkVendorCounts();
