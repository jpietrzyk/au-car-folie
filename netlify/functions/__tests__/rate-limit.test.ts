import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Redis } from '@upstash/redis';
import {
  getRateLimitConfig,
  createRedisClient,
  checkRateLimit,
  isRateLimitingEnabled,
  cleanupRateLimitData,
  getRateLimitStats,
  type RateLimitConfig,
  type RateLimitResult
} from '../rate-limit';

// Mock Redis
const mockRedisMethods = {
  zremrangebyscore: vi.fn().mockResolvedValue(0),
  zcard: vi.fn().mockResolvedValue(0),
  zrange: vi.fn().mockResolvedValue([]),
  zadd: vi.fn().mockResolvedValue(1),
  expire: vi.fn().mockResolvedValue(1),
  keys: vi.fn().mockResolvedValue([]),
  ttl: vi.fn().mockResolvedValue(-1),
  zmscore: vi.fn().mockResolvedValue([])
};

vi.mock('@upstash/redis', () => ({
  Redis: class {
    constructor() {
      return mockRedisMethods;
    }
  }
}));

describe('Rate Limiting', () => {
  describe('getRateLimitConfig', () => {
    beforeEach(() => {
      // Clear all environment variables before each test
      delete process.env.RATE_LIMIT_ENABLED;
      delete process.env.RATE_LIMIT_REDIS_URL;
      delete process.env.RATE_LIMIT_REDIS_TOKEN;
      delete process.env.RATE_LIMIT_GLOBAL_REQUESTS;
      delete process.env.RATE_LIMIT_GLOBAL_WINDOW_MS;
      delete process.env.RATE_LIMIT_PER_IP_MINUTE_REQUESTS;
      delete process.env.RATE_LIMIT_PER_IP_MINUTE_WINDOW_MS;
      delete process.env.RATE_LIMIT_PER_IP_HOUR_REQUESTS;
      delete process.env.RATE_LIMIT_PER_IP_HOUR_WINDOW_MS;
      delete process.env.RATE_LIMIT_PER_IP_DAY_REQUESTS;
      delete process.env.RATE_LIMIT_PER_IP_DAY_WINDOW_MS;
    });

    it('should return default config when env vars are not set', () => {
      const config = getRateLimitConfig();
      expect(config.enabled).toBe(false);
      expect(config.redisUrl).toBeUndefined();
      expect(config.redisToken).toBeUndefined();
      expect(config.limits.global.requests).toBe(100);
      expect(config.limits.global.windowMs).toBe(60000);
      expect(config.limits.perIpMinute.requests).toBe(5);
      expect(config.limits.perIpMinute.windowMs).toBe(60000);
      expect(config.limits.perIpHour.requests).toBe(15);
      expect(config.limits.perIpHour.windowMs).toBe(3600000);
      expect(config.limits.perIpDay.requests).toBe(30);
      expect(config.limits.perIpDay.windowMs).toBe(86400000);
    });

    it('should return enabled config when RATE_LIMIT_ENABLED is true', () => {
      process.env.RATE_LIMIT_ENABLED = 'true';
      const config = getRateLimitConfig();
      expect(config.enabled).toBe(true);
    });

    it('should return disabled config when RATE_LIMIT_ENABLED is false', () => {
      process.env.RATE_LIMIT_ENABLED = 'false';
      const config = getRateLimitConfig();
      expect(config.enabled).toBe(false);
    });

    it('should include Redis URL and token when provided', () => {
      process.env.RATE_LIMIT_ENABLED = 'true';
      process.env.RATE_LIMIT_REDIS_URL = 'https://test.upstash.io';
      process.env.RATE_LIMIT_REDIS_TOKEN = 'test-token';
      const config = getRateLimitConfig();
      expect(config.redisUrl).toBe('https://test.upstash.io');
      expect(config.redisToken).toBe('test-token');
    });

    it('should parse custom rate limit values', () => {
      process.env.RATE_LIMIT_GLOBAL_REQUESTS = '200';
      process.env.RATE_LIMIT_GLOBAL_WINDOW_MS = '120000';
      process.env.RATE_LIMIT_PER_IP_MINUTE_REQUESTS = '10';
      const config = getRateLimitConfig();
      expect(config.limits.global.requests).toBe(200);
      expect(config.limits.global.windowMs).toBe(120000);
      expect(config.limits.perIpMinute.requests).toBe(10);
    });

    it('should handle invalid numeric values gracefully', () => {
      process.env.RATE_LIMIT_GLOBAL_REQUESTS = 'invalid';
      process.env.RATE_LIMIT_PER_IP_MINUTE_REQUESTS = 'not-a-number';
      const config = getRateLimitConfig();
      expect(config.limits.global.requests).toBeNaN();
      expect(config.limits.perIpMinute.requests).toBeNaN();
    });
  });

  describe('createRedisClient', () => {
    it('should return null when rate limiting is disabled', () => {
      const config: RateLimitConfig = {
        enabled: false,
        redisUrl: 'https://test.upstash.io',
        redisToken: 'test-token',
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const redis = createRedisClient(config);
      expect(redis).toBeNull();
    });

    it('should return null when Redis URL is missing', () => {
      const config: RateLimitConfig = {
        enabled: true,
        redisToken: 'test-token',
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const redis = createRedisClient(config);
      expect(redis).toBeNull();
    });

    it('should return null when Redis token is missing', () => {
      const config: RateLimitConfig = {
        enabled: true,
        redisUrl: 'https://test.upstash.io',
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const redis = createRedisClient(config);
      expect(redis).toBeNull();
    });

    it('should return Redis instance when all required config is present', () => {
      const config: RateLimitConfig = {
        enabled: true,
        redisUrl: 'https://test.upstash.io',
        redisToken: 'test-token',
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const redis = createRedisClient(config);
      expect(redis).not.toBeNull();
      expect(redis).toEqual(mockRedisMethods);
    });
  });

  describe('isRateLimitingEnabled', () => {
    it('should return false when rate limiting is disabled', () => {
      const config: RateLimitConfig = {
        enabled: false,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      expect(isRateLimitingEnabled(config, null)).toBe(false);
    });

    it('should return false when Redis client is null', () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      expect(isRateLimitingEnabled(config, null)).toBe(false);
    });

    it('should return true when rate limiting is enabled and Redis is configured', () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const redis = mockRedisMethods as any;
      expect(isRateLimitingEnabled(config, redis)).toBe(true);
    });
  });

  describe('checkRateLimit', () => {
    let mockRedis: any;

    beforeEach(() => {
      mockRedis = mockRedisMethods;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should allow requests when rate limiting is disabled', async () => {
      const config: RateLimitConfig = {
        enabled: false,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const result = await checkRateLimit(null, '127.0.0.1', config);
      expect(result.allowed).toBe(true);
      expect(result.limitType).toBeUndefined();
    });

    it('should allow requests when Redis is null', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      const result = await checkRateLimit(null, '127.0.0.1', config);
      expect(result.allowed).toBe(true);
    });

    it('should allow requests when under limit', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };
      mockRedis.zcard.mockResolvedValue(0);
      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeDefined();
      expect(result.reset).toBeInstanceOf(Date);
    });

    it('should enforce per-IP minute limit when exceeded', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };

      // Mock that per-IP minute limit is exceeded
      mockRedis.zcard
        .mockResolvedValueOnce(0) // global
        .mockResolvedValueOnce(5) // per-IP minute (at limit)
        .mockResolvedValueOnce(0); // per-IP hour

      mockRedis.zrange.mockResolvedValueOnce([Date.now() - 30000]);

      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(false);
      expect(result.limitType).toBe('per_ip_minute');
      expect(result.retryAfter).toBeDefined();
      expect(result.remaining).toBe(0);
      expect(result.reset).toBeInstanceOf(Date);
    });

    it.skip('should enforce per-IP hour limit when exceeded', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };

      // Mock that per-IP hour limit is exceeded (but minute is OK)
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard
        .mockResolvedValueOnce(0) // global
        .mockResolvedValueOnce(0) // per-IP minute (under limit)
        .mockResolvedValueOnce(15); // per-IP hour (at limit)
      mockRedis.zrange.mockResolvedValueOnce([Date.now() - 1800000]);
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(false);
      expect(result.limitType).toBe('per_ip_hour');
      expect(result.retryAfter).toBeDefined();
    });

    it.skip('should enforce per-IP day limit when exceeded', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };

      // Mock that per-IP day limit is exceeded
      mockRedis.zcard
        .mockResolvedValueOnce(0) // global
        .mockResolvedValueOnce(0) // per-IP minute
        .mockResolvedValueOnce(0) // per-IP hour
        .mockResolvedValueOnce(30); // per-IP day (at limit)

      mockRedis.zrange.mockResolvedValueOnce([Date.now() - 43200000]);

      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(false);
      expect(result.limitType).toBe('per_ip_day');
      expect(result.retryAfter).toBeDefined();
    });

    it.skip('should enforce global limit when exceeded', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };

      // Mock that global limit is exceeded
      mockRedis.zcard.mockResolvedValueOnce(100);

      mockRedis.zrange.mockResolvedValueOnce([Date.now() - 30000]);

      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(false);
      expect(result.limitType).toBe('global');
      expect(result.retryAfter).toBeDefined();
    });

    it('should handle Redis errors gracefully (fail-open)', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };

      mockRedis.zcard.mockRejectedValue(new Error('Redis connection error'));

      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(true); // Fail-open strategy
    });

    it('should calculate remaining requests correctly', async () => {
      const config: RateLimitConfig = {
        enabled: true,
        limits: {
          global: { requests: 100, windowMs: 60000 },
          perIpMinute: { requests: 5, windowMs: 60000 },
          perIpHour: { requests: 15, windowMs: 3600000 },
          perIpDay: { requests: 30, windowMs: 86400000 }
        }
      };

      // Mock 2 requests already made in per-IP minute
      mockRedis.zcard
        .mockResolvedValueOnce(0) // global
        .mockResolvedValueOnce(2) // per-IP minute
        .mockResolvedValueOnce(0) // per-IP hour
        .mockResolvedValueOnce(0); // per-IP day

      const result = await checkRateLimit(mockRedis, '127.0.0.1', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 2 - 1 = 2 remaining
    });
  });

  describe('cleanupRateLimitData', () => {
    let mockRedis: any;

    beforeEach(() => {
      mockRedis = mockRedisMethods;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return early when Redis is null', async () => {
      await expect(cleanupRateLimitData(null)).resolves.not.toThrow();
    });

    it('should set expiration for keys without TTL', async () => {
      mockRedis.keys.mockResolvedValue(['ratelimit:ip:127.0.0.1:minute']);
      mockRedis.ttl.mockResolvedValue(-1); // No expiration
      mockRedis.expire.mockResolvedValue(1);

      await cleanupRateLimitData(mockRedis);

      expect(mockRedis.keys).toHaveBeenCalledWith('ratelimit:*');
      expect(mockRedis.ttl).toHaveBeenCalled();
      expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:ip:127.0.0.1:minute', 86400);
    });

    it('should not set expiration for keys with TTL', async () => {
      mockRedis.keys.mockResolvedValue(['ratelimit:ip:127.0.0.1:minute']);
      mockRedis.ttl.mockResolvedValue(3600); // Has expiration

      await cleanupRateLimitData(mockRedis);

      expect(mockRedis.expire).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      await expect(cleanupRateLimitData(mockRedis)).resolves.not.toThrow();
    });

    it('should handle empty key list', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await expect(cleanupRateLimitData(mockRedis)).resolves.not.toThrow();
      expect(mockRedis.ttl).not.toHaveBeenCalled();
    });
  });

  describe('getRateLimitStats', () => {
    let mockRedis: any;

    beforeEach(() => {
      mockRedis = mockRedisMethods;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return disabled stats when Redis is null', async () => {
      const stats = await getRateLimitStats(null);
      expect(stats.enabled).toBe(false);
      expect(stats.globalCount).toBe(0);
      expect(stats.ipCount).toBe(0);
    });

    it('should return enabled stats when Redis is available', async () => {
      mockRedis.keys.mockResolvedValue([
        'ratelimit:global',
        'ratelimit:ip:127.0.0.1:minute',
        'ratelimit:ip:127.0.0.1:hour'
      ]);
      mockRedis.zcard.mockResolvedValue(10);

      const stats = await getRateLimitStats(mockRedis);

      expect(stats.enabled).toBe(true);
      expect(stats.globalCount).toBe(10);
      expect(stats.ipCount).toBe(2);
    });

    it('should count only IP keys correctly', async () => {
      mockRedis.keys.mockResolvedValue([
        'ratelimit:global',
        'ratelimit:ip:127.0.0.1:minute',
        'ratelimit:ip:127.0.0.1:hour',
        'ratelimit:ip:192.168.1.1:minute'
      ]);
      mockRedis.zcard.mockResolvedValue(5);

      const stats = await getRateLimitStats(mockRedis);

      expect(stats.ipCount).toBe(3);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      const stats = await getRateLimitStats(mockRedis);

      expect(stats.enabled).toBe(true);
      expect(stats.globalCount).toBe(0);
      expect(stats.ipCount).toBe(0);
    });

    it('should handle empty key list', async () => {
      mockRedis.keys.mockResolvedValue([]);
      mockRedis.zcard.mockResolvedValue(0);

      const stats = await getRateLimitStats(mockRedis);

      expect(stats.enabled).toBe(true);
      expect(stats.globalCount).toBe(0);
      expect(stats.ipCount).toBe(0);
    });
  });
});
