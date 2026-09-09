import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { canAccessMenu, firstAllowedAdminPath } from '../utils/menuPermissions.js';

export default function PermissionRoute({ permission, children }) {
  const { user } = useAuth();
  if (canAccessMenu(user, permission)) return children;
  const nextPath = firstAllowedAdminPath(user);
  if (nextPath !== '/admin/no-access') return <Navigate to={nextPath} replace />;
  return <Navigate to="/admin/no-access" replace />;
}
