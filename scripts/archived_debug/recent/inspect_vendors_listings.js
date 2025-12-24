import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf-8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTableSchema(tableName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Inspecting table: ${tableName}`);
    console.log('='.repeat(60));

    try {
        // Try to fetch one row to see if table exists
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === '42P01') {
                console.log(`❌ Table '${tableName}' does NOT exist in Supabase`);
                return { exists: false, error: error.message };
            }
            console.log(`⚠️ Error querying table: ${error.message}`);
            return { exists: false, error: error.message };
        }

        console.log(`✅ Table '${tableName}' EXISTS in Supabase`);

        if (data && data.length > 0) {
            console.log(`\nSample row structure:`);
            const columns = Object.keys(data[0]);
            console.log(`Columns (${columns.length}):`, columns.join(', '));

            console.log(`\nColumn details:`);
            columns.forEach(col => {
                const value = data[0][col];
                const type = typeof value;
                const isNull = value === null;
                console.log(`  - ${col}: ${isNull ? 'NULL' : type} ${isNull ? '' : `(example: ${JSON.stringify(value).substring(0, 50)})`}`);
            });
        } else {
            console.log(`\n⚠️ Table exists but is empty. Cannot determine column structure from data.`);
            console.log(`You may need to check the Supabase dashboard for schema details.`);
        }

        return { exists: true, data };

    } catch (err) {
        console.log(`❌ Unexpected error: ${err.message}`);
        return { exists: false, error: err.message };
    }
}

async function main() {
    console.log('Starting table schema inspection...\n');
    console.log(`Supabase URL: ${supabaseUrl}`);

    // Inspect vendors table
    const vendorsResult = await inspectTableSchema('vendors');

    // Inspect listings table
    const listingsResult = await inspectTableSchema('listings');

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`vendors table: ${vendorsResult.exists ? '✅ EXISTS' : '❌ DOES NOT EXIST'}`);
    console.log(`listings table: ${listingsResult.exists ? '✅ EXISTS' : '❌ DOES NOT EXIST'}`);
    console.log('='.repeat(60));
}

main().catch(console.error);
