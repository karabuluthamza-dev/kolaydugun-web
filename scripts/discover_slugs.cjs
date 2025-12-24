const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDiscovery() {
    console.log('🚀 Starting Category Discovery...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        console.log(`Navigating to ${BASE_URL}...`);
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(2000);

        // Extract all links that look like category links
        const categories = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="/branchenbuch/"]'));
            return links.map(a => ({
                text: a.innerText.trim(),
                href: a.href,
                slug: a.href.split('/branchenbuch/')[1]?.replace('/', '') || ''
            })).filter(c => c.slug && c.slug !== 'branchenbuch');
        });

        console.log('✅ Found Categories:');
        const unique = {};
        categories.forEach(c => {
            if (!unique[c.slug]) {
                unique[c.slug] = c.text;
                console.log(`   - [${c.slug}] : ${c.text}`);
            }
        });

    } catch (error) {
        console.error('❌ Discovery failed:', error.message);
    }

    await browser.close();
}

runDiscovery();
