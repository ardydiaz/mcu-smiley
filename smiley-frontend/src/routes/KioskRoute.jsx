import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getKioskTerminalCode } from '../utils/storage.js';

export default function KioskRoute() {
  const location = useLocation();
  if (!getKioskTerminalCode()) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={'/kiosk/setup?next=' + next} replace />;
  }
  return <Outlet />;
}
