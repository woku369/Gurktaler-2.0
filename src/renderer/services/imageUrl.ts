/**
 * Image URL Helper
 * 
 * Provides utility functions to generate image URLs for the new file-based system
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://100.121.103.107:3002';

/**
 * Get the URL for an image (original or thumbnail)
 * 
 * @param image - Image object from database
 * @param useThumbnail - Whether to use thumbnail (default: true for performance)
 * @returns URL to fetch the image from API
 */
export function getImageUrl(image: { file_path?: string; thumbnail_path?: string; data_url?: string }, useThumbnail: boolean = true): string {
  // New system: Use file paths
  if (useThumbnail && image.thumbnail_path) {
    return `${API_BASE_URL}/api/image?path=${encodeURIComponent(image.thumbnail_path)}`;
  }
  
  if (image.file_path) {
    return `${API_BASE_URL}/api/image?path=${encodeURIComponent(image.file_path)}`;
  }
  
  // Legacy fallback: Base64 data URL
  if (image.data_url) {
    return image.data_url;
  }
  
  // No image available
  return '';
}

/**
 * Get thumbnail URL for an image
 */
export function getThumbnailUrl(image: { thumbnail_path?: string; file_path?: string; data_url?: string }): string {
  return getImageUrl(image, true);
}

/**
 * Get full-resolution URL for an image
 */
export function getFullImageUrl(image: { file_path?: string; data_url?: string }): string {
  return getImageUrl(image, false);
}
