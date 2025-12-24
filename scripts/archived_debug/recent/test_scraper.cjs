const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch';

// YENİ ADAYLAR
const TEST_CATEGORIES = [
    'brautmoden',      // Aday 1
    'brautkleider',    // Aday 2
    'brautmode-abendmode', // Aday 3
    'hochzeitsfotos',  // Doğrulandı
    'braeutigam',      // Doğrulandı
    'trauringe'        // Tekrar kontrol
];

async function runTest() {
    console.log('🚀 Starting Test Scraper (Phase 2)...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    for (const slug of TEST_CATEGORIES) {
        const url = `${BASE_URL}/${slug}/`;
        console.log(`\nTesting: ${slug} -> ${url}`);

        try {
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            if (response.status() === 404) {
                console.log(`❌ 404 Not Found`);
                continue;
            }

            console.log(`✅ 200 OK`);

            // Check content count
            const count = await page.evaluate(() => {
                return document.querySelectorAll('vendor-preview, .vendor-preview, .entry-card').length;
            });
            console.log(`   Items Found: ${count}`);

        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
    }

    await browser.close();
}

runTest();
