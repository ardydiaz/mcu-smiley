import { Settings2, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { DataTablePagination, DataTableSummary, DataTableToolbar } from '../../components/admin/DataTableControls.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDataTable } from '../../hooks/useDataTable.js';
import { authService } from '../../services/authService.js';
import { menuPermissions } from '../../utils/menuPermissions.js';

function StatusBadge({ status }) {
  return <span className={'status-badge status-' + status}>{status}</span>;
}

export default function AdminUsersPage() {
  const { data, loading, error, reload } = useApi(() => authService.listUsers(), []);
  const [savingId, setSavingId] = useState(null);
  const [permissionUser, setPermissionUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionError, setPermissionError] = useState('');
  const [message, setMessage] = useState('');
  const users = data || [];
  const table = useDataTable(
    users,
    user => [user.name, user.email, user.role, user.status, user.provider].filter(Boolean).join(' '),
  );

  async function updateAccess(user, role, status, permissions = []) {
    setSavingId(user.id);
    setMessage('');
    try {
      await authService.updateUserAccess(user.id, { role, status, permissions });
      await reload();
      setMessage('User access updated');
      setPermissionUser(null);
    } catch (err) {
      const fieldError = err.payload?.errors?.find?.(item => item.field === 'permissions')?.message;
      if (fieldError) setPermissionError(fieldError);
      setMessage(err.message || 'Unable to update user access');
    } finally {
      setSavingId(null);
    }
  }

  function openPermissionModal(user) {
    setPermissionUser(user);
    setSelectedPermissions(user.permissions || []);
    setPermissionError('');
  }

  function togglePermission(permission) {
    setPermissionError('');
    setSelectedPermissions(current => current.includes(permission)
      ? current.filter(item => item !== permission)
      : [...current, permission]);
  }

  async function saveUserPermissions(event) {
    event.preventDefault();
    if (!selectedPermissions.length) {
      setPermissionError('Select at least one menu for user access');
      return;
    }
    await updateAccess(permissionUser, 'user', 'active', selectedPermissions);
  }

  return (
    <>
      <div className="page-title">
        <h1>Users</h1>
        <p>Approve SSO users and manage admin access</p>
      </div>

      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        <DataTableToolbar table={table} searchPlaceholder="Search users..." />
        <DataTableSummary table={table} itemLabel="users" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Role</th>
                <th>Menus</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {table.pageItems.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.provider || 'local'}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role === 'admin' ? (
                      <span className="muted-text">All menus</span>
                    ) : user.permissions?.length ? (
                      <div className="permission-chip-list">
                        {user.permissions.map(permission => {
                          const label = menuPermissions.find(item => item.key === permission)?.label || permission;
                          return <span key={permission} className="permission-chip">{label}</span>;
                        })}
                      </div>
                    ) : (
                      <span className="muted-text">No menus</span>
                    )}
                  </td>
                  <td><StatusBadge status={user.status} /></td>
                  <td>
                    <div className="button-row table-action-row">
                      {user.status === 'pending' ? (
                        <>
                          <Button icon={ShieldCheck} disabled={savingId === user.id} onClick={() => updateAccess(user, 'admin', 'active')}>
                            Approve Admin
                          </Button>
                          <Button variant="secondary" icon={UserCheck} disabled={savingId === user.id} onClick={() => openPermissionModal(user)}>
                            Approve User
                          </Button>
                        </>
                      ) : user.role !== 'admin' ? (
                        <>
                          <Button variant="secondary" icon={Settings2} disabled={savingId === user.id} onClick={() => openPermissionModal(user)}>
                            Menu Access
                          </Button>
                          <Button variant="secondary" icon={ShieldCheck} disabled={savingId === user.id} onClick={() => updateAccess(user, 'admin', 'active')}>
                            Make Admin
                          </Button>
                        </>
                      ) : (
                        <Button variant="secondary" icon={UserCheck} disabled={savingId === user.id} onClick={() => openPermissionModal(user)}>
                          Make User
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !table.pageItems.length ? <div className="empty-state">No users found.</div> : null}
        <DataTablePagination table={table} />
      </section>

      {permissionUser ? (
        <Modal title="Select User Menu Access" onClose={() => setPermissionUser(null)} footer={null}>
          <form className="permission-form" onSubmit={saveUserPermissions}>
            <div className="permission-user-card">
              <span>User</span>
              <strong>{permissionUser.name}</strong>
              <small>{permissionUser.email}</small>
            </div>
            <div className="permission-grid" role="group" aria-label="Allowed menus">
              {menuPermissions.map(permission => (
                <label key={permission.key} className="checkbox-field permission-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.key)}
                    onChange={() => togglePermission(permission.key)}
                  />
                  <span>{permission.label}</span>
                </label>
              ))}
            </div>
            {permissionError ? <p className="field-error-text">{permissionError}</p> : null}
            <div className="button-row rating-option-modal-actions">
              <Button type="submit" icon={UserCheck} disabled={savingId === permissionUser.id}>
                {savingId === permissionUser.id ? 'Saving' : 'Save User Access'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setPermissionUser(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Toast message={message} />
    </>
  );
}
