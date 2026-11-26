import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

function getToastType(message, type) {
  if (type) return type;
  if (/unable|failed|error|required|invalid|please check|please select|not configured/i.test(message || '')) return 'error';
  return 'success';
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
};

export default function Toast({ message, type, duration = 3000 }) {
  const [visibleMessage, setVisibleMessage] = useState('');

  useEffect(() => {
    if (!message) {
      setVisibleMessage('');
      return undefined;
    }

    setVisibleMessage(message);
    const timer = window.setTimeout(() => setVisibleMessage(''), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration]);

  if (!visibleMessage) return null;
  const toastType = getToastType(message, type);
  const Icon = TOAST_ICONS[toastType];

  return (
    <div className={'toast toast-' + toastType} role={toastType === 'error' ? 'alert' : 'status'}>
      <Icon className="toast-icon" size={20} aria-hidden="true" />
      <span>{visibleMessage}</span>
    </div>
  );
}
