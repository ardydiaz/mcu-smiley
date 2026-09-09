import { ArrowLeft, Send } from 'lucide-react';
import Button from '../common/Button.jsx';
import Loading from '../common/Loading.jsx';

export default function FeedbackForm({ value, selectedOption, options = [], loading, optionsLoading, onChange, onOptionSelect, onSubmit, onBack }) {
  const remainingCharacters = 2000 - value.length;
  const requiresText = selectedOption?.requiresText || selectedOption?.requires_text;
  const canSubmit = selectedOption && (!requiresText || value.trim());

  return (
    <form className="feedback-form feedback-choice-form" onSubmit={onSubmit} noValidate>
      <div className="feedback-option-section">
        <h2>What best describes your experience?</h2>
        {optionsLoading ? <Loading label="Loading feedback options" /> : null}
        {!optionsLoading && options.length ? (
          <div className="feedback-option-grid">
            {options.map(option => {
              const active = selectedOption?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={'feedback-option-card' + (active ? ' active' : '')}
                  onClick={() => onOptionSelect(option)}
                  aria-pressed={active}
                >
                  <span>{option.label}</span>
                  {option.requiresText || option.requires_text ? <small>Specify</small> : null}
                </button>
              );
            })}
          </div>
        ) : null}
        {!optionsLoading && !options.length ? <p className="field-hint">No feedback options available for this rating.</p> : null}
      </div>

      {requiresText ? (
        <div className="field">
          <label htmlFor="feedback">Please specify <span className="required-mark" aria-hidden="true">*</span></label>
          <textarea
            id="feedback"
            aria-describedby="feedback-help"
            value={value}
            maxLength={2000}
            required
            onChange={event => onChange(event.target.value)}
            placeholder="Share your experience"
          />
          <p id="feedback-help" className="field-hint">Required - {remainingCharacters} characters left</p>
        </div>
      ) : null}

      <div className="button-row kiosk-form-actions">
        {onBack ? <Button type="button" variant="secondary" icon={ArrowLeft} className="kiosk-back-button" onClick={onBack}>Back</Button> : null}
        <Button type="submit" icon={Send} disabled={loading || optionsLoading || !canSubmit}>{loading ? 'Submitting' : 'Submit'}</Button>
      </div>
    </form>
  );
}
