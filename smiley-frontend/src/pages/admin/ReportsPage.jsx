import { Download, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import { departmentService } from '../../services/departmentService.js';
import { locationService } from '../../services/locationService.js';
import { ratingService } from '../../services/ratingService.js';
import { reportService } from '../../services/reportService.js';
import { terminalDepartmentService } from '../../services/terminalDepartmentService.js';
import { terminalService } from '../../services/terminalService.js';
import { userTypeService } from '../../services/userTypeService.js';

const initialFilters = {
  q: '',
  from: '',
  to: '',
  ratingId: '',
  userTypeId: '',
  departmentId: '',
  locationId: '',
  terminalId: '',
};

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

function downloadTextFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState({ ratings: [], userTypes: [], departments: [], locations: [], terminals: [] });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
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
    async function loadReportCount() {
      setLoading(true);
      setError('');
      try {
        const data = await reportService.list({ ...cleanFilters(appliedFilters), page: 1, limit: 1 });
        if (alive) setTotal(data.total || 0);
      } catch (err) {
        if (alive) setError(err.message || 'Unable to load report');
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadReportCount();
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

  function runReport(event) {
    event.preventDefault();
    setAppliedFilters(filters);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  async function downloadCsv() {
    setExporting(true);
    setError('');
    try {
      const csv = await reportService.csv(cleanFilters(appliedFilters));
      downloadTextFile(csv, 'smiley-survey-report.csv', 'text/csv;charset=utf-8');
    } catch (err) {
      setError(err.message || 'Unable to download CSV');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="page-title page-title-row">
        <div>
          <h1>Reports</h1>
          <p>Filter and export survey responses</p>
        </div>
        <span className="result-count">{loading ? 'Checking...' : `${total.toLocaleString()} response${total === 1 ? '' : 's'}`}</span>
      </div>

      <section className="data-panel feedback-controls-panel report-controls-panel">
        <form className="feedback-controls" onSubmit={runReport}>
          <label className="search-field" htmlFor="report-search">
            <Search size={18} aria-hidden="true" />
            <input
              id="report-search"
              value={filters.q}
              onChange={event => updateFilter('q', event.target.value)}
              placeholder="Search feedback, tablet, location, department..."
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
          </div>

          <div className="feedback-actions">
            <Button type="submit" icon={Search} disabled={loading}>{loading ? 'Running' : 'Run Report'}</Button>
            <Button type="button" variant="secondary" icon={Download} onClick={downloadCsv} disabled={loading || exporting || !total}>{exporting ? 'Downloading' : 'Download CSV'}</Button>
            <Button type="button" variant="secondary" icon={RotateCcw} onClick={resetFilters} disabled={loading || !hasFilterChanges}>Reset</Button>
          </div>
        </form>
      </section>

      {error ? <section className="data-panel"><div className="empty-state">{error}</div></section> : null}
    </>
  );
}