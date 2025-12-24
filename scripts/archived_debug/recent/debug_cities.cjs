const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
    console.log('--- ALL UNMAPPED CITIES ---');
    const { data: imports } = await supabase
        .from('vendor_imports')
        .select('business_name, city_raw')
        .is('city_id', null);

    if (imports && imports.length > 0) {
        console.table(imports);
    } else {
        console.log('No unmapped cities found in database.');
    }
}

checkData();
