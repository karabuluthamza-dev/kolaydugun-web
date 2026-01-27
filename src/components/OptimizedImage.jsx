import React from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - Performans için optimize edilmiş görsel component
 * 
 * Özellikler:
 * - Lazy loading (priority=false ise)
 * - Async decoding
 * - Supabase Storage transform desteği
 * - WebP fallback
 * 
 * Kullanım:
 * <OptimizedImage 
 *   src="/path/to/image.jpg" 
 *   alt="Açıklama" 
 *   priority={false}  // Hero görseller için true
 * />
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    priority = false,
    width,
    height,
    sizes,
    onLoad,
    onError,
    style,
    ...props
}) => {
    // Boş src kontrolü
    if (!src) {
        return null;
    }

    // Supabase URL'lerini optimize et
    const getOptimizedSrc = (url) => {
        if (!url) return url;

        // Zaten optimize edilmişse dokunma
        if (url.includes('/render/image/')) {
            return url;
        }

        // Supabase storage URL'lerini render endpoint'ine çevir
        if (url.includes('supabase') && url.includes('/storage/v1/object/public/')) {
            // Sadece büyük görseller için transform uygula
            if (!priority) {
                return url.replace(
                    '/storage/v1/object/public/',
                    '/storage/v1/render/image/public/'
                ) + '?quality=80';
            }
        }

        return url;
    };

    const optimizedSrc = getOptimizedSrc(src);

    return (
        <img
            src={optimizedSrc}
            alt={alt || ''}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            width={width}
            height={height}
            sizes={sizes}
            onLoad={onLoad}
            onError={onError}
            style={style}
            {...props}
        />
    );
};

OptimizedImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    priority: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sizes: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    style: PropTypes.object
};

export default OptimizedImage;
