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
    'hair_makeup': 'Hair & Make-Up',
    'wedding_venues': 'Wedding Venues',
    'wedding_photography': 'Wedding Photography',
    'wedding_videography': 'Wedding Videography',
    'wedding_planners': 'Wedding Planners',
    'wedding_cakes': 'Wedding Cakes',
    'catering_party': 'Catering & Party Service',
    'djs': 'DJs',
    'musicians': 'Musicians',
    'wedding_cars': 'Wedding Cars',
    'flowers_decoration': 'Flowers & Decoration',
    'invitations_stationery': 'Invitations & Stationery',
    'photobox': 'Photobox',
    'entertainment': 'Entertainment',
    'groom_suits': 'Groom Suits',
    'wedding_speakers': 'Wedding Speakers (Trauredner)'
};

async function fixAllImports() {
    console.log('🔄 Comprehensive update starting...');

    for (const [oldId, newName] of Object.entries(mapping)) {
        const { error, count } = await supabase
            .from('vendor_imports')
            .update({ category_id: newName })
            .eq('category_id', oldId);

        if (error) {
            console.error(`❌ Error updating ${oldId}:`, error.message);
        } else {
            // Count can be null depending on config, but we check logs
            console.log(`✅ Mapping checked for: ${oldId} -> ${newName}`);
        }
    }

    console.log('🏁 Data migration complete. Now checking summary...');

    // Final check
    const { data: stats } = await supabase.from('vendor_imports').select('category_id, status');
    const summary = stats.reduce((acc, curr) => {
        const key = `${curr.category_id} | ${curr.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    console.table(summary);
}

fixAllImports();
