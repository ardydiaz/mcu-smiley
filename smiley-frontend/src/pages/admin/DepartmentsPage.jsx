import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { departmentService } from '../../services/departmentService.js';
import { useApi } from '../../hooks/useApi.js';

export default function DepartmentsPage() {
  const { data, loading, error, reload } = useApi(() => departmentService.listAll(), []);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await departmentService.create(form);
      setForm({ name: '', description: '', status: 'active' });
      await reload();
      setMessage('Department saved');
    } catch (err) {
      setMessage(err.message || 'Unable to save department');
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    setMessage('');
    try {
      await departmentService.deactivate(id);
      await reload();
      setMessage('Department deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to deactivate department');
    }
  }

  return (
    <>
      <div className="page-title">
        <h1>Departments</h1>
        <p>Manage department choices</p>
      </div>
      <section className="data-panel">
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input id="description" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} />
          </div>
          <div className="button-row">
            <Button type="submit" icon={Plus} disabled={saving}>{saving ? 'Saving' : 'Add Department'}</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={() => reload()}>Refresh</Button>
          </div>
        </form>
      </section>
      {loading ? <Loading /> : null}
      {error ? <div className="empty-state">{error}</div> : null}
      <section className="data-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map(department => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.description}</td>
                  <td>{department.status}</td>
                  <td>
                    <Button variant="danger" icon={Trash2} onClick={() => deactivate(department.id)}>Deactivate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Toast message={message} />
    </>
  );
}
