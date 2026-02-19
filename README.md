# Car-folie.pl - Modernized Website

A modern, responsive static website for Car-folie.pl, built with Astro and Tailwind CSS.

## Tech Stack

- **Astro 4.x** - Modern static site generator
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Lucide Icons** - Modern, lightweight icon library
- **Google Fonts** - Inter & Source Sans Pro

## Project Structure

```text
car-folie-astro/
├── public/                 # Static assets
│   ├── images/            # Images
│   └── img/              # Gallery images
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
│   │   ├── reklamy.astro
│   │   ├── sitemap.xml.ts
│   │   ├── szkolenia.astro
│   │   ├── technologia.astro
│   │   ├── wycena.astro
│   │   └── zmiana-koloru.astro
│   ├── scripts/           # JavaScript utilities
│   │   └── animations.js
│   └── styles/            # Global styles
│       └── global.css
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

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The development server will start at `http://localhost:4321`

## Features

### ✅ Completed

- [x] Project setup with Astro
- [x] Tailwind CSS integration
- [x] TypeScript configuration
- [x] Global styles with CSS variables
- [x] Base layout component
- [x] Page layout component
- [x] Header component with responsive navigation
- [x] Footer component
- [x] Social links component
- [x] Banner component
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
- [x] Inspirations page
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
- [x] Dark mode support with system preference detection and localStorage persistence
- [x] Animations and transitions (scroll-triggered, hover effects, page transitions, micro-interactions)
- [x] Contact form backend integration with Netlify Functions (without external email provider)
- [x] Client-side form validation with real-time feedback
- [x] Loading states and error handling for better UX

### 🚧 In Progress

- [ ] Optional: Add email provider integration (SendGrid/Resend/Mailgun)
- [ ] Phase 5: Testing and deployment of contact form
  - [ ] Local testing with Netlify Dev
  - [ ] Deploy to Netlify production
  - [ ] Configure environment variables (if external provider is added)
  - [ ] Verify production logs and form flow

### 📋 Planned

- [ ] Medium priority accessibility improvements (focus management, ARIA live regions, breadcrumbs)
- [ ] Analytics integration

### 🔍 SEO Enhancement Tasks (Optional)

- [ ] Update structured data with actual business contact information (address, phone, coordinates)
- [ ] Add actual social media URLs to the structured data
- [ ] Submit sitemap to Google Search Console and Bing Webmaster Tools
- [ ] Update Twitter handle from placeholder to actual account
- [ ] Add page-specific meta descriptions for better SEO targeting

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
- **Manual toggle**: Users can manually switch between light and dark modes using the toggle button in the header
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

### Completed Pages

1. **Homepage** (`/`) - Services overview, features, company intro
2. **About Us** (`/o-nas`) - Company information, facilities
3. **Contact** (`/kontakt`) - Contact info, contact form
4. **About Films** (`/o-foliach`) - Information about car films
5. **References** (`/referencje`) - Customer testimonials and portfolio
6. **Quote Request** (`/wycena`) - Price quote request form
7. **Press Coverage** (`/press`) - Media coverage and articles
8. **Printing Services** (`/drukarnia`) - Printing services overview
9. **Inspirations** (`/inspiracje`) - Design inspiration gallery
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

- Lighthouse Score: 90+
- Core Web Vitals: All "Good"
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

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

## License

Copyright © 2024 car-folie.pl. All rights reserved.

## Migration Plan

See [`plans/car-folie-migration-plan.md`](../plans/car-folie-migration-plan.md) for detailed migration documentation.

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

**Last Updated**: 2026-02-18
**Status**: SEO, performance, high priority accessibility optimizations, dark mode support, animations, and Netlify Functions contact backend completed, ready for deployment
