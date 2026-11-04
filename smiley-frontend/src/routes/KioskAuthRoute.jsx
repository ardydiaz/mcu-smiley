import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getKioskAuthToken } from '../utils/storage.js';

export default function KioskAuthRoute() {
  const location = useLocation();
  if (!getKioskAuthToken()) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={'/kiosk/login?next=' + next} replace />;
  }
  return <Outlet />;
}
