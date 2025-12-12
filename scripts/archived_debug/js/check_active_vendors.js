import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActiveVendors() {
    console.log('Checking active vendors (not deleted)...\n');

    // Same query as AdminVendors page
    const { data, error } = await supabase
        .from('vendors')
        .select('business_name, subscription_tier, deleted_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    console.log(`✅ Active vendors (not deleted): ${data.length}\n`);

    if (data.length > 0) {
        console.log('First 10:');
        data.slice(0, 10).forEach((v, i) => {
            console.log(`   ${i + 1}. ${v.business_name} (${v.subscription_tier})`);
        });

        if (data.length > 10) {
            console.log(`   ... and ${data.length - 10} more`);
        }
    }

    // Check deleted vendors
    const { count: deletedCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null);

    console.log(`\n🗑️  Soft deleted vendors: ${deletedCount || 0}`);
    console.log(`📊 Total in database: ${data.length + (deletedCount || 0)}`);
}

checkActiveVendors();
