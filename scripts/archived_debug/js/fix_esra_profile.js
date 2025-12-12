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

async function checkEsraProfile() {
    console.log('Checking esra user profile...');

    // Find user with email containing 'esra'
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', '%esra%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Found profiles:', profiles);

    if (profiles && profiles.length > 0) {
        for (const profile of profiles) {
            console.log('\nProfile:', profile.email);
            console.log('Full Name:', profile.full_name || '(EMPTY)');
            console.log('User Type:', profile.user_type);

            // If full_name is empty, update it
            if (!profile.full_name) {
                const emailName = profile.email.split('@')[0];
                console.log(`\nUpdating full_name to: ${emailName}`);

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ full_name: emailName })
                    .eq('id', profile.id);

                if (updateError) {
                    console.error('Update error:', updateError);
                } else {
                    console.log('✅ Updated successfully!');
                }
            }
        }
    } else {
        console.log('No profiles found with email containing "esra"');
    }
}

checkEsraProfile();
