export const logger = {
  info(message) { console.log(JSON.stringify({ level: 'info', time: new Date().toISOString(), message })); },
  error(message) { console.error(JSON.stringify({ level: 'error', time: new Date().toISOString(), message })); },
};
