import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBordo() {
    const { data, error } = await supabase
        .from('vendors')
        .select('business_name, source, details')
        .eq('business_name', 'Bordo Eventlocation')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Vendor:', data.business_name);
    console.log('Source:', data.source);
    console.log('VIP Config:', JSON.stringify(data.details?.vip_demo_config, null, 2));
}

checkBordo();
