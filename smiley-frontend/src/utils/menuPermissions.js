export const menuPermissions = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { key: 'ratings', label: 'Ratings', path: '/admin/ratings' },
  { key: 'feedback', label: 'Feedback', path: '/admin/feedback' },
  { key: 'reports', label: 'Reports', path: '/admin/reports' },
  { key: 'departments', label: 'Departments', path: '/admin/departments' },
  { key: 'locations', label: 'Locations', path: '/admin/locations' },
  { key: 'terminals', label: 'Terminals', path: '/admin/terminals' },
  { key: 'terminal-departments', label: 'Terminal Departments', path: '/admin/terminal-departments' },
];

export const menuPermissionKeys = menuPermissions.map(permission => permission.key);

export const KIOSK_PERMISSION = { key: 'kiosk-setup', label: 'Kiosk Setup' };

export function canAccessMenu(user, permission) {
  if (user?.role === 'admin') return true;
  return Array.isArray(user?.permissions) && user.permissions.includes(permission);
}

export function firstAllowedAdminPath(user) {
  if (user?.role === 'admin') return '/admin/dashboard';
  return menuPermissions.find(permission => canAccessMenu(user, permission))?.path || '/admin/no-access';
}
