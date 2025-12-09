INSERT INTO public.vendors (
    business_name, 
    slug, 
    category, 
    city, 
    price_range, 
    rating, 
    reviews, 
    featured_active, 
    subscription_tier
) 
VALUES (
    'Dj34 Istanbul Test', 
    'dj34-istanbul-test', 
    'DJ', 
    'Istanbul', 
    '€€', 
    5.0, 
    10, 
    true, 
    'premium'
)
ON CONFLICT (slug) DO NOTHING;
