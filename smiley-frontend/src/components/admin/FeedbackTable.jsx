import { Eye } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import { formatDateTime } from '../../utils/helpers.js';
import { MUTED_TEXT, TABLE, TABLE_WRAP, TD, TH, TR } from './tableStyles.jsx';

const messageIcon = String.fromCodePoint(0x1f4ac);

function EmptyText({ children }) {
  return <span className={MUTED_TEXT}>{children || 'N/A'}</span>;
}

function DetailItem({ label, children }) {
  return (
    <div className="feedback-modal-detail">
      <span>{label}</span>
      <strong>{children || 'N/A'}</strong>
    </div>
  );
}

export default function FeedbackTable({ items = [], wrapClassName = '' }) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  return (
    <>
      <div className={`${TABLE_WRAP} ${wrapClassName}`.trim()}>
        <table className={`${TABLE} min-w-[980px]`}>
          <thead>
            <tr>
              <th className={TH}>Date</th>
              <th className={TH}>Rating</th>
              <th className={TH}>User Type</th>
              <th className={TH}>Department</th>
              <th className={TH}>Location</th>
              <th className={TH}>Tablet</th>
              <th className={TH}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className={TR}>
                <td className={`${TD} whitespace-nowrap font-normal text-[#53616d]`}>{formatDateTime(item.created_at)}</td>
                <td className={TD}>
                  <span className="rating-table-pill">
                    <span aria-hidden="true">{item.rating_emoji || messageIcon}</span>
                    <strong>{item.rating}</strong>
                    <small>{item.score}</small>
                  </span>
                </td>
                <td className={TD}><EmptyText>{item.user_type}</EmptyText></td>
                <td className={`${TD} max-w-[280px]`}><EmptyText>{item.department}</EmptyText></td>
                <td className={TD}><EmptyText>{item.location}</EmptyText></td>
                <td className={TD}>
                  <div className="grid gap-0.5">
                    <span className="font-normal text-[#21112c]">{item.terminal_code || 'N/A'}</span>
                    <span className="text-sm text-[#64748b]">{item.terminal || ''}</span>
                  </div>
                </td>
                <td className={TD}>
                  <Button type="button" variant="secondary" icon={Eye} onClick={() => setSelectedFeedback(item)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFeedback ? (
        <Modal title="Feedback Details" onClose={() => setSelectedFeedback(null)}>
          <div className="feedback-modal-content">
            <div className="feedback-modal-header">
              <span className="feedback-modal-emoji" aria-hidden="true">{selectedFeedback.rating_emoji || messageIcon}</span>
              <div>
                <h3>{selectedFeedback.rating}</h3>
                <p>Score {selectedFeedback.score} - {formatDateTime(selectedFeedback.created_at)}</p>
              </div>
            </div>

            <div className="feedback-modal-message-label">Feedback message</div>
            <div className="feedback-modal-message">
              {selectedFeedback.feedback || 'No feedback message'}
            </div>

            <div className="feedback-modal-grid">
              <DetailItem label="User Type">{selectedFeedback.user_type}</DetailItem>
              <DetailItem label="Department">{selectedFeedback.department}</DetailItem>
              <DetailItem label="Location">{selectedFeedback.location}</DetailItem>
              <DetailItem label="Tablet">
                {[selectedFeedback.terminal_code, selectedFeedback.terminal].filter(Boolean).join(' - ')}
              </DetailItem>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
