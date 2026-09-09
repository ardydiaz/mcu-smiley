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

export function normalizePermissions(role, permissions = []) {
  if (role === 'admin') return menuPermissionKeys;
  return [...new Set(permissions)].filter(permission => menuPermissionKeys.includes(permission));
}
