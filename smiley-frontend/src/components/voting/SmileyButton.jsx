export default function SmileyButton({ rating, onSelect }) {
  const motion = rating.score >= 4 ? 'happy' : rating.score === 3 ? 'neutral' : 'sad';
  const tone = {
    5: '#22c55e',
    4: '#14b8a6',
    3: '#f59e0b',
    2: '#f97316',
    1: '#ef4444',
  }[rating.score] || '#14b8a6';
  const softTone = {
    5: '#eafaf0',
    4: '#e7fbf7',
    3: '#fff7e6',
    2: '#fff1e7',
    1: '#fff0f0',
  }[rating.score] || '#eef9f7';

  return (
    <button
      className={'smiley-button ' + motion}
      style={{ '--smiley-tone': tone, '--smiley-soft': softTone }}
      type="button"
      aria-label={rating.label}
      onClick={() => onSelect(rating)}
    >
      <span className="smiley-emoji">{rating.emoji}</span>
      {/* <span className="smiley-label">{rating.label}</span> */}
    </button>
  );
}
