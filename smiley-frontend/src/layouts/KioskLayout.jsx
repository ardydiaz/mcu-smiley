import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../services/api.js';
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
      } catch (error) {
        // Only a real rejection from the server means the reservation is actually gone.
        // A network/offline failure throws before a response is ever received, so it
        // must not wipe the tablet's saved terminal - just retry on the next heartbeat.
        if (error instanceof ApiError) {
          clearKioskTerminal();
          navigate('/kiosk/setup?next=' + encodeURIComponent(location.pathname + location.search), { replace: true });
        }
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
