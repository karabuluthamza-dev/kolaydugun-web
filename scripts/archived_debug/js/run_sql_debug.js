import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);


async function runSql(filePath) {
    try {
        const sqlPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
        console.log(`Reading SQL file from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Attempting to execute SQL via RPC "exec_sql"...');
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('RPC Error:', error);
            // Fallback: splitting statements? No, too risky.
            // Try specific known setup functions?
            console.log('Trying fallback: maybe custom function name?');
        } else {
            console.log('Success:', data);
        }

    } catch (err) {
        console.error('Script Error:', err);
    }
}

const args = process.argv.slice(2);
if (args.length > 0) {
    runSql(args[0]);
} else {
    console.error('Please provide a SQL file path.');
}

