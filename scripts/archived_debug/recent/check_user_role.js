import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserRole() {
    const email = 'fix3@example.com'; // The user we just created
    console.log(`Checking role for user: ${email}`);

    // We can't query auth.users directly with anon key, but we can query profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error fetching profile:', error);
        return;
    }

    if (profiles && profiles.length > 0) {
        console.log('Profile found:', profiles[0]);
        if (profiles[0].role === 'vendor') {
            console.error('ISSUE DETECTED: User has "vendor" role despite registering as couple!');
        } else if (profiles[0].role === 'couple') {
            console.log('SUCCESS: User has "couple" role.');
        } else {
            console.log(`User has role: ${profiles[0].role}`);
        }
    } else {
        console.log('No profile found for this email.');
    }
}

checkUserRole();
