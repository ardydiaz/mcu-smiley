import { ChevronLeft, ChevronRight, Eye, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import { auditLogService } from '../../services/auditLogService.js';
import { formatDateTime } from '../../utils/helpers.js';
import { BADGE_BASE, MUTED_TEXT, TABLE, TABLE_WRAP, TD, TH, TR } from '../../components/admin/tableStyles.jsx';

const initialFilters = { q: '', entityType: '', action: '', from: '', to: '', limit: '25' };

const ENTITY_TYPE_OPTIONS = [
  { value: 'departments', label: 'Departments' },
  { value: 'locations', label: 'Locations' },
  { value: 'terminals', label: 'Terminals' },
  { value: 'terminal-departments', label: 'Terminal Departments' },
  { value: 'ratings', label: 'Ratings' },
  { value: 'users', label: 'Users' },
];

const ACTION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'release_reservation', label: 'Release Reservation' },
  { value: 'update_access', label: 'Update Access' },
];

const ACTION_BADGE_CLASSES = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  release_reservation: 'bg-amber-100 text-amber-800',
  update_access: 'bg-[var(--mcu-purple)]/10 text-[var(--mcu-purple-panther)]',
};

function formatEntityType(entityType) {
  return ENTITY_TYPE_OPTIONS.find(option => option.value === entityType)?.label || entityType;
}

function ActionBadge({ action }) {
  const classes = ACTION_BADGE_CLASSES[action] || 'bg-slate-100 text-slate-700';
  const label = ACTION_OPTIONS.find(option => option.value === action)?.label || action;
  return <span className={`${BADGE_BASE} ${classes}`}>{label}</span>;
}

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState({ ...initialFilters, page: 1 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const total = data?.total || 0;
  const page = Number(data?.page || appliedFilters.page || 1);
  const limit = Number(data?.limit || appliedFilters.limit || 25);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total ? (page - 1) * limit + 1 : 0;
  const showingTo = total ? Math.min(page * limit, total) : 0;
  const hasFilterChanges = useMemo(
    () => Object.entries(filters).some(([key, value]) => value !== initialFilters[key]),
    [filters],
  );

  useEffect(() => {
    let alive = true;
    async function loadLogs() {
      setLoading(true);
      setError('');
      try {
        const result = await auditLogService.list(cleanFilters(appliedFilters));
        if (alive) setData(result);
      } catch (err) {
        if (alive) setError(err.message || 'Unable to load audit logs');
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadLogs();
    return () => { alive = false; };
  }, [appliedFilters]);

  function updateFilter(name, value) {
    setFilters(current => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setAppliedFilters({ ...filters, page: 1 });
  }

  function resetFilters() {
    setFilters(initialFilters);
    setAppliedFilters({ ...initialFilters, page: 1 });
  }

  function goToPage(nextPage) {
    setAppliedFilters(current => ({ ...current, page: Math.min(Math.max(nextPage, 1), totalPages) }));
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Audit Logs</h1>
          <p>Track every change made across the admin dashboard</p>
        </div>
        <span className="result-count">{total.toLocaleString()} result{total === 1 ? '' : 's'}</span>
      </div>

      <section className="data-panel feedback-controls-panel">
        <form className="feedback-controls" onSubmit={applyFilters}>
          <label className="search-field" htmlFor="audit-search">
            <Search size={18} aria-hidden="true" />
            <input
              id="audit-search"
              value={filters.q}
              onChange={event => updateFilter('q', event.target.value)}
              placeholder="Search by user, email, action, section..."
              maxLength={100}
            />
          </label>

          <div className="filter-grid">
            <div className="field compact-field">
              <label htmlFor="from">From</label>
              <input id="from" type="date" value={filters.from} onChange={event => updateFilter('from', event.target.value)} />
            </div>
            <div className="field compact-field">
              <label htmlFor="to">To</label>
              <input id="to" type="date" value={filters.to} onChange={event => updateFilter('to', event.target.value)} />
            </div>
            <div className="field compact-field">
              <label htmlFor="entityType">Section</label>
              <select id="entityType" value={filters.entityType} onChange={event => updateFilter('entityType', event.target.value)}>
                <option value="">All sections</option>
                {ENTITY_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="action">Action</label>
              <select id="action" value={filters.action} onChange={event => updateFilter('action', event.target.value)}>
                <option value="">All actions</option>
                {ACTION_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="limit">Rows</label>
              <select id="limit" value={filters.limit} onChange={event => updateFilter('limit', event.target.value)}>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          <div className="feedback-actions">
            <Button type="submit" icon={Search} disabled={loading}>{loading ? 'Searching' : 'Apply Filters'}</Button>
            <Button type="button" variant="secondary" icon={RotateCcw} onClick={resetFilters} disabled={loading || !hasFilterChanges}>Reset</Button>
          </div>
        </form>
      </section>

      <section className="data-panel feedback-results-panel">
        <div className="feedback-results-header">
          <span>{total ? `Showing ${showingFrom.toLocaleString()}-${showingTo.toLocaleString()} of ${total.toLocaleString()}` : 'No matching activity'}</span>
          <span>Page {page.toLocaleString()} of {totalPages.toLocaleString()}</span>
        </div>

        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}

        {!loading && !error && data?.items?.length ? (
          <div className={TABLE_WRAP}>
            <table className={`${TABLE} min-w-[900px]`}>
              <thead>
                <tr>
                  <th className={TH}>Date</th>
                  <th className={TH}>User</th>
                  <th className={TH}>Action</th>
                  <th className={TH}>Section</th>
                  <th className={TH}>Record</th>
                  <th className={TH}>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(log => (
                  <tr key={log.id} className={TR}>
                    <td className={`${TD} whitespace-nowrap`}>{formatDateTime(log.created_at)}</td>
                    <td className={TD}>
                      <div className="grid gap-0.5">
                        <span className="font-normal text-[#21112c]">{log.user_name || 'System'}</span>
                        {log.user_email ? <span className={MUTED_TEXT}>{log.user_email}</span> : null}
                      </div>
                    </td>
                    <td className={TD}><ActionBadge action={log.action} /></td>
                    <td className={TD}>{formatEntityType(log.entity_type)}</td>
                    <td className={TD}>{log.entity_id ?? <span className={MUTED_TEXT}>-</span>}</td>
                    <td className={TD}>
                      <Button type="button" variant="secondary" icon={Eye} iconOnly aria-label="View details" onClick={() => setSelectedLog(log)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!loading && !error && !data?.items?.length ? <div className="empty-state">No activity recorded yet.</div> : null}

        <div className="pagination-bar">
          <Button type="button" variant="secondary" icon={ChevronLeft} onClick={() => goToPage(page - 1)} disabled={loading || page <= 1}>Previous</Button>
          <span>{page} / {totalPages}</span>
          <Button type="button" variant="secondary" icon={ChevronRight} onClick={() => goToPage(page + 1)} disabled={loading || page >= totalPages}>Next</Button>
        </div>
      </section>

      {selectedLog ? (
        <Modal title="Activity Details" onClose={() => setSelectedLog(null)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={MUTED_TEXT}>Date</span>
                <div className="font-normal text-[#21112c]">{formatDateTime(selectedLog.created_at)}</div>
              </div>
              <div>
                <span className={MUTED_TEXT}>User</span>
                <div className="font-normal text-[#21112c]">
                  {selectedLog.user_name || 'System'}{selectedLog.user_email ? ` (${selectedLog.user_email})` : ''}
                </div>
              </div>
              <div>
                <span className={MUTED_TEXT}>Action</span>
                <div><ActionBadge action={selectedLog.action} /></div>
              </div>
              <div>
                <span className={MUTED_TEXT}>Section</span>
                <div className="font-normal text-[#21112c]">
                  {formatEntityType(selectedLog.entity_type)}{selectedLog.entity_id ? ` #${selectedLog.entity_id}` : ''}
                </div>
              </div>
              <div>
                <span className={MUTED_TEXT}>IP Address</span>
                <div className="font-normal text-[#21112c]">{selectedLog.ip_address || '-'}</div>
              </div>
            </div>
            <div>
              <span className={MUTED_TEXT}>Submitted data</span>
              <pre className="mt-1 max-h-64 overflow-auto rounded-xl border border-[#e5eaee] bg-[#f8fafc] p-3 text-xs text-[#21112c]">
                {selectedLog.details ? JSON.stringify(selectedLog.details, null, 2) : 'No additional details'}
              </pre>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
