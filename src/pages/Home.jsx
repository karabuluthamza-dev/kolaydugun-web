import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import WhyUs from '../components/WhyUs';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

import PlanningTools from '../components/PlanningTools';

import FeaturedVendors from '../components/FeaturedVendors';
import HomePricing from '../components/HomePricing';
import FAQSection from '../components/FAQSection';
import HomeBlogShowcase from '../components/HomeBlogShowcase';
import FloatingCTA from '../components/FloatingCTA';
import HomeShopPromo from '../components/HomeShopPromo';
import MobileAppShowcase from '../components/Home/MobileAppShowcase';
import LiveRequestBanner from '../components/Home/LiveRequestBanner';

const Home = () => {
    const { t, language } = useLanguage();
    // Video enabled - works on live site
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
                    // Merge database settings with defaults, preserving video settings if not specified
                    setHeroSettings(prev => ({
                        ...data,
                        hero_settings: data.hero_settings || prev.hero_settings
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
    const heroSubtitle = heroSettings?.hero_subtitle?.[language] || t('hero.subtitle');
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
            />
            <Hero
                title={heroTitle}
                subtitle={heroSubtitle}
                backgroundImage={heroImage}
                onlineConfig={onlineConfig}
                trustBadges={trustBadges}
                heroSettings={videoSettings}
            />
            <LiveRequestBanner />
            <PlanningTools />
            <FeaturedCategories />
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
        </>
    );
};

export default Home;
