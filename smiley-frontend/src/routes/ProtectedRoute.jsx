import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { routes } from '../utils/constants.js';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to={routes.adminLogin} replace state={{ from: location }} />;
  return <Outlet />;
}
