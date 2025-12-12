import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function resetUnlock() {
    try {
        console.log('🔄 Resetting unlock to test conversation creation...\n');

        // Delete all unlocks (so we can test again)
        const { data: deleted, error: deleteError } = await supabase
            .from('lead_unlocks')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
            console.error('❌ Error deleting unlocks:', deleteError);
            return;
        }

        console.log('✅ Deleted all previous unlocks');
        console.log('📝 Now you can unlock a lead again from the dashboard!');
        console.log('   After unlocking, check the "Mesajlar" tab - you should see a conversation.');

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

resetUnlock();
