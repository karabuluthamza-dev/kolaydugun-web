
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key might be limited, but let's try. 
// Actually, for admin tasks we usually need service role key, but I don't have it.
// I'll try to use the client with the user's session if possible, or just query public tables if RLS allows.
// Since I'm running this in node, I can't easily get the user's session.
// However, I can check public tables like 'profiles' and 'vendors' if they are public.

// Let's try to query 'profiles' and 'vendors' and 'vendor_profiles'.

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking data...");

    // 1. Check Admin User
    const email = 'karabulut.hamza@gmail.com';
    // We can't query auth.users directly with anon key.
    // But we can check public.profiles if it exists and syncs with auth.

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email) // Assuming email is in profiles, or we need to find by ID
        .single();

    if (profileError) {
        console.log("Error fetching profile (might not exist or RLS):", profileError.message);
    } else {
        console.log("Admin Profile:", profile);
    }

    // 2. Check Vendor Counts
    const { count: vendorCount, error: vendorError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    console.log("Vendors Table Count:", vendorCount);

    const { count: vendorProfileCount, error: vpError } = await supabase
        .from('vendor_profiles')
        .select('*', { count: 'exact', head: true });

    console.log("Vendor Profiles Table Count:", vendorProfileCount);

    // 3. Check Couple Counts (Profiles with role 'couple')
    const { count: coupleCount, error: coupleError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'couple');

    console.log("Couples (in profiles) Count:", coupleCount);
}

checkData();
