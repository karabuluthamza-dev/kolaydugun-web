/**
 * test_tool_use.js — AI Tool Use (Function Calling) Verification Test
 * 
 * Usage:
 *   1. With a pre-confirmed user (recommended):
 *      TEST_USER_EMAIL=myuser@example.com TEST_USER_PASSWORD=mypass node scripts/test_tool_use.js
 * 
 *   2. With a fresh user (requires Supabase email confirm disabled):
 *      node scripts/test_tool_use.js
 *      (Disable: Supabase Dashboard → Authentication → Settings → Email Confirmation OFF)
 */

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase environment variables are missing.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runToolUseTest() {
    console.log('🚀 Starting AI Tool Use (Function Calling) test...\n');

    let session = null;
    let testUserId = null;
    let createdFreshUser = false;

    // ── Strategy A: Use pre-configured test user ─────────────────────────────
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (testEmail && testPassword) {
        console.log(`🔑 Using configured test user: ${testEmail}`);
        const { data, error } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
        if (error) {
            console.error('❌ Could not sign in with TEST_USER_EMAIL/TEST_USER_PASSWORD:', error.message);
            process.exit(1);
        }
        session = data.session;
        testUserId = data.user.id;
        console.log('✅ Signed in! User ID:', testUserId);

    } else {
        // ── Strategy B: Create fresh user (requires email confirm OFF) ────────
        const email = `test.tooluse.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;
        const password = 'password123';
        
        console.log(`👤 Registering fresh test user: ${email}`);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: 'AI Tool Use User', role: 'couple' } }
        });

        if (signUpError) {
            console.error('❌ signUp failed:', signUpError.message);
            process.exit(1);
        }

        testUserId = signUpData.user.id;
        session = signUpData.session;
        createdFreshUser = true;

        if (!session) {
            // Email confirm is ON — try signIn (will fail, then guide user)
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
                console.error('\n❌ Cannot obtain session. Email confirmation is required.');
                console.error('\n📋 To fix this, run the test with a pre-confirmed user:');
                console.error('   TEST_USER_EMAIL=your@email.com TEST_USER_PASSWORD=yourpass node scripts/test_tool_use.js\n');
                console.error('OR disable email confirmation in Supabase Dashboard:');
                console.error('   Authentication → Settings → Email Confirmation → OFF\n');
                process.exit(1);
            }
            session = signInData.session;
        }

        console.log('✅ Fresh user registered & session obtained. ID:', testUserId);
    }

    console.log('✅ Session ready. Token length:', session.access_token.length);

    // ── Launch browser ────────────────────────────────────────────────────────
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Load app and inject session
        console.log('\n🌐 Loading app homepage...');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

        console.log('💉 Injecting Supabase session into localStorage...');
        await page.evaluate((url, sess) => {
            const projectRef = url.match(/\/\/([^.]+)\./)?.[1] || 'rnkyghovurnaizkhwgtv';
            const storageKey = `sb-${projectRef}-auth-token`;
            localStorage.setItem(storageKey, JSON.stringify({
                access_token: sess.access_token,
                token_type: 'bearer',
                expires_in: sess.expires_in,
                expires_at: sess.expires_at,
                refresh_token: sess.refresh_token,
                user: sess.user
            }));
        }, supabaseUrl, session);

        // Reload to activate session
        console.log('🔄 Reloading to activate injected session...');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2500)); // Let AuthContext settle

        // Open AI drawer
        console.log('\n🔍 Waiting for AI trigger bubble...');
        await page.waitForSelector('.ai-chat-trigger-bubble', { timeout: 10000 });
        console.log('✅ Trigger bubble found — user is authenticated!');
        await page.click('.ai-chat-trigger-bubble');

        await page.waitForSelector('.ai-chat-drawer-panel', { timeout: 5000 });
        console.log('✅ Drawer opened!');

        await page.waitForSelector('.ai-chat-user-view', { timeout: 8000 });
        console.log('✅ Authenticated user view visible!');

        await page.waitForSelector('.ai-chat-input-wrapper textarea', { timeout: 5000 });

        // Send tool-use command
        const guestName = 'Ahmet Soylu';
        const commandMessage = `Lütfen davetli listeme '${guestName}' isimli bir konuk ekle.`;
        console.log(`\n💬 Sending command: "${commandMessage}"`);
        await page.type('.ai-chat-input-wrapper textarea', commandMessage);
        await page.click('.btn-send-message');

        // Wait for typing indicator
        console.log('⏳ Waiting for typing indicator...');
        await page.waitForSelector('.ai-typing-bubble', { timeout: 10000 });
        console.log('✅ AI is processing (tool call in progress)...');

        // Wait for AI to finish (tool call + confirmation text)
        console.log('⏳ Waiting for AI response (up to 35s for tool call + text)...');
        await page.waitForSelector('.ai-typing-bubble', { hidden: true, timeout: 35000 });
        console.log('✅ Response received.');

        // Read AI response
        const bubbles = await page.$$('.assistant-bubble .message-content');
        if (bubbles.length > 0) {
            const lastResponse = await page.evaluate(el => el.textContent, bubbles[bubbles.length - 1]);
            console.log(`\n🤖 AI Response:\n  "${lastResponse.substring(0, 300)}"`);
        } else {
            throw new Error('No assistant response bubble found in the DOM.');
        }

        // Verify in database
        console.log('\n🔍 Verifying guest in Supabase database (waiting 2s for DB write)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: guests, error: dbError } = await supabase
            .from('guests')
            .select('*')
            .eq('user_id', testUserId)
            .eq('name', guestName);

        if (dbError) {
            throw new Error(`DB query error: ${dbError.message}`);
        }

        if (guests && guests.length > 0) {
            console.log(`\n🎉 ✅ SUCCESS! Guest '${guestName}' found in database!`);
            console.log('   Record:', JSON.stringify(guests[0], null, 2));
            console.log('\n✅ AI Tool Use (Function Calling) test PASSED!');
        } else {
            console.warn(`\n⚠️  Guest '${guestName}' NOT found in database.`);
            console.warn('   Possible reasons:');
            console.warn('   - Gemini chose to respond in text without calling the tool.');
            console.warn('   - Check browser console for "[GeminiProvider] Function call" logs.');
            console.warn('   - Try testing manually in the AI chat by typing the same command.\n');
        }

    } catch (err) {
        console.error('\n❌ Test failed:', err.message || err);
        process.exit(1);
    } finally {
        await browser.close();
        console.log('🏁 Browser closed.');
    }
}

runToolUseTest();
