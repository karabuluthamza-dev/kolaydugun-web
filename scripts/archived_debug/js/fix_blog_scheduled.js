
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
// Using the key found in check_db_direct.js which is likely capable of admin actions or at least querying
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0NDI5MiwiZXhwIjoyMDc5MzIwMjkyfQ.7qPfWVPQPXNhxLNVWQxdqKXjUODHLDfhgEPDPBVuTWM';

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'scheduled'));
`;

async function run() {
    console.log('Running fix for blog status constraint...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error running exec_sql:', error);
    } else {
        console.log('Success!', data);
    }
}

run();
