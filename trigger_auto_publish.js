
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.error('Error loading .env file', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function triggerAutoPublish() {
    console.log('Attempting to trigger auto_publish_scheduled_posts as ANONYMOUS user...');

    // This should work now if SECURITY DEFINER is set, 
    // even if we are not logged in.
    const { data, error } = await supabase.rpc('auto_publish_scheduled_posts');

    if (error) {
        console.error('❌ RPC Error:', error);
    } else {
        console.log('✅ RPC Success! Result:', data);
        if (data > 0) {
            console.log('🎉 Published ' + data + ' posts!');
        } else {
            console.log('ℹ️ No posts were due for publishing (or function failed silently).');
        }
    }
}

triggerAutoPublish();
