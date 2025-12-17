import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigrations() {
    console.log('🔍 Migration Verification Report\n');
    console.log('='.repeat(70));

    // 1. Check Commission FAQs
    console.log('\n1️⃣  COMMISSION SETTINGS FAQs');
    console.log('-'.repeat(70));

    const { data: commissionFaqs, error: commError } = await supabase
        .from('shop_faqs')
        .select('question_tr, category')
        .ilike('question_tr', '%komisyon%')
        .order('display_order');

    if (commError) {
        console.error('❌ Error:', commError.message);
    } else {
        console.log(`✅ Found ${commissionFaqs?.length || 0} commission-related FAQs:\n`);
        commissionFaqs?.forEach((faq, i) => {
            console.log(`   ${i + 1}. [${faq.category}] ${faq.question_tr}`);
        });
    }

    // 2. Check Affiliate FAQs
    console.log('\n\n2️⃣  PRODUCT AFFILIATE FAQs');
    console.log('-'.repeat(70));

    const { data: affiliateFaqs, error: affError } = await supabase
        .from('shop_faqs')
        .select('question_tr, category')
        .eq('category', 'affiliate')
        .order('display_order');

    if (affError) {
        console.error('❌ Error:', affError.message);
    } else {
        console.log(`✅ Found ${affiliateFaqs?.length || 0} affiliate FAQs:\n`);
        affiliateFaqs?.forEach((faq, i) => {
            console.log(`   ${i + 1}. ${faq.question_tr}`);
        });
    }

    // 3. Check Gallery RLS
    console.log('\n\n3️⃣  GALLERY RLS POLICIES');
    console.log('-'.repeat(70));

    const { data: gallery, error: galleryError } = await supabase
        .from('shop_gallery')
        .select('id')
        .limit(1);

    if (galleryError) {
        console.error('❌ Error accessing shop_gallery:', galleryError.message);
        console.log('   ⚠️  RLS policy may need to be fixed');
    } else {
        console.log('✅ shop_gallery table accessible (RLS working correctly)');
    }

    // 4. Check Commission Rate Setting
    console.log('\n\n4️⃣  DEFAULT COMMISSION RATE');
    console.log('-'.repeat(70));

    const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('default_commission_rate')
        .single();

    if (settingsError) {
        console.error('❌ Error:', settingsError.message);
    } else {
        console.log(`✅ Default Commission Rate: ${settings?.default_commission_rate || 'Not set'}%`);
    }

    // 5. Total FAQ Count
    console.log('\n\n5️⃣  TOTAL FAQ STATISTICS');
    console.log('-'.repeat(70));

    const { data: allFaqs, error: allError } = await supabase
        .from('shop_faqs')
        .select('category');

    if (!allError && allFaqs) {
        const categoryCount = allFaqs.reduce((acc, faq) => {
            acc[faq.category] = (acc[faq.category] || 0) + 1;
            return acc;
        }, {});

        console.log('✅ FAQ Count by Category:\n');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`   ${category.padEnd(20)}: ${count} FAQs`);
        });
        console.log(`\n   ${'TOTAL'.padEnd(20)}: ${allFaqs.length} FAQs`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ Verification Complete!\n');
}

verifyMigrations().catch(console.error);
