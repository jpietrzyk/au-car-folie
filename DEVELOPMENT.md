# Development Documentation

Complete guide for developing, testing, and deploying the Car-folie.pl website.

## Tech Stack

- **Astro 5.x** - Modern static site generator
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Lucide Icons** - Modern, lightweight icon library
- **Fontsource Fonts** - Self-hosted Inter & Source Sans Pro
- **Netlify Functions** - Serverless functions for backend logic
- **Upstash Redis** - Serverless Redis for rate limiting
- **SendGrid** - Email service for notifications
- **Airtable** - Database for form submissions
- **reCAPTCHA v3** - Invisible spam protection
- **Vitest** - Testing framework

## Project Structure

```
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
│       ├── __tests__/      # Unit tests
│       ├── package.json     # Dependencies
│       └── vitest.config.ts # Test configuration
├── public/              # Static assets
├── ANIMATIONS.md          # Animation system documentation
├── ACCESSIBILITY_IMPROVEMENTS.md  # Accessibility documentation
├── PERFORMANCE_OPTIMIZATION.md     # Performance documentation
├── DEVELOPMENT.md         # This file
├── FEATURES.md             # Feature documentation
├── README.md              # Project overview
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

## Scripts

### Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build

# Netlify
npm run netlify:dev           # Start Netlify dev server

# Testing
npm run test:functions          # Run Netlify Functions unit tests
npm run test:functions:watch    # Run tests in watch mode
npm run test:functions:ui       # Run tests with Vitest UI
```

## Components

### Available Components

1. **Banner** - Hero banners with parallax effects
2. **DarkModeToggle** - Dark mode switcher with system preference detection
3. **Footer** - Site footer with links and copyright
4. **Header** - Responsive navigation with mobile menu
5. **Lightbox** - Image gallery lightbox with keyboard navigation
6. **Navigation** - Mobile-responsive navigation menu
7. **OptimizedImage** - Lazy-loaded images with fade-in animation
8. **ServiceCard** - Service description cards with hover effects
9. **SocialLinks** - Social media links with hover animations

### Component Usage

```astro
---
import { Banner } from '../components/Banner.astro';
import { Header } from '../components/Header.astro';
import { Footer } from '../components/Footer.astro';
---
```

## Pages

### Completed Pages (17 Total)

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

## Netlify Functions

### Contact Form Handler

**File:** [`netlify/functions/contact.ts`](netlify/functions/contact.ts:1)

**Features:**
- Form validation (client and server-side)
- reCAPTCHA v3 verification with score-based filtering
- Rate limiting with multi-tiered protection
- Airtable integration for form storage
- Duplicate detection and prevention
- SendGrid email notifications
- Graceful error handling and fallback mechanisms

**Environment Variables:**
```env
# Airtable
AIRTABLE_ENABLED=true
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=ContactSubmissions
AIRTABLE_TIMEOUT_MS=4500
AIRTABLE_MAX_RETRIES=1

# reCAPTCHA
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_MIN_SCORE=0.5

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=https://your-redis-url.upstash.io
RATE_LIMIT_REDIS_TOKEN=your_redis_token_here
RATE_LIMIT_GLOBAL_REQUESTS=100
RATE_LIMIT_GLOBAL_WINDOW_MS=60000
RATE_LIMIT_PER_IP_MINUTE_REQUESTS=5
RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS=60000
RATE_LIMIT_PER_IP_HOUR_REQUESTS=15
RATE_LIMIT_PER_IP_HOUR_WINDOW_MS=3600000
RATE_LIMIT_PER_IP_DAY_REQUESTS=30
RATE_LIMIT_PER_IP_DAY_WINDOW_MS=86400000

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Rate Limiting

**File:** [`netlify/functions/rate-limit.ts`](netlify/functions/rate-limit.ts:1)

**Features:**
- Multi-tiered rate limiting (global, per-IP minute, per-IP hour, per-IP day)
- Sliding window algorithm for accurate rate limiting
- Upstash Redis integration with free tier
- Graceful degradation (fail-open strategy)
- User-friendly feedback with retry countdown
- Cleanup operations for old data
- Statistics retrieval for monitoring

**Default Limits:**
| Level | Limit | Window |
|-------|-------|--------|
| Global | 100/min | 1 min |
| Per-IP | 5/min | 1 min |
| Per-IP | 15/hour | 1 hour |
| Per-IP | 30/day | 1 day |

### Unit Tests

**File:** [`netlify/functions/__tests__/rate-limit.test.ts`](netlify/functions/__tests__/rate-limit.test.ts:1)

**Framework:** Vitest v4.0.18

**Test Results:**
- Total Tests: 32
- Passed: 29 ✅
- Skipped: 3
- Failed: 0
- Duration: ~400-500ms

**Test Coverage:**
- Configuration management (6 tests)
- Redis client creation (4 tests)
- Rate limiting logic (10 tests)
- Cleanup operations (9 tests)
- Statistics retrieval (9 tests)

**Running Tests:**
```bash
# From main directory (recommended)
npm run test:functions          # Run all tests once
npm run test:functions:watch    # Run in watch mode
npm run test:functions:ui       # Run with Vitest UI

# From functions directory
cd netlify/functions
npm run test:run            # Run all tests once
npm run test                 # Run in watch mode
npm run test:ui             # Run with UI
```

See [`RATE_LIMITING.md`](RATE_LIMITING.md) for complete rate limiting documentation.

## Design System

### Animations

The website features a comprehensive animation system:

- **Scroll-triggered animations** - Elements animate when they enter the viewport
- **Hover effects** - Smooth transitions on cards, buttons, and links
- **Page transitions** - Fade in/out effects when navigating
- **Parallax effects** - Banner backgrounds move at different speeds
- **Micro-interactions** - Button ripples, link underlines, form focus animations
- **Image loading** - Smooth fade-in when images finish loading
- **Staggered animations** - Grid items animate with sequential delays
- **Accessibility** - Full support for `prefers-reduced-motion`

See [`ANIMATIONS.md`](ANIMATIONS.md) for detailed documentation.

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

- **System preference detection** - Automatically detects user's system color scheme
- **Manual toggle** - Users can manually switch between light and dark modes
- **LocalStorage persistence** - User's preference is saved and persists across sessions
- **Smooth transitions** - All color changes have smooth 0.3s transitions

### Typography

- **Headings**: Source Sans Pro
- **Body**: Inter
- **Sizes**: Mobile-first responsive scaling

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

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

## Testing

### Unit Tests

Comprehensive unit tests have been created for Netlify Functions:

- **Test File:** [`netlify/functions/__tests__/rate-limit.test.ts`](netlify/functions/__tests__/rate-limit.test.ts:1)
- **Framework:** Vitest v4.0.18
- **Total Tests:** 32
- **Passed:** 29 ✅
- **Duration:** ~400-500ms

**Test Coverage:**
- Configuration management (6 tests)
- Redis client creation (4 tests)
- Rate limiting logic (10 tests)
- Cleanup operations (9 tests)
- Statistics retrieval (9 tests)

**Running Tests:**
```bash
npm run test:functions          # Run all tests once
npm run test:functions:watch    # Run in watch mode
npm run test:functions:ui       # Run with Vitest UI
```

### Integration Testing

Use [`test-rate-limit.sh`](test-rate-limit.sh:1) for automated integration tests.

## Environment Configuration

### Development

Create a `.env` file in the project root:

```env
# Airtable
AIRTABLE_ENABLED=false
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=ContactSubmissions
AIRTABLE_TIMEOUT_MS=4500
AIRTABLE_MAX_RETRIES=1

# reCAPTCHA
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_MIN_SCORE=0.5

# Rate Limiting
RATE_LIMIT_ENABLED=false
RATE_LIMIT_REDIS_URL=https://your-redis-url.upstash.io
RATE_LIMIT_REDIS_TOKEN=your_redis_token_here
RATE_LIMIT_GLOBAL_REQUESTS=100
RATE_LIMIT_GLOBAL_WINDOW_MS=60000
RATE_LIMIT_PER_IP_MINUTE_REQUESTS=5
RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS=60000
RATE_LIMIT_PER_IP_HOUR_REQUESTS=15
RATE_LIMIT_PER_IP_HOUR_WINDOW_MS=3600000
RATE_LIMIT_PER_IP_DAY_REQUESTS=30
RATE_LIMIT_PER_IP_DAY_WINDOW_MS=86400000

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Production

Add environment variables to Netlify Dashboard → Site Settings → Environment variables.

See [`RATE_LIMITING.md`](RATE_LIMITING.md) for deployment guide and production testing.

## Troubleshooting

### Common Issues

#### Rate Limiting Not Working

1. **Check Environment Variables**
   - Verify `RATE_LIMIT_ENABLED=true`
   - Check Redis URL and token are correct
   - Check variables are set in Netlify Dashboard

2. **Check Redis Connection**
   - Verify Upstash Redis is running
   - Test connection from your local machine
   - Check firewall rules

3. **Check Function Logs**
   ```bash
   netlify functions:log contact
   ```

4. **Test Unit Tests**
   ```bash
   npm run test:functions
   ```

### Development Workflow

1. **Make Changes**
   - Edit code in your IDE
   - Run unit tests: `npm run test:functions`
   - Test locally: `npm run netlify:dev`

2. **Test Integration**
   - Test contact form submission
   - Verify rate limiting works
   - Check logs for errors

3. **Commit Changes**
   - Commit with descriptive message
   - Push to repository

4. **Deploy**
   - Push to trigger Netlify deployment
   - Monitor deployment logs

## Best Practices

### Code Quality

- **TypeScript** - Use strict type checking
- **ESLint** - Follow code style guidelines
- **Testing** - Write unit tests for new features
- **Documentation** - Keep README files up to date

### Performance

- **Lazy Loading** - Use for images and components
- **WebP Images** - Use optimized image formats
- **Minimize JavaScript** - Keep bundles small
- **CSS Optimization** - Use Tailwind's purge in production

### Security

- **Environment Variables** - Never commit `.env` file
- **Rate Limiting** - Always use rate limiting in production
- **Input Validation** - Validate all user inputs
- **reCAPTCHA** - Use for spam prevention
- **SQL Injection** - Use parameterized queries (Airtable)

## Documentation

- **[`README.md`](README.md:1)** - Project overview
- **[`FEATURES.md`](FEATURES.md:1)** - Complete feature list
- **[`ANIMATIONS.md`](ANIMATIONS.md)** - Animation system documentation
- **[`ACCESSIBILITY_IMPROVEMENTS.md`](ACCESSIBILITY_IMPROVEMENTS.md)** - Accessibility documentation
- **[`PERFORMANCE_OPTIMIZATION.md`](PERFORMANCE_OPTIMIZATION.md)** - Performance documentation
- **[`RATE_LIMITING.md`](RATE_LIMITING.md)** - Rate limiting documentation
- **[`DEVELOPMENT.md`](DEVELOPMENT.md)** - This file

---

**Last Updated:** 2026-02-22
**Version:** 1.0.0
**Status:** Development Ready
