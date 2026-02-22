# Analytics Integration Plan (Plausible)

## Overview

This document defines the implementation plan for analytics on car-folie.pl using **Plausible Analytics**.

## Why Plausible (Recommended)

### Key reasons

- Lightweight script (good for Core Web Vitals)
- Privacy-first (GDPR-friendly approach)
- Simple custom events API
- Easy Astro integration
- No cookie banner dependency in standard setup

### Alternatives

- **GA4**: better for Google Ads ecosystem and advanced attribution, higher complexity
- **Umami**: good self-hosted option if full infrastructure control is required

## Scope (MVP)

### Base tracking

- Page views on all public pages
- Outbound conversion-oriented clicks:
  - `tel:` links
  - `mailto:` links

### Business events

- `contact_submit_success`
- `quote_submit_success`
- `contact_submit_error` (optional, for diagnostics)
- `quote_submit_error` (optional, for diagnostics)

## Files to update

- `src/layouts/Layout.astro` (global script include)
- `src/pages/kontakt.astro` (contact form events)
- `src/pages/wycena.astro` (quote form events)
- `src/components/Footer.astro` (contact link click events if needed)
- `.env.example` (analytics env vars)
- `README.md` (setup and operational notes)

## Environment Variables

Add:

```env
ANALYTICS_ENABLED=false
PLAUSIBLE_DOMAIN=car-folie.pl
PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/script.js
```

Notes:

- Keep disabled by default in local dev.
- Enable in Netlify production environment.

## Implementation Phases

## Phase 1 — Base integration

1. Add script include in `Layout.astro` when `ANALYTICS_ENABLED=true`.
2. Use `defer` loading and set `data-domain` from `PLAUSIBLE_DOMAIN`.
3. Ensure no script is injected in local/dev by default.

Acceptance criteria:

- Script appears in production HTML head.
- No script loaded in local dev by default.

## Phase 2 — Custom event tracking

1. Add `window.plausible(...)` calls on successful submit in `kontakt.astro`.
2. Add `window.plausible(...)` calls on successful submit in `wycena.astro`.
3. Add click tracking for `tel:` and `mailto:` links.

Acceptance criteria:

- Events visible in Plausible dashboard after manual testing.
- No JS errors when analytics disabled.

## Phase 3 — QA and validation

1. Verify network calls to plausible endpoint.
2. Confirm event names and counts in dashboard.
3. Validate no regression in form UX and performance.

Acceptance criteria:

- `npm run build` passes.
- Contact and quote forms work unchanged.
- Page speed impact remains minimal.

## Phase 4 — Deployment and monitoring

1. Enable env vars in Netlify production.
2. Deploy and test live events.
3. Observe baseline data for 7 days.

Acceptance criteria:

- Production events recorded consistently.
- No runtime errors in browser console.

## Naming Convention for Events

Use snake_case and stable names:

- `contact_submit_success`
- `contact_submit_error`
- `quote_submit_success`
- `quote_submit_error`
- `phone_click`
- `email_click`

## Risks and Mitigations

- **Ad blocker filtering**: Some users will not be counted; treat analytics as directional.
- **Event duplication**: Trigger only on confirmed success state.
- **Config drift**: Keep env vars documented in `.env.example` and README.

## Out of Scope (for MVP)

- Funnel attribution by campaign source/medium
- Server-side event forwarding
- A/B testing instrumentation
- Consent-mode integration with GA4

## Deliverables

- Functional Plausible integration in production
- Tracked form conversion events
- Updated setup documentation
- Verified analytics checklist in README

## Implementation Status

Status: ✅ Completed (Twitter-related SEO item intentionally skipped outside analytics scope)

Completed:

- Plausible script loaded in production `<head>`
- Event tracking enabled for:
  - `contact_submit_success`
  - `quote_submit_success`
  - `phone_click`
  - `email_click`
- Environment variables configured and documented
- Build verification passed

Post-deploy verification:

- Plausible site connection established
- Script detection confirmed on production site
