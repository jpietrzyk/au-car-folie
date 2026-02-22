# Rate Limiting Deployment Guide

## Overview

This guide will help you deploy the rate limiting feature to production by adding the necessary environment variables to Netlify.

## Prerequisites

✅ Rate limiting code fixed and tested
✅ Environment variables configured in `.env`
✅ All tests passed in development

## Step-by-Step Deployment

### Step 1: Access Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: `car-folie-astro`
3. Navigate to **Site Settings** → **Environment variables**

### Step 2: Add Environment Variables

Add the following environment variables one by one:

#### Rate Limiting Configuration

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `RATE_LIMIT_ENABLED` | `true` | Enable/disable rate limiting |
| `RATE_LIMIT_REDIS_URL` | `https://lasting-mastodon-39717.upstash.io` | Your Upstash Redis URL |
| `RATE_LIMIT_REDIS_TOKEN` | `AZslAAIncDIyOTE5ZjU2ZWJhZDE0ZDAzOWVmMzQ0NzQwYWI0OTM3N3AyMzk3MTc` | Your Upstash Redis token |

#### Rate Limiting Thresholds

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `RATE_LIMIT_GLOBAL_REQUESTS` | `100` | Max requests globally per window |
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | `60000` | Global window size (60 seconds) |
| `RATE_LIMIT_PER_IP_MINUTE_REQUESTS` | `5` | Max requests per IP per minute |
| `RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS` | `60000` | Per-minute window size (60 seconds) |
| `RATE_LIMIT_PER_IP_HOUR_REQUESTS` | `15` | Max requests per IP per hour |
| `RATE_LIMIT_PER_IP_HOUR_WINDOW_MS` | `3600000` | Per-hour window size (1 hour) |
| `RATE_LIMIT_PER_IP_DAY_REQUESTS` | `30` | Max requests per IP per day |
| `RATE_LIMIT_PER_IP_DAY_WINDOW_MS` | `86400000` | Per-day window size (24 hours) |

### Step 3: Deploy to Production

After adding all environment variables, trigger a deployment:

**Option A: Automatic Deployment**
- Netlify will automatically redeploy when environment variables are saved

**Option B: Manual Deployment**
```bash
# From your project root
git add .
git commit -m "Add rate limiting environment variables"
git push
```

Or use the Netlify CLI:
```bash
netlify deploy --prod
```

### Step 4: Verify Deployment

1. Check the deployment logs for any errors
2. Visit your contact form at `https://car-folie.pl/kontakt`
3. Submit a test form submission
4. Check Netlify function logs:
   ```bash
   netlify functions:log contact
   ```

### Step 5: Test Rate Limiting in Production

Use the same test script but with your production URL:

```bash
# Update the BASE_URL in test-rate-limit.sh
BASE_URL="https://car-folie.pl/.netlify/functions/contact"

# Run the test
./test-rate-limit.sh
```

**Important:** Be careful when testing rate limiting in production as it may affect real users. Consider:
- Using a test IP address that you can identify
- Testing during low-traffic periods
- Having a plan to quickly disable rate limiting if issues arise

## Post-Deployment Monitoring

### Monitor Function Logs

```bash
# View recent logs
netlify functions:log contact

# Follow logs in real-time
netlify functions:log contact --tail
```

### Key Log Messages to Watch

- `rate_limit_check_passed` - Normal rate limit checks
- `rate_limit_exceeded` - Requests being rate limited
- `rate_limit_disabled` - If rate limiting is disabled

### Monitor Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Select your Redis database
3. Monitor:
   - Key count (should see `ratelimit:*` keys)
   - Memory usage
   - Command statistics

## Troubleshooting

### Issue: Rate Limiting Not Working

**Check:**
1. `RATE_LIMIT_ENABLED=true` is set in Netlify
2. Redis URL and token are correct
3. Function logs show `rate_limit_check_passed` or `rate_limit_exceeded`

**Solution:**
- Verify environment variables in Netlify Dashboard
- Check function logs for errors
- Test Redis connection using Upstash Console

### Issue: All Requests Being Rate Limited

**Check:**
1. Rate limit thresholds are appropriate
2. Redis keys are expiring correctly
3. No stale data in Redis

**Solution:**
- Increase rate limits if too restrictive
- Clear Redis keys if needed:
  ```bash
  # Using Upstash Console or Redis CLI
  redis-cli -u YOUR_URL -a YOUR_TOKEN
  DEL ratelimit:*
  ```
- Adjust window sizes

### Issue: High Redis Memory Usage

**Check:**
1. TTL is set correctly on keys
2. Number of unique IPs making requests

**Solution:**
- The implementation sets TTL automatically
- Monitor and adjust rate limits if needed
- Consider shorter windows for high-traffic sites

## Adjusting Rate Limits

If you need to adjust rate limits after deployment:

1. Go to Netlify Dashboard → Site Settings → Environment variables
2. Update the desired variable(s)
3. Save changes
4. Trigger a new deployment
5. Verify changes in function logs

**Example: Increase per-minute limit to 10**
```
RATE_LIMIT_PER_IP_MINUTE_REQUESTS=10
```

## Disabling Rate Limiting

If you need to temporarily disable rate limiting:

1. Set `RATE_LIMIT_ENABLED=false` in Netlify
2. Trigger a deployment
3. Rate limiting will be disabled immediately

**Note:** This is useful during testing or if issues arise.

## Security Considerations

### Environment Variables

- ✅ Never commit `.env` file to version control
- ✅ Use `.env.example` as a template
- ✅ Rotate Redis tokens periodically
- ✅ Use separate Redis instances for dev/prod

### Rate Limiting

- ✅ Rate limiting helps prevent abuse
- ✅ Fail-open strategy ensures availability
- ✅ Per-IP limits prevent single-source attacks
- ✅ Global limits protect overall system health

## Performance Impact

### Expected Performance

- Redis operations: < 1ms typical latency
- Additional overhead per request: ~2-4ms
- No significant impact on response times
- Scales well with increased traffic

### Monitoring Metrics

Track these metrics in production:

- Average response time
- Rate limit hit rate
- Redis connection errors
- Function execution time

## Rollback Plan

If issues arise after deployment:

1. **Immediate:** Set `RATE_LIMIT_ENABLED=false`
2. **Short-term:** Adjust rate limits to be less restrictive
3. **Long-term:** Investigate root cause and fix

## Success Criteria

Rate limiting deployment is successful when:

- ✅ Environment variables are set in Netlify
- ✅ Deployment completes without errors
- ✅ Contact form submissions work correctly
- ✅ Rate limiting logs appear in function logs
- ✅ Rate limits are enforced appropriately
- ✅ No significant performance degradation

## Next Steps

After successful deployment:

1. Monitor logs for the first 24-48 hours
2. Adjust rate limits if needed based on traffic patterns
3. Set up alerts for rate limit errors
4. Document any custom configurations
5. Share this guide with team members

## Support

If you encounter issues:

1. Check function logs: `netlify functions:log contact`
2. Verify environment variables in Netlify Dashboard
3. Test Redis connection in Upstash Console
4. Review troubleshooting section above
5. Consult [`RATE_LIMITING_TESTING_GUIDE.md`](RATE_LIMITING_TESTING_GUIDE.md:1)

---

**Status:** Ready for Deployment ✅
**Last Updated:** 2026-02-22
**Version:** 1.0.0
