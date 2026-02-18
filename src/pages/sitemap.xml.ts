// Dynamic sitemap generation for car-folie.pl
import type { APIRoute } from 'astro';

const SITE_URL = 'https://car-folie.pl';

// Define all pages with their metadata
const pages = [
  {
    url: '/',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'weekly',
    priority: 1.0,
  },
  {
    url: '/o-nas',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.9,
  },
  {
    url: '/o-foliach',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.9,
  },
  {
    url: '/kontakt',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/referencje',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/wycena',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/press',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.7,
  },
  {
    url: '/drukarnia',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/inspiracje',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'weekly',
    priority: 0.8,
  },
  {
    url: '/galeria',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'weekly',
    priority: 0.8,
  },
  {
    url: '/zmiana-koloru',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.9,
  },
  {
    url: '/dystrybucja',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/floty',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/franchising',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/reklamy',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.9,
  },
  {
    url: '/szkolenia',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
  {
    url: '/technologia',
    lastModified: new Date('2026-02-18'),
    changeFreq: 'monthly',
    priority: 0.8,
  },
];

export const GET: APIRoute = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
