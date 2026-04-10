import { getAllowedOrigins } from '../utils/clientConfig.js';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../utils/csrf.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const isTrustedOrigin = (req) => {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.get('origin');

  if (origin) {
    return allowedOrigins.includes(origin);
  }

  const referer = req.get('referer');
  if (!referer) {
    return true; // Non-browser clients may not send Origin/Referer.
  }

  try {
    const refererOrigin = new URL(referer).origin;
    return allowedOrigins.includes(refererOrigin);
  } catch (error) {
    return false;
  }
};

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (!isTrustedOrigin(req)) {
    res.status(403);
    throw new Error('Invalid request origin');
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403);
    throw new Error('Invalid CSRF token');
  }

  return next();
};

export { csrfProtection };
