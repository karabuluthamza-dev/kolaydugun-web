const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log("Fetching last 5 imports...");
    const { data, error } = await supabase
        .from('vendor_imports')
        .select('business_name, category_raw, source_url, collected_at')
        .order('collected_at', { ascending: false })
        .limit(5);

    if (error) console.error(error);
    else console.table(data);
}

check();
