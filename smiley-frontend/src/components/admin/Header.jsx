import { LogOut } from 'lucide-react';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="admin-header">
      <div>
        <strong>{user?.name || 'Admin'}</strong>
        <div>{user?.email}</div>
      </div>
      <Button variant="secondary" icon={LogOut} onClick={logout}>Logout</Button>
    </header>
  );
}
