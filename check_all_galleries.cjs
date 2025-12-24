const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    console.log('Fetching ALL vendors and checking gallery...\n');

    // Fetch ALL vendors (use range to bypass default limit)
    let allVendors = [];
    let offset = 0;
    const batchSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('vendors')
            .select('id, business_name, gallery')
            .is('deleted_at', null)
            .range(offset, offset + batchSize - 1);

        if (error) {
            console.error('Error:', error.message);
            break;
        }

        if (!data || data.length === 0) break;
        allVendors = [...allVendors, ...data];
        offset += batchSize;

        if (data.length < batchSize) break;
    }

    console.log(`Total vendors fetched: ${allVendors.length}`);

    const vendorsWithGallery = allVendors.filter(v =>
        v.gallery && Array.isArray(v.gallery) && v.gallery.length > 0
    );

    console.log(`\nVendors with gallery: ${vendorsWithGallery.length}`);
    vendorsWithGallery.forEach(v => {
        console.log(`  - ${v.business_name}: ${v.gallery.length} images`);
    });

    process.exit(0);
})();
