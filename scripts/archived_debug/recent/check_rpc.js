
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRpc() {
    console.log('Checking for submit_rsvp RPC...');

    // We can't directly list functions easily with js client without admin, 
    // but we can try to call it with invalid data and see if we get a "function not found" error 
    // or a validation error (which means it exists).

    const { data, error } = await supabase.rpc('submit_rsvp', {
        p_slug: 'non-existent-slug',
        p_name: 'Test',
        p_email: 'test@example.com',
        p_status: 'confirmed',
        p_plus_ones: 0,
        p_message: 'Test'
    });

    if (error) {
        console.log('Error calling RPC:', error);
        if (error.code === '42883') { // Undefined function
            console.log('FAILURE: Function submit_rsvp does not exist.');
        } else {
            console.log('SUCCESS: Function exists (error was likely logic/validation related).');
        }
    } else {
        console.log('RPC called successfully (logic might have failed but function exists):', data);
    }
}

checkRpc();
