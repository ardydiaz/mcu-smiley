import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { query } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
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
app.use('/api/auth', authRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/dashboard', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, dashboardRoutes);
app.use('/api/reports', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, reportRoutes);
app.use(notFound);
app.use(errorMiddleware);
export default app;
