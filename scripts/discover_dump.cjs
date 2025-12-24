const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch';

async function runDiscovery() {
    console.log('🚀 Starting Category Discovery...');
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        const categories = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href*="/branchenbuch/"]'))
                .map(a => ({
                    text: a.innerText.trim(),
                    href: a.href,
                    slug: a.href.split('/branchenbuch/')[1]?.replace('/', '')
                }))
                .filter(c => c.slug);
        });

        const data = JSON.stringify(categories, null, 2);
        fs.writeFileSync('slugs_dump.json', data);
        console.log(`✅ Saved ${categories.length} slugs to slugs_dump.json`);
    } catch (e) { console.error(e); }
    await browser.close();
}
runDiscovery();
