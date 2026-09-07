import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/response.js';

async function authenticate(req) {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!match) throw new AppError('Authentication required', 401);
  let payload;
  try {
    payload = jwt.verify(match[1], env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'smiley-api', audience: 'smiley-admin' });
  } catch {
    throw new AppError('Invalid or expired access token', 401);
  }
  if (!payload.sub || !/^\d+$/.test(payload.sub)) throw new AppError('Invalid access token', 401);
  const user = await User.findById(Number(payload.sub));
  if (!user || !user.active) throw new AppError('Account unavailable', 401);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireAuth(req, res, next) {
  req.user = await authenticate(req);
  res.set('Cache-Control', 'no-store');
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    if (!roles.includes(req.user.role)) throw new AppError('Administrator access required', 403);
    next();
  };
}

export async function authMiddleware(req, res, next) {
  req.user = await authenticate(req);
  res.set('Cache-Control', 'no-store');
  return requireRole('admin')(req, res, next);
}
