const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch/brautkleid/';

async function logImport(item) {
    console.log(`💾 Attempting to save: ${item.business_name}`);

    // Check dupe
    const { data: existing } = await supabase
        .from('vendor_imports')
        .select('id')
        .eq('source_url', item.source_url)
        .maybeSingle();

    if (existing) {
        console.log(`   ⏭  Already in DB: ${item.business_name}`);
        return;
    }

    const { error } = await supabase.from('vendor_imports').insert({
        source_url: item.source_url,
        source_name: 'hochzeitsportal24',
        external_id: item.source_url,
        business_name: item.business_name,
        category_raw: 'Bridal Mock',
        category_id: 'Bridal Fashion', // This is the value we are testing
        city_raw: item.cityRaw,
        city_id: null,
        status: 'pending',
        description: 'Test Import'
    });

    if (error) {
        console.error('  ⚠️ Database Error:', error.message);
    } else {
        console.log(`  ✅ Saved NEW: ${item.business_name}`);
    }
}

async function runTest() {
    console.log('🚀 Starting Import Simulation...');
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Extract items (Simple DOM)
        const items = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('vendor-preview, .vendor-preview, .entry-card'));
            return cards.map(c => {
                const nameEl = c.querySelector('mat-card-title, .vendor-preview-title, h3');
                const linkEl = c.querySelector('a[href*="/branchenbuch/"]');
                const locEl = c.querySelector('.vendor-preview-address, .address');
                if (!nameEl || !linkEl) return null;
                return {
                    business_name: nameEl.innerText.trim(),
                    source_url: linkEl.href,
                    cityRaw: locEl ? locEl.innerText.trim() : 'Unknown'
                };
            }).filter(i => i);
        });

        console.log(`Found ${items.length} items. Trying to save first 3...`);
        for (const item of items.slice(0, 3)) {
            await logImport(item);
        }

    } catch (e) {
        console.error('Sim Error:', e);
    }
    await browser.close();
}

runTest();
