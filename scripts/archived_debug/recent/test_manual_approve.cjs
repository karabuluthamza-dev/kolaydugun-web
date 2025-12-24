const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testApproval() {
    console.log('--- Testing Manual Approval for Photobooth-Ruhrpott ---');

    // 1. Find the import record
    const { data: importItem, error: fetchError } = await supabase
        .from('vendor_imports')
        .select('*')
        .ilike('business_name', '%Photobooth-Ruhrpott%')
        .eq('status', 'pending')
        .maybeSingle();

    if (fetchError || !importItem) {
        console.log('Could not find pending import for Photobooth-Ruhrpott or already processed.');
        return;
    }

    console.log(`Found Import ID: ${importItem.id}`);

    try {
        // 2. Create Vendor (Mirrors AdminImports.jsx logic)
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .insert([{
                business_name: importItem.business_name,
                category: importItem.category_id,
                city: importItem.city_raw,
                description: importItem.description,
                price_range: importItem.price_range,
                is_active: true,
                is_claimed: false,
                is_verified: false,
                website_url: importItem.website // Added this manually as check_vendors_schema showed website_url
            }])
            .select()
            .single();

        if (vendorError) throw vendorError;
        console.log(`✅ Vendor created with ID: ${vendor.id}`);

        // 3. Update Contact Info (Mirrors AdminImports.jsx)
        const { error: updateVendorError } = await supabase
            .from('vendors')
            .update({
                // Note: check_vendors_schema showed 'address', 'website_url'
                address: importItem.address,
                website_url: importItem.website
            })
            .eq('id', vendor.id);

        if (updateVendorError) console.warn('Warning during vendor update:', updateVendorError);

        // 4. Mark Import as Approved
        const { error: updateImportError } = await supabase
            .from('vendor_imports')
            .update({
                status: 'approved',
                created_vendor_id: vendor.id,
                processed_at: new Date()
            })
            .eq('id', importItem.id);

        if (updateImportError) throw updateImportError;
        console.log(`✅ Import record marked as approved.`);

    } catch (e) {
        console.error('❌ Approval process failed:', e);
    }
}

testApproval();
