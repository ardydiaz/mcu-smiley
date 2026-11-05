import { ArrowLeft, Check, Pencil, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../common/Button.jsx';
import Loading from '../common/Loading.jsx';
import Modal from '../common/Modal.jsx';

export default function FeedbackForm({ value, selectedOptions = [], options = [], loading, optionsLoading, onChange, onOptionSelect, onSubmit, onBack }) {
  const requiresText = selectedOptions.some(option => option.requiresText || option.requires_text);
  const canSubmit = selectedOptions.length > 0 && (!requiresText || value.trim());
  const [specifyOpen, setSpecifyOpen] = useState(false);
  const [draftText, setDraftText] = useState(value);

  useEffect(() => {
    if (!requiresText) setSpecifyOpen(false);
  }, [requiresText]);

  function openSpecify() {
    setDraftText(value);
    setSpecifyOpen(true);
  }

  function handleOptionClick(option) {
    const requires = option.requiresText || option.requires_text;
    const wasActive = selectedOptions.some(selected => selected.id === option.id);
    onOptionSelect(option);
    if (requires && !wasActive) openSpecify();
  }

  function saveSpecify() {
    onChange(draftText);
    setSpecifyOpen(false);
  }

  const remainingCharacters = 2000 - draftText.length;

  return (
    <form className="feedback-form feedback-choice-form" onSubmit={onSubmit} noValidate>
      <div className="feedback-option-section">
        {optionsLoading ? <Loading label="Loading feedback options" /> : null}
        {!optionsLoading && options.length ? (
          <div className="feedback-option-grid">
            {options.map(option => {
              const active = selectedOptions.some(selected => selected.id === option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={'feedback-option-card' + (active ? ' active' : '')}
                  onClick={() => handleOptionClick(option)}
                  aria-pressed={active}
                >
                  <span className={'feedback-option-indicator' + (active ? ' active' : '')} aria-hidden="true">
                    {active ? <Check size={14} /> : null}
                  </span>
                  <span className="feedback-option-label">{option.label}</span>
                  {option.requiresText || option.requires_text ? <small>Specify</small> : null}
                </button>
              );
            })}
          </div>
        ) : null}
        {!optionsLoading && !options.length ? <p className="field-hint">No feedback options available for this rating.</p> : null}
      </div>

      {requiresText ? (
        <button
          type="button"
          className={'feedback-specify-summary' + (value.trim() ? ' is-filled' : '')}
          onClick={openSpecify}
        >
          <span className="feedback-specify-summary-icon" aria-hidden="true"><Pencil size={18} /></span>
          <span className="feedback-specify-summary-text">
            <strong>{value.trim() ? 'Your details' : 'Tap to add details'} <span className="required-mark" aria-hidden="true">*</span></strong>
            <span>{value.trim() || 'Required - tell us more about your experience'}</span>
          </span>
        </button>
      ) : null}

      {specifyOpen ? (
        <Modal
          title="Please specify"
          onClose={() => setSpecifyOpen(false)}
          className="feedback-specify-modal"
          footer={(
            <div className="button-row">
              <Button type="button" variant="secondary" icon={X} onClick={() => setSpecifyOpen(false)}>Cancel</Button>
              <Button type="button" icon={Check} onClick={saveSpecify} disabled={!draftText.trim()}>Save</Button>
            </div>
          )}
        >
          <textarea
            autoFocus
            className="feedback-specify-textarea"
            value={draftText}
            maxLength={2000}
            onChange={event => setDraftText(event.target.value)}
            placeholder="Share your experience"
          />
          <p className="field-hint">Required - {remainingCharacters} characters left</p>
        </Modal>
      ) : null}

      <div className="button-row kiosk-form-actions">
        {onBack ? <Button type="button" variant="secondary" icon={ArrowLeft} className="kiosk-back-button" onClick={onBack}>Back</Button> : null}
        <Button type="submit" icon={Send} disabled={loading || optionsLoading || !canSubmit}>{loading ? 'Submitting' : 'Submit'}</Button>
      </div>
    </form>
  );
}
