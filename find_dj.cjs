const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'http://localhost:54321',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

(async () => {
    console.log('Searching for DJ34Istanbul...\n');

    const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, image, image_url, gallery')
        .ilike('business_name', '%DJ34%');

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log('Found:', data?.length || 0, 'records');
    if (data && data.length > 0) {
        data.forEach(v => {
            console.log('\n--- Vendor ---');
            console.log('ID:', v.id);
            console.log('Name:', v.business_name);
            console.log('image:', v.image);
            console.log('image_url:', v.image_url);
            console.log('gallery:', JSON.stringify(v.gallery));
        });
    }

    process.exit(0);
})();
