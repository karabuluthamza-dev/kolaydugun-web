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

    // Use the provided image, then settings images, then default fallback
    const defaultImage = settings?.og_image_url || settings?.logo_url || '/og-image.jpg';
    const siteUrl = 'https://kolaydugun.de';
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const fullDescription = description || defaultDescription;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    // Ensure image is an absolute URL
    let fullImage = typeof image === 'string' ? image : defaultImage;

    // Support for Supabase Storage paths if they don't start with http
    if (typeof fullImage === 'string' && !fullImage.startsWith('http')) {
        // If it starts with vendors/ or posts/ it's a Supabase path
        if (fullImage.startsWith('vendors/') || fullImage.startsWith('posts/') || fullImage.startsWith('shop/')) {
            fullImage = `${supabaseUrl}/storage/v1/object/public/${fullImage}`;
        } else {
            // Otherwise assume it's relative to the main site
            fullImage = `${siteUrl}${fullImage.startsWith('/') ? '' : '/'}${fullImage}`;
        }
    }

    // Canonical: Ensure no trailing slashes and always absolute
    const safeUrl = typeof url === 'string' ? url : '';
    const canonicalUrl = `${siteUrl}${safeUrl === '/' ? '' : safeUrl.replace(/\/$/, '')}`;

    // Hreflang for multi-language SEO - ensuring absolute URLs
    const renderHreflang = () => {
        if (!hreflangUrls) return null;
        return (
            <>
                {hreflangUrls.de && <link rel="alternate" hrefLang="de-DE" href={`${siteUrl}${hreflangUrls.de}`} />}
                {hreflangUrls.tr && <link rel="alternate" hrefLang="tr-TR" href={`${siteUrl}${hreflangUrls.tr}`} />}
                {hreflangUrls.en && <link rel="alternate" hrefLang="en-US" href={`${siteUrl}${hreflangUrls.en}`} />}
                <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${hreflangUrls.de || hreflangUrls.tr || '/'}`} />
            </>
        );
    };

    return (
        <>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={language === 'tr' ? 'tr_TR' : language === 'de' ? 'de_DE' : 'en_US'} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Hreflang for multi-language SEO */}
            {renderHreflang()}

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </>
    );
};

export default SEO;
