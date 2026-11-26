import { TerminalKioskSession } from '../models/TerminalKioskSession.js';
import { addKioskTerminalEventsClient, broadcastKioskTerminalEvent } from '../services/kioskTerminalEvents.js';
import { success, AppError } from '../utils/response.js';

function throwAsAppError(error) {
  if (error.status) throw new AppError(error.message, error.status);
  throw error;
}

export async function listAvailableKioskTerminals(req, res) {
  return success(res, await TerminalKioskSession.listAvailable(req.validated?.query));
}

export async function assignKioskTerminal(req, res) {
  try {
    const terminal = await TerminalKioskSession.assign(req.validated.body);
    broadcastKioskTerminalEvent('terminal-reservations-changed', {
      action: 'assigned',
      terminalCode: terminal.terminal_code,
      deviceId: req.validated.body.deviceId,
    });
    return success(res, terminal, 'Terminal selected');
  } catch (error) {
    throwAsAppError(error);
  }
}

export async function heartbeatKioskTerminal(req, res) {
  const terminal = await TerminalKioskSession.heartbeat(req.validated.body);
  if (!terminal) throw new AppError('Terminal reservation is no longer active', 409);
  return success(res, terminal, 'Terminal reservation refreshed');
}

export async function releaseKioskTerminal(req, res) {
  const released = await TerminalKioskSession.release(req.validated.body);
  if (released) {
    broadcastKioskTerminalEvent('terminal-reservations-changed', {
      action: 'released',
      terminalCode: req.validated.body.terminalCode || null,
      deviceId: req.validated.body.deviceId,
    });
  }
  return success(res, { released }, 'Terminal released');
}

export function streamKioskTerminalEvents(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  // Without this, Nagle's algorithm can hold small SSE writes in the TCP send
  // buffer for several seconds before flushing, so passive listeners (clients
  // that didn't trigger the change themselves) see a multi-second delay.
  req.socket.setNoDelay(true);
  res.flushHeaders?.();

  const removeClient = addKioskTerminalEventsClient(res);
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    removeClient();
  });
}
