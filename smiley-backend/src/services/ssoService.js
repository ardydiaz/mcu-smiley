import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { hasKioskAccess, normalizePermissions } from '../config/menuPermissions.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/response.js';

const stateExpiresIn = '10m';

function frontendUrl() {
  return env.FRONTEND_URL || env.CORS_ORIGIN;
}

function resolvedSsoConfig() {
  const usesAzure = Boolean(env.AZURE_TENANT_ID || env.AZURE_CLIENT_ID || env.AZURE_CLIENT_SECRET || env.AZURE_REDIRECT_URI);
  const prefersAzure = usesAzure && !env.SSO_AUTHORIZATION_URL && !env.SSO_TOKEN_URL;
  const azureTenantBaseUrl = env.AZURE_TENANT_ID
    ? `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0`
    : '';

  return {
    enabled: env.SSO_ENABLED,
    providerName: usesAzure && env.SSO_PROVIDER_NAME === 'SSO' ? 'Microsoft' : env.SSO_PROVIDER_NAME,
    authorizationUrl: prefersAzure && azureTenantBaseUrl ? `${azureTenantBaseUrl}/authorize` : (env.SSO_AUTHORIZATION_URL || (azureTenantBaseUrl ? `${azureTenantBaseUrl}/authorize` : '')),
    tokenUrl: prefersAzure && azureTenantBaseUrl ? `${azureTenantBaseUrl}/token` : (env.SSO_TOKEN_URL || (azureTenantBaseUrl ? `${azureTenantBaseUrl}/token` : '')),
    userinfoUrl: prefersAzure ? 'https://graph.microsoft.com/oidc/userinfo' : (env.SSO_USERINFO_URL || (usesAzure ? 'https://graph.microsoft.com/oidc/userinfo' : '')),
    clientId: prefersAzure ? (env.AZURE_CLIENT_ID || env.SSO_CLIENT_ID) : (env.SSO_CLIENT_ID || env.AZURE_CLIENT_ID),
    clientSecret: prefersAzure ? (env.AZURE_CLIENT_SECRET || env.SSO_CLIENT_SECRET) : (env.SSO_CLIENT_SECRET || env.AZURE_CLIENT_SECRET),
    redirectUri: prefersAzure ? (env.AZURE_REDIRECT_URI || env.SSO_REDIRECT_URI) : (env.SSO_REDIRECT_URI || env.AZURE_REDIRECT_URI),
    scopes: env.SSO_SCOPES || 'openid email profile',
  };
}

export function ssoConfig() {
  const config = resolvedSsoConfig();
  return {
    enabled: config.enabled,
    providerName: config.providerName,
  };
}

function requireSsoConfig() {
  const config = resolvedSsoConfig();
  if (!config.enabled) throw new AppError('SSO login is not enabled', 404);
  const required = {
    authorizationUrl: 'SSO_AUTHORIZATION_URL or AZURE_TENANT_ID',
    tokenUrl: 'SSO_TOKEN_URL or AZURE_TENANT_ID',
    userinfoUrl: 'SSO_USERINFO_URL or AZURE_TENANT_ID',
    clientId: 'SSO_CLIENT_ID or AZURE_CLIENT_ID',
    clientSecret: 'SSO_CLIENT_SECRET or AZURE_CLIENT_SECRET',
    redirectUri: 'SSO_REDIRECT_URI or AZURE_REDIRECT_URI',
  };
  const missing = Object.entries(required)
    .filter(([key]) => !config[key])
    .map(([, label]) => label);
  if (missing.length) throw new AppError('SSO is not configured: ' + missing.join(', '), 503);
  return config;
}

function safeReturnTo(returnTo, origin) {
  if (origin === 'kiosk') {
    return typeof returnTo === 'string' && returnTo.startsWith('/kiosk') ? returnTo : '/kiosk/setup';
  }
  return typeof returnTo === 'string' && returnTo.startsWith('/admin') ? returnTo : '/admin/dashboard';
}

export function buildAuthorizationUrl(returnTo, origin) {
  const config = requireSsoConfig();
  const normalizedOrigin = origin === 'kiosk' ? 'kiosk' : 'admin';
  const state = jwt.sign({
    nonce: crypto.randomBytes(16).toString('hex'),
    origin: normalizedOrigin,
    returnTo: safeReturnTo(returnTo, normalizedOrigin),
  }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: stateExpiresIn,
    issuer: 'smiley-api',
    audience: 'smiley-sso',
  });
  const url = new URL(config.authorizationUrl);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scopes);
  url.searchParams.set('state', state);
  return url.toString();
}

function verifyState(state) {
  try {
    return jwt.verify(state, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'smiley-api',
      audience: 'smiley-sso',
    });
  } catch {
    throw new AppError('Invalid or expired SSO state', 400);
  }
}

async function exchangeCode(code, config) {
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new AppError('Unable to verify SSO login', 401);
  return payload;
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return {};
  const [, payload] = token.split('.');
  if (!payload) return {};
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

function firstString(...values) {
  return values.find(value => typeof value === 'string' && value.trim()) || '';
}

async function fetchProfile(accessToken, config, idToken) {
  const idTokenProfile = decodeJwtPayload(idToken);
  let userInfoProfile = {};

  if (config.userinfoUrl) {
    const response = await fetch(config.userinfoUrl, {
      headers: { authorization: 'Bearer ' + accessToken, accept: 'application/json' },
    });
    userInfoProfile = await response.json().catch(() => ({}));
    if (!response.ok && !idTokenProfile.sub && !idTokenProfile.oid) throw new AppError('Unable to load SSO profile', 401);
  }

  const profile = { ...idTokenProfile, ...userInfoProfile };
  const email = firstString(profile.email, profile.preferred_username, profile.upn, profile.unique_name).trim().toLowerCase();
  const name = firstString(profile.name, profile.given_name, profile.displayName, email).trim();
  const providerUserId = firstString(profile.oid, profile.sub, profile.id, email).trim();
  if (!email || !providerUserId) throw new AppError('SSO profile does not include an email address', 401);
  if (profile.email_verified === false) throw new AppError('SSO email address is not verified', 401);
  return { email, name: name || email, providerUserId };
}

export async function handleSsoCallback({ code, state }) {
  const config = requireSsoConfig();
  if (!code || !state) throw new AppError('Missing SSO callback parameters', 400);
  const statePayload = verifyState(state);
  const origin = statePayload.origin === 'kiosk' ? 'kiosk' : 'admin';
  const tokenPayload = await exchangeCode(code, config);
  const profile = await fetchProfile(tokenPayload.access_token, config, tokenPayload.id_token);
  const provider = config.providerName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') || 'sso';
  const existingUser = await User.findByEmail(profile.email);
  const user = existingUser
    ? await User.updateSsoProfile(existingUser.id, { ...profile, provider })
    : await User.createPendingSsoUser({ ...profile, provider });
  const permissions = normalizePermissions(user.role, await User.listPermissions(user.id));

  if (origin === 'kiosk') {
    if (user.status === 'pending') {
      return { approved: false, redirectUrl: frontendUrl() + '/kiosk/login?sso=pending' };
    }
    if (user.status !== 'active' || !hasKioskAccess({ role: user.role, permissions })) {
      return { approved: false, redirectUrl: frontendUrl() + '/kiosk/login?sso=denied' };
    }
    await User.touchLogin(user.id);
    const token = jwt.sign({ role: user.role }, env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: String(user.id),
      expiresIn: env.KIOSK_JWT_EXPIRES_IN,
      issuer: 'smiley-api',
      audience: 'smiley-kiosk',
    });
    const redirect = new URL(frontendUrl() + '/kiosk/sso/callback');
    redirect.searchParams.set('token', token);
    redirect.searchParams.set('returnTo', safeReturnTo(statePayload.returnTo, 'kiosk'));
    return { approved: true, redirectUrl: redirect.toString() };
  }

  if (user.status === 'pending') {
    return { approved: false, redirectUrl: frontendUrl() + '/admin/login?sso=pending' };
  }
  if (user.status !== 'active' || (user.role !== 'admin' && !permissions.length)) {
    return { approved: false, redirectUrl: frontendUrl() + '/admin/login?sso=denied' };
  }
  await User.touchLogin(user.id);
  const token = jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: String(user.id),
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'smiley-api',
    audience: 'smiley-admin',
  });
  const redirect = new URL(frontendUrl() + '/admin/sso/callback');
  redirect.searchParams.set('token', token);
  redirect.searchParams.set('returnTo', safeReturnTo(statePayload.returnTo, 'admin'));
  return { approved: true, redirectUrl: redirect.toString() };
}
