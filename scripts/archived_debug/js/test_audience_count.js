
const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

async function testAudienceCount() {
    try {
        const payload = {
            target_type: "category",
            target_category: "DJs"
        };

        const response = await fetch(`${SUPABASE_URL}/functions/v1/get_audience_count`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Audience Count for DJs:', data);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAudienceCount();
