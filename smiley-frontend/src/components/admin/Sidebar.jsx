import { BarChart3, Building2, ChevronDown, FileText, Link2, MapPin, Monitor, Settings2, Smile, Star, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { canAccessMenu } from '../../utils/menuPermissions.js';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3, permission: 'dashboard' },
  { to: '/admin/ratings', label: 'Ratings', icon: Star, permission: 'ratings' },
  { to: '/admin/feedback', label: 'Feedback', icon: Smile, permission: 'feedback' },
  { to: '/admin/reports', label: 'Reports', icon: FileText, permission: 'reports' },
];

const managementLinks = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/departments', label: 'Departments', icon: Building2, permission: 'departments' },
  { to: '/admin/locations', label: 'Locations', icon: MapPin, permission: 'locations' },
  { to: '/admin/terminals', label: 'Terminals', icon: Monitor, permission: 'terminals' },
  { to: '/admin/terminal-departments', label: 'Terminal Departments', icon: Link2, permission: 'terminal-departments' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const visibleLinks = user?.role === 'admin' ? links : links.filter(link => canAccessMenu(user, link.permission || link.to.replace('/admin/', '')));
  const visibleManagementLinks = user?.role === 'admin'
    ? managementLinks
    : managementLinks.filter(link => link.permission && canAccessMenu(user, link.permission));
  const isManagementActive = visibleManagementLinks.some(link => location.pathname.startsWith(link.to));

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <span className="brand-dot">S</span>
        <span>Smiley Admin</span>
      </div>
      <nav className="sidebar-nav" aria-label="Admin">
        {visibleLinks[0] ? (
          <NavLink to={visibleLinks[0].to} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            {(() => {
              const Icon = visibleLinks[0].icon;
              return <Icon size={18} aria-hidden="true" />;
            })()}
            <span>{visibleLinks[0].label}</span>
          </NavLink>
        ) : null}

        {visibleManagementLinks.length ? (
          <details className="sidebar-group" open={isManagementActive}>
            <summary className={'sidebar-group-trigger' + (isManagementActive ? ' active' : '')}>
              <span className="sidebar-group-label">
                <Settings2 size={18} aria-hidden="true" />
                <span>Management</span>
              </span>
              <ChevronDown className="sidebar-group-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="sidebar-subnav">
              {visibleManagementLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => 'sidebar-link sidebar-sublink' + (isActive ? ' active' : '')}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </details>
        ) : null}

        {visibleLinks.slice(1).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
