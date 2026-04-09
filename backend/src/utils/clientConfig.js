const DEV_FRONTEND_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

const normalizeUrl = (value = '') => value.trim().replace(/\/+$/, '');

const parseUrlList = (...values) =>
  [...new Set(
    values
      .flatMap((value) => String(value || '').split(','))
      .map(normalizeUrl)
      .filter(Boolean)
  )];

const getAllowedOrigins = () =>
  parseUrlList(
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_ALT,
    process.env.FRONTEND_URLS,
    ...DEV_FRONTEND_ORIGINS
  );

const getPrimaryFrontendUrl = () =>
  getAllowedOrigins().find((origin) => !DEV_FRONTEND_ORIGINS.includes(origin)) ||
  normalizeUrl(process.env.FRONTEND_URL) ||
  DEV_FRONTEND_ORIGINS[0];

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
};

export { getAllowedOrigins, getPrimaryFrontendUrl, getAuthCookieOptions };
