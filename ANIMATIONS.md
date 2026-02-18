# Animations and Transitions Documentation

This document provides comprehensive information about the animation system implemented for the Car-folie.pl website.

## Overview

The animation system enhances user experience with smooth, performant animations and transitions that improve visual appeal and engagement while maintaining accessibility and performance standards.

## Table of Contents

- [Animation Utilities](#animation-utilities)
- [Keyframe Animations](#keyframe-animations)
- [Scroll-Triggered Animations](#scroll-triggered-animations)
- [Component Animations](#component-animations)
- [Page Transitions](#page-transitions)
- [Micro-interactions](#micro-interactions)
- [Performance Considerations](#performance-considerations)
- [Accessibility](#accessibility)
- [Usage Examples](#usage-examples)

## Animation Utilities

### CSS Animation Classes

The following utility classes are available in [`src/styles/global.css`](src/styles/global.css):

#### Fade Animations
- `.fade-in` - Simple fade in from opacity 0 to 1
- `.fade-in-up` - Fade in with upward movement
- `.fade-in-down` - Fade in with downward movement
- `.fade-in-left` - Fade in from left to right
- `.fade-in-right` - Fade in from right to left

#### Scale Animations
- `.scale-in` - Scale from 0.9 to 1

#### Movement Animations
- `.bounce` - Bounce effect
- `.pulse` - Pulse opacity animation
- `.shake` - Shake effect
- `.rotate` - Continuous rotation
- `.float` - Floating effect

#### Staggered Animations
- `.stagger-1` through `.stagger-5` - Delay animations by 0.1s to 0.5s

### JavaScript Animation Functions

Located in [`src/scripts/animations.js`](src/scripts/animations.js):

- `initScrollAnimations()` - Initialize Intersection Observer for scroll animations
- `initParallaxEffect()` - Initialize parallax scrolling for banner backgrounds
- `initSmoothScroll()` - Enable smooth scrolling for anchor links
- `initPageTransitions()` - Handle page enter/exit animations
- `initStaggeredAnimations()` - Apply staggered delays to child elements
- `initAnimations()` - Initialize all animation systems

## Keyframe Animations

### Available Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

## Scroll-Triggered Animations

### Classes

- `.scroll-animate` - Fade in from bottom when scrolled into view
- `.scroll-animate-left` - Slide in from left when scrolled into view
- `.scroll-animate-right` - Slide in from right when scrolled into view
- `.scroll-animate-scale` - Scale in when scrolled into view

### Usage

Add any of these classes to elements that should animate when they enter the viewport:

```html
<section class="scroll-animate">
  <h2>This section will animate when scrolled into view</h2>
</section>
```

The animation is triggered when 10% of the element is visible (threshold: 0.1).

### Staggered Grid Animations

For grids and lists, use the `data-stagger` attribute to create staggered animations:

```html
<div class="services-grid" data-stagger="100">
  <div class="service-card">Card 1</div>
  <div class="service-card">Card 2</div>
  <div class="service-card">Card 3</div>
</div>
```

The value (100ms) specifies the delay between each child's animation.

## Component Animations

### Banner Component

The [`Banner`](src/components/Banner.astro) component features:

- **Parallax effect**: Background moves at different speed than content
- **Entrance animations**: Title and subtitle fade in with staggered delays
- **Gradient overlay**: Smooth fade-in animation

```astro
<Banner
  image="/images/banner.jpg"
  title="Welcome"
  subtitle="Professional Services"
/>
```

### ServiceCard Component

The [`ServiceCard`](src/components/ServiceCard.astro) component includes:

- **Hover effects**: Card lifts up with shadow and border color change
- **Image zoom**: Image scales up on hover with overlay
- **Arrow animation**: Arrow icon slides right on hover
- **Scroll animation**: Cards scale in when scrolled into view

### FeatureCard Component

Feature cards (used on homepage) have:

- **Hover lift**: Card rises with enhanced shadow
- **Icon animation**: Icon scales and rotates slightly on hover
- **Border highlight**: Primary color border on hover

### OptimizedImage Component

The [`OptimizedImage`](src/components/OptimizedImage.astro) component provides:

- **Loading animation**: Images fade in smoothly when loaded
- **Skeleton loading**: Optional shimmer effect during loading

```astro
<OptimizedImage
  src="/images/photo.jpg"
  alt="Description"
  width={640}
  height={360}
  loading="lazy"
/>
```

## Page Transitions

### Enter Animation

When a page loads, the body receives the `.page-enter` class:

```css
body.page-enter {
  opacity: 1;
  animation: fadeIn 0.5s ease-out;
}
```

### Exit Animation

When navigating away, the body receives the `.page-exit` class:

```css
body.page-exit {
  opacity: 0;
  animation: fadeOut 0.3s ease-in;
}
```

These transitions are automatically handled by the [`initPageTransitions()`](src/scripts/animations.js) function.

## Micro-interactions

### Button Interactions

Buttons feature a ripple effect on click:

```css
.button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.button:active::after {
  width: 300px;
  height: 300px;
}
```

### Link Hover Effects

Links have an animated underline that expands from left to right:

```css
a::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

a:hover::before {
  width: 100%;
}
```

### Form Input Focus

Form inputs scale slightly when focused:

```css
form input:focus,
form select:focus,
form textarea:focus {
  animation: scaleIn 0.2s ease-out;
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(77, 166, 255, 0.2);
}
```

### Social Links

Social link icons lift up on hover:

```css
.social-links a:hover {
  transform: translateY(-3px);
}
```

### Navigation Links

Navigation links have an animated underline:

```css
.nav-list a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.nav-list a:hover::after,
.nav-list a.active::after {
  width: 100%;
}
```

## Performance Considerations

### GPU Acceleration

Animations use `transform` and `opacity` properties which are GPU-accelerated for smooth performance:

```css
.banner {
  transform: translateZ(0);
  will-change: transform;
}
```

### Intersection Observer

Scroll-triggered animations use the efficient Intersection Observer API instead of scroll event listeners.

### Reduced Motion

All animations respect the `prefers-reduced-motion` media query for accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Passive Event Listeners

Scroll event listeners use the `passive` flag for better performance:

```javascript
window.addEventListener('scroll', handleScroll, { passive: true });
```

### Request Animation Frame

Parallax effects use `requestAnimationFrame` for smooth 60fps animations:

```javascript
window.requestAnimationFrame(() => {
  // Animation logic
});
```

## Accessibility

### Reduced Motion Support

Users who prefer reduced motion will see minimal animations while still maintaining functionality.

### Focus Indicators

All interactive elements maintain clear focus indicators:

```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Screen Reader Compatibility

Animations don't interfere with screen reader functionality. Content remains accessible regardless of animation state.

## Usage Examples

### Adding Scroll Animation to a Section

```astro
<section class="scroll-animate">
  <h2>Section Title</h2>
  <p>Content that animates when scrolled into view</p>
</section>
```

### Creating a Staggered Grid

```astro
<div class="services-grid" data-stagger="100">
  {items.map(item => (
    <div class="service-card">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  ))}
</div>
```

### Adding Parallax to a Background

```astro
<section class="parallax" data-parallax-speed="0.3">
  <div class="content">
    <!-- Content with parallax background -->
  </div>
</section>
```

### Custom Animation Delay

```astro
<div class="fade-in stagger-3">
  <!-- Animates with 0.3s delay -->
</div>
```

### Combining Animations

```astro
<article class="service-card scroll-animate-scale">
  <!-- Card scales in when scrolled into view -->
</article>
```

## Browser Support

All animations use standard CSS3 features and JavaScript APIs supported by:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Best Practices

1. **Use sparingly**: Don't over-animate. Each animation should have a purpose.
2. **Keep it fast**: Use GPU-accelerated properties (transform, opacity).
3. **Respect preferences**: Always support `prefers-reduced-motion`.
4. **Test performance**: Use Chrome DevTools Performance tab to monitor animation performance.
5. **Maintain accessibility**: Ensure animations don't interfere with keyboard navigation or screen readers.
6. **Be consistent**: Use similar animation durations and easing functions across the site.

## Troubleshooting

### Animations Not Working

1. Check that the animation script is included in the layout
2. Verify CSS classes are correctly applied
3. Check browser console for JavaScript errors
4. Ensure elements are in the viewport for scroll animations

### Performance Issues

1. Reduce the number of animated elements
2. Use `will-change` sparingly
3. Consider using CSS containment
4. Test on lower-end devices

### Accessibility Concerns

1. Test with screen readers
2. Verify keyboard navigation works with animations
3. Check color contrast during animations
4. Test with `prefers-reduced-motion` enabled

## Future Enhancements

Potential improvements to consider:

- Add more complex scroll-linked animations
- Implement page-specific animation themes
- Add gesture-based animations for mobile
- Create animation presets for common use cases
- Add animation performance monitoring

---

**Last Updated**: 2026-02-18
**Status**: Animation system implemented and ready for testing
