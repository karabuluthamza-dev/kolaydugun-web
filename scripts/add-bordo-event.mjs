// Bordo Event War Room Entry - Run this once to add the venue
// Execute with: node scripts/add-bordo-event.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwbdhsomtdjgtlkpqfxs.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YmRoc29tdGRqZ3Rsa3BxZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NTExNDYsImV4cCI6MjAzODUyNzE0Nn0.hMFCVLuNcKWTiYM6fQxaV5yJZQy8kQyGxCJV8WKwdPY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBordoEvent() {
    const slug = 'bordo-eventlocation-' + Math.floor(Math.random() * 1000);

    const bordoEvent = {
        id: crypto.randomUUID(),
        business_name: 'Bordo Eventlocation',
        city: 'Neu-Ulm',
        slug: slug,
        source: 'war_room',
        is_claimed: false,
        is_verified: false,
        is_featured: true, // VIP Demo için featured
        category: 'Düğün Salonu',
        capacity: 1200,
        scraper_source_url: 'https://www.bordoevent.com/',
        description: 'Seit 2016 ist die Bordo Eventlocation in Neu-Ulm die erste Adresse für unvergessliche Veranstaltungen. Unsere zwei eleganten Säle, Bordo und Beyaz, bieten Platz für bis zu 1200 Gäste.',
        phone: '+491742801430',
        email: 'info@bordoevent.com',
        address: 'Leibnizstr. 14, 89231 Neu-Ulm',
        social_media: {
            instagram: 'https://www.instagram.com/bordoeventlocation',
            website: 'https://www.bordoevent.com/'
        },
        details: {
            war_room_status: 'profile_ready',
            ai_imported: true,
            vip_demo_config: {
                // Hero Section
                hero_title: 'Die Kunst der Perfektion',
                hero_description: 'Seit 2016 ist die Bordo Eventlocation in Neu-Ulm die erste Adresse für unvergessliche Veranstaltungen. Zwei elegante Säle – Bordo und Beyaz – für bis zu 1200 Gäste.',
                hero_image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',

                // Fiyatlar & Menüler
                prices: [
                    { name: 'Bordo Saal (Hafta İçi)', weekday: 'Fiyat İçin İletişime Geçin', weekend: 'Fiyat İçin İletişime Geçin', icon: '🏛️' },
                    { name: 'Beyaz Saal (Hafta Sonu)', weekday: 'Fiyat İçin İletişime Geçin', weekend: 'Fiyat İçin İletişime Geçin', icon: '💎' },
                    { name: 'Catering (Kişi Başı)', weekday: '45 EUR', weekend: '55 EUR', icon: '🍽️' },
                    { name: 'Tam Paket (Dekor + Catering + DJ)', weekday: '80 EUR/kişi', weekend: '95 EUR/kişi', icon: '✨' }
                ],

                // USP'ler (Neden Biz?)
                usps: [
                    '2016\'dan beri profesyonel hizmet',
                    '2 ayrı salon: Bordo & Beyaz (1200 kişi kapasiteli)',
                    'Türk düğünlerinde uzman ekip',
                    'Dekorasyon, Catering, Foto & Video, DJ dahil tam paket',
                    'Neu-Ulm merkezi konumu (Ulm\'a 5 dk)',
                    'Valet & Geniş otopark imkanı'
                ],

                // Galeri (Instagram'dan örnek görseller - placeholder)
                gallery: [
                    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
                    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80',
                    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
                    'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=600&q=80',
                    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'
                ],

                // Özellikler
                features: [
                    { icon: '👥', label: '1200 Kişi Kapasite' },
                    { icon: '🏛️', label: '2 Ayrı Salon' },
                    { icon: '🎉', label: 'Türk Düğünü Uzmanı' },
                    { icon: '🍽️', label: 'Catering Dahil' },
                    { icon: '📸', label: 'Foto & Video' },
                    { icon: '🎵', label: 'DJ & Ses Sistemi' }
                ],

                // Etkinlik Türleri
                event_types: ['Hochzeit', 'Türkische Hochzeit', 'Verlobung', 'Firmenfeier', 'Privatefeier'],

                // İletişim
                contact: {
                    phone: '+491742801430',
                    email: 'info@bordoevent.com',
                    address: 'Leibnizstr. 14, 89231 Neu-Ulm',
                    owner: 'Dursun Kocaslan'
                }
            }
        }
    };

    const { data, error } = await supabase
        .from('vendors')
        .insert(bordoEvent)
        .select();

    if (error) {
        console.error('Error inserting Bordo Event:', error);
    } else {
        console.log('✅ Bordo Eventlocation başarıyla eklendi!');
        console.log('📍 VIP Demo URL:', `https://kolaydugun.de/vip-demo?venue=${encodeURIComponent('Bordo Eventlocation')}&city=${encodeURIComponent('Neu-Ulm')}`);
        console.log('📱 WhatsApp Linki:', `https://wa.me/491742801430`);
    }
}

addBordoEvent();
