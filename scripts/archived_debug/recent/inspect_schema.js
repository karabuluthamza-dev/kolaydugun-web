import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const inspectSchema = async () => {
    console.log('--- Inspecting wedding_details Schema ---');

    // Try to fetch one record and see keys
    const { data, error } = await supabase
        .from('wedding_details')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching wedding_details:', error);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No data found to inspect columns.');
    }
};

inspectSchema();
