/**
 * Animation utilities for scroll-triggered animations
 */

// Intersection Observer for scroll-triggered animations
export function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: Unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with scroll-animate classes
  const animatedElements = document.querySelectorAll(
    '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale'
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  return observer;
}

// Initialize parallax effect for banner backgrounds
export function initParallaxEffect() {
  const parallaxElements = document.querySelectorAll('.parallax');

  if (parallaxElements.length === 0) return;

  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;

        parallaxElements.forEach((element) => {
          const speed = element.dataset.parallaxSpeed || 0.5;
          const offset = scrollY * speed;
          element.style.transform = `translateY(${offset}px)`;
        });

        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// Smooth scroll for anchor links
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Page transition animations
export function initPageTransitions() {
  // Add exit animation class when navigating away
  document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').forEach((link) => {
    link.addEventListener('click', (e) => {
      // Only apply to internal links
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        document.body.classList.add('page-exit');
      }
    });
  });

  // Add entrance animation on page load
  window.addEventListener('load', () => {
    document.body.classList.add('page-enter');
  });
}

// Staggered animation for lists/grids
export function initStaggeredAnimations() {
  const containers = document.querySelectorAll('[data-stagger]');

  containers.forEach((container) => {
    const children = container.children;
    const delay = parseInt(container.dataset.stagger) || 100;

    Array.from(children).forEach((child, index) => {
      child.style.animationDelay = `${index * delay}ms`;
    });
  });
}

// Initialize all animations
export function initAnimations() {
  initScrollAnimations();
  initParallaxEffect();
  initSmoothScroll();
  initPageTransitions();
  initStaggeredAnimations();
}

// Export individual functions for use in components
export { initScrollAnimations, initParallaxEffect, initSmoothScroll, initPageTransitions, initStaggeredAnimations };
