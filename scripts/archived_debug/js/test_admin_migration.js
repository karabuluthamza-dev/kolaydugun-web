import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
    console.log('--- Testing get_support_conversations ---');
    // Test with default status 'active'
    const { data: convs, error: cError } = await supabase.rpc('get_support_conversations', { p_status: 'active' });

    if (cError) {
        console.error('❌ get_support_conversations failed:', cError);
    } else {
        console.log(`✅ Success! Found ${convs?.length || 0} active conversations.`);
        if (convs?.length > 0) {
            console.log('Sample conversation:', {
                id: convs[0].conversation_id,
                contact: convs[0].contact_name,
                status: convs[0].status
            });

            const convId = convs[0].conversation_id;
            console.log(`\n--- Testing get_admin_messages for ${convId} ---`);
            const { data: msgs, error: mError } = await supabase.rpc('get_admin_messages', {
                p_conversation_id: convId,
                p_limit: 5,
                p_offset: 0
            });

            if (mError) {
                console.error('❌ get_admin_messages failed:', mError);
            } else {
                console.log(`✅ Success! Found ${msgs?.length || 0} messages.`);
            }
        } else {
            console.log('⚠️ No conversations found to test messages with. This might be normal if DB is empty, but check if visibility rule issues persist.');
        }
    }

    console.log('\n--- Testing canned_responses table access ---');
    const { data: cr, error: crError } = await supabase.from('canned_responses').select('*').limit(1);
    if (crError) {
        // RLS might block anon read if not logged in as admin, but table existence check is key
        // Actually RLS policy "Admins can manage" might block anon. 
        // But if the error is "relation does not exist", that's a faiure.
        // If error is "new row violates RLS" or empty data, table exists.
        if (crError.code === '42P01') {
            console.error('❌ canned_responses table does not exist.');
        } else {
            console.log('✅ canned_responses table exists (RLS/Data check:', crError.message || 'OK', ')');
        }
    } else {
        console.log('✅ canned_responses table exists and is accessible.');
    }
}

testMigration();
