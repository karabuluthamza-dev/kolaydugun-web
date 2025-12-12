
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testContactForm() {
    console.log('Sending test message to Contact Form...');

    const testMessage = {
        name: 'Test Robot',
        email: 'test@robot.com',
        message: 'Bu otomatik bir test mesajıdır. İletişim formu çalışıyor mu diye kontrol ediliyor. ' + new Date().toLocaleString(),
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('contact_messages')
        .insert([testMessage])
        .select();

    if (error) {
        console.error('❌ Error sending test message:', error);
    } else {
        console.log('✅ Test message sent successfully!');
        console.log('Inserted Data:', data);
    }
}

testContactForm();
