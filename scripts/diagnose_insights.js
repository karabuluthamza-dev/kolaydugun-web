import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
    console.log('Checking vendor_insights table...');
    const { data, error } = await supabase.from('vendor_insights').select('*').limit(5);
    if (error) {
        console.error('Error fetching insights:', error);
    } else {
        console.log('Insights found:', data.length);
        if (data.length > 0) {
            console.log('First insight sample:', data[0]);
        }
    }

    console.log('\nChecking vendors with insights join...');
    const { data: vendors, error: vError } = await supabase
        .from('vendors')
        .select('business_name, vendor_insights(performance_score)')
        .limit(5);

    if (vError) {
        console.error('Error fetching vendors with join:', vError);
    } else {
        console.log('Vendors sample:', JSON.stringify(vendors, null, 2));
        if (vendors.length > 0) {
            const vId = vendors[0].id || (await supabase.from('vendors').select('id').limit(1).single()).data.id;
            console.log('\nAttempting manual insert for vendor:', vId);
            const { error: iErr } = await supabase.from('vendor_insights').insert({
                vendor_id: vId,
                summary: 'Diagnostic test summary',
                performance_score: 50,
                is_published: true
            });
            if (iErr) {
                console.error('MANUAL INSERT ERROR:', iErr);
            } else {
                console.log('MANUAL INSERT SUCCESS!');
            }
        }
    }
}

diagnose();
