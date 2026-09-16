import { Vote } from '../models/Vote.js';

function isoDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function cleanFiltersForComparison(filters = {}) {
  const { from, to, page, limit, ...rest } = filters;
  return rest;
}

function withSatisfaction(summary) {
  return {
    ...summary,
    satisfactionPercent: summary.totalVotes ? Math.round(summary.positiveVotes / summary.totalVotes * 10000) / 100 : 0,
  };
}

export async function getDashboard(filters) {
  const summary = await Vote.summary(filters);
  const today = new Date();
  const todayDate = isoDateOnly(today);
  const yesterdayDate = isoDateOnly(addDays(today, -1));
  const comparisonFilters = cleanFiltersForComparison(filters);
  const [todaySummary, yesterdaySummary] = await Promise.all([
    Vote.periodSummary(comparisonFilters, todayDate, todayDate),
    Vote.periodSummary(comparisonFilters, yesterdayDate, yesterdayDate),
  ]);

  return {
    ...withSatisfaction(summary),
    comparison: {
      today: withSatisfaction(todaySummary),
      yesterday: withSatisfaction(yesterdaySummary),
    },
  };
}
