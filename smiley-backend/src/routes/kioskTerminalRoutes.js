import { Router } from 'express';
import {
  assignKioskTerminal,
  heartbeatKioskTerminal,
  listAvailableKioskTerminals,
  releaseKioskTerminal,
  streamKioskTerminalEvents,
} from '../controllers/kioskTerminalController.js';
import { requireKioskAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  kioskTerminalAssignSchema,
  kioskTerminalHeartbeatSchema,
  kioskTerminalQuerySchema,
  kioskTerminalReleaseSchema,
} from '../validations/kioskTerminalValidation.js';

const router = Router();

router.get('/terminals/available', requireKioskAuth, validate(kioskTerminalQuerySchema, 'query'), listAvailableKioskTerminals);
router.get('/terminals/events', streamKioskTerminalEvents);
router.post('/terminals/assign', requireKioskAuth, validate(kioskTerminalAssignSchema), assignKioskTerminal);
router.post('/terminals/heartbeat', requireKioskAuth, validate(kioskTerminalHeartbeatSchema), heartbeatKioskTerminal);
router.post('/terminals/release', requireKioskAuth, validate(kioskTerminalReleaseSchema), releaseKioskTerminal);

export default router;
