// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    // Image optimization configuration
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    // Responsive image breakpoints
    breakpoints: [640, 768, 1024, 1280, 1536],
  },
});
