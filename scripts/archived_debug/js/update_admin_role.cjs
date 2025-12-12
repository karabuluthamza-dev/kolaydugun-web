
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdmin() {
    console.log('Updating user role...');
    // We update all users with this email, just in case
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', 'testcouple123@example.com')
        .select();

    if (error) {
        console.error('Error updating role:', error);
    } else {
        console.log('Success! User updated:', data);
    }
}

setAdmin();
