const { createClient } = require('@supabase/supabase-js');

// Use the correct Supabase URL from .env
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    console.log('\n=== Checking gallery column ===\n');

    // First, get DJ34Istanbul specifically
    const { data: dj, error: djError } = await supabase
        .from('vendors')
        .select('id, business_name, gallery')
        .ilike('business_name', '%DJ34%')
        .single();

    if (djError) {
        console.log('DJ34 query error:', djError.message);
    } else {
        console.log('DJ34Istanbul found:');
        console.log('  ID:', dj.id);
        console.log('  Name:', dj.business_name);
        console.log('  Gallery:', JSON.stringify(dj.gallery));
        console.log('  Gallery type:', typeof dj.gallery);
        console.log('  Gallery length:', dj.gallery?.length);
    }

    // Now try the filter query
    console.log('\n=== Testing HAS_IMAGE filter ===\n');

    const { data: withGallery, count, error } = await supabase
        .from('vendors')
        .select('id, business_name, gallery', { count: 'exact' })
        .not('gallery', 'eq', '[]')
        .not('gallery', 'is', null)
        .limit(10);

    if (error) {
        console.log('Filter query error:', error.message);
    } else {
        console.log('Vendors with gallery (count):', count);
        if (withGallery && withGallery.length > 0) {
            withGallery.forEach(v => {
                console.log(`  - ${v.business_name}: ${v.gallery?.length || 0} images`);
            });
        }
    }

    process.exit(0);
})();
