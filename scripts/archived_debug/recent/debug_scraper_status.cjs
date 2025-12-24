const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkStatus() {
    const { data, error } = await supabase.from('scraper_status').select('*').eq('id', 'hp24_main').maybeSingle();
    if (error) {
        console.error(error);
        return;
    }
    console.log('--- Scraper Status ---');
    console.table(data);
}

checkStatus();
