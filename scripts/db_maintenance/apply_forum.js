import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env from root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing environment variables.');
    console.log('VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('VITE_SUPABASE_ANON_KEY:', !!process.env.VITE_SUPABASE_ANON_KEY);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationPath = path.join(rootDir, 'supabase/migrations/20251210_create_forum_system.sql');

    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Error: Migration file not found at:', migrationPath);
        process.exit(1);
    }

    console.log(`📖 Reading migration file: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Executing SQL migration...');
    console.log(`Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON (Fallback)'}`);

    // We try to use the 'exec_sql' RPC which is a common pattern in this project
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ Migration Failed:', error.message);
        console.log('\n💡 Tip: If using ANON key, "exec_sql" might be restricted. Use Service Role Key or run manually in Dashboard.');
        process.exit(1);
    } else {
        console.log('✅ Migration Applied Successfully!');
        console.log('Created tables: forum_settings, forum_categories, forum_posts, etc.');
    }
}

applyMigration();
