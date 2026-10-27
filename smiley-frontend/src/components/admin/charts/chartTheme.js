// Brand-aligned categorical palette, snapped onto the validated reference order
// (purple/gold swapped into slots 1 and 4; passes the dataviz skill's six checks
// in both light and dark mode - see scripts/validate_palette.js).
export const CATEGORICAL_PALETTE = ['#7d3aa0', '#eb6834', '#1baf7a', '#d29528', '#e87ba4', '#008300', '#6250d6', '#e34948'];

// Single accent hue for plain magnitude bars (nominal categories, one series).
export const ACCENT = '#7d3aa0';
export const ACCENT_SOFT = 'rgba(125, 58, 160, 0.16)';

// Fixed, reserved status tone - only used where the series itself means "problem".
export const STATUS_SERIOUS = '#ec835a';

// Ordinal/diverging scale for ratings (sentiment has a real worst -> best order).
export const RATING_COLOR_BY_VALUE = {
  1: '#d03b3b',
  2: '#ec835a',
  3: '#fab219',
  4: '#0ca30c',
  5: '#086b08',
};

export const TEXT_PRIMARY = '#21112c';
export const TEXT_MUTED = '#64748b';
export const GRID_COLOR = '#e5def0';
export const FONT_FAMILY = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function baseChartOptions(overrides = {}) {
  return {
    chart: {
      fontFamily: FONT_FAMILY,
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: TEXT_MUTED,
      animations: { speed: 280 },
      ...overrides.chart,
    },
    grid: {
      borderColor: GRID_COLOR,
      strokeDashArray: 0,
      padding: { left: 8, right: 8 },
      ...overrides.grid,
    },
    tooltip: {
      theme: 'light',
      style: { fontFamily: FONT_FAMILY },
      ...overrides.tooltip,
    },
    states: {
      hover: { filter: { type: 'darken', value: 0.92 } },
      active: { filter: { type: 'darken', value: 0.85 } },
    },
    ...overrides,
  };
}
