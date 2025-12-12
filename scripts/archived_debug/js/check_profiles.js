
const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

async function checkProfiles() {
    try {
        // Query profiles for couples
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?role=eq.couple&select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Range': '0-0',
                'Prefer': 'count=exact'
            }
        });

        // Get the content range header which contains the count
        const range = response.headers.get('content-range');
        console.log('Profiles table status:', response.status);
        console.log('Content-Range:', range);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkProfiles();
