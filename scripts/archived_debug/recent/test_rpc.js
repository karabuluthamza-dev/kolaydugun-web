import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnkyghovurnaizkhwgtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJua3lnaG92dXJuYWl6a2h3Z3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQyOTIsImV4cCI6MjA3OTMyMDI5Mn0.BRXibNmv3f2qq8VOhuIHnR_fCEHd4nbXMgTVT47PLw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpcDelete() {
    // Fetch latest 10 posts
    const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('id, title, slug')
        .order('created_at', { ascending: false })
        .limit(10);

    if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        return;
    }

    console.log('Fetched posts:', posts.length);

    // Find the post with title "dsfsdfgd" (checking inside the JSON object)
    const targetPost = posts.find(p => {
        // title might be an object { tr: "...", en: "..." } or null
        if (!p.title) return false;
        const titleStr = JSON.stringify(p.title);
        return titleStr.includes('dsfsdfgd');
    });

    if (!targetPost) {
        console.log('Target post "dsfsdfgd" not found in the last 10 posts.');
        return;
    }

    console.log('Found target post:', targetPost);

    // Attempt to delete using RPC
    console.log('Attempting RPC delete...');
    const { error: rpcError } = await supabase.rpc('delete_post_admin', { post_id: targetPost.id });

    if (rpcError) {
        console.log('RPC Error:', rpcError);
    } else {
        console.log('RPC Success (Unexpected with anon key!)');
    }
}

testRpcDelete();
