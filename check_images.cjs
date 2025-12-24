const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'http://localhost:54321',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

(async () => {
    console.log('Checking vendors with images...\n');

    // Check image column
    const { data: withImage, error: err1 } = await supabase
        .from('vendors')
        .select('id, business_name, image')
        .not('image', 'is', null)
        .neq('image', '')
        .limit(10);

    console.log('=== Vendors with IMAGE column filled ===');
    console.log('Count:', withImage?.length || 0);
    if (withImage && withImage.length > 0) {
        withImage.forEach(v => console.log(`- ${v.business_name}: ${v.image?.substring(0, 50)}...`));
    }

    // Check image_url column
    const { data: withImageUrl, error: err2 } = await supabase
        .from('vendors')
        .select('id, business_name, image_url')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .limit(10);

    console.log('\n=== Vendors with IMAGE_URL column filled ===');
    console.log('Count:', withImageUrl?.length || 0);
    if (withImageUrl && withImageUrl.length > 0) {
        withImageUrl.forEach(v => console.log(`- ${v.business_name}: ${v.image_url?.substring(0, 50)}...`));
    }

    // Check gallery column
    const { data: withGallery, error: err3 } = await supabase
        .from('vendors')
        .select('id, business_name, gallery')
        .not('gallery', 'is', null)
        .limit(10);

    console.log('\n=== Vendors with GALLERY column filled ===');
    console.log('Count:', withGallery?.length || 0);
    if (withGallery && withGallery.length > 0) {
        withGallery.forEach(v => console.log(`- ${v.business_name}: ${JSON.stringify(v.gallery)?.substring(0, 50)}...`));
    }

    process.exit(0);
})();
