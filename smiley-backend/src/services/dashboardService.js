import { Vote } from '../models/Vote.js';
export async function getDashboard(filters) {
  const summary = await Vote.summary(filters);
  return { ...summary, satisfactionPercent: summary.totalVotes ? Math.round(summary.positiveVotes / summary.totalVotes * 10000) / 100 : 0 };
}
