import { z } from 'zod';

export const kioskTerminalQuerySchema = z.object({
  deviceId: z.string().trim().min(1).max(100).optional(),
}).strict();

export const kioskTerminalAssignSchema = z.object({
  terminalCode: z.string().trim().min(1, 'Terminal is required').max(50),
  deviceId: z.string().trim().min(1, 'Device ID is required').max(100),
}).strict();

export const kioskTerminalHeartbeatSchema = kioskTerminalAssignSchema;

export const kioskTerminalReleaseSchema = z.object({
  terminalCode: z.string().trim().min(1).max(50).optional(),
  deviceId: z.string().trim().min(1, 'Device ID is required').max(100),
}).strict();
