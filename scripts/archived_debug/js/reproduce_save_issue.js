import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function reproduceIssue() {
    console.log('--- Starting Reproduction Script ---');

    // 1. Create/Login Test User
    const email = `test_vendor_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. Creating test user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error('❌ Auth Error:', authError.message);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error('❌ No user ID returned');
        return;
    }
    console.log('✅ User created:', userId);

    // 2. Create Initial Vendor Profile
    console.log('2. Creating initial vendor profile...');
    const initialProfile = {
        id: userId, // Explicitly set ID to match User ID
        user_id: userId,
        business_name: 'Test Vendor',
        category: 'DJs',
        city: 'Berlin',
        subscription_tier: 'free'
    };

    const { error: createError } = await supabase
        .from('vendors')
        .insert([initialProfile]);

    if (createError) {
        console.error('❌ Create Profile Error:', createError.message);
        // If RLS prevents insert, we need to know.
        return;
    }
    console.log('✅ Initial profile created.');

    // 3. Attempt Update (Simulating ProfileEditor.jsx)
    console.log('3. Attempting update with full payload...');

    const updates = {
        user_id: userId,
        business_name: 'Updated Vendor Name',
        category: 'DJs',
        city: 'Munich', // Changed
        description: 'Updated description',
        price_range: '€€',
        capacity: 100,
        years_experience: 5,
        website_url: null,
        payment_methods: ['Cash', 'Card'],
        languages: ['English', 'German'],
        social_media: { instagram: 'test', facebook: 'test' },
        faq: [{ question: 'Q', answer: 'A' }],
        details: { music_genres: ['Pop', 'Rock'] }, // Dynamic field
        updated_at: new Date()
    };

    const { data: updateData, error: updateError } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', userId) // Assuming id is user_id? Wait, table id might be different if it's not 1:1 with user_id PK.
        // Let's check how the table is structured. Usually id is uuid PK, user_id is FK.
        // But ProfileEditor uses .eq('id', vendor.id).
        // Let's fetch the vendor first to get the ID.
        .select();

    // Re-fetch to get the ID
    const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!vendorData) {
        console.error('❌ Could not fetch created vendor to get ID.');
        return;
    }

    console.log(`   Target Vendor ID: ${vendorData.id}`);

    const { data: finalData, error: finalError } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorData.id)
        .select();

    if (finalError) {
        console.error('❌ Update Failed:', finalError);
        console.error('   Message:', finalError.message);
        console.error('   Details:', finalError.details);
        console.error('   Hint:', finalError.hint);
    } else {
        console.log('✅ Update Successful!');
        console.log('   Updated Data:', finalData);
    }
}

reproduceIssue();
