import { CheckCircle, Edit2, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { feedbackOptionService } from '../../services/feedbackOptionService.js';
import { ratingService } from '../../services/ratingService.js';
import { useApi } from '../../hooks/useApi.js';

const emptyForm = { ratingId: '', label: '', requiresText: false, status: 'active' };

function getFieldErrors(error) {
  const errors = error?.payload?.errors || [];
  return errors.reduce((fields, item) => {
    if (item.field) fields[item.field] = item.message;
    return fields;
  }, {});
}

export default function RatingsPage() {
  const { data: ratings, loading: ratingsLoading, error: ratingsError, reload: reloadRatings } = useApi(() => ratingService.list(), []);
  const { data: feedbackOptions, loading: optionsLoading, error: optionsError, reload: reloadOptions } = useApi(() => feedbackOptionService.listAll(), []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const ratingOptions = ratings || [];
  const selectedRating = ratingOptions.find(rating => String(rating.id) === String(form.ratingId));
  const optionsByRating = (feedbackOptions || []).reduce((groups, option) => {
    const key = String(option.rating_id);
    groups[key] = groups[key] || [];
    groups[key].push(option);
    return groups;
  }, {});

  function updateForm(name, value) {
    setForm(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: '' }));
  }

  function startAdd(rating) {
    setEditingId(null);
    setFieldErrors({});
    setForm({ ...emptyForm, ratingId: String(rating.id) });
  }

  function startEdit(option) {
    setEditingId(option.id);
    setFieldErrors({});
    setForm({
      ratingId: String(option.rating_id),
      label: option.label,
      requiresText: Boolean(option.requiresText || option.requires_text),
      status: option.status,
    });
  }

  function closeModal() {
    setEditingId(null);
    setFieldErrors({});
    setForm(emptyForm);
  }

  async function refreshAll() {
    await Promise.all([reloadRatings(), reloadOptions()]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setFieldErrors({});
    const payload = { ...form, ratingId: Number(form.ratingId) };
    try {
      if (editingId) {
        await feedbackOptionService.update(editingId, payload);
        setMessage('Feedback option updated');
      } else {
        await feedbackOptionService.create(payload);
        setMessage('Feedback option saved');
      }
      closeModal();
      await reloadOptions();
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to save feedback option');
      }
    } finally {
      setSaving(false);
    }
  }

  async function setOptionStatus(option, status) {
    setMessage('');
    try {
      await feedbackOptionService.update(option.id, {
        ratingId: Number(option.rating_id),
        label: option.label,
        requiresText: Boolean(option.requiresText || option.requires_text),
        status,
      });
      await reloadOptions();
      setMessage(status === 'active' ? 'Feedback option activated' : 'Feedback option deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to update feedback option');
    }
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Ratings</h1>
          <p>Smiley choices and built-in feedback options</p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={refreshAll}>Refresh</Button>
      </div>

      <section className="data-panel">
        {ratingsLoading ? <Loading /> : null}
        {ratingsError ? <div className="empty-state">{ratingsError}</div> : null}
        {optionsError ? <div className="empty-state">{optionsError}</div> : null}

        <div className="rating-options-grid">
          {ratingOptions.map(rating => (
            <article className="rating-option-card" key={rating.id}>
              <div className="rating-option-header">
                <div>
                  <strong>{rating.emoji} {rating.label}</strong>
                  <span>Score {rating.score}</span>
                </div>
                <Button variant="secondary" icon={Plus} onClick={() => startAdd(rating)}>Add Option</Button>
              </div>

              <div className="rating-option-list">
                {optionsLoading ? <Loading label="Loading feedback options" /> : null}
                {!optionsLoading && (optionsByRating[String(rating.id)] || []).map(option => (
                  <div className="rating-option-row" key={option.id}>
                    <div>
                      <strong>{option.label}</strong>
                      <span>{option.requiresText || option.requires_text ? 'Requires custom text' : 'Built-in response'} - {option.status}</span>
                    </div>
                    <div className="button-row table-action-row">
                      <Button variant="secondary" icon={Edit2} iconOnly aria-label="Edit feedback option" onClick={() => startEdit(option)}>Edit</Button>
                      {option.status === 'inactive' ? (
                        <Button variant="primary" icon={CheckCircle} iconOnly aria-label="Activate feedback option" onClick={() => setOptionStatus(option, 'active')}>Activate</Button>
                      ) : (
                        <Button variant="danger" icon={Trash2} iconOnly aria-label="Deactivate feedback option" onClick={() => setOptionStatus(option, 'inactive')}>Deactivate</Button>
                      )}
                    </div>
                  </div>
                ))}
                {!optionsLoading && !(optionsByRating[String(rating.id)] || []).length ? <div className="empty-state">No feedback options yet.</div> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedRating ? (
        <Modal title={editingId ? 'Edit Feedback Option' : 'Add Feedback Option'} onClose={closeModal} footer={null}>
          <form className="rating-option-form rating-option-modal-form" onSubmit={handleSubmit} noValidate>
            <div className="rating-option-modal-rating">
              <span>Rating</span>
              <strong>{selectedRating.emoji} {selectedRating.label}</strong>
              <small>Score {selectedRating.score}</small>
            </div>

            <div className={'field' + (fieldErrors.label ? ' field-error' : '')}>
              <label htmlFor="option-label">Feedback option <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                id="option-label"
                value={form.label}
                onChange={event => updateForm('label', event.target.value)}
                placeholder="Accessible support services"
                aria-invalid={fieldErrors.label ? 'true' : 'false'}
                autoFocus
              />
              {fieldErrors.label ? <p className="field-error-text">{fieldErrors.label}</p> : null}
            </div>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.requiresText}
                onChange={event => updateForm('requiresText', event.target.checked)}
              />
              <span>Requires custom text</span>
            </label>

            <div className="field">
              <label htmlFor="option-status">Status</label>
              <select id="option-status" value={form.status} onChange={event => updateForm('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="button-row rating-option-modal-actions">
              <Button type="submit" icon={editingId ? Save : Plus} disabled={saving}>{saving ? 'Saving' : editingId ? 'Save Changes' : 'Save Option'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Toast message={message} />
    </>
  );
}
