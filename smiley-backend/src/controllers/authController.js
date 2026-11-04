import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { normalizePermissions } from '../config/menuPermissions.js';
import { User } from '../models/User.js';
import { buildAuthorizationUrl, handleSsoCallback, ssoConfig } from '../services/ssoService.js';
import { success, AppError } from '../utils/response.js';
const dummyHash = bcrypt.hashSync('dummy-password-for-timing', 12);

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    provider: user.provider,
    permissions: normalizePermissions(user.role, user.permissions || []),
  };
}

function signAdminToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256', subject: String(user.id), expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'smiley-api', audience: 'smiley-admin',
  });
}

export async function register(req, res) {
  const { name, email, password } = req.validated.body;
  const adminCount = await User.countAdmins();
  if (adminCount > 0 && !env.ALLOW_ADMIN_REGISTRATION) throw new AppError('Registration is disabled', 403);
  if (await User.findByEmail(email)) throw new AppError('Email is already registered', 409);
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', status: 'active', provider: 'local' });
  return success(res, publicUser(user), 'Account registered', 201);
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findByEmail(email);
  const matches = await bcrypt.compare(password, user?.password_hash || dummyHash);
  if (!user || !matches || !user.active || user.role !== 'admin') throw new AppError('Invalid email or password', 401);
  await User.touchLogin(user.id);
  const token = signAdminToken(user);
  res.set('Cache-Control', 'no-store');
  return success(res, { token, tokenType: 'Bearer', user: publicUser(user) });
}

export function me(req, res) { return success(res, req.user); }

export function getSsoConfig(req, res) {
  return success(res, ssoConfig());
}

export function startSso(req, res) {
  res.set('Cache-Control', 'no-store');
  return res.redirect(buildAuthorizationUrl(req.query.returnTo, req.query.origin));
}

export async function completeSso(req, res) {
  res.set('Cache-Control', 'no-store');
  const result = await handleSsoCallback({ code: req.query.code, state: req.query.state });
  return res.redirect(result.redirectUrl);
}

export function kioskMe(req, res) {
  return success(res, req.kioskUser);
}

export async function listUsers(req, res) {
  return success(res, (await User.list()).map(publicUser));
}

export async function updateUserAccess(req, res) {
  const { id } = req.validated.params;
  if (!await User.findById(id)) throw new AppError('User not found', 404);
  if (Number(id) === req.user.id && (req.validated.body.status !== 'active' || req.validated.body.role !== 'admin')) {
    throw new AppError('You cannot remove your own administrator access', 400);
  }
  const user = await User.updateAccess(id, req.validated.body);
  return success(res, publicUser(user), 'User access updated');
}
