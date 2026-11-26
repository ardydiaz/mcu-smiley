import { CheckCircle, Edit2, Plus, RefreshCw, Save, Trash2, Unplug, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { DataTablePagination, DataTableSummary, DataTableToolbar } from '../../components/admin/DataTableControls.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { locationService } from '../../services/locationService.js';
import { terminalService } from '../../services/terminalService.js';
import { useApi } from '../../hooks/useApi.js';
import { useDataTable } from '../../hooks/useDataTable.js';
import { formatDateTime } from '../../utils/helpers.js';
import { MUTED_TEXT, StatusBadge, TABLE, TABLE_WRAP, TD, TH, TR } from '../../components/admin/tableStyles.jsx';
import { ACTIONS, ERROR_TEXT, FORM, HINT, INPUT, LABEL, REQUIRED_MARK, labelClass, inputClass } from '../../components/admin/formStyles.jsx';

const emptyForm = { locationId: '', terminalCode: '', name: '', status: 'active' };

function getFieldErrors(error) {
  const errors = error?.payload?.errors || [];
  return errors.reduce((fields, item) => {
    if (item.field) fields[item.field] = item.message;
    return fields;
  }, {});
}

export default function TerminalsPage() {
  const { data: terminals, loading, error, reload } = useApi(() => terminalService.listAll(), []);
  const { data: locations, loading: locationsLoading, error: locationsError, reload: reloadLocations } = useApi(() => locationService.list(), []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [message, setMessage] = useState('');
  const locationOptions = locations || [];
  const table = useDataTable(
    terminals || [],
    terminal => [
      terminal.location_name,
      terminal.location_id,
      terminal.terminal_code,
      terminal.name,
      terminal.status,
      terminal.department_names,
    ].filter(Boolean).join(' '),
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

  function startEdit(terminal) {
    setEditId(terminal.id);
    setEditFieldErrors({});
    setEditForm({
      locationId: String(terminal.location_id || ''),
      terminalCode: terminal.terminal_code || '',
      name: terminal.name || '',
      status: terminal.status || 'active',
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
      await terminalService.create({ ...form, locationId: Number(form.locationId) });
      closeAddModal();
      await reload();
      setMessage('Terminal saved');
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to save terminal');
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
      await terminalService.update(editId, { ...editForm, locationId: Number(editForm.locationId) });
      closeEditModal();
      await reload();
      setMessage('Terminal updated');
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setEditFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to update terminal');
      }
    } finally {
      setEditSaving(false);
    }
  }

  async function setTerminalStatus(terminal, status) {
    setMessage('');
    try {
      await terminalService.update(terminal.id, {
        locationId: Number(terminal.location_id),
        terminalCode: terminal.terminal_code,
        name: terminal.name,
        status,
      });
      await reload();
      setMessage(status === 'active' ? 'Terminal activated' : 'Terminal deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to update terminal');
    }
  }

  async function releaseReservation(terminal) {
    setMessage('');
    try {
      const result = await terminalService.releaseReservation(terminal.id);
      await reload();
      setMessage(result.released ? 'Kiosk reservation released - the tablet will need to reselect this terminal' : 'Terminal was not reserved');
    } catch (err) {
      setMessage(err.message || 'Unable to release reservation');
    }
  }

  function refreshAll() {
    reload();
    reloadLocations();
  }

  function renderLocationHint(errorId) {
    return (
      <>
        {!locationsLoading && !locationOptions.length ? (
          <p className={HINT}>No active locations yet. Create one in Management - Locations first.</p>
        ) : null}
        {locationsError ? <p id={errorId} className={HINT}>{locationsError}</p> : null}
      </>
    );
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Terminals</h1>
          <p>Kiosk terminals</p>
        </div>
        <div className="button-row table-action-row">
          <Button icon={Plus} onClick={openAddModal}>Add Terminal</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={refreshAll}>Refresh</Button>
        </div>
      </div>

      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        <DataTableToolbar table={table} searchPlaceholder="Search terminals..." />
        <DataTableSummary table={table} itemLabel="terminals" />
        <div className={TABLE_WRAP}>
          <table className={`${TABLE} min-w-[880px]`}>
            <thead>
              <tr>
                <th className={TH}>Location</th>
                <th className={TH}>Code</th>
                <th className={TH}>Name</th>
                <th className={TH}>Department</th>
                <th className={TH}>Status</th>
                <th className={TH}>Kiosk</th>
                <th className={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {table.pageItems.map(terminal => (
                <tr key={terminal.id} className={TR}>
                  <td className={TD}>{terminal.location_name} #{terminal.location_id}</td>
                  <td className={TD}>{terminal.terminal_code}</td>
                  <td className={TD}>{terminal.name}</td>
                  <td className={TD}>{terminal.department_names || <span className={MUTED_TEXT}>Unassigned</span>}</td>
                  <td className={TD}><StatusBadge status={terminal.status} /></td>
                  <td className={TD}>
                    {terminal.reserved_by_device_id ? (
                      <div className="grid gap-0.5">
                        <StatusBadge status="pending" />
                        <span className={MUTED_TEXT}>Last seen {formatDateTime(terminal.reserved_last_seen_at)}</span>
                      </div>
                    ) : (
                      <StatusBadge status="active" />
                    )}
                  </td>
                  <td className={TD}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" icon={Edit2} iconOnly aria-label="Edit terminal" onClick={() => startEdit(terminal)}>Edit</Button>
                      {terminal.reserved_by_device_id ? (
                        <Button variant="secondary" icon={Unplug} iconOnly aria-label="Release kiosk reservation" onClick={() => releaseReservation(terminal)}>Release</Button>
                      ) : null}
                      {terminal.status === 'inactive' ? (
                        <Button variant="primary" icon={CheckCircle} iconOnly aria-label="Activate terminal" onClick={() => setTerminalStatus(terminal, 'active')}>Activate</Button>
                      ) : (
                        <Button variant="danger" icon={Trash2} iconOnly aria-label="Deactivate terminal" onClick={() => setTerminalStatus(terminal, 'inactive')}>Deactivate</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !table.pageItems.length ? <div className="empty-state">No terminals found.</div> : null}
        <DataTablePagination table={table} />
      </section>

      {addOpen ? (
        <Modal title="Add Terminal" onClose={closeAddModal} footer={null}>
          <form className={FORM} onSubmit={handleSubmit} noValidate>
            <div className="grid gap-1.5">
              <label htmlFor="locationId" className={labelClass(fieldErrors.locationId)}>
                Location <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <select
                id="locationId"
                className={inputClass(fieldErrors.locationId)}
                value={form.locationId}
                onChange={event => updateForm('locationId', event.target.value)}
                disabled={locationsLoading || !locationOptions.length}
                aria-invalid={fieldErrors.locationId ? 'true' : 'false'}
                aria-describedby={fieldErrors.locationId ? 'terminal-location-error' : undefined}
              >
                <option value="">{locationsLoading ? 'Loading locations...' : 'Select location'}</option>
                {locationOptions.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
              {fieldErrors.locationId ? <p id="terminal-location-error" className={ERROR_TEXT}>{fieldErrors.locationId}</p> : null}
              {renderLocationHint('terminal-location-hint')}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="terminalCode" className={labelClass(fieldErrors.terminalCode)}>
                Terminal code <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <input
                id="terminalCode"
                className={inputClass(fieldErrors.terminalCode)}
                value={form.terminalCode}
                onChange={event => updateForm('terminalCode', event.target.value)}
                aria-invalid={fieldErrors.terminalCode ? 'true' : 'false'}
                aria-describedby={fieldErrors.terminalCode ? 'terminal-code-error' : undefined}
                autoFocus
              />
              {fieldErrors.terminalCode ? <p id="terminal-code-error" className={ERROR_TEXT}>{fieldErrors.terminalCode}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="terminalName" className={labelClass(fieldErrors.name)}>
                Terminal name <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <input
                id="terminalName"
                className={inputClass(fieldErrors.name)}
                value={form.name}
                onChange={event => updateForm('name', event.target.value)}
                aria-invalid={fieldErrors.name ? 'true' : 'false'}
                aria-describedby={fieldErrors.name ? 'terminal-name-error' : undefined}
              />
              {fieldErrors.name ? <p id="terminal-name-error" className={ERROR_TEXT}>{fieldErrors.name}</p> : null}
            </div>
            <div className={ACTIONS}>
              <Button type="submit" icon={Plus} disabled={saving || locationsLoading || !locationOptions.length}>{saving ? 'Saving' : 'Add Terminal'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeAddModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editId ? (
        <Modal title="Edit Terminal" onClose={closeEditModal} footer={null}>
          <form className={FORM} onSubmit={handleEditSubmit} noValidate>
            <div className="grid gap-1.5">
              <label htmlFor="editTerminalLocation" className={labelClass(editFieldErrors.locationId)}>
                Location <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <select
                id="editTerminalLocation"
                className={inputClass(editFieldErrors.locationId)}
                value={editForm.locationId}
                onChange={event => updateEditForm('locationId', event.target.value)}
                disabled={locationsLoading || !locationOptions.length}
                aria-invalid={editFieldErrors.locationId ? 'true' : 'false'}
              >
                <option value="">{locationsLoading ? 'Loading locations...' : 'Select location'}</option>
                {locationOptions.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
              {editFieldErrors.locationId ? <p className={ERROR_TEXT}>{editFieldErrors.locationId}</p> : null}
              {renderLocationHint('edit-terminal-location-hint')}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="editTerminalCode" className={labelClass(editFieldErrors.terminalCode)}>
                Terminal code <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <input
                id="editTerminalCode"
                className={inputClass(editFieldErrors.terminalCode)}
                value={editForm.terminalCode}
                onChange={event => updateEditForm('terminalCode', event.target.value)}
                aria-invalid={editFieldErrors.terminalCode ? 'true' : 'false'}
                autoFocus
              />
              {editFieldErrors.terminalCode ? <p className={ERROR_TEXT}>{editFieldErrors.terminalCode}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="editTerminalName" className={labelClass(editFieldErrors.name)}>
                Terminal name <span className={REQUIRED_MARK} aria-hidden="true">*</span>
              </label>
              <input
                id="editTerminalName"
                className={inputClass(editFieldErrors.name)}
                value={editForm.name}
                onChange={event => updateEditForm('name', event.target.value)}
                aria-invalid={editFieldErrors.name ? 'true' : 'false'}
              />
              {editFieldErrors.name ? <p className={ERROR_TEXT}>{editFieldErrors.name}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="editTerminalStatus" className={LABEL}>Status</label>
              <select id="editTerminalStatus" className={INPUT} value={editForm.status} onChange={event => updateEditForm('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className={ACTIONS}>
              <Button type="submit" icon={Save} disabled={editSaving || locationsLoading || !locationOptions.length}>{editSaving ? 'Saving' : 'Save Changes'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeEditModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Toast message={message} />
    </>
  );
}
