import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';
import KioskLayout from '../layouts/KioskLayout.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import SsoCallbackPage from '../pages/auth/SsoCallbackPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import DepartmentsPage from '../pages/admin/DepartmentsPage.jsx';
import FeedbackAdminPage from '../pages/admin/FeedbackPage.jsx';
import LocationsPage from '../pages/admin/LocationsPage.jsx';
import NoAccessPage from '../pages/admin/NoAccessPage.jsx';
import RatingsPage from '../pages/admin/RatingsPage.jsx';
import ReportsPage from '../pages/admin/ReportsPage.jsx';
import TerminalDepartmentsPage from '../pages/admin/TerminalDepartmentsPage.jsx';
import TerminalsPage from '../pages/admin/TerminalsPage.jsx';
import FeedbackPage from '../pages/kiosk/FeedbackPage.jsx';
import KioskSetupPage from '../pages/kiosk/KioskSetupPage.jsx';
import SmileyPage from '../pages/kiosk/SmileyPage.jsx';
import ThankYouPage from '../pages/kiosk/ThankYouPage.jsx';
import UserTypePage from '../pages/kiosk/UserTypePage.jsx';
import KioskRoute from './KioskRoute.jsx';
import PermissionRoute from './PermissionRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { firstAllowedAdminPath } from '../utils/menuPermissions.js';
import { useAuth } from '../hooks/useAuth.js';

function AdminIndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={firstAllowedAdminPath(user)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kiosk/smiley" replace />} />
      <Route path="/kiosk" element={<KioskLayout />}>
        <Route path="setup" element={<KioskSetupPage />} />
        <Route element={<KioskRoute />}>
          <Route index element={<Navigate to="/kiosk/smiley" replace />} />
          <Route path="smiley" element={<SmileyPage />} />
          <Route path="user-type" element={<UserTypePage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
        </Route>
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/sso/callback" element={<SsoCallbackPage />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminIndexRedirect />} />
          <Route path="dashboard" element={<PermissionRoute permission="dashboard"><DashboardPage /></PermissionRoute>} />
          <Route path="users" element={<PermissionRoute permission="users"><AdminUsersPage /></PermissionRoute>} />
          <Route path="departments" element={<PermissionRoute permission="departments"><DepartmentsPage /></PermissionRoute>} />
          <Route path="ratings" element={<PermissionRoute permission="ratings"><RatingsPage /></PermissionRoute>} />
          <Route path="locations" element={<PermissionRoute permission="locations"><LocationsPage /></PermissionRoute>} />
          <Route path="terminals" element={<PermissionRoute permission="terminals"><TerminalsPage /></PermissionRoute>} />
          <Route path="terminal-departments" element={<PermissionRoute permission="terminal-departments"><TerminalDepartmentsPage /></PermissionRoute>} />
          <Route path="feedback" element={<PermissionRoute permission="feedback"><FeedbackAdminPage /></PermissionRoute>} />
          <Route path="reports" element={<PermissionRoute permission="reports"><ReportsPage /></PermissionRoute>} />
          <Route path="no-access" element={<NoAccessPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/kiosk/smiley" replace />} />
    </Routes>
  );
}
