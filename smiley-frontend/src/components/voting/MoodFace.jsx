const INK = '#4a3038';

export function MoodFaceDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="smiley-skin" cx="0.68" cy="0.22" r="0.95">
          <stop offset="0" stopColor="#ffe680" />
          <stop offset="0.45" stopColor="#ffbe3d" />
          <stop offset="1" stopColor="#f08a2c" />
        </radialGradient>
        <linearGradient id="smiley-blush" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.78" stopColor="#ff7ab6" stopOpacity="0" />
          <stop offset="1" stopColor="#ff6fb0" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="smiley-mouth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2128c" />
          <stop offset="1" stopColor="#e83aa8" />
        </linearGradient>
        <symbol id="smiley-body" viewBox="0 0 120 120">
          <rect x="8" y="8" width="104" height="104" rx="48" fill="url(#smiley-skin)" />
          <rect x="8" y="8" width="104" height="104" rx="48" fill="url(#smiley-blush)" />
        </symbol>
      </defs>
    </svg>
  );
}

function GreatFace() {
  return (
    <g className="mood-head">
      <use href="#smiley-body" width="120" height="120" />
      <g className="mood-lids" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round">
        <path d="M31 46 q9 -11 18 0" />
        <path d="M71 46 q9 -11 18 0" />
      </g>
      <g className="mood-mouth">
        <path d="M28 62 h64 q0 34 -32 34 q-32 0 -32 -34z" fill="url(#smiley-mouth-fill)" />
        <path d="M30 62 h60 v4 q0 3 -3 3 h-54 q-3 0 -3 -3z" fill="#fff" />
      </g>
    </g>
  );
}

function GoodFace() {
  return (
    <g className="mood-head">
      <use href="#smiley-body" width="120" height="120" />
      <g className="mood-eyes">
        <circle cx="41" cy="46" r="13" fill="#fff" />
        <circle cx="79" cy="46" r="13" fill="#fff" />
        <g className="mood-pupils" fill={INK}>
          <circle cx="43" cy="47" r="6" />
          <circle cx="81" cy="47" r="6" />
        </g>
      </g>
      <path className="mood-mouth" d="M44 76 q16 14 32 0" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
    </g>
  );
}

function MehFace() {
  return (
    <g className="mood-head">
      <use href="#smiley-body" width="120" height="120" />
      <g className="mood-eyes">
        <circle cx="41" cy="44" r="13" fill="#fff" />
        <circle cx="79" cy="44" r="13" fill="#fff" />
        <g className="mood-pupils" fill={INK}>
          <circle cx="41" cy="45" r="6" />
          <circle cx="79" cy="45" r="6" />
        </g>
      </g>
      <path className="mood-mouth" d="M46 82 h28" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
    </g>
  );
}

function BadFace() {
  return (
    <g className="mood-head">
      <use href="#smiley-body" width="120" height="120" />
      <g className="mood-eyes">
        <circle cx="41" cy="48" r="13" fill="#fff" />
        <circle cx="79" cy="48" r="13" fill="#fff" />
        <g className="mood-pupils" fill={INK}>
          <circle cx="39" cy="49" r="6" />
          <circle cx="77" cy="49" r="6" />
        </g>
      </g>
      <path className="mood-mouth" d="M45 88 q15 -13 30 0" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
    </g>
  );
}

const FACES = { great: GreatFace, good: GoodFace, meh: MehFace, bad: BadFace };

export function getMoodKey(score) {
  const value = Number(score);
  if (value >= 5) return 'great';
  if (value === 4) return 'good';
  if (value === 3) return 'meh';
  return 'bad';
}

export default function MoodFace({ score }) {
  const moodKey = getMoodKey(score);
  const Face = FACES[moodKey];
  return (
    <svg className={'mood-face mood-face-' + moodKey} viewBox="0 0 120 120" preserveAspectRatio="none" aria-hidden="true">
      <Face />
    </svg>
  );
}
