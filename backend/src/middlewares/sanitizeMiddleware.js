const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Object.prototype.toString.call(value) === '[object Object]';

const isUnsafeKey = (key) =>
  RESERVED_KEYS.has(key) || key.startsWith('$') || key.includes('.');

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
    if (isUnsafeKey(key)) {
      return accumulator;
    }

    accumulator[key] = sanitizeValue(nestedValue);
    return accumulator;
  }, {});
};

const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};

export { sanitizeRequest };
