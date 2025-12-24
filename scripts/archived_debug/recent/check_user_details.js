
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser() {
    const email = 'test1763984601@example.com';
    console.log('Checking user:', email);

    // 1. Get User ID
    // Since we can't easily query auth.users with anon key usually, we might need to sign in.
    // Let's try to sign in as this user to get their ID.
    // Password was 'password123' in the browser test.

    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123'
    });

    if (authError) {
        console.error('Auth error (cannot login as user):', authError.message);
        return;
    }

    const user = session.user;
    console.log('User ID:', user.id);

    // 2. Fetch details
    const { data: details, error: fetchError } = await supabase
        .from('wedding_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
    } else {
        console.log('Wedding Details:', details);
    }
}

checkUser();
