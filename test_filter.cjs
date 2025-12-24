const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase JS SDK filter syntax...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    // Test 1: Using neq with empty array
    console.log('Test 1: query.not("gallery", "is", null).neq("gallery", [])');
    const { data: test1, count: count1, error: err1 } = await supabase
        .from('vendors')
        .select('id, business_name, gallery', { count: 'exact' })
        .not('gallery', 'is', null)
        .neq('gallery', [])
        .limit(5);

    if (err1) {
        console.log('  ERROR:', err1.message);
    } else {
        console.log('  SUCCESS! Found', count1, 'vendors with gallery');
        test1?.forEach(v => console.log('    -', v.business_name));
    }

    // Test 2: Alternative - using contains
    console.log('\nTest 2: Check if array has at least one element using RPC or filter');
    const { data: test2, count: count2, error: err2 } = await supabase
        .from('vendors')
        .select('id, business_name, gallery', { count: 'exact' })
        .not('gallery', 'is', null)
        .filter('gallery', 'neq', '[]')
        .limit(5);

    if (err2) {
        console.log('  ERROR:', err2.message);
    } else {
        console.log('  SUCCESS! Found', count2, 'vendors with gallery');
        test2?.forEach(v => console.log('    -', v.business_name));
    }

    // Test 3: Using gt operator with array length (won't work directly, just for reference)
    console.log('\nTest 3: Filter with textual contains check');
    const { data: test3, count: count3, error: err3 } = await supabase
        .from('vendors')
        .select('id, business_name, gallery', { count: 'exact' })
        .not('gallery', 'is', null)
        .not('gallery', 'cs', '[]')
        .limit(5);

    if (err3) {
        console.log('  ERROR:', err3.message);
    } else {
        console.log('  SUCCESS! Found', count3, 'vendors with gallery');
        test3?.forEach(v => console.log('    -', v.business_name));
    }

    process.exit(0);
})();
