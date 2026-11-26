export const FORM = 'grid gap-4';
export const FIELD = 'grid gap-1.5';
export const LABEL = 'text-sm font-normal text-[#21112c]';
export const LABEL_ERROR = 'text-red-700';
export const REQUIRED_MARK = 'font-normal text-red-600';

export const INPUT =
  'w-full rounded-lg border border-[var(--mcu-purple)]/18 bg-white px-3.5 py-2.5 text-sm text-[var(--mcu-purple-midnight)] ' +
  'transition-colors focus:outline-none focus:border-[var(--mcu-purple)] focus:ring-4 focus:ring-[rgba(255,183,54,0.28)] ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
export const INPUT_ERROR = 'border-red-600 bg-red-50 focus:ring-red-600/15';

export const ERROR_TEXT = 'text-sm font-normal text-red-700';
export const HINT = 'text-sm text-[#63707c]';

export const ACTIONS = 'flex flex-wrap justify-center gap-3 pt-2';
export const ACTIONS_END = 'flex flex-wrap justify-end gap-3 pt-2';

export const CARD = 'grid gap-1 rounded-2xl border border-[#dce6ec] bg-gradient-to-br from-[rgba(255,247,229,0.9)] to-white px-4 py-3.5';
export const CARD_EYEBROW = 'text-xs font-normal uppercase tracking-wide text-[#64748b]';

export const CHIP_LIST = 'mt-1 flex flex-wrap gap-2';
export const CHIP =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--mcu-purple)]/22 bg-[var(--mcu-purple)]/8 ' +
  'px-3 py-1.5 text-sm text-[var(--mcu-purple-panther)] transition-colors hover:bg-[var(--mcu-purple)]/14';

export const CHECKBOX_GRID = 'grid grid-cols-2 gap-3';
export const CHECKBOX_FIELD =
  'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d7e2e8] bg-[#f8fafc] px-4 py-3.5 text-sm ' +
  'has-[:checked]:border-[var(--mcu-purple)]/34 has-[:checked]:bg-[var(--mcu-purple)]/8 has-[:checked]:text-[var(--mcu-purple-panther)]';

export function labelClass(hasError) {
  return hasError ? `${LABEL} ${LABEL_ERROR}` : LABEL;
}

export function inputClass(hasError) {
  return hasError ? `${INPUT} ${INPUT_ERROR}` : INPUT;
}
