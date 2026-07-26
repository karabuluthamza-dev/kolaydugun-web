/**
 * create_confirmed_test_user.js
 * 
 * Service Role Key kullanarak direkt confirmed test kullanıcısı oluşturur.
 * Email doğrulaması gerekmez.
 * 
 * Kullanım:
 *   node scripts/create_confirmed_test_user.js
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ VITE_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik!');
    process.exit(1);
}

// Admin client - RLS bypass yapar
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TEST_EMAIL = `ai.test.couple.${Date.now()}@kolaydugun-test.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function run() {
    console.log('🚀 Service Role ile confirmed test kullanıcısı oluşturuluyor...\n');

    // Adım 1: Admin API ile confirmed kullanıcı oluştur
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}\n`);

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true, // direkt confirmed!
        user_metadata: {
            full_name: 'AI Test Couple',
            role: 'couple'
        }
    });

    if (createError) {
        console.error('❌ Kullanıcı oluşturma başarısız:', createError.message);
        process.exit(1);
    }

    const userId = createData.user.id;
    console.log(`✅ Kullanıcı oluşturuldu! User ID: ${userId}`);
    console.log(`✅ Email confirmed: ${createData.user.email_confirmed_at ? 'Evet' : 'Hayır'}`);

    // Adım 2: Profile oluştur (couple rolü için)
    console.log('\n📋 Profile oluşturuluyor...');
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userId,
            email: TEST_EMAIL,
            full_name: 'AI Test Couple',
            role: 'couple',
            created_at: new Date().toISOString()
        });

    if (profileError) {
        console.warn('⚠️  Profile oluşturma hatası (devam ediliyor):', profileError.message);
    } else {
        console.log('✅ Profile oluşturuldu!');
    }

    // Adım 3: Login testi
    console.log('\n🔐 Login testi yapılıyor...');
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });

    if (signInError) {
        console.error('❌ Login başarısız:', signInError.message);
        process.exit(1);
    }

    console.log('✅ Login başarılı!');
    console.log(`   Token: ${signInData.session?.access_token?.substring(0, 30)}...`);

    // Sonuç
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST KULLANICISI HAZIR!');
    console.log('='.repeat(60));
    console.log(`Email:    ${TEST_EMAIL}`);
    console.log(`Password: ${TEST_PASSWORD}`);
    console.log(`User ID:  ${userId}`);
    console.log('\n📋 AI Tool Use testini çalıştırmak için:');
    console.log(`   $env:TEST_USER_EMAIL="${TEST_EMAIL}"; $env:TEST_USER_PASSWORD="${TEST_PASSWORD}"; node scripts/test_tool_use.js`);
    console.log('\n   Bash için:');
    console.log(`   TEST_USER_EMAIL="${TEST_EMAIL}" TEST_USER_PASSWORD="${TEST_PASSWORD}" node scripts/test_tool_use.js`);
}

run().catch(err => {
    console.error('💥 Beklenmeyen hata:', err);
    process.exit(1);
});
