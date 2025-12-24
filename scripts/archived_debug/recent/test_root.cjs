const puppeteer = require('puppeteer');

const BASE_URL_ROOT = 'https://www.hochzeitsportal24.de';

const TEST_SLUGS = [
    'brautmode',
    'brautkleider',
    'hochzeitsmode',
    'branchenbuch/brautmode', // Tekrar kontrol
    'branchenbuch/brautmoden'
];

async function runTest() {
    console.log('🚀 Starting Root URL Test...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    for (const slug of TEST_SLUGS) {
        const url = `${BASE_URL_ROOT}/${slug}/`;
        console.log(`\nTesting: ${url}`);
        try {
            const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
            console.log(`📡 Status: ${response.status()}`);
            if (response.status() === 200) {
                const title = await page.title();
                console.log(`   Title: ${title}`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }
    await browser.close();
}

runTest();
