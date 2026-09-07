import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { success, AppError } from '../utils/response.js';
const dummyHash = bcrypt.hashSync('dummy-password-for-timing', 12);

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(req, res) {
  const { name, email, password } = req.validated.body;
  const adminCount = await User.countAdmins();
  if (adminCount > 0 && !env.ALLOW_ADMIN_REGISTRATION) throw new AppError('Registration is disabled', 403);
  if (await User.findByEmail(email)) throw new AppError('Email is already registered', 409);
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  return success(res, publicUser(user), 'Account registered', 201);
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findByEmail(email);
  const matches = await bcrypt.compare(password, user?.password_hash || dummyHash);
  if (!user || !matches || !user.active || user.role !== 'admin') throw new AppError('Invalid email or password', 401);
  const token = jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256', subject: String(user.id), expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'smiley-api', audience: 'smiley-admin',
  });
  res.set('Cache-Control', 'no-store');
  return success(res, { token, tokenType: 'Bearer', user: publicUser(user) });
}
export function me(req, res) { return success(res, req.user); }
