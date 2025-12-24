import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTransactions() {
    console.log('Fetching transactions...');
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*');

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    console.log(`Found ${transactions.length} transactions.`);
    if (transactions.length > 0) {
        console.log('Sample transaction:', transactions[0]);
    }

    // Test the join query used in AdminCreditApproval
    console.log('\nTesting Join Query...');
    const { data: joinData, error: joinError } = await supabase
        .from('transactions')
        .select(`
            *,
            vendor:vendors!user_id(business_name, category, city)
        `)
        .limit(5);

    if (joinError) {
        console.error('Join Query Error:', joinError);
    } else {
        console.log('Join Query Result:', JSON.stringify(joinData, null, 2));
    }
}

inspectTransactions();
