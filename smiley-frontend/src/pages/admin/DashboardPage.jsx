import { AlertTriangle, Building2, CalendarDays, MapPin, Monitor, RefreshCcw, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import DashboardDrilldownModal from '../../components/admin/DashboardDrilldownModal.jsx';
import { IssuesBarChart, MetricBarChart, RatingBarChart, ResponseTrendChart, UserTypeDonutChart } from '../../components/admin/charts/DashboardCharts.jsx';
import { useApi } from '../../hooks/useApi.js';
import { dashboardService } from '../../services/dashboardService.js';

function ChartCard({ eyebrow, title, icon: Icon, children, className = '' }) {
  return (
    <section className={'dashboard-card dashboard-chart-card' + (className ? ' ' + className : '')}>
      <div className="dashboard-card-heading">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {Icon ? <Icon size={22} aria-hidden="true" /> : null}
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi(() => dashboardService.get(), []);
  const [drilldown, setDrilldown] = useState(null);

  const topDepartments = useMemo(() => (data?.departments || []).slice(0, 6), [data?.departments]);
  const topLocations = useMemo(() => (data?.locations || []).slice(0, 6), [data?.locations]);
  const topTerminals = useMemo(() => (data?.terminals || []).slice(0, 6), [data?.terminals]);
  const topUserTypes = useMemo(() => (data?.userTypes || []).slice(0, 5), [data?.userTypes]);
  const scoreToRatingId = useMemo(
    () => Object.fromEntries((data?.ratings || []).map(rating => [Number(rating.score), rating.id])),
    [data?.ratings],
  );

  function openDrilldown(title, filters) {
    setDrilldown({ title, filters });
  }

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
          <div className="dashboard-main-grid">
            <ChartCard eyebrow="Response Trend" title="Daily activity" icon={CalendarDays}>
              <ResponseTrendChart
                rows={data.daily || []}
                onSelect={row => openDrilldown(new Date(row.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }), { from: row.date, to: row.date })}
              />
            </ChartCard>
            <ChartCard eyebrow="Needs attention" title="Top feedback issues" icon={AlertTriangle}>
              <IssuesBarChart rows={data.issues || []} onSelect={row => openDrilldown(row.label, { ratingId: scoreToRatingId[Number(row.score)] })} />
            </ChartCard>
          </div>

          <div className="dashboard-breakdown-grid-modern">
            <ChartCard eyebrow="Breakdown" title="Rating Breakdown" icon={TrendingUp}>
              <RatingBarChart rows={data.ratings || []} onSelect={row => openDrilldown(row.label, { ratingId: row.id })} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Department Breakdown" icon={Building2}>
              <MetricBarChart rows={topDepartments} onSelect={row => openDrilldown(row.name, { departmentId: row.id })} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Location Performance" icon={MapPin}>
              <MetricBarChart rows={topLocations} onSelect={row => openDrilldown(row.name, { locationId: row.id })} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Terminal Activity" icon={Monitor}>
              <MetricBarChart rows={topTerminals} nameKey="terminal_code" onSelect={row => openDrilldown(row.terminal_code, { terminalId: row.id })} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="User Type Mix" icon={Users}>
              <UserTypeDonutChart rows={topUserTypes} total={data.totalVotes || 0} onSelect={row => openDrilldown(row.name, { userTypeId: row.id })} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Feedback Options" icon={AlertTriangle}>
              <MetricBarChart rows={data.feedbackOptions || []} nameKey="label" onSelect={row => openDrilldown(row.label, { ratingId: scoreToRatingId[Number(row.score)] })} />
            </ChartCard>
          </div>
        </>
      ) : null}

      {drilldown ? (
        <DashboardDrilldownModal title={drilldown.title} filters={drilldown.filters} onClose={() => setDrilldown(null)} />
      ) : null}
    </div>
  );
}
