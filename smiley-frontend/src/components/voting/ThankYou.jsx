const confettiColors = ['#14b8a6', '#60a5fa', '#f59e0b', '#ef4444', '#a855f7', '#84cc16', '#ec4899'];
const confettiShapes = ['circle', 'square', 'triangle'];

const confettiPieces = Array.from({ length: 96 }, (_, index) => {
  const column = index % 24;
  const row = Math.floor(index / 24);
  const spread = ((column / 23) * 1040) - 520;
  const wave = Math.sin(index * 1.7) * 70;

  return {
    id: index,
    x: Math.round(spread + wave),
    y: 80 + ((index * 31 + row * 38) % 250),
    rotate: (index * 41) % 360,
    delay: (index % 18) * 0.025,
    size: 0.46 + ((index % 5) * 0.09),
    color: confettiColors[index % confettiColors.length],
    shape: confettiShapes[index % confettiShapes.length],
  };
});

export default function ThankYou() {
  return (
    <section className="thank-you">
      <div className="confetti-burst" aria-hidden="true">
        {confettiPieces.map(piece => (
          <span
            key={piece.id}
            className={'confetti-piece ' + piece.shape}
            style={{
              '--x': piece.x + 'px',
              '--y': '-' + piece.y + 'px',
              '--r': piece.rotate + 'deg',
              '--delay': piece.delay + 's',
              '--size': piece.size + 'rem',
              '--confetti-color': piece.color,
            }}
          />
        ))}
      </div>
      <h1>Thank You!</h1>
      <p>Your feedback has been recorded.</p>
    </section>
  );
}