/**
 * Ensures a URL is absolute by prepending https:// if no protocol is present.
 * Also handles mailto: and tel: links.
 * 
 * @param {string} url - The URL to format
 * @returns {string} - The formatted absolute URL
 */
export const formatExternalUrl = (url) => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (
        trimmedUrl.startsWith('http://') ||
        trimmedUrl.startsWith('https://') ||
        trimmedUrl.startsWith('mailto:') ||
        trimmedUrl.startsWith('tel:') ||
        trimmedUrl.startsWith('/') ||
        trimmedUrl.startsWith('#')
    ) {
        return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
};
