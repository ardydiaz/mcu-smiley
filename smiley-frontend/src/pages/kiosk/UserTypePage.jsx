import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import UserTypeGrid from '../../components/voting/UserTypeGrid.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useVoting } from '../../hooks/useVoting.js';
import { kioskService } from '../../services/kioskService.js';

const fallbackUserTypes = [
  { id: 1, name: 'Student' },
  { id: 2, name: 'Faculty / Employee' },
  { id: 3, name: 'Alumni' },
  { id: 4, name: 'Guest' },
];

export default function UserTypePage() {
  const navigate = useNavigate();
  const { vote, updateVote } = useVoting();
  const { data, loading, error } = useApi(() => kioskService.listUserTypes(), []);
  const userTypes = data?.length ? data : fallbackUserTypes;

  useEffect(() => {
    if (!vote.rating) navigate('/kiosk/smiley', { replace: true });
  }, [vote.rating, navigate]);

  function handleSelect(userType) {
    updateVote({ userType, feedbackOptions: [], feedback: '' });
    navigate('/kiosk/feedback');
  }

  function goBack() {
    updateVote({ userType: null, feedbackOptions: [], feedback: '' });
    navigate('/kiosk/smiley');
  }

  return (
    <section className="kiosk-panel user-type-page">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Step 2 of 3</span>
        <h1>Who are you?</h1>
        {vote.rating ? (
          <p className="rating-recap">
            <span>{vote.rating.emoji}</span>
            <strong>{vote.rating.label}</strong>
          </p>
        ) : null}
      </div>
      {loading && !data ? <Loading label="Loading user types" /> : null}
      {error && !data?.length ? <div className="empty-state">{error}</div> : null}
      {!loading || data?.length ? <UserTypeGrid userTypes={userTypes} onSelect={handleSelect} /> : null}
      <div className="button-row kiosk-bottom-actions">
        <Button type="button" variant="secondary" icon={ArrowLeft} className="kiosk-back-button" onClick={goBack}>Back</Button>
      </div>
    </section>
  );
}
