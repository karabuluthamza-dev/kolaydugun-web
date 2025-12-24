const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCounts() {
    const { data, error } = await supabase
        .from('vendor_imports')
        .select('category_id');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const counts = {};
    data.forEach(item => {
        const cat = item.category_id || 'Unmatched';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    console.log('Category Counts in vendor_imports:');
    console.table(Object.entries(counts).map(([cat, count]) => ({ Category: cat, Count: count })));
}

checkCounts();
