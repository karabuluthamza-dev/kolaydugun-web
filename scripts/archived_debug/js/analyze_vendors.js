import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeVendors() {
    console.log('📊 Analyzing vendors...\n');

    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('business_name, subscription_tier, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    console.log(`Total vendors: ${vendors.length}\n`);

    // Group by creation date
    const today = new Date().toDateString();
    const todayVendors = vendors.filter(v => new Date(v.created_at).toDateString() === today);
    const olderVendors = vendors.filter(v => new Date(v.created_at).toDateString() !== today);

    console.log(`📅 Created today: ${todayVendors.length}`);
    if (todayVendors.length > 0) {
        todayVendors.slice(0, 10).forEach(v => {
            console.log(`   - ${v.business_name} (${v.subscription_tier})`);
        });
        if (todayVendors.length > 10) {
            console.log(`   ... and ${todayVendors.length - 10} more`);
        }
    }

    console.log(`\n📅 Created before today: ${olderVendors.length}`);
    if (olderVendors.length > 0) {
        olderVendors.slice(0, 10).forEach(v => {
            const date = new Date(v.created_at).toLocaleDateString('tr-TR');
            console.log(`   - ${v.business_name} (${date})`);
        });
        if (olderVendors.length > 10) {
            console.log(`   ... and ${olderVendors.length - 10} more`);
        }
    }

    // Tier breakdown
    const tierCounts = vendors.reduce((acc, v) => {
        acc[v.subscription_tier] = (acc[v.subscription_tier] || 0) + 1;
        return acc;
    }, {});

    console.log('\n📊 By subscription tier:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
        console.log(`   ${tier}: ${count}`);
    });
}

analyzeVendors();
