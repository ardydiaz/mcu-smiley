import { CheckCircle, Edit2, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { DataTablePagination, DataTableSummary, DataTableToolbar } from '../../components/admin/DataTableControls.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDataTable } from '../../hooks/useDataTable.js';
import { locationService } from '../../services/locationService.js';
import { StatusBadge, TABLE, TABLE_WRAP, TD, TH, TR } from '../../components/admin/tableStyles.jsx';
import { ACTIONS, ERROR_TEXT, FORM, INPUT, LABEL, REQUIRED_MARK, labelClass, inputClass } from '../../components/admin/formStyles.jsx';

const emptyForm = { name: '', description: '', status: 'active' };

function getFieldErrors(error) {
  const errors = error?.payload?.errors || [];
  return errors.reduce((fields, item) => {
    if (item.field) fields[item.field] = item.message;
    return fields;
  }, {});
}

export default function LocationsPage() {
  const { data: locations, loading, error, reload } = useApi(() => locationService.listAll(), []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [message, setMessage] = useState('');
  const table = useDataTable(
    locations || [],
    location => [location.id, location.name, location.description, location.status].filter(Boolean).join(' '),
  );

  function openAddModal() {
    setForm(emptyForm);
    setFieldErrors({});
    setAddOpen(true);
  }

  function closeAddModal() {
    setAddOpen(false);
    setFieldErrors({});
    setForm(emptyForm);
  }

  function updateForm(name, value) {
    setForm(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: '' }));
  }

  function updateEditForm(name, value) {
    setEditForm(current => ({ ...current, [name]: value }));
    setEditFieldErrors(current => ({ ...current, [name]: '' }));
  }

  function startEdit(location) {
    setEditId(location.id);
    setEditFieldErrors({});
    setEditForm({
      name: location.name || '',
      description: location.description || '',
      status: location.status || 'active',
    });
  }

  function closeEditModal() {
    setEditId(null);
    setEditFieldErrors({});
    setEditForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setFieldErrors({});
    try {
      await locationService.create(form);
      closeAddModal();
      await reload();
      setMessage('Location saved');
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to save location');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    setEditSaving(true);
    setMessage('');
    setEditFieldErrors({});
    try {
      await locationService.update(editId, editForm);
      closeEditModal();
      await reload();
      setMessage('Location updated');
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setEditFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to update location');
      }
    } finally {
      setEditSaving(false);
    }
  }

  async function setLocationStatus(location, status) {
    setMessage('');
    try {
      await locationService.update(location.id, {
        name: location.name,
        description: location.description,
        status,
      });
      await reload();
      setMessage(status === 'active' ? 'Location activated' : 'Location deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to update location');
    }
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Locations</h1>
          <p>Kiosk locations</p>
        </div>
        <div className="button-row table-action-row">
          <Button icon={Plus} onClick={openAddModal}>Add Location</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={() => reload()}>Refresh</Button>
        </div>
      </div>

      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        <DataTableToolbar table={table} searchPlaceholder="Search locations..." />
        <DataTableSummary table={table} itemLabel="locations" />
        <div className={TABLE_WRAP}>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>ID</th>
                <th className={TH}>Name</th>
                <th className={TH}>Description</th>
                <th className={TH}>Status</th>
                <th className={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {table.pageItems.map(location => (
                <tr key={location.id} className={TR}>
                  <td className={TD}>{location.id}</td>
                  <td className={TD}>{location.name}</td>
                  <td className={TD}>{location.description}</td>
                  <td className={TD}><StatusBadge status={location.status} /></td>
                  <td className={TD}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" icon={Edit2} iconOnly aria-label="Edit location" onClick={() => startEdit(location)}>Edit</Button>
                      {location.status === 'inactive' ? (
                        <Button variant="primary" icon={CheckCircle} iconOnly aria-label="Activate location" onClick={() => setLocationStatus(location, 'active')}>Activate</Button>
                      ) : (
                        <Button variant="danger" icon={Trash2} iconOnly aria-label="Deactivate location" onClick={() => setLocationStatus(location, 'inactive')}>Deactivate</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !table.pageItems.length ? <div className="empty-state">No locations found.</div> : null}
        <DataTablePagination table={table} />
      </section>

      {addOpen ? (
        <Modal title="Add Location" onClose={closeAddModal} footer={null}>
          <form className={FORM} onSubmit={handleSubmit} noValidate>
            <div className="grid gap-1.5">
              <label htmlFor="locationName" className={labelClass(fieldErrors.name)}>Location name <span className={REQUIRED_MARK} aria-hidden="true">*</span></label>
              <input
                id="locationName"
                className={inputClass(fieldErrors.name)}
                value={form.name}
                onChange={event => updateForm('name', event.target.value)}
                placeholder="Student Center"
                aria-invalid={fieldErrors.name ? 'true' : 'false'}
                aria-describedby={fieldErrors.name ? 'location-name-error' : undefined}
                autoFocus
              />
              {fieldErrors.name ? <p id="location-name-error" className={ERROR_TEXT}>{fieldErrors.name}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="locationDescription" className={labelClass(fieldErrors.description)}>Description <span className={REQUIRED_MARK} aria-hidden="true">*</span></label>
              <input
                id="locationDescription"
                className={inputClass(fieldErrors.description)}
                value={form.description}
                onChange={event => updateForm('description', event.target.value)}
                placeholder="Main kiosk area"
                aria-invalid={fieldErrors.description ? 'true' : 'false'}
                aria-describedby={fieldErrors.description ? 'location-description-error' : undefined}
              />
              {fieldErrors.description ? <p id="location-description-error" className={ERROR_TEXT}>{fieldErrors.description}</p> : null}
            </div>
            <div className={ACTIONS}>
              <Button type="submit" icon={Plus} disabled={saving}>{saving ? 'Saving' : 'Add Location'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeAddModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editId ? (
        <Modal title="Edit Location" onClose={closeEditModal} footer={null}>
          <form className={FORM} onSubmit={handleEditSubmit} noValidate>
            <div className="grid gap-1.5">
              <label htmlFor="editLocationName" className={labelClass(editFieldErrors.name)}>Location name <span className={REQUIRED_MARK} aria-hidden="true">*</span></label>
              <input
                id="editLocationName"
                className={inputClass(editFieldErrors.name)}
                value={editForm.name}
                onChange={event => updateEditForm('name', event.target.value)}
                aria-invalid={editFieldErrors.name ? 'true' : 'false'}
                autoFocus
              />
              {editFieldErrors.name ? <p className={ERROR_TEXT}>{editFieldErrors.name}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="editLocationDescription" className={labelClass(editFieldErrors.description)}>Description <span className={REQUIRED_MARK} aria-hidden="true">*</span></label>
              <input
                id="editLocationDescription"
                className={inputClass(editFieldErrors.description)}
                value={editForm.description}
                onChange={event => updateEditForm('description', event.target.value)}
                aria-invalid={editFieldErrors.description ? 'true' : 'false'}
              />
              {editFieldErrors.description ? <p className={ERROR_TEXT}>{editFieldErrors.description}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="editLocationStatus" className={LABEL}>Status</label>
              <select id="editLocationStatus" className={INPUT} value={editForm.status} onChange={event => updateEditForm('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className={ACTIONS}>
              <Button type="submit" icon={Save} disabled={editSaving}>{editSaving ? 'Saving' : 'Save Changes'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeEditModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Toast message={message} />
    </>
  );
}
