import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
    console.log('Checking vendors table columns...');

    // We can't easily get types via select *, so we'll try to infer or use a system query if possible.
    // But standard Supabase client doesn't give types easily without introspection.
    // Instead, we will fetch one row and print the keys and the typeof values.

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching vendors:', error);
        return;
    }

    if (data && data.length > 0) {
        const row = data[0];
        console.log('--- Column Names and Sample Types ---');
        Object.keys(row).forEach(key => {
            const value = row[key];
            let type = typeof value;
            if (value === null) type = 'null';
            else if (Array.isArray(value)) type = 'array';

            console.log(`${key}: ${type}`);
        });
        console.log('-------------------------------------');
    } else {
        console.log('No rows found in vendors table.');
    }
}

checkColumns();
