/**
 * register_confirmed_temp_user.js
 * 
 * Guerrilla Mail API kullanarak geçici bir e-posta adresi oluşturur,
 * Supabase'e kayıt olur, gelen onay e-postasını okuyup linke tıklayarak
 * hesabı onaylar ve giriş yapar.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const password = 'password123';
const GUERRILLA_API = 'http://api.guerrillamail.com/ajax.php';

let sessionCookie = '';

async function guerrillaFetch(params) {
    const url = new URL(GUERRILLA_API);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
    };
    if (sessionCookie) headers['Cookie'] = sessionCookie;

    const res = await fetch(url.toString(), { headers });

    // Save session cookie for subsequent requests
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
        const m = setCookie.match(/PHPSESSID=([^;]+)/);
        if (m) sessionCookie = `PHPSESSID=${m[1]}`;
    }
    return res.json();
}

async function run() {
    // ── Step 1: Get temp email ──────────────────────────────────────
    console.log('🔧 Step 1: Creating temporary email via Guerrilla Mail...');
    const gmData = await guerrillaFetch({ f: 'get_email_address' });
    const email = gmData.email_addr;
    const sidToken = gmData.sid_token;
    console.log(`   📧 Temp email: ${email}`);
    console.log(`   🔑 Password:   ${password}`);

    // ── Step 2: Register in Supabase ────────────────────────────────
    console.log('\n🔧 Step 2: Registering in Supabase...');
    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: 'AI Demo User', role: 'couple' } }
    });
    if (signUpError) { console.error('❌ signUp failed:', signUpError.message); process.exit(1); }
    console.log('   ✅ Supabase registration successful. Waiting for confirmation email...');

    // ── Step 3: Poll inbox for confirmation email ───────────────────
    console.log('\n🔧 Step 3: Polling inbox...');
    let verifyUrl = null;

    for (let i = 0; i < 25 && !verifyUrl; i++) {
        await new Promise(r => setTimeout(r, 4000));
        try {
            console.log(`   Attempt ${i + 1}/25...`);
            const listData = await guerrillaFetch({ f: 'check_email', seq: '0', sid_token: sidToken });
            const msgs = listData.list || [];

            for (const m of msgs) {
                const isFromSupabase = (m.mail_from || '').toLowerCase().includes('supabase')
                    || (m.mail_subject || '').toLowerCase().includes('confirm');
                if (!isFromSupabase) continue;

                console.log(`   ✅ Confirmation email found: "${m.mail_subject}"`);

                // Fetch full message body
                const msgData = await guerrillaFetch({ f: 'fetch_email', email_id: m.mail_id, sid_token: sidToken });
                const body = msgData.mail_body || '';

                // Extract verify link
                const match = body.match(/href="([^"]*supabase[^"]*verify[^"]*)"/i)
                           || body.match(/(https:\/\/[^\s"<>]*verify[^\s"<>]*)/i);
                if (match) {
                    verifyUrl = match[1].replace(/&amp;/g, '&');
                    console.log(`   🔗 Verify URL: ${verifyUrl.substring(0, 90)}...`);
                }
                break;
            }
        } catch (e) {
            console.warn(`   ⚠️  Poll error: ${e.message}`);
        }
    }

    if (!verifyUrl) {
        console.error('❌ No confirmation email received in time.');
        process.exit(1);
    }

    // ── Step 4: Follow verification link ───────────────────────────
    console.log('\n🔧 Step 4: Clicking verification link...');
    const verifyRes = await fetch(verifyUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log(`   HTTP ${verifyRes.status} → ${verifyRes.url.substring(0, 80)}`);

    // ── Step 5: Sign in to confirm ──────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));
    console.log('\n🔧 Step 5: Signing in to confirm account is active...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        console.error('   The verification link may not have worked. Try again or disable email confirmation in Supabase.');
        process.exit(1);
    }

    console.log('\n🎉 SUCCESS! Account confirmed and login verified.');
    console.log(`   User ID: ${signInData.user.id}`);
    console.log('\n📋 Run the full AI tool-use test with these credentials:');
    console.log(`   $env:TEST_USER_EMAIL="${email}"; $env:TEST_USER_PASSWORD="${password}"; node scripts/test_tool_use.js`);
    console.log('\n   Or for bash:');
    console.log(`   TEST_USER_EMAIL="${email}" TEST_USER_PASSWORD="${password}" node scripts/test_tool_use.js`);
}

run();
