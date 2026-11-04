const tokenKey = 'smiley_auth_token';
const userKey = 'smiley_auth_user';
const kioskTerminalKey = 'smiley_kiosk_terminal';
const kioskDeviceKey = 'smiley_kiosk_device_id';
const kioskAuthTokenKey = 'smiley_kiosk_auth_token';
const kioskAuthUserKey = 'smiley_kiosk_auth_user';
const envTerminalCode = import.meta.env.VITE_TERMINAL_CODE?.trim() || '';

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

export function setSession({ token, user }) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function getStoredUser() {
  const value = localStorage.getItem(userKey);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}

function normalizeKioskTerminal(terminal) {
  if (!terminal) return null;
  const terminalCode = terminal.terminalCode || terminal.terminal_code || '';
  if (!terminalCode) return null;
  return {
    id: terminal.id ?? null,
    terminalCode,
    name: terminal.name || terminalCode,
    locationName: terminal.locationName || terminal.location_name || '',
    departmentNames: terminal.departmentNames || terminal.department_names || '',
  };
}

export function setKioskTerminal(terminal) {
  const normalized = normalizeKioskTerminal(terminal);
  if (!normalized) return;
  localStorage.setItem(kioskTerminalKey, JSON.stringify(normalized));
}

export function getStoredKioskTerminal() {
  const value = localStorage.getItem(kioskTerminalKey);
  if (!value) return null;
  try {
    return normalizeKioskTerminal(JSON.parse(value));
  } catch {
    return null;
  }
}

export function getKioskTerminal() {
  return getStoredKioskTerminal() || (envTerminalCode ? {
    id: null,
    terminalCode: envTerminalCode,
    name: envTerminalCode,
    locationName: '',
    departmentNames: '',
  } : null);
}

export function getKioskTerminalCode() {
  return getKioskTerminal()?.terminalCode || '';
}

export function clearKioskTerminal() {
  localStorage.removeItem(kioskTerminalKey);
}

export function getKioskAuthToken() {
  return localStorage.getItem(kioskAuthTokenKey);
}

export function setKioskAuthSession({ token, user }) {
  localStorage.setItem(kioskAuthTokenKey, token);
  localStorage.setItem(kioskAuthUserKey, JSON.stringify(user));
}

export function getKioskAuthUser() {
  const value = localStorage.getItem(kioskAuthUserKey);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearKioskAuthSession() {
  localStorage.removeItem(kioskAuthTokenKey);
  localStorage.removeItem(kioskAuthUserKey);
}

export function getKioskDeviceId() {
  const existing = localStorage.getItem(kioskDeviceKey);
  if (existing) return existing;
  const generated = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : 'kiosk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  localStorage.setItem(kioskDeviceKey, generated);
  return generated;
}
