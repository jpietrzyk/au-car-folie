#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts images to WebP format with optimal quality settings
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, '../public/images');
const OUTPUT_DIR = join(__dirname, '../public/images-optimized');

const QUALITY = 85;
const FORMATS = ['.jpg', '.jpeg', '.png'];

async function optimizeImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Convert to WebP with optimization
    await image
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outputPath);

    const inputStats = await stat(inputPath);
    const outputStats = await stat(outputPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✓ ${inputPath.split('/').pop()} → ${outputPath.split('/').pop()} (${savings}% reduction)`);
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
  }
}

async function processImages() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Quality: ${QUALITY}%\n`);

  // Create output directory if it doesn't exist
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await readdir(SOURCE_DIR);
  const imageFiles = files.filter(file =>
    FORMATS.includes(extname(file).toLowerCase())
  );

  console.log(`Found ${imageFiles.length} images to optimize\n`);

  for (const file of imageFiles) {
    const inputPath = join(SOURCE_DIR, file);
    const outputPath = join(OUTPUT_DIR, file.replace(/\.[^.]+$/, '.webp'));
    await optimizeImage(inputPath, outputPath);
  }

  console.log('\n✅ Image optimization complete!');
}

processImages().catch(console.error);
