export const TABLE_WRAP = 'overflow-x-auto rounded-2xl border border-[var(--mcu-purple)]/10 bg-white shadow-[0_14px_34px_rgba(23,32,42,0.05)]';
export const TABLE = 'w-full border-collapse text-sm';
export const TH = 'bg-[#fff7e5] px-4 py-3 text-left text-xs font-normal uppercase tracking-wide text-[var(--mcu-purple)]';
export const TR = 'border-b border-[var(--mcu-purple)]/10 transition-colors hover:bg-[#f8fbfa]';
export const TD = 'px-4 py-3 align-middle';
export const MUTED_TEXT = 'text-sm text-[#63707c]';

export const BADGE_BASE = 'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-normal capitalize';

export const STATUS_BADGE_CLASSES = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  inactive: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }) {
  return <span className={`${BADGE_BASE} ${STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.inactive}`}>{status}</span>;
}
