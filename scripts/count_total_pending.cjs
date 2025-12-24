const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function r() {
    const { count, error } = await s.from('vendor_imports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    if (error) console.error(error);
    else console.log('Total pending items:', count);
}
r();
