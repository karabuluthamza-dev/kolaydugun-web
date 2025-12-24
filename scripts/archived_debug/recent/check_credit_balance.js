import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCreditBalance() {
    // Get the current user (Dj34Istanbul)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('No user logged in');
        return;
    }

    console.log('Current User ID:', user.id);

    // Check vendor credit_balance
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, business_name, credit_balance')
        .eq('id', user.id)
        .single();

    if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
    } else {
        console.log('Vendor Info:', vendor);
    }

    // Check approved transactions
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (txError) {
        console.error('Error fetching transactions:', txError);
    } else {
        console.log('\nApproved Transactions:');
        transactions.forEach(tx => {
            console.log(`- ${tx.description}: +${tx.credits_added} credits (${tx.created_at})`);
        });

        const totalCredits = transactions.reduce((sum, tx) => sum + (tx.credits_added || 0), 0);
        console.log(`\nTotal credits from approved transactions: ${totalCredits}`);
        console.log(`Current credit_balance in vendors table: ${vendor?.credit_balance || 0}`);
        console.log(`Difference: ${totalCredits - (vendor?.credit_balance || 0)}`);
    }
}

checkCreditBalance();
