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
import { KIOSK_PERMISSION, menuPermissions } from '../../utils/menuPermissions.js';
import { formatDateTime } from '../../utils/helpers.js';

const allPermissionDefs = [...menuPermissions, KIOSK_PERMISSION];

function StatusBadge({ status }) {
  return <span className={'status-badge status-' + status}>{status}</span>;
}

function RoleBadge({ role }) {
  return <span className={'role-badge role-badge-' + role}>{role}</span>;
}

function ProviderBadge({ provider }) {
  const value = provider || 'local';
  return <span className={'provider-badge provider-badge-' + value}>{value}</span>;
}

function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
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
        <div className="table-wrap users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Provider</th>
                <th>Role</th>
                <th>Menus</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {table.pageItems.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar" aria-hidden="true">{getInitials(user.name)}</span>
                      <span className="user-cell-text">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </span>
                    </div>
                  </td>
                  <td><ProviderBadge provider={user.provider} /></td>
                  <td><RoleBadge role={user.role} /></td>
                  <td>
                    {user.role === 'admin' ? (
                      <span className="muted-text">All menus</span>
                    ) : user.permissions?.length ? (
                      <div className="permission-chip-list">
                        {user.permissions.map(permission => {
                          const label = allPermissionDefs.find(item => item.key === permission)?.label || permission;
                          return <span key={permission} className="permission-chip">{label}</span>;
                        })}
                      </div>
                    ) : (
                      <span className="muted-text">No menus</span>
                    )}
                  </td>
                  <td><StatusBadge status={user.status} /></td>
                  <td>{user.last_login_at ? formatDateTime(user.last_login_at) : <span className="muted-text">Never</span>}</td>
                  <td>
                    <div className="button-row table-action-row">
                      {user.status === 'pending' ? (
                        <>
                          <Button icon={ShieldCheck} iconOnly aria-label="Approve as admin" disabled={savingId === user.id} onClick={() => updateAccess(user, 'admin', 'active')}>
                            Approve Admin
                          </Button>
                          <Button variant="secondary" icon={UserCheck} iconOnly aria-label="Approve as user" disabled={savingId === user.id} onClick={() => openPermissionModal(user)}>
                            Approve User
                          </Button>
                        </>
                      ) : user.role !== 'admin' ? (
                        <>
                          <Button variant="secondary" icon={Settings2} iconOnly aria-label="Edit menu access" disabled={savingId === user.id} onClick={() => openPermissionModal(user)}>
                            Menu Access
                          </Button>
                          <Button variant="secondary" icon={ShieldCheck} iconOnly aria-label="Make admin" disabled={savingId === user.id} onClick={() => updateAccess(user, 'admin', 'active')}>
                            Make Admin
                          </Button>
                        </>
                      ) : (
                        <Button variant="secondary" icon={UserCheck} iconOnly aria-label="Make user" disabled={savingId === user.id} onClick={() => openPermissionModal(user)}>
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
            <div className="permission-grid" role="group" aria-label="Other access">
              <label key={KIOSK_PERMISSION.key} className="checkbox-field permission-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(KIOSK_PERMISSION.key)}
                  onChange={() => togglePermission(KIOSK_PERMISSION.key)}
                />
                <span>{KIOSK_PERMISSION.label}</span>
              </label>
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
