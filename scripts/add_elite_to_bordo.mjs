import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addIsEliteToBordo() {
    const targetId = '35c69942-dd21-4ecf-8408-b11faa767ba5';

    // First, get current details
    const { data: vendor, error: fetchError } = await supabase
        .from('vendors')
        .select('details')
        .eq('id', targetId)
        .single();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }

    console.log('Current details:', JSON.stringify(vendor.details, null, 2));

    // Update vip_demo_config with is_elite: true
    const updatedDetails = {
        ...vendor.details,
        vip_demo_config: {
            ...vendor.details.vip_demo_config,
            is_elite: true
        }
    };

    console.log('\nUpdated details:', JSON.stringify(updatedDetails, null, 2));

    // Update the record
    const { data, error, status } = await supabase
        .from('vendors')
        .update({ details: updatedDetails })
        .eq('id', targetId)
        .select();

    console.log('\nUpdate status:', status);
    if (error) {
        console.error('Update error:', error);
    } else {
        console.log('✅ Successfully updated! New data:', data);
    }
}

addIsEliteToBordo();
