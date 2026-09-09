import { KeyRound, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/common/Toast.jsx';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [ssoConfig, setSsoConfig] = useState({ enabled: false, providerName: 'SSO' });
  const [message, setMessage] = useState('');
  const ssoStatus = new URLSearchParams(location.search).get('sso');
  const target = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    let alive = true;
    authService.ssoConfig()
      .then(response => {
        if (alive) setSsoConfig(response.data);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (ssoStatus === 'pending') setMessage('Your SSO account is pending admin approval.');
    if (ssoStatus === 'denied') setMessage('Your SSO account is not allowed to access the admin dashboard.');
  }, [ssoStatus]);

  if (isAuthenticated) return <Navigate to={target} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await login(form);
      navigate(target, { replace: true });
    } catch (error) {
      setMessage(error.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  }

  function startSso() {
    window.location.assign(authService.ssoStartUrl(target));
  }

  return (
    <main className="auth-page">
      <form className={'auth-card auth-card-modern' + (ssoConfig.enabled ? ' sso-only' : '')} onSubmit={handleSubmit}>
        <section className="auth-hero-panel" aria-hidden="true">
          <div className="auth-logo-mark">
            <span>MCU</span>
          </div>
          <div>
            <p className="auth-eyebrow">Smiley Admin</p>
            <h1>Welcome back</h1>
            <p>Secure access for reports, survey management, and user approvals.</p>
          </div>
          <div className="auth-security-note">
            <ShieldCheck size={18} />
            <span>Protected by Microsoft SSO</span>
          </div>
        </section>

        <section className="auth-login-panel">
          <div className="auth-login-header">
            <span className="auth-login-icon"><Sparkles size={18} /></span>
            <div>
              <p>Admin Portal</p>
              <h2>Sign in to continue</h2>
            </div>
          </div>

          {ssoConfig.enabled ? (
            <>
              <Button type="button" icon={KeyRound} className="sso-login-button" onClick={startSso}>
                Login with {ssoConfig.providerName || 'SSO'}
              </Button>
              <p className="auth-helper-text">Use your approved Microsoft account to access the dashboard.</p>
            </>
          ) : (
            <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  required
                />
              </div>
              <Button type="submit" icon={LogIn} disabled={loading}>{loading ? 'Signing in' : 'Login'}</Button>
            </>
          )}
        </section>
      </form>
      <Toast message={message} />
    </main>
  );
}
