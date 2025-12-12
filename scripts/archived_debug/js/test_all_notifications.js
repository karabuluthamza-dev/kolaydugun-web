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

async function testAllNotifications() {
    console.log('🧪 Testing All Notification Triggers\n');
    console.log('='.repeat(50));

    try {
        // Test 1: 5-Star Review
        console.log('\n1️⃣ Testing 5-Star Review Notification...');
        await test5StarReview();

        // Test 2: High-Value Lead
        console.log('\n2️⃣ Testing High-Value Lead Notification...');
        await testHighValueLead();

        // Test 3: New Vendor Registration
        console.log('\n3️⃣ Testing New Vendor Registration Notification...');
        await testNewVendor();

        console.log('\n' + '='.repeat(50));
        console.log('\n✅ All tests completed!');
        console.log('\n🔔 Check your admin dashboard:');
        console.log('   👉 Refresh the page (F5)');
        console.log('   👉 Click the notification bell');
        console.log('   👉 You should see 3 new notifications!');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
    }
}

async function test5StarReview() {
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, business_name')
        .limit(1)
        .single();

    const { data: user } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', 'esra@hotmail.com')
        .single();

    const { data, error } = await supabase
        .from('reviews')
        .insert({
            vendor_id: vendor.id,
            user_id: user.id,
            rating: 5,
            comment: 'Mükemmel hizmet! Test için oluşturuldu.',
            is_approved: true
        })
        .select()
        .single();

    if (error) {
        console.log('   ❌ Error:', error.message);
    } else {
        console.log('   ✅ 5-star review created');
        console.log('   ⭐ Vendor:', vendor.business_name);
        console.log('   💬 Comment:', data.comment);
    }
}

async function testHighValueLead() {
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, business_name')
        .limit(1)
        .single();

    const longMessage = 'Merhaba, düğünümüz için detaylı bir teklif almak istiyoruz. ' +
        'Tarih: 15 Haziran 2025, Misafir sayısı: 200 kişi, Lokasyon: İstanbul. ' +
        'Menü, dekorasyon ve müzik hizmetleriniz hakkında bilgi alabilir miyiz? ' +
        'Bütçemiz esnek, kaliteli bir organizasyon istiyoruz. Test bildirimi.';

    const { data, error } = await supabase
        .from('leads')
        .insert({
            vendor_id: vendor.id,
            name: 'Test Müşteri',
            email: 'test@example.com',
            phone: '+90 555 123 4567',
            message: longMessage,
            status: 'new'
        })
        .select()
        .single();

    if (error) {
        console.log('   ❌ Error:', error.message);
    } else {
        console.log('   ✅ High-value lead created');
        console.log('   📋 Vendor:', vendor.business_name);
        console.log('   📧 Email:', data.email);
        console.log('   📝 Message length:', longMessage.length, 'chars');
    }
}

async function testNewVendor() {
    const { data: user } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', 'esra@hotmail.com')
        .single();

    const randomName = 'Test Vendor ' + Math.floor(Math.random() * 10000);

    const { data, error } = await supabase
        .from('vendors')
        .insert({
            user_id: user.id,
            business_name: randomName,
            category: 'venue',
            city: 'Test City',
            description: 'Test vendor - bildirim sistemi testi için oluşturuldu',
            subscription_tier: 'free'
        })
        .select()
        .single();

    if (error) {
        console.log('   ❌ Error:', error.message);
    } else {
        console.log('   ✅ New vendor created');
        console.log('   🏪 Business:', data.business_name);
        console.log('   👤 Owner:', user.email);
    }
}

testAllNotifications();
