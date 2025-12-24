import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSessions() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    console.log('Checking active sessions (last 5 min)...');
    const { count, error } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gt('last_activity', fiveMinutesAgo)
        .filter('session_end', 'is', null);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Active Users (SDK): ${count}`);
    }

    console.log('\nChecking total user counts by role...');
    const { data: roles } = await supabase.rpc('get_admin_analytics');
    console.log('Database Stats:', roles);
}

checkSessions();
