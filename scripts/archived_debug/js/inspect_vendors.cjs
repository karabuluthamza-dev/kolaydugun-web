
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectVendors() {
    console.log("Inspecting vendors...");

    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .limit(5);

    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Sample Vendors:", JSON.stringify(vendors, null, 2));
    }

    // Also check profiles with role 'vendor'
    const { count: vendorRoleCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor');

    console.log("Profiles with role 'vendor':", vendorRoleCount);
}

inspectVendors();
