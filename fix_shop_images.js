
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const REPLACEMENTS = {
    // Kişiye Özel Rustik Düğün Davetiyesi
    '221b1884-7cb1-46eb-b0aa-e47579ceda76': ['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200'],
    // ISNOM Fiyonklu Kadın Sandalet
    'd39c93f1-264b-4c34-8ab8-aa1e37d1dbf6': ['https://images.unsplash.com/photo-1543163521-1bf539c55d2f?w=1200'],
    // El Yapımı Broş Gelin Buketi
    'c1b09bc7-b3d8-4ff2-af52-fd04a0d09bca': ['https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'],
    // Retisee Düğün Hediyelik Mum Seti
    '7ac05999-2ba8-4e4d-a876-d452fbed3ccf': ['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200']
};

async function fixImages() {
    console.log('Starting image fix...');
    for (const [id, images] of Object.entries(REPLACEMENTS)) {
        const { error } = await supabase
            .from('shop_products')
            .update({ images })
            .eq('id', id);

        if (error) {
            console.error(`Error updating product ${id}:`, error);
        } else {
            console.log(`Updated product ${id} with Unsplash images.`);
        }
    }
}

fixImages();
