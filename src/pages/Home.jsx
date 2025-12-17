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

const Home = () => {
    const { t, language } = useLanguage();
    const [heroSettings, setHeroSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .single();

            if (data && !error) {
                setHeroSettings(data);
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
            <PlanningTools />
            <FeaturedCategories />
            <FeaturedVendors />
            <WhyUs />
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
