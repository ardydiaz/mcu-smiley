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
import { BADGE_BASE, MUTED_TEXT, StatusBadge, TABLE, TABLE_WRAP, TD, TH, TR } from '../../components/admin/tableStyles.jsx';
import { ACTIONS, CARD, CARD_EYEBROW, CHECKBOX_FIELD, CHECKBOX_GRID, ERROR_TEXT, FORM } from '../../components/admin/formStyles.jsx';

const allPermissionDefs = [...menuPermissions, KIOSK_PERMISSION];

const ROLE_BADGE_CLASSES = {
  admin: 'bg-gradient-to-br from-[#ffb736]/30 to-[#ffd62e]/25 text-[#7a4a00]',
  user: 'bg-[var(--mcu-purple)]/10 text-[var(--mcu-purple-panther)]',
};

const PROVIDER_BADGE_CLASSES = {
  microsoft: 'bg-blue-600/10 text-blue-700',
  local: 'bg-slate-500/10 text-slate-600',
};

function RoleBadge({ role }) {
  return <span className={`${BADGE_BASE} ${ROLE_BADGE_CLASSES[role] || ROLE_BADGE_CLASSES.user}`}>{role}</span>;
}

function ProviderBadge({ provider }) {
  const value = provider || 'local';
  return <span className={`${BADGE_BASE} ${PROVIDER_BADGE_CLASSES[value] || PROVIDER_BADGE_CLASSES.local}`}>{value}</span>;
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
        <div className={TABLE_WRAP}>
          <table className={`${TABLE} min-w-[840px]`}>
            <thead>
              <tr>
                <th className={TH}>User</th>
                <th className={TH}>Provider</th>
                <th className={TH}>Role</th>
                <th className={TH}>Menus</th>
                <th className={TH}>Status</th>
                <th className={TH}>Last Login</th>
                <th className={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {table.pageItems.map(user => (
                <tr key={user.id} className={TR}>
                  <td className={TD}>
                    <div className="flex min-w-[13rem] items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--mcu-purple)] to-[var(--mcu-gold)] text-sm font-normal uppercase text-white shadow-[0_6px_14px_rgba(46,0,70,0.18)]"
                      >
                        {getInitials(user.name)}
                      </span>
                      <span className="grid min-w-0 gap-0.5">
                        <span className="truncate text-[0.95rem] font-normal text-[#21112c]">{user.name}</span>
                        <span className="truncate text-[0.84rem] text-[#63707c]">{user.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className={TD}><ProviderBadge provider={user.provider} /></td>
                  <td className={TD}><RoleBadge role={user.role} /></td>
                  <td className={TD}>
                    {user.role === 'admin' ? (
                      <span className={MUTED_TEXT}>All menus</span>
                    ) : user.permissions?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.permissions.map(permission => {
                          const label = allPermissionDefs.find(item => item.key === permission)?.label || permission;
                          return (
                            <span key={permission} className={`${BADGE_BASE} bg-[var(--mcu-purple)]/10 text-[var(--mcu-purple-panther)]`}>
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className={MUTED_TEXT}>No menus</span>
                    )}
                  </td>
                  <td className={TD}><StatusBadge status={user.status} /></td>
                  <td className={`${TD} text-sm text-[#21112c]`}>
                    {user.last_login_at ? formatDateTime(user.last_login_at) : <span className="text-[#63707c]">Never</span>}
                  </td>
                  <td className={TD}>
                    <div className="flex flex-wrap items-center gap-2">
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
          <form className={FORM} onSubmit={saveUserPermissions}>
            <div className={CARD}>
              <span className={CARD_EYEBROW}>User</span>
              <strong className="text-[#21112c]">{permissionUser.name}</strong>
              <small className="text-sm font-normal text-[#64748b]">{permissionUser.email}</small>
            </div>
            <div className={CHECKBOX_GRID} role="group" aria-label="Allowed menus">
              {menuPermissions.map(permission => (
                <label key={permission.key} className={CHECKBOX_FIELD}>
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.key)}
                    onChange={() => togglePermission(permission.key)}
                  />
                  <span>{permission.label}</span>
                </label>
              ))}
            </div>
            <div className={CHECKBOX_GRID} role="group" aria-label="Other access">
              <label key={KIOSK_PERMISSION.key} className={CHECKBOX_FIELD}>
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(KIOSK_PERMISSION.key)}
                  onChange={() => togglePermission(KIOSK_PERMISSION.key)}
                />
                <span>{KIOSK_PERMISSION.label}</span>
              </label>
            </div>
            {permissionError ? <p className={ERROR_TEXT}>{permissionError}</p> : null}
            <div className={ACTIONS}>
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
