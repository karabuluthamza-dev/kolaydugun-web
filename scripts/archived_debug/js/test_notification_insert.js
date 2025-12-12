
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    const randomId = '00000000-0000-0000-0000-000000000000';
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();

    if (!profile) {
        console.log('No profile found');
        return;
    }

    console.log('Attempting insert with random RelatedConversationID to check FK...');
    const { error } = await supabase.from('user_notifications').insert({
        user_id: profile.id,
        type: 'new_message',
        title: 'FK Check',
        message: 'Checking...',
        // related_conversation_id: randomId, // Don't use this, it fails FK
        data: { legacy_id: randomId }
    });

    if (error) {
        console.log('Insert Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert SUCCEEDED (No FK constraint on related_conversation_id)');
    }
}

inspectSchema();
