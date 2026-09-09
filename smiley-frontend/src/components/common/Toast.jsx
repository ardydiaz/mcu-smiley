import { useEffect, useState } from 'react';

function getToastType(message, type) {
  if (type) return type;
  if (/unable|failed|error|required|invalid|please check|please select|not configured/i.test(message || '')) return 'error';
  return 'success';
}

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
  return <div className={'toast toast-' + toastType} role={toastType === 'error' ? 'alert' : 'status'}>{visibleMessage}</div>;
}
