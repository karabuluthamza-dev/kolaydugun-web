const puppeteer = require('puppeteer');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load .env file

// Supabase Init
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURATION ---
const BASE_URL = 'https://www.hochzeitsportal24.de/branchenbuch';
const DELAY = { min: 2000, max: 5000 };

// CATEGORY MAPPING (Rakip -> Bizim ID)
// NOTE: You must ensure these IDs exist in your 'vendor_categories' table (slugs)
const CATEGORY_MAP = {
    // -- Primary Categories --
    'hochzeitslocations': 'Wedding Venues',
    'brautkleid': 'Bridal Fashion',              // FIXED: Was brautmode
    'hochzeitsfrisuren': 'Hair & Make-Up',       // FIXED: Was frisur-make-up
    'hochzeitsfotos': 'Wedding Photography',     // FIXED: Was hochzeitsfotograf
    'hochzeitsvideo': 'Wedding Videography',     // FIXED: Was hochzeitsvideograf
    'trauringe': 'Wedding Rings',
    'wedding-planer': 'Wedding Planners',        // FIXED: Was hochzeitsplaner
    'hochzeitstorte': 'Wedding Cakes',
    'catering': 'Catering & Party Service',      // FIXED: Was catering-partyservice
    'djs': 'DJs',
    'musiker': 'Musicians',                      // FIXED: Was hochzeitsband-musik
    'hochzeitsautos': 'Wedding Cars',            // FIXED: Was hochzeitsauto
    'blumen-deko': 'Flowers & Decoration',       // FIXED: Was hochzeitsfloristik / hochzeitsdeko

    // -- Secondary / New Categories --
    'braeutigam': 'Groom Suits',                 // FIXED: Was herrenmode
    'freie-redner': 'Wedding Speakers (Trauredner)', // FIXED: Was trauredner
    'einladungskarten': 'Invitations & Stationery', // FIXED: Was hochzeitskarten
    'fotobox': 'Photobox',
    'unterhaltung': 'Entertainment',
    'tanzschule': 'Entertainment',

    // -- Location Specific Slugs (Rakip -> Bizim ID) --
    'hochzeitslocationsort/muenchen': 'Wedding Venues',
    'hochzeitslocationsort/hamburg': 'Wedding Venues',
    'hochzeitslocationsort/berlin': 'Wedding Venues',
    'hochzeitslocationsort/koeln': 'Wedding Venues',
    'hochzeitslocationsort/frankfurt': 'Wedding Venues'
};

// --- HELPER FUNCTIONS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => sleep(Math.floor(Math.random() * (DELAY.max - DELAY.min + 1) + DELAY.min));

async function getAdminCities() {
    console.log('🌍 Fetching admin cities...');
    const { data, error } = await supabase.from('admin_cities').select('id, name'); // CHANGED: city_name -> name
    if (error) {
        console.error('❌ Error fetching cities:', error);
        return [];
    }
    return data.map(c => ({ id: c.id, city_name: c.name })); // Map back to city_name for consistency
}

async function getCityAliases() {
    console.log('🔗 Fetching city aliases...');
    // Table might not exist yet, handle gracefully
    try {
        const { data, error } = await supabase.from('admin_city_aliases').select('alias_name, target_city_id');
        if (error) {
            console.warn('⚠️ Could not fetch aliases (Table might be missing):', error.message);
            return [];
        }
        return data;
    } catch (e) {
        return [];
    }
}

async function handleCookies(page) {
    try {
        // Common selectors for cookie buttons
        const cookieSelectors = [
            'button[id*="cookie"]',
            'a[class*="cookie"]',
            '.cc-btn.cc-accept-all',
            'button.cmptxt_btn_yes', // Common German cookie plugin
            'a.cmpboxbtnaccept'      // Specifically for Hochzeitsportal24
        ];

        for (const sel of cookieSelectors) {
            const btn = await page.$(sel);
            if (btn) {
                console.log('🍪 Cookie banner found, clicking...');
                await btn.click();
                await sleep(1000);
                break;
            }
        }

        console.log('🍪 Checking for cookie banner in all frames...');
        const frames = page.frames();
        let clicked = false;

        for (const frame of frames) {
            try {
                const btn = await frame.evaluate(() => {
                    const allBtns = Array.from(document.querySelectorAll('button, a, span[role="button"], div[role="button"]'));
                    const agreeBtn = allBtns.find(b =>
                        b.innerText.trim() === 'Zustimmen' ||
                        b.innerText.includes('Alle akzeptieren')
                    );
                    if (agreeBtn) {
                        agreeBtn.click();
                        return true;
                    }
                    return false;
                });

                if (btn) {
                    console.log(`✅ Clicked cookie button in frame: ${frame.name() || 'unnamed'}`);
                    clicked = true;
                    break;
                }
            } catch (err) {
                // Ignore frame access errors
            }
        }

        if (clicked) {
            console.log('⏳ Waiting for cookie banner to fade...');
            await sleep(3000);
        } else {
            console.log('🤷 No cookie button found in any frame. Trying brute force coordinates...');
            // Brute force click in the middle-ish/left of the screen where "Zustimmen" usually is
            // Based on screenshot, it's a modal in the center. Left button is Agree.
            // Let's try a few spots.
            try {
                const viewport = page.viewport();
                if (viewport) {
                    const x = viewport.width / 2 - 100; // Slightly left of center
                    const y = viewport.height / 2 + 50;  // Slightly below center
                    console.log(`🖱️ Clicking at ${x}, ${y}`);
                    await page.mouse.click(x, y);
                    await sleep(1000);
                }
            } catch (e) { }
        }

    } catch (e) { console.log('⚠️ Cookie click error:', e.message); }
}

async function extractJsonData(page) {
    return await page.evaluate(() => {
        let vendorList = [];
        let jsonVendorSlugs = new Set(); // Track slugs from JSON to avoid duplicates

        // 1. Try Primary ID (serverApp-state) - Best for Initial Load
        const stateEl = document.getElementById('serverApp-state');
        if (stateEl) {
            try {
                const json = JSON.parse(stateEl.innerText || stateEl.textContent);
                const ngrx = json?.NGRX_STATE;
                const stateRoot = ngrx?.__zone_symbol__value || ngrx;
                const jsonVendors = stateRoot?.vendors?.vendors || [];

                if (jsonVendors.length > 0) {
                    vendorList = jsonVendors;
                    jsonVendors.forEach(v => jsonVendorSlugs.add(v.slug));
                    console.log(`✅ Found ${jsonVendors.length} vendors in serverApp-state.`);
                }
            } catch (e) {
                console.error('Primary JSON parse failed:', e);
            }
        }

        // 2. Fallback: Search ALL scripts for "vendors": [...] pattern
        if (vendorList.length === 0) {
            console.log('⚠️ Primary extract failed/empty. Searching all scripts...');
            const scripts = Array.from(document.querySelectorAll('script'));

            for (const script of scripts) {
                const content = script.innerText || script.textContent;
                if (!content || content.length < 100) continue;

                try {
                    const match = content.match(/"vendors"\s*:\s*(\[\s*\{.*?"slug".*?\}\])/);
                    if (match && match[1]) {
                        const potentialJson = JSON.parse(match[1]);
                        if (Array.isArray(potentialJson) && potentialJson.length > 0) {
                            vendorList = potentialJson;
                            potentialJson.forEach(v => jsonVendorSlugs.add(v.slug));
                            console.log(`✅ Found vendors in script (Type: ${script.type}, ID: ${script.id})`);
                            break;
                        }
                    }
                } catch (re) {
                    // Ignore parse errors
                }
            }
        }

        // 3. ALWAYS run DOM Scraping to catch Premium/Featured/Überregional vendors not in JSON
        console.log('🔎 Running DOM scraping to catch any missing vendors...');

        // Find all vendor cards on the page (Angular Material cards with links to branchenbuch)
        const vendorLinks = Array.from(document.querySelectorAll('a[href*="/branchenbuch/"]'))
            .filter(a => a.querySelector('mat-card-title') || a.querySelector('.vendor-preview-title'));

        let domAddedCount = 0;
        for (const link of vendorLinks) {
            try {
                const nameEl = link.querySelector('mat-card-title, .vendor-preview-title');
                if (!nameEl) continue;

                const name = nameEl.innerText.trim();
                const href = link.getAttribute('href') || link.href;
                const slug = href.split('/').filter(p => p).pop();

                // Skip if already found in JSON
                if (jsonVendorSlugs.has(slug)) continue;

                // Find city/address - usually in a <p> tag near the title
                const allP = link.querySelectorAll('p');
                let city = '';
                let postalCode = '';

                for (const p of allP) {
                    let text = p.innerText.trim();

                    // Remove Material Design icon names that get included in innerText
                    text = text.replace(/^(location_on|place|pin_drop|room)\s*/i, '');

                    // German zip code pattern: 5 digits
                    const zipMatch = text.match(/(\d{5})\s+(.+)/);
                    if (zipMatch) {
                        postalCode = zipMatch[1];
                        city = zipMatch[2];
                        break;
                    } else if (text && !text.includes('€') && !text.includes('Rezension') && text.length < 50) {
                        // Probably city name without zip (e.g., "Überregional" or just "München")
                        city = text;
                    }
                }

                // Construct vendor object
                vendorList.push({
                    name: name,
                    slug: slug,
                    location: {
                        city: city || 'Überregional',
                        postalCode: postalCode
                    },
                    contactInfo: {},
                    category: {
                        slug: 'dom-scraped',
                        title: 'DOM Scraped'
                    },
                    summary: 'DOM Scraped (Not in JSON)',
                    _isDomScraped: true,
                    _domLink: href.startsWith('/') ? `https://www.hochzeitsportal24.de${href}` : href
                });
                jsonVendorSlugs.add(slug); // Mark as processed
                domAddedCount++;
            } catch (err) {
                console.error('DOM scrape error:', err);
            }
        }

        if (domAddedCount > 0) {
            console.log(`✅ DOM scraping added ${domAddedCount} additional vendors not found in JSON.`);
        }

        if (vendorList.length === 0) return [];

        return vendorList.map(v => {
            const location = v.location || {};
            const contact = v.contactInfo || {};
            const category = v.category || {};

            let cityRaw = location.city || '';
            if (location.postalCode) {
                cityRaw = `${location.postalCode} ${cityRaw}`;
            }

            // If DOM scraped, link is already full. If JSON, construct it.
            let link = v._domLink;
            if (!link) {
                const vendorSlug = v.slug;
                const categorySlug = category.slug || 'dienstleister';
                link = `https://www.hochzeitsportal24.de/branchenbuch/${categorySlug}/${vendorSlug}/`;
            }

            return {
                business_name: v.name,
                category_raw: category.title || 'Uncategorized',
                cityRaw: cityRaw.trim(),
                source_url: link,

                email: contact.email,
                phone: contact.phone || contact.mobile,
                website: contact.website,
                instagram: contact.instagram,
                description: v.summary || v.description,

                raw_data: v
            };
        });
    });
}

// --- MAIN SCRAPER ---
async function scrapeCategory(page, categorySlug, ourCategoryId, cities, aliases, isDeepSync = false) {
    let currentPage = 1;
    let hasNextPage = true;
    let lastPageFirstItemSlug = null; // Track duplicate content
    let consecutiveEmptyPages = 0; // Number of pages with 0 new items

    // NEW: Sliding window for smarter stop detection
    const recentNewCounts = []; // Track new items per page (last N pages)
    const WINDOW_SIZE = isDeepSync ? 5 : 2; // Deep: last 5 pages, Normal: last 2 pages
    let totalNewInCategory = 0;

    while (hasNextPage && currentPage <= 25) {
        console.log(`\n📂 Scraping Category: ${categorySlug} -> ${ourCategoryId} | Page: ${currentPage}`);
        const url = currentPage === 1
            ? `${BASE_URL}/${categorySlug}/`
            : `${BASE_URL}/${categorySlug}/?page=${currentPage}`; // CHANGED: Updated pagination format

        try {
            // Update Referer for pagination to look natural
            if (currentPage > 1) {
                const prevUrl = currentPage === 2
                    ? `${BASE_URL}/${categorySlug}/`
                    : `${BASE_URL}/${categorySlug}/?page=${currentPage - 1}`; // CHANGED: Updated referer format

                await page.setExtraHTTPHeaders({
                    'Referer': prevUrl
                });
            }

            const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Check for 404 or redirect back to page 1 (End of pagination)
            // If ?page=X fails, try /seite-X/ (The site uses both occasionally)
            if (response.status() === 404 && url.includes('?page=')) {
                const fallbackUrl = url.replace('?page=', 'seite-').replace(/\/?$/, '/');
                console.log(`📡 ?page=X failed, trying fallback: ${fallbackUrl}`);
                const fallbackResponse = await page.goto(fallbackUrl, { waitUntil: 'networkidle2', timeout: 60000 });
                if (fallbackResponse.status() === 404 || fallbackResponse.url() === `${BASE_URL}/${categorySlug}/`) {
                    console.log('🛑 End of pagination reached (Fallback failed).');
                    hasNextPage = false;
                    break;
                }
            } else if (response.status() === 404 || (currentPage > 1 && page.url() === `${BASE_URL}/${categorySlug}/`)) {
                console.log('🛑 End of pagination reached.');
                hasNextPage = false;
                break;
            }

            await handleCookies(page);

            const pageData = await extractJsonData(page);

            if (!pageData || pageData.length === 0) {
                console.log('⚠️ No more items found. Stopping pagination.');
                hasNextPage = false;
                break;
            }

            // DUPLICATE CONTENT CHECK (Infinite loop prevention)
            // If the first item on the current page is the same as the first item on the previous page,
            // it means we've hit the end of unique content or a redirect loop.
            if (lastPageFirstItemSlug && pageData[0].slug === lastPageFirstItemSlug) {
                console.log(`🛑 DUPLICATE CONTENT DETECTED! Page ${currentPage} has the same first item as previous page.`);
                hasNextPage = false;
                break;
            }
            lastPageFirstItemSlug = pageData[0].slug;

            console.log(`🔎 Found ${pageData.length} items on page ${currentPage}. Processing...`);

            let newOnPage = 0;
            let existingOnPage = 0;

            for (const item of pageData) {
                const isNew = await processItem(page, item, ourCategoryId, cities, aliases);
                if (isNew) newOnPage++;
                else existingOnPage++;
            }

            console.log(`   📊 Page ${currentPage} summary: ${newOnPage} NEW, ${existingOnPage} EXISTING`);
            totalNewInCategory += newOnPage;

            // Update status with progress log
            await supabase.from('scraper_status').update({
                logs: `🔄 İşleniyor: ${ourCategoryId} (${currentPage}. sayfa, +${newOnPage} yeni, toplam: ${totalNewInCategory})`
            }).eq('id', 'hp24_main');

            // NEW: Sliding window tracking
            recentNewCounts.push(newOnPage);
            if (recentNewCounts.length > WINDOW_SIZE) {
                recentNewCounts.shift(); // Remove oldest
            }

            // CONSECUTIVE EMPTY PAGES CHECK
            if (newOnPage === 0) {
                consecutiveEmptyPages++;
            } else {
                consecutiveEmptyPages = 0;
            }

            // ============================================================
            // SMART STOPPING LOGIC V2 - Much more aggressive for efficiency
            // ============================================================

            // 1. NORMAL MODE: Stop after just 2 consecutive empty pages
            // This is the most common case - category was already scraped
            if (!isDeepSync && consecutiveEmptyPages >= 2) {
                console.log(`🛑 NORMAL MODE: Stopping after ${consecutiveEmptyPages} consecutive pages with 0 new items.`);
                console.log(`   💡 Tip: Use Deep Sync if you want to check ALL pages.`);
                hasNextPage = false;
                break;
            }

            // 2. DEEP SYNC MODE: Use sliding window - stop if very few new items in last N pages
            if (isDeepSync && recentNewCounts.length >= WINDOW_SIZE) {
                const totalInWindow = recentNewCounts.reduce((a, b) => a + b, 0);
                const threshold = 3; // If less than 3 new items in last 5 pages, stop

                if (totalInWindow < threshold) {
                    console.log(`🛑 DEEP MODE: Only ${totalInWindow} new items in last ${WINDOW_SIZE} pages. Stopping to save resources.`);
                    hasNextPage = false;
                    break;
                }
            }

            // 3. Safety: If we've scanned many pages and found nothing new, stop
            if (currentPage >= 5 && totalNewInCategory === 0) {
                console.log(`🛑 SAFETY: Scanned ${currentPage} pages but found 0 new items. Category appears fully synced.`);
                hasNextPage = false;
                break;
            }

            currentPage++;
            await randomDelay();

        } catch (e) {
            console.error(`❌ Error on page ${currentPage}:`, e.message);
            hasNextPage = false;
        }
    }

    console.log(`\n📈 Category ${ourCategoryId} complete: ${totalNewInCategory} new vendors added from ${currentPage} pages.`);
}

async function processItem(page, item, categoryId, cities, aliases) {
    // Handle vendors without city data (including "Überregional" - nationwide vendors)
    if (!item.cityRaw || item.cityRaw === 'Überregional' || item.cityRaw.trim() === '') {
        console.log(`🌍 Nationwide/Unknown: ${item.business_name} (${item.cityRaw || 'No city'}) - saving as pending`);
        // Still save these vendors - they might be valuable nationwide services
        const isNew = await logImport(item, categoryId, 'pending', 'Nationwide or unknown location', null);
        if (isNew) await randomDelay();
        return isNew;
    }

    // -------------------------------------------------------------------------
    // City Matching Logic
    // -------------------------------------------------------------------------

    // We want to store the Full string in DB, but match using the Name only.
    // item.cityRaw created in the extract phase is "PLZ City".
    // We should try to extract the city name part.

    let cityName = item.cityRaw;

    // 1. Improved Postal Code & City extraction (German/Austrian formats)
    // Supports: '12345 Berlin', 'A-1234 Wien', '1234 Wien', 'D-12345 Berlin'
    const cityCleanRegex = /^(?:[A-Z]-)?\d{4,5}\s+(.+)$/i;
    const cleanMatch = cityName.match(cityCleanRegex);
    if (cleanMatch) {
        cityName = cleanMatch[1];
    }

    // 2. Remove Parentheses content (e.g. 'München (Merced)' -> 'München')
    cityName = cityName.replace(/\s*\(.*?\)\s*/g, '');

    // 3. Remove Country and cleanup
    cityName = cityName.split(',')[0].trim();

    console.log(`   🔎 Matching city: '${cityName}' (Raw: '${item.cityRaw}')`);

    let cityId = null;
    let matchMethod = null;

    // 1. Exact Name Match
    const exactCity = cities.find(c => c.city_name.toLowerCase() === cityName.toLowerCase());
    if (exactCity) {
        cityId = exactCity.id;
        matchMethod = 'exact';
    }
    // 2. Partial Match (e.g., 'Köln' matches 'Köln (Cologne)')
    else {
        const partialCity = cities.find(c =>
            c.city_name.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(c.city_name.toLowerCase())
        );
        if (partialCity) {
            cityId = partialCity.id;
            matchMethod = 'partial';
        }
    }
    // 3. Alias Match
    if (!cityId) {
        const alias = aliases.find(a => a.alias_name.toLowerCase() === cityName.toLowerCase());
        if (alias) {
            cityId = alias.target_city_id;
            matchMethod = 'alias';
        }
    }

    if (!cityId) {
        console.log(`⚠️ UNMAPPED CITY: '${item.cityRaw}' for ${item.business_name} - saving anyway`);
        // Save with null cityId, admin can map later
        const isNew = await logImport(item, categoryId, 'pending', 'Unmapped city: ' + cityName, null);
        if (isNew) await randomDelay();
        return isNew;
    }

    console.log(`✅ MATCH: ${item.business_name} (${item.cityRaw}) -> City ID: ${cityId} (${matchMethod})`);

    const isNew = await logImport(item, categoryId, 'pending', null, cityId);

    // Only delay if it was a NEW item to avoid rate limits while being fast for existing data
    if (isNew) {
        await randomDelay();
    }
    return isNew;
}

async function logImport(item, categoryId, status, rejectionReason = null, cityId = null) {
    // 1. Check if source_url already exists
    const { data: existing } = await supabase
        .from('vendor_imports')
        .select('id')
        .eq('source_url', item.source_url)
        .maybeSingle();

    if (existing) {
        console.log(`   ⏭  Already in DB: ${item.business_name}`);
        return false; // Not new
    }

    const { error } = await supabase.from('vendor_imports').insert({
        source_url: item.source_url,
        source_name: 'hochzeitsportal24',
        external_id: item.source_url, // using url as ID for now
        business_name: item.business_name,
        category_raw: item.category_raw,
        category_id: categoryId,
        city_raw: item.cityRaw,
        city_id: cityId,
        status: status,
        rejection_reason: rejectionReason,
        email: item.email,
        phone: item.phone,
        website: item.website,
        description: item.description,
        raw_json: item.raw_data,
        duplicate_score: 0
    });

    if (error) {
        console.error('  ⚠️ Database Error:', error.message);
        return false;
    } else {
        console.log(`  💾 Saved NEW: ${item.business_name}`);
        return true; // Successfully saved new item
    }
}

async function main() {
    console.log('🚀 Scraper Service Started (Polling mode)...');

    while (true) {
        try {
            // 1. Check if we need to run
            const { data: status } = await supabase
                .from('scraper_status')
                .select('*')
                .eq('id', 'hp24_main')
                .maybeSingle();

            const isStuck = status && status.status === 'running' &&
                status.last_run_started_at &&
                (new Date() - new Date(status.last_run_started_at)) > 1000 * 60 * 60 * 3; // 3 hours

            const shouldRun = (status && (!status.last_run_started_at ||
                new Date(status.trigger_sync) > new Date(status.last_run_started_at))) || isStuck;

            if (status && shouldRun && (status.status !== 'running' || isStuck)) {
                console.log(isStuck ? '⚠️ Stuck scraper detected, taking over...' : '🔔 Trigger detected! Starting sync...');

                await supabase.from('scraper_status').update({
                    status: 'running',
                    last_run_started_at: new Date(),
                    logs: '🚀 Başlatılıyor...'
                }).eq('id', 'hp24_main');

                const cities = await getAdminCities();
                const aliases = await getCityAliases();
                console.log(`📚 Loaded ${cities.length} cities and ${aliases.length} aliases.`);

                const browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--disable-blink-features=AutomationControlled']
                });
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Referer': 'https://www.google.com/'
                });
                await page.setViewport({ width: 1920, height: 1080 });

                const targetCategory = status.target_category || 'all';
                const entries = Object.entries(CATEGORY_MAP);

                for (const [slug, ourId] of entries) {
                    // Filter by target_category if it's not 'all'
                    // targetCategory can be the slug (e.g. 'hochzeitslocations') or the Display Name
                    if (targetCategory !== 'all' && slug !== targetCategory && ourId !== targetCategory) {
                        continue;
                    }

                    console.log(`🚀 Focusing on category: ${ourId} (Deep Sync: ${status.is_deep_sync})`);
                    await scrapeCategory(page, slug, ourId, cities, aliases, status.is_deep_sync);

                    // LOG Completion
                    await supabase.from('scraper_status').update({
                        logs: `✅ TAMAMLANDI: ${ourId}`
                    }).eq('id', 'hp24_main');

                    await sleep(5000);
                }

                await browser.close();
                console.log('🏁 All Categories Scraped.');

                await supabase.from('scraper_status').update({
                    status: 'idle',
                    last_run_finished_at: new Date(),
                    is_deep_sync: false // Reset deep sync flag after completion
                }).eq('id', 'hp24_main');
            } else {
                // Wait for trigger
                await sleep(30000); // Check every 30s
            }
        } catch (e) {
            console.error('❌ Service Error:', e.message);
            await supabase.from('scraper_status').update({ status: 'error', logs: e.message }).eq('id', 'hp24_main');
            await sleep(60000); // Wait 1m on error
        }
    }
}

main();
