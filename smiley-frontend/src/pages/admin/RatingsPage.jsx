import { CheckCircle, Edit2, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { feedbackOptionService } from '../../services/feedbackOptionService.js';
import { ratingService } from '../../services/ratingService.js';
import { useApi } from '../../hooks/useApi.js';
import { BADGE_BASE, MUTED_TEXT, StatusBadge } from '../../components/admin/tableStyles.jsx';
import { ACTIONS, CARD_EYEBROW, CHECKBOX_FIELD, ERROR_TEXT, FORM, INPUT, LABEL, REQUIRED_MARK, inputClass, labelClass } from '../../components/admin/formStyles.jsx';

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

        <div className="grid gap-5">
          {ratingOptions.map(rating => (
            <article key={rating.id} className="grid gap-4 rounded-2xl border border-[var(--mcu-purple)]/12 bg-white p-5 shadow-[0_14px_34px_rgba(23,32,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--mcu-purple)]/10 to-[var(--mcu-gold)]/20 text-2xl">
                    {rating.emoji}
                  </span>
                  <div className="grid gap-0.5">
                    <strong className="text-lg text-[#21112c]">{rating.label}</strong>
                    <span className={MUTED_TEXT}>Score {rating.score}</span>
                  </div>
                </div>
                <Button variant="secondary" icon={Plus} onClick={() => startAdd(rating)}>Add Option</Button>
              </div>

              <div className="grid gap-2.5">
                {optionsLoading ? <Loading label="Loading feedback options" /> : null}
                {!optionsLoading && (optionsByRating[String(rating.id)] || []).map(option => (
                  <div key={option.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5eaee] bg-white px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-normal text-[#21112c]">{option.label}</span>
                      {option.requiresText || option.requires_text ? (
                        <span className={`${BADGE_BASE} bg-[var(--mcu-purple)]/10 text-[var(--mcu-purple-panther)]`}>Requires text</span>
                      ) : null}
                      <StatusBadge status={option.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" icon={Edit2} iconOnly aria-label="Edit feedback option" onClick={() => startEdit(option)}>Edit</Button>
                      {option.status === 'inactive' ? (
                        <Button variant="primary" icon={CheckCircle} iconOnly aria-label="Activate feedback option" onClick={() => setOptionStatus(option, 'active')}>Activate</Button>
                      ) : (
                        <Button variant="danger" icon={Trash2} iconOnly aria-label="Deactivate feedback option" onClick={() => setOptionStatus(option, 'inactive')}>Deactivate</Button>
                      )}
                    </div>
                  </div>
                ))}
                {!optionsLoading && !(optionsByRating[String(rating.id)] || []).length ? (
                  <div className="rounded-xl border border-dashed border-[#e5eaee] px-4 py-6 text-center text-sm text-[#63707c]">No feedback options yet.</div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedRating ? (
        <Modal title={editingId ? 'Edit Feedback Option' : 'Add Feedback Option'} onClose={closeModal} footer={null}>
          <form className={FORM} onSubmit={handleSubmit} noValidate>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#dce6ec] bg-gradient-to-br from-[rgba(255,247,229,0.9)] to-white px-4 py-3.5">
              <span className={CARD_EYEBROW}>Rating</span>
              <strong className="text-[1.05rem] text-[#21112c]">{selectedRating.emoji} {selectedRating.label}</strong>
              <small className="ml-auto text-sm font-normal text-[#64748b]">Score {selectedRating.score}</small>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="option-label" className={labelClass(fieldErrors.label)}>
                Feedback option <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <input
                id="option-label"
                className={inputClass(fieldErrors.label)}
                value={form.label}
                onChange={event => updateForm('label', event.target.value)}
                placeholder="Accessible support services"
                aria-invalid={fieldErrors.label ? 'true' : 'false'}
                autoFocus
              />
              {fieldErrors.label ? <p className={ERROR_TEXT}>{fieldErrors.label}</p> : null}
            </div>

            <label className={CHECKBOX_FIELD}>
              <input
                type="checkbox"
                checked={form.requiresText}
                onChange={event => updateForm('requiresText', event.target.checked)}
              />
              <span>Requires custom text</span>
            </label>

            <div className="grid gap-1.5">
              <label htmlFor="option-status" className={LABEL}>Status</label>
              <select id="option-status" className={INPUT} value={form.status} onChange={event => updateForm('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className={ACTIONS}>
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
