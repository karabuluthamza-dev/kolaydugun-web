
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBordoVendors() {
    const { data, error } = await supabase
        .from('vendors')
        .select('id, slug, business_name, is_claimed, is_verified, source, details')
        .ilike('business_name', '%Bordo%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Bordo vendors found:', data.length);
    data.forEach(v => {
        const isElite = v.details?.vip_demo_config?.is_elite || false;
        console.log(`\n=== ${v.business_name} ===`);
        console.log(`  ID: ${v.id}`);
        console.log(`  Slug: ${v.slug}`);
        console.log(`  Source: ${v.source}`);
        console.log(`  is_claimed: ${v.is_claimed}`);
        console.log(`  is_verified: ${v.is_verified}`);
        console.log(`  is_elite (vip_demo_config): ${isElite}`);
        console.log(`  Full details: ${JSON.stringify(v.details, null, 2)}`);
    });
}

checkBordoVendors();
