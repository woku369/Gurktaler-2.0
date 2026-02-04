/**
 * Image Cache Service
 * 
 * Löst das Performance-Problem beim Laden von images.json:
 * - Lädt images.json nur einmal beim ersten Zugriff (nur Metadaten, kein Base64!)
 * - Hält alle Bildmetadaten im Speicher (Cache)
 * - Bietet schnelle Filterfunktionen ohne erneutes Laden
 * - Invalidiert Cache bei Änderungen (create/update/delete)
 * 
 * WICHTIG: images.json enthält jetzt nur noch Metadaten (~10 KB statt 23 MB),
 * die eigentlichen Bilder werden lazy über /api/image geladen.
 */

import { nasStorage } from './nasStorage';
import type { Image } from '@/shared/types';

class ImageCacheService {
  private cache: Image[] | null = null;
  private loading: Promise<Image[]> | null = null;

  /**
   * Lädt alle Bilder (nur beim ersten Aufruf, danach aus Cache)
   */
  async getAll(): Promise<Image[]> {
    // Wenn Cache vorhanden, direkt zurückgeben
    if (this.cache !== null) {
      return this.cache;
    }

    // Wenn bereits ein Ladevorgang läuft, darauf warten
    if (this.loading !== null) {
      return this.loading;
    }

    // Neuen Ladevorgang starten
    console.log('[ImageCache] 🔄 Lade Bildmetadaten (images.json - ohne Base64)...');
    const startTime = performance.now();

    // Show loading indicator während des ersten Ladens
    const loadingEvent = new CustomEvent('app:loading', { 
      detail: { isLoading: true, message: 'Lade Bilddatenbank...' } 
    });
    window.dispatchEvent(loadingEvent);

    this.loading = nasStorage.readJson<Image>(nasStorage.getJsonFilePath('images'))
      .then(images => {
        const duration = Math.round(performance.now() - startTime);
        console.log(`[ImageCache] ✅ ${images.length} Bilder geladen in ${duration}ms`);
        this.cache = images;
        this.loading = null;
        
        // Hide loading indicator
        const doneEvent = new CustomEvent('app:loading', { 
          detail: { isLoading: false } 
        });
        window.dispatchEvent(doneEvent);
        
        return images;
      })
      .catch(error => {
        console.error('[ImageCache] ❌ Fehler beim Laden:', error);
        this.loading = null;
        
        // Hide loading indicator
        const errorEvent = new CustomEvent('app:loading', { 
          detail: { isLoading: false } 
        });
        window.dispatchEvent(errorEvent);
        
        throw error;
      });

    return this.loading;
  }

  /**
   * Filtert Bilder nach Entity (aus Cache, super schnell)
   */
  async getByEntity(entityType: string, entityId: string): Promise<Image[]> {
    const all = await this.getAll();
    return all.filter(i => i.entity_type === entityType && i.entity_id === entityId);
  }

  /**
   * Findet ein einzelnes Bild nach ID (aus Cache)
   */
  async getById(id: string): Promise<Image | undefined> {
    const all = await this.getAll();
    return all.find(i => i.id === id);
  }

  /**
   * Invalidiert den Cache (nach create/update/delete)
   */
  invalidate(): void {
    console.log('[ImageCache] 🔄 Cache invalidiert');
    this.cache = null;
    this.loading = null;
  }

  /**
   * Aktualisiert ein Bild im Cache (optimistische Update)
   */
  updateInCache(id: string, updates: Partial<Image>): void {
    if (this.cache) {
      const index = this.cache.findIndex(i => i.id === id);
      if (index !== -1) {
        this.cache[index] = { ...this.cache[index], ...updates };
        console.log('[ImageCache] ✅ Bild im Cache aktualisiert:', id);
      }
    }
  }

  /**
   * Fügt ein Bild zum Cache hinzu (optimistische Update)
   */
  addToCache(image: Image): void {
    if (this.cache) {
      this.cache.push(image);
      console.log('[ImageCache] ✅ Bild zum Cache hinzugefügt:', image.id);
    }
  }

  /**
   * Entfernt ein Bild aus dem Cache (optimistische Update)
   */
  removeFromCache(id: string): void {
    if (this.cache) {
      this.cache = this.cache.filter(i => i.id !== id);
      console.log('[ImageCache] ✅ Bild aus Cache entfernt:', id);
    }
  }

  /**
   * Gibt Cache-Statistiken zurück
   */
  getStats(): { cached: boolean; count: number; sizeMB: number } {
    if (!this.cache) {
      return { cached: false, count: 0, sizeMB: 0 };
    }

    // Geschätzte Größe (nur Metadaten, keine Base64 mehr!)
    const metadataSize = JSON.stringify(this.cache).length;

    return {
      cached: true,
      count: this.cache.length,
      sizeMB: Math.round(metadataSize / 1024 / 1024 * 100) / 100
    };
  }
}

// Singleton Export
export const imageCache = new ImageCacheService();
