import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAnalytics() {
    console.log('Checking google_analytics_snapshots table...');
    try {
        const { data, error, count } = await supabase
            .from('google_analytics_snapshots')
            .select('*', { count: 'exact' })
            .order('snapshot_date', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching snapshots:', error);
        } else {
            console.log(`Found ${count || 0} snapshots.`);
            if (data && data.length > 0) {
                console.log('Latest snapshots:', JSON.stringify(data, null, 2));
            } else {
                console.log('Table is empty.');
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
    }

    console.log('\nChecking sync function source...');
    // We'll read the function locally in the next step.
}

checkAnalytics();
