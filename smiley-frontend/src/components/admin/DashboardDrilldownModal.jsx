import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../common/Button.jsx';
import Loading from '../common/Loading.jsx';
import Modal from '../common/Modal.jsx';
import { voteService } from '../../services/voteService.js';
import FeedbackTable from './FeedbackTable.jsx';

const PAGE_SIZE = 10;

function cleanFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export default function DashboardDrilldownModal({ title, filters, onClose }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    voteService.list({ ...cleanFilters(filters), page, limit: PAGE_SIZE })
      .then(result => { if (alive) setData(result); })
      .catch(err => { if (alive) setError(err.message || 'Unable to load results'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filters, page]);

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Modal title={title} onClose={onClose} className="modal-wide">
      <div className="dashboard-drilldown-modal">
        <div className="feedback-results-header">
          <span>{total.toLocaleString()} response{total === 1 ? '' : 's'}</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {loading ? <Loading /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        {!loading && !error && data?.items?.length ? <FeedbackTable items={data.items} wrapClassName="max-h-[60vh] min-w-0 overflow-y-auto" /> : null}
        {!loading && !error && !data?.items?.length ? <div className="empty-state">No matching responses.</div> : null}

        <div className="pagination-bar">
          <Button type="button" variant="secondary" icon={ChevronLeft} onClick={() => setPage(current => Math.max(1, current - 1))} disabled={loading || page <= 1}>Previous</Button>
          <span>{page} / {totalPages}</span>
          <Button type="button" variant="secondary" icon={ChevronRight} onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={loading || page >= totalPages}>Next</Button>
        </div>
      </div>
    </Modal>
  );
}
