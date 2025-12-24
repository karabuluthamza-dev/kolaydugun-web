const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const mapping = {
    'jewelry': 'Wedding Rings',
    'venue': 'Wedding Venues',
    'photographer': 'Wedding Photography',
    'videographer': 'Wedding Videography',
    'planner': 'Wedding Planners',
    'cake': 'Wedding Cakes',
    'catering': 'Catering & Party Service',
    'music': 'DJs',
    'florist': 'Flowers & Decoration',
    'decoration': 'Flowers & Decoration',
    'bridal_dresses': 'Bridal Fashion',
    'car': 'Wedding Cars',
    'hair_makeup': 'Hair & Make-Up'
};

async function fixImports() {
    console.log('🔄 Fixing existing vendor_imports IDs...');

    for (const [oldId, newName] of Object.entries(mapping)) {
        const { error, count } = await supabase
            .from('vendor_imports')
            .update({ category_id: newName })
            .eq('category_id', oldId);

        if (error) {
            console.error(`❌ Error updating ${oldId}:`, error.message);
        } else {
            console.log(`✅ Updated ${oldId} -> ${newName}`);
        }
    }

    console.log('🏁 Data migration complete.');
}

fixImports();
