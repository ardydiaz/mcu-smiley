import { Send } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function FeedbackForm({ value, loading, onChange, onSubmit }) {
  const remainingCharacters = 2000 - value.length;

  return (
    <form className="feedback-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="feedback">Feedback</label>
        <textarea
          id="feedback"
          aria-describedby="feedback-help"
          value={value}
          minLength={1}
          maxLength={2000}
          required
          onChange={event => onChange(event.target.value)}
          placeholder="Share your experience"
        />
        <p id="feedback-help" className="field-hint">Required - {remainingCharacters} characters left</p>
      </div>
      <div className="button-row">
        <Button type="submit" icon={Send} disabled={loading || !value.trim()}>{loading ? 'Submitting' : 'Submit'}</Button>
      </div>
    </form>
  );
}
