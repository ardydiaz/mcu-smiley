import Chart from 'react-apexcharts';
import { percent } from '../../../utils/helpers.js';
import {
  ACCENT,
  CATEGORICAL_PALETTE,
  GRID_COLOR,
  RATING_COLOR_BY_VALUE,
  STATUS_SERIOUS,
  TEXT_MUTED,
  TEXT_PRIMARY,
  baseChartOptions,
} from './chartTheme.js';

function formatShortDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function barHeight(rowCount, perRow = 42, min = 200, max = 420) {
  return Math.min(max, Math.max(min, 72 + rowCount * perRow));
}

export function ResponseTrendChart({ rows = [] }) {
  const normalizedRows = rows.slice(-14);
  if (!normalizedRows.length) return <div className="empty-state">No trend data yet.</div>;

  const categories = normalizedRows.map(row => formatShortDate(row.date));
  const votes = normalizedRows.map(row => Number(row.votes) || 0);
  const satisfaction = normalizedRows.map(row => {
    const total = Number(row.votes) || 0;
    return total ? Math.round((Number(row.positiveVotes || 0) / total) * 1000) / 10 : 0;
  });

  const sharedXAxis = {
    categories,
    labels: { style: { colors: TEXT_MUTED, fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  return (
    <div className="dashboard-trend-charts">
      <div className="dashboard-trend-subchart">
        <span className="dashboard-chart-eyebrow">Responses</span>
        <Chart
          type="area"
          height={170}
          series={[{ name: 'Responses', data: votes }]}
          options={baseChartOptions({
            colors: [ACCENT],
            dataLabels: { enabled: false },
            stroke: { width: 2, curve: 'smooth' },
            fill: { type: 'solid', opacity: 0.14 },
            markers: { size: 0 },
            legend: { show: false },
            xaxis: sharedXAxis,
            yaxis: { labels: { style: { colors: TEXT_MUTED, fontSize: '11px' } } },
            tooltip: { y: { formatter: value => value.toLocaleString() + ' responses' } },
          })}
        />
      </div>
      <div className="dashboard-trend-subchart">
        <span className="dashboard-chart-eyebrow">Satisfaction %</span>
        <Chart
          type="line"
          height={170}
          series={[{ name: 'Satisfaction %', data: satisfaction }]}
          options={baseChartOptions({
            colors: [ACCENT],
            dataLabels: { enabled: false },
            stroke: { width: 2, curve: 'smooth' },
            markers: { size: 4, strokeWidth: 2, strokeColors: '#ffffff' },
            legend: { show: false },
            xaxis: sharedXAxis,
            yaxis: { min: 0, max: 100, labels: { style: { colors: TEXT_MUTED, fontSize: '11px' }, formatter: value => Math.round(value) + '%' } },
            tooltip: { y: { formatter: value => value + '% satisfied' } },
          })}
        />
      </div>
    </div>
  );
}

export function RatingBarChart({ rows = [] }) {
  if (!rows.length) return <div className="empty-state">No rating data for this period.</div>;

  const sorted = [...rows].sort((a, b) => Number(a.score) - Number(b.score));
  const categories = sorted.map(row => (row.emoji ? row.emoji + ' ' : '') + row.label);
  const votes = sorted.map(row => Number(row.votes) || 0);
  const colors = sorted.map(row => RATING_COLOR_BY_VALUE[row.score] || ACCENT);

  return (
    <Chart
      type="bar"
      height={barHeight(sorted.length, 46, 180)}
      series={[{ name: 'Responses', data: votes }]}
      options={baseChartOptions({
        colors,
        plotOptions: {
          bar: { horizontal: true, barHeight: '55%', borderRadius: 4, distributed: true },
        },
        dataLabels: {
          enabled: true,
          style: { colors: [TEXT_PRIMARY], fontWeight: 700, fontSize: '12px' },
          background: { enabled: false },
          formatter: value => value.toLocaleString(),
        },
        legend: { show: false },
        xaxis: { categories, labels: { style: { colors: TEXT_MUTED, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: TEXT_PRIMARY, fontSize: '12px', fontWeight: 600 } } },
        grid: { borderColor: GRID_COLOR, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
      })}
    />
  );
}

export function IssuesBarChart({ rows = [] }) {
  if (!rows.length) return <div className="empty-state">No negative or neutral issues found for this period.</div>;

  const categories = rows.map(row => row.label);
  const votes = rows.map(row => Number(row.votes) || 0);

  return (
    <Chart
      type="bar"
      height={barHeight(rows.length, 42, 180)}
      series={[{ name: 'Responses', data: votes }]}
      options={baseChartOptions({
        colors: [STATUS_SERIOUS],
        plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4 } },
        dataLabels: {
          enabled: true,
          style: { colors: [TEXT_PRIMARY], fontWeight: 700, fontSize: '12px' },
          background: { enabled: false },
          formatter: value => value.toLocaleString(),
        },
        legend: { show: false },
        xaxis: { categories, labels: { style: { colors: TEXT_MUTED, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: TEXT_PRIMARY, fontSize: '12px', fontWeight: 600 } } },
        grid: { borderColor: GRID_COLOR, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
        tooltip: {
          y: {
            formatter: (value, { dataPointIndex }) => value.toLocaleString() + ' responses · ' + rows[dataPointIndex].rating,
          },
        },
      })}
    />
  );
}

export function MetricBarChart({ rows = [], nameKey = 'name' }) {
  if (!rows.length) return <div className="empty-state">No data for this breakdown.</div>;

  const categories = rows.map(row => row[nameKey] || row.name || row.label || 'No label');
  const votes = rows.map(row => Number(row.votes) || 0);

  return (
    <Chart
      type="bar"
      height={barHeight(rows.length, 42, 180)}
      series={[{ name: 'Responses', data: votes }]}
      options={baseChartOptions({
        colors: [ACCENT],
        plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4 } },
        dataLabels: {
          enabled: true,
          style: { colors: [TEXT_PRIMARY], fontWeight: 700, fontSize: '12px' },
          background: { enabled: false },
          formatter: value => value.toLocaleString(),
        },
        legend: { show: false },
        xaxis: { categories, labels: { style: { colors: TEXT_MUTED, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: TEXT_PRIMARY, fontSize: '12px', fontWeight: 600 } } },
        grid: { borderColor: GRID_COLOR, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
      })}
    />
  );
}

export function UserTypeDonutChart({ rows = [], total = 0 }) {
  if (!rows.length) return <div className="empty-state">No data for this breakdown.</div>;

  const labels = rows.map(row => row.name);
  const votes = rows.map(row => Number(row.votes) || 0);

  return (
    <Chart
      type="donut"
      height={300}
      series={votes}
      options={baseChartOptions({
        labels,
        colors: CATEGORICAL_PALETTE,
        stroke: { width: 2, colors: ['#ffffff'] },
        dataLabels: {
          enabled: true,
          style: { fontWeight: 700, fontSize: '12px' },
          formatter: value => percent(Number(value)),
        },
        legend: { position: 'bottom', fontSize: '12px', labels: { colors: TEXT_PRIMARY }, markers: { radius: 4 } },
        tooltip: { y: { formatter: (value) => value.toLocaleString() + (total ? ' of ' + total.toLocaleString() + ' responses' : ' responses') } },
      })}
    />
  );
}
