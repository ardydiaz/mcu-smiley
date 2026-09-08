import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';
import KioskLayout from '../layouts/KioskLayout.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import DepartmentsPage from '../pages/admin/DepartmentsPage.jsx';
import FeedbackAdminPage from '../pages/admin/FeedbackPage.jsx';
import LocationsPage from '../pages/admin/LocationsPage.jsx';
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
import ProtectedRoute from './ProtectedRoute.jsx';

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
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="ratings" element={<RatingsPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="terminals" element={<TerminalsPage />} />
          <Route path="terminal-departments" element={<TerminalDepartmentsPage />} />
          <Route path="feedback" element={<FeedbackAdminPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/kiosk/smiley" replace />} />
    </Routes>
  );
}
