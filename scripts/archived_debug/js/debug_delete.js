
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugDelete() {
    console.log('Testing delete_admin_message RPC...');

    // Use a fake user/message ID or try to delete a non-existent one to check if function exists.
    const targetId = '00000000-0000-0000-0000-000000000000'; // Dummy ID

    try {
        const { data, error } = await supabase.rpc('delete_admin_message', { target_message_id: targetId });

        if (error) {
            console.error('RPC Error:', error);
        } else {
            console.log('RPC Success (Expected for dummy ID if function exists).');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

debugDelete();
