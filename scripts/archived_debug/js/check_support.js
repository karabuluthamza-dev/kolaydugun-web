import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupport() {
    console.log('Checking for Support Vendor...');

    // 1. Check Vendor
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('business_name', 'KolayDugun Destek')
        .maybeSingle();

    if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        return;
    }

    if (!vendor) {
        console.log('❌ Support vendor "KolayDugun Destek" NOT FOUND.');
    } else {
        console.log('✅ Support vendor FOUND:', vendor.id);

        // 2. Check Conversations for this vendor
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*, messages(count)')
            .eq('vendor_id', vendor.id);

        if (convError) {
            console.error('Error fetching conversations:', convError);
        } else {
            console.log(`Found ${conversations.length} support conversations.`);
        }
    }
}

checkSupport();
