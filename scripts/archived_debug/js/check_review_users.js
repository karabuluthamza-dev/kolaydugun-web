import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReviews() {
    console.log('Checking recent reviews...');

    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('\nFound', reviews.length, 'recent reviews:');

    for (const review of reviews) {
        console.log('\n---');
        console.log('Review ID:', review.id);
        console.log('Comment:', review.comment);
        console.log('User ID:', review.user_id);

        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', review.user_id)
            .single();

        if (profile) {
            console.log('User Email:', profile.email);
            console.log('User Full Name:', profile.full_name || '(EMPTY)');
        } else {
            console.log('❌ No profile found for this user!');
        }
    }
}

checkReviews();
