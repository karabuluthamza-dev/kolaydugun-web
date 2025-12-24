const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkImportCounts() {
    const { count: pending } = await supabase.from('vendor_imports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: rejected } = await supabase.from('vendor_imports').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
    const { count: duplicate } = await supabase.from('vendor_imports').select('*', { count: 'exact', head: true }).eq('status', 'duplicate');
    const { count: approved } = await supabase.from('vendor_imports').select('*', { count: 'exact', head: true }).eq('status', 'approved');

    console.log({ pending, rejected, duplicate, approved });
}

checkImportCounts();
