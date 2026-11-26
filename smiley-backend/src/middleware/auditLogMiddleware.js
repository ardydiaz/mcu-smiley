import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

const METHOD_ACTIONS = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };

function deriveAction(req) {
  const routePath = req.route?.path || '';
  if (routePath.includes('release-reservation')) return 'release_reservation';
  if (routePath.includes('/access')) return 'update_access';
  return METHOD_ACTIONS[req.method];
}

function sanitizeDetails(body) {
  if (!body || typeof body !== 'object') return undefined;
  const { password, passwordHash, ...rest } = body;
  return rest;
}

// Mount after auth/permission middleware on mutating admin routes. Infers the action from the
// HTTP method and logs once the response finishes, without requiring any change to controllers.
export function auditLog(entityType) {
  return function auditLogMiddleware(req, res, next) {
    const originalJson = res.json.bind(res);
    let responseBody;
    res.json = body => {
      responseBody = body;
      return originalJson(body);
    };

    res.on('finish', () => {
      if (res.statusCode >= 400) return;
      const action = deriveAction(req);
      if (!action) return;
      const entityId = req.params?.id ? Number(req.params.id) : (responseBody?.data?.id ?? null);
      AuditLog.create({
        userId: req.user?.id ?? null,
        userName: req.user?.name ?? null,
        userEmail: req.user?.email ?? null,
        action,
        entityType,
        entityId,
        details: sanitizeDetails(req.body),
        ipAddress: req.ip,
      }).catch(error => logger.error('Audit log failed: ' + error.message));
    });

    next();
  };
}
