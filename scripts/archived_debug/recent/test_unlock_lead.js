import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUnlockLead() {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('Not authenticated:', authError);
        return;
    }

    console.log('User ID:', user.id);

    // Get a lead to test
    const { data: leads, error: leadsError } = await supabase
        .from('vendor_leads')
        .select('lead_id')
        .eq('vendor_id', user.id)
        .limit(1);

    if (leadsError || !leads || leads.length === 0) {
        console.error('No leads found:', leadsError);
        return;
    }

    const testLeadId = leads[0].lead_id;
    console.log('Testing with lead ID:', testLeadId);

    // Try to call unlock_lead RPC
    console.log('\nCalling unlock_lead RPC...');
    const { data, error } = await supabase.rpc('unlock_lead', {
        p_lead_id: testLeadId,
        p_cost: 5
    });

    if (error) {
        console.error('RPC Error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
        console.log('RPC Response:', data);
    }
}

testUnlockLead();
