import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking vendors table structure...');
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        console.log('Columns in vendors table:', keys);
        if (keys.includes('details')) {
            console.log('✅ "details" column EXISTS.');
            console.log('Sample details value:', data[0].details);
        } else {
            console.log('❌ "details" column is MISSING.');
        }
    } else {
        console.log('No vendors found to check.');
    }
}

checkTable();
