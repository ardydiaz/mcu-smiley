import cron from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendDailySadVotesDigest } from '../services/teamsDigestService.js';

export function startTeamsDigestJob() {
  if (!env.TEAMS_SMILEY_WEBHOOK_URL) {
    logger.info('Teams digest job not started: TEAMS_SMILEY_WEBHOOK_URL is not configured');
    return;
  }
  cron.schedule(env.TEAMS_DIGEST_CRON, () => {
    sendDailySadVotesDigest().catch(error => logger.error('Teams digest failed: ' + error.message));
  }, { timezone: env.TEAMS_DIGEST_TIMEZONE });
  logger.info(`Teams digest job scheduled (cron "${env.TEAMS_DIGEST_CRON}", timezone ${env.TEAMS_DIGEST_TIMEZONE})`);
}
