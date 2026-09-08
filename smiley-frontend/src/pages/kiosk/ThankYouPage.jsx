import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThankYou from '../../components/voting/ThankYou.jsx';
import { useVoting } from '../../hooks/useVoting.js';
import { resetDelayMs } from '../../utils/constants.js';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const { resetVote } = useVoting();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      resetVote();
      navigate('/kiosk/smiley', { replace: true });
    }, resetDelayMs);
    return () => window.clearTimeout(timeout);
  }, [navigate, resetVote]);

  return <ThankYou />;
}
