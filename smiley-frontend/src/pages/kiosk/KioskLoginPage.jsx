import { KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/common/Toast.jsx';
import { authService } from '../../services/authService.js';

function safeNext(value) {
  return value && value.startsWith('/kiosk') && value !== '/kiosk/login' ? value : '/kiosk/setup';
}

export default function KioskLoginPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const next = safeNext(searchParams.get('next'));
  const ssoStatus = searchParams.get('sso');

  useEffect(() => {
    if (ssoStatus === 'pending') setMessage('Your account is pending admin approval for kiosk setup.');
    if (ssoStatus === 'denied') setMessage('Your account is not authorized to set up a kiosk terminal.');
  }, [ssoStatus]);

  function startSso() {
    window.location.assign(authService.ssoStartUrl(next, 'kiosk'));
  }

  return (
    <div className="kiosk-shell">
      <main className="kiosk-main">
        <section className="kiosk-panel kiosk-setup-panel">
          <div className="kiosk-heading">
            <span className="kiosk-eyebrow">Tablet Setup</span>
            <h1>Sign in to continue</h1>
            <p>Only approved MCU staff accounts can set up this tablet. Sign in with your Microsoft account to continue.</p>
          </div>

          <div className="setup-card">
            <div className="setup-current">
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>Protected by Microsoft sign-in</strong>
                <span>Use your mcu.edu.ph account</span>
              </div>
            </div>

            <Button type="button" icon={KeyRound} className="sso-login-button" onClick={startSso}>
              Sign in with Microsoft
            </Button>
            <p className="auth-helper-text">This device will stay signed in after setup. You won't be asked again unless you sign out.</p>
          </div>

          <Toast message={message} />
        </section>
      </main>
    </div>
  );
}
