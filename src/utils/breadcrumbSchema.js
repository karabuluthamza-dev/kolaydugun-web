/**
 * Breadcrumb Schema Generator
 * 
 * JSON-LD BreadcrumbList schema oluşturur
 * Google arama sonuçlarında breadcrumb görünümü sağlar
 */

const siteUrl = 'https://kolaydugun.de';

/**
 * Breadcrumb item listesinden schema oluştur
 * @param {Array<{name: string, url: string}>} items - Breadcrumb öğeleri
 * @returns {Object} JSON-LD BreadcrumbList schema
 * 
 * Örnek kullanım:
 * generateBreadcrumbSchema([
 *   { name: 'Ana Sayfa', url: '/' },
 *   { name: 'Kategoriler', url: '/vendors' },
 *   { name: 'Fotografcilar', url: '/vendors?category=fotografci' }
 * ])
 */
export const generateBreadcrumbSchema = (items) => {
    if (!items || items.length === 0) {
        return null;
    }

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
        }))
    };
};

/**
 * Vendor liste sayfası için breadcrumb oluştur
 * @param {string} categoryName - Kategori adı (opsiyonel)
 * @param {string} categorySlug - Kategori slug (opsiyonel)
 * @param {string} cityName - Şehir adı (opsiyonel)
 * @returns {Object} JSON-LD BreadcrumbList schema
 */
export const generateVendorListBreadcrumb = (categoryName = null, categorySlug = null, cityName = null) => {
    const items = [
        { name: 'Ana Sayfa', url: '/' },
        { name: 'Hizmet Sağlayıcılar', url: '/vendors' }
    ];

    if (categoryName && categorySlug) {
        items.push({
            name: categoryName,
            url: `/vendors?category=${categorySlug}`
        });
    }

    if (cityName) {
        items.push({
            name: cityName,
            url: categorySlug
                ? `/locations/${cityName.toLowerCase()}/${categorySlug}`
                : `/locations/${cityName.toLowerCase()}`
        });
    }

    return generateBreadcrumbSchema(items);
};

/**
 * Vendor detay sayfası için breadcrumb oluştur
 * @param {string} categoryName - Kategori adı
 * @param {string} categorySlug - Kategori slug
 * @param {string} vendorName - Vendor adı
 * @param {string} vendorSlug - Vendor slug
 * @returns {Object} JSON-LD BreadcrumbList schema
 */
export const generateVendorDetailBreadcrumb = (categoryName, categorySlug, vendorName, vendorSlug) => {
    const items = [
        { name: 'Ana Sayfa', url: '/' },
        { name: 'Hizmet Sağlayıcılar', url: '/vendors' }
    ];

    if (categoryName && categorySlug) {
        items.push({
            name: categoryName,
            url: `/vendors?category=${categorySlug}`
        });
    }

    if (vendorName && vendorSlug) {
        items.push({
            name: vendorName,
            url: `/vendors/${vendorSlug}`
        });
    }

    return generateBreadcrumbSchema(items);
};

/**
 * Blog post için breadcrumb oluştur
 * @param {string} postTitle - Blog yazısı başlığı
 * @param {string} postSlug - Blog yazısı slug
 * @returns {Object} JSON-LD BreadcrumbList schema
 */
export const generateBlogBreadcrumb = (postTitle, postSlug) => {
    return generateBreadcrumbSchema([
        { name: 'Ana Sayfa', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: postTitle, url: `/blog/${postSlug}` }
    ]);
};

/**
 * Shop için breadcrumb oluştur
 * @param {string} categoryName - Kategori adı (opsiyonel)
 * @param {string} categorySlug - Kategori slug (opsiyonel)
 * @param {string} productName - Ürün adı (opsiyonel)
 * @param {string} productId - Ürün ID (opsiyonel)
 * @returns {Object} JSON-LD BreadcrumbList schema
 */
export const generateShopBreadcrumb = (categoryName = null, categorySlug = null, productName = null, productId = null) => {
    const items = [
        { name: 'Ana Sayfa', url: '/' },
        { name: 'Shop', url: '/shop' }
    ];

    if (categoryName && categorySlug) {
        items.push({
            name: categoryName,
            url: `/shop/kategori/${categorySlug}`
        });
    }

    if (productName && productId) {
        items.push({
            name: productName,
            url: `/shop/urun/${productId}`
        });
    }

    return generateBreadcrumbSchema(items);
};

export default {
    generateBreadcrumbSchema,
    generateVendorListBreadcrumb,
    generateVendorDetailBreadcrumb,
    generateBlogBreadcrumb,
    generateShopBreadcrumb
};
