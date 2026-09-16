import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { terminalService } from '../services/terminalService.js';
import { clearKioskTerminal, getKioskDeviceId, getKioskTerminal } from '../utils/storage.js';

export default function KioskLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const terminal = getKioskTerminal();
    if (!terminal?.terminalCode || location.pathname === '/kiosk/setup') return undefined;
    const deviceId = getKioskDeviceId();

    async function heartbeat() {
      try {
        await terminalService.heartbeatForKiosk({ terminalCode: terminal.terminalCode, deviceId });
      } catch {
        clearKioskTerminal();
        navigate('/kiosk/setup?next=' + encodeURIComponent(location.pathname + location.search), { replace: true });
      }
    }

    heartbeat();
    const interval = window.setInterval(heartbeat, 30000);
    return () => window.clearInterval(interval);
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="kiosk-shell">
      <main className="kiosk-main">
        <Outlet />
      </main>
    </div>
  );
}
