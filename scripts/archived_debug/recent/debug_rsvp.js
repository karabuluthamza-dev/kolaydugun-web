import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Manually load env vars since we're not using the --env-file flag here for compatibility if needed, 
// but actually I'll use the same pattern as before for consistency.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const debugRSVP = async () => {
    console.log('--- Debugging RSVP Submission (E2E) ---');

    const timestamp = Date.now();
    const email = `rsvp_test_${timestamp}@example.com`;
    const password = 'password123';

    // 1. Sign Up Owner
    console.log(`Creating owner: ${email}`);
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error('Sign up error:', signUpError);
        return;
    }
    console.log('Owner created:', user.id);

    // 2. Create Wedding
    const slug = `rsvp-test-${timestamp}`;
    const { data: wedding, error: weddingError } = await supabase
        .from('wedding_details')
        .insert({
            user_id: user.id,
            slug: slug,
            is_public: true,
            venue_name: 'RSVP Venue'
        })
        .select()
        .single();

    if (weddingError) {
        console.error('Error creating wedding:', weddingError);
        return;
    }
    console.log('Wedding created:', wedding.slug);

    // 3. Submit RSVP (as Anon/Public)
    // We use a fresh client or just the same one (RPC is security definer so it works)
    // But to be strict, RPC is callable by anon.
    const rsvpData = {
        p_slug: slug,
        p_name: 'E2E Guest',
        p_email: 'guest@example.com',
        p_status: 'confirmed',
        p_plus_ones: 1,
        p_message: 'E2E Test Message'
    };

    console.log('Submitting RSVP...');
    const { data: rsvpResult, error: rsvpError } = await supabase
        .rpc('submit_rsvp', rsvpData);

    if (rsvpError) {
        console.error('Error submitting RSVP:', rsvpError);
        return;
    }
    console.log('RSVP Result:', rsvpResult);

    // 4. Login as Owner to Fetch Guests
    console.log('Logging in as owner to fetch guests...');
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login error:', loginError);
        return;
    }

    // 5. Fetch Guests
    const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', user.id);

    if (guestsError) {
        console.error('Error fetching guests:', guestsError);
    } else {
        console.log('Guests found:', guests.length);
        console.log(guests);
    }
};

debugRSVP();
