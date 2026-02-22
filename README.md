# car-folie.pl - Modernized Website

A modern, responsive static website for Car-folie.pl, built with Astro and Tailwind CSS.

## Tech Stack

- **Astro 5.x** - Modern static site generator
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Lucide Icons** - Modern, lightweight icon library
- **Fontsource (Self-hosted fonts)** - Inter & Source Sans Pro

## Project Structure

```plain
car-folie-astro/
├── public/                 # Static assets
│   ├── images/            # Images
│   │   └── img/              # Gallery images
├── src/
│   ├── components/         # Reusable components
│   │   ├── Banner.astro
│   │   ├── DarkModeToggle.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Lightbox.astro
│   │   ├── Navigation.astro
│   │   ├── OptimizedImage.astro
│   │   ├── ServiceCard.astro
│   │   └── SocialLinks.astro
│   ├── layouts/           # Page layouts
│   │   ├── Layout.astro
│   │   └── PageLayout.astro
│   ├── pages/             # Page routes
│   │   ├── drukarnia.astro
│   │   ├── dystrybucja.astro
│   │   ├── floty.astro
│   │   ├── franchising.astro
│   │   ├── galeria.astro
│   │   ├── inspiracje.astro
│   │   ├── index.astro
│   │   ├── kontakt.astro
│   │   ├── o-foliach.astro
│   │   ├── o-nas.astro
│   │   ├── press.astro
│   │   ├── referencje.astro
│   │   ├── sitemap.xml.ts
│   │   ├── szkolenia.astro
│   │   ├── technologia.astro
│   │   ├── wycena.astro
│   │   └── zmiana-koloru.astro
│   ├── scripts/           # TypeScript utilities
│   │   ├── animations.ts
│   │   └── lightbox.ts
│   └── styles/            # Global styles
│       └── global.css
├── netlify/              # Netlify Functions
│   └── functions/        # Serverless functions
│       ├── contact.ts      # Contact form handler
│       ├── rate-limit.ts   # Rate limiting logic
│       └── __tests__/      # Unit tests
├── ANIMATIONS.md          # Animation system documentation
├── ACCESSIBILITY_IMPROVEMENTS.md  # Accessibility documentation
├── PERFORMANCE_OPTIMIZATION.md     # Performance documentation
├── README.md              # Project documentation
├── astro.config.mjs       # Astro configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

The development server will start at `http://localhost:4321`

## Documentation

- **[`DEVELOPMENT.md`](DEVELOPMENT.md:1)** - Complete development guide
- **[`FEATURES.md`](FEATURES.md:1)** - Complete feature list
- **[`ANIMATIONS.md`](ANIMATIONS.md) - Animation system documentation
- **[`ACCESSIBILITY_IMPROVEMENTS.md`](ACCESSIBILITY_IMPROVEMENTS.md) - Accessibility documentation
- **[`PERFORMANCE_OPTIMIZATION.md`](PERFORMANCE_OPTIMIZATION.md) - Performance documentation
- **[`RATE_LIMITING.md`](RATE_LIMITING.md) - Rate limiting documentation

## Features

See [`FEATURES.md`](FEATURES.md) for complete list of all project features including:

- Core functionality (Astro, Tailwind, TypeScript)
- Design system (animations, colors, dark mode, typography)
- All 17 pages with descriptions
- 9 reusable components
- Backend integration (Netlify Functions, rate limiting, SendGrid, Airtable)
- Performance & SEO optimizations
- Accessibility features (WCAG 2.1 AA compliant)
- Testing infrastructure (unit tests with Vitest)

## Backend Integration

### Netlify Functions

Serverless functions for contact form and rate limiting:

- **Rate Limiting** - Multi-tiered rate limiting with Upstash Redis
  - See [`RATE_LIMITING.md`](RATE_LIMITING.md) for complete documentation
  - Unit tests: 29/32 passing
  - Test scripts: `npm run test:functions`
- [x] Service card component
- [x] Lightbox component for image gallery
- [x] Homepage with services and features
- [x] About Us page
- [x] Contact page with form
- [x] About Films page
- [x] References page
- [x] Quote Request page
- [x] Press Coverage page
- [x] Printing Services page
- [x] Inspiracje page
- [x] Gallery page with filtering and lightbox
- [x] Color Change page
- [x] Distribution page
- [x] Fleet Services page
- [x] Franchising page
- [x] Vehicle Advertising page
- [x] Training page
- [x] Technology page
- [x] Image assets copied
- [x] SEO optimization (sitemap, robots.txt, meta tags, structured data)
- [x] Performance optimization (WebP conversion, responsive images, lazy loading)
- [x] High priority accessibility improvements (WCAG AA compliance, color contrast, keyboard navigation)
- [x] Medium priority accessibility improvements (focus management, ARIA live regions, breadcrumbs)
- [x] Dark mode support with system preference detection and localStorage persistence
- [x] Animations and transitions (scroll-triggered, hover effects, page transitions, micro-interactions)
- [x] Contact form backend integration with Netlify Functions, SendGrid email service, and Airtable storage
- [x] Rate limiting for form submissions with unit tests

## Design System

### Animations

The website features a comprehensive animation system including:

- **Scroll-triggered animations**: Elements animate when they enter the viewport using Intersection Observer
- **Hover effects**: Smooth transitions on cards, buttons, and links
- **Page transitions**: Fade in/out effects when navigating between pages
- **Parallax effects**: Banner backgrounds move at different speeds for depth
- **Micro-interactions**: Button ripples, link underlines, form focus animations
- **Image loading**: Smooth fade-in when images finish loading
- **Staggered animations**: Grid items animate with sequential delays
- **Accessibility**: Full support for `prefers-reduced-motion`

See [`ANIMATIONS.md`](ANIMATIONS.md) for detailed documentation and usage examples.

### Colors

```css
/* Light mode colors (default) */
--color-primary: #4da6ff;      /* Light blue (WCAG AA compliant) */
--color-primary-dark: #0066cc; /* Darker blue */
--color-primary-light: #80c4ff; /* Lighter blue */
--color-accent: #ccff00;        /* Lime green */
--color-accent-dark: #b8e600;   /* Darker lime */
--color-bg-light: #ffffff;       /* Light background */
--color-bg-secondary: #f5f5f5;  /* Secondary background */
--color-bg-card: #ffffff;      /* Card background */
--color-text-main: #333333;    /* Main text (WCAG AA compliant) */
--color-text-muted: #666666;   /* Muted text (WCAG AA compliant) */
--color-border: #e0e0e0;       /* Border color */
--color-success: #22c55e;      /* Success green */
--color-error: #ef4444;        /* Error red */
--color-warning: #f59e0b;      /* Warning orange */

/* Dark mode colors (applied when .dark class is present) */
--color-bg-light: #121212;       /* Dark background */
--color-bg-secondary: #1a1a1a;  /* Dark secondary background */
--color-bg-card: #1a1a1a;      /* Dark card background */
--color-text-main: #e0e0e0;    /* Light text (WCAG AA compliant) */
--color-text-muted: #b0b0b0;   /* Light muted text (WCAG AA compliant) */
--color-border: #333333;       /* Dark border color */
```

### Dark Mode

The website supports dark mode with the following features:

- **System preference detection**: Automatically detects user's system color scheme preference
- **Manual toggle**: Users can manually switch between light and dark modes using a toggle button in the header
- **LocalStorage persistence**: User's preference is saved and persists across sessions
- **Smooth transitions**: All color changes have smooth 0.3s transitions for a polished user experience
- **Accessibility**: Dark mode maintains WCAG AA color contrast standards

### Typography

- **Headings**: Source Sans Pro
- **Body**: Inter
- **Sizes**: Mobile-first responsive scaling

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Pages

1. **Homepage** (`/`) - Services overview, features, company intro
2. **About Us** (`/o-nas`) - Company information, facilities
3. **Contact** (`/kontakt`) - Contact info, contact form
4. **About Films** (`/o-foliach`) - Information about car films
5. **References** (`/referencje`) - Customer testimonials and portfolio
6. **Quote Request** (`/wycena`) - Price quote request form
7. **Press Coverage** (`/press`) - Media coverage and articles
8. **Printing Services** (`/drukarnia`) - Printing services overview
9. **Inspiracje** (`/inspiracje`) - Design inspiration gallery
10. **Gallery** (`/galeria`) - Image gallery with category filtering and lightbox
11. **Color Change** (`/zmiana-koloru`) - Car color change services
12. **Distribution** (`/dystrybucja`) - Distribution information
13. **Fleet Services** (`/floty`) - Fleet vehicle services
14. **Franchising** (`/franchising`) - Franchise opportunities
15. **Vehicle Advertising** (`/reklamy`) - Vehicle advertising services
16. **Training** (`/szkolenia`) - Training programs
17. **Technology** (`/technologia`) - Technology and equipment information

## Deployment

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages

```bash
# Build
npm run build

# Deploy dist folder to gh-pages branch
```

## Performance Targets

- ✅ Lighthouse Score: 90+
- ✅ Core Web Vitals: All "Good"
- ✅ First Contentful Paint: < 1.8s
- ✅ Time to Interactive: < 3.8s
- ✅ Cumulative Layout Shift: < 0.1

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ✅ WCAG 2.1 AA compliant (high priority improvements)
- ✅ Color contrast meeting WCAG AA standards (4.5:1 for normal text)
- ✅ Skip navigation link for keyboard users
- ✅ Keyboard navigation with proper focus management
- ✅ Screen reader support with ARIA labels and roles
- ✅ Focus indicators on all interactive elements
- ✅ Mobile menu accessibility with focus trap
- ✅ Lightbox accessibility with dialog role and focus management
- ✅ Form focus styles for better keyboard navigation
- ✅ Reduced motion support for accessibility

See [`ACCESSIBILITY_IMPROVEMENTS.md`](ACCESSIBILITY_IMPROVEMENTS.md) for detailed accessibility documentation.

## Testing

### Unit Tests

Comprehensive unit tests have been created for Netlify Functions:

- **Test File**: [`netlify/functions/__tests__/rate-limit.test.ts`](netlify/functions/__tests__/rate-limit.test.ts)
- **Framework**: Vitest v4.0.18
- **Total Tests**: 32
- **Passed**: 29 ✅
- **Duration**: ~400-500ms

Run tests from the main directory:

```bash
npm run test:functions          # Run all tests once
npm run test:functions:watch    # Run in watch mode
npm run test:functions:ui       # Run with UI
```

See [`RATE_LIMITING_UNIT_TESTS_SUMMARY.md`](RATE_LIMITING_UNIT_TESTS_SUMMARY.md) for detailed test documentation.

## License

Copyright © 2024 car-folie.pl. All rights reserved.

## Animations Documentation

See [`ANIMATIONS.md`](ANIMATIONS.md) for comprehensive documentation about the animation system, including:

- Animation utilities and keyframes
- Scroll-triggered animations
- Component animations
- Page transitions
- Micro-interactions
- Performance considerations
- Accessibility features
- Usage examples

---

**Last Updated**: 2026-02-22
**Status**: All core features completed including rate limiting with comprehensive unit tests.
