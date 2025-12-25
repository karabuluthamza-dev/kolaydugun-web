import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, status, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Posts found:', data.length);
    data.forEach(p => {
        console.log(`- [${p.id}] [${p.slug}] [${p.status}] [${p.created_at}] ${JSON.stringify(p.title).substring(0, 50)}...`);
    });
}

checkPosts();
