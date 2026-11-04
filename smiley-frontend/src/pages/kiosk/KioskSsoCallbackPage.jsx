import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { authService } from '../../services/authService.js';
import { setKioskAuthSession } from '../../utils/storage.js';

function safeReturnTo(value) {
  return value && value.startsWith('/kiosk') && value !== '/kiosk/login' ? value : '/kiosk/setup';
}

export default function KioskSsoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Sign-in did not return an access token');
      return;
    }
    setKioskAuthSession({ token, user: null });
    authService.kioskMe()
      .then(response => {
        setKioskAuthSession({ token, user: response.data });
        navigate(safeReturnTo(searchParams.get('returnTo')), { replace: true });
      })
      .catch(error => setMessage(error.message || 'Unable to complete sign-in'));
  }, [navigate, searchParams]);

  return (
    <div className="kiosk-shell">
      <main className="kiosk-main">
        <section className="kiosk-panel kiosk-setup-panel kiosk-login-panel">
          <div className="setup-card">
            <h1>Completing sign-in</h1>
            <Loading label="Verifying your account" />
          </div>
          <Toast message={message} />
        </section>
      </main>
    </div>
  );
}
