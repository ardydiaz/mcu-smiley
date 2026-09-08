import Loading from '../../components/common/Loading.jsx';
import { ratingService } from '../../services/ratingService.js';
import { useApi } from '../../hooks/useApi.js';

export default function RatingsPage() {
  const { data, loading, error } = useApi(() => ratingService.list(), []);
  return (
    <>
      <div className="page-title">
        <h1>Ratings</h1>
        <p>Smiley choices</p>
      </div>
      <section className="data-panel">
        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        <div className="department-grid">
          {(data || []).map(rating => (
            <article className="department-card" key={rating.id}>
              <strong>{rating.emoji} {rating.label}</strong>
              <span>Score {rating.score}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
