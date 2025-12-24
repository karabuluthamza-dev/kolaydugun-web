const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function triggerAll() {
    console.log('🔔 Triggering scraper for ALL categories...');

    // Set status to pending and target_category to 'all'
    const { error } = await supabase.from('scraper_status').update({
        status: 'pending',
        target_category: 'all',
        trigger_sync: new Date(),
        is_deep_sync: false // Normal mode is safer for bulk, but our new logic handles duplicates well
    }).eq('id', 'hp24_main');

    if (error) console.error('❌ Error triggering:', error);
    else console.log('✅ Trigger sent for ALL categories! Scraper should start cycling through them.');
}

triggerAll();
