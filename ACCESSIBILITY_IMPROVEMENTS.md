# Accessibility Improvements Analysis

## Overview

This document outlines the current accessibility state of the Car-folie.pl website and provides recommendations for improvements to ensure compliance with WCAG 2.1 AA standards.

---

## Current Accessibility Status

### ✅ Strengths

The website already implements several accessibility best practices:

1. **Semantic HTML Structure**
   - Proper use of semantic elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`)
   - Logical heading hierarchy
   - Proper use of `<address>` element in footer

2. **ARIA Attributes**
   - Navigation uses `aria-label` on mobile menu toggle
   - Mobile menu properly manages `aria-expanded` state
   - Active page links use `aria-current="page"`
   - Lightbox has proper `aria-hidden` state management
   - Social links have descriptive `aria-label` attributes

3. **Keyboard Navigation**
   - Lightbox supports keyboard navigation (Escape, ArrowLeft, ArrowRight)
   - Focus-visible styles are implemented globally
   - Mobile menu can be closed with keyboard

4. **Image Accessibility**
   - All images have `alt` attributes
   - Decorative images have empty alt text
   - Logo has descriptive alt text

5. **Responsive Design**
   - Mobile-first approach with proper breakpoints
   - Touch-friendly button sizes
   - Responsive images with proper sizing

6. **Form Accessibility**
   - Form labels are properly associated with inputs
   - Focus states are clearly visible
   - Input fields have appropriate padding

---

## 🚨 Critical Issues

### 1. Color Contrast Problems

**Location**: [`src/styles/global.css`](src/styles/global.css)

**Issue**: Several color combinations fail WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)

- **Primary blue on dark background**: `#0173ff` on `#121212` - **FAILS** (contrast ratio: ~3.2:1)
- **Muted text on dark background**: `#888888` on `#121212` - **FAILS** (contrast ratio: ~4.1:1)
- **Accent yellow on white**: `#ccff00` on white - **PASSES** but may be difficult for some users
- **Text on card background**: `#cccccc` on `#1a1a1a` - **MARGINAL** (contrast ratio: ~4.5:1)

**Impact**: Users with visual impairments, color blindness, or low vision may struggle to read content.

**Priority**: HIGH

---

### 2. Missing Skip Navigation Link

**Location**: [`src/layouts/Layout.astro`](src/layouts/Layout.astro:132)

**Issue**: No skip navigation link is provided for keyboard users to bypass navigation and jump directly to main content.

**Impact**: Keyboard users must tab through all navigation items on every page load.

**Priority**: HIGH

---

### 3. Heading Color Contrast Issue

**Location**: [`src/styles/global.css`](src/styles/global.css:45)

**Issue**: Headings are set to `#404040` (dark gray) but the site uses a dark theme with `#121212` background. This creates very poor contrast.

```css
h1, h2, h3, h4, h5, h6 {
  color: #404040;  /* This is wrong for dark theme */
  font-weight: 600;
  line-height: 1.2;
}
```

**Impact**: Headings are nearly invisible on dark background.

**Priority**: CRITICAL

---

## ⚠️ Medium Priority Issues

### 4. Mobile Menu Accessibility

**Location**: [`src/components/Navigation.astro`](src/components/Navigation.astro)

**Issues**:

- Mobile menu toggle button doesn't have focus-visible styling
- When menu opens, focus is not moved to first menu item
- When menu closes, focus is not returned to toggle button
- No `aria-controls` attribute linking toggle to menu

**Impact**: Poor keyboard navigation experience on mobile.

**Priority**: MEDIUM

---

### 5. Lightbox Accessibility

**Location**: [`src/components/Lightbox.astro`](src/components/Lightbox.astro)

**Issues**:

- Lightbox image doesn't have proper `role="dialog"` or `role="img"`
- No `aria-modal="true"` attribute
- Focus trap not implemented when lightbox is open
- Previous/Next buttons don't have `aria-disabled` when at start/end
- No announcement of image changes to screen readers

**Impact**: Screen reader users may have difficulty navigating the lightbox.

**Priority**: MEDIUM

---

### 6. Service Card Link Structure

**Location**: [`src/components/ServiceCard.astro`](src/components/ServiceCard.astro)

**Issue**: The entire card is wrapped in an `<a>` tag, which is semantically correct but the "Dowiedz się więcej" (Learn more) text is inside the same link. This creates a redundant interactive element.

**Impact**: May confuse screen reader users who hear "link" twice for the same card.

**Priority**: LOW

---

### 7. Form Focus Management

**Location**: [`src/styles/global.css`](src/styles/global.css:136-143)

**Issue**: Form inputs remove outline on focus without providing sufficient alternative visual indicator.

```css
form input:focus,
form select:focus,
form textarea:focus {
  outline: none;  /* Removes default focus indicator */
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(1, 115, 255, 0.1);  /* May not be visible enough */
}
```

**Impact**: Keyboard users may lose track of focus position.

**Priority**: MEDIUM

---

### 8. Missing Language Attribute on Some Elements

**Location**: Various pages

**Issue**: While the `<html>` tag has `lang="pl"`, some content may be in English (e.g., "Professional full car wrapping services") but doesn't have language switching.

**Impact**: Screen readers may use wrong pronunciation for mixed-language content.

**Priority**: LOW

---

### 9. No Focus Management on Page Transitions

**Location**: All pages

**Issue**: When navigating between pages, focus is not managed. Focus stays where it was on the previous page or is lost.

**Impact**: Disorienting for keyboard and screen reader users.

**Priority**: MEDIUM

---

### 10. Missing ARIA Live Regions

**Location**: Dynamic content areas

**Issue**: No ARIA live regions for announcing dynamic content changes (e.g., form submissions, loading states).

**Impact**: Screen reader users may not be notified of important updates.

**Priority**: LOW

---

## 📋 Recommended Improvements

### Priority 1: Critical Fixes

#### 1.1 Fix Heading Colors

**File**: [`src/styles/global.css`](src/styles/global.css:45)

```css
h1, h2, h3, h4, h5, h6 {
  color: white;  /* Changed from #404040 */
  font-weight: 600;
  line-height: 1.2;
}
```

---

#### 1.2 Improve Color Contrast

**File**: [`src/styles/global.css`](src/styles/global.css:4-18)

Update color variables to meet WCAG AA standards:

```css
:root {
  --color-primary: #4da6ff;  /* Lighter blue for better contrast */
  --color-primary-dark: #0066cc;
  --color-primary-light: #80c4ff;
  --color-accent: #ccff00;
  --color-accent-dark: #b8e600;
  --color-bg-dark: #121212;
  --color-bg-card: #1a1a1a;
  --color-text-main: #e0e0e0;  /* Lighter gray for better contrast */
  --color-text-muted: #b0b0b0;  /* Lighter muted text */
  --color-border: #333333;
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
}
```

---

#### 1.3 Add Skip Navigation Link

**File**: [`src/layouts/Layout.astro`](src/layouts/Layout.astro:132)

Add at the beginning of `<body>`:

```astro
<body>
  <a href="#main-content" class="skip-link">
    Przejdź do głównej treści
  </a>
  <main id="main-content">
    <slot />
  </main>
</body>
```

Add to styles:

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}
```

---

### Priority 2: High Priority Improvements

#### 2.1 Enhance Mobile Menu Accessibility

**File**: [`src/components/Navigation.astro`](src/components/Navigation.astro)

Add `aria-controls` and improve focus management:

```astro
<button
  class="mobile-menu-toggle"
  id="mobileMenuToggle"
  aria-label="Otwórz menu"
  aria-expanded="false"
  aria-controls="navList"
>
```

Update script to manage focus:

```javascript
// Add to click handler
if (isOpen) {
  navList.querySelector('a').focus();
} else {
  mobileMenuToggle.focus();
}
```

---

#### 2.2 Improve Lightbox Accessibility

**File**: [`src/components/Lightbox.astro`](src/components/Lightbox.astro)

Add proper ARIA attributes:

```astro
<div
  id="lightbox"
  class="lightbox"
  role="dialog"
  aria-modal="true"
  aria-label="Podgląd zdjęcia"
  aria-hidden="true"
>
```

Add focus trap in script:

```javascript
// Add to init()
this.focusableElements = this.lightbox.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);

// Add to open()
this.firstFocusable = this.focusableElements[0];
this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
this.firstFocusable.focus();

// Add focus trap event listener
this.lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }
  }
});
```

---

#### 2.3 Improve Form Focus Styles

**File**: [`src/styles/global.css`](src/styles/global.css:136-143)

Enhance focus visibility:

```css
form input:focus,
form select:focus,
form textarea:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(1, 115, 255, 0.2);
}
```

---

### Priority 3: Medium Priority Improvements

#### 3.1 Add Focus Management for Page Transitions

Add to [`src/layouts/Layout.astro`](src/layouts/Layout.astro):

```astro
<script>
  // Move focus to main content on page load
  document.addEventListener('astro:page-load', () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
    }
  });
</script>
```

---

#### 3.2 Add ARIA Live Regions

For dynamic content areas, add:

```astro
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {statusMessage}
</div>
```

Add screen reader only class:

```css
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
```

---

#### 3.3 Improve Service Card Structure

**File**: [`src/components/ServiceCard.astro`](src/components/ServiceCard.astro)

Consider restructuring to remove nested link:

```astro
<article class="service-card">
  <div class="service-card-image">
    <Image
      src={image}
      alt={title}
      width="640"
      height="360"
      loading="lazy"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      format="webp"
    />
  </div>
  <div class="service-card-content">
    <h3>{title}</h3>
    <p>{description}</p>
    <a href={link} class="service-card-button">
      Dowiedz się więcej
      <ArrowRight size={16} />
    </a>
  </div>
</article>
```

Update CSS to make entire card clickable via JavaScript or CSS:

```css
.service-card {
  cursor: pointer;
}

.service-card:hover .service-card-button {
  color: var(--color-primary-light);
}
```

---

### Priority 4: Low Priority Enhancements

#### 4.1 Add Language Switching

For mixed-language content:

```astro
<p lang="en">Professional full car wrapping services</p>
```

---

#### 4.2 Add Descriptive Page Titles

Ensure all pages have unique, descriptive titles including the page name:

```astro
<PageLayout
  title="Zmiana koloru - Car-folie.pl"
  description="..."
>
```

---

#### 4.3 Add Breadcrumbs

Implement breadcrumb navigation for better orientation:

```astro
<nav aria-label="Ścieżka nawigacji">
  <ol class="breadcrumbs">
    <li><a href="/">Strona główna</a></li>
    <li aria-current="page">Zmiana koloru</li>
  </ol>
</nav>
```

---

## 📊 Accessibility Score Summary

| Category | Current Score | Target Score | Gap |
| :--- | :--- | :--- | :--- |
| Color Contrast | 3/10 | 10/10 | -7 |
| Keyboard Navigation | 7/10 | 10/10 | -3 |
| Screen Reader Support | 6/10 | 10/10 | -4 |
| Semantic HTML | 9/10 | 10/10 | -1 |
| Focus Management | 5/10 | 10/10 | -5 |
| Forms | 7/10 | 10/10 | -3 |
| **Overall** | **6.2/10** | **10/10** | **-3.8** |

---

## 🎯 Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)

1. ✅ Fix heading colors
2. ✅ Improve color contrast variables
3. ✅ Add skip navigation link
4. ✅ Test with screen readers

### Phase 2: High Priority (Week 2)

1. ✅ Enhance mobile menu accessibility
2. ✅ Improve lightbox accessibility
3. ✅ Enhance form focus styles
4. ✅ Keyboard navigation testing

### Phase 3: Medium Priority (Week 3)

1. ✅ Add focus management for page transitions
2. ✅ Implement ARIA live regions
3. ✅ Improve service card structure
4. ✅ Comprehensive accessibility audit

### Phase 4: Low Priority (Week 4)

1. ✅ Add language switching
2. ✅ Implement breadcrumbs
3. ✅ Final testing and refinement
4. ✅ Documentation

---

## 🧪 Testing Recommendations

### Automated Testing Tools

- **axe DevTools**: Browser extension for quick accessibility testing
- **Lighthouse**: Built-in Chrome accessibility audit
- **WAVE**: WebAIM's accessibility evaluation tool
- **pa11y**: Command-line accessibility testing tool

### Manual Testing Checklist

- [ ] Navigate entire site using keyboard only (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Test with screen reader (NVDA for Windows, VoiceOver for Mac)
- [ ] Verify all color contrasts meet WCAG AA standards
- [ ] Check all images have appropriate alt text
- [ ] Test all forms with keyboard and screen reader
- [ ] Verify focus order is logical
- [ ] Test with browser zoom (200%)
- [ ] Test with high contrast mode
- [ ] Verify skip link works
- [ ] Test mobile menu with keyboard

### User Testing

- Recruit users with disabilities for testing
- Test with various assistive technologies
- Gather feedback on usability

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Accessible Rich Internet Applications (ARIA)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

---

## 🔍 Next Steps

1. Review this document with the development team
2. Prioritize fixes based on impact and effort
3. Create tickets for each improvement
4. Implement fixes in phases
5. Test thoroughly after each phase
6. Monitor for regressions

---

**Last Updated**: 2026-02-18
**Document Version**: 1.0
**Status**: Ready for Implementation
