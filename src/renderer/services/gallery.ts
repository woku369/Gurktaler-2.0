// Gallery Service
// Central management for all images across entities with metadata

import { images as imagesService, tagAssignments, tags } from './storage';
import type { Image, Tag } from '@/shared/types';

export interface GalleryImage extends Image {
  tags?: Tag[];
  entity_name?: string; // Resolved entity name
}

export interface GalleryFilter {
  entityType?: string;
  entityId?: string;
  projectId?: string;
  tagIds?: string[];
  searchTerm?: string;
}

/**
 * Get all images with resolved metadata
 */
export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const allImages = await imagesService.getAll();
  const allTags = await tags.getAll();
  
  const galleryImages: GalleryImage[] = [];
  
  for (const image of allImages) {
    // Get tags for this image
    const imageTagAssignments = await tagAssignments.getByEntity('image', image.id);
    const imageTags = imageTagAssignments
      .map(ta => allTags.find(t => t.id === ta.tag_id))
      .filter((t): t is Tag => t !== undefined);
    
    galleryImages.push({
      ...image,
      tags: imageTags,
    });
  }
  
  return galleryImages.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Get filtered images
 */
export async function getFilteredImages(filter: GalleryFilter): Promise<GalleryImage[]> {
  let images = await getAllGalleryImages();
  
  // Filter by entity type
  if (filter.entityType) {
    images = images.filter(img => img.entity_type === filter.entityType);
  }
  
  // Filter by entity ID
  if (filter.entityId) {
    images = images.filter(img => img.entity_id === filter.entityId);
  }
  
  // Filter by tags
  if (filter.tagIds && filter.tagIds.length > 0) {
    images = images.filter(img => 
      img.tags?.some(tag => filter.tagIds?.includes(tag.id))
    );
  }
  
  // Filter by search term (file name or caption)
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase();
    images = images.filter(img =>
      img.file_name.toLowerCase().includes(term) ||
      (img.caption && img.caption.toLowerCase().includes(term))
    );
  }
  
  return images;
}

/**
 * Upload image to gallery (direct upload without entity assignment)
 */
export async function uploadToGallery(
  dataUrl: string,
  fileName: string,
  caption?: string
): Promise<Image> {
  // Create image with special "gallery" entity type
  const image = await imagesService.create({
    entity_type: 'note', // Use 'note' as fallback, can be changed later
    entity_id: 'gallery', // Special ID for gallery-only images
    data_url: dataUrl,
    file_name: fileName,
    caption: caption || '',
  });
  
  return image;
}

/**
 * Update image metadata (entity assignment, caption)
 */
export async function updateImageMetadata(
  imageId: string,
  updates: {
    entity_type?: Image['entity_type'];
    entity_id?: string;
    caption?: string;
  }
): Promise<Image | null> {
  return await imagesService.update(imageId, updates);
}

/**
 * Add tag to image
 */
export async function addTagToImage(imageId: string, tagId: string): Promise<void> {
  await tagAssignments.create({
    tag_id: tagId,
    entity_type: 'image',
    entity_id: imageId,
  });
}

/**
 * Remove tag from image
 */
export async function removeTagFromImage(imageId: string, tagId: string): Promise<void> {
  const assignments = await tagAssignments.getByEntity('image', imageId);
  const assignment = assignments.find(ta => ta.tag_id === tagId);
  if (assignment) {
    await tagAssignments.delete(assignment.id);
  }
}

/**
 * Delete image
 */
export async function deleteGalleryImage(imageId: string): Promise<void> {
  // Delete tag assignments first
  const imageTagAssignments = await tagAssignments.getByEntity('image', imageId);
  for (const ta of imageTagAssignments) {
    await tagAssignments.delete(ta.id);
  }
  
  // Delete image
  await imagesService.delete(imageId);
}

/**
 * Get image statistics
 */
export async function getGalleryStats() {
  const allImages = await imagesService.getAll();
  
  const byEntityType: Record<string, number> = {};
  for (const img of allImages) {
    byEntityType[img.entity_type] = (byEntityType[img.entity_type] || 0) + 1;
  }
  
  return {
    total: allImages.length,
    byEntityType,
  };
}
