const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkIdDefault() {
    console.log('--- Checking Vendors ID Default ---');
    // We can't easily see defaults via standard JS client without RPC or getting lucky with metadata
    // But we can try to insert a record with NO fields and see the specific error or if it works.
    // Or better, query information_schema if we have permissions (anon might not).

    // Attempting a dummy insert to test ID generation
    const { data, error } = await supabase
        .from('vendors')
        .insert([{ business_name: 'ID TEST ' + Date.now() }])
        .select('id');

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Success! ID was generated:', data[0].id);
        // Delete the test record
        await supabase.from('vendors').delete().eq('id', data[0].id);
    }
}

checkIdDefault();
