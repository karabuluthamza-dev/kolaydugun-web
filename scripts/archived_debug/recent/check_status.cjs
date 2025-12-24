const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: status, error } = await supabase
        .from('scraper_status')
        .select('*')
        .eq('id', 'hp24_main')
        .maybeSingle();

    if (error) console.error('Error:', error);
    else console.log('Current Status Row:', status);
}

check();
