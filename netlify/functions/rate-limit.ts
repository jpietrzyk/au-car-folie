import { Redis } from '@upstash/redis';

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
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

/**
 * Rate Limit Check Result
 */
export interface RateLimitResult {
  allowed: boolean;
  limitType?: string;
  retryAfter?: number;
  remaining?: number;
  reset?: Date;
}

/**
 * Get rate limiting configuration from environment variables
 */
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

/**
 * Create Redis client for rate limiting
 */
export function createRedisClient(config: RateLimitConfig): Redis | null {
  if (!config.enabled || !config.redisUrl || !config.redisToken) {
    return null;
  }

  return new Redis({
    url: config.redisUrl,
    token: config.redisToken
  });
}

/**
 * Check sliding window limit
 * Uses Redis sorted sets to track request timestamps
 */
async function checkSlidingWindowLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
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
    await redis.zadd(key, { score: now, member: now.toString() });

    // Set expiration to window size
    await redis.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: limit - count - 1,
      reset: new Date(now + windowMs)
    };
  } catch (error) {
    console.error('Error checking sliding window limit:', error);
    // On error, allow the request (fail-open)
    return {
      allowed: true,
      remaining: limit - 1,
      reset: new Date(now + windowMs)
    };
  }
}

/**
 * Check if rate limiting is enabled and Redis is configured
 */
export function isRateLimitingEnabled(config: RateLimitConfig, redis: Redis | null): boolean {
  return config.enabled && redis !== null;
}

/**
 * Check rate limits for a given IP address
 * Checks all limit tiers (global, per-ip minute, per-ip hour, per-ip day)
 */
export async function checkRateLimit(
  redis: Redis | null,
  ipAddress: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // If rate limiting is disabled or Redis is not configured, allow all requests
  if (!isRateLimitingEnabled(config, redis)) {
    console.info('rate_limit_disabled', { ipAddress });
    return { allowed: true };
  }

  // At this point, redis is guaranteed to be non-null due to the check above
  const redisClient = redis!;
  const timestamp = Date.now();

  try {
    // Check global limit
    const globalResult = await checkSlidingWindowLimit(
      redisClient,
      'ratelimit:global',
      config.limits.global.requests,
      config.limits.global.windowMs
    );

    if (!globalResult.allowed) {
      console.warn('rate_limit_exceeded', {
        ipAddress,
        limitType: 'global',
        retryAfter: Math.ceil((globalResult.reset.getTime() - timestamp) / 1000)
      });

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
      redisClient,
      `ratelimit:ip:${ipAddress}:minute`,
      config.limits.perIpMinute.requests,
      config.limits.perIpMinute.windowMs
    );

    if (!minuteResult.allowed) {
      console.warn('rate_limit_exceeded', {
        ipAddress,
        limitType: 'per_ip_minute',
        retryAfter: Math.ceil((minuteResult.reset.getTime() - timestamp) / 1000)
      });

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
      redisClient,
      `ratelimit:ip:${ipAddress}:hour`,
      config.limits.perIpHour.requests,
      config.limits.perIpHour.windowMs
    );

    if (!hourResult.allowed) {
      console.warn('rate_limit_exceeded', {
        ipAddress,
        limitType: 'per_ip_hour',
        retryAfter: Math.ceil((hourResult.reset.getTime() - timestamp) / 1000)
      });

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
      redisClient,
      `ratelimit:ip:${ipAddress}:day`,
      config.limits.perIpDay.requests,
      config.limits.perIpDay.windowMs
    );

    if (!dayResult.allowed) {
      console.warn('rate_limit_exceeded', {
        ipAddress,
        limitType: 'per_ip_day',
        retryAfter: Math.ceil((dayResult.reset.getTime() - timestamp) / 1000)
      });

      return {
        allowed: false,
        limitType: 'per_ip_day',
        retryAfter: Math.ceil((dayResult.reset.getTime() - timestamp) / 1000),
        remaining: 0,
        reset: dayResult.reset
      };
    }

    // All checks passed
    const remaining = Math.min(
      minuteResult.remaining,
      hourResult.remaining,
      dayResult.remaining
    );

    console.info('rate_limit_check_passed', {
      ipAddress,
      remaining,
      reset: minuteResult.reset
    });

    return {
      allowed: true,
      remaining,
      reset: minuteResult.reset
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow the request (fail-open)
    return { allowed: true };
  }
}

/**
 * Clean up old rate limit data
 * This can be run periodically via a scheduled function
 */
export async function cleanupRateLimitData(redis: Redis | null): Promise<void> {
  if (!redis) {
    console.warn('Cannot cleanup rate limit data: Redis client is null');
    return;
  }

  try {
    const keys = await redis.keys('ratelimit:*');
    console.info(`Found ${keys.length} rate limit keys to check`);

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // Key has no expiration, set one
        await redis.expire(key, 86400); // 1 day
        console.info(`Set expiration for key: ${key}`);
      }
    }

    console.info('Rate limit data cleanup completed');
  } catch (error) {
    console.error('Error cleaning up rate limit data:', error);
  }
}

/**
 * Get rate limit statistics for monitoring
 */
export async function getRateLimitStats(redis: Redis | null): Promise<{
  enabled: boolean;
  globalCount: number;
  ipCount: number;
}> {
  if (!redis) {
    return {
      enabled: false,
      globalCount: 0,
      ipCount: 0
    };
  }

  try {
    const keys = await redis.keys('ratelimit:*');
    const globalCount = await redis.zcard('ratelimit:global');
    const ipCount = keys.filter((k: string) => k.startsWith('ratelimit:ip:')).length;

    return {
      enabled: true,
      globalCount,
      ipCount
    };
  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    return {
      enabled: true,
      globalCount: 0,
      ipCount: 0
    };
  }
}
