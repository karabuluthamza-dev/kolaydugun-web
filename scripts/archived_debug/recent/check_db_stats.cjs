const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('vendor_imports')
        .select('category_id, status');

    if (error) {
        console.error(error);
        return;
    }

    // Group by category and status
    const stats = {};
    data.forEach(row => {
        const key = `${row.category_id || 'NULL'} | ${row.status}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    console.log('--- DB STATS ---');
    console.log('Row count:', data.length);
    console.log('Stats:', stats);
}

run();
