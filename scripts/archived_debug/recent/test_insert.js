
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const userId = 'b33471e9-e2c5-431d-99d6-1eef6b3d0402'; // Test user ID

    console.log('Attempting insert for user:', userId);

    const updates = {
        user_id: userId,
        slug: 'test-insert-slug-' + Math.floor(Math.random() * 1000),
        welcome_message: 'Test Welcome',
        is_public: true, // Testing this specific column
        venue_name: 'Test Venue'
    };

    const { data, error } = await supabase
        .from('wedding_details')
        .upsert(updates, { onConflict: 'user_id' })
        .select();

    if (error) {
        console.error('Insert Error:', error.message);
        console.error('Error Details:', error);
    } else {
        console.log('Insert Successful:', data);
    }
}

testInsert();
