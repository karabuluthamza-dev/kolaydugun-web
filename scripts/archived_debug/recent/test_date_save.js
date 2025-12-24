
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDateSave() {
    const email = `test.date.${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Creating user: ${email}`);

    // 1. Sign Up
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error('SignUp failed:', signUpError);
        return;
    }

    console.log('User created:', user.id);

    // 2. Insert wedding details with date
    const updates = {
        user_id: user.id,
        slug: `test-date-${Date.now()}`,
        wedding_date: '2025-12-31'
    };

    console.log('Inserting details:', updates);

    const { data, error } = await supabase
        .from('wedding_details')
        .insert([updates])
        .select();

    if (error) {
        console.error('Insert failed:', error);
    } else {
        console.log('Insert successful:', data);

        // 3. Verify fetch
        const { data: fetched, error: fetchError } = await supabase
            .from('wedding_details')
            .select('wedding_date')
            .eq('user_id', user.id)
            .single();

        if (fetchError) {
            console.error('Fetch failed:', fetchError);
        } else {
            console.log('Fetched date:', fetched.wedding_date);
            if (fetched.wedding_date === '2025-12-31') {
                console.log('SUCCESS: Date persisted correctly.');
            } else {
                console.log('FAILURE: Date did not persist.');
            }
        }
    }
}

testDateSave();
