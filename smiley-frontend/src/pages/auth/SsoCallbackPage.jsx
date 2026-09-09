import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useAuth } from '../../hooks/useAuth.js';

function safeReturnTo(value) {
  return value && value.startsWith('/admin') ? value : '/admin/dashboard';
}

export default function SsoCallbackPage() {
  const { completeSso, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('SSO login did not return an access token');
      return;
    }
    completeSso(token)
      .then(() => navigate(safeReturnTo(searchParams.get('returnTo')), { replace: true }))
      .catch(error => setMessage(error.message || 'Unable to complete SSO login'));
  }, [completeSso, navigate, searchParams]);

  if (isAuthenticated) return <Navigate to={safeReturnTo(searchParams.get('returnTo'))} replace />;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Completing SSO Login</h1>
        <Loading label="Verifying your account" />
      </section>
      <Toast message={message} />
    </main>
  );
}
