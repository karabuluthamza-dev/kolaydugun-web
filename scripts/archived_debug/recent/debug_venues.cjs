const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function r() {
    console.log('--- Debugging Wedding Venues ---');
    const { data, error } = await s.from('vendor_imports').select('status, rejection_reason').eq('category_id', 'Wedding Venues');
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    const stats = data.reduce((acc, curr) => {
        acc[curr.status || "null"] = (acc[curr.status || "null"] || 0) + 1;
        if (curr.rejection_reason) acc["reason: " + curr.rejection_reason] = (acc["reason: " + curr.rejection_reason] || 0) + 1;
        return acc;
    }, {});
    console.log(JSON.stringify(stats, null, 2));
}
r();
