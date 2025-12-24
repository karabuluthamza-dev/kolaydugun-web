import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rnkyghovurnaizkhwgtv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
);

async function checkColumns() {
    console.log('🔍 Checking wedding_details columns...\n');

    // Try to select gallery_url
    const { data, error } = await supabase
        .from('wedding_details')
        .select('gallery_url')
        .limit(1);

    if (error) {
        console.log(`❌ Error selecting gallery_url: ${error.message}`);
        if (error.message.includes('column "gallery_url" does not exist')) {
            console.log('⚠️  Column gallery_url is MISSING!');
        }
    } else {
        console.log('✅ Column gallery_url EXISTS');
    }
}

checkColumns();
