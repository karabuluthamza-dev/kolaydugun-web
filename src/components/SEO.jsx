import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    structuredData,
    type = 'website',
    hreflangUrls = null // { de: '/de/...', tr: '/tr/...', en: '/en/...' }
}) => {
    const { language } = useLanguage();
    const { settings } = useSiteSettings() || { settings: {} }; // Safety fallback

    const siteName = 'KolayDugun.de';
    const defaultDescription = 'Find the best wedding vendors in Germany. Turkish & International weddings made easy.';

    // Use the uploaded OG image if available, fallback to logo, then default
    const defaultImage = settings?.og_image_url || settings?.logo_url || 'https://kolaydugun.de/og-image.jpg';
    const siteUrl = 'https://kolaydugun.de';

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const fullDescription = description || defaultDescription;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <meta name="keywords" content={keywords} />
            <html lang={language} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={language === 'tr' ? 'tr_TR' : language === 'de' ? 'de_DE' : 'en_US'} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />

            {/* Canonical */}
            <link rel="canonical" href={fullUrl} />

            {/* Hreflang for multi-language SEO */}
            {hreflangUrls && (
                <>
                    {hreflangUrls.de && <link rel="alternate" hrefLang="de" href={`${siteUrl}${hreflangUrls.de}`} />}
                    {hreflangUrls.tr && <link rel="alternate" hrefLang="tr" href={`${siteUrl}${hreflangUrls.tr}`} />}
                    {hreflangUrls.en && <link rel="alternate" hrefLang="en" href={`${siteUrl}${hreflangUrls.en}`} />}
                    <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${hreflangUrls.de || hreflangUrls.tr}`} />
                </>
            )}

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
