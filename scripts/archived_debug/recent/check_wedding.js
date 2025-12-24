
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
// Using the ANON key first to simulate public access
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWedding() {
    const slug = 'test-couple-live';
    console.log(`Checking for slug: ${slug}`);

    const { data, error } = await supabase
        .from('wedding_details')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching wedding:', error.message);
        console.error('Error details:', error);
    } else {
        console.log('Wedding found:', data);
    }
}

checkWedding();
