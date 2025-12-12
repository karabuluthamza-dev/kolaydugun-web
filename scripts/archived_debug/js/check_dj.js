
const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

async function checkDJVendor() {
    try {
        // Query vendors with category 'DJs'
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vendors?category=eq.DJs&select=user_id,business_name,deleted_at`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const data = await response.json();
        console.log('DJ Vendors:', data);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDJVendor();
