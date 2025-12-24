import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchVendors();
        fetchTotalCount();
    }, []);

    const fetchTotalCount = async () => {
        try {
            const { count, error } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null);

            if (!error && count !== null) {
                setTotalCount(count);
            }
        } catch (err) {
            console.error('Error fetching total count:', err);
        }
    };

    const getFilteredVendors = React.useCallback(async ({ filters, page = 1, pageSize = 20 }) => {
        try {
            setLoading(true);
            let query = supabase
                .from('vendors')
                .select('id, slug, business_name, category, city, zip_code, state, country, price_range, image_url, gallery, rating, reviews, featured_active, latitude, longitude, is_claimed, is_verified, user_id, ai_performance_score', { count: 'exact' })
                .is('deleted_at', null);

            // Filters
            if (filters.category) {
                query = query.ilike('category', `%${filters.category}%`);
            }
            if (filters.city) {
                query = query.ilike('city', `%${filters.city}%`);
            }
            if (filters.search) {
                // Search in business_name or category
                query = query.or(`business_name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
            }

            // Pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            // Sort
            if (filters.sort === 'rating') {
                query = query.order('rating', { ascending: false });
            } else if (filters.sort === 'price_asc') {
                query = query.order('price_range', { ascending: true });
            } else if (filters.sort === 'price_desc') {
                query = query.order('price_range', { ascending: false });
            } else {
                // Default: Featured first, then rating
                query = query.order('featured_active', { ascending: false })
                    .order('rating', { ascending: false });
            }

            const { data, count, error } = await query;

            if (error) throw error;

            const mapped = (data || []).map(v => ({
                ...v,
                name: v.business_name || v.name,
                location: v.city,
                price: v.price_range,
                priceRange: v.price_range,
                isFeatured: v.featured_active,
                image: v.image_url,
                features: [], // Column not found in DB
                tags: [],     // Column not found in DB
                gallery: Array.isArray(v.gallery) ? v.gallery : []
            }));

            return { vendors: mapped, total: count };
        } catch (err) {
            console.error('Error in getFilteredVendors:', err);
            return { vendors: [], total: 0 };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVendors = async () => {
        // Reduced default fetch for legacy consumers (limit to 50 for performance)
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('id, slug, business_name, category, city, image_url, rating, reviews, featured_active')
                .is('deleted_at', null)
                .order('featured_active', { ascending: false })
                .limit(50);

            if (error) throw error;

            const mapped = (data || []).map(v => ({
                ...v,
                name: v.business_name,
                location: v.city,
                isFeatured: v.featured_active,
                image: v.image_url
            }));

            setVendors(mapped);
        } catch (err) {
            console.error('Error in default fetchVendors:', err);
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
        <VendorContext.Provider value={{ vendors, loading, totalCount, addVendor, getVendor, updateVendor, buyFeaturedPackage, refreshVendors: fetchVendors, getFilteredVendors }}>
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
