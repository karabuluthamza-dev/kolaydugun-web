const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAnalytics() {
    console.log('Checking google_analytics_snapshots table...');
    const { data, error, count } = await supabase
        .from('google_analytics_snapshots')
        .select('*', { count: 'exact' })
        .order('snapshot_date', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching snapshots:', error);
    } else {
        console.log(`Found ${count} snapshots.`);
        console.log('Latest snapshots:', JSON.stringify(data, null, 2));
    }

    console.log('\nChecking Edge Functions...');
    // Note: We can't easily check edge function status via client library, 
    // but we can check if there are any other logs or triggers.
}

checkAnalytics();
