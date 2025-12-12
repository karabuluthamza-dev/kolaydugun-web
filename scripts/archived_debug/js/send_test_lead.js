import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // 1. Find the vendor
    const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .select('id, business_name')
        .ilike('business_name', '%Dj34Istanbul%');

    if (vendorError) {
        console.error('Error finding vendor:', vendorError);
        return;
    }

    if (!vendors || vendors.length === 0) {
        console.log('Vendor not found');
        return;
    }

    const vendor = vendors[0];
    console.log('Found vendor:', vendor);

    // 2. Insert a test lead (Quote Request)
    const testLead = {
        user_id: null, // Guest user
        contact_name: 'Test User (Antigravity)',
        contact_email: 'test@antigravity.com',
        contact_phone: '5551234567',
        event_date: '2026-06-15',
        additional_notes: 'Merhaba, bu bir test mesajıdır. Sistem kontrolü için gönderilmiştir. Lütfen dikkate almayınız.',
        category_id: null,
        city_id: null
    };

    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert([testLead])
        .select();

    if (leadError) {
        console.error('Error inserting lead:', leadError);
    } else {
        console.log('Successfully inserted test lead:', lead);
        console.log('\nNow creating vendor_lead assignment...');

        // 3. Create vendor_lead assignment
        const vendorLead = {
            lead_id: lead[0].id,
            vendor_id: vendor.id,
            assigned_at: new Date().toISOString()
        };

        const { data: assignment, error: assignError } = await supabase
            .from('vendor_leads')
            .insert([vendorLead])
            .select();

        if (assignError) {
            console.error('Error assigning lead to vendor:', assignError);
        } else {
            console.log('Successfully assigned lead to vendor:', assignment);
        }
    }
}

main();
