import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectReviews() {
    console.log('Inspecting reviews table...');

    // 1. Check if table exists and get a sample
    const { data: sample, error: sampleError } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);

    if (sampleError) {
        console.error('Error querying reviews:', sampleError);
    } else {
        console.log('Reviews table accessible. Sample:', sample);
    }

    // 2. Try to delete a non-existent ID to check for permission errors vs not found
    const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
        console.error('Delete permission check failed:', deleteError);
    } else {
        console.log('Delete permission check passed (no error for non-existent ID).');
    }
}

inspectReviews();
