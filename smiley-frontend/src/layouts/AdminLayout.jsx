import { Outlet } from 'react-router-dom';
import Header from '../components/admin/Header.jsx';
import Sidebar from '../components/admin/Sidebar.jsx';

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
