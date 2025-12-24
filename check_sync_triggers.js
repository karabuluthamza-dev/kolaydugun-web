import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTriggers() {
    console.log('Checking for cron jobs and sync triggers...');
    try {
        // Check for pg_cron jobs if available (requires permissions usually)
        const { data: crons, error: cronError } = await supabase.rpc('pg_cron_check');
        // Note: rpc might not exist, let's try a direct query if possible or common RPC names
        console.log('Cron check result:', crons || cronError?.message);

        // Check for recent function calls or logs in a custom table if it exists
        const { data: logs } = await supabase.from('sync_logs').select('*').limit(5);
        console.log('Recent sync logs:', logs);

    } catch (err) {
        console.log('Check failed:', err.message);
    }
}

checkTriggers();
