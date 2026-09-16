import { Router } from 'express';
import {
  assignKioskTerminal,
  heartbeatKioskTerminal,
  listAvailableKioskTerminals,
  releaseKioskTerminal,
  streamKioskTerminalEvents,
} from '../controllers/kioskTerminalController.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  kioskTerminalAssignSchema,
  kioskTerminalHeartbeatSchema,
  kioskTerminalQuerySchema,
  kioskTerminalReleaseSchema,
} from '../validations/kioskTerminalValidation.js';

const router = Router();

router.get('/terminals/available', validate(kioskTerminalQuerySchema, 'query'), listAvailableKioskTerminals);
router.get('/terminals/events', streamKioskTerminalEvents);
router.post('/terminals/assign', validate(kioskTerminalAssignSchema), assignKioskTerminal);
router.post('/terminals/heartbeat', validate(kioskTerminalHeartbeatSchema), heartbeatKioskTerminal);
router.post('/terminals/release', validate(kioskTerminalReleaseSchema), releaseKioskTerminal);

export default router;
