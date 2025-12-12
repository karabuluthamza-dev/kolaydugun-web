import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_KEY; // Use service key to bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTempAdmin() {
    const email = 'temp_admin@kolaydugun.com';
    const password = 'temp_password_123';

    console.log(`Creating temp admin: ${email}`);

    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Temp Admin',
                role: 'admin' // Try to set role directly, though might be overridden
            }
        }
    });

    if (authError) {
        console.error('Signup error:', authError.message);
        // If user already exists, try to sign in to get ID? 
        // Or just update by email if possible (profiles table usually has ID, not email)
        // Let's assume we need to find the user ID.
        // But we can't list users easily without admin API.
        // Service key allows admin API.
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            console.log('User exists, updating role...');
            await updateRole(existingUser.id);
            return;
        }
        return;
    }

    if (authData.user) {
        console.log('User created, updating role...');
        await updateRole(authData.user.id);
    }
}

async function updateRole(userId) {
    // 2. Update profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

    if (profileError) {
        console.error('Profile update error:', profileError);
    } else {
        console.log('✅ Success! User is now admin.');
        console.log('Email: temp_admin@kolaydugun.com');
        console.log('Password: temp_password_123');
    }
}

createTempAdmin();
