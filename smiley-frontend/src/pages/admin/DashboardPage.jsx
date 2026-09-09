import Loading from '../../components/common/Loading.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { useApi } from '../../hooks/useApi.js';
import { percent } from '../../utils/helpers.js';

function formatAverage(value) {
  const number = Number(value) || 0;
  return number.toFixed(2);
}

function DashboardStat({ label, value, helper }) {
  return (
    <article className="stat-card report-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

function BreakdownPanel({ title, rows = [], nameKey = 'name', total = 0 }) {
  const max = Math.max(1, ...rows.map(row => Number(row.votes) || 0));

  return (
    <section className="data-panel report-breakdown-panel">
      <h2>{title}</h2>
      {rows.length ? (
        <div className="bar-list">
          {rows.map(row => {
            const votes = Number(row.votes) || 0;
            return (
              <div className="bar-row report-bar-row" key={row.id || row[nameKey]}>
                <div>
                  <div className="report-bar-label">
                    <strong>{row.emoji ? <span aria-hidden="true">{row.emoji} </span> : null}{row[nameKey]}</strong>
                    <small>{percent(total ? (votes / total) * 100 : 0)}</small>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: ((votes / max) * 100) + '%' }} />
                  </div>
                </div>
                <span>{votes.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">No data for this breakdown.</div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useApi(() => dashboardService.get(), []);
  const satisfactionRate = data?.totalVotes ? (Number(data.positiveVotes || 0) / Number(data.totalVotes)) * 100 : 0;

  return (
    <>
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>Live survey summary</p>
      </div>
      {loading ? <Loading /> : null}
      {error ? <div className="empty-state">{error}</div> : null}
      {data ? (
        <>
          <section className="stats-grid report-summary-grid">
            <DashboardStat label="Total Responses" value={(data.totalVotes || 0).toLocaleString()} helper="Survey submissions" />
            <DashboardStat label="Average Score" value={formatAverage(data.averageScore)} helper="Out of 5" />
            <DashboardStat label="Positive Responses" value={(data.positiveVotes || 0).toLocaleString()} helper="Satisfied and above" />
            <DashboardStat label="Satisfaction Rate" value={percent(satisfactionRate)} helper="Positive / total" />
          </section>

          <div className="two-column report-breakdown-grid">
            <BreakdownPanel title="Rating Breakdown" rows={data.ratings || []} nameKey="label" total={data.totalVotes || 0} />
            <BreakdownPanel title="Department Breakdown" rows={data.departments || []} total={data.totalVotes || 0} />
          </div>
        </>
      ) : null}
    </>
  );
}