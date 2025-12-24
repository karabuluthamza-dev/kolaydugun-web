import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://rnkyghovurnaizkhwgtv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0'
);

async function checkRLS() {
    console.log('🔍 Checking RLS Policies...\n');

    // We can't directly query pg_policies via JS client easily without admin rights or a specific function.
    // Instead, we will test the behavior by trying to insert/select as anonymous and authenticated.

    // 1. Test Anonymous Insert to Leads
    console.log('📋 Testing Anonymous Lead Insert:');
    const testLead = {
        contact_name: 'RLS Test Anon',
        contact_email: 'rls_test@example.com',
        contact_phone: '1234567890',
        status: 'new'
    };

    const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([testLead])
        .select()
        .single();

    if (leadError) {
        console.log(`❌ Anonymous Insert Failed: ${leadError.message}`);
    } else {
        console.log(`✅ Anonymous Insert Success (ID: ${leadData.id})`);
        // Cleanup
        await supabase.from('leads').delete().eq('id', leadData.id);
    }

    // 2. Test Anonymous Access to Budget Items (Should Fail)
    console.log('\n📋 Testing Anonymous Budget Access (Should Fail):');
    const { data: budgetData, error: budgetError } = await supabase
        .from('budget_items')
        .select('*')
        .limit(1);

    if (budgetError) {
        console.log(`✅ Access Denied (Expected): ${budgetError.message}`);
    } else {
        console.log(`⚠️  Access Allowed (Unexpected): Found ${budgetData.length} items`);
    }

    console.log('\n' + '='.repeat(50));
}

checkRLS();
