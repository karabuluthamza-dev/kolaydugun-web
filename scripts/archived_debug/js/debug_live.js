
const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

async function debugLive() {
    try {
        const userId = 'cc61b0f2-d0f4-46ef-a323-a0546f85e36a';

        console.log("Checking Admin Notifications (last 5)...");
        const adminRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_notifications?select=*&order=created_at.desc&limit=5`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const adminData = await adminRes.json();
        console.log(JSON.stringify(adminData, null, 2));

        console.log("\nChecking User Notifications for user " + userId + "...");
        const userRes = await fetch(`${SUPABASE_URL}/rest/v1/user_notifications?user_id=eq.${userId}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const userData = await userRes.json();
        console.log(JSON.stringify(userData, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

debugLive();
