import { useNavigate } from 'react-router-dom';
import Loading from '../../components/common/Loading.jsx';
import SmileyGrid from '../../components/voting/SmileyGrid.jsx';
import { kioskService } from '../../services/kioskService.js';
import { useApi } from '../../hooks/useApi.js';
import { useVoting } from '../../hooks/useVoting.js';

const fallbackRatings = [
  { id: 1, label: 'Very Satisfied', emoji: String.fromCodePoint(0x1f604), score: 5 },
  { id: 2, label: 'Satisfied', emoji: String.fromCodePoint(0x1f642), score: 4 },
  { id: 3, label: 'Neutral', emoji: String.fromCodePoint(0x1f610), score: 3 },
  { id: 4, label: 'Dissatisfied', emoji: String.fromCodePoint(0x1f641), score: 2 },
];

export default function SmileyPage() {
  const navigate = useNavigate();
  const { updateVote } = useVoting();
  const { data, loading } = useApi(() => kioskService.listRatings(), []);
  const ratings = (data?.length ? data : fallbackRatings).filter(rating => Number(rating.score) !== 1);

  function handleSelect(rating) {
    updateVote({ rating, userType: null, feedback: '' });
    navigate('/kiosk/user-type');
  }

  return (
    <section className="kiosk-panel">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">MCU Service Feedback</span>
        <h1>How was your experience?</h1>
        <p>Your feedback helps us improve each visit.</p>
      </div>
      {loading && !data ? <Loading label="Loading ratings" /> : <SmileyGrid ratings={ratings} onSelect={handleSelect} />}
    </section>
  );
}
