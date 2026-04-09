import jwt from 'jsonwebtoken';
import { getAuthCookieOptions } from './clientConfig.js';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  // Set JWT as HTTP-Only Cookie
  res.cookie('jwt', token, getAuthCookieOptions());

  return token;
};

export default generateToken;
