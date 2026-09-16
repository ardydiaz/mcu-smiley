import { Edit2, Link2, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { DataTablePagination, DataTableSummary, DataTableToolbar } from '../../components/admin/DataTableControls.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { departmentService } from '../../services/departmentService.js';
import { terminalDepartmentService } from '../../services/terminalDepartmentService.js';
import { terminalService } from '../../services/terminalService.js';
import { useApi } from '../../hooks/useApi.js';
import { useDataTable } from '../../hooks/useDataTable.js';

export default function TerminalDepartmentsPage() {
  const { data: assignments, loading, error, reload } = useApi(() => terminalDepartmentService.list(), []);
  const { data: terminals, loading: terminalsLoading, error: terminalsError, reload: reloadTerminals } = useApi(() => terminalService.list(), []);
  const { data: departments, loading: departmentsLoading, error: departmentsError, reload: reloadDepartments } = useApi(() => departmentService.list(), []);
  const [assignOpen, setAssignOpen] = useState(false);
  const [terminalId, setTerminalId] = useState('');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
  const [editGroup, setEditGroup] = useState(null);
  const [editTerminalId, setEditTerminalId] = useState('');
  const [editDepartmentIds, setEditDepartmentIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [message, setMessage] = useState('');

  const terminalOptions = terminals || [];
  const departmentOptions = departments || [];
  const selectedTerminalAssignments = (assignments || []).filter(assignment => String(assignment.terminal_id) === String(terminalId));
  const assignedDepartmentIds = new Set(selectedTerminalAssignments.map(assignment => String(assignment.department_id)));
  const selectedDepartmentSet = new Set(selectedDepartmentIds);
  const selectedDepartments = getDepartmentsForIds(selectedDepartmentIds, departmentOptions, selectedTerminalAssignments);
  const availableDepartments = departmentOptions.filter(department => (
    !selectedDepartmentSet.has(String(department.id)) &&
    !assignedDepartmentIds.has(String(department.id))
  ));
  const groupedAssignments = Object.values((assignments || []).reduce((groups, assignment) => {
    const key = String(assignment.terminal_id);
    if (!groups[key]) {
      groups[key] = {
        terminal_id: assignment.terminal_id,
        terminal_code: assignment.terminal_code,
        terminal_name: assignment.terminal_name,
        terminal_status: assignment.terminal_status,
        departments: [],
      };
    }
    groups[key].departments.push(assignment);
    return groups;
  }, {}));
  const table = useDataTable(
    groupedAssignments,
    group => [
      group.terminal_code,
      group.terminal_name,
      group.terminal_status,
      ...group.departments.flatMap(department => [department.department_name, department.department_status]),
    ].filter(Boolean).join(' '),
  );
  const editDepartmentSet = new Set(editDepartmentIds);
  const editTargetAssignments = (assignments || []).filter(assignment => String(assignment.terminal_id) === String(editTerminalId));
  const editTargetDepartmentIds = new Set(editTargetAssignments.map(assignment => String(assignment.department_id)));
  const editOriginalDepartmentIds = new Set((editGroup?.departments || []).map(department => String(department.department_id)));
  const editSelectedDepartments = getDepartmentsForIds(editDepartmentIds, departmentOptions, editGroup?.departments || []);
  const editAvailableDepartments = departmentOptions.filter(department => {
    const id = String(department.id);
    if (editDepartmentSet.has(id)) return false;
    if (editTargetDepartmentIds.has(id) && !editOriginalDepartmentIds.has(id)) return false;
    return true;
  });
  const canSubmit = Boolean(!saving && terminalId && selectedDepartmentIds.length);
  const canSaveEdit = Boolean(!editSaving && editGroup && editTerminalId);

  function getDepartmentsForIds(ids, activeDepartments, assignedRows = []) {
    return ids.map(id => {
      const activeDepartment = activeDepartments.find(department => String(department.id) === String(id));
      if (activeDepartment) return activeDepartment;
      const assignedDepartment = assignedRows.find(row => String(row.department_id) === String(id));
      return assignedDepartment ? { id, name: assignedDepartment.department_name, status: assignedDepartment.department_status } : null;
    }).filter(Boolean);
  }

  function openAssignModal() {
    setTerminalId('');
    setSelectedDepartmentIds([]);
    setAssignOpen(true);
    setMessage('');
  }

  function closeAssignModal() {
    setAssignOpen(false);
    setTerminalId('');
    setSelectedDepartmentIds([]);
  }

  function openEditModal(group) {
    setEditGroup(group);
    setEditTerminalId(String(group.terminal_id));
    setEditDepartmentIds(group.departments.map(department => String(department.department_id)));
    setMessage('');
  }

  function closeEditModal() {
    setEditGroup(null);
    setEditTerminalId('');
    setEditDepartmentIds([]);
  }

  function handleTerminalChange(event) {
    setTerminalId(event.target.value);
    setSelectedDepartmentIds([]);
    setMessage('');
  }

  function addDepartment(departmentId) {
    if (!departmentId) return;
    if (assignedDepartmentIds.has(String(departmentId))) {
      const department = selectedTerminalAssignments.find(assignment => String(assignment.department_id) === String(departmentId));
      setMessage((department?.department_name || 'Department') + ' is already assigned to this terminal.');
      return;
    }
    setSelectedDepartmentIds(current => current.includes(departmentId) ? current : [...current, departmentId]);
  }

  function removeSelectedDepartment(departmentId) {
    setSelectedDepartmentIds(current => current.filter(id => id !== departmentId));
  }

  function addEditDepartment(departmentId) {
    if (!departmentId) return;
    if (editTargetDepartmentIds.has(String(departmentId)) && !editOriginalDepartmentIds.has(String(departmentId))) {
      const department = editTargetAssignments.find(assignment => String(assignment.department_id) === String(departmentId));
      setMessage((department?.department_name || 'Department') + ' is already assigned to the selected terminal.');
      return;
    }
    setEditDepartmentIds(current => current.includes(departmentId) ? current : [...current, departmentId]);
  }

  function removeEditDepartment(departmentId) {
    setEditDepartmentIds(current => current.filter(id => id !== departmentId));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await Promise.all(selectedDepartmentIds.map(departmentId => terminalDepartmentService.create({
        terminalId: Number(terminalId),
        departmentId: Number(departmentId),
      })));
      const savedCount = selectedDepartmentIds.length;
      closeAssignModal();
      await reload();
      setMessage(savedCount === 1 ? 'Terminal department saved' : 'Terminal departments saved');
    } catch (err) {
      setMessage(err.message || 'Unable to save terminal departments');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    if (!editGroup) return;
    setEditSaving(true);
    setMessage('');
    try {
      const selectedIds = editDepartmentIds.map(String);
      const sameTerminal = String(editTerminalId) === String(editGroup.terminal_id);
      const selectedSet = new Set(selectedIds);
      const assignmentsToRemove = sameTerminal
        ? editGroup.departments.filter(department => !selectedSet.has(String(department.department_id)))
        : editGroup.departments;
      const existingTargetSet = sameTerminal
        ? new Set(editGroup.departments.map(department => String(department.department_id)))
        : editTargetDepartmentIds;
      const departmentsToAdd = selectedIds.filter(departmentId => !existingTargetSet.has(departmentId));

      await Promise.all([
        ...assignmentsToRemove.map(department => terminalDepartmentService.delete(department.id)),
        ...departmentsToAdd.map(departmentId => terminalDepartmentService.create({
          terminalId: Number(editTerminalId),
          departmentId: Number(departmentId),
        })),
      ]);

      closeEditModal();
      await reload();
      setMessage('Terminal departments updated');
    } catch (err) {
      setMessage(err.message || 'Unable to update terminal departments');
    } finally {
      setEditSaving(false);
    }
  }

  async function removeAssignment(id) {
    setMessage('');
    try {
      await terminalDepartmentService.delete(id);
      await reload();
      setMessage('Terminal department removed');
    } catch (err) {
      setMessage(err.message || 'Unable to remove terminal department');
    }
  }

  function refreshAll() {
    reload();
    reloadTerminals();
    reloadDepartments();
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Terminal Departments</h1>
          <p>Assign tablets to departments</p>
        </div>
        <div className="button-row table-action-row">
          <Button icon={Link2} onClick={openAssignModal}>Assign Departments</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={refreshAll}>Refresh</Button>
        </div>
      </div>

      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        <DataTableToolbar table={table} searchPlaceholder="Search terminal assignments..." />
        <DataTableSummary table={table} itemLabel="terminal assignments" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Terminal</th>
                <th>Assigned Departments</th>
                <th>Terminal Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {table.pageItems.map(group => (
                <tr key={group.terminal_id}>
                  <td>
                    <strong>{group.terminal_code}</strong>
                    <br />
                    <span>{group.terminal_name}</span>
                  </td>
                  <td>
                    <div className="assigned-department-list">
                      {group.departments.map(department => (
                        <button
                          key={department.id}
                          className="assigned-department-chip"
                          type="button"
                          onClick={() => removeAssignment(department.id)}
                          aria-label={'Remove ' + department.department_name}
                        >
                          <span>{department.department_name}</span>
                          <small>{department.department_status}</small>
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>{group.terminal_status}</td>
                  <td>
                    <Button variant="secondary" icon={Edit2} iconOnly aria-label="Edit terminal departments" onClick={() => openEditModal(group)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !table.pageItems.length ? <div className="empty-state">No terminal departments found.</div> : null}
        <DataTablePagination table={table} />
      </section>

      {assignOpen ? (
        <Modal title="Assign Departments" onClose={closeAssignModal} footer={null}>
          <form className="rating-option-form rating-option-modal-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="terminalId">Terminal</label>
              <select
                id="terminalId"
                value={terminalId}
                onChange={handleTerminalChange}
                disabled={terminalsLoading || !terminalOptions.length}
                required
              >
                <option value="">{terminalsLoading ? 'Loading terminals...' : 'Select terminal'}</option>
                {terminalOptions.map(terminal => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.terminal_code} - {terminal.name}
                  </option>
                ))}
              </select>
              {!terminalsLoading && !terminalOptions.length ? (
                <p className="field-hint">No active terminals yet. Create one in Management - Terminals first.</p>
              ) : null}
              {terminalsError ? <p className="field-hint">{terminalsError}</p> : null}
            </div>

            <div className="field">
              <label htmlFor="departmentId">Departments</label>
              <select
                id="departmentId"
                value=""
                onChange={event => addDepartment(event.target.value)}
                disabled={!terminalId || departmentsLoading || !availableDepartments.length}
              >
                <option value="">
                  {departmentsLoading ? 'Loading departments...' : 'Select department to add'}
                </option>
                {availableDepartments.map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
              {!terminalId ? <p className="field-hint">Select a terminal first.</p> : null}
              {terminalId && !departmentsLoading && !availableDepartments.length && departmentOptions.length ? (
                <p className="field-hint">All active departments are already selected or assigned to this terminal.</p>
              ) : null}
              {!departmentsLoading && !departmentOptions.length ? (
                <p className="field-hint">No active departments yet. Create one in Management - Departments first.</p>
              ) : null}
              {editTerminalId && !departmentsLoading && !editAvailableDepartments.length && departmentOptions.length ? (
                <p className="field-hint">All active departments are already selected or assigned to this terminal.</p>
              ) : null}
              {departmentsError ? <p className="field-hint">{departmentsError}</p> : null}
              {selectedDepartments.length ? (
                <div className="selected-chip-list" aria-label="Selected departments">
                  {selectedDepartments.map(department => (
                    <button
                      key={department.id}
                      className="selected-chip"
                      type="button"
                      onClick={() => removeSelectedDepartment(String(department.id))}
                      aria-label={'Remove ' + department.name}
                    >
                      <span>{department.name}</span>
                      <X size={15} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
              {selectedTerminalAssignments.length ? (
                <p className="field-hint">
                  Already assigned: {selectedTerminalAssignments.map(assignment => assignment.department_name).join(', ')}
                </p>
              ) : null}
            </div>

            <div className="button-row rating-option-modal-actions">
              <Button type="submit" icon={Link2} disabled={!canSubmit}>{saving ? 'Saving' : 'Assign Departments'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeAssignModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editGroup ? (
        <Modal title="Edit Terminal Departments" onClose={closeEditModal} footer={null}>
          <form className="rating-option-form rating-option-modal-form" onSubmit={handleEditSubmit}>
            <div className="field">
              <label htmlFor="editTerminalId">Terminal</label>
              <select
                id="editTerminalId"
                value={editTerminalId}
                onChange={event => setEditTerminalId(event.target.value)}
                disabled={terminalsLoading || !terminalOptions.length}
                required
              >
                <option value="">{terminalsLoading ? 'Loading terminals...' : 'Select terminal'}</option>
                {terminalOptions.map(terminal => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.terminal_code} - {terminal.name}
                  </option>
                ))}
              </select>
              {!terminalsLoading && !terminalOptions.length ? (
                <p className="field-hint">No active terminals yet. Create one in Management - Terminals first.</p>
              ) : null}
              {terminalsError ? <p className="field-hint">{terminalsError}</p> : null}
            </div>

            <div className="field">
              <label htmlFor="editDepartmentId">Departments</label>
              <select
                id="editDepartmentId"
                value=""
                onChange={event => addEditDepartment(event.target.value)}
                disabled={departmentsLoading || !editAvailableDepartments.length}
              >
                <option value="">
                  {departmentsLoading ? 'Loading departments...' : 'Select department to add'}
                </option>
                {editAvailableDepartments.map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
              {!departmentsLoading && !departmentOptions.length ? (
                <p className="field-hint">No active departments yet. Create one in Management - Departments first.</p>
              ) : null}
              {departmentsError ? <p className="field-hint">{departmentsError}</p> : null}
              {editSelectedDepartments.length ? (
                <div className="selected-chip-list" aria-label="Selected departments">
                  {editSelectedDepartments.map(department => (
                    <button
                      key={department.id}
                      className="selected-chip"
                      type="button"
                      onClick={() => removeEditDepartment(String(department.id))}
                      aria-label={'Remove ' + department.name}
                    >
                      <span>{department.name}</span>
                      <X size={15} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="field-hint">No departments selected. Saving will remove all assignments for this terminal.</p>
              )}
            </div>

            <div className="button-row rating-option-modal-actions">
              <Button type="submit" icon={Save} disabled={!canSaveEdit}>{editSaving ? 'Saving' : 'Save Changes'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeEditModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Toast message={message} />
    </>
  );
}
