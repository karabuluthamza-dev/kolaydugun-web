const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function f() {
    const categories = [
        'Wedding Venues', 'Bridal Fashion', 'Hair & Make-Up', 'Wedding Photography',
        'Wedding Videography', 'Wedding Rings', 'Wedding Planners', 'Wedding Cakes',
        'Catering & Party Service', 'DJs', 'Musicians', 'Wedding Cars',
        'Flowers & Decoration', 'Groom Suits', 'Wedding Speakers (Trauredner)',
        'Invitations & Stationery', 'Photobox', 'Entertainment'
    ];
    console.log('--- Category Counts in vendor_imports ---');
    for (const cat of categories) {
        const { count, error } = await s.from('vendor_imports').select('*', { count: 'exact', head: true }).eq('category_id', cat);
        if (error) {
            console.error(`Error for ${cat}:`, error.message);
        } else {
            console.log(`${cat}: ${count}`);
        }
    }
}
f();
