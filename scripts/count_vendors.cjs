const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function countVendors() {
    const { count, error } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(error);
        return;
    }

    console.log('Total rows in vendors:', count);
}

countVendors();
