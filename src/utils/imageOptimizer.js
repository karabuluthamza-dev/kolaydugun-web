/**
 * Image optimization utilities
 * 
 * Supports two approaches:
 * 1. New images: Uses multi-size uploads (filename_hero.jpg, filename_card.jpg)
 * 2. Old images: Falls back to Supabase Storage transforms
 */

/**
 * Get optimized image URL for different use cases
 * @param {string} url - Original image URL (usually hero size)
 * @param {string} size - Size preset: 'thumbnail' | 'card' | 'hero' | 'full'
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, size = 'full') => {
    if (!url) return url;

    // If size is 'full' or 'hero', return original URL
    if (size === 'full' || size === 'hero') {
        return url;
    }

    // Check if this is a new multi-size image (contains _hero.jpg)
    if (url.includes('_hero.jpg')) {
        // Replace _hero with the requested size
        const sizeMap = {
            card: '_card.jpg',
            thumbnail: '_card.jpg' // Use card for thumbnails too
        };

        if (sizeMap[size]) {
            return url.replace('_hero.jpg', sizeMap[size]);
        }
    }

    // For old images without multi-size, try Supabase transforms as fallback
    if (url.includes('supabase') && url.includes('/storage/')) {
        const presets = {
            thumbnail: { width: 200, quality: 70 },
            card: { width: 600, quality: 80 }
        };

        const preset = presets[size];
        if (preset) {
            const transformUrl = url.replace(
                '/storage/v1/object/public/',
                '/storage/v1/render/image/public/'
            );

            const params = new URLSearchParams();
            if (preset.width) params.set('width', preset.width);
            if (preset.quality) params.set('quality', preset.quality);

            const separator = transformUrl.includes('?') ? '&' : '?';
            return `${transformUrl}${separator}${params.toString()}`;
        }
    }

    // Return original if no optimization possible
    return url;
};

/**
 * Generate srcSet for responsive images
 * @param {string} url - Original image URL
 * @returns {string} srcSet attribute value
 */
export const getImageSrcSet = (url) => {
    if (!url) return '';

    // For multi-size images
    if (url.includes('_hero.jpg')) {
        const cardUrl = url.replace('_hero.jpg', '_card.jpg');
        return `${cardUrl} 600w, ${url} 1920w`;
    }

    return '';
};

export default {
    getOptimizedImageUrl,
    getImageSrcSet
};
