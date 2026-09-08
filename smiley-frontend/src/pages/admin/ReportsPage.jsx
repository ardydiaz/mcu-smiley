import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import FeedbackTable from '../../components/admin/FeedbackTable.jsx';
import { reportService } from '../../services/reportService.js';

export default function ReportsPage() {
  const [filters, setFilters] = useState({ from: '', to: '', departmentId: '', userTypeId: '', limit: 25 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runReport(event) {
    event?.preventDefault();
    setLoading(true);
    setError('');
    try {
      setResult(await reportService.list(filters));
    } catch (err) {
      setError(err.message || 'Unable to load report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <h1>Reports</h1>
        <p>Filter and export feedback</p>
      </div>
      <section className="data-panel">
        <form className="feedback-form" onSubmit={runReport}>
          <div className="field">
            <label htmlFor="from">From</label>
            <input id="from" type="date" value={filters.from} onChange={event => setFilters(current => ({ ...current, from: event.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="to">To</label>
            <input id="to" type="date" value={filters.to} onChange={event => setFilters(current => ({ ...current, to: event.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="departmentId">Department ID</label>
            <input id="departmentId" inputMode="numeric" value={filters.departmentId} onChange={event => setFilters(current => ({ ...current, departmentId: event.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="userTypeId">User Type ID</label>
            <input id="userTypeId" inputMode="numeric" value={filters.userTypeId} onChange={event => setFilters(current => ({ ...current, userTypeId: event.target.value }))} />
          </div>
          <div className="button-row">
            <Button type="submit" icon={Search} disabled={loading}>{loading ? 'Loading' : 'Run Report'}</Button>
            <a className="button secondary" href={reportService.csvUrl(filters)} target="_blank" rel="noreferrer">
              <Download size={18} aria-hidden="true" />
              <span>Download CSV</span>
            </a>
          </div>
        </form>
      </section>
      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        {result?.items?.length ? <FeedbackTable items={result.items} /> : null}
        {!loading && !error && !result?.items?.length ? <div className="empty-state">No report data loaded.</div> : null}
      </section>
    </>
  );
}
