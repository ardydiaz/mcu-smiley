import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackForm from '../../components/voting/FeedbackForm.jsx';
import Toast from '../../components/common/Toast.jsx';
import { kioskService } from '../../services/kioskService.js';
import { useVoting } from '../../hooks/useVoting.js';
import { getKioskTerminalCode } from '../../utils/storage.js';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { vote, updateVote } = useVoting();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!vote.rating) navigate('/kiosk/smiley', { replace: true });
    else if (!vote.userType) navigate('/kiosk/user-type', { replace: true });
  }, [vote.rating, vote.userType, navigate]);

  async function submit(feedback) {
    setLoading(true);
    setMessage('');
    try {
      const terminalCode = getKioskTerminalCode();
      await kioskService.submitVote({
        ratingId: vote.rating.id,
        userTypeId: vote.userType.id,
        terminalCode,
        feedback,
      });
      navigate('/kiosk/thank-you');
    } catch (error) {
      setMessage(error.message || 'Unable to submit feedback');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const terminalCode = getKioskTerminalCode();
    const feedback = vote.feedback.trim();
    if (!terminalCode) {
      setMessage('Terminal code is not configured');
      return;
    }
    if (!feedback) {
      setMessage('Feedback is required');
      return;
    }
    submit(feedback);
  }

  return (
    <section className="kiosk-panel">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Step 3 of 3</span>
        <h1>Tell us more</h1>
        <p>{vote.userType?.name || ''}</p>
      </div>
      <FeedbackForm
        value={vote.feedback}
        loading={loading}
        onChange={feedback => updateVote({ feedback })}
        onSubmit={handleSubmit}
      />
      <Toast message={message} />
    </section>
  );
}
