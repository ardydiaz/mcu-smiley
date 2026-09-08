import { Outlet } from 'react-router-dom';

export default function KioskLayout() {
  return (
    <div className="kiosk-shell">
      <main className="kiosk-main">
        <Outlet />
      </main>
    </div>
  );
}
