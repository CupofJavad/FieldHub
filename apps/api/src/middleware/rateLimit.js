/**
 * M4.4 – In-memory rate limit by IP. Config: RATE_LIMIT_WINDOW_MS (default 60000), RATE_LIMIT_MAX (default 100).
 */
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

const hits = new Map();

function rateLimitByIp(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = hits.get(ip);
  if (!bucket) {
    bucket = { count: 0, resetAt: now + windowMs };
    hits.set(ip, bucket);
  }
  if (now >= bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count++;
  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - bucket.count));
  if (bucket.count > max) {
    return res.status(429).json({ error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED' });
  }
  next();
}

module.exports = { rateLimitByIp };
