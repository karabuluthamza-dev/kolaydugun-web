import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const testDriveLink = async () => {
    console.log('--- Testing Google Drive Link Save ---');

    // 1. Login as test user
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'rsvp_test_1763943430234@example.com',
        password: 'password123'
    });

    if (loginError) {
        console.error('Login error:', loginError);
        return;
    }

    // 2. Try to update with a Google Drive link
    const driveLink = 'https://drive.google.com/file/d/11b_example_id/view?usp=sharing';
    console.log('Attempting to save link:', driveLink);

    const { data, error } = await supabase
        .from('wedding_details')
        .update({ gallery_url: driveLink })
        .eq('user_id', user.id)
        .select();

    if (error) {
        console.error('Error saving drive link:', error);
    } else {
        console.log('Successfully saved drive link:', data);
    }
};

testDriveLink();
