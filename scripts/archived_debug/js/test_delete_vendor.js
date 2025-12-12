import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY; // Use Anon key

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    console.log('🧪 Starting Vendor Deletion Test...');

    // 0. Sign up (or sign in) a fixed user
    const email = 'test_admin_verification@kolaydugun.com';
    const password = 'password123';

    // Try sign in first
    let { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.log('Login failed, trying signup...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
        });

        if (signUpError) {
            console.error('❌ Signup failed:', signUpError);
            return;
        }
        session = signUpData.session;
        console.log('✅ Signed up as', email);
    } else {
        console.log('✅ Logged in as', email);
    }

    if (!session) {
        console.error('❌ No session established.');
        return;
    }

    // 1. Create a dummy vendor
    const vendorId = crypto.randomUUID();
    const { data: vendor, error: createError } = await supabase
        .from('vendors')
        .insert([{
            id: vendorId,
            business_name: 'Test Vendor For Deletion ' + Date.now(),
            category: 'Düğün Mekanları',
            city: 'İstanbul'
        }])
        .select()
        .single();


    if (createError) {
        console.error('❌ Failed to create test vendor:', createError);
        console.log('⚠️  NOTE: If this failed with RLS policy, you need to run the make_user_admin.sql script first!');
        return;
    }

    console.log('✅ Created test vendor:', vendor.id, vendor.business_name);

    // 2. Call force_delete_vendor
    console.log('🗑️ Calling force_delete_vendor...');
    const { error: rpcError } = await supabase.rpc('force_delete_vendor', {
        target_vendor_id: vendor.id
    });

    if (rpcError) {
        console.error('❌ RPC Failed:', rpcError);
    } else {
        console.log('✅ RPC executed successfully.');
    }

    // 3. Verify deletion
    const { data: check, error: checkError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendor.id)
        .single();

    if (checkError && checkError.code === 'PGRST116') {
        console.log('✅ VERIFICATION SUCCESS: Vendor is gone!');
    } else if (check) {
        console.error('❌ VERIFICATION FAILED: Vendor still exists!');
    } else {
        console.error('❓ Error checking vendor:', checkError);
    }
}

testDelete();
