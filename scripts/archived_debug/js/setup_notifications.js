import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupNotifications() {
    console.log('Setting up notifications table...\n');

    try {
        // Read SQL file
        const sql = fs.readFileSync(path.resolve(__dirname, 'create_notifications_table.sql'), 'utf8');

        console.log('⚠️  IMPORTANT: This script needs to be run in Supabase SQL Editor');
        console.log('Copy the SQL from create_notifications_table.sql and run it in:');
        console.log('👉 Supabase Dashboard → SQL Editor → New Query\n');

        console.log('Alternatively, you can use the Supabase CLI:');
        console.log('👉 supabase db push\n');

        // Test if table exists
        const { data, error } = await supabase
            .from('notifications')
            .select('count')
            .limit(1);

        if (error) {
            if (error.code === '42P01') {
                console.log('❌ Notifications table does not exist yet.');
                console.log('📋 Please run the SQL in create_notifications_table.sql\n');
            } else {
                console.log('❌ Error:', error.message);
            }
        } else {
            console.log('✅ Notifications table exists!');
            console.log('✅ Ready to use notifications system\n');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

setupNotifications();
