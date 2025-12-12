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
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySoftDelete() {
    console.log('🧪 Starting Soft Delete Verification...');

    // 0. Login as Admin
    const email = 'test_admin_verification@kolaydugun.com';
    const password = 'password123';

    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('❌ Login failed:', loginError);
        return;
    }
    console.log('✅ Logged in as admin');

    // 1. Create a dummy vendor
    const vendorId = crypto.randomUUID();
    const { data: vendor, error: createError } = await supabase
        .from('vendors')
        .insert([{
            id: vendorId,
            business_name: 'Soft Delete Test ' + Date.now(),
            category: 'Düğün Mekanları',
            city: 'İstanbul'
        }])
        .select()
        .single();

    if (createError) {
        console.error('❌ Failed to create test vendor:', createError);
        return;
    }
    console.log('✅ Created test vendor:', vendor.id);

    // 2. Try Soft Delete
    console.log('🗑️ Attempting Soft Delete (update deleted_at)...');
    const { data: updateData, error: updateError } = await supabase
        .from('vendors')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', vendorId)
        .select();

    if (updateError) {
        console.error('❌ Soft Delete Failed:', updateError);
    } else {
        console.log('✅ Soft Delete Successful. Updated rows:', updateData.length);
    }

    // 3. Verify visibility
    const { data: check, error: checkError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .is('deleted_at', null); // Should return nothing

    if (check && check.length === 0) {
        console.log('✅ Verification: Vendor is hidden from standard queries.');
    } else {
        console.log('⚠️  Verification: Vendor is still visible or check failed.', check);
    }
}

verifySoftDelete();
