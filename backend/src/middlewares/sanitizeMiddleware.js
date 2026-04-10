const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Object.prototype.toString.call(value) === '[object Object]';

const isUnsafeKey = (key) =>
  RESERVED_KEYS.has(key) || key.startsWith('$') || key.includes('.');

const sanitizeInPlace = (value) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      sanitizeInPlace(item);
    }
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (isUnsafeKey(key)) {
      delete value[key];
      continue;
    }

    sanitizeInPlace(nestedValue);
  }
};

const sanitizeRequest = (req, res, next) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.query);
  sanitizeInPlace(req.params);
  next();
};

export { sanitizeRequest };
