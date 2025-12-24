
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDelete() {
    // 1. Login as admin (using the new user I created earlier who should be admin? No, I need to check if they are admin)
    // Actually, I'll try to delete as the user I created 'live.demo.fix...'
    // But first I need to make them admin.

    const email = 'live.demo.fix.1763998470875@example.com';
    const password = 'password123';

    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError);
        return;
    }

    console.log('Logged in as:', user.id);

    // 2. Create a dummy post to delete
    const { data: post, error: createError } = await supabase
        .from('posts')
        .insert([{
            title: { en: 'Delete Test' },
            slug: 'delete-test-' + Date.now(),
            author_id: user.id,
            status: 'draft'
        }])
        .select()
        .single();

    if (createError) {
        console.error('Create failed (likely RLS):', createError);
        return;
    }

    console.log('Created post:', post.id);

    // 3. Try to delete it
    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

    if (deleteError) {
        console.error('Delete failed:', deleteError);
    } else {
        console.log('Delete successful!');
    }
}

debugDelete();
