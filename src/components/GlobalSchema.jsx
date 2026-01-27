import { Helmet } from 'react-helmet-async';

/**
 * GlobalSchema - Site geneli JSON-LD yapılandırılmış veri
 * 
 * Bu component tüm sayfalarda yüklenir ve Google'a site hakkında
 * temel bilgileri sağlar:
 * - Organization: Şirket/marka bilgileri
 * - WebSite: Site bilgileri ve arama özelliği
 */
const GlobalSchema = () => {
    const siteUrl = 'https://kolaydugun.de';
    const siteName = 'KolayDugun';
    const logoUrl = `${siteUrl}/pwa-icon.png`;

    // Organization Schema - Şirket/marka bilgileri
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": siteName,
        "alternateName": "Kolay Düğün",
        "url": siteUrl,
        "logo": {
            "@type": "ImageObject",
            "url": logoUrl,
            "width": 512,
            "height": 512
        },
        "description": "Almanya'daki en iyi düğün hizmet sağlayıcılarını bulun. Türk ve uluslararası düğünler için kolay planlama.",
        "foundingDate": "2024",
        "areaServed": {
            "@type": "Country",
            "name": "Germany"
        },
        "sameAs": [
            // Sosyal medya linkleri eklenebilir
            // "https://www.facebook.com/kolaydugun",
            // "https://www.instagram.com/kolaydugun"
        ]
    };

    // WebSite Schema - Site bilgileri ve arama
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "name": siteName,
        "alternateName": "Kolay Düğün",
        "url": siteUrl,
        "inLanguage": ["de-DE", "tr-TR", "en-US"],
        "publisher": {
            "@id": `${siteUrl}/#organization`
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(organizationSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(websiteSchema)}
            </script>
        </Helmet>
    );
};

export default GlobalSchema;
