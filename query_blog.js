import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.split(/\r?\n/).find(l => l.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim();
const key = env.split(/\r?\n/).find(l => l.startsWith('VITE_SUPABASE_ANON_KEY')).split('=')[1].trim();

const supabase = createClient(url, key);

async function run() {
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug');

    if (error) {
        console.error(error);
    } else {
        console.log('POST DATA:', JSON.stringify(data, null, 2));
    }
}

run();
