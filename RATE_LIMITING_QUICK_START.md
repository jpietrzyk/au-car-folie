# Rate Limiting Quick Start Guide

This guide provides step-by-step instructions for testing and deploying the rate limiting feature for the contact form.

## Prerequisites

Before starting, ensure you have:

1. ✅ Node.js 18+ installed
2. ✅ Netlify CLI installed (`npm install -g netlify-cli`)
3. ✅ Project dependencies installed (`npm install`)
4. ✅ Rate limiting code implemented (Phases 1-4 completed)

## Phase 1: Upstash Redis Setup (5 minutes)

### Step 1.1: Create Upstash Account

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Click "Sign Up" or "Log In"
3. Create a free account (no credit card required)

### Step 1.2: Create Redis Database

1. After logging in, click "Create Database"
2. Choose a region closest to your users (e.g., Frankfurt for Poland)
3. Click "Create"
4. Wait for the database to be provisioned (usually < 30 seconds)

### Step 1.3: Get Redis Credentials

1. Click on your newly created database
2. Copy the **REST URL** (looks like: `https://xxx-xxx.upstash.io`)
3. Copy the **REST Token** (looks like: `AXX...`)
4. Save these securely - you'll need them for environment variables

## Phase 2: Local Testing (15 minutes)

### Step 2.1: Create Local Environment File

Create a `.env` file in the project root:

```env
# Copy existing variables from .env.example
SITE_URL=https://car-folie.pl

# Airtable (if configured)
AIRTABLE_ENABLED=false
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=ContactSubmissions
AIRTABLE_TIMEOUT_MS=4500
AIRTABLE_MAX_RETRIES=1

# reCAPTCHA (if configured)
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_MIN_SCORE=0.5

# Rate Limiting - NEW!
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

### Step 2.2: Start Netlify Dev Server

```bash
npm run netlify:dev
```

The server will start at `http://localhost:8888`

### Step 2.3: Test Rate Limiting

1. Open `http://localhost:8888/kontakt` in your browser
2. Open browser DevTools (F12) and go to the **Console** tab
3. Fill out the form and submit it
4. Check the console for rate limiting logs:
   - `rate_limit_check_passed` - Request was allowed
   - `rate_limit_exceeded` - Request was blocked

#### Test 1: Normal Submission

1. Submit a valid form
2. Expected: Success message, form resets
3. Check console: Should see `rate_limit_check_passed`

#### Test 2: Per-IP Minute Limit

1. Submit the form 5 times rapidly (within 1 minute)
2. Expected: First 5 succeed, 6th shows rate limit error
3. Expected: Submit button shows countdown
4. Expected: Error message: "Przekroczono limit zgłoszeń. Spróbuj ponownie za X sekund."

#### Test 3: Sliding Window

1. Submit 5 times in the first 30 seconds
2. Wait 35 seconds
3. Submit again - should be allowed
4. Submit 5 more times rapidly - should be limited

### Step 2.4: Verify Redis Data

1. Go to your Upstash dashboard
2. Click on your database
3. Click "Data Browser"
4. You should see keys like:
   - `ratelimit:global`
   - `ratelimit:ip:127.0.0.1:minute`
   - `ratelimit:ip:127.0.0.1:hour`
   - `ratelimit:ip:127.0.0.1:day`

## Phase 3: Production Deployment (10 minutes)

### Step 3.1: Configure Netlify Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:

```env
# Rate Limiting
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

### Step 3.2: Deploy to Production

```bash
npm run build
netlify deploy --prod
```

Or push to your git repository and let Netlify auto-deploy.

### Step 3.3: Verify Production

1. Visit your production site: `https://car-folie.pl/kontakt`
2. Submit a test form
3. Check Netlify Functions logs:
   - Go to Netlify Dashboard → **Functions** → **contact**
   - Look for `rate_limit_check_passed` or `rate_limit_exceeded` logs

## Phase 4: Monitoring (Ongoing)

### Step 4.1: Monitor Upstash Redis

1. Go to [Upstash Dashboard](https://console.upstash.com)
2. Check your database metrics:
   - **Commands/day** - Should be well under 10,000 (free tier)
   - **Memory usage** - Should be minimal
   - **Latency** - Should be < 50ms

### Step 4.2: Monitor Netlify Functions

1. Go to Netlify Dashboard → **Functions** → **contact**
2. Check for:
   - Rate of 429 responses (rate limit exceeded)
   - Function execution time
   - Error rates

### Step 4.3: Adjust Limits if Needed

If you're seeing too many legitimate users being rate limited:

1. Increase the per-IP limits in environment variables:
   ```env
   RATE_LIMIT_PER_IP_MINUTE_REQUESTS=10  # Increase from 5
   RATE_LIMIT_PER_IP_HOUR_REQUESTS=30    # Increase from 15
   ```

2. Redeploy the site

## Troubleshooting

### Issue: Rate limiting not working

**Symptoms**: Form submits rapidly without being limited

**Solutions**:
1. Check `RATE_LIMIT_ENABLED=true` in environment variables
2. Verify Redis URL and token are correct
3. Check Netlify Function logs for errors
4. Ensure Upstash Redis is accessible

### Issue: All submissions being blocked

**Symptoms**: Every form submission shows rate limit error

**Solutions**:
1. Check if limits are too strict for your use case
2. Increase limits in environment variables
3. Check if Redis data is corrupted (clear keys in Upstash dashboard)
4. Verify IP extraction is working correctly

### Issue: Redis connection errors

**Symptoms**: Netlify Function logs show Redis connection errors

**Solutions**:
1. Verify Redis URL and token are correct
2. Check Upstash service status
3. Ensure Redis database is in the correct region
4. Check if Redis is within free tier limits

### Issue: High Redis usage

**Symptoms**: Approaching or exceeding 10,000 commands/day

**Solutions**:
1. Check for abuse or bot traffic
2. Consider increasing rate limits to reduce Redis calls
3. Upgrade to paid Upstash tier if needed
4. Implement IP whitelisting for trusted sources

## Testing Checklist

Before going to production, verify:

- [ ] Upstash Redis account created and database provisioned
- [ ] Local environment variables configured
- [ ] Netlify dev server starts successfully
- [ ] Normal form submission works
- [ ] Per-IP minute limit enforced (5 requests)
- [ ] Submit button shows countdown after rate limit
- [ ] Error message displays correctly
- [ ] Sliding window works (requests allowed after window expires)
- [ ] Redis data visible in Upstash dashboard
- [ ] Production environment variables configured
- [ ] Site deployed to production
- [ ] Production form submission works
- [ ] Rate limiting works in production
- [ ] Netlify Function logs show rate limiting activity

## Next Steps

After successful deployment:

1. **Monitor**: Check Upstash and Netlify dashboards regularly
2. **Analyze**: Review rate limit patterns and adjust if needed
3. **Alert**: Set up alerts for high rate of 429 responses
4. **Document**: Record any adjustments made to limits
5. **Iterate**: Consider future enhancements (adaptive limits, whitelisting)

## Cost Monitoring

### Free Tier Limits

| Service | Free Tier | Current Usage | Status |
|---------|-----------|---------------|--------|
| Upstash Redis | 10,000 commands/day | ~400/day (100 submissions × 4 commands) | ✅ Well within limits |
| Netlify Functions | 125,000 invocations/month | ~3,000/month (100/day) | ✅ Well within limits |

### When to Upgrade

Consider upgrading if:
- Form submissions exceed 2,500/day (10,000 Redis commands)
- You need lower latency (paid tier has better performance)
- You need additional Redis features

## Support

If you encounter issues:

1. Check the [Rate Limiting Implementation Plan](./RATE_LIMITING_IMPLEMENTATION_PLAN.md)
2. Review the [Troubleshooting](#troubleshooting) section above
3. Check Upstash documentation: https://upstash.com/docs
4. Check Netlify Functions documentation: https://docs.netlify.com/functions/

---

**Document Version**: 1.0
**Last Updated**: 2026-02-22
**Status**: Ready for Testing
