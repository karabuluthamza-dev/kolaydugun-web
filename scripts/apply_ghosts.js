import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use Service Role if available, otherwise Anon
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- Applying Ghost Users ---');

    // Read SQL
    const sqlPath = path.resolve(__dirname, 'create_ghosts.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL...');

    // Attempt RPC first (if configured)
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('RPC Error:', error);
        console.log('If RPC fails, it might be because the function does not exist or permissions are missing.');
        console.log('Since we are inserting into auth.users, we really need the Service Role or a privileged RPC.');
    } else {
        console.log('✅ Success! Ghost users created.');
    }
}

run();
