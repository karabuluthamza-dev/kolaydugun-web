
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectPolicies() {
    console.log('Fetching policies for profiles...');

    // We can't directly fetch pg_policies via JS client easily without RPC.
    // But we can try to read the profiles table as an authenticated user and see if we get data.

    // I will try to login as the test user (who is a couple) and see if they can read their own profile.
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

    console.log('Logged in. Trying to read own profile...');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error reading profile:', error);
    } else {
        console.log('Success reading profile:', data);
    }

    // Also try to read ALL profiles (which the admin check might effectively do if not careful, 
    // but the subquery `SELECT id FROM profiles WHERE role = 'admin'` needs to find the admin row).
    // Actually the subquery is `auth.uid() IN (SELECT id ...)`
    // So it needs to find the row where id = auth.uid() AND role = 'admin'.
    // So the user needs to be able to read THEIR OWN profile.
}

inspectPolicies();
