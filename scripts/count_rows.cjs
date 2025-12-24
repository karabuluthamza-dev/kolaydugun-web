const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function countRows() {
    const { count, error } = await supabase
        .from('vendor_imports')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(error);
        return;
    }

    console.log('Total rows in vendor_imports:', count);
}

countRows();
