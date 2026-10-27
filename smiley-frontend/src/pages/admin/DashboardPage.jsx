import { AlertTriangle, Building2, CalendarDays, MapPin, Monitor, RefreshCcw, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
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
          <div className="dashboard-main-grid">
            <ChartCard eyebrow="Response Trend" title="Daily activity" icon={CalendarDays}>
              <ResponseTrendChart rows={data.daily || []} />
            </ChartCard>
            <ChartCard eyebrow="Needs attention" title="Top feedback issues" icon={AlertTriangle}>
              <IssuesBarChart rows={data.issues || []} />
            </ChartCard>
          </div>

          <div className="dashboard-breakdown-grid-modern">
            <ChartCard eyebrow="Breakdown" title="Rating Breakdown" icon={TrendingUp}>
              <RatingBarChart rows={data.ratings || []} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Department Breakdown" icon={Building2}>
              <MetricBarChart rows={topDepartments} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Location Performance" icon={MapPin}>
              <MetricBarChart rows={topLocations} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Terminal Activity" icon={Monitor}>
              <MetricBarChart rows={topTerminals} nameKey="terminal_code" />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="User Type Mix" icon={Users}>
              <UserTypeDonutChart rows={topUserTypes} total={data.totalVotes || 0} />
            </ChartCard>
            <ChartCard eyebrow="Breakdown" title="Feedback Options" icon={AlertTriangle}>
              <MetricBarChart rows={data.feedbackOptions || []} nameKey="label" />
            </ChartCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
