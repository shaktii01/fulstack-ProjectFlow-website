import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const baseUrl = rawBaseUrl.replace(/\/$/, '');
const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const SAFE_METHODS = new Set(['get', 'head', 'options']);

let csrfBootstrapPromise = null;
let memoryCsrfToken = null;

const readCookie = (name) => {
  if (typeof document === 'undefined') return '';

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  if (!cookie) return '';
  return decodeURIComponent(cookie.split('=').slice(1).join('='));
};

const fetchCsrfToken = async () => {
  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = httpClient
      .get('/auth/csrf-token')
      .then((response) => {
        if (response.data && response.data.csrfToken) {
          memoryCsrfToken = response.data.csrfToken;
        }
      })
      .finally(() => {
        csrfBootstrapPromise = null;
      });
  }

  await csrfBootstrapPromise;
};

export const ensureCsrfToken = async () => {
  const token = readCookie(CSRF_COOKIE_NAME) || memoryCsrfToken;
  if (token) return token;

  await fetchCsrfToken();
  return memoryCsrfToken || readCookie(CSRF_COOKIE_NAME);
};

httpClient.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();

  if (!SAFE_METHODS.has(method)) {
    const csrfToken = await ensureCsrfToken();
    if (!csrfToken) {
      throw new Error('Unable to establish CSRF token');
    }

    config.headers = config.headers || {};
    config.headers[CSRF_HEADER_NAME] = csrfToken;
  }

  return config;
});

httpClient.interceptors.response.use((response) => {
  if (response.data && response.data.csrfToken) {
    memoryCsrfToken = response.data.csrfToken;
  }
  return response;
});

export default httpClient;
