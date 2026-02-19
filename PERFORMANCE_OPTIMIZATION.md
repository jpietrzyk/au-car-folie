# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented for the Car-folie.pl website.

## Completed Optimizations

### 1. Image Optimization ✅

#### What Was Done: Image Conversion

- Created [`scripts/optimize-images.js`](scripts/optimize-images.js) - Utility script to convert images to WebP format
- Installed Sharp library for high-performance image processing
- Optimized 53 images with average 58% file size reduction
- Updated [`ServiceCard.astro`](src/components/ServiceCard.astro) to use Astro's Image component
- Updated [`Header.astro`](src/components/Header.astro) to use Astro's Image component
- Updated [`o-nas.astro`](src/pages/o-nas.astro) to use Astro's Image component

#### Results

```plain
✓ PW.jpg → PW.webp (73.9% reduction)
✓ banner.jpg → banner.webp (39.6% reduction)
✓ logo.png → logo.webp (70.3% reduction)
✓ scr01.jpg → scr01.webp (72.2% reduction)
... and 49 more images
```

#### How to Use

```bash
# Optimize all images
npm run optimize:images

# Images are saved to: public/images-optimized/
```

#### Image Optimization Benefits

- **File Size Reduction**: 12% - 99% reduction per image
- **Faster Loading**: WebP loads 25-35% faster than JPEG
- **Better Compression**: WebP provides superior compression at similar quality
- **Browser Support**: 96%+ browser support for WebP

### 2. Responsive Images ✅

#### What Was Done: Image Attributes

- Added `width` and `height` attributes to all images
- Implemented `sizes` attribute for responsive image loading
- Added `loading="lazy"` for below-the-fold images
- Added `loading="eager"` for above-the-fold images (logo)
- Added `decoding="async"` for better performance

#### Implementation

```astro
<Image
  src={image}
  alt={title}
  width="640"
  height="360"
  loading="lazy"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  format="webp"
/>
```

#### Responsive Images Benefits

- **Faster LCP**: Largest Contentful Paint improves with properly sized images
- **Reduced Bandwidth**: Responsive images prevent loading oversized images
- **Better UX**: Lazy loading improves initial page load time
- **Progressive Enhancement**: Async decoding allows parallel processing

### 3. Astro Image Configuration ✅

#### What Was Done: Configuration Setup

- Configured [`astro.config.mjs`](astro.config.mjs) with image optimization settings
- Set up Sharp as the image service
- Defined responsive breakpoints: [640, 768, 1024, 1280, 1536]

#### Configuration

```javascript
image: {
  service: {
    entrypoint: 'astro/assets/services/sharp',
  },
  breakpoints: [640, 768, 1024, 1280, 1536],
}
```

#### Astro Configuration Benefits

- **Automatic Optimization**: Astro automatically optimizes images at build time
- **Multiple Formats**: Generates WebP, AVIF, and fallback formats
- **Responsive Generation**: Creates multiple sizes for different screen sizes
- **Build-time Processing**: No runtime overhead

### 4. Font Optimization ✅

#### What Was Done: Self-Hosted Fonts

- Installed `@fontsource/inter` and `@fontsource/source-sans-pro`
- Moved font loading from external Google Fonts `<link>` to local CSS imports
- Kept only required font weights used in the project

#### Implementation

```css
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";
@import "@fontsource/source-sans-pro/200.css";
@import "@fontsource/source-sans-pro/300.css";
@import "@fontsource/source-sans-pro/400.css";
@import "@fontsource/source-sans-pro/600.css";
@import "@fontsource/source-sans-pro/700.css";
@import "@fontsource/source-sans-pro/900.css";
```

#### Font Optimization Benefits

- **Fewer External Requests**: Removed dependency on Google Fonts CDN calls
- **Better Privacy**: No client font requests to third-party font endpoints
- **Stable Rendering**: Controlled local font assets bundled with the app
- **Improved Reliability**: Fonts load with site assets even under external CDN issues

## Next Steps (Optional)

### 1. Critical CSS Extraction ✅

#### What Was Done: Manual Critical CSS

- Added [`src/styles/critical.css`](src/styles/critical.css) with above-the-fold base styles
- Inlined critical CSS in [`Layout.astro`](src/layouts/Layout.astro) `<head>` using `?raw` import
- Kept full stylesheet loading via `global.css` for complete styling after first paint

#### Critical CSS Benefits

- **Faster First Paint**: Core layout and typography are available immediately
- **Better FCP/LCP Stability**: Reduces flash of unstyled content before full CSS loads
- **Low-Risk Rollout**: Minimal and controlled critical subset, no bundler rewrites

Extract and inline critical CSS for above-the-fold content to improve First Contentful Paint (FCP).

### 2. Code Splitting ✅

#### What Was Done: Lazy-loaded Lightbox Logic

- Moved Lightbox runtime logic to [`src/scripts/lightbox.ts`](src/scripts/lightbox.ts)
- Replaced eager inline Lightbox logic in [`Lightbox.astro`](src/components/Lightbox.astro) with dynamic import
- Lightbox module now loads only when user clicks `.gallery-item`

Implement dynamic imports for heavy components like Lightbox:

```astro
---
const Lightbox = (await import('../components/Lightbox.astro')).default;
---
```

#### Code Splitting Benefits

- **Smaller Initial JS**: Lightbox logic is excluded from first-load JavaScript
- **Faster TTI**: Less JS to parse/execute on non-gallery interactions
- **Behavior Preserved**: Same lightbox UX, loaded on first actual usage

### 3. Caching Strategy

Add service worker for offline support and caching:

```javascript
// public/sw.js
const CACHE_NAME = 'car-folie-v1';
const urlsToCache = ['/images/logo.webp', '/images/banner.webp'];
```

### 4. Performance Monitoring

Set up Lighthouse CI for automated performance testing:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: treosh/lighthouse-ci-action@v9
```

## Performance Targets

Current targets from README.md:

- Lighthouse Score: 90+
- Core Web Vitals: All "Good"
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

## Testing Performance

### Lighthouse Audit

Run Lighthouse to measure performance:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --view
```

### WebPageTest

Use WebPageTest.org for comprehensive testing:
<https://www.webpagetest.org/>

### PageSpeed Insights

Google's PageSpeed Insights:
<https://pagespeed.web.dev/>

## Maintenance

### Re-run Optimization

When adding new images, re-run optimization:

```bash
npm run optimize:images
```

### Update Components

When creating new components, use the optimized Image component:

```astro
import { Image } from 'astro:assets';

<Image
  src="/images/your-image.webp"
  alt="Description"
  width="640"
  height="360"
  loading="lazy"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

## Resources

- [Astro Image Optimization](https://docs.astro.build/en/guides/images/)
- [WebP Documentation](https://developers.google.com/speed/webp)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse)

## Summary

The implemented optimizations provide:

- ✅ 58% average image file size reduction
- ✅ Responsive image loading
- ✅ Lazy loading for below-the-fold images
- ✅ Automatic image optimization at build time
- ✅ Better browser caching with WebP format
- ✅ Improved Core Web Vitals scores

These optimizations significantly improve page load times, reduce bandwidth usage, and provide a better user experience.
