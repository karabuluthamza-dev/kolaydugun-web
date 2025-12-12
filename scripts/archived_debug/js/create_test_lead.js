import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestLead() {
    try {
        console.log('📝 Creating a test lead...\n');

        // Get the first vendor
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('id, business_name')
            .limit(1)
            .single();

        if (vendorError) {
            console.error('❌ Error fetching vendor:', vendorError);
            return;
        }

        console.log(`✅ Found vendor: ${vendor.business_name} (${vendor.id})`);

        // Create a new lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert({
                contact_name: 'Test Çift',
                contact_email: 'test@example.com',
                contact_phone: '+49 123 456 7890',
                event_date: '2026-06-15',
                guest_count: 150,
                additional_notes: 'Bu bir test teklif isteğidir. Unlock ve conversation testi için oluşturuldu.',
                user_id: null // No user_id for now
            })
            .select()
            .single();

        if (leadError) {
            console.error('❌ Error creating lead:', leadError);
            return;
        }

        console.log(`✅ Created lead: ${lead.contact_name} (${lead.id})`);

        // Link the lead to the vendor
        const { error: linkError } = await supabase
            .from('vendor_leads')
            .insert({
                vendor_id: vendor.id,
                lead_id: lead.id
            });

        if (linkError) {
            console.error('❌ Error linking lead to vendor:', linkError);
            return;
        }

        console.log('✅ Linked lead to vendor');
        console.log('\n🎉 Test lead created successfully!');
        console.log('📋 Now refresh the "Teklif İstekleri" page and you should see the new lead.');
        console.log('🔓 Try unlocking it and then check "Mesajlar" - a conversation should appear!');

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

createTestLead();
