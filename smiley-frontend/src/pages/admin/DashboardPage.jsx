import Loading from '../../components/common/Loading.jsx';
import DepartmentChart from '../../components/admin/DepartmentChart.jsx';
import RatingChart from '../../components/admin/RatingChart.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { useApi } from '../../hooks/useApi.js';
import { percent } from '../../utils/helpers.js';

export default function DashboardPage() {
  const { data, loading, error } = useApi(() => dashboardService.get(), []);

  return (
    <>
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>Live feedback summary</p>
      </div>
      {loading ? <Loading /> : null}
      {error ? <div className="empty-state">{error}</div> : null}
      {data ? (
        <>
          <section className="stats-grid">
            <StatCard label="Total votes" value={data.totalVotes} />
            <StatCard label="Average score" value={Number(data.averageScore).toFixed(2)} />
            <StatCard label="Positive votes" value={data.positiveVotes} />
            <StatCard label="Satisfaction" value={percent(data.satisfactionPercent)} />
          </section>
          <div className="two-column">
            <RatingChart ratings={data.ratings} />
            <DepartmentChart departments={data.departments} />
          </div>
        </>
      ) : null}
    </>
  );
}
