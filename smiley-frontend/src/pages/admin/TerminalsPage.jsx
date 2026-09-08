import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { locationService } from '../../services/locationService.js';
import { terminalService } from '../../services/terminalService.js';
import { useApi } from '../../hooks/useApi.js';

export default function TerminalsPage() {
  const { data: terminals, loading, error, reload } = useApi(() => terminalService.listAll(), []);
  const { data: locations, loading: locationsLoading, error: locationsError, reload: reloadLocations } = useApi(() => locationService.list(), []);
  const [form, setForm] = useState({ locationId: '', terminalCode: '', name: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const locationOptions = locations || [];

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await terminalService.create({ ...form, locationId: Number(form.locationId) });
      setForm({ locationId: '', terminalCode: '', name: '', status: 'active' });
      await reload();
      setMessage('Terminal saved');
    } catch (err) {
      setMessage(err.message || 'Unable to save terminal');
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    setMessage('');
    try {
      await terminalService.deactivate(id);
      await reload();
      setMessage('Terminal deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to deactivate terminal');
    }
  }

  return (
    <>
      <div className="page-title">
        <h1>Terminals</h1>
        <p>Kiosk terminals</p>
      </div>
      <section className="data-panel">
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="locationId">Location</label>
            <select
              id="locationId"
              value={form.locationId}
              onChange={event => setForm(current => ({ ...current, locationId: event.target.value }))}
              disabled={locationsLoading || !locationOptions.length}
              required
            >
              <option value="">{locationsLoading ? 'Loading locations...' : 'Select location'}</option>
              {locationOptions.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            {!locationsLoading && !locationOptions.length ? (
              <p className="field-hint">No active locations yet. Create one in Management → Locations first.</p>
            ) : null}
            {locationsError ? <p className="field-hint">{locationsError}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="terminalCode">Terminal code</label>
            <input
              id="terminalCode"
              value={form.terminalCode}
              onChange={event => setForm(current => ({ ...current, terminalCode: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="terminalName">Terminal name</label>
            <input
              id="terminalName"
              value={form.name}
              onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div className="button-row">
            <Button type="submit" icon={Plus} disabled={saving || locationsLoading || !locationOptions.length}>{saving ? 'Saving' : 'Add Terminal'}</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { reload(); reloadLocations(); }}>Refresh</Button>
          </div>
        </form>
      </section>
      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Code</th>
                <th>Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(terminals || []).map(terminal => (
                <tr key={terminal.id}>
                  <td>{terminal.location_name} #{terminal.location_id}</td>
                  <td>{terminal.terminal_code}</td>
                  <td>{terminal.name}</td>
                  <td>{terminal.status}</td>
                  <td>
                    <Button variant="danger" icon={Trash2} onClick={() => deactivate(terminal.id)}>Deactivate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !terminals?.length ? <div className="empty-state">No terminals found.</div> : null}
      </section>
      <Toast message={message} />
    </>
  );
}
