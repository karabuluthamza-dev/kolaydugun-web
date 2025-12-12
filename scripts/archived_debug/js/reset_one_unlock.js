import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function resetOneUnlock() {
    try {
        console.log('🔄 Resetting ONE unlock for testing...\n');

        // Get one unlock to reset
        const { data: unlocks, error: fetchError } = await supabase
            .from('lead_unlocks')
            .select('*')
            .limit(1);

        if (fetchError) {
            console.error('❌ Error fetching unlocks:', fetchError);
            return;
        }

        if (!unlocks || unlocks.length === 0) {
            console.log('⚠️ No unlocks found to reset');
            return;
        }

        const unlock = unlocks[0];
        console.log(`📋 Found unlock: Lead ${unlock.lead_id} by Vendor ${unlock.vendor_id}`);

        // Delete this unlock
        const { error: deleteError } = await supabase
            .from('lead_unlocks')
            .delete()
            .eq('id', unlock.id);

        if (deleteError) {
            console.error('❌ Error deleting unlock:', deleteError);
            return;
        }

        console.log('✅ Deleted the unlock');
        console.log('\n🎯 Now:');
        console.log('1. Refresh the "Teklif İstekleri" page (F5)');
        console.log('2. You should see the "İletişim Bilgilerini Aç" button for one lead');
        console.log('3. Click it, then click "Onayla"');
        console.log('4. After success, go to "Mesajlar" tab');
        console.log('5. You should see a conversation with that couple!');

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

resetOneUnlock();
