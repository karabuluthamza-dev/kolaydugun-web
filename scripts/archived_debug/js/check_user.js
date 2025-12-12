import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'demo_vendor_v3@test.com';
    console.log(`Checking user: ${email}`);

    // 1. Login to get ID (since we can't query auth.users directly with anon key usually, 
    // but we can try to sign in)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123'
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log(`User ID: ${userId}`);
    console.log('User Metadata:', authData.user.user_metadata);

    // 2. Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) console.error('Profile fetch error:', profileError.message);
    console.log('Profile:', profile);

    // 3. Check Vendor (using schema.sql structure which uses id as PK)
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', userId)
        .single();

    if (vendorError) console.error('Vendor fetch error (by id):', vendorError.message);
    console.log('Vendor (by id):', vendor);

    // 4. Check Vendor (using user_id if it exists)
    const { data: vendorByUserId, error: vendorByUserIdError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid error if column doesn't exist

    if (vendorByUserIdError) console.error('Vendor fetch error (by user_id):', vendorByUserIdError.message);
    console.log('Vendor (by user_id):', vendorByUserId);

    // 5. Check Vendor Profile
    const { data: vendorProfile, error: vpError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (vpError) console.error('Vendor Profile fetch error:', vpError.message);
    console.log('Vendor Profile:', vendorProfile);
}

checkUser();
