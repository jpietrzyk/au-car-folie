# Project Features

## Completed Features

### Core Functionality

- **Astro 5.x** - Modern static site generator with server-side rendering
- **Tailwind CSS 4.x** - Utility-first CSS framework for rapid UI development
- **TypeScript** - Type-safe development with full type checking
- **Lucide Icons** - Modern, lightweight icon library for consistent iconography
- **Fontsource Fonts** - Self-hosted Inter & Source Sans Pro fonts for typography

### Design System

- **Responsive Design** - Mobile-first approach with breakpoints for mobile, tablet, and desktop
- **Dark Mode** - System preference detection with manual toggle and localStorage persistence
- **Color System** - WCAG AA compliant colors with light and dark mode support
- **Typography** - Source Sans Pro for headings, Inter for body text
- **Animations** - Comprehensive animation system with scroll-triggered, hover effects, and page transitions

### Pages (17 Total)

1. **Homepage** (`/`) - Services overview, features, and company introduction
2. **About Us** (`/o-nas`) - Company information and facilities
3. **Contact** (`/kontakt`) - Contact information and form
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

### Components (9 Total)

1. **Banner** - Hero banners with parallax effects
2. **DarkModeToggle** - Dark mode switcher with system preference detection
3. **Footer** - Site footer with links and copyright
4. **Header** - Responsive navigation with mobile menu
5. **Lightbox** - Image gallery lightbox with keyboard navigation
6. **Navigation** - Mobile-responsive navigation menu
7. **OptimizedImage** - Lazy-loaded images with fade-in animation
8. **ServiceCard** - Service description cards with hover effects
9. **SocialLinks** - Social media links with hover animations

### Layouts (2 Total)

1. **Layout** - Base layout with metadata and global styles
2. **PageLayout** - Page-specific layout with structured data

### Backend Integration

- **Netlify Functions** - Serverless functions for contact form
- **Rate Limiting** - Multi-tiered rate limiting with Upstash Redis
- **SendGrid Email** - Email service for form notifications
- **Airtable Storage** - Form submission storage with duplicate protection
- **reCAPTCHA v3** - Invisible spam protection with score-based filtering

### Performance & SEO

- **WebP Images** - Optimized images in separate directory
- **Lazy Loading** - Images load on demand for better performance
- **Sitemap** - Automatic sitemap generation
- **Robots.txt** - Search engine crawling instructions
- **Meta Tags** - SEO-optimized meta descriptions
- **Structured Data** - Schema.org markup for search engines

### Accessibility (WCAG 2.1 AA)

- **Color Contrast** - All text meets 4.5:1 contrast ratio
- **Keyboard Navigation** - Full keyboard accessibility with focus management
- **Screen Reader Support** - ARIA labels and semantic HTML
- **Focus Indicators** - Visual focus on all interactive elements
- **Skip Navigation** - Skip-to-content link for keyboard users
- **Mobile Menu** - Accessible mobile menu with focus trap
- **Form Focus** - Proper focus styles for form inputs
- **Lightbox Accessibility** - Dialog role and focus management
- **Reduced Motion** - Support for `prefers-reduced-motion`

### Testing

- **Unit Tests** - Comprehensive unit tests for Netlify Functions
- **Test Framework** - Vitest v4.0.18
- **Test Coverage** - 32 tests covering configuration, rate limiting, cleanup, and statistics

### Development Tools

- **Netlify CLI** - Local development and deployment
- **Vercel CLI** - Alternative deployment option
- **GitHub Pages** - Static hosting option
- **TypeScript** - Full type checking and IDE support
- **ESLint** - Code linting and style enforcement
