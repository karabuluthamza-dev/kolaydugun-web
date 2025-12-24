
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Try to load .env manually since we are in a sub-script
const envPath = path.resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    console.log('--- Categories in categories table ---');
    const { data: cats } = await supabase.from('categories').select('name');
    console.log(cats.map(c => c.name));

    console.log('\n--- Vendor Counts by Category ---');
    const { data: vendors } = await supabase.from('vendors').select('category').is('deleted_at', null);

    const counts = {};
    vendors.forEach(v => {
        const cat = v.category || 'NULL';
        counts[cat] = (counts[cat] || 0) + 1;
    });
    console.log(counts);

    console.log('\n--- Specific Translation Keys ---');
    const { data: specTrans } = await supabase.from('translations').select('key, en, de, tr').or('key.eq.common.vendors,key.eq.common.vendor');
    console.log(specTrans);
}

debug();
