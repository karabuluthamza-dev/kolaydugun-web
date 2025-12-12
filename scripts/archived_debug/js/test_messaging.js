import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestMessages() {
    console.log('🚀 Starting Message Test Simulation...');

    // 1. Get Support Vendor ID
    const { data: supportVendor } = await supabase
        .from('vendors')
        .select('id, user_id')
        .eq('business_name', 'KolayDugun Destek')
        .single();

    if (!supportVendor) {
        console.error('❌ Support vendor not found.');
        return;
    }
    console.log('✅ Support Vendor ID:', supportVendor.id);

    // 2. Get a Random Couple User (Sender)
    const { data: coupleUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'couple')
        .limit(1)
        .maybeSingle();

    if (!coupleUser) {
        console.error('❌ No couple user found for testing.');
        return;
    }
    console.log('✅ Test User (Sender):', coupleUser.email);

    // 3. Create Support Conversation & Message
    // Check if conversation exists
    let { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('vendor_id', supportVendor.id)
        .eq('user_id', coupleUser.id)
        .maybeSingle();

    if (!conv) {
        const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
                vendor_id: supportVendor.id,
                user_id: coupleUser.id
                // status field removed
            })
            .select()
            .single();

        if (convError) {
            console.error('❌ Error creating conversation:', convError);
            return;
        }
        conv = newConv;
        console.log('✅ Created New Support Conversation:', conv.id);
    } else {
        console.log('ℹ️ Using Existing Support Conversation:', conv.id);
    }

    // Insert Message
    const { error: msgError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conv.id,
            sender_id: coupleUser.id,
            receiver_id: supportVendor.user_id, // Important: Receiver is the USER ID of the vendor
            content: `Canlı Destek Test Mesajı - ${new Date().toLocaleTimeString()} - Merhaba yardım edebilir misiniz?`
        });

    if (msgError) console.error('❌ Error sending support message:', msgError);
    else console.log('✅ Support message SENT successfully!');


    // 4. Create Platform Message (Between Couple and Random Vendor)
    const { data: randomVendor } = await supabase
        .from('vendors')
        .select('id, user_id, business_name')
        .neq('id', supportVendor.id) // Not support vendor
        .limit(1)
        .maybeSingle();

    if (randomVendor) {
        console.log('✅ Test Random Vendor:', randomVendor.business_name);
        // Check/Create Conversation
        let { data: pConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('vendor_id', randomVendor.id)
            .eq('user_id', coupleUser.id)
            .maybeSingle();

        if (!pConv) {
            const { data: newPConv } = await supabase
                .from('conversations')
                .insert({
                    vendor_id: randomVendor.id,
                    user_id: coupleUser.id
                    // status field removed
                })
                .select()
                .single();
            pConv = newPConv;
        }

        // Insert Message
        const { error: pMsgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: pConv.id,
                sender_id: coupleUser.id,
                receiver_id: randomVendor.user_id,
                content: `Platform Test Mesajı - ${new Date().toLocaleTimeString()} - Fiyat teklifi alabilir miyim?`
            });

        if (pMsgError) console.error('❌ Error sending platform message:', pMsgError);
        else console.log('✅ Platform message SENT successfully!');
    }
}

createTestMessages();
