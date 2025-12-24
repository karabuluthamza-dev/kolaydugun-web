
import { createClient } from '@supabase/supabase-js';

// Hardcoded for debug purposes
const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log('Fetching latest leads...');

    // 0. Check connection via vendors (usually public)
    const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .select('id, business_name')
        .limit(1);

    if (vendorError) {
        console.error('Error fetching vendors (connection check):', vendorError);
    } else {
        console.log('Connection OK. Found vendors:', vendors ? vendors.length : 0);
    }

    // 1. Try to fetch (might return empty if RLS blocks anon select)
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching leads:', error);
    } else {
        console.log('Latest 5 leads:', leads);
    }

    // 2. Try to insert a test lead via script to verify RLS
    console.log('Attempting to insert test lead via script...');

    const vendorId = vendors && vendors.length > 0 ? vendors[0].id : null;

    const testLead = {
        contact_name: 'Script Test User No Vendor',
        contact_email: 'script_no_vendor@test.com',
        contact_phone: '1234567890', // Added phone number to satisfy constraint
        event_date: '2025-12-31',
        additional_notes: 'Inserted via debug script without vendor_id',
        status: 'new',
        // vendor_id: vendorId // Commented out to test if FK is causing RLS issue
    };

    const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([testLead])
        .select()
        .single();

    if (insertError) {
        console.error('Error inserting lead:', insertError);
    } else {
        console.log('Successfully inserted lead:', newLead);
    }
}

checkLeads();
