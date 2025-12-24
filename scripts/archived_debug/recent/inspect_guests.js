import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const inspectGuestsSchema = async () => {
    console.log('--- Inspecting guests Schema ---');

    const { data, error } = await supabase
        .from('guests')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching guests:', error);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No data found to inspect columns, but query worked.');
    }
};

inspectGuestsSchema();
