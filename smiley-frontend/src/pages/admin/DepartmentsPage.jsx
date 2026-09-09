import { CheckCircle, Edit2, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { DataTablePagination, DataTableSummary, DataTableToolbar } from '../../components/admin/DataTableControls.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import Toast from '../../components/common/Toast.jsx';
import { departmentService } from '../../services/departmentService.js';
import { useApi } from '../../hooks/useApi.js';
import { useDataTable } from '../../hooks/useDataTable.js';

const emptyForm = { name: '', description: '', status: 'active' };

function getFieldErrors(error) {
  const errors = error?.payload?.errors || [];
  return errors.reduce((fields, item) => {
    if (item.field) fields[item.field] = item.message;
    return fields;
  }, {});
}

export default function DepartmentsPage() {
  const { data, loading, error, reload } = useApi(() => departmentService.listAll(), []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [message, setMessage] = useState('');
  const departments = data || [];
  const table = useDataTable(
    departments,
    department => [department.name, department.description, department.status].filter(Boolean).join(' '),
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

  function startEdit(department) {
    setEditId(department.id);
    setEditFieldErrors({});
    setEditForm({
      name: department.name || '',
      description: department.description || '',
      status: department.status || 'active',
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
      await departmentService.create(form);
      closeAddModal();
      await reload();
      setMessage('Department saved');
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to save department');
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
      await departmentService.update(editId, editForm);
      closeEditModal();
      await reload();
      setMessage('Department updated');
    } catch (err) {
      const validationErrors = getFieldErrors(err);
      if (Object.keys(validationErrors).length) {
        setEditFieldErrors(validationErrors);
        setMessage('Please check the highlighted fields');
      } else {
        setMessage(err.message || 'Unable to update department');
      }
    } finally {
      setEditSaving(false);
    }
  }

  async function setDepartmentStatus(department, status) {
    setMessage('');
    try {
      await departmentService.update(department.id, {
        name: department.name,
        description: department.description,
        status,
      });
      await reload();
      setMessage(status === 'active' ? 'Department activated' : 'Department deactivated');
    } catch (err) {
      setMessage(err.message || 'Unable to update department');
    }
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Departments</h1>
          <p>Manage department choices</p>
        </div>
        <div className="button-row table-action-row">
          <Button icon={Plus} onClick={openAddModal}>Add Department</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={() => reload()}>Refresh</Button>
        </div>
      </div>

      {loading ? <Loading /> : null}
      {error ? <div className="empty-state">{error}</div> : null}
      <section className="data-panel">
        <DataTableToolbar table={table} searchPlaceholder="Search departments..." />
        <DataTableSummary table={table} itemLabel="departments" />
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
              {table.pageItems.map(department => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.description}</td>
                  <td>{department.status}</td>
                  <td>
                    <div className="button-row table-action-row">
                      <Button variant="secondary" icon={Edit2} iconOnly aria-label="Edit department" onClick={() => startEdit(department)}>Edit</Button>
                      {department.status === 'inactive' ? (
                        <Button variant="primary" icon={CheckCircle} iconOnly aria-label="Activate department" onClick={() => setDepartmentStatus(department, 'active')}>Activate</Button>
                      ) : (
                        <Button variant="danger" icon={Trash2} iconOnly aria-label="Deactivate department" onClick={() => setDepartmentStatus(department, 'inactive')}>Deactivate</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !table.pageItems.length ? <div className="empty-state">No departments found.</div> : null}
        <DataTablePagination table={table} />
      </section>

      {addOpen ? (
        <Modal title="Add Department" onClose={closeAddModal} footer={null}>
          <form className="rating-option-form rating-option-modal-form" onSubmit={handleSubmit} noValidate>
            <div className={'field' + (fieldErrors.name ? ' field-error' : '')}>
              <label htmlFor="name">Name <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                id="name"
                value={form.name}
                onChange={event => updateForm('name', event.target.value)}
                aria-invalid={fieldErrors.name ? 'true' : 'false'}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                autoFocus
              />
              {fieldErrors.name ? <p id="name-error" className="field-error-text">{fieldErrors.name}</p> : null}
            </div>
            <div className={'field' + (fieldErrors.description ? ' field-error' : '')}>
              <label htmlFor="description">Description <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                id="description"
                value={form.description}
                onChange={event => updateForm('description', event.target.value)}
                aria-invalid={fieldErrors.description ? 'true' : 'false'}
                aria-describedby={fieldErrors.description ? 'description-error' : undefined}
              />
              {fieldErrors.description ? <p id="description-error" className="field-error-text">{fieldErrors.description}</p> : null}
            </div>
            <div className="button-row rating-option-modal-actions">
              <Button type="submit" icon={Plus} disabled={saving}>{saving ? 'Saving' : 'Add Department'}</Button>
              <Button type="button" variant="secondary" icon={X} onClick={closeAddModal}>Cancel</Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editId ? (
        <Modal title="Edit Department" onClose={closeEditModal} footer={null}>
          <form className="rating-option-form rating-option-modal-form" onSubmit={handleEditSubmit} noValidate>
            <div className={'field' + (editFieldErrors.name ? ' field-error' : '')}>
              <label htmlFor="editDepartmentName">Name <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                id="editDepartmentName"
                value={editForm.name}
                onChange={event => updateEditForm('name', event.target.value)}
                aria-invalid={editFieldErrors.name ? 'true' : 'false'}
                autoFocus
              />
              {editFieldErrors.name ? <p className="field-error-text">{editFieldErrors.name}</p> : null}
            </div>
            <div className={'field' + (editFieldErrors.description ? ' field-error' : '')}>
              <label htmlFor="editDepartmentDescription">Description <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                id="editDepartmentDescription"
                value={editForm.description}
                onChange={event => updateEditForm('description', event.target.value)}
                aria-invalid={editFieldErrors.description ? 'true' : 'false'}
              />
              {editFieldErrors.description ? <p className="field-error-text">{editFieldErrors.description}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="editDepartmentStatus">Status</label>
              <select id="editDepartmentStatus" value={editForm.status} onChange={event => updateEditForm('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="button-row rating-option-modal-actions">
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
