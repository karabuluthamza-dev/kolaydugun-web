import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log('🔍 Checking google_analytics_snapshots...');
    const { data, error } = await supabase
        .from('google_analytics_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(1);

    if (error) {
        console.error('❌ Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('✅ Found Sync Data:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('⚠️ No data found in the table.');
    }
}

check();
