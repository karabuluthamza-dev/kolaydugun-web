
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectBudgetItems() {
    console.log('Fetching one budget item to inspect schema...');

    const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching budget items:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('No budget items found, but table likely exists. Trying to insert a dummy to check columns.');
            // We can't easily check columns without data or admin API, but we can try to insert and see if it fails on missing columns
        }
    }
}

inspectBudgetItems();
