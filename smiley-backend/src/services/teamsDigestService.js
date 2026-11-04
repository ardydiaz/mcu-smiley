import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const SAD_RATING_MAX_VALUE = 2;
const DOWNLOAD_TOKEN_AUDIENCE = 'smiley-teams-digest';

export async function getSadVotes(date) {
  return query(
    `SELECT v.id, v.feedback, v.created_at, r.name AS rating, r.emoji, ut.name AS user_type,
       (SELECT GROUP_CONCAT(d.name ORDER BY d.name SEPARATOR ', ')
        FROM vote_departments vd JOIN departments d ON d.id = vd.department_id
        WHERE vd.vote_id = v.id) AS department,
       l.name AS location, t.terminal_code, t.name AS terminal
     FROM votes v
     JOIN ratings r ON r.id = v.rating_id
     JOIN user_types ut ON ut.id = v.user_type_id
     LEFT JOIN locations l ON l.id = v.location_id
     LEFT JOIN terminals t ON t.id = v.terminal_id
     WHERE r.value <= ? AND DATE(v.created_at) = ?
     ORDER BY v.created_at ASC`,
    [SAD_RATING_MAX_VALUE, date],
  );
}

export function verifyDigestDownloadToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'smiley-api', audience: DOWNLOAD_TOKEN_AUDIENCE });
}

function signDigestDownloadToken(date) {
  return jwt.sign({ date }, env.JWT_SECRET, {
    algorithm: 'HS256', expiresIn: '3d', issuer: 'smiley-api', audience: DOWNLOAD_TOKEN_AUDIENCE,
  });
}

function buildDigestDownloadUrl(date) {
  const base = env.PUBLIC_API_BASE_URL || `http://localhost:${env.PORT}/api`;
  const token = signDigestDownloadToken(date);
  return `${base}/public/teams-digest/report.xlsx?token=${encodeURIComponent(token)}`;
}

function formatVoteLine(vote) {
  const department = vote.department || 'Unassigned department';
  const location = vote.location || 'Unknown location';
  const terminal = vote.terminal || vote.terminal_code || 'no terminal';
  const place = terminal && terminal !== location ? `${location}, ${terminal}` : location;
  const feedback = vote.feedback ? '"' + vote.feedback + '"' : 'No written feedback';
  return `${vote.rating} ${vote.emoji} — **${department}** (${place}) — ${vote.user_type} — ${feedback}`;
}

function buildCardBody(votes, displayDate) {
  const heading = { type: 'TextBlock', text: `Smiley Face Daily Feedback Digest | ${displayDate}`, weight: 'Bolder', size: 'Medium', wrap: true };
  if (!votes.length) {
    return [
      heading,
      { type: 'TextBlock', text: `No dissatisfied feedback recorded for ${displayDate}. Great day!`, wrap: true, color: 'Good' },
    ];
  }
  const responseWord = votes.length === 1 ? 'response' : 'responses';
  return [
    heading,
    { type: 'TextBlock', text: `${votes.length} dissatisfied feedback ${responseWord} received on ${displayDate}:`, weight: 'Bolder', wrap: true },
    ...votes.map(vote => ({ type: 'TextBlock', text: '- ' + formatVoteLine(vote), wrap: true })),
  ];
}

// The Teams "Workflows" webhook trigger only accepts an Adaptive Card or
// legacy MessageCard payload wrapped in this envelope - a plain {title,
// text} body gets silently rejected (run shows "Failed" with no detail).
// The webhook itself can't carry a real file attachment (plain JSON POST),
// so the report is offered as a signed download link instead.
function buildDigestMessage(votes, displayDate, downloadUrl) {
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: buildCardBody(votes, displayDate),
          actions: votes.length ? [{ type: 'Action.OpenUrl', title: 'Download Excel Report', url: downloadUrl }] : [],
        },
      },
    ],
  };
}

export async function sendDailySadVotesDigest() {
  if (!env.TEAMS_SMILEY_WEBHOOK_URL) {
    logger.info('Teams digest skipped: TEAMS_SMILEY_WEBHOOK_URL is not configured');
    return { sent: false, sadVoteCount: 0 };
  }
  const now = new Date();
  const today = now.toLocaleDateString('en-CA', { timeZone: env.TEAMS_DIGEST_TIMEZONE });
  const displayDate = now.toLocaleDateString('en-US', {
    timeZone: env.TEAMS_DIGEST_TIMEZONE, month: 'long', day: 'numeric', year: 'numeric',
  });
  const votes = await getSadVotes(today);
  const message = buildDigestMessage(votes, displayDate, buildDigestDownloadUrl(today));
  const response = await fetch(env.TEAMS_SMILEY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Teams webhook responded with ${response.status}: ${body.slice(0, 300)}`);
  }
  logger.info(`Teams digest sent (${votes.length} sad vote(s))`);
  return { sent: true, sadVoteCount: votes.length };
}
