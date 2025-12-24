const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCounts() {
    const { count: total, error: e1 } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
    const { count: active, error: e2 } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).is('deleted_at', null);
    const { count: verified, error: e3 } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_verified', true).is('deleted_at', null);
    const { count: claimed, error: e4 } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_claimed', true).is('deleted_at', null);

    console.log({
        total,
        active,
        verified,
        claimed,
        errors: { e1, e2, e3, e4 }
    });
}

checkCounts();
