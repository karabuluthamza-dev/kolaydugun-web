
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendor() {
    console.log('Fetching vendor data...');
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching vendor:', error);
        return;
    }

    if (data && data.length > 0) {
        const vendor = data[0];
        console.log('Vendor keys:', Object.keys(vendor));
        console.log('FAQ column value:', vendor.faq);
        console.log('Details column value:', JSON.stringify(vendor.details, null, 2));
    } else {
        console.log('No vendors found.');
    }
}

checkVendor();
