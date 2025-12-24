
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDateSave() {
    const email = 'test.user.final.v2@example.com';
    const password = 'password123'; // Assuming this is the password

    // 1. Login
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError);
        return;
    }

    console.log('Logged in as:', user.id);

    // 2. Try to update wedding_date
    const updates = {
        wedding_date: '2025-12-31',
        updated_at: new Date()
    };

    console.log('Attempting to update with:', updates);

    const { data, error } = await supabase
        .from('wedding_details')
        .update(updates)
        .eq('user_id', user.id)
        .select();

    if (error) {
        console.error('Update failed:', error);
    } else {
        console.log('Update successful:', data);
    }
}

debugDateSave();
