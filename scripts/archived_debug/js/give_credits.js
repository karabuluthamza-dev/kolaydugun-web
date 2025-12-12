import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function giveGiftCredits() {
    console.log('Starting gift credits distribution...');

    // 1. Update vendors table
    const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .update({ credit_balance: 10 })
        .or('credit_balance.is.null,credit_balance.eq.0')
        .select();

    if (vendorsError) {
        console.error('Error updating vendors:', vendorsError);
    } else {
        console.log(`Updated ${vendorsData.length} vendors in 'vendors' table.`);
    }

    // 2. Update vendor_profiles table (sync)
    const { data: profilesData, error: profilesError } = await supabase
        .from('vendor_profiles')
        .update({ credits: 10 })
        .or('credits.is.null,credits.eq.0')
        .select();

    if (profilesError) {
        console.error('Error updating vendor_profiles:', profilesError);
    } else {
        console.log(`Updated ${profilesData.length} profiles in 'vendor_profiles' table.`);
    }

    console.log('Done.');
}

giveGiftCredits();
