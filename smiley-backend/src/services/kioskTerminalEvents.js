const clients = new Set();

function send(res, event, data) {
  res.write('event: ' + event + '\n');
  res.write('data: ' + JSON.stringify(data) + '\n\n');
}

export function addKioskTerminalEventsClient(res) {
  clients.add(res);
  send(res, 'connected', { ok: true });
  return () => clients.delete(res);
}

export function broadcastKioskTerminalEvent(event, data = {}) {
  for (const res of clients) {
    send(res, event, { ...data, at: new Date().toISOString() });
  }
}
