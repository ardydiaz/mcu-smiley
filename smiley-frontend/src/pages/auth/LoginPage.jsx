import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const target = location.state?.from?.pathname || '/admin/dashboard';

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

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
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
      </form>
      <Toast message={message} />
    </main>
  );
}
