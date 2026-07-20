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

async function runAuthTest() {
    console.log('🚀 Initializing authenticated flow test...');
    
    // 1. Create a fresh test user
    const email = `test.drawer.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;
    const password = 'password123';
    
    console.log(`👤 Registering test user: ${email}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'AI Test User',
                role: 'couple'
            }
        }
    });

    if (signUpError) {
        console.error('❌ Failed to sign up test user:', signUpError.message);
        process.exit(1);
    }
    console.log('✅ User registered successfully. ID:', signUpData.user.id);

    // 2. Launch browser
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Go to login page
        console.log('🌐 Navigating to login page...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

        // Fill credentials
        console.log('📝 Filling login form...');
        await page.waitForSelector('#email');
        await page.type('#email', email);
        await page.type('#password', password);

        // Click submit
        console.log('👆 Submitting credentials...');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard using URL matching (client-side routing)
        console.log('⏳ Waiting for redirection to dashboard (client-side)...');
        await page.waitForFunction(
            () => window.location.href.includes('dashboard') || window.location.href.includes('user-dashboard'),
            { timeout: 15000 }
        );
        const currentUrl = page.url();
        console.log(`📍 Current URL after login: ${currentUrl}`);

        console.log('✅ Logged in successfully!');

        // Navigate to Home to test drawer
        console.log('🌐 Navigating back to Home page...');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

        // Verify drawer bubble exists and click it
        console.log('🔍 Looking for AI chat trigger bubble (.ai-chat-trigger-bubble)...');
        await page.waitForSelector('.ai-chat-trigger-bubble', { timeout: 5000 });
        console.log('✅ Trigger bubble exists. Clicking it...');
        await page.click('.ai-chat-trigger-bubble');

        // Wait for drawer panel
        console.log('⏳ Waiting for drawer panel...');
        await page.waitForSelector('.ai-chat-drawer-panel', { timeout: 5000 });
        console.log('✅ Drawer panel opened!');

        // Check for authenticated user view container
        console.log('🔍 Verifying user-specific view is displayed...');
        await page.waitForSelector('.ai-chat-user-view', { timeout: 5000 });
        console.log('✅ Authenticated user view is active!');

        // Check if there is an input textarea
        console.log('🔍 Verifying chat input availability...');
        await page.waitForSelector('.ai-chat-input-wrapper textarea', { timeout: 3000 });
        console.log('✅ Textarea found!');

        // Type a message
        const testMessage = 'Merhaba, dugun banyosu ve davetiye hazirliklari hakkinda bilgi alabilir miyim?';
        console.log(`💬 Typing message: "${testMessage}"`);
        await page.type('.ai-chat-input-wrapper textarea', testMessage);

        // Send message
        console.log('👆 Clicking send button...');
        await page.click('.btn-send-message');

        // Wait for typing indicator
        console.log('⏳ Waiting for AI typing indicator...');
        await page.waitForSelector('.ai-typing-bubble', { timeout: 5000 });
        console.log('✅ Typing indicator shown!');

        // Wait for AI typing indicator to disappear and the new assistant bubble to appear
        console.log('⏳ Waiting for AI reply (this calls Gemini API)...');
        await page.waitForSelector('.ai-typing-bubble', { hidden: true, timeout: 20000 });
        console.log('✅ Typing indicator resolved.');

        // Get the latest assistant response bubble
        const bubbles = await page.$$('.assistant-bubble .message-content');
        if (bubbles.length > 0) {
            const lastResponse = await page.evaluate(el => el.textContent, bubbles[bubbles.length - 1]);
            console.log(`🤖 AI Response: "${lastResponse}"`);
            console.log('✅ Message response generated successfully!');
        } else {
            throw new Error('No assistant response bubble found.');
        }

        // Test WhatsApp handoff button visibility
        console.log('🔍 Checking if the Live Support Handoff button is present...');
        await page.waitForSelector('.btn-handoff', { timeout: 5000 });
        console.log('✅ Live Support Handoff button is visible!');

        console.log('🎉 All authenticated drawer tests passed successfully!');

    } catch (err) {
        console.error('❌ Test failed:', err);
        try {
            const errorEl = await page.$('.error-message');
            if (errorEl) {
                const text = await page.evaluate(el => el.textContent, errorEl);
                console.log(`❗ Page Error Message: "${text}"`);
            } else {
                console.log('❗ No .error-message element found on the page.');
            }
            const bodyHtml = await page.evaluate(() => document.body.innerHTML);
            console.log(`❗ Page URL when failed: ${page.url()}`);
        } catch (e) {
            console.error('Failed to dump error info:', e);
        }
        process.exit(1);
    } finally {
        await browser.close();
        console.log('🏁 Browser closed.');
        
        // Clean up test user in DB
        console.log(`🗑️ Cleaning up test user: ${signUpData.user.id}`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(signUpData.user.id);
        if (deleteError) {
            console.warn('⚠️ Could not delete test user using client auth (expected without service role key).');
        } else {
            console.log('✅ Test user cleaned up.');
        }
    }
}

runAuthTest();
