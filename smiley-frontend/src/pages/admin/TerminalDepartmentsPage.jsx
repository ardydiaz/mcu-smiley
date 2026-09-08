import { Link2, RefreshCw, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { departmentService } from '../../services/departmentService.js';
import { terminalDepartmentService } from '../../services/terminalDepartmentService.js';
import { terminalService } from '../../services/terminalService.js';
import { useApi } from '../../hooks/useApi.js';

export default function TerminalDepartmentsPage() {
  const { data: assignments, loading, error, reload } = useApi(() => terminalDepartmentService.list(), []);
  const { data: terminals, loading: terminalsLoading, error: terminalsError, reload: reloadTerminals } = useApi(() => terminalService.list(), []);
  const { data: departments, loading: departmentsLoading, error: departmentsError, reload: reloadDepartments } = useApi(() => departmentService.list(), []);
  const [terminalId, setTerminalId] = useState('');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const terminalOptions = terminals || [];
  const departmentOptions = departments || [];
  const selectedTerminalAssignments = (assignments || []).filter(assignment => String(assignment.terminal_id) === String(terminalId));
  const assignedDepartmentIds = new Set(selectedTerminalAssignments.map(assignment => String(assignment.department_id)));
  const selectedDepartmentSet = new Set(selectedDepartmentIds);
  const selectedDepartments = departmentOptions.filter(department => selectedDepartmentSet.has(String(department.id)));
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
  const canSubmit = Boolean(!saving && terminalId && selectedDepartmentIds.length);

  function handleTerminalChange(event) {
    setTerminalId(event.target.value);
    setSelectedDepartmentIds([]);
    setMessage('');
  }

  function addDepartment(departmentId) {
    if (!departmentId) return;
    setSelectedDepartmentIds(current => current.includes(departmentId) ? current : [...current, departmentId]);
  }

  function removeSelectedDepartment(departmentId) {
    setSelectedDepartmentIds(current => current.filter(id => id !== departmentId));
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
      setSelectedDepartmentIds([]);
      await reload();
      setMessage(savedCount === 1 ? 'Terminal department saved' : 'Terminal departments saved');
    } catch (err) {
      setMessage(err.message || 'Unable to save terminal departments');
    } finally {
      setSaving(false);
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
      <div className="page-title">
        <h1>Terminal Departments</h1>
        <p>Assign tablets to departments</p>
      </div>

      <section className="data-panel">
        <form className="feedback-form" onSubmit={handleSubmit}>
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

          <div className="button-row">
            <Button type="submit" icon={Link2} disabled={!canSubmit}>{saving ? 'Saving' : 'Assign Departments'}</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={refreshAll}>Refresh</Button>
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
                <th>Terminal</th>
                <th>Assigned Departments</th>
                <th>Terminal Status</th>
              </tr>
            </thead>
            <tbody>
              {groupedAssignments.map(group => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !assignments?.length ? <div className="empty-state">No terminal departments found.</div> : null}
      </section>

      <Toast message={message} />
    </>
  );
}
