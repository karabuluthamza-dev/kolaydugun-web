
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRsvpFlow() {
    const email = `test.rsvp.${Date.now()}@example.com`;
    const password = 'password123';
    const slug = `test-rsvp-${Date.now()}`;

    console.log(`1. Creating user: ${email}`);
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error('SignUp failed:', signUpError);
        return;
    }
    console.log('User created:', user.id);

    console.log('2. Creating wedding details with slug:', slug);
    const { error: detailsError } = await supabase
        .from('wedding_details')
        .insert([{
            user_id: user.id,
            slug: slug,
            wedding_date: '2025-06-15'
        }]);

    if (detailsError) {
        console.error('Wedding details insert failed:', detailsError);
        return;
    }

    console.log('3. Submitting RSVP via RPC...');
    const rsvpData = {
        p_slug: slug,
        p_name: 'John Doe',
        p_email: 'john@example.com',
        p_status: 'confirmed',
        p_plus_ones: 1,
        p_message: 'Can\'t wait!'
    };

    const { data: rsvpResult, error: rsvpError } = await supabase.rpc('submit_rsvp', rsvpData);

    if (rsvpError) {
        console.error('RSVP RPC failed:', rsvpError);
        return;
    }

    console.log('RSVP Result:', rsvpResult);

    if (rsvpResult.success) {
        console.log('4. Verifying RSVP in guests table...');
        const { data: guest, error: guestError } = await supabase
            .from('guests')
            .select('*')
            .eq('id', rsvpResult.guest_id)
            .single();

        if (guestError) {
            console.error('Guest fetch failed:', guestError);
        } else {
            console.log('Guest found:', guest);
            if (guest.name === 'John Doe' && guest.status === 'confirmed' && guest.is_public_rsvp === true) {
                console.log('SUCCESS: RSVP flow verified.');
            } else {
                console.log('FAILURE: Guest data mismatch.');
            }
        }
    } else {
        console.log('FAILURE: RSVP RPC returned success=false');
    }
}

testRsvpFlow();
