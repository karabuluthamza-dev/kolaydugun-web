const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkVendors() {
    console.log('--- Featured Vendors with Null Categories ---');
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, business_name, category')
        .eq('is_featured', true)
        .is('category', null);

    if (vendors && vendors.length > 0) {
        console.table(vendors);
    } else {
        console.log('No featured vendors with null categories found.');
    }

    console.log('\n--- All Vendors with Null Categories (Top 10) ---');
    const { data: allVendors } = await supabase
        .from('vendors')
        .select('id, business_name, category')
        .is('category', null)
        .limit(10);
    console.table(allVendors);
}

checkVendors();
