import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { query } from './config/database.js';
import { downloadTeamsDigestExcel } from './controllers/teamsDigestController.js';
import authRoutes from './routes/authRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import feedbackOptionRoutes from './routes/feedbackOptionRoutes.js';
import userTypeRoutes from './routes/userTypeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import terminalRoutes from './routes/terminalRoutes.js';
import terminalAssignmentRoutes from './routes/terminalAssignmentRoutes.js';
import kioskTerminalRoutes from './routes/kioskTerminalRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorMiddleware, notFound } from './middleware/errorMiddleware.js';
import { openApiDocument } from './docs/openapi.js';

const app = express();
app.disable('x-powered-by');
app.get('/api/docs.json', (req, res) => res.json(openApiDocument));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  explorer: true,
  customCss: '',
  customSiteTitle: 'Project Smiley Face API Docs',
}));
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, exposedHeaders: ['X-Total-Count'] }));
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/api/ready', async (req, res) => {
  try { await query('SELECT 1'); res.json({ success: true, data: { status: 'ready' } }); }
  catch { res.status(503).json({ success: false, message: 'Database unavailable' }); }
});
// Public: opened directly from the Teams digest card via a signed, short-lived token (no login).
app.get('/api/public/teams-digest/report.xlsx', rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }), downloadTeamsDigestExcel);
app.use('/api/auth', authRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/feedback-options', feedbackOptionRoutes);
app.use('/api/user-types', userTypeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/terminals', terminalRoutes);
app.use('/api/kiosk', kioskTerminalRoutes);
app.use('/api/terminal-assignments', terminalAssignmentRoutes);
app.use('/api/terminal-departments', terminalAssignmentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/dashboard', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, dashboardRoutes);
app.use('/api/reports', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, reportRoutes);
app.use(notFound);
app.use(errorMiddleware);
export default app;
