
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkImages() {
    const { data, error } = await supabase
        .from('shop_products')
        .select('id, name_tr, images')
        .limit(100);

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Checking ${data.length} products...`);
    for (const product of data) {
        if (product.images && product.images.length > 0) {
            console.log(`Product [${product.id}] ${product.name_tr}:`);
            product.images.forEach((img, i) => {
                console.log(`  - Image ${i}: ${img}`);
            });
        } else {
            console.log(`Product [${product.id}] ${product.name_tr}: NO IMAGES`);
        }
    }
}

checkImages();
