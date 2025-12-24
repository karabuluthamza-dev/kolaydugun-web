const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function trigger() {
    const { error } = await supabase
        .from('scraper_status')
        .update({
            trigger_sync: new Date().toISOString(),
            target_category: 'trauringe',
            is_deep_sync: true,
            status: 'idle' // Reset status so main loop picks it up
        })
        .eq('id', 'hp24_main');

    if (error) console.error('Error triggering:', error);
    else console.log('Successfully triggered scraper for trauringe.');
}

trigger();
