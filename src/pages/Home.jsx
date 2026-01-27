import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../supabaseClient';
import Hero from '../components/Hero';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

// Lazy load below-the-fold components for better initial load performance
const PlanningTools = lazy(() => import('../components/PlanningTools'));
const LiveRequestBanner = lazy(() => import('../components/Home/LiveRequestBanner'));
const FeaturedCategories = lazy(() => import('../components/FeaturedCategories'));
const WhyUs = lazy(() => import('../components/WhyUs'));
const Services = lazy(() => import('../components/Services'));
const About = lazy(() => import('../components/About'));
const Contact = lazy(() => import('../components/Contact'));
const FeaturedVendors = lazy(() => import('../components/FeaturedVendors'));
const HomePricing = lazy(() => import('../components/HomePricing'));
const FAQSection = lazy(() => import('../components/FAQSection'));
const HomeBlogShowcase = lazy(() => import('../components/HomeBlogShowcase'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));
const HomeShopPromo = lazy(() => import('../components/HomeShopPromo'));
const MobileAppShowcase = lazy(() => import('../components/Home/MobileAppShowcase'));
const EliteShowcase = lazy(() => import('../components/EliteShowcase'));

// Suspense fallback for CLS prevention
import SuspenseSkeleton from '../components/SuspenseSkeleton';


const Home = () => {
    const { t, language } = useLanguage();
    // Video optimized with lazy load and poster fallback
    const [heroSettings, setHeroSettings] = useState({
        hero_settings: {
            use_video: true,
            video_url: 'https://rnkyghovurnaizkhwgtv.supabase.co/storage/v1/object/public/homepage/bg_video.mp4',
            background_type: 'video'
        }
    });


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('*')
                    .single();

                if (error) {
                    console.error('Error fetching site_settings:', error);
                    // Keep the default video settings
                } else if (data) {

                    // Default video settings - ALWAYS use these for video
                    const defaultVideoSettings = {
                        use_video: true,
                        video_url: 'https://rnkyghovurnaizkhwgtv.supabase.co/storage/v1/object/public/homepage/bg_video.mp4',
                        background_type: 'video'
                    };

                    // Only disable video if database explicitly says use_video: false
                    const shouldUseVideo = data.hero_settings?.use_video !== false;

                    setHeroSettings(prev => ({
                        ...data,
                        hero_settings: shouldUseVideo
                            ? defaultVideoSettings  // Use default video settings
                            : { ...prev.hero_settings, ...(data.hero_settings || {}), use_video: false }
                    }));
                }

            } catch (err) {
                console.error('Unexpected error in fetchSettings:', err);
                // Keep default video settings on error
            }
        };

        fetchSettings();
    }, []);

    /* Replaced useSEO with SEO component */
    const heroTitle = heroSettings?.hero_title?.[language] || t('hero.title');
    let heroSubtitle = heroSettings?.hero_subtitle?.[language] || t('hero.subtitle');

    // HOTFIX: Fix known truncated text from database
    if (heroSubtitle && (heroSubtitle === "Almanya'da hayalinizdeki d" || heroSubtitle.endsWith("hayalinizdeki d"))) {
        heroSubtitle = t('hero.subtitle'); // Use the full text from dictionary
    }

    const heroImage = heroSettings?.hero_image_url;
    const onlineConfig = heroSettings?.online_counter_config;
    const trustBadges = heroSettings?.trust_badges;
    const ctaSettings = heroSettings?.cta_settings;
    const videoSettings = heroSettings?.hero_settings;

    return (
        <>
            <SEO
                title={heroTitle || 'Wedding Planner Germany'}
                description={heroSubtitle || 'Plan your dream wedding in Germany with KolayDugun.'}
                image={heroImage}
                url="/"
                hreflangUrls={{ de: '/', tr: '/', en: '/' }}
            />
            <Hero
                title={heroTitle}
                subtitle={heroSubtitle}
                backgroundImage={heroImage}
                onlineConfig={onlineConfig}
                trustBadges={trustBadges}
                heroSettings={videoSettings}
            />
            {/* Lazy-loaded components wrapped in Suspense */}
            <Suspense fallback={<SuspenseSkeleton />}>
                <LiveRequestBanner />
                <PlanningTools />
                <FeaturedCategories />
                <EliteShowcase />
                <FeaturedVendors />
                <WhyUs />
                <MobileAppShowcase />
                <Services />
                <HomeShopPromo />
                <HomeBlogShowcase />
                <HomePricing />
                <About />
                <FAQSection />
                <Contact />
                <FloatingCTA settings={ctaSettings} />
            </Suspense>
        </>
    );
};

export default Home;
