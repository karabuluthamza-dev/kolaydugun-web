
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function inspectColumns() {
    // Check leads columns
    console.log('Inspecting leads columns...');
    const { data: leadsCols, error: leadsError } = await supabase.rpc('inspect_table_columns', { target_table: 'leads' });
    if (leadsError) console.log('leads error:', leadsError.message);
    else console.log('leads columns:', leadsCols);

    // Check profiles columns
    console.log('Inspecting profiles columns...');
    const { data: profilesCols, error: profilesError } = await supabase.rpc('inspect_table_columns', { target_table: 'profiles' });
    if (profilesError) console.log('profiles error:', profilesError.message);
    else console.log('profiles columns:', profilesCols);
}

inspectColumns();
