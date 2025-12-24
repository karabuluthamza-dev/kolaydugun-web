const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyze() {
    // 1. Get all categories
    const { data: categories } = await supabase.from('categories').select('name');
    console.log('Categories in DB:', categories.map(c => c.name));

    // 2. Get distribution of categories in vendors
    const { data: vendors } = await supabase.from('vendors').select('category').is('deleted_at', null);

    const dist = {};
    vendors.forEach(v => {
        const cat = v.category || 'NULL';
        dist[cat] = (dist[cat] || 0) + 1;
    });

    console.log('Vendor Category Distribution:', dist);
}

analyze();
