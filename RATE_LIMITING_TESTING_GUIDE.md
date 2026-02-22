# Rate Limiting Testing Guide

## Prerequisites

✅ **Completed:**
- `@upstash/redis` dependency installed in `netlify/functions/package.json`
- Rate limiting code fixed and TypeScript compilation passing
- Environment variables configured in `.env` file

## Environment Variables

Ensure your `.env` file contains the following rate limiting variables:

```bash
# Rate Limiting Configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=https://your-redis-url.upstash.io
RATE_LIMIT_REDIS_TOKEN=your_redis_token_here

# Rate Limiting Thresholds
# Global limit (all requests combined)
RATE_LIMIT_GLOBAL_REQUESTS=100
RATE_LIMIT_GLOBAL_WINDOW_MS=60000

# Per-IP limits
RATE_LIMIT_PER_IP_MINUTE_REQUESTS=5
RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS=60000

RATE_LIMIT_PER_IP_HOUR_REQUESTS=15
RATE_LIMIT_PER_IP_HOUR_WINDOW_MS=3600000

RATE_LIMIT_PER_IP_DAY_REQUESTS=30
RATE_LIMIT_PER_IP_DAY_WINDOW_MS=86400000
```

## Testing Steps

### 1. Start Development Server

```bash
npm run netlify:dev
```

This will start the Netlify development server with your `.env` variables loaded.

### 2. Test Rate Limiting Functionality

#### Test 1: Normal Request (Should Succeed)

```bash
curl -X POST http://localhost:8888/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "zmiana-koloru",
    "message": "This is a test message for rate limiting.",
    "recaptchaToken": "test_token"
  }'
```

**Expected Result:** HTTP 202 Accepted with success response.

#### Test 2: Exceed Per-IP Minute Limit

Send 6 requests in quick succession (limit is 5 per minute):

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:8888/.netlify/functions/contact \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test User",
      "email": "test@example.com",
      "subject": "zmiana-koloru",
      "message": "Test message '$i'",
      "recaptchaToken": "test_token"
    }'
  echo -e "\n---\n"
  sleep 1
done
```

**Expected Result:**
- Requests 1-5: HTTP 202 Accepted
- Request 6: HTTP 429 Too Many Requests with rate limit error

#### Test 3: Check Rate Limit Headers

When rate limited, the response should include these headers:

```bash
curl -i -X POST http://localhost:8888/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "zmiana-koloru",
    "message": "Test message",
    "recaptchaToken": "test_token"
  }'
```

**Expected Headers on Rate Limit:**
- `Retry-After`: Number of seconds to wait
- `X-RateLimit-Limit-Type`: Type of limit exceeded (per_ip_minute, per_ip_hour, per_ip_day, or global)
- `X-RateLimit-Remaining`: 0
- `X-RateLimit-Reset`: ISO timestamp when limit resets

#### Test 4: Wait and Retry

After receiving a rate limit error, wait for the `Retry-After` seconds and try again:

```bash
# Wait for the time specified in Retry-After header
sleep 60

# Try again
curl -X POST http://localhost:8888/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "zmiana-koloru",
    "message": "Test message after waiting",
    "recaptchaToken": "test_token"
  }'
```

**Expected Result:** HTTP 202 Accepted (rate limit should have reset)

### 3. Test with Different IPs

Simulate requests from different IP addresses to verify per-IP limits work:

```bash
# Request from IP 1
curl -X POST http://localhost:8888/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.1" \
  -d '{
    "name": "User 1",
    "email": "user1@example.com",
    "subject": "zmiana-koloru",
    "message": "Test from IP 1",
    "recaptchaToken": "test_token"
  }'

# Request from IP 2 (should not be affected by IP 1's rate limit)
curl -X POST http://localhost:8888/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.2" \
  -d '{
    "name": "User 2",
    "email": "user2@example.com",
    "subject": "zmiana-koloru",
    "message": "Test from IP 2",
    "recaptchaToken": "test_token"
  }'
```

### 4. Test Rate Limiting Disabled

Set `RATE_LIMIT_ENABLED=false` in your `.env` and restart the server. All requests should be allowed regardless of frequency.

### 5. Monitor Logs

Check the console output for rate limiting logs:

```
rate_limit_check_passed - When a request passes rate limiting
rate_limit_exceeded - When a request exceeds a limit
rate_limit_disabled - When rate limiting is disabled
```

## Common Issues and Solutions

### Issue: "Cannot connect to Redis"

**Solution:** Verify your `RATE_LIMIT_REDIS_URL` and `RATE_LIMIT_REDIS_TOKEN` are correct in `.env`.

### Issue: Rate limiting not working

**Solution:** Ensure `RATE_LIMIT_ENABLED=true` and restart the development server.

### Issue: All requests blocked

**Solution:** Check your Redis connection. The rate limiting implementation uses a "fail-open" strategy, so if Redis is unavailable, requests should still be allowed. If all requests are blocked, there may be an issue with the rate limit logic.

### Issue: Rate limits not resetting

**Solution:** Check the TTL settings in Redis. The rate limiting implementation sets expiration on keys, but if Redis is configured differently, keys may persist longer than expected.

## Production Deployment

After successful testing, add the environment variables to Netlify:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add all the rate limiting environment variables
3. Redeploy your site

**Important:** Never commit your `.env` file to version control. Use `.env.example` as a template for others.

## Monitoring

### Check Redis Keys

You can monitor the rate limiting keys in Redis:

```bash
# Connect to Redis using Upstash CLI or Redis CLI
redis-cli -u YOUR_REDIS_URL -a YOUR_REDIS_TOKEN

# List all rate limit keys
KEYS ratelimit:*

# Check a specific key
ZRANGE ratelimit:ip:192.168.1.1:minute 0 -1 WITHSCORES

# Check TTL of a key
TTL ratelimit:ip:192.168.1.1:minute
```

### Netlify Function Logs

Check Netlify function logs to monitor rate limiting activity:

```bash
netlify functions:log contact
```

## Performance Considerations

- Redis operations are very fast (< 1ms typical latency)
- The sliding window algorithm provides accurate rate limiting
- Each request performs up to 4 Redis operations (one for each limit tier)
- Consider increasing the window sizes for high-traffic sites

## Next Steps

1. ✅ Fix rate limiting code (completed)
2. ✅ Configure environment variables (completed)
3. ⏳ Test rate limiting functionality (in progress)
4. ⏳ Deploy to production with Netlify environment variables
5. ⏳ Monitor and adjust rate limits based on traffic patterns
