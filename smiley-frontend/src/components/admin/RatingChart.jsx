export default function RatingChart({ ratings = [] }) {
  const max = Math.max(1, ...ratings.map(row => Number(row.votes) || 0));
  return (
    <section className="data-panel">
      <h2>Ratings</h2>
      <div className="bar-list">
        {ratings.map(row => (
          <div className="bar-row" key={row.id}>
            <div>
              <strong>{row.label}</strong>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: ((Number(row.votes) || 0) / max * 100) + '%' }} />
              </div>
            </div>
            <span>{row.votes}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
