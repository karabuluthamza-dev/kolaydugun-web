const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug');

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- EXISTING DB CATEGORIES ---');
    console.table(data);
}

checkCategories();
