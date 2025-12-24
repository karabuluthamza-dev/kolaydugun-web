const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestImports() {
    console.log('🔍 Fetching latest 10 imports...');
    const { data, error } = await supabase
        .from('vendor_imports')
        .select('id, business_name, category_id, status, collected_at')
        .order('collected_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.table(data);

    // Total counts by status
    const { data: stats, error: statsError } = await supabase
        .from('vendor_imports')
        .select('status, category_id');

    const summary = stats.reduce((acc, curr) => {
        const key = `${curr.category_id} | ${curr.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    console.log('--- Summary by Category & Status ---');
    console.table(summary);
}

checkLatestImports();
