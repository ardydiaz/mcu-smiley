import { BarChart3, Building2, ChevronDown, FileText, Link2, MapPin, Monitor, Settings2, Smile, Star } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/ratings', label: 'Ratings', icon: Star },
  { to: '/admin/feedback', label: 'Feedback', icon: Smile },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
];

const managementLinks = [
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/locations', label: 'Locations', icon: MapPin },
  { to: '/admin/terminals', label: 'Terminals', icon: Monitor },
  { to: '/admin/terminal-departments', label: 'Terminal Departments', icon: Link2 },
];

export default function Sidebar() {
  const location = useLocation();
  const isManagementActive = managementLinks.some(link => location.pathname.startsWith(link.to));

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <span className="brand-dot">S</span>
        <span>Smiley Admin</span>
      </div>
      <nav className="sidebar-nav" aria-label="Admin">
        <NavLink to={links[0].to} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <BarChart3 size={18} aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>

        <details className="sidebar-group" open={isManagementActive}>
          <summary className={'sidebar-group-trigger' + (isManagementActive ? ' active' : '')}>
            <span className="sidebar-group-label">
              <Settings2 size={18} aria-hidden="true" />
              <span>Management</span>
            </span>
            <ChevronDown className="sidebar-group-chevron" size={16} aria-hidden="true" />
          </summary>
          <div className="sidebar-subnav">
            {managementLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => 'sidebar-link sidebar-sublink' + (isActive ? ' active' : '')}>
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </details>

        {links.slice(1).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
