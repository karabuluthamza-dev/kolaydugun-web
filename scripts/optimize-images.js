/**
 * Image Optimization Script
 * Optimize large images in public folder for better performance
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const PUBLIC_DIR = './public';
const MAX_FAVICON_SIZE = 64; // favicon max 64x64
const MAX_PWA_ICON_SIZE = 192; // PWA icon 192x192
const MAX_OTHER_WIDTH = 1200; // Other images max 1200px width
const JPEG_QUALITY = 80;
const PNG_COMPRESSION = 8;

async function optimizeImage(filePath, filename) {
    const ext = extname(filename).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

    const stats = await stat(filePath);
    const sizeKB = stats.size / 1024;

    if (sizeKB < 30) {
        console.log(`✓ ${filename} (${sizeKB.toFixed(1)}KB) - already optimized`);
        return;
    }

    console.log(`Optimizing ${filename} (${sizeKB.toFixed(1)}KB)...`);

    try {
        let transformer = sharp(filePath);
        const metadata = await transformer.metadata();

        // Determine target size based on filename
        let targetWidth = MAX_OTHER_WIDTH;
        if (filename.includes('favicon')) {
            targetWidth = MAX_FAVICON_SIZE;
        } else if (filename.includes('pwa-icon')) {
            targetWidth = MAX_PWA_ICON_SIZE;
        }

        // Only resize if larger than target
        if (metadata.width > targetWidth) {
            transformer = transformer.resize(targetWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Apply appropriate compression
        if (ext === '.png') {
            transformer = transformer.png({
                compressionLevel: PNG_COMPRESSION,
                adaptiveFiltering: true,
                palette: true
            });
        } else {
            transformer = transformer.jpeg({
                quality: JPEG_QUALITY,
                mozjpeg: true
            });
        }

        // Write optimized image
        const outputPath = filePath;
        await transformer.toBuffer().then(data => {
            return sharp(data).toFile(outputPath + '.tmp');
        });

        // Replace original with optimized
        const { rename, unlink } = await import('fs/promises');
        await unlink(filePath);
        await rename(outputPath + '.tmp', outputPath);

        const newStats = await stat(filePath);
        const newSizeKB = newStats.size / 1024;
        const savedPercent = ((sizeKB - newSizeKB) / sizeKB * 100).toFixed(1);

        console.log(`  ➜ Optimized: ${newSizeKB.toFixed(1)}KB (saved ${savedPercent}%)`);
    } catch (err) {
        console.error(`  ✗ Error optimizing ${filename}:`, err.message);
    }
}

async function processDirectory(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else {
            await optimizeImage(fullPath, entry.name);
        }
    }
}

console.log('🖼️ Starting image optimization...\n');
processDirectory(PUBLIC_DIR)
    .then(() => console.log('\n✅ Image optimization complete!'))
    .catch(err => console.error('Error:', err));
