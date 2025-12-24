const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function cleanupCities() {
    console.log('🧹 Starting City & Zip Code cleanup...');

    try {
        // 1. Fetch all vendors
        const { data: vendors, error: fetchError } = await supabase
            .from('vendors')
            .select('id, business_name, city, zip_code');

        if (fetchError) throw fetchError;

        console.log(`📊 Found ${vendors.length} vendors to check.`);

        let updateCount = 0;
        let skipCount = 0;

        for (const vendor of vendors) {
            const rawCity = (vendor.city || '').trim();
            // Pattern: "12345 City Name" or "12345City Name"
            // \d{5} for German postal codes
            const match = rawCity.match(/^(\d{5})\s*(.+)$/);

            if (match) {
                const newZip = match[1];
                const newCity = match[2].trim();

                // Only update if it's actually different or zip is missing
                if (vendor.city !== newCity || vendor.zip_code !== newZip) {
                    console.log(`✨ Cleaning: "${vendor.city}" -> ZIP: ${newZip}, City: ${newCity} [${vendor.business_name}]`);

                    const { error: updateError } = await supabase
                        .from('vendors')
                        .update({
                            city: newCity,
                            zip_code: newZip
                        })
                        .eq('id', vendor.id);

                    if (updateError) {
                        console.error(`❌ Failed to update ${vendor.id}:`, updateError.message);
                    } else {
                        updateCount++;
                    }
                } else {
                    skipCount++;
                }
            } else {
                if (rawCity) {
                    console.log(`ℹ️ No zip pattern found for: "${rawCity}" [${vendor.business_name}]`);
                }
                skipCount++;
            }
        }

        console.log('\n✅ Cleanup Finished!');
        console.log(`📈 Total Updated: ${updateCount}`);
        console.log(`📉 Total Skipped: ${skipCount}`);

    } catch (err) {
        console.error('💥 Critical Error:', err.message);
    }
}

cleanupCities();
