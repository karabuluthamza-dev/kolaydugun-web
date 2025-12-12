import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugConversations() {
    try {
        console.log('🔍 Debugging conversation issue...\n');

        // Check conversations table
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*');

        if (convError) {
            console.error('❌ Error fetching conversations:', convError);
            return;
        }

        console.log('💬 Conversations in database:');
        if (conversations.length === 0) {
            console.log('  (none)');
        } else {
            conversations.forEach(c => {
                console.log(`  - ID: ${c.id}`);
                console.log(`    Vendor: ${c.vendor_id}`);
                console.log(`    User: ${c.user_id}`);
                console.log(`    Lead: ${c.lead_id}`);
                console.log('');
            });
        }

        // Check recent leads
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, contact_name, user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(3);

        if (leadsError) {
            console.error('❌ Error fetching leads:', leadsError);
            return;
        }

        console.log('\n📋 Recent leads:');
        leads.forEach(l => {
            console.log(`  - ${l.contact_name}`);
            console.log(`    ID: ${l.id}`);
            console.log(`    user_id: ${l.user_id || 'NULL'}`);
            console.log(`    Created: ${l.created_at}`);
            console.log('');
        });

        // Check recent unlocks
        const { data: unlocks, error: unlocksError } = await supabase
            .from('lead_unlocks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (unlocksError) {
            console.error('❌ Error fetching unlocks:', unlocksError);
            return;
        }

        console.log('\n🔓 Recent unlocks:');
        if (unlocks.length === 0) {
            console.log('  (none)');
        } else {
            unlocks.forEach(u => {
                console.log(`  - Lead: ${u.lead_id}`);
                console.log(`    Vendor: ${u.vendor_id}`);
                console.log(`    Credits spent: ${u.credits_spent}`);
                console.log(`    Created: ${u.created_at}`);
                console.log('');
            });
        }

        // Analysis
        console.log('\n📊 Analysis:');
        if (conversations.length === 0 && unlocks.length > 0) {
            console.log('⚠️ Unlocks exist but no conversations created');
            console.log('💡 Possible reasons:');
            console.log('   1. Leads have NULL user_id (conversation requires user_id)');
            console.log('   2. unlock_lead function failed to create conversation');
            console.log('   3. RLS policies blocking conversation creation');
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

debugConversations();
