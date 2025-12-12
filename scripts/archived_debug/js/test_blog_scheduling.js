
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0NDI5MiwiZXhwIjoyMDc5MzIwMjkyfQ.7qPfWVPQPXNhxLNVWQxdqKXjUODHLDfhgEPDPBVuTWM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testScheduling() {
    console.log('Starting scheduled post test with SERVICE ROLE KEY...');

    const authorId = 'cc61b0f2-d0f4-46ef-a323-a0546f85e36a';
    const testSlug = `test-scheduled-post-${Date.now()}`;

    const newPost = {
        title: { tr: 'Test Scheduled Post', en: 'Test Scheduled Post', de: 'Test Scheduled Post' },
        slug: testSlug,
        status: 'scheduled',
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
        content: { tr: 'Content', en: 'Content', de: 'Content' },
        author_id: authorId
    };

    console.log('Attempting to insert:', newPost);

    const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();

    if (error) {
        console.error('❌ Insert Error:', error);
        if (error.code === '23514') {
            console.error('CRITICAL: Check constraint violation! The fix was NOT applied correctly.');
        }
    } else {
        console.log('✅ Success! Post inserted with status "scheduled".');
        console.log('Inserted Data ID:', data[0].id);

        console.log('Cleaning up...');
        const { error: delError } = await supabase.from('posts').delete().eq('id', data[0].id);
        if (delError) console.error('Error cleaning up:', delError);
        else console.log('Cleanup successful.');
    }
}

testScheduling();
