import crypto from 'crypto';
import { getCsrfCookieOptions } from './clientConfig.js';

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
};

const issueCsrfToken = (req, res) => {
  const token = req.cookies?.[CSRF_COOKIE_NAME] || generateCsrfToken();
  setCsrfCookie(res, token);
  return token;
};

const clearCsrfCookie = (res) => {
  res.cookie(CSRF_COOKIE_NAME, '', {
    ...getCsrfCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
};

export {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCsrfToken,
  setCsrfCookie,
  issueCsrfToken,
  clearCsrfCookie,
};
