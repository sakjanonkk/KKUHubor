/**
 * Simple in-memory rate limiter using sliding window.
 * Tracks requests per IP per route pattern.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 3600_000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Rate limit rules per API path pattern
const RATE_LIMIT_RULES: {
  pattern: RegExp;
  config: RateLimitConfig;
  methods?: string[];
}[] = [
  // Login: 5 requests per 15 minutes
  {
    pattern: /^\/api\/auth\/login$/,
    config: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  },
  // Reviews POST: 20 per hour
  {
    pattern: /^\/api\/reviews$/,
    config: { maxRequests: 200, windowMs: 60 * 60 * 1000 },
    methods: ["POST"],
  },
  // Comments POST: 20 per hour
  {
    pattern: /^\/api\/comments$/,
    config: { maxRequests: 100, windowMs: 60 * 60 * 1000 },
    methods: ["POST"],
  },
  // Likes: 60 per minute
  {
    pattern: /^\/api\/likes$/,
    config: { maxRequests: 1000, windowMs: 60 * 1000 },
  },
  // Search: 30 per minute
  {
    pattern: /^\/api\/search$/,
    config: { maxRequests: 100, windowMs: 60 * 1000 },
  },
  // Reports: 10 per hour
  {
    pattern: /^\/api\/reports$/,
    config: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
    methods: ["POST"],
  },
  // File uploads: 10 per hour
  {
    pattern: /^\/api\/summaries$/,
    config: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
    methods: ["POST"],
  },
  // Tag requests: 10 per hour
  {
    pattern: /^\/api\/tags$/,
    config: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
    methods: ["POST"],
  },
  // Course requests: 5 per hour
  {
    pattern: /^\/api\/requests$/,
    config: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
    methods: ["POST"],
  },
  // Comments PUT: 20 per hour
  {
    pattern: /^\/api\/comments$/,
    config: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
    methods: ["PUT"],
  },
  // Comments DELETE: 10 per hour
  {
    pattern: /^\/api\/comments$/,
    config: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
    methods: ["DELETE"],
  },
  // Helpfulness votes: 60 per minute
  {
    pattern: /^\/api\/helpfulness$/,
    config: { maxRequests: 60, windowMs: 60 * 1000 },
  },
  // Reactions: 60 per minute
  {
    pattern: /^\/api\/reactions$/,
    config: { maxRequests: 60, windowMs: 60 * 1000 },
    methods: ["POST"],
  },
];

// Default: 60 requests per minute for any unmatched API route
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60 * 1000,
};

export function getRateLimitConfig(
  pathname: string,
  method: string,
): RateLimitConfig {
  for (const rule of RATE_LIMIT_RULES) {
    if (rule.pattern.test(pathname)) {
      if (!rule.methods || rule.methods.includes(method.toUpperCase())) {
        return rule.config;
      }
    }
  }
  return DEFAULT_CONFIG;
}

/**
 * Check if a request should be rate limited.
 * Returns { limited: false } if allowed, or { limited: true, retryAfter } if blocked.
 */
export function checkRateLimit(
  ip: string,
  pathname: string,
  method: string,
): { limited: boolean; retryAfter?: number } {
  const config = getRateLimitConfig(pathname, method);
  const key = `${ip}:${pathname}:${method}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil(
      (oldestInWindow + config.windowMs - now) / 1000,
    );
    return { limited: true, retryAfter };
  }

  entry.timestamps.push(now);
  return { limited: false };
}
