import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use SERVICE_ROLE_KEY if available for DDL, otherwise we might need to ask the user to run it in Supabase dashboard.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addEliteColumn() {
    console.log('Attempting to add is_elite column...');

    // Note: Standard Supabase client cannot run DDL directly unless an RPC is set up.
    // We will check if we can at least update a dummy record to see if it exists (it shouldn't yet).

    const { error } = await supabase
        .from('vendors')
        .select('is_elite')
        .limit(1);

    if (error && error.code === '42703') { // Column does not exist
        console.log('Column "is_elite" does not exist. We need to add it.');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log('ALTER TABLE vendors ADD COLUMN is_elite BOOLEAN DEFAULT FALSE;');
    } else if (error) {
        console.error('Error checking column:', error);
    } else {
        console.log('Column "is_elite" already exists.');
    }
}

addEliteColumn();
