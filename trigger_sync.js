import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/google-analytics-sync`;

async function triggerSync() {
    console.log(`Triggering sync function: ${FUNCTION_URL}`);
    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const status = response.status;
        const result = await response.json();

        console.log('Status:', status);
        console.log('Result:', JSON.stringify(result, null, 2));

        if (status === 200) {
            console.log('✅ Sync triggered successfully!');
        } else {
            console.error('❌ Sync failed or returned error.');
        }
    } catch (err) {
        console.error('❌ Error triggering sync:', err.message);
    }
}

triggerSync();
