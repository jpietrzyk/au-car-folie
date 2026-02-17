# Car-folie.pl - Modernized Website

A modern, responsive static website for Car-folie.pl, built with Astro and Tailwind CSS.

## Tech Stack

- **Astro 4.x** - Modern static site generator
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Lucide Icons** - Modern, lightweight icon library
- **Google Fonts** - Inter & Source Sans Pro

## Project Structure

```
car-folie-astro/
├── public/                 # Static assets
│   ├── images/            # Images
│   └── img/              # Gallery images
├── src/
│   ├── components/         # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   ├── Banner.astro
│   │   ├── ServiceCard.astro
│   │   └── SocialLinks.astro
│   ├── layouts/           # Page layouts
│   │   ├── Layout.astro
│   │   └── PageLayout.astro
│   ├── pages/             # Page routes
│   │   ├── index.astro
│   │   ├── o-nas.astro
│   │   └── kontakt.astro
│   └── styles/            # Global styles
│       └── global.css
└── package.json
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
- [x] Homepage with services and features
- [x] About Us page
- [x] Contact page with form
- [x] Image assets copied

### 🚧 In Progress

- [ ] Remaining pages migration (14 pages)
- [ ] Gallery component with lightbox
- [ ] Contact form backend integration
- [ ] Image optimization

### 📋 Planned

- [ ] SEO optimization (sitemap, robots.txt)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Dark mode support
- [ ] Animations and transitions
- [ ] Contact form with Formspree/Netlify Forms
- [ ] Analytics integration

## Design System

### Colors

```css
--color-primary: #0173ff;      /* Blue */
--color-accent: #ccff00;        /* Lime green */
--color-bg-dark: #121212;       /* Dark background */
--color-bg-card: #1a1a1a;      /* Card background */
--color-text-main: #cccccc;      /* Main text */
--color-text-muted: #888888;     /* Muted text */
```

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

### Remaining Pages

4. About Films (`/o-foliach`)
5. References (`/referencje`)
6. Quote Request (`/wycena`)
7. Press Coverage (`/press`)
8. Printing Services (`/drukarnia`)
9. Inspirations (`/inspiracje`)
10. Gallery (`/galeria`)
11. Color Change (`/zmiana-koloru`)
12. Distribution (`/dystrybucja`)
13. Fleet Services (`/floty`)
14. Franchising (`/franchising`)
15. Vehicle Advertising (`/reklamy`)
16. Training (`/szkolenia`)
17. Technology (`/technologia`)

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

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Focus indicators
- ARIA labels

## License

Copyright © 2024 car-folie.pl. All rights reserved.

## Migration Plan

See [`plans/car-folie-migration-plan.md`](../plans/car-folie-migration-plan.md) for detailed migration documentation.

---

**Last Updated**: 2026-02-17
**Status**: Phase 1 & 2 Complete, Phase 3 In Progress
