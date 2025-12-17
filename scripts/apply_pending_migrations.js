import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('   VITE_SUPABASE_SERVICE_KEY:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyMigrations() {
    console.log('🚀 Starting migration process...\n');
    console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

    const migrations = [
        '20251216_fix_gallery_rls.sql',
        '20251216_commission_settings_faqs.sql',
        '20251216_product_affiliate_faqs.sql'
    ];

    for (const migrationFile of migrations) {
        try {
            console.log(`📄 Applying: ${migrationFile}`);

            const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile);
            const sql = readFileSync(migrationPath, 'utf8');

            console.log(`   SQL length: ${sql.length} characters`);
            console.log(`   Executing via Supabase SQL Editor...`);

            // Note: Supabase JS client doesn't support arbitrary SQL execution
            // This needs to be done via Supabase Dashboard SQL Editor or CLI
            console.log(`   ⚠️  Please apply this migration manually via Supabase Dashboard`);
            console.log(`   📋 Migration file: ${migrationPath}\n`);

        } catch (err) {
            console.error(`   ❌ Failed to read file: ${err.message}\n`);
        }
    }

    // Verify current state
    console.log('🔍 Checking current database state...\n');

    // Check shop_faqs table
    console.log('1. Checking shop_faqs table...');
    const { data: faqs, error: faqError } = await supabase
        .from('shop_faqs')
        .select('id, question_tr, category')
        .order('id', { ascending: false })
        .limit(5);

    if (faqError) {
        console.error(`   ❌ Error: ${faqError.message}`);
    } else {
        console.log(`   ✅ Found ${faqs?.length || 0} FAQs (showing latest 5)`);
        if (faqs && faqs.length > 0) {
            faqs.forEach(faq => console.log(`      [${faq.category}] ${faq.question_tr.substring(0, 60)}...`));
        }
    }

    // Check for commission-related FAQs
    console.log('\n2. Checking for commission-related FAQs...');
    const { data: commissionFaqs, error: commError } = await supabase
        .from('shop_faqs')
        .select('question_tr')
        .ilike('question_tr', '%komisyon%');

    if (commError) {
        console.error(`   ❌ Error: ${commError.message}`);
    } else {
        console.log(`   ✅ Found ${commissionFaqs?.length || 0} commission-related FAQs`);
        if (commissionFaqs && commissionFaqs.length > 0) {
            commissionFaqs.forEach(faq => console.log(`      - ${faq.question_tr}`));
        } else {
            console.log(`   ⚠️  No commission FAQs found - migrations need to be applied`);
        }
    }

    // Check shop_gallery RLS policies
    console.log('\n3. Checking shop_gallery table access...');
    const { data: galleries, error: galleryError } = await supabase
        .from('shop_gallery')
        .select('id')
        .limit(1);

    if (galleryError) {
        console.error(`   ❌ Error: ${galleryError.message}`);
        console.log(`   ⚠️  Gallery RLS fix may be needed`);
    } else {
        console.log(`   ✅ shop_gallery table accessible`);
    }

    // Check site_settings for default_commission_rate
    console.log('\n4. Checking default_commission_rate in site_settings...');
    const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('default_commission_rate')
        .single();

    if (settingsError) {
        console.error(`   ❌ Error: ${settingsError.message}`);
    } else {
        console.log(`   ✅ Default commission rate: ${settings?.default_commission_rate || 'Not set'}%`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste each migration file content');
    console.log('4. Execute them in this order:');
    console.log('   a) 20251216_fix_gallery_rls.sql');
    console.log('   b) 20251216_commission_settings_faqs.sql');
    console.log('   c) 20251216_product_affiliate_faqs.sql');
    console.log('5. Run this script again to verify\n');
}

applyMigrations().catch(console.error);
