const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function f() {
    const { data, error } = await s.from('vendor_imports').select('category_id');
    if (error) { console.error(error); return; }
    const summary = data.reduce((acc, r) => {
        acc[r.category_id || 'NULL'] = (acc[r.category_id || 'NULL'] || 0) + 1;
        return acc;
    }, {});
    console.log('--- Counts per Category ---');
    console.table(summary);
}
f();
