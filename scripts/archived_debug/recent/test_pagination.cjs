const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch/brautkleid';

async function runTest() {
    console.log('🚀 Testing Pagination...');
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Try Page 2 formats
    const urls = [
        `${BASE_URL}/page/2/`,     // Old format
        `${BASE_URL}/?page=2`      // New format suspect
    ];

    for (const url of urls) {
        console.log(`\nTesting: ${url}`);
        try {
            const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
            console.log(`📡 Status: ${response.status()}`);
            if (response.status() === 200) {
                const count = await page.evaluate(() => document.querySelectorAll('.entry-card, .vendor-preview').length);
                console.log(`   Items: ${count}`);
                if (count > 0) console.log("   ✅ Valid Page!");
            }
        } catch (e) { console.error(e.message); }
    }

    await browser.close();
}

runTest();
