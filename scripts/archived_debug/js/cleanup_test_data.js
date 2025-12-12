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

async function cleanupTestData() {
    console.log('🧹 Cleaning up test data...\n');

    try {
        // 1. Delete test vendors (created today with "Test Vendor" in name)
        console.log('1️⃣ Deleting test vendors...');
        const { data: testVendors, error: vendorError } = await supabase
            .from('vendors')
            .delete()
            .like('business_name', '%Test Vendor%')
            .select();

        if (vendorError) {
            console.log('   ❌ Error:', vendorError.message);
        } else {
            console.log(`   ✅ Deleted ${testVendors?.length || 0} test vendors`);
        }

        // 2. Delete test reviews (created today with test comments)
        console.log('\n2️⃣ Deleting test reviews...');
        const { data: testReviews, error: reviewError } = await supabase
            .from('reviews')
            .delete()
            .or('comment.ilike.%test%,comment.ilike.%Test%')
            .select();

        if (reviewError) {
            console.log('   ❌ Error:', reviewError.message);
        } else {
            console.log(`   ✅ Deleted ${testReviews?.length || 0} test reviews`);
        }

        // 3. Delete test notifications
        console.log('\n3️⃣ Deleting test notifications...');
        const { data: testNotifications, error: notifError } = await supabase
            .from('notifications')
            .delete()
            .or('related_type.eq.test,title.ilike.%test%')
            .select();

        if (notifError) {
            console.log('   ❌ Error:', notifError.message);
        } else {
            console.log(`   ✅ Deleted ${testNotifications?.length || 0} test notifications`);
        }

        // 4. Get final counts
        console.log('\n📊 Final counts:');

        const { count: vendorCount } = await supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true });

        const { count: reviewCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true });

        const { count: notificationCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true });

        console.log(`   👥 Vendors: ${vendorCount}`);
        console.log(`   ⭐ Reviews: ${reviewCount}`);
        console.log(`   🔔 Notifications: ${notificationCount}`);

        console.log('\n✅ Cleanup complete!');
        console.log('👉 Refresh your admin dashboard to see updated counts');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
    }
}

cleanupTestData();
