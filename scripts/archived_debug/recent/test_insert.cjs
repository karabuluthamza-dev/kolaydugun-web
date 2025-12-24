const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('🧪 Testing insert into vendor_imports...');
    const { data, error } = await supabase
        .from('vendor_imports')
        .insert([{
            business_name: 'Antigravity Test Business',
            category_id: 'Wedding Venues',
            status: 'pending',
            collected_at: new Date()
        }])
        .select();

    if (error) {
        console.error('❌ Insert failed:', error.message);
        if (error.code === '42P01') console.log('TABLE DOES NOT EXIST');
    } else {
        console.log('✅ Insert successful! ID:', data[0].id);
    }
}

testInsert();
