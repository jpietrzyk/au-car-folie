# Rate Limiting Post-Deployment Verification Checklist

## Overview

Use this checklist to verify that rate limiting is working correctly after deploying to production.

## Pre-Deployment Verification

### Environment Variables
- [ ] All 10 rate limiting environment variables added to Netlify Dashboard
- [ ] `RATE_LIMIT_ENABLED=true` is set
- [ ] Upstash Redis URL and token are correct
- [ ] Rate limit thresholds match development configuration

### Code Deployment
- [ ] Latest code pushed to production
- [ ] Deployment completed successfully
- [ ] No errors in deployment logs

## Post-Deployment Verification (Immediately After Deployment)

### 1. Check Deployment Status
```bash
# Using Netlify CLI
netlify status

# Or check the Netlify Dashboard for deployment status
```

- [ ] Deployment shows as "Published"
- [ ] No deployment errors in logs

### 2. Verify Function is Deployed
```bash
# List deployed functions
netlify functions:list
```

- [ ] `contact` function is listed
- [ ] Function shows as "deployed"

### 3. Test Basic Functionality

#### Test 1: Normal Form Submission
- [ ] Visit `https://car-folie.pl/kontakt`
- [ ] Submit a valid form with all required fields
- [ ] Form submission succeeds (shows success message)
- [ ] No errors in browser console

#### Test 2: Check Function Logs
```bash
netlify functions:log contact
```

- [ ] Logs show `contact_submission_processed` or similar
- [ ] No rate limiting errors for single submission
- [ ] No Redis connection errors

### 4. Verify Rate Limiting is Active

#### Test 3: Submit Multiple Forms Quickly
- [ ] Submit 6 forms in rapid succession (within 1 minute)
- [ ] First 5 submissions succeed
- [ ] 6th submission shows rate limit error
- [ ] Error message is user-friendly

#### Test 4: Check Rate Limit Response Headers
```bash
# Use browser DevTools or curl to check headers
curl -i -X POST https://car-folie.pl/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"zmiana-koloru","message":"Test","recaptchaToken":"test"}'
```

When rate limited, response should include:
- [ ] `Retry-After` header (number of seconds)
- [ ] `X-RateLimit-Limit-Type` header (e.g., "per_ip_minute")
- [ ] `X-RateLimit-Remaining` header (0)
- [ ] `X-RateLimit-Reset` header (ISO timestamp)

### 5. Verify Per-IP Isolation

#### Test 5: Different IP Addresses
- [ ] Submit form from one IP (use VPN or different network)
- [ ] Submit form from different IP
- [ ] Both submissions succeed independently
- [ ] Rate limits are per-IP, not global

### 6. Check Upstash Redis

#### Test 6: Verify Redis Keys
1. Go to [Upstash Console](https://console.upstash.com/)
2. Select your Redis database
3. Check for rate limiting keys:

- [ ] Keys with pattern `ratelimit:*` exist
- [ ] Keys have TTL set (expiration time)
- [ ] Keys are being created and updated
- [ ] Memory usage is reasonable

#### Test 7: Monitor Redis Operations
- [ ] Command statistics show `ZADD`, `ZCARD`, `ZREMRANGEBYSCORE`, `EXPIRE` operations
- [ ] No Redis connection errors
- [ ] Latency is acceptable (< 10ms typical)

### 7. Monitor Function Performance

#### Test 8: Check Response Times
- [ ] Normal form submission: < 2 seconds
- [ ] Rate limit check: < 100ms additional overhead
- [ ] No significant performance degradation

#### Test 9: Check Error Rates
```bash
# Monitor function logs for errors
netlify functions:log contact --tail
```

- [ ] Error rate is low (< 1%)
- [ ] Most errors are rate limit related (expected)
- [ ] No unexpected errors

## Ongoing Monitoring (First 24-48 Hours)

### Daily Checks

#### Day 1
- [ ] Monitor function logs every few hours
- [ ] Check for rate limit errors
- [ ] Verify normal submissions are working
- [ ] Check Upstash Redis for unusual activity

#### Day 2
- [ ] Review rate limit hit rate
- [ ] Check if limits are too restrictive
- [ ] Monitor for abuse patterns
- [ ] Verify system stability

### Metrics to Track

#### Function Metrics
- [ ] Total requests per hour
- [ ] Rate limit hit rate (percentage)
- [ ] Average response time
- [ ] Error rate

#### Redis Metrics
- [ ] Number of rate limit keys
- [ ] Memory usage
- [ ] Command latency
- [ ] Connection errors

#### Business Metrics
- [ ] Form submission success rate
- [ ] User complaints (if any)
- [ ] Spam/abuse reports

## Adjustment Checklist

### If Rate Limits Are Too Restrictive

- [ ] Increase `RATE_LIMIT_PER_IP_MINUTE_REQUESTS`
- [ ] Increase `RATE_LIMIT_PER_IP_HOUR_REQUESTS`
- [ ] Increase `RATE_LIMIT_PER_IP_DAY_REQUESTS`
- [ ] Monitor impact after adjustment

### If Rate Limits Are Too Lenient

- [ ] Decrease rate limit thresholds
- [ ] Monitor for abuse patterns
- [ ] Consider additional anti-spam measures

### If Performance Issues Arise

- [ ] Check Redis connection latency
- [ ] Monitor function execution time
- [ ] Consider increasing Redis resources
- [ ] Review rate limit algorithm efficiency

## Rollback Procedures

### Emergency Rollback

If critical issues occur:

1. **Disable Rate Limiting Immediately**
   ```bash
   # In Netlify Dashboard, set:
   RATE_LIMIT_ENABLED=false
   ```

2. **Verify Rollback**
   - [ ] Form submissions work normally
   - [ ] No rate limit errors in logs
   - [ ] System stable

3. **Investigate Issue**
   - [ ] Review logs for root cause
   - [ ] Test in development environment
   - [ ] Fix issue before re-enabling

### Planned Rollback

If rate limiting needs adjustment:

1. **Adjust Environment Variables**
   - [ ] Update rate limit thresholds in Netlify
   - [ ] Trigger new deployment
   - [ ] Verify changes take effect

2. **Monitor Impact**
   - [ ] Watch function logs
   - [ ] Check user feedback
   - [ ] Adjust further if needed

## Success Criteria

Rate limiting deployment is successful when:

### Functional Requirements
- [ ] Contact form submissions work normally
- [ ] Rate limits are enforced correctly
- [ ] Per-IP isolation works
- [ ] Rate limit errors are user-friendly

### Performance Requirements
- [ ] No significant performance degradation
- [ ] Response times remain acceptable
- [ ] Redis operations are fast

### Reliability Requirements
- [ ] No unexpected errors
- [ ] Fail-open strategy works (Redis unavailable)
- [ ] System remains stable under load

### Business Requirements
- [ ] Legitimate users can submit forms
- [ ] Spam/abuse is reduced
- [ ] User complaints are minimal

## Documentation Updates

After successful deployment:

- [ ] Update [`RATE_LIMITING_STATUS.md`](RATE_LIMITING_STATUS.md:1) with completion status
- [ ] Document any custom configurations
- [ ] Record final rate limit values
- [ ] Note any issues encountered and resolutions

## Next Steps

After successful verification:

1. **Set Up Monitoring**
   - [ ] Configure alerts for high error rates
   - [ ] Set up dashboards for key metrics
   - [ ] Schedule regular reviews

2. **Optimize Based on Data**
   - [ ] Analyze rate limit hit patterns
   - [ ] Adjust thresholds if needed
   - [ ] Consider time-of-day variations

3. **Plan Enhancements**
   - [ ] Consider additional rate limit tiers
   - [ ] Evaluate IP whitelisting for trusted users
   - [ ] Explore advanced rate limiting features

## Support Contacts

If issues arise:

1. **Netlify Support**: https://www.netlify.com/support/
2. **Upstash Support**: https://upstash.com/support
3. **Review Documentation**:
   - [`RATE_LIMITING_DEPLOYMENT_GUIDE.md`](RATE_LIMITING_DEPLOYMENT_GUIDE.md:1)
   - [`RATE_LIMITING_TESTING_GUIDE.md`](RATE_LIMITING_TESTING_GUIDE.md:1)

---

**Deployment Date:** 2026-02-22
**Status:** Ready for Verification
**Version:** 1.0.0
