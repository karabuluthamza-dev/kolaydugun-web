const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function trigger() {
    console.log('🔔 Manually triggering scraper for Bridal Fashion (brautkleid)...');

    // Reset status first to be sure
    await supabase.from('scraper_status').update({
        status: 'idle',
        target_category: 'all',
        is_deep_sync: false
    }).eq('id', 'hp24_main');

    // Trigger specifically for Bridal Fashion
    const { error } = await supabase.from('scraper_status').update({
        status: 'pending', // Scraper picks up 'pending' or checks trigger_sync date
        trigger_sync: new Date(),
        target_category: 'Bridal Fashion', // This maps to 'brautkleid' in our new map
        is_deep_sync: true // Force deep sync to test pagination too
    }).eq('id', 'hp24_main');

    if (error) console.error('❌ Error triggering:', error);
    else console.log('✅ Trigger sent! Watch the main scraper terminal.');
}

trigger();
