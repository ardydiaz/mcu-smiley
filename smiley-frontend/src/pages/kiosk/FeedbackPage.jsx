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
      const requiresText = vote.feedbackOptions.some(option => option.requiresText || option.requires_text);
      await kioskService.submitVote({
        ratingId: vote.rating.id,
        userTypeId: vote.userType.id,
        terminalCode,
        feedbackOptionIds: vote.feedbackOptions.map(option => option.id),
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
    const requiresText = vote.feedbackOptions.some(option => option.requiresText || option.requires_text);
    if (!terminalCode) {
      setMessage('Terminal code is not configured');
      return;
    }
    if (!vote.feedbackOptions.length) {
      setMessage('Please select at least one feedback option');
      return;
    }
    if (requiresText && !vote.feedback.trim()) {
      setMessage('Feedback is required');
      return;
    }
    submit();
  }

  function selectOption(option) {
    const alreadySelected = vote.feedbackOptions.some(selected => selected.id === option.id);
    const feedbackOptions = alreadySelected
      ? vote.feedbackOptions.filter(selected => selected.id !== option.id)
      : [...vote.feedbackOptions, option];
    const requiresText = feedbackOptions.some(selected => selected.requiresText || selected.requires_text);
    updateVote({ feedbackOptions, feedback: requiresText ? vote.feedback : '' });
  }

  function goBack() {
    updateVote({ userType: null, feedbackOptions: [], feedback: '' });
    navigate('/kiosk/user-type');
  }

  return (
    <section className="kiosk-panel feedback-page">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Step 3 of 3</span>
        <h1>How Was Your Experience?</h1>
        <p className="feedback-user-type">
          <span>User type</span>
          <strong>{vote.userType?.name || ''}</strong>
        </p>
      </div>
      <FeedbackForm
        value={vote.feedback}
        selectedOptions={vote.feedbackOptions}
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
