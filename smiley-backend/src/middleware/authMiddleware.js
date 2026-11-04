import jwt from 'jsonwebtoken';
import { hasKioskAccess, menuPermissionKeys, normalizePermissions } from '../config/menuPermissions.js';
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
  const permissions = user.role === 'admin' ? menuPermissionKeys : await User.listPermissions(user.id);
  return { id: user.id, name: user.name, email: user.email, role: user.role, permissions: normalizePermissions(user.role, permissions) };
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

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    if (req.user.role === 'admin') return next();
    if (req.user.permissions?.includes(permission)) return next();
    throw new AppError('You do not have access to this menu', 403);
  };
}

export async function authMiddleware(req, res, next) {
  req.user = await authenticate(req);
  res.set('Cache-Control', 'no-store');
  return requireRole('admin')(req, res, next);
}

export async function requireKioskAuth(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!match) throw new AppError('Authentication required', 401);
  let payload;
  try {
    payload = jwt.verify(match[1], env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'smiley-api', audience: 'smiley-kiosk' });
  } catch {
    throw new AppError('Invalid or expired access token', 401);
  }
  if (!payload.sub || !/^\d+$/.test(payload.sub)) throw new AppError('Invalid access token', 401);
  const user = await User.findById(Number(payload.sub));
  if (!user || !user.active) throw new AppError('Account unavailable', 401);
  const permissions = user.role === 'admin' ? [] : await User.listPermissions(user.id);
  const normalized = { id: user.id, name: user.name, email: user.email, role: user.role, permissions: normalizePermissions(user.role, permissions) };
  if (!hasKioskAccess(normalized)) throw new AppError('Kiosk setup access required', 403);
  req.kioskUser = normalized;
  res.set('Cache-Control', 'no-store');
  next();
}
