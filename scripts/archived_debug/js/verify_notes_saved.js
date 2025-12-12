import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyNotes() {
    console.log('Verifying last added item notes...');

    const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching items:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Last item:', data[0]);
            console.log('Notes:', data[0].notes);
        } else {
            console.log('No items found.');
        }
    }
}

verifyNotes();
