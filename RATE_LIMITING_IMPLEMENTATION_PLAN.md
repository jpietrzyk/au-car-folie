# Rate Limiting Implementation Plan for Contact Form

## Overview

This document outlines the plan for implementing rate limiting for the contact form on car-folie.pl. Rate limiting will work alongside the existing reCAPTCHA v3 implementation to provide comprehensive protection against spam, bot attacks, and abuse.

## Current State

### Existing Protections

1. **reCAPTCHA v3** - Invisible verification with score-based filtering (0.0-1.0 scale)
2. **Duplicate Detection** - Idempotency based on submission content hash
3. **Form Validation** - Client and server-side validation
4. **Airtable Integration** - With fallback dead-letter queue

### Current Contact Form Flow

```
User submits form
    ↓
Client-side validation
    ↓
reCAPTCHA token generation
    ↓
Server receives request
    ↓
Form validation
    ↓
reCAPTCHA verification
    ↓
Duplicate check (Airtable)
    ↓
Create Airtable record
    ↓
Return response
```

## Rate Limiting Strategy

### Rate Limiting Levels

We'll implement a multi-tiered rate limiting approach:

| Level | Scope | Limit | Window | Purpose |
|-------|-------|-------|--------|---------|
| 1 | Global (all requests) | 100 req/min | 1 minute | Prevent server overload |
| 2 | Per IP address | 5 req/min | 1 minute | Prevent individual abuse |
| 3 | Per IP address | 15 req/hour | 1 hour | Prevent sustained abuse |
| 4 | Per IP address | 30 req/day | 1 day | Long-term abuse prevention |

### Rate Limiting Algorithm

We'll use the **Sliding Window Counter** algorithm, which provides:
- Accurate rate limiting
- No sudden spikes at window boundaries
- Memory-efficient implementation

### Storage Backend

Since we're on Netlify Functions (serverless), we have several options:

| Option | Pros | Cons | Recommendation |
|--------|-------|-------|----------------|
| **In-memory (Map)** | Fast, no external dependencies | Not shared across function instances, resets on cold start | ❌ Not suitable for production |
| **Netlify Blobs** | Native to Netlify, persistent | Additional service, may have latency | ⚠️ Possible, but adds complexity |
| **Redis** | Industry standard, fast, scalable | Requires external service, additional cost | ✅ Recommended for production |
| **Upstash Redis** | Serverless Redis, free tier available | External dependency, network latency | ✅ Best for Netlify (free tier) |

**Recommendation**: Use **Upstash Redis** for the following reasons:
- Free tier available (10,000 commands/day)
- HTTP API (no TCP connection issues in serverless)
- Edge-optimized for low latency
- Native TypeScript SDK
- Easy integration with Netlify Functions

## Implementation Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Contact Form Handler                     │
├─────────────────────────────────────────────────────────────┤
│  1. Parse Request                                           │
│  2. Extract IP address (X-Forwarded-For header)             │
│  3. Check Rate Limits                                       │
│     ├─ Global limit                                         │
│     ├─ Per-IP minute limit                                 │
│     ├─ Per-IP hour limit                                   │
│     └─ Per-IP day limit                                    │
│  4. If rate limited → Return 429 with retry-after          │
│  5. If not limited → Continue to validation                 │
│  6. reCAPTCHA verification (existing)                       │
│  7. Form validation (existing)                              │
│  8. Duplicate check (existing)                              │
│  9. Create Airtable record (existing)                       │
│ 10. Update rate limit counters                              │
│ 11. Return success response                                 │
└─────────────────────────────────────────────────────────────┘
```

### Rate Limiting Service

```typescript
interface RateLimitConfig {
  enabled: boolean;
  redisUrl?: string;
  redisToken?: string;
  limits: {
    global: { requests: number; windowMs: number };
    perIpMinute: { requests: number; windowMs: number };
    perIpHour: { requests: number; windowMs: number };
    perIpDay: { requests: number; windowMs: number };
  };
}

interface RateLimitResult {
  allowed: boolean;
  limitType?: string;
  retryAfter?: number; // seconds
  remaining?: number;
  reset?: Date;
}
```

## Implementation Steps

### Phase 1: Setup and Configuration (30 minutes)

#### Step 1.1: Install Dependencies

```bash
npm install @upstash/redis
```

#### Step 1.2: Environment Variables

Add to `.env.example`:

```env
# Rate Limiting Configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=https://your-redis-url.upstash.io
RATE_LIMIT_REDIS_TOKEN=your_redis_token_here

# Rate Limiting Thresholds
RATE_LIMIT_GLOBAL_REQUESTS=100
RATE_LIMIT_GLOBAL_WINDOW_MS=60000

RATE_LIMIT_PER_IP_MINUTE_REQUESTS=5
RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS=60000

RATE_LIMIT_PER_IP_HOUR_REQUESTS=15
RATE_LIMIT_PER_IP_HOUR_WINDOW_MS=3600000

RATE_LIMIT_PER_IP_DAY_REQUESTS=30
RATE_LIMIT_PER_IP_DAY_WINDOW_MS=86400000
```

#### Step 1.3: Create Upstash Redis Account

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a free account
3. Create a new Redis database
4. Copy the REST URL and REST Token
5. Add to Netlify environment variables

### Phase 2: Rate Limiting Service Implementation (2 hours)

#### Step 2.1: Create Rate Limiting Module

Create file: `netlify/functions/rate-limit.ts`

```typescript
import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  enabled: boolean;
  redisUrl?: string;
  redisToken?: string;
  limits: {
    global: { requests: number; windowMs: number };
    perIpMinute: { requests: number; windowMs: number };
    perIpHour: { requests: number; windowMs: number };
    perIpDay: { requests: number; windowMs: number };
  };
}

interface RateLimitResult {
  allowed: boolean;
  limitType?: string;
  retryAfter?: number;
  remaining?: number;
  reset?: Date;
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    redisUrl: process.env.RATE_LIMIT_REDIS_URL,
    redisToken: process.env.RATE_LIMIT_REDIS_TOKEN,
    limits: {
      global: {
        requests: Number(process.env.RATE_LIMIT_GLOBAL_REQUESTS || 100),
        windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || 60000)
      },
      perIpMinute: {
        requests: Number(process.env.RATE_LIMIT_PER_IP_MINUTE_REQUESTS || 5),
        windowMs: Number(process.env.RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS || 60000)
      },
      perIpHour: {
        requests: Number(process.env.RATE_LIMIT_PER_IP_HOUR_REQUESTS || 15),
        windowMs: Number(process.env.RATE_LIMIT_PER_IP_HOUR_WINDOW_MS || 3600000)
      },
      perIpDay: {
        requests: Number(process.env.RATE_LIMIT_PER_IP_DAY_REQUESTS || 30),
        windowMs: Number(process.env.RATE_LIMIT_PER_IP_DAY_WINDOW_MS || 86400000)
      }
    }
  };
}

export function createRedisClient(config: RateLimitConfig): Redis | null {
  if (!config.enabled || !config.redisUrl || !config.redisToken) {
    return null;
  }

  return new Redis({
    url: config.redisUrl,
    token: config.redisToken
  });
}

async function checkSlidingWindowLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Remove entries outside the current window
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in current window
  const count = await redis.zcard(key);

  if (count >= limit) {
    // Get the oldest timestamp to calculate retry-after
    const oldest = await redis.zrange(key, 0, 0);
    const resetTime = oldest.length > 0 ? Number(oldest[0]) + windowMs : now + windowMs;

    return {
      allowed: false,
      remaining: 0,
      reset: new Date(resetTime)
    };
  }

  // Add current request timestamp
  await redis.zadd(key, now, now.toString());

  // Set expiration to window size
  await redis.expire(key, Math.ceil(windowMs / 1000));

  return {
    allowed: true,
    remaining: limit - count - 1,
    reset: new Date(now + windowMs)
  };
}

export async function checkRateLimit(
  redis: Redis | null,
  ipAddress: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // If rate limiting is disabled or Redis is not configured, allow all requests
  if (!config.enabled || !redis) {
    return { allowed: true };
  }

  const timestamp = Date.now();

  // Check global limit
  const globalResult = await checkSlidingWindowLimit(
    redis,
    `ratelimit:global`,
    config.limits.global.requests,
    config.limits.global.windowMs
  );

  if (!globalResult.allowed) {
    return {
      allowed: false,
      limitType: 'global',
      retryAfter: Math.ceil((globalResult.reset.getTime() - timestamp) / 1000),
      remaining: 0,
      reset: globalResult.reset
    };
  }

  // Check per-IP minute limit
  const minuteResult = await checkSlidingWindowLimit(
    redis,
    `ratelimit:ip:${ipAddress}:minute`,
    config.limits.perIpMinute.requests,
    config.limits.perIpMinute.windowMs
  );

  if (!minuteResult.allowed) {
    return {
      allowed: false,
      limitType: 'per_ip_minute',
      retryAfter: Math.ceil((minuteResult.reset.getTime() - timestamp) / 1000),
      remaining: 0,
      reset: minuteResult.reset
    };
  }

  // Check per-IP hour limit
  const hourResult = await checkSlidingWindowLimit(
    redis,
    `ratelimit:ip:${ipAddress}:hour`,
    config.limits.perIpHour.requests,
    config.limits.perIpHour.windowMs
  );

  if (!hourResult.allowed) {
    return {
      allowed: false,
      limitType: 'per_ip_hour',
      retryAfter: Math.ceil((hourResult.reset.getTime() - timestamp) / 1000),
      remaining: 0,
      reset: hourResult.reset
    };
  }

  // Check per-IP day limit
  const dayResult = await checkSlidingWindowLimit(
    redis,
    `ratelimit:ip:${ipAddress}:day`,
    config.limits.perIpDay.requests,
    config.limits.perIpDay.windowMs
  );

  if (!dayResult.allowed) {
    return {
      allowed: false,
      limitType: 'per_ip_day',
      retryAfter: Math.ceil((dayResult.reset.getTime() - timestamp) / 1000),
      remaining: 0,
      reset: dayResult.reset
    };
  }

  // All checks passed
  return {
    allowed: true,
    remaining: Math.min(
      minuteResult.remaining,
      hourResult.remaining,
      dayResult.remaining
    ),
    reset: minuteResult.reset
  };
}

export async function cleanupRateLimitData(redis: Redis | null): Promise<void> {
  if (!redis) return;

  // Clean up old rate limit entries
  // This can be run periodically via a scheduled function
  const keys = await redis.keys('ratelimit:*');

  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      // Key has no expiration, set one
      await redis.expire(key, 86400); // 1 day
    }
  }
}
```

### Phase 3: Integration with Contact Function (1 hour)

#### Step 3.1: Update contact.ts

Modify `netlify/functions/contact.ts` to integrate rate limiting:

```typescript
// Add import at the top
import { getRateLimitConfig, createRedisClient, checkRateLimit } from './rate-limit';

// Add new API response code
type ApiResponseCode =
  | 'accepted'
  | 'accepted_duplicate'
  | 'accepted_queued'
  | 'validation_error'
  | 'airtable_auth'
  | 'airtable_rate_limit'
  | 'airtable_timeout'
  | 'airtable_unavailable'
  | 'method_not_allowed'
  | 'internal_error'
  | 'rate_limit_exceeded'; // New code

// Update handler function
export const handler = async (event: any) => {
  const startedAt = Date.now();

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: BASE_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return buildResponse(405, {
      success: false,
      code: 'method_not_allowed',
      message: 'Niedozwolona metoda żądania.',
      error: 'Niedozwolona metoda żądania.'
    });
  }

  try {
    // Extract IP address
    const xForwardedFor = getHeader(event, 'x-forwarded-for');
    const ipAddress = xForwardedFor ? xForwardedFor.split(',')[0].trim() : 'unknown';

    // Check rate limits
    const rateLimitConfig = getRateLimitConfig();
    const redis = createRedisClient(rateLimitConfig);
    const rateLimitResult = await checkRateLimit(redis, ipAddress, rateLimitConfig);

    if (!rateLimitResult.allowed) {
      console.warn('rate_limit_exceeded', {
        ipAddress,
        limitType: rateLimitResult.limitType,
        retryAfter: rateLimitResult.retryAfter,
        userAgent: getHeader(event, 'user-agent')
      });

      const headers = {
        ...BASE_HEADERS,
        'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        'X-RateLimit-Limit-Type': rateLimitResult.limitType || 'unknown',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.reset?.toISOString() || new Date(Date.now() + 60000).toISOString()
      };

      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          success: false,
          code: 'rate_limit_exceeded',
          message: 'Przekroczono limit zgłoszeń. Spróbuj ponownie za chwilę.',
          retryAfter: rateLimitResult.retryAfter,
          limitType: rateLimitResult.limitType
        })
      };
    }

    // Continue with existing form processing...
    const formData = parseFormBody(event);
    // ... rest of the existing code
  } catch (error) {
    // ... existing error handling
  }
};
```

### Phase 4: Frontend Updates (30 minutes)

#### Step 4.1: Update Contact Form

Update `src/pages/kontakt.astro` to handle rate limit responses:

```javascript
// Update form submission handler
async function handleSubmit(event) {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;

  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Wysyłanie...';

  try {
    const response = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.status === 429) {
      // Rate limit exceeded
      const retryAfter = data.retryAfter || 60;
      const message = `Przekroczono limit zgłoszeń. Spróbuj ponownie za ${retryAfter} sekund.`;
      showError(message);

      // Update submit button with countdown
      let remaining = retryAfter;
      submitButton.textContent = `Spróbuj ponownie za ${remaining}s`;

      const countdown = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(countdown);
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        } else {
          submitButton.textContent = `Spróbuj ponownie za ${remaining}s`;
        }
      }, 1000);

      return;
    }

    // Handle other responses...
  } catch (error) {
    showError('Wystąpił błąd. Spróbuj ponownie.');
  } finally {
    if (response.status !== 429) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
}
```

### Phase 5: Testing (1 hour)

#### Step 5.1: Unit Tests

Create test file: `netlify/functions/__tests__/rate-limit.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRateLimitConfig, checkRateLimit } from '../rate-limit';

describe('Rate Limiting', () => {
  describe('getRateLimitConfig', () => {
    it('should return default config when env vars are not set', () => {
      vi.stubEnv('RATE_LIMIT_ENABLED', 'false');
      const config = getRateLimitConfig();
      expect(config.enabled).toBe(false);
    });

    it('should return enabled config when env vars are set', () => {
      vi.stubEnv('RATE_LIMIT_ENABLED', 'true');
      vi.stubEnv('RATE_LIMIT_REDIS_URL', 'https://test.upstash.io');
      vi.stubEnv('RATE_LIMIT_REDIS_TOKEN', 'test-token');
      const config = getRateLimitConfig();
      expect(config.enabled).toBe(true);
      expect(config.redisUrl).toBe('https://test.upstash.io');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests when rate limiting is disabled', async () => {
      const result = await checkRateLimit(null, '127.0.0.1', { enabled: false });
      expect(result.allowed).toBe(true);
    });

    it('should enforce per-IP minute limit', async () => {
      // Test with mock Redis
      // Implementation depends on Redis mocking strategy
    });
  });
});
```

#### Step 5.2: Integration Tests

1. **Test rate limit enforcement**:
   - Submit form rapidly from same IP
   - Verify 429 response after limit exceeded
   - Verify Retry-After header is correct
   - Verify countdown works on frontend

2. **Test different limit types**:
   - Test global limit (simulate multiple IPs)
   - Test per-IP minute limit
   - Test per-IP hour limit
   - Test per-IP day limit

3. **Test sliding window**:
   - Submit 5 requests in first 30 seconds
   - Wait 35 seconds
   - Submit another request (should be allowed)
   - Submit 5 more requests rapidly (should be limited)

4. **Test with reCAPTCHA**:
   - Verify rate limiting works before reCAPTCHA verification
   - Verify both protections work together

### Phase 6: Deployment (30 minutes)

#### Step 6.1: Update Netlify Environment Variables

Add the following variables to Netlify dashboard:

```env
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
```

#### Step 6.2: Deploy to Production

```bash
npm run build
netlify deploy --prod
```

### Phase 7: Monitoring and Maintenance (Ongoing)

#### Step 7.1: Monitoring Metrics

Track the following metrics:

1. **Rate limit violations**:
   - Count of 429 responses
   - Breakdown by limit type (global, per-ip-minute, etc.)
   - Top offending IPs

2. **Redis performance**:
   - Request latency
   - Error rates
   - Memory usage

3. **Form submission patterns**:
   - Submission rate over time
   - Peak submission times
   - Geographic distribution

#### Step 7.2: Logging

Add structured logging for rate limiting:

```typescript
console.info('rate_limit_check', {
  ipAddress,
  allowed: rateLimitResult.allowed,
  limitType: rateLimitResult.limitType,
  remaining: rateLimitResult.remaining,
  userAgent: getHeader(event, 'user-agent')
});
```

#### Step 7.3: Alerts

Set up alerts for:

1. High rate of 429 responses (potential DDoS)
2. Redis connection failures
3. Unusual submission patterns

#### Step 7.4: Maintenance Tasks

- Review rate limit thresholds monthly
- Monitor Upstash Redis usage (free tier: 10,000 commands/day)
- Clean up old rate limit data periodically
- Adjust limits based on traffic patterns

## Security Considerations

### IP Address Spoofing

- Use `X-Forwarded-For` header (provided by Netlify)
- Extract the first IP in the chain (original client IP)
- Fallback to `NETLIFY_CLIENT_IP` if available
- Log suspicious patterns

### Redis Security

- Use environment variables for credentials
- Never commit Redis URL/token to repository
- Use Upstash's built-in authentication
- Enable TLS encryption (default in Upstash)

### Rate Limit Bypass Prevention

1. **IP-based limits**: Prevents single-source attacks
2. **Global limits**: Prevents distributed attacks
3. **Sliding window**: Prevents burst attacks at window boundaries
4. **Multiple time windows**: Prevents gaming the system

### Graceful Degradation

If Redis is unavailable:
- Log the error
- Allow requests to proceed (fail-open)
- Alert administrators
- Consider implementing fallback (in-memory) for temporary outages

## Performance Considerations

### Redis Latency

- Upstash Redis has low latency (< 10ms in most regions)
- Use HTTP API (no TCP connection overhead)
- Consider edge deployment for lower latency

### Cold Starts

- Netlify Functions have cold starts (~100-300ms)
- Redis connection is established per request
- Connection pooling is not needed with HTTP API

### Memory Usage

- Each rate limit entry uses minimal memory
- Redis automatically expires old entries
- Estimated memory: ~100 bytes per active IP

### Cost Analysis

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Upstash Redis | 10,000 commands/day | $0.20/10K commands |
| Netlify Functions | 125,000 invocations/month | $19/month |

**Estimated usage**:
- 100 form submissions/day = 400 Redis commands/day (4 per submission)
- Free tier is sufficient for most small businesses

## Troubleshooting

### Common Issues

1. **Rate limit errors for legitimate users**:
   - Check if limits are too strict
   - Verify IP extraction is correct
   - Check for shared IPs (corporate networks, VPNs)

2. **Redis connection errors**:
   - Verify Redis URL and token
   - Check Upstash service status
   - Verify network connectivity

3. **High memory usage in Redis**:
   - Check for expired entries not being cleaned
   - Reduce window sizes if needed
   - Run cleanup function periodically

4. **Inconsistent rate limiting**:
   - Verify IP extraction logic
   - Check for proxy/load balancer issues
   - Review Netlify logs for IP information

### Debug Mode

Enable debug logging:

```typescript
if (process.env.RATE_LIMIT_DEBUG === 'true') {
  console.debug('rate_limit_debug', {
    ipAddress,
    config: rateLimitConfig,
    result: rateLimitResult
  });
}
```

## Future Enhancements

### Phase 2 Enhancements (Optional)

1. **Adaptive Rate Limiting**:
   - Adjust limits based on reCAPTCHA scores
   - Stricter limits for low scores
   - More lenient for high scores

2. **Whitelist/Blacklist**:
   - Whitelist trusted IPs (office, partners)
   - Blacklist known abusive IPs
   - Manual override capability

3. **Geographic Rate Limiting**:
   - Different limits per country/region
   - Stricter for high-risk regions
   - More lenient for local users

4. **Captcha Challenge**:
   - Show CAPTCHA after rate limit exceeded
   - Allow bypass with successful CAPTCHA
   - Track CAPTCHA success rates

5. **Analytics Dashboard**:
   - Real-time rate limit statistics
   - Visualization of submission patterns
   - Alerting and notifications

## Summary

This implementation provides:

✅ **Multi-tiered rate limiting** (global, per-IP minute/hour/day)
✅ **Sliding window algorithm** for accurate limiting
✅ **Upstash Redis integration** with free tier
✅ **Graceful degradation** if Redis is unavailable
✅ **Comprehensive logging** for monitoring
✅ **User-friendly error messages** with retry countdown
✅ **Security best practices** (IP extraction, Redis security)
✅ **Performance optimized** for serverless
✅ **Cost-effective** (free tiers sufficient for most use cases)

### Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Setup | 30 min | None |
| Phase 2: Service Implementation | 2 hours | Phase 1 |
| Phase 3: Integration | 1 hour | Phase 2 |
| Phase 4: Frontend Updates | 30 min | Phase 3 |
| Phase 5: Testing | 1 hour | Phase 4 |
| Phase 6: Deployment | 30 min | Phase 5 |
| Phase 7: Monitoring | Ongoing | Phase 6 |
| **Total** | **5.5 hours** | |

### Success Criteria

- [ ] Rate limits enforced correctly
- [ ] 429 responses with proper headers
- [ ] Frontend displays retry countdown
- [ ] Works alongside reCAPTCHA
- [ ] Graceful degradation when Redis unavailable
- [ ] Comprehensive logging and monitoring
- [ ] No impact on legitimate users
- [ ] Cost within free tier limits

---

**Document Version**: 1.0
**Last Updated**: 2026-02-22
**Status**: Ready for Implementation
