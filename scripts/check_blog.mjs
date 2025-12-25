import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('posts').select('id, slug, title').eq('slug', 'canli-sarki-istek-sistemi');
    console.log('DATA:', JSON.stringify(data, null, 2));
    if (error) console.error('ERROR:', error);
}
check();
