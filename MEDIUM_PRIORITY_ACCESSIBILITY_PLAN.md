# Medium Priority Accessibility Improvements Plan

## Overview

This plan outlines the implementation of medium priority accessibility improvements for the Car-folie.pl website, focusing on three key areas:

1. **Focus Management** - Improved keyboard navigation and focus control
2. **ARIA Live Regions** - Dynamic content announcements for screen readers
3. **Breadcrumbs** - Navigation breadcrumbs for better orientation

**Status**: Planned
**Priority**: Medium
**Estimated Effort**: 4-6 hours
**WCAG Compliance**: 2.1 AA

---

## Current State Analysis

### ✅ Already Implemented
- Skip navigation link in [`Layout.astro`](src/layouts/Layout.astro:128)
- Mobile menu with `aria-expanded` state management
- Lightbox with `role="dialog"` and `aria-modal="true"`
- Focus trap in lightbox (partial implementation)
- ARIA labels on navigation and social links

### ⚠️ Areas Needing Improvement

Based on [`ACCESSIBILITY_IMPROVEMENTS.md`](ACCESSIBILITY_IMPROVEMENTS.md):

1. **Focus Management**
   - No focus management on page transitions
   - Form focus styles could be enhanced
   - Mobile menu focus management needs refinement

2. **ARIA Live Regions**
   - No live regions for dynamic content updates
   - Form submission status not announced to screen readers
   - Loading states not communicated

3. **Breadcrumbs**
   - No breadcrumb navigation component exists
   - Users may get lost in deep page hierarchy

---

## Implementation Plan

### Phase 1: Focus Management Enhancements

#### 1.1 Page Transition Focus Management

**File**: [`src/layouts/Layout.astro`](src/layouts/Layout.astro)

**Objective**: Move focus to main content when navigating between pages for better keyboard user experience.

**Implementation**:

Add focus management script after the existing scripts:

```astro
<script>
  // Focus management for page transitions
  document.addEventListener('astro:page-load', () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Set tabindex to -1 to make element focusable
      mainContent.setAttribute('tabindex', '-1');
      // Move focus to main content
      mainContent.focus();
      // Remove tabindex after focus to prevent double-tab issues
      mainContent.addEventListener('blur', () => {
        mainContent.removeAttribute('tabindex');
      }, { once: true });
    }
  });

  // Also handle initial page load
  document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent && document.activeElement === document.body) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.addEventListener('blur', () => {
        mainContent.removeAttribute('tabindex');
      }, { once: true });
    }
  });
</script>
```

**Testing**:
- Navigate between pages using keyboard
- Verify focus moves to main content
- Ensure skip link still works

---

#### 1.2 Enhanced Form Focus Styles

**File**: [`src/styles/global.css`](src/styles/global.css)

**Objective**: Improve form input focus visibility for better keyboard navigation.

**Current Issue**: Form inputs remove outline without sufficient alternative indicator.

**Implementation**:

Locate and update form focus styles (around line 136-143):

```css
/* Enhanced form focus styles */
form input:focus,
form select:focus,
form textarea:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(77, 166, 255, 0.2);
}

/* Focus-visible support for mouse users */
form input:focus:not(:focus-visible),
form select:focus:not(:focus-visible),
form textarea:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

/* Strong focus for keyboard users */
form input:focus-visible,
form select:focus-visible,
form textarea:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(77, 166, 255, 0.2);
}

/* Button focus styles */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**Testing**:
- Tab through form fields with keyboard
- Verify focus indicator is clearly visible
- Test with mouse to ensure no unwanted focus rings

---

#### 1.3 Mobile Menu Focus Management Refinement

**File**: [`src/components/Navigation.astro`](src/components/Navigation.astro)

**Objective**: Improve focus management in mobile menu for better accessibility.

**Current State**: Basic focus management exists but can be enhanced.

**Implementation**:

Update the script section (lines 171-209):

```astro
<script>
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navList = document.getElementById("navList");

  if (mobileMenuToggle && navList) {
    // Track focusable elements for focus trap
    const getFocusableElements = () => {
      return navList.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    mobileMenuToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      mobileMenuToggle.setAttribute("aria-expanded", isOpen.toString());

      // Update aria-label based on state
      mobileMenuToggle.setAttribute(
        "aria-label",
        isOpen ? "Zamknij menu" : "Otwórz menu"
      );

      // Manage focus when menu opens/closes
      if (isOpen) {
        const firstLink = navList.querySelector("a") as HTMLElement;
        firstLink?.focus();
      } else {
        mobileMenuToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !mobileMenuToggle?.contains(e.target as Node) &&
        !navList?.contains(e.target as Node)
      ) {
        navList.classList.remove("open");
        mobileMenuToggle?.setAttribute("aria-expanded", "false");
        mobileMenuToggle?.setAttribute("aria-label", "Otwórz menu");
        mobileMenuToggle.focus();
      }
    });

    // Close menu on link click
    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navList.classList.remove("open");
        mobileMenuToggle?.setAttribute("aria-expanded", "false");
        mobileMenuToggle?.setAttribute("aria-label", "Otwórz menu");
      });
    });

    // Focus trap within mobile menu
    navList.addEventListener("keydown", (e) => {
      if (!navList.classList.contains("open")) return;

      if (e.key === "Tab") {
        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else if (document.activeElement === lastElement) {
          e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Close menu on Escape
      if (e.key === "Escape") {
        navList.classList.remove("open");
        mobileMenuToggle?.setAttribute("aria-expanded", "false");
        mobileMenuToggle?.setAttribute("aria-label", "Otwórz menu");
        mobileMenuToggle.focus();
      }
    });
  }
</script>
```

**Testing**:
- Open/close mobile menu with keyboard
- Tab through menu items
- Test focus trap (Tab cycles through menu)
- Verify Escape closes menu and returns focus

---

### Phase 2: ARIA Live Regions

#### 2.1 Screen Reader Only Utility Class

**File**: [`src/styles/global.css`](src/styles/global.css)

**Objective**: Add utility class for content that should only be visible to screen readers.

**Implementation**:

Add to global styles:

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focusable screen reader only content (for skip links, etc.) */
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

#### 2.2 Form Submission Status Live Region

**File**: [`src/pages/kontakt.astro`](src/pages/kontakt.astro)

**Objective**: Announce form submission status to screen readers.

**Implementation**:

Add ARIA live region to the contact form:

```astro
<div
  id="form-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {formStatus}
</div>
```

Update form submission handler to update the live region:

```javascript
// After form submission
const formStatus = document.getElementById('form-status');
if (formStatus) {
  if (success) {
    formStatus.textContent = 'Formularz został wysłany pomyślnie. Dziękujemy za kontakt.';
  } else {
    formStatus.textContent = 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.';
  }
}
```

---

#### 2.3 Loading States Live Region

**File**: [`src/pages/kontakt.astro`](src/pages/kontakt.astro)

**Objective**: Announce loading states to screen readers.

**Implementation**:

Add loading status live region:

```astro
<div
  id="loading-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {loadingStatus}
</div>
```

Update form handler:

```javascript
// Before submission
const loadingStatus = document.getElementById('loading-status');
if (loadingStatus) {
  loadingStatus.textContent = 'Wysyłanie formularza...';
}

// After submission
if (loadingStatus) {
  loadingStatus.textContent = '';
}
```

---

#### 2.4 Lightbox Navigation Live Region

**File**: [`src/components/Lightbox.astro`](src/components/Lightbox.astro)

**Objective**: Announce image changes in lightbox to screen readers.

**Implementation**:

The caption element already has `aria-live="polite"` (line 59). Enhance it:

```astro
<div
  class="lightbox-caption"
  aria-live="polite"
  aria-atomic="true"
>
  {caption}
</div>
```

Update [`src/scripts/lightbox.ts`](src/scripts/lightbox.ts) to provide better announcements:

```typescript
private updateImage() {
  const imageData = this.images[this.currentIndex];
  if (!imageData) {
    return;
  }

  this.image.alt = imageData.alt;

  // Update caption with more context for screen readers
  const imageNumber = this.currentIndex + 1;
  const totalImages = this.images.length;
  this.caption.textContent = `${imageData.title || imageData.alt} (${imageNumber} z ${totalImages})`;

  this.image.src = imageData.src;
  this.image.style.opacity = "1";
  this.image.style.display = "block";
}
```

---

#### 2.5 Dark Mode Toggle Live Region

**File**: [`src/components/DarkModeToggle.astro`](src/components/DarkModeToggle.astro)

**Objective**: Announce dark mode toggle to screen readers.

**Implementation**:

Add live region to dark mode toggle:

```astro
<div
  id="theme-status"
  role="status"
  aria-live="polite"
  class="sr-only"
>
  {themeStatus}
</div>
```

Update toggle handler:

```javascript
// After toggling theme
const themeStatus = document.getElementById('theme-status');
if (themeStatus) {
  const isDark = document.documentElement.classList.contains('dark');
  themeStatus.textContent = isDark ? 'Tryb ciemny włączony' : 'Tryb jasny włączony';
}
```

---

### Phase 3: Breadcrumbs Component

#### 3.1 Create Breadcrumbs Component

**File**: Create new file [`src/components/Breadcrumbs.astro`](src/components/Breadcrumbs.astro)

**Objective**: Create a reusable breadcrumbs component for navigation.

**Implementation**:

```astro
---
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface Props {
  items: BreadcrumbItem[];
}

const { items } = Astro.props;
---

<nav aria-label="Ścieżka nawigacji" class="breadcrumbs">
  <ol class="breadcrumbs-list" vocab="https://schema.org/" typeof="BreadcrumbList">
    {
      items.map((item, index) => (
        <li
          class="breadcrumbs-item"
          property="itemListElement"
          typeof="ListItem"
        >
          {
            item.href ? (
              <a
                href={item.href}
                class="breadcrumbs-link"
                property="item"
              >
                <span property="name">{item.label}</span>
              </a>
            ) : (
              <span
                class="breadcrumbs-current"
                property="name"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          <meta property="position" content={String(index + 1)} />
        </li>
      ))
    }
  </ol>
</nav>

<style>
  .breadcrumbs {
    padding: 1rem 0;
    margin-bottom: 1rem;
  }

  .breadcrumbs-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .breadcrumbs-item {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .breadcrumbs-item:not(:last-child)::after {
    content: "/";
    margin-left: 0.5rem;
    color: var(--color-text-muted);
  }

  .breadcrumbs-link {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .breadcrumbs-link:hover,
  .breadcrumbs-link:focus {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .breadcrumbs-current {
    color: var(--color-text-main);
    font-weight: 600;
  }

  /* Dark mode styles */
  .dark .breadcrumbs-link:hover,
  .dark .breadcrumbs-link:focus {
    color: var(--color-primary-light);
  }
</style>
```

---

#### 3.2 Integrate Breadcrumbs into Page Layout

**File**: [`src/layouts/PageLayout.astro`](src/layouts/PageLayout.astro)

**Objective**: Add breadcrumbs support to page layout.

**Implementation**:

Add breadcrumbs prop and render:

```astro
---
interface Props {
  title?: string;
  description?: string;
  currentPath?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const {
  title,
  description,
  currentPath,
  breadcrumbs,
} = Astro.props;
---

<!-- Existing header section -->

{breadcrumbs && breadcrumbs.length > 0 && (
  <div class="page-breadcrumbs">
    <Breadcrumbs items={breadcrumbs} />
  </div>
)}

<!-- Existing content section -->
```

---

#### 3.3 Add Breadcrumbs to Key Pages

**Files**: Various page files

**Objective**: Add breadcrumbs to pages that benefit from navigation context.

**Priority Pages** (ordered by importance):

1. **Gallery** (`src/pages/galeria.astro`)
   ```astro
   ---
   import PageLayout from '../layouts/PageLayout.astro';
   import Breadcrumbs from '../components/Breadcrumbs.astro';

   const breadcrumbs = [
     { label: 'Home', href: '/' },
     { label: 'Galeria', current: true },
   ];
   ---

   <PageLayout
     title="Galeria - Car-folie.pl"
     description="Galeria naszych realizacji oklejania samochodów."
     currentPath="/galeria"
     breadcrumbs={breadcrumbs}
   >
     <!-- Page content -->
   </PageLayout>
   ```

2. **Services Pages** (O foliach, Wycena, Drukarnia, etc.)
   ```astro
   const breadcrumbs = [
     { label: 'Home', href: '/' },
     { label: 'O foliach', current: true },
   ];
   ```

3. **About Pages** (O nas, Referencje, Prasa o nas)
   ```astro
   const breadcrumbs = [
     { label: 'Home', href: '/' },
     { label: 'O nas', current: true },
   ];
   ```

4. **Contact Page**
   ```astro
   const breadcrumbs = [
     { label: 'Home', href: '/' },
     { label: 'Kontakt', current: true },
   ];
   ```

---

#### 3.4 Breadcrumb Styling Enhancements

**File**: [`src/styles/global.css`](src/styles/global.css)

**Objective**: Ensure breadcrumbs are accessible and visually consistent.

**Implementation**:

Add breadcrumb-specific styles:

```css
/* Breadcrumb focus styles */
.breadcrumbs-link:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Breadcrumb responsive styles */
@media (max-width: 640px) {
  .breadcrumbs {
    padding: 0.75rem 0;
  }

  .breadcrumbs-list {
    gap: 0.25rem;
  }

  .breadcrumbs-item {
    font-size: 0.8125rem;
  }

  .breadcrumbs-item:not(:last-child)::after {
    margin-left: 0.25rem;
  }
}
```

---

## Testing Checklist

### Focus Management Testing

- [ ] Page transitions move focus to main content
- [ ] Skip navigation link works correctly
- [ ] Form inputs have visible focus indicators
- [ ] Mobile menu focus trap works correctly
- [ ] Escape key closes mobile menu
- [ ] Tab order is logical throughout the site
- [ ] Focus-visible styles only appear for keyboard navigation

### ARIA Live Regions Testing

- [ ] Form submission status is announced to screen readers
- [ ] Loading states are announced
- [ ] Lightbox image changes are announced
- [ ] Dark mode toggle is announced
- [ ] Screen reader only content is visually hidden
- [ ] Live regions use appropriate politeness levels

### Breadcrumbs Testing

- [ ] Breadcrumbs display correctly on all pages
- [ ] Breadcrumb links are keyboard accessible
- [ ] Current page is properly marked with aria-current
- [ ] Schema.org structured data is present
- [ ] Breadcrumbs are responsive on mobile
- [ ] Focus indicators are visible on breadcrumb links

### Cross-Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Screen Reader Testing

- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

---

## Files to Modify

### New Files
- [`src/components/Breadcrumbs.astro`](src/components/Breadcrumbs.astro) - New breadcrumb component

### Modified Files
- [`src/layouts/Layout.astro`](src/layouts/Layout.astro) - Page transition focus management
- [`src/layouts/PageLayout.astro`](src/layouts/PageLayout.astro) - Breadcrumbs integration
- [`src/styles/global.css`](src/styles/global.css) - Focus styles, sr-only class, breadcrumb styles
- [`src/components/Navigation.astro`](src/components/Navigation.astro) - Enhanced mobile menu focus
- [`src/components/Lightbox.astro`](src/components/Lightbox.astro) - Enhanced live regions
- [`src/components/DarkModeToggle.astro`](src/components/DarkModeToggle.astro) - Live region for theme toggle
- [`src/scripts/lightbox.ts`](src/scripts/lightbox.ts) - Enhanced image announcements
- [`src/pages/kontakt.astro`](src/pages/kontakt.astro) - Form live regions
- [`src/pages/galeria.astro`](src/pages/galeria.astro) - Breadcrumbs
- [`src/pages/o-foliach.astro`](src/pages/o-foliach.astro) - Breadcrumbs
- [`src/pages/o-nas.astro`](src/pages/o-nas.astro) - Breadcrumbs
- [`src/pages/wycena.astro`](src/pages/wycena.astro) - Breadcrumbs
- [`src/pages/drukarnia.astro`](src/pages/drukarnia.astro) - Breadcrumbs
- [`src/pages/kontakt.astro`](src/pages/kontakt.astro) - Breadcrumbs
- Additional service pages as needed

---

## Estimated Effort Breakdown

| Task | Estimated Time |
|------|----------------|
| Phase 1.1: Page transition focus | 30 minutes |
| Phase 1.2: Enhanced form focus styles | 20 minutes |
| Phase 1.3: Mobile menu focus refinement | 45 minutes |
| Phase 2.1: Screen reader utility class | 10 minutes |
| Phase 2.2: Form submission live region | 30 minutes |
| Phase 2.3: Loading states live region | 20 minutes |
| Phase 2.4: Lightbox live region enhancement | 15 minutes |
| Phase 2.5: Dark mode toggle live region | 15 minutes |
| Phase 3.1: Create breadcrumbs component | 45 minutes |
| Phase 3.2: Integrate breadcrumbs into layout | 20 minutes |
| Phase 3.3: Add breadcrumbs to key pages | 60 minutes |
| Phase 3.4: Breadcrumb styling | 15 minutes |
| Testing and validation | 60 minutes |
| **Total** | **~5 hours** |

---

## Success Criteria

The implementation will be considered successful when:

1. **Focus Management**
   - All interactive elements have visible focus indicators
   - Focus moves logically through the page
   - Page transitions move focus to main content
   - Mobile menu has proper focus trap

2. **ARIA Live Regions**
   - Dynamic content changes are announced to screen readers
   - Form submission status is communicated
   - Loading states are announced
   - Theme changes are announced

3. **Breadcrumbs**
   - Breadcrumbs display on all relevant pages
   - Current page is clearly marked
   - Breadcrumbs are keyboard accessible
   - Schema.org structured data is present

4. **WCAG Compliance**
   - All improvements meet WCAG 2.1 AA standards
   - No new accessibility issues are introduced
   - Lighthouse accessibility score remains 90+

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Live Regions](https://www.w3.org/WAI/ARIA/apg/#live_regions)
- [Focus Management](https://www.w3.org/WAI/WCAG21/Techniques/html/H42)
- [Breadcrumb Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [Project Accessibility Documentation](ACCESSIBILITY_IMPROVEMENTS.md)

---

**Last Updated**: 2026-02-21
**Status**: Ready for Implementation
**Next Steps**: Begin Phase 1 implementation
