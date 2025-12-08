
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env
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

async function testScheduling() {
    console.log('Logging in as temp admin...');
    const { data: { user, session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'temp_admin@kolaydugun.com',
        password: 'temp_password_123'
    });

    if (loginError) {
        console.error('Login failed:', loginError.message);
        console.log('Cannot verify without valid login.');
        return;
    }

    console.log('Login successful. User ID:', user.id);

    const testSlug = `test-scheduled-post-${Date.now()}`;
    const newPost = {
        title: { 'tr': 'Test Post' }, // Simplified
        slug: testSlug,
        status: 'scheduled',
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
        content: { 'tr': 'Content' },
        author_id: user.id
    };

    console.log('Attempting insert with status="scheduled"...');
    const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();

    if (error) {
        console.error('❌ Insert Error:', error);
        if (error.code === '23514') {
            console.error('Check constraint violation! Fix not applied.');
        } else {
            console.error('Other error:', error.code, error.message);
        }
    } else {
        console.log('✅ INSERT SUCCESSFUL! status="scheduled" accepted.');
        // Cleanup
        await supabase.from('posts').delete().eq('id', data[0].id);
        console.log('Cleanup done.');
    }
}

testScheduling();
