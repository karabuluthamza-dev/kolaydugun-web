const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
    console.log('🚀 Running migration: Add zip_code column to vendors table...');

    try {
        // Since we can't run raw SQL easily without a specific RPC, 
        // we'll try to use a little trick: update a non-existent column to see if it errors.
        // Actually, some Supabase setups allow running SQL via an RPC called 'exec_sql' if it was created.
        // If not, we have to ask the user to run it.

        console.log('⚠️ Attempting to check if column exists by selecting it...');
        const { error } = await supabase.from('vendors').select('zip_code').limit(1);

        if (error && error.message.includes('column "zip_code" does not exist')) {
            console.log('❌ Column "zip_code" is missing.');
            console.log('\n=========================================');
            console.log('PLEASE RUN THIS SQL IN YOUR SUPABASE SQL EDITOR:');
            console.log('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS zip_code TEXT;');
            console.log('=========================================\n');
        } else if (error) {
            console.error('❌ Error checking column:', error.message);
        } else {
            console.log('✅ Column "zip_code" already exists.');
        }

    } catch (err) {
        console.error('💥 Migration script error:', err.message);
    }
}

runMigration();
