import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.split(/\r?\n/).find(l => l.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim();
const key = env.split(/\r?\n/).find(l => l.startsWith('VITE_SUPABASE_ANON_KEY')).split('=')[1].trim();

const supabase = createClient(url, key);

async function find() {
    const { data, error } = await supabase.from('profiles').select('id, role, email').eq('role', 'admin');
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
}

find();
