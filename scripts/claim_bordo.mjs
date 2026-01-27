import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function claimWarRoomBordo() {
    // The correct Bordo from war_room with is_elite config
    const targetId = '35c69942-dd21-4ecf-8408-b11faa767ba5';

    console.log('Updating war_room Bordo Eventlocation...');
    const { error } = await supabase
        .from('vendors')
        .update({ is_claimed: true, is_verified: true })
        .eq('id', targetId);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Successfully claimed and verified war_room Bordo!');
    }

    // Verify
    const { data } = await supabase
        .from('vendors')
        .select('id, business_name, is_claimed, is_verified, details')
        .eq('id', targetId)
        .single();

    console.log('Result:', JSON.stringify(data, null, 2));
}

claimWarRoomBordo();
