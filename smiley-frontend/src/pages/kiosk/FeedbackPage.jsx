import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackForm from '../../components/voting/FeedbackForm.jsx';
import Toast from '../../components/common/Toast.jsx';
import { feedbackOptionService } from '../../services/feedbackOptionService.js';
import { kioskService } from '../../services/kioskService.js';
import { useVoting } from '../../hooks/useVoting.js';
import { getKioskTerminalCode } from '../../utils/storage.js';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { vote, updateVote } = useVoting();
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!vote.rating) navigate('/kiosk/smiley', { replace: true });
    else if (!vote.userType) navigate('/kiosk/user-type', { replace: true });
  }, [vote.rating, vote.userType, navigate]);

  useEffect(() => {
    let alive = true;
    async function loadOptions() {
      if (!vote.rating?.id) return;
      setOptionsLoading(true);
      setMessage('');
      try {
        const data = await feedbackOptionService.list({ ratingId: vote.rating.id });
        if (alive) setOptions(data);
      } catch (error) {
        if (alive) setMessage(error.message || 'Unable to load feedback options');
      } finally {
        if (alive) setOptionsLoading(false);
      }
    }
    loadOptions();
    return () => { alive = false; };
  }, [vote.rating?.id]);

  async function submit() {
    setLoading(true);
    setMessage('');
    try {
      const terminalCode = getKioskTerminalCode();
      const requiresText = vote.feedbackOption?.requiresText || vote.feedbackOption?.requires_text;
      await kioskService.submitVote({
        ratingId: vote.rating.id,
        userTypeId: vote.userType.id,
        terminalCode,
        feedbackOptionId: vote.feedbackOption.id,
        feedback: requiresText ? vote.feedback.trim() : '',
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
    const requiresText = vote.feedbackOption?.requiresText || vote.feedbackOption?.requires_text;
    if (!terminalCode) {
      setMessage('Terminal code is not configured');
      return;
    }
    if (!vote.feedbackOption) {
      setMessage('Please select a feedback option');
      return;
    }
    if (requiresText && !vote.feedback.trim()) {
      setMessage('Feedback is required');
      return;
    }
    submit();
  }

  function selectOption(option) {
    const requiresText = option.requiresText || option.requires_text;
    updateVote({ feedbackOption: option, feedback: requiresText ? vote.feedback : '' });
  }

  function goBack() {
    updateVote({ userType: null, feedbackOption: null, feedback: '' });
    navigate('/kiosk/user-type');
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
        selectedOption={vote.feedbackOption}
        options={options}
        loading={loading}
        optionsLoading={optionsLoading}
        onChange={feedback => updateVote({ feedback })}
        onOptionSelect={selectOption}
        onSubmit={handleSubmit}
        onBack={goBack}
      />
      <Toast message={message} />
    </section>
  );
}
