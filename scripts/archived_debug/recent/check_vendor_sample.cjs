const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendorCategories() {
    const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, category')
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- VENDORS SAMPLE ---');
    console.table(data);
}

checkVendorCategories();
