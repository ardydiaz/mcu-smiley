import { Activity, AlertTriangle, Building2, CalendarDays, MapPin, Monitor, RefreshCcw, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';
import { dashboardService } from '../../services/dashboardService.js';
import { percent } from '../../utils/helpers.js';

function formatAverage(value) {
  return (Number(value) || 0).toFixed(2);
}

function delta(current, previous, formatter = value => value.toLocaleString()) {
  const difference = Number(current || 0) - Number(previous || 0);
  if (!difference) return 'No change vs yesterday';
  return (difference > 0 ? '+' : '') + formatter(difference) + ' vs yesterday';
}

function DashboardStat({ label, value, helper, icon: Icon, tone = 'purple' }) {
  return (
    <article className={'dashboard-kpi dashboard-kpi-' + tone}>
      <span className="dashboard-kpi-icon">{Icon ? <Icon size={22} aria-hidden="true" /> : null}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
    </article>
  );
}

function MiniTrend({ rows = [] }) {
  const normalizedRows = rows.slice(-14);
  const max = Math.max(1, ...normalizedRows.map(row => Number(row.votes) || 0));
  return (
    <section className="dashboard-card dashboard-trend-card">
      <div className="dashboard-card-heading">
        <div>
          <span>Response Trend</span>
          <h2>Daily activity</h2>
        </div>
        <CalendarDays size={22} aria-hidden="true" />
      </div>
      {normalizedRows.length ? (
        <div className="dashboard-trend-bars">
          {normalizedRows.map(row => {
            const votes = Number(row.votes) || 0;
            const satisfaction = votes ? (Number(row.positiveVotes || 0) / votes) * 100 : 0;
            return (
              <div className="dashboard-trend-day" key={row.date}>
                <span className="dashboard-trend-value">{votes}</span>
                <div className="dashboard-trend-track">
                  <div style={{ height: Math.max(8, (votes / max) * 100) + '%' }} />
                </div>
                <small>{new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</small>
                <em>{percent(satisfaction)}</em>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">No trend data yet.</div>
      )}
    </section>
  );
}

function BreakdownPanel({ title, rows = [], nameKey = 'name', total = 0, icon: Icon, variant = '' }) {
  const max = Math.max(1, ...rows.map(row => Number(row.votes) || 0));
  return (
    <section className={'dashboard-card dashboard-breakdown-card' + (variant ? ' dashboard-breakdown-' + variant : '')}>
      <div className="dashboard-card-heading">
        <div>
          <span>Breakdown</span>
          <h2>{title}</h2>
        </div>
        {Icon ? <Icon size={22} aria-hidden="true" /> : null}
      </div>
      {rows.length ? (
        <div className="dashboard-bar-list">
          {rows.map(row => {
            const votes = Number(row.votes) || 0;
            const label = row[nameKey] || row.label || row.terminal_code || 'No label';
            return (
              <div className="dashboard-bar-row" key={(row.id ?? label) + title}>
                <div className="dashboard-bar-label">
                  <strong>{row.emoji ? <span aria-hidden="true">{row.emoji} </span> : null}{label}</strong>
                  <small>{percent(total ? (votes / total) * 100 : 0)}</small>
                </div>
                <div className="dashboard-bar-track">
                  <div className="dashboard-bar-fill" style={{ width: ((votes / max) * 100) + '%' }} />
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

function IssuesPanel({ rows = [] }) {
  return (
    <section className="dashboard-card dashboard-issues-card">
      <div className="dashboard-card-heading">
        <div>
          <span>Needs attention</span>
          <h2>Top feedback issues</h2>
        </div>
        <AlertTriangle size={22} aria-hidden="true" />
      </div>
      {rows.length ? (
        <div className="dashboard-issue-list">
          {rows.map(row => (
            <article key={(row.id ?? row.label) + row.score} className="dashboard-issue-row">
              <span aria-hidden="true">{row.emoji || '⚠️'}</span>
              <div>
                <strong>{row.label}</strong>
                <small>{row.rating} · Score {row.score}</small>
              </div>
              <em>{Number(row.votes || 0).toLocaleString()}</em>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No negative or neutral issues found for this period.</div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi(() => dashboardService.get(), []);

  const satisfactionRate = data?.totalVotes ? (Number(data.positiveVotes || 0) / Number(data.totalVotes)) * 100 : 0;
  const comparison = data?.comparison || {};
  const topDepartments = useMemo(() => (data?.departments || []).slice(0, 6), [data?.departments]);
  const topLocations = useMemo(() => (data?.locations || []).slice(0, 6), [data?.locations]);
  const topTerminals = useMemo(() => (data?.terminals || []).slice(0, 6), [data?.terminals]);
  const topUserTypes = useMemo(() => (data?.userTypes || []).slice(0, 5), [data?.userTypes]);

  return (
    <div className="dashboard-page dashboard-modern">
      <div className="page-title dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">Live survey intelligence</span>
          <h1>Dashboard</h1>
          <p>Track satisfaction, discover service issues, and monitor kiosk activity.</p>
        </div>
        <Button type="button" variant="secondary" icon={RefreshCcw} onClick={() => reload().catch(() => {})} disabled={loading}>Refresh</Button>
      </div>

      {loading ? <Loading /> : null}
      {error ? <div className="empty-state">{error}</div> : null}
      {data ? (
        <>
          <section className="dashboard-kpi-grid">
            <DashboardStat label="Total Responses" value={(data.totalVotes || 0).toLocaleString()} helper={delta(data.comparison?.today?.totalVotes, data.comparison?.yesterday?.totalVotes)} icon={Activity} tone="gold" />
            <DashboardStat label="Average Score" value={formatAverage(data.averageScore)} helper={delta(comparison.today?.averageScore, comparison.yesterday?.averageScore, value => value.toFixed(2))} icon={TrendingUp} tone="purple" />
            <DashboardStat label="Positive Responses" value={(data.positiveVotes || 0).toLocaleString()} helper="Satisfied and above" icon={Users} tone="haze" />
            <DashboardStat label="Satisfaction Rate" value={percent(satisfactionRate)} helper={delta(comparison.today?.satisfactionPercent, comparison.yesterday?.satisfactionPercent, value => percent(value))} icon={TrendingUp} tone="sunset" />
          </section>

          <div className="dashboard-main-grid">
            <MiniTrend rows={data.daily || []} />
            <IssuesPanel rows={data.issues || []} />
          </div>

          <div className="dashboard-breakdown-grid-modern">
            <BreakdownPanel title="Rating Breakdown" rows={data.ratings || []} nameKey="label" total={data.totalVotes || 0} icon={TrendingUp} />
            <BreakdownPanel title="Department Breakdown" rows={topDepartments} total={data.totalVotes || 0} icon={Building2} />
            <BreakdownPanel title="Location Performance" rows={topLocations} total={data.totalVotes || 0} icon={MapPin} />
            <BreakdownPanel title="Terminal Activity" rows={topTerminals} nameKey="terminal_code" total={data.totalVotes || 0} icon={Monitor} />
            <BreakdownPanel title="User Type Mix" rows={topUserTypes} total={data.totalVotes || 0} icon={Users} variant="user-types" />
            <BreakdownPanel title="Feedback Options" rows={data.feedbackOptions || []} nameKey="label" total={data.totalVotes || 0} icon={AlertTriangle} />
          </div>
        </>
      ) : null}
    </div>
  );
}
