const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    console.log('Checking specific vendors for gallery data...\n');

    const vendorNames = ['DJ 55', 'Grup C4', 'İrem organize', 'DJ34', 'DJ ORHAN', 'Lens Foto'];

    for (const name of vendorNames) {
        const { data, error } = await supabase
            .from('vendors')
            .select('id, business_name, gallery')
            .ilike('business_name', `%${name}%`)
            .limit(1)
            .single();

        if (error) {
            console.log(`❌ ${name}: Not found or error - ${error.message}`);
        } else {
            const hasGallery = data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0;

            console.log(`\n=== ${data.business_name} ===`);
            console.log(`  ID: ${data.id}`);
            console.log(`  gallery: ${hasGallery ? `✅ ${data.gallery.length} images` : '❌ empty/null'}`);
            if (hasGallery) console.log(`  gallery[0]: ${data.gallery[0]?.substring(0, 80)}...`);
        }
    }

    // Also check how many total vendors have gallery
    const { data: allWithGallery } = await supabase
        .from('vendors')
        .select('id, business_name, gallery')
        .is('deleted_at', null)
        .not('gallery', 'is', null);

    const vendorsWithRealGallery = allWithGallery?.filter(v =>
        v.gallery && Array.isArray(v.gallery) && v.gallery.length > 0
    );

    console.log('\n\n=== SUMMARY ===');
    console.log(`Total vendors with gallery: ${vendorsWithRealGallery?.length || 0}`);
    vendorsWithRealGallery?.forEach(v => {
        console.log(`  - ${v.business_name}: ${v.gallery.length} images`);
    });

    process.exit(0);
})();
