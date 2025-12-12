import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Vendors matching Destek/Support ---');
    const { data: vendors, error: vError } = await supabase
        .from('vendors')
        .select('id, business_name, user_id')
        .or('business_name.ilike.%Destek%,business_name.ilike.%Support%');

    if (vError) console.error(vError);
    else console.table(vendors);

    console.log('\n--- Recent Conversations ---');
    const { data: convs, error: cError } = await supabase
        .from('conversations')
        .select('id, vendor_id, user_id, lead_id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (cError) console.error(cError);
    else console.table(convs);

    if (vendors && vendors.length > 0) {
        const supportId = vendors[0].id;
        console.log(`\nChecking conversations for Support Vendor ID: ${supportId}`);
        const { data: sConvs, error: sError } = await supabase
            .from('conversations')
            .select('*')
            .eq('vendor_id', supportId);

        if (sError) console.error(sError);
        else console.log(`Found ${sConvs.length} conversations for this vendor.`);
    }
}

debug();
