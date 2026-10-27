import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import FeedbackTable from '../../components/admin/FeedbackTable.jsx';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import { departmentService } from '../../services/departmentService.js';
import { locationService } from '../../services/locationService.js';
import { ratingService } from '../../services/ratingService.js';
import { terminalDepartmentService } from '../../services/terminalDepartmentService.js';
import { terminalService } from '../../services/terminalService.js';
import { userTypeService } from '../../services/userTypeService.js';
import { voteService } from '../../services/voteService.js';

const initialFilters = {
  q: '',
  from: '',
  to: '',
  ratingId: '',
  userTypeId: '',
  departmentId: '',
  locationId: '',
  terminalId: '',
  limit: '10',
};

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export default function FeedbackPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState({ ...initialFilters, page: 1 });
  const [data, setData] = useState(null);
  const [options, setOptions] = useState({ ratings: [], userTypes: [], departments: [], locations: [], terminals: [] });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState('');
  const total = data?.total || 0;
  const page = Number(data?.page || appliedFilters.page || 1);
  const limit = Number(data?.limit || appliedFilters.limit || 10);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total ? (page - 1) * limit + 1 : 0;
  const showingTo = total ? Math.min(page * limit, total) : 0;
  const hasFilterChanges = useMemo(
    () => Object.entries(filters).some(([key, value]) => value !== initialFilters[key]),
    [filters],
  );

  useEffect(() => {
    let alive = true;
    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const [ratings, userTypes, departments, locations, terminals, terminalDepartments] = await Promise.all([
          ratingService.list(),
          userTypeService.list(),
          departmentService.list(),
          locationService.list(),
          terminalService.listAll(),
          terminalDepartmentService.list(),
        ]);
        if (alive) {
          setOptions({ ratings, userTypes, departments, locations, terminals });
          setAssignments(terminalDepartments);
        }
      } catch {
        if (alive) setOptions(current => current);
      } finally {
        if (alive) setOptionsLoading(false);
      }
    }
    loadOptions();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadFeedback() {
      setLoading(true);
      setError('');
      try {
        const result = await voteService.list(cleanFilters(appliedFilters));
        if (alive) setData(result);
      } catch (err) {
        if (alive) setError(err.message || 'Unable to load feedback');
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadFeedback();
    return () => { alive = false; };
  }, [appliedFilters]);

  const filteredTerminals = useMemo(() => {
    if (!filters.locationId) return options.terminals;
    return options.terminals.filter(terminal => String(terminal.location_id) === String(filters.locationId));
  }, [options.terminals, filters.locationId]);

  const filteredDepartments = useMemo(() => {
    let terminalIds = null;
    if (filters.terminalId) {
      terminalIds = new Set([String(filters.terminalId)]);
    } else if (filters.locationId) {
      terminalIds = new Set(
        options.terminals.filter(terminal => String(terminal.location_id) === String(filters.locationId)).map(terminal => String(terminal.id)),
      );
    }
    if (!terminalIds) return options.departments;
    const allowedDepartmentIds = new Set(
      assignments.filter(assignment => terminalIds.has(String(assignment.terminal_id))).map(assignment => String(assignment.department_id)),
    );
    return options.departments.filter(department => allowedDepartmentIds.has(String(department.id)));
  }, [options.departments, options.terminals, assignments, filters.terminalId, filters.locationId]);

  function updateFilter(name, value) {
    setFilters(current => {
      const next = { ...current, [name]: value };

      if (name === 'locationId') {
        const selectedTerminal = options.terminals.find(terminal => String(terminal.id) === String(current.terminalId));
        if (selectedTerminal && String(selectedTerminal.location_id) !== String(value)) next.terminalId = '';
      }

      if (name === 'terminalId' && value) {
        const selectedTerminal = options.terminals.find(terminal => String(terminal.id) === String(value));
        if (selectedTerminal) next.locationId = String(selectedTerminal.location_id);
      }

      if (name === 'locationId' || name === 'terminalId') {
        let terminalIds = null;
        if (next.terminalId) {
          terminalIds = new Set([String(next.terminalId)]);
        } else if (next.locationId) {
          terminalIds = new Set(
            options.terminals.filter(terminal => String(terminal.location_id) === String(next.locationId)).map(terminal => String(terminal.id)),
          );
        }
        if (terminalIds) {
          const allowedDepartmentIds = [
            ...new Set(assignments.filter(assignment => terminalIds.has(String(assignment.terminal_id))).map(assignment => String(assignment.department_id))),
          ];
          if (name === 'terminalId' && allowedDepartmentIds.length === 1) {
            next.departmentId = allowedDepartmentIds[0];
          } else if (next.departmentId && !allowedDepartmentIds.includes(String(next.departmentId))) {
            next.departmentId = '';
          }
        }
      }

      return next;
    });
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
          <h1>Feedback</h1>
          <p>Search, filter, and review voter comments</p>
        </div>
        <span className="result-count">{total.toLocaleString()} result{total === 1 ? '' : 's'}</span>
      </div>

      <section className="data-panel feedback-controls-panel">
        <form className="feedback-controls" onSubmit={applyFilters}>
          <label className="search-field" htmlFor="feedback-search">
            <Search size={18} aria-hidden="true" />
            <input
              id="feedback-search"
              value={filters.q}
              onChange={event => updateFilter('q', event.target.value)}
              placeholder="Search comments, tablet, location, department..."
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
              <label htmlFor="ratingId">Rating</label>
              <select id="ratingId" value={filters.ratingId} onChange={event => updateFilter('ratingId', event.target.value)} disabled={optionsLoading}>
                <option value="">All ratings</option>
                {options.ratings.map(rating => <option key={rating.id} value={rating.id}>{rating.label}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="userTypeId">User Type</label>
              <select id="userTypeId" value={filters.userTypeId} onChange={event => updateFilter('userTypeId', event.target.value)} disabled={optionsLoading}>
                <option value="">All user types</option>
                {options.userTypes.map(userType => <option key={userType.id} value={userType.id}>{userType.name}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="terminalId">Tablet</label>
              <select id="terminalId" value={filters.terminalId} onChange={event => updateFilter('terminalId', event.target.value)} disabled={optionsLoading}>
                <option value="">All tablets</option>
                {filteredTerminals.map(terminal => <option key={terminal.id} value={terminal.id}>{terminal.terminal_code} - {terminal.name}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="locationId">Location</label>
              <select id="locationId" value={filters.locationId} onChange={event => updateFilter('locationId', event.target.value)} disabled={optionsLoading}>
                <option value="">All locations</option>
                {options.locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="departmentId">Department</label>
              <select id="departmentId" value={filters.departmentId} onChange={event => updateFilter('departmentId', event.target.value)} disabled={optionsLoading}>
                <option value="">All departments</option>
                {filteredDepartments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
            </div>
            <div className="field compact-field">
              <label htmlFor="limit">Rows</label>
              <select id="limit" value={filters.limit} onChange={event => updateFilter('limit', event.target.value)}>
                <option value="10">10 per page</option>
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
          <span>{total ? `Showing ${showingFrom.toLocaleString()}-${showingTo.toLocaleString()} of ${total.toLocaleString()}` : 'No matching feedback'}</span>
          <span>Page {page.toLocaleString()} of {totalPages.toLocaleString()}</span>
        </div>

        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        {!loading && !error && data?.items?.length ? <FeedbackTable items={data.items} /> : null}
        {!loading && !error && !data?.items?.length ? <div className="empty-state">No feedback found.</div> : null}

        <div className="pagination-bar">
          <Button type="button" variant="secondary" icon={ChevronLeft} onClick={() => goToPage(page - 1)} disabled={loading || page <= 1}>Previous</Button>
          <span>{page} / {totalPages}</span>
          <Button type="button" variant="secondary" icon={ChevronRight} onClick={() => goToPage(page + 1)} disabled={loading || page >= totalPages}>Next</Button>
        </div>
      </section>
    </>
  );
}