# Google Search Console - Phase 2 Indexing Checklist

## Goal

Resolve the remaining critical indexing categories after redirect/canonical fixes:

- Discovered - currently not indexed
- Crawled - currently not indexed
- Duplicate without user-selected canonical

Based on current report summary:

- Discovered - currently not indexed: 10
- Crawled - currently not indexed: 5
- Duplicate without user-selected canonical: 2

---

## 1) Export URL lists from GSC (required)

The current CSV export in `tmp` is summary-only and does not include URL-level data.

For each issue in Search Console:

1. Open **Indexing > Pages**.
2. Click issue (for example: *Discovered - currently not indexed*).
3. Click **Export** and save URL list.
4. Repeat for all three categories above.

Save exports under:

- `tmp/gsc-urls/discovered.csv`
- `tmp/gsc-urls/crawled.csv`
- `tmp/gsc-urls/duplicate-canonical.csv`

---

## 2) URL triage sheet

Create one working sheet with columns:

- URL
- Issue type
- HTTP status
- Final URL after redirects
- Canonical URL (from HTML)
- Meta robots
- In sitemap (yes/no)
- Internal links count (rough)
- Content uniqueness (low/medium/high)
- Decision
- Action owner
- Done

Allowed **Decision** values:

- Keep indexable (200 + self-canonical)
- Redirect (301 to canonical URL)
- Noindex intentionally
- Remove from sitemap

---

## 3) Per-URL pass criteria (must all pass for indexable pages)

For each URL that should be indexed:

1. Returns **200** on live domain.
2. Final URL is canonical format: `https://car-folie.pl/path` (no trailing slash except home).
3. `<meta name="robots">` allows indexing (`index, follow`).
4. `<link rel="canonical">` points to itself.
5. URL is present once in sitemap with the canonical form.
6. Page has unique title, description, H1, and non-thin body content.
7. Page has internal links from relevant high-authority pages (home/services).

If any of these fail, do not request indexing yet.

---

## 4) Fix playbook by issue type

### A) Discovered - currently not indexed

Most common causes: low crawl priority, weak internal linking, low-value pages.

Actions:

- Add internal links from homepage and top service pages.
- Improve unique content depth (clear intent + local relevance + service specifics).
- Keep only canonical URLs in sitemap.
- Remove URLs from sitemap if intentionally low-value or duplicate.

### B) Crawled - currently not indexed

Most common causes: soft quality issues or duplication despite crawl.

Actions:

- Strengthen page uniqueness (titles, meta descriptions, H1, first sections).
- Expand thin sections with specific content (process, pricing context, FAQ).
- Ensure self-canonical and indexable robots.
- Reduce overlap between very similar service pages.

### C) Duplicate without user-selected canonical

Actions:

- Select one canonical URL and enforce it via 301 or canonical tag.
- Ensure internal links always point to canonical version.
- Keep only canonical URL in sitemap.

---

## 5) Where to apply fixes in this repository

- Canonical/robots defaults: `src/layouts/Layout.astro`
- Page-level content and metadata: `src/pages/*.astro`
- Sitemap URL list: `src/pages/sitemap.xml.ts`
- Redirect behavior on Netlify: `netlify.toml`

---

## 6) Live checks before requesting indexing

Run on production URLs (not localhost):

```bash
curl -I https://car-folie.pl/your-page
curl -s https://car-folie.pl/your-page | grep -Ei 'canonical|meta name="robots"'
curl -I https://www.car-folie.pl/your-page
curl -I http://car-folie.pl/your-page
```

Expected:

- Canonical URL returns 200.
- `www` and `http` variants return 301 to canonical.
- HTML contains self-canonical and `index, follow` for indexable pages.

---

## 7) Validation cadence in GSC

1. Deploy fixes to Netlify.
2. Re-check 3-5 sample URLs per issue type on live site.
3. Click **Validate Fix** in each issue.
4. Wait for Google recrawl (days to weeks).
5. Re-export URLs and repeat until issue count trends down.

Tip: validate in small, clean batches; avoid changing many unrelated SEO factors mid-cycle.

---

## 8) Suggested execution order

1. Duplicate canonical issues (smallest and highest certainty).
2. Crawled not indexed (quality/uniqueness and internal links).
3. Discovered not indexed (crawl priority and sitemap hygiene).
