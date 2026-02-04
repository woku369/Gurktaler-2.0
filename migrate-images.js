/**
 * Migration Script: Base64 → File-based Image Storage
 * 
 * Migriert alle Bilder aus images.json von Base64-Format zu Dateisystem-basierter Speicherung
 * mit automatischer Thumbnail-Generierung.
 * 
 * USAGE:
 *   node migrate-images.js
 * 
 * Was das Script macht:
 * 1. Liest images.json (enthält Base64-kodierte Bilder)
 * 2. Extrahiert jedes Bild und speichert es als Datei
 * 3. Generiert Thumbnails (200x200px)
 * 4. Schreibt neue images.json mit Pfaden statt Base64
 * 5. Erstellt Backup der alten images.json
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const BASE_PATH = process.env.BASE_PATH || '/volume1/Gurktaler/zweipunktnull';
const THUMBNAIL_SIZE = 200;

async function migrateImages() {
  console.log('🔄 Starting image migration from Base64 to file system...\n');
  
  const imagesJsonPath = path.join(BASE_PATH, 'database', 'images.json');
  
  // 1. Read current images.json
  console.log('📖 Reading images.json...');
  const rawData = await fs.readFile(imagesJsonPath, 'utf8');
  const images = JSON.parse(rawData);
  console.log(`   Found ${images.length} images\n`);
  
  if (images.length === 0) {
    console.log('✅ No images to migrate.');
    return;
  }
  
  // 2. Create backup
  const backupPath = path.join(BASE_PATH, 'database', `images.json.backup-${Date.now()}`);
  console.log(`💾 Creating backup: ${path.basename(backupPath)}`);
  await fs.writeFile(backupPath, rawData);
  console.log('   Backup created\n');
  
  // 3. Process each image
  const migratedImages = [];
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const progress = `[${i + 1}/${images.length}]`;
    
    console.log(`${progress} Processing: ${image.file_name}`);
    
    // Skip if already migrated (has file_path)
    if (image.file_path && !image.data_url) {
      console.log(`   ⏭️  Already migrated, skipping`);
      migratedImages.push(image);
      skippedCount++;
      continue;
    }
    
    // Skip if no data_url
    if (!image.data_url) {
      console.log(`   ⚠️  No data_url found, skipping`);
      migratedImages.push(image);
      skippedCount++;
      continue;
    }
    
    try {
      // Extract base64 data
      const base64Data = image.data_url.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determine file extension
      const mimeMatch = image.data_url.match(/^data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const extensions = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp'
      };
      const ext = extensions[mimeType] || 'jpg';
      
      // Generate filenames
      const index = i; // Use array index as image index
      const filename = `${image.entity_id}_${index}.${ext}`;
      const thumbnailFilename = `${image.entity_id}_${index}_thumb.jpg`; // Always JPEG for thumbnails
      
      // Generate paths
      const relativePath = `images/${image.entity_type}/${filename}`;
      const thumbnailRelativePath = `images/${image.entity_type}/${thumbnailFilename}`;
      const fullPath = path.join(BASE_PATH, relativePath);
      const thumbnailFullPath = path.join(BASE_PATH, thumbnailRelativePath);
      
      // Create directory
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Write original image
      await fs.writeFile(fullPath, buffer);
      console.log(`   ✅ Saved: ${relativePath}`);
      
      // Generate thumbnail
      await sharp(buffer)
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailFullPath);
      console.log(`   🖼️  Thumbnail: ${thumbnailRelativePath}`);
      
      // Get metadata
      const metadata = await sharp(buffer).metadata();
      
      // Create migrated image object (without data_url)
      const migratedImage = {
        ...image,
        file_path: relativePath,
        thumbnail_path: thumbnailRelativePath,
        width: metadata.width,
        height: metadata.height,
        size_bytes: buffer.length
      };
      
      // Remove data_url to save space
      delete migratedImage.data_url;
      
      migratedImages.push(migratedImage);
      migratedCount++;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      // Keep original image object in case of error
      migratedImages.push(image);
    }
    
    console.log('');
  }
  
  // 4. Write new images.json
  console.log('💾 Writing new images.json...');
  const newJsonData = JSON.stringify(migratedImages, null, 2);
  await fs.writeFile(imagesJsonPath, newJsonData);
  
  // 5. Calculate size savings
  const oldSize = Buffer.byteLength(rawData, 'utf8');
  const newSize = Buffer.byteLength(newJsonData, 'utf8');
  const savedBytes = oldSize - newSize;
  const savedMB = (savedBytes / 1024 / 1024).toFixed(2);
  const oldMB = (oldSize / 1024 / 1024).toFixed(2);
  const newMB = (newSize / 1024 / 1024).toFixed(2);
  
  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Migration completed!');
  console.log('='.repeat(60));
  console.log(`📊 Statistics:`);
  console.log(`   Total images:      ${images.length}`);
  console.log(`   Migrated:          ${migratedCount}`);
  console.log(`   Skipped:           ${skippedCount}`);
  console.log(`\n💾 File size:`);
  console.log(`   Before:            ${oldMB} MB`);
  console.log(`   After:             ${newMB} MB`);
  console.log(`   Saved:             ${savedMB} MB (${((savedBytes / oldSize) * 100).toFixed(1)}%)`);
  console.log(`\n📁 Backup:`);
  console.log(`   ${path.basename(backupPath)}`);
  console.log('='.repeat(60));
}

// Run migration
migrateImages().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
