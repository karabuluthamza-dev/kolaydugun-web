
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugSchema() {
    console.log('Inspecting contact_messages table keys...');

    // We try to get one row
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching contact_messages:', error);
    } else if (data && data.length > 0) {
        console.log('Contact Messages Columns:', Object.keys(data[0]));
        console.log('Use this to check for read_at or is_read column.');
    } else {
        console.log('contact_messages table empty or no data returned (RLS might be blocking or table is empty).');
    }
}

debugSchema();
