/**
 * Rate Limiter Middleware
 * 
 * Simple in-memory rate limiter for API protection.
 * In production, use Redis for distributed rate limiting.
 */

import { Context, Next } from 'hono';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (c: Context) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Create rate limiter middleware
 */
export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;
  
  // Default key generator uses IP + user ID if available
  const keyGenerator = config.keyGenerator || ((c: Context) => {
    const ip = c.req.header('x-forwarded-for') || 
               c.req.header('x-real-ip') || 
               'unknown';
    const userId = c.get('user')?.id || 'anonymous';
    return `${ip}:${userId}`;
  });

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Reset if window has expired
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

    // Check if rate limited
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', retryAfter.toString());
      
      return c.json({
        error: 'Too many requests',
        retryAfter,
      }, 429);
    }

    await next();
  };
}

/**
 * Stricter rate limiter for AI-intensive endpoints
 */
export const aiRateLimiter = rateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20,
});

/**
 * Lenient rate limiter for general endpoints
 */
export const generalRateLimiter = rateLimiter({
  windowMs: 60000,
  maxRequests: 100,
});
