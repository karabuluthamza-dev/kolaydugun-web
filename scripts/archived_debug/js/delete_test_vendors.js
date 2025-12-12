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

async function deleteTestVendors() {
    console.log('🧹 Deleting test vendors...\n');

    try {
        // Get all vendors with test-related names
        const { data: vendors, error: fetchError } = await supabase
            .from('vendors')
            .select('id, business_name')
            .or('business_name.ilike.%test%,business_name.ilike.%soft delete%,business_name.ilike.%deletion%');

        if (fetchError) {
            console.log('❌ Error fetching vendors:', fetchError.message);
            return;
        }

        console.log(`Found ${vendors.length} test vendors to delete:\n`);
        vendors.forEach(v => {
            console.log(`   - ${v.business_name}`);
        });

        if (vendors.length === 0) {
            console.log('✅ No test vendors found!');
            return;
        }

        console.log('\n🗑️  Deleting...');

        // Delete each vendor (this will cascade to related data)
        let deleted = 0;
        let failed = 0;

        for (const vendor of vendors) {
            const { error: deleteError } = await supabase
                .from('vendors')
                .delete()
                .eq('id', vendor.id);

            if (deleteError) {
                console.log(`   ❌ Failed to delete ${vendor.business_name}: ${deleteError.message}`);
                failed++;
            } else {
                deleted++;
            }
        }

        console.log(`\n✅ Deleted: ${deleted}`);
        if (failed > 0) {
            console.log(`❌ Failed: ${failed}`);
        }

        // Get final count
        const { count: finalCount } = await supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true });

        console.log(`\n📊 Remaining vendors: ${finalCount}`);
        console.log('👉 Refresh your admin dashboard to see updated count');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

deleteTestVendors();
