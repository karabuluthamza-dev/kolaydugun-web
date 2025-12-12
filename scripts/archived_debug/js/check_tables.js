
const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

async function checkTables() {
    try {
        // We can't list tables directly with anon key usually, but we can try to query 'profiles' and 'users'

        // Check profiles
        const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Range': '0-0'
            }
        });
        console.log('Profiles table status:', profilesResponse.status);

        // Check users (public table)
        const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Range': '0-0'
            }
        });
        console.log('Users table status:', usersResponse.status);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkTables();
