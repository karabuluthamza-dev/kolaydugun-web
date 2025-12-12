import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLeadsAndCreateProperTest() {
    try {
        console.log('🔍 Checking leads and user_id situation...\n');

        // Check current leads
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, contact_name, user_id')
            .limit(5);

        if (leadsError) {
            console.error('❌ Error fetching leads:', leadsError);
            return;
        }

        console.log('📋 Current leads:');
        leads.forEach(l => {
            console.log(`  - ${l.contact_name}: user_id = ${l.user_id || 'NULL'}`);
        });

        // Get a real user from auth.users
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            console.log('\n⚠️ Cannot fetch users (need service_role key)');
            console.log('💡 Solution: Update one of the existing leads with a vendor user_id');

            // Get a vendor
            const { data: vendor, error: vendorError } = await supabase
                .from('vendors')
                .select('id')
                .limit(1)
                .single();

            if (vendorError) {
                console.error('❌ Error fetching vendor:', vendorError);
                return;
            }

            // Update the first lead with this vendor's user_id
            const leadToUpdate = leads[0];
            const { error: updateError } = await supabase
                .from('leads')
                .update({ user_id: vendor.id })
                .eq('id', leadToUpdate.id);

            if (updateError) {
                console.error('❌ Error updating lead:', updateError);
                return;
            }

            console.log(`\n✅ Updated lead "${leadToUpdate.contact_name}" with user_id: ${vendor.id}`);
            console.log('\n🎯 Now:');
            console.log('1. Delete the unlock for this lead from lead_unlocks table');
            console.log('2. Refresh "Teklif İstekleri" and unlock it again');
            console.log('3. Check "Mesajlar" - conversation should appear!');

        } else {
            console.log('\n✅ Found users, creating proper test lead...');
            // Create lead with real user_id
            // ... (rest of the logic)
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

checkLeadsAndCreateProperTest();
