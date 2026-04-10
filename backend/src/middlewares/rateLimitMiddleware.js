const getClientIdentifier = (req) => {
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const createRateLimiter = ({
  maxRequests,
  windowMs,
  message = 'Too many requests. Please try again later.',
} = {}) => {
  const safeWindowMs = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 15 * 60 * 1000;
  const safeMaxRequests = Number.isFinite(maxRequests) && maxRequests > 0 ? maxRequests : 100;
  const requestBuckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const identifier = `${getClientIdentifier(req)}:${req.path}`;
    const bucket = requestBuckets.get(identifier) || [];
    const validWindow = bucket.filter((timestamp) => now - timestamp < safeWindowMs);

    if (validWindow.length >= safeMaxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((safeWindowMs - (now - validWindow[0])) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      res.status(429).json({ message });
      return;
    }

    validWindow.push(now);
    requestBuckets.set(identifier, validWindow);

    if (requestBuckets.size > 1000) {
      for (const [key, timestamps] of requestBuckets.entries()) {
        const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < safeWindowMs);
        if (recentTimestamps.length === 0) {
          requestBuckets.delete(key);
        } else {
          requestBuckets.set(key, recentTimestamps);
        }
      }
    }

    next();
  };
};

export { createRateLimiter };
