const DEV_FRONTEND_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const normalizeUrl = (value = '') => value.trim().replace(/\/+$/, '');

const parseUrlList = (...values) =>
  [...new Set(
    values
      .flatMap((value) => String(value || '').split(','))
      .map(normalizeUrl)
      .filter(Boolean)
  )];

const getAllowedOrigins = () => {
  const configuredOrigins = parseUrlList(
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_ALT,
    process.env.FRONTEND_URLS
  );

  if (process.env.NODE_ENV !== 'production') {
    return [...new Set([...configuredOrigins, ...DEV_FRONTEND_ORIGINS])];
  }

  return configuredOrigins;
};

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

const getCsrfCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  };
};

export { getAllowedOrigins, getPrimaryFrontendUrl, getAuthCookieOptions, getCsrfCookieOptions };
