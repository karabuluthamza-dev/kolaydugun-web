import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking conversations table schema...');

    // Attempt 1: Fetch a single row to see columns
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching conversations:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in conversations:', Object.keys(data[0]));
    } else {
        console.log('No data in conversations table to infer columns.');
        // If empty, try inserting without status to fail and debug or just assume standard fields
    }
}

checkSchema();
