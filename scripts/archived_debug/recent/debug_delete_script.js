
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDelete() {
    // 1. Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'testcouple23@example.com',
        password: 'password123'
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    console.log('Logged in as:', authData.user.email);

    // 2. Create a dummy post
    const { data: postData, error: createError } = await supabase
        .from('posts')
        .insert([{
            title: { tr: 'Debug Post' },
            slug: 'debug-post-' + Date.now(),
            author_id: authData.user.id,
            status: 'draft'
        }])
        .select()
        .single();

    if (createError) {
        console.error('Create failed:', createError);
        return;
    }

    console.log('Created post:', postData.id);

    // 3. Delete the post
    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postData.id);

    if (deleteError) {
        console.error('DELETE FAILED:', deleteError);
        console.error('Code:', deleteError.code);
        console.error('Details:', deleteError.details);
        console.error('Message:', deleteError.message);
    } else {
        console.log('DELETE SUCCESSFUL!');
    }
}

debugDelete();
