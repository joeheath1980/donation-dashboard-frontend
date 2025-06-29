/**
 * Image optimization utilities
 * Note: For actual image compression, use build tools or external services
 */

/**
 * Get optimized image source based on screen size and density
 * @param {string} originalSrc - Original image source
 * @param {Object} options - Options for optimization
 * @returns {string} - Optimized image source
 */
export const getOptimizedImageSrc = (originalSrc, options = {}) => {
  const { width, quality = 80 } = options;
  
  // In production, this would return a CDN URL with query params
  // For now, return the original source
  if (process.env.NODE_ENV === 'production' && width) {
    // Example: return `${CDN_URL}/${originalSrc}?w=${width}&q=${quality}`;
  }
  
  return originalSrc;
};

/**
 * Generate srcset for responsive images
 * @param {string} imageSrc - Base image source
 * @param {Array} widths - Array of widths to generate
 * @returns {string} - srcset string
 */
export const generateSrcSet = (imageSrc, widths = [320, 640, 768, 1024, 1280]) => {
  return widths
    .map(width => `${getOptimizedImageSrc(imageSrc, { width })} ${width}w`)
    .join(', ');
};

/**
 * Lazy load image component wrapper
 * @param {Object} props - Image props
 * @returns {JSX.Element} - Image element with lazy loading
 */
export const LazyImage = ({ src, alt, className, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

/**
 * Get WebP version of image if supported
 * @param {string} imageSrc - Original image source
 * @returns {string} - WebP image source or original
 */
export const getWebPSource = (imageSrc) => {
  // Check if browser supports WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
  };
  
  if (supportsWebP() && imageSrc.match(/\.(jpg|jpeg|png)$/i)) {
    return imageSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return imageSrc;
};

/**
 * Preload critical images
 * @param {Array} imageSrcs - Array of image sources to preload
 */
export const preloadImages = (imageSrcs) => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};