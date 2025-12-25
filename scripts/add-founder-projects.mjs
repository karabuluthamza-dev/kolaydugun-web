// Founder Projects Migration - Run this once to add new projects
// Execute with: node scripts/add-founder-projects.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwbdhsomtdjgtlkpqfxs.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YmRoc29tdGRqZ3Rsa3BxZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NTExNDYsImV4cCI6MjAzODUyNzE0Nn0.hMFCVLuNcKWTiYM6fQxaV5yJZQy8kQyGxCJV8WKwdPY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addProjects() {
    const newProjects = [
        {
            title_tr: 'Canlı İstek Sistemi',
            title_de: 'Live-Anfrage-System',
            title_en: 'Live Request System',
            description_tr: 'DJ ve müzisyenler için QR kod tabanlı şarkı istek sistemi. Misafirler telefonlarından anlık istek gönderebilir, VIP önceliklendirme ve bahşiş özelliği.',
            description_de: 'QR-Code-basiertes Song-Anfrage-System für DJs und Musiker. Gäste können Anfragen über ihr Telefon senden, mit VIP-Priorisierung und Trinkgeld-Funktion.',
            description_en: 'QR code-based song request system for DJs and musicians. Guests can send requests from their phones, with VIP prioritization and tipping feature.',
            status: 'current',
            order_index: 3,
            is_active: true
        },
        {
            title_tr: 'Tedarikçi Mağazaları',
            title_de: 'Anbieter-Shops',
            title_en: 'Vendor Shops',
            description_tr: 'Düğün tedarikçilerinin kendi ürünlerini ve hizmetlerini doğrudan satabileceği entegre pazaryeri. Çiftler tek noktadan alışveriş yapabilir.',
            description_de: 'Integrierter Marktplatz, auf dem Hochzeitsanbieter ihre eigenen Produkte und Dienstleistungen direkt verkaufen können. Paare können an einem Ort einkaufen.',
            description_en: 'Integrated marketplace where wedding vendors can sell their own products and services directly. Couples can shop in one place.',
            status: 'current',
            order_index: 4,
            is_active: true
        }
    ];

    for (const project of newProjects) {
        const { data, error } = await supabase
            .from('founder_projects')
            .insert(project)
            .select();

        if (error) {
            console.error('Error inserting project:', project.title_tr, error);
        } else {
            console.log('Successfully added:', project.title_tr);
        }
    }
}

addProjects();
