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

async function createTestReview() {
    console.log('Creating test low-rating review...\n');

    try {
        // Get a vendor
        const { data: vendors } = await supabase
            .from('vendors')
            .select('id, business_name')
            .limit(1);

        if (!vendors || vendors.length === 0) {
            console.log('❌ No vendors found');
            return;
        }

        const vendor = vendors[0];
        console.log('✅ Using vendor:', vendor.business_name);

        // Get a user (esra)
        const { data: users } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('email', 'esra@hotmail.com')
            .single();

        if (!users) {
            console.log('❌ User not found');
            return;
        }

        console.log('✅ Using user:', users.full_name || users.email);

        // Create a low-rating review (1 star)
        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                vendor_id: vendor.id,
                user_id: users.id,
                rating: 1,
                comment: 'Test yorumu - Bildirim sistemi testi için oluşturuldu. Düşük puan!',
                is_approved: false
            })
            .select()
            .single();

        if (error) {
            console.log('❌ Error creating review:', error.message);
            return;
        }

        console.log('\n✅ Test review created successfully!');
        console.log('📋 Review ID:', review.id);
        console.log('⭐ Rating:', review.rating, 'stars');
        console.log('💬 Comment:', review.comment);
        console.log('\n🔔 Notification should be created automatically!');
        console.log('👉 Check your admin dashboard navbar for the notification bell');
        console.log('👉 Click the bell to see the notification');
        console.log('👉 Click the notification to go to Admin Reviews page');

    } catch (err) {
        console.error('Error:', err.message);
    }
}

createTestReview();
