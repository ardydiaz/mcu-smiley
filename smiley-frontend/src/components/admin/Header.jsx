import { LogOut } from 'lucide-react';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import mcuLogo from '../../assets/images/mcu-white.png';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="admin-header">
      <div className="admin-header-brand">
        <span className="admin-header-logo">
          <img src={mcuLogo} alt="MCU" />
        </span>
        <div>
          <strong>{user?.name || 'Admin'}</strong>
          <div>{user?.email}</div>
        </div>
      </div>
      <Button variant="secondary" icon={LogOut} onClick={logout}>Logout</Button>
    </header>
  );
}
