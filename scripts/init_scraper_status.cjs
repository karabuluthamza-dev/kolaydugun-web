const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function runSql() {
    console.log('🚀 Setting up scraper_status table...');

    // We use a simple select/insert because RLS might be disabled on this table anyway
    const { error: insertError } = await s.from('scraper_status').upsert({
        id: 'hp24_main',
        status: 'idle',
        trigger_sync: new Date()
    });

    if (insertError) {
        if (insertError.code === '42P01') {
            console.log('❌ TABLE DOES NOT EXIST. Please run the SQL in Supabase Editor First!');
            console.log('SQL is in: /supabase/migrations/20251221_scraper_trigger.sql');
        } else {
            console.error('Error:', insertError.message);
        }
    } else {
        console.log('✅ Scraper status initialized.');
    }
}

runSql();
