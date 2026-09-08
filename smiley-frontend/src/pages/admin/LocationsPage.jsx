import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useApi } from '../../hooks/useApi.js';
import { locationService } from '../../services/locationService.js';

export default function LocationsPage() {
  const { data: locations, loading, error, reload } = useApi(() => locationService.listAll(), []);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await locationService.create(form);
      setForm({ name: '', description: '', status: 'active' });
      await reload();
      setMessage('Location saved');
    } catch (err) {
      setMessage(err.message || 'Unable to save location');
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    setMessage('');
    try {
      await locationService.deactivate(id);
      await reload();
      setMessage('Location deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to deactivate location');
    }
  }

  return (
    <>
      <div className="page-title">
        <h1>Locations</h1>
        <p>Kiosk locations</p>
      </div>
      <section className="data-panel">
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="locationName">Location name</label>
            <input
              id="locationName"
              value={form.name}
              onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
              placeholder="Student Center"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="locationDescription">Description</label>
            <input
              id="locationDescription"
              value={form.description}
              onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
              placeholder="Main kiosk area"
            />
          </div>
          <div className="button-row">
            <Button type="submit" icon={Plus} disabled={saving}>{saving ? 'Saving' : 'Add Location'}</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={() => reload()}>Refresh</Button>
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
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(locations || []).map(location => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>{location.name}</td>
                  <td>{location.description}</td>
                  <td>{location.status}</td>
                  <td>
                    <Button variant="danger" icon={Trash2} onClick={() => deactivate(location.id)}>Deactivate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !locations?.length ? <div className="empty-state">No locations found.</div> : null}
      </section>
      <Toast message={message} />
    </>
  );
}
