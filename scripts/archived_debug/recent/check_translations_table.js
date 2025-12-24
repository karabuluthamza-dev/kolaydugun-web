
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTranslations() {
    const { data, error } = await supabase
        .from('translations')
        .select('*')
        .like('key', 'schemas.%');

    if (error) {
        console.error('Error fetching translations:', error);
        return;
    }

    console.log('Found translations matching schemas.%:');
    data.forEach(t => {
        console.log(`Key: ${t.key}, EN: ${t.en}, TR: ${t.tr}, DE: ${t.de}`);
    });
}

checkTranslations();
