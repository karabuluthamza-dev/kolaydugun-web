const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch';

const TEST_CATEGORIES = [
    'brautkleid' // The correct slug we found
];

async function handleCookies(page) {
    try {
        const cookieButton = await page.$('button[id*="cookie"], a[class*="cookie"]', { timeout: 2000 });
        if (cookieButton) {
            console.log('🍪 Cookie banner found, clicking...');
            await cookieButton.click();
            await page.waitForTimeout(1000);
        }
    } catch (e) { }
}

async function runTest() {
    console.log('🚀 Starting Verification Scraper...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    for (const slug of TEST_CATEGORIES) {
        const url = `${BASE_URL}/${slug}/`;
        console.log(`\nTesting: ${slug} -> ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await handleCookies(page);

            const count = await page.evaluate(() => {
                return document.querySelectorAll('vendor-preview, .vendor-preview, .entry-card').length;
            });
            console.log(`   Items Found: ${count}`);

            if (count === 0) {
                console.log("⚠️ zero items? Dumping HTML...");
                const html = await page.content();
                // console.log(html.slice(0, 500)); // Too large
            }

        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
    }

    await browser.close();
}

runTest();
