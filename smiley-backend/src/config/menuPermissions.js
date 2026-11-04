export const menuPermissions = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'reports', label: 'Reports' },
  { key: 'departments', label: 'Departments' },
  { key: 'locations', label: 'Locations' },
  { key: 'terminals', label: 'Terminals' },
  { key: 'terminal-departments', label: 'Terminal Departments' },
];

export const menuPermissionKeys = menuPermissions.map(permission => permission.key);

export const KIOSK_PERMISSION_KEY = 'kiosk-setup';

export const allPermissionKeys = [...menuPermissionKeys, KIOSK_PERMISSION_KEY];

export function normalizePermissions(role, permissions = []) {
  if (role === 'admin') return allPermissionKeys;
  return [...new Set(permissions)].filter(permission => allPermissionKeys.includes(permission));
}

export function hasKioskAccess(user) {
  return user?.role === 'admin' || Boolean(user?.permissions?.includes(KIOSK_PERMISSION_KEY));
}
