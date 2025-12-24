const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function f() {
    const { data } = await s.from('vendor_imports').select('category_id, status, rejection_reason').limit(100);
    const stats = {};
    data.forEach(x => {
        const k = x.category_id || 'null';
        if (!stats[k]) stats[k] = { pending: 0, rejected: 0, reasons: new Set() };
        if (x.status === 'pending') stats[k].pending++;
        else if (x.status === 'rejected') {
            stats[k].rejected++;
            if (x.rejection_reason) stats[k].reasons.add(x.rejection_reason.split(':')[0]);
        }
    });
    const result = {};
    for (const k in stats) {
        result[k] = { pending: stats[k].pending, rejected: stats[k].rejected, reasons: Array.from(stats[k].reasons) };
    }
    console.log(JSON.stringify(result, null, 2));
}
f();
