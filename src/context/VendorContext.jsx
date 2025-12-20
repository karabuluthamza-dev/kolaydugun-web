import React, { createContext, useState, useContext, useEffect } from 'react';

const VendorContext = createContext();

const INITIAL_VENDORS = [
    {
        id: 1,
        name: "Schloss Charlottenburg",
        category: "Wedding Venues",
        location: "Berlin",
        city: "Berlin",
        region: "Charlottenburg",
        price: "€€€€",
        rating: 4.9,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Erleben Sie eine märchenhafte Hochzeit im historischen Schloss Charlottenburg.",
        features: ["Historische Location", "Gartenzugang", "Eigenes Catering"],
        capacity: 250,
        priceRange: "€€€€",
        tags: ["Outdoor", "Luxury"],
        isFeatured: true,
        gallery: [],
        plan: "Premium",
        membershipActive: true,
        subscriptionStart: "2025-01-01",
        subscriptionEnd: "2026-01-01"
    },
    {
        id: 2,
        name: "Elegant Catering Co.",
        category: "Catering & Party Service",
        location: "München (Munich)",
        city: "München (Munich)",
        region: "Schwabing",
        price: "€€€",
        rating: 4.8,
        reviews: 85,
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Exquisite kulinarische Erlebnisse für Ihren besonderen Tag.",
        features: ["Individuelle Menüs", "Bio-Zutaten", "Full Service"],
        capacity: 150,
        priceRange: "€€€",
        tags: ["Vegan", "Organic"],
        isFeatured: false,
        gallery: [],
        plan: "Basic",
        membershipActive: true,
        subscriptionStart: "2025-02-15",
        subscriptionEnd: "2025-03-15"
    },
    {
        id: 3,
        name: "Floral Dreams",
        category: "Flowers & Decoration",
        location: "Hamburg",
        city: "Hamburg",
        region: "Altona",
        price: "€€",
        rating: 4.7,
        reviews: 42,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Wir verwandeln Ihre Blumenträume in Wirklichkeit.",
        features: ["Frische Blumen", "Event-Styling", "Brautsträuße"],
        capacity: 80,
        priceRange: "€€",
        tags: ["Seasonal"],
        isFeatured: false,
        gallery: [],
        plan: "Free",
        membershipActive: false,
        subscriptionStart: null,
        subscriptionEnd: null
    },
    {
        id: 4,
        name: "Berlin Wedding Photography",
        category: "Wedding Photography",
        location: "Berlin",
        city: "Berlin",
        region: "Mitte",
        price: "€€€",
        rating: 4.9,
        reviews: 56,
        image: "https://images.unsplash.com/photo-1511285560982-1356c11d4606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Capturing your special moments forever.",
        features: ["Full Day Coverage", "Drone Shots", "Album Included"],
        capacity: 0,
        priceRange: "€€€",
        tags: ["Artistic", "Candid"],
        isFeatured: true,
        gallery: [],
        plan: "Premium",
        membershipActive: true,
        subscriptionStart: "2025-01-01",
        subscriptionEnd: "2026-01-01"
    },
    {
        id: 5,
        name: "Hamburg Harbor Venue",
        category: "Wedding Venues",
        location: "Hamburg",
        city: "Hamburg",
        region: "HafenCity",
        price: "€€€€",
        rating: 4.6,
        reviews: 34,
        image: "https://images.unsplash.com/photo-1519225421980-715cb0202128?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Modern venue with a view of the harbor.",
        features: ["Waterfront", "Modern", "Large Capacity"],
        capacity: 300,
        priceRange: "€€€€",
        tags: ["Modern", "View"],
        isFeatured: false,
        gallery: [],
        plan: "Basic",
        membershipActive: true,
        subscriptionStart: "2025-03-01",
        subscriptionEnd: "2025-04-01"
    },
    {
        id: 6,
        name: "Munich Traditional Band",
        category: "Musicians",
        location: "München (Munich)",
        city: "München (Munich)",
        region: "Altstadt",
        price: "€€",
        rating: 4.8,
        reviews: 22,
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Traditional Bavarian music for your wedding.",
        features: ["Live Music", "Traditional Costumes", "Interactive"],
        capacity: 0,
        priceRange: "€€",
        tags: ["Traditional", "Fun"],
        isFeatured: false,
        gallery: [],
        plan: "Free",
        membershipActive: false,
        subscriptionStart: null,
        subscriptionEnd: null
    },
    {
        id: 7,
        name: "Cologne Cathedral View",
        category: "Wedding Venues",
        location: "Köln (Cologne)",
        city: "Köln (Cologne)",
        region: "Deutz",
        price: "€€€",
        rating: 4.7,
        reviews: 45,
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Celebrate with a view of the Dom.",
        features: ["City View", "Central", "Historic"],
        capacity: 120,
        priceRange: "€€€",
        tags: ["City", "View"],
        isFeatured: true,
        gallery: [],
        plan: "Premium",
        membershipActive: true,
        subscriptionStart: "2025-01-01",
        subscriptionEnd: "2026-01-01"
    },
    {
        id: 8,
        name: "Frankfurt Skyline Loft",
        category: "Wedding Venues",
        location: "Frankfurt am Main",
        city: "Frankfurt am Main",
        region: "Westend",
        price: "€€€€",
        rating: 4.9,
        reviews: 67,
        image: "https://images.unsplash.com/photo-1519225421980-715cb0202128?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Luxury loft with skyline views.",
        features: ["Rooftop", "Modern", "Exclusive"],
        capacity: 100,
        priceRange: "€€€€",
        tags: ["Luxury", "Skyline"],
        isFeatured: true,
        gallery: [],
        plan: "Premium",
        membershipActive: true,
        subscriptionStart: "2025-01-01",
        subscriptionEnd: "2026-01-01"
    },
    {
        id: 9,
        name: "Stuttgart Vineyard",
        category: "Wedding Venues",
        location: "Stuttgart",
        city: "Stuttgart",
        region: "Bad Cannstatt",
        price: "€€",
        rating: 4.5,
        reviews: 28,
        image: "https://images.unsplash.com/photo-1522673607200-1645062cd495?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Romantic wedding in the vineyards.",
        features: ["Outdoor", "Wine Tasting", "Rustic"],
        capacity: 80,
        priceRange: "€€",
        tags: ["Rustic", "Nature"],
        isFeatured: false,
        gallery: [],
        plan: "Basic",
        membershipActive: true,
        subscriptionStart: "2025-04-01",
        subscriptionEnd: "2025-05-01"
    },
    {
        id: 10,
        name: "Düsseldorf Fashion Hotel",
        category: "Wedding Venues",
        location: "Düsseldorf",
        city: "Düsseldorf",
        region: "Stadtmitte",
        price: "€€€",
        rating: 4.4,
        reviews: 19,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Chic hotel for a stylish wedding.",
        features: ["Ballroom", "Catering", "Accommodation"],
        capacity: 200,
        priceRange: "€€€",
        tags: ["Chic", "Hotel"],
        isFeatured: false,
        gallery: [],
        plan: "Free",
        membershipActive: false,
        subscriptionStart: null,
        subscriptionEnd: null
    }
];

// Vendor data now includes membership fields: membershipActive, subscriptionStart, subscriptionEnd
import { supabase } from '../lib/supabase';

export const VendorProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            // 1. Fetch Categories for Images
            const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('name, image_url');

            const categoryImageMap = {};
            if (categoriesData) {
                categoriesData.forEach(cat => {
                    if (cat.name && cat.image_url) {
                        categoryImageMap[cat.name.toLowerCase()] = cat.image_url;
                    }
                });
            }

            // Helper to normalize category names (handling TR/DE/EN)
            const normalizeCategory = (cat) => {
                if (!cat) return '';
                const lower = cat.toLowerCase();
                if (lower === 'düğün mekanları' || lower === 'hochzeitslocations') return 'wedding venues';
                if (lower === 'gelinlik ve moda' || lower === 'brautmode') return 'bridal fashion';
                if (lower === 'saç ve makyaj' || lower === 'brautstyling & make-up') return 'hair & make-up';
                if (lower === 'damatlık' || lower === 'herrenmode') return 'groom suits';
                if (lower === 'düğün pastası' || lower === 'hochzeitstorten') return 'wedding cakes';
                if (lower === 'düğün organizasyonu' || lower === 'hochzeitsplaner') return 'wedding planners';
                if (lower === 'gelin arabası' || lower === 'hochzeitsautos') return 'wedding cars';
                if (lower === 'catering' || lower === 'catering & partyservice') return 'catering & party service';
                if (lower === 'nikah memuru / konuşmacı' || lower === 'trauredner') return 'wedding speakers (trauredner)';
                if (lower === 'çiçek ve dekorasyon' || lower === 'floristik & dekoration') return 'flowers & decoration';
                if (lower === 'davetiye ve kırtasiye' || lower === 'einladungen & papeterie') return 'invitations & stationery';
                if (lower === 'alyans ve takı' || lower === 'trauringe & schmuck') return 'wedding rings';
                if (lower === 'düğün fotoğrafçısı' || lower === 'hochzeitsfotografie') return 'wedding photography';
                if (lower === 'düğün videografisi' || lower === 'hochzeitsvideografie') return 'wedding videography';
                return lower;
            };

            // 2. Fetch Vendors
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .is('deleted_at', null);

            if (error) throw error;

            if (data && data.length > 0) {
                // DEBUG: Log claim-related fields
                console.log('[VendorContext] Raw vendor data sample:', data.slice(0, 3).map(v => ({
                    name: v.business_name,
                    user_id: v.user_id,
                    is_claimed: v.is_claimed,
                    is_verified: v.is_verified
                })));

                const mappedVendors = data.map(v => {
                    // Determine category image from DB
                    const normalizedCat = normalizeCategory(v.category);
                    const dbCategoryImage = categoryImageMap[normalizedCat] || categoryImageMap[v.category?.toLowerCase()];

                    return {
                        ...v,
                        name: v.business_name,
                        location: v.city,
                        price: v.price_range,
                        priceRange: v.price_range, // Map for compatibility with sorting logic
                        isFeatured: v.featured_active,
                        image: v.image_url,
                        categoryImage: dbCategoryImage, // Attach DB category image
                        features: Array.isArray(v.features) ? v.features : [],
                        tags: Array.isArray(v.tags) ? v.tags : [],
                        gallery: Array.isArray(v.gallery) ? v.gallery : [],
                        // Mock data for verification (keeping existing logic for id 1)
                        ...(v.id === 1 ? {
                            rating: 4.9,
                            isFeatured: true,
                            gallery: [
                                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1511285560982-1356c11d4606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            ]
                        } : {})
                    };
                });
                setVendors(mappedVendors);
            } else {
                setVendors([]);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const addVendor = async (newVendor) => {
        // This is now handled via AuthContext register, but we might keep it for admin
        // or if we want to update local state optimistically
    };

    const getVendor = (id) => {
        return vendors.find(v => v.id == id);
    };

    const updateVendor = async (id, updates) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
        } catch (error) {
            console.error('Error updating vendor:', error);
            throw error;
        }
    };

    const buyFeaturedPackage = async (vendorId) => {
        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('vendor_ad_orders')
                .insert([{
                    vendor_id: vendorId,
                    product_id: 'home_featured_30d',
                    amount: 49.99,
                    status: 'paid' // Simulating successful payment
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Update Vendor Status
            const now = new Date();
            const nextMonth = new Date(now.setDate(now.getDate() + 30));

            const { error: updateError } = await supabase
                .from('vendors')
                .update({
                    featured_active: true,
                    featured_until: nextMonth.toISOString()
                })
                .eq('id', vendorId);

            if (updateError) throw updateError;

            // 3. Refresh local state
            await fetchVendors();
            return true;
        } catch (error) {
            console.error('Error buying package:', error);
            throw error;
        }
    };

    return (
        <VendorContext.Provider value={{ vendors, loading, addVendor, getVendor, updateVendor, buyFeaturedPackage, refreshVendors: fetchVendors }}>
            {children}
        </VendorContext.Provider>
    );
};

export const useVendors = () => {
    const context = useContext(VendorContext);
    if (!context) {
        throw new Error('useVendors must be used within a VendorProvider');
    }
    return context;
};
