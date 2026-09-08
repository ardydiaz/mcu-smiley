export function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function percent(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(1) + '%' : '0.0%';
}
